# Quadro Agent — Cloudflare Worker

Proxy estable entre el widget embebido en `quadro-nt.com` y la instancia n8n (que rota cada 3 meses).

## Setup inicial (una vez)

1. Crear cuenta gratis en https://cloudflare.com
2. Dashboard → **Workers & Pages** → **Create** → **Create Worker**
3. Nombre: `quadro-agent`
4. Click **Deploy** (con el código Hello World), luego **Edit code**
5. Pegar el contenido de `quadro-proxy.js`
6. **Save and deploy**
7. Anotar la URL final: `https://quadro-agent.<tu-subdominio>.workers.dev`

## Endpoints expuestos

- `POST /chat`  → proxy a `n8n/webhook/quadro-agent`
- `POST /leads` → proxy a `n8n/webhook/quadro-leads`

Ambos reenvían el header `Origin` original y la IP real del cliente vía `X-Forwarded-For` y `X-Real-IP`, así el rate limit y origin check del n8n siguen funcionando igual.

## Cuando IJV rote VM de n8n (cada 3 meses)

1. Abrir el Worker en Cloudflare dashboard
2. Cambiar la constante `N8N_BASE` al nuevo hostname de sslip.io
3. **Save and deploy**

Tiempo total: 2 minutos. El snippet embebido en `quadro-nt.com` **no se toca**.

## Uso desde el widget

```js
const QDR_CHAT  = 'https://quadro-agent.<tu-subdominio>.workers.dev/chat';
const QDR_LEADS = 'https://quadro-agent.<tu-subdominio>.workers.dev/leads';
```
