/**
 * Quadro Agent — Cloudflare Worker proxy
 *
 * Propósito: exponer una URL estable al cliente (quadro-nt.com) que reenvía
 * las llamadas al n8n actual. Cuando IJV rote VM cada 3 meses y cambie la URL
 * de sslip.io, solo hay que actualizar N8N_BASE acá abajo y redeployar el
 * Worker — el código embebido en la web del cliente nunca se toca.
 *
 * Rutas expuestas:
 *   POST /chat   -> N8N_BASE/webhook/quadro-agent
 *   POST /leads  -> N8N_BASE/webhook/quadro-leads
 *
 * Auth/seguridad se siguen haciendo en n8n (origin check + rate limit +
 * honeypot). Este Worker solo proxea y maneja CORS.
 */

const N8N_BASE = 'https://n8n-jcg4epwgyztosnmbxghhwvdv.34.133.34.116.sslip.io';

const ALLOWED_ORIGINS = [
  'https://quadro-nt.com',
  'https://www.quadro-nt.com',
  'http://localhost',
  'http://127.0.0.1',
];
const ALLOW_VERCEL_PREVIEWS = true;

const ROUTES = {
  '/chat':  '/webhook/quadro-agent',
  '/leads': '/webhook/quadro-leads',
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const corsOrigin = pickCorsOrigin(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(corsOrigin) });
    }

    const target = ROUTES[url.pathname];
    if (!target) {
      return jsonResponse({ error: 'Not found' }, 404, corsOrigin);
    }
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, corsOrigin);
    }

    const body = await request.text();
    const clientIp = request.headers.get('CF-Connecting-IP') || '';

    let upstream;
    try {
      upstream = await fetch(N8N_BASE + target, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': origin,
          'X-Forwarded-For': clientIp,
          'X-Real-IP': clientIp,
        },
        body,
      });
    } catch (err) {
      return jsonResponse({ error: 'Upstream unreachable' }, 502, corsOrigin);
    }

    const upstreamBody = await upstream.text();
    return new Response(upstreamBody, {
      status: upstream.status,
      headers: {
        ...corsHeaders(corsOrigin),
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
      },
    });
  },
};

function pickCorsOrigin(origin) {
  if (!origin) return ALLOWED_ORIGINS[0];
  const lower = origin.toLowerCase();
  if (ALLOWED_ORIGINS.includes(lower)) return origin;
  if (ALLOW_VERCEL_PREVIEWS && /\.vercel\.app$/.test(new URL(origin).hostname)) return origin;
  return ALLOWED_ORIGINS[0];
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function jsonResponse(obj, status, origin) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  });
}
