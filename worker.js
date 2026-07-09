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

async function handleGitHubOAuth(request, env, url) {
  // Strip the /api/auth prefix to get the sub-path
  const path = url.pathname.replace('/api/auth', '') || '/';

  // ── Step 1: Send the user to GitHub to authorize ──────────────────────────
  if (path === '/') {
    const params = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      scope: 'repo',           // needs repo scope to read/write files
      state: crypto.randomUUID(),
    });

    return Response.redirect(
      `https://github.com/login/oauth/authorize?${params}`,
      302
    );
  }

  // ── Step 2: Exchange the one-time code for an access token ────────────────
  if (path === '/callback') {
    const code = url.searchParams.get('code');

    if (!code) {
      return new Response('Missing OAuth code parameter', { status: 400 });
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
        { status: 400 }
      );
    }

    // ── Step 3: Post the token back to the Decap CMS window and close ───────
    // Decap listens for a message in this exact format:
    //   authorization:github:success:{"token":"...","provider":"github"}
    const payload = JSON.stringify({ token, provider: 'github' });
    const html = `<!DOCTYPE html><html><body><script>
  var msg = 'authorization:github:success:' + ${JSON.stringify(payload)};
  window.opener.postMessage(msg, '*');
  window.close();
<\/script></body></html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  return new Response('Not found', { status: 404 });
}
