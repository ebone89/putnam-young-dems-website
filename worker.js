/**
 * worker.js — Cloudflare Worker for putnamyoungdemsfl.org
 *
 * Adds a GitHub OAuth handler at /api/auth so Decap CMS can authenticate
 * without a third-party proxy service, plus a first-party sign-up endpoint
 * backed by D1 for volunteer interest and event RSVPs. Everything else is
 * forwarded to the static site assets.
 *
 * Required environment variables (set as secrets in Cloudflare dashboard):
 *   GITHUB_CLIENT_ID     — from your GitHub OAuth App
 *   GITHUB_CLIENT_SECRET — from your GitHub OAuth App
 *   ADMIN_TOKEN           — shared secret for viewing sign-ups at /admin/signups.html
 *
 * Required bindings (see wrangler.jsonc):
 *   DB — D1 database, schema in schema.sql
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/auth')) {
      return handleGitHubOAuth(request, env, url);
    }

    if (url.pathname === '/api/signup' && request.method === 'POST') {
      return handleSignup(request, env);
    }

    if (url.pathname === '/api/signups' && request.method === 'GET') {
      return handleListSignups(request, env, url);
    }

    // Everything else: serve static site files
    return env.ASSETS.fetch(request);
  },
};

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function handleSignup(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return jsonResponse({ ok: false, error: 'Invalid request body' }, 400);
  }

  // Honeypot field — bots tend to fill every input. Pretend it worked so
  // they don't learn to leave it blank.
  if (body._hp) {
    return jsonResponse({ ok: true });
  }

  const type = body.type === 'rsvp' ? 'rsvp' : body.type === 'volunteer' ? 'volunteer' : null;
  const name = (body.name || '').trim();
  const email = (body.email || '').trim();

  if (!type || !name || !EMAIL_PATTERN.test(email)) {
    return jsonResponse({ ok: false, error: 'Name, a valid email, and a sign-up type are required' }, 400);
  }

  await env.DB.prepare(
    'INSERT INTO signups (type, name, email, phone, event_title, interest_areas, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    type,
    name,
    email,
    (body.phone || '').trim() || null,
    (body.eventTitle || '').trim() || null,
    (body.interestAreas || '').trim() || null,
    (body.notes || '').trim() || null
  ).run();

  return jsonResponse({ ok: true });
}

async function handleListSignups(request, env, url) {
  const token = request.headers.get('X-Admin-Token');
  if (!token || token !== env.ADMIN_TOKEN) {
    return jsonResponse({ ok: false, error: 'Unauthorized' }, 401);
  }

  const type = url.searchParams.get('type');
  const query = type
    ? env.DB.prepare('SELECT * FROM signups WHERE type = ? ORDER BY created_at DESC').bind(type)
    : env.DB.prepare('SELECT * FROM signups ORDER BY created_at DESC');

  const { results } = await query.all();
  return jsonResponse({ ok: true, signups: results });
}

const OAUTH_STATE_COOKIE = 'pcyd_oauth_state';

function parseCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  const match = header.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

// `Secure` cookies are silently dropped over plain HTTP, which is how
// `wrangler dev` serves localhost — omit it there so local OAuth testing
// still works, but keep it for the real https:// deployment.
function buildStateCookie(url, value, maxAge) {
  const attrs = [`${OAUTH_STATE_COOKIE}=${value}`, 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAge}`, 'Path=/api/auth'];
  if (url.protocol === 'https:') { attrs.push('Secure'); }
  return attrs.join('; ');
}

async function handleGitHubOAuth(request, env, url) {
  // Strip the /api/auth prefix to get the sub-path
  const path = url.pathname.replace('/api/auth', '') || '/';

  // ── Step 1: Send the user to GitHub to authorize ──────────────────────────
  if (path === '/') {
    const state = crypto.randomUUID();
    const params = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      scope: 'repo',           // needs repo scope to read/write files
      state,
    });

    // Stash the state in a short-lived cookie so /callback can confirm the
    // response actually corresponds to a request we started (CSRF guard).
    return new Response(null, {
      status: 302,
      headers: {
        Location: `https://github.com/login/oauth/authorize?${params}`,
        'Set-Cookie': buildStateCookie(url, state, 600),
      },
    });
  }

  // ── Step 2: Exchange the one-time code for an access token ────────────────
  if (path === '/callback') {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const expectedState = parseCookie(request, OAUTH_STATE_COOKIE);
    const clearStateCookie = buildStateCookie(url, '', 0);

    if (!code) {
      return new Response('Missing OAuth code parameter', { status: 400 });
    }

    if (!state || !expectedState || state !== expectedState) {
      return new Response('OAuth state mismatch — please restart sign-in.', {
        status: 400,
        headers: { 'Set-Cookie': clearStateCookie },
      });
    }

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    if (!token) {
      return new Response(
        'GitHub OAuth failed: ' + JSON.stringify(tokenData),
        { status: 400, headers: { 'Set-Cookie': clearStateCookie } }
      );
    }

    // ── Step 3: Hand the token back to the Decap CMS window and close ───────
    // Decap's side of this isn't a single fire-and-forget message. The popup
    // pings the opener with "authorizing:github" first; Decap's listener
    // echoes it back so the popup knows the opener's real origin, and only
    // then does the popup send the actual success payload using that origin.
    // Skipping the handshake (sending the success message straight away)
    // means Decap's listener never picks it up, even though the postMessage
    // call itself "succeeds" with no error.
    const payload = JSON.stringify({ token, provider: 'github' });
    const html = `<!DOCTYPE html><html><body style="font-family: sans-serif; padding: 2rem; text-align: center;">
  <p id="status">Finishing sign-in…</p>
  <script>
    var statusEl = document.getElementById('status');

    function receiveMessage(e) {
      window.opener.postMessage(
        'authorization:github:success:' + ${JSON.stringify(payload)},
        e.origin
      );
      window.removeEventListener('message', receiveMessage, false);
      statusEl.textContent = 'Signed in. Closing this window...';
      setTimeout(function () { window.close(); }, 1500);
    }

    try {
      if (!window.opener) {
        throw new Error('window.opener is not available in this window.');
      }
      window.addEventListener('message', receiveMessage, false);
      window.opener.postMessage('authorizing:github', '*');
    } catch (err) {
      statusEl.textContent = 'Sign-in failed: ' + err.message;
    }
  <\/script>
</body></html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html', 'Set-Cookie': clearStateCookie },
    });
  }

  return new Response('Not found', { status: 404 });
}
