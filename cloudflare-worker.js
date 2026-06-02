/* ════════════════════════════════════════════════════════════
   Canvas2 — Cloudflare Worker (Canvas API CORS Proxy)
   ════════════════════════════════════════════════════════════

   WHY THIS EXISTS
   ---------------
   Canvas's REST API does not send CORS headers, so a browser on
   github.io cannot call mcps.instructure.com directly. This Worker
   sits in the middle: the browser calls the Worker, the Worker calls
   Canvas (server-to-server, no CORS restriction), then returns the
   response WITH the CORS headers the browser needs.

   Your Canvas access token is forwarded straight to Canvas and is
   never logged or stored by this Worker.

   ────────────────────────────────────────────────────────────
   HOW TO DEPLOY (free, ~5 minutes, no credit card)
   ────────────────────────────────────────────────────────────
   1. Go to https://dash.cloudflare.com  → sign up / log in
   2. In the left sidebar: "Workers & Pages" → "Create application"
      → "Create Worker"
   3. Give it a name, e.g.  canvas2-proxy   → "Deploy"
   4. Click "Edit code", DELETE the sample code, and PASTE this
      entire file in its place → "Deploy"
   5. Copy your Worker URL — it looks like:
         https://canvas2-proxy.YOUR-SUBDOMAIN.workers.dev
   6. Paste that URL into the "Proxy URL" field on the Canvas2
      login screen. Done — you only do this once.
   ════════════════════════════════════════════════════════════ */

// Only these Canvas hosts may be proxied (prevents open-proxy abuse).
// Add your district's host here if it isn't an *.instructure.com domain.
const ALLOWED_HOST_SUFFIXES = [
  '.instructure.com',
  '.canvaslms.com',
];

// Restrict which sites may USE this proxy. '*' allows any origin.
// To lock it to your site only, replace with:
//   const ALLOWED_ORIGINS = ['https://chezburgar.github.io'];
const ALLOWED_ORIGINS = ['*'];

function corsHeaders(origin) {
  const allowOrigin =
    ALLOWED_ORIGINS.includes('*') ? '*'
    : ALLOWED_ORIGINS.includes(origin) ? origin
    : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    // Canvas paginates using the Link header — the browser must be
    // allowed to read it so the frontend can follow "next" pages.
    'Access-Control-Expose-Headers': 'Link',
    'Access-Control-Max-Age': '86400',
  };
}

function hostAllowed(hostname) {
  return ALLOWED_HOST_SUFFIXES.some(suffix => hostname.endsWith(suffix));
}

export default {
  async fetch(request) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const reqUrl = new URL(request.url);
    const target = reqUrl.searchParams.get('target');

    if (!target) {
      return json({ error: 'Missing ?target= Canvas API URL' }, 400, cors);
    }

    let targetUrl;
    try {
      targetUrl = new URL(target);
    } catch {
      return json({ error: 'Invalid target URL' }, 400, cors);
    }

    if (targetUrl.protocol !== 'https:' || !hostAllowed(targetUrl.hostname)) {
      return json({ error: `Host not allowed: ${targetUrl.hostname}` }, 403, cors);
    }

    // Forward to Canvas, passing through the student's token.
    const canvasResp = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Accept': 'application/json',
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
      },
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text(),
    });

    // Relay Canvas's response + pagination Link header, plus CORS.
    const respHeaders = new Headers(cors);
    respHeaders.set('Content-Type', canvasResp.headers.get('Content-Type') || 'application/json');
    const link = canvasResp.headers.get('Link');
    if (link) respHeaders.set('Link', link);

    const body = await canvasResp.text();
    return new Response(body, { status: canvasResp.status, headers: respHeaders });
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
