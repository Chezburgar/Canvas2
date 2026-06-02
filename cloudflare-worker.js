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
  // Canvas file-upload storage targets (needed for submitting file uploads)
  '.inscloudgate.net',       // inst-fs (modern Canvas file storage)
  '.instructuremedia.com',
  '.amazonaws.com',          // legacy S3-backed upload buckets
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
    // Location is exposed for the file-upload confirmation step.
    'Access-Control-Expose-Headers': 'Link, Location',
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

    // Build forwarded headers. We pass the token straight through and
    // preserve the incoming Content-Type so multipart file uploads keep
    // their boundary intact.
    const fwdHeaders = {
      'Accept': request.headers.get('Accept') || 'application/json',
    };
    const auth = request.headers.get('Authorization');
    if (auth) fwdHeaders['Authorization'] = auth;
    const ct = request.headers.get('Content-Type');
    if (ct) fwdHeaders['Content-Type'] = ct;

    // Forward the raw bytes for any method that carries a body. Using
    // arrayBuffer (not text) keeps binary file uploads byte-for-byte.
    const hasBody = !['GET', 'HEAD'].includes(request.method);
    const body = hasBody ? await request.arrayBuffer() : undefined;

    const canvasResp = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: fwdHeaders,
      body,
      redirect: 'manual',   // let the frontend resolve upload confirmation redirects
    });

    // Relay Canvas's response + pagination Link header + upload Location, plus CORS.
    const respHeaders = new Headers(cors);
    respHeaders.set('Content-Type', canvasResp.headers.get('Content-Type') || 'application/json');
    const link = canvasResp.headers.get('Link');
    if (link) respHeaders.set('Link', link);
    const loc = canvasResp.headers.get('Location');
    if (loc) respHeaders.set('Location', loc);

    const respBody = await canvasResp.arrayBuffer();
    return new Response(respBody, { status: canvasResp.status, headers: respHeaders });
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
