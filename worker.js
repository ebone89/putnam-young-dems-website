/**
 * worker.js — Cloudflare Worker for putnamyoungdemsfl.org
 *
 * Adds a GitHub OAuth handler at /api/auth so Decap CMS can authenticate
 * without a third-party proxy service. Everything else is forwarded to the
 * static site assets.
 *
 * Required environment variables (set as secrets in Cloudflare dashboard):
 *   GITHUB_CLIENT_ID     — from your GitHub OAuth App
 *   GITHUB_CLIENT_SECRET — from your GitHub OAuth App
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Route OAuth traffic to the auth handler
    if (url.pathname.startsWith('/api/auth')) {
      return handleGitHubOAuth(request, env, url);
    }

    // Everything else: serve static site files
    return env.ASSETS.fetch(request);
  },
};

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
  window.opener.postMessage(msg, document.referrer || '*');
  window.close();
<\/script></body></html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  return new Response('Not found', { status: 404 });
}
