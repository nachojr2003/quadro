# Quadro Agent — Widget embebible

Widget de chat impulsado por IA para el sitio oficial de Quadro. Autocontenido, sin dependencias externas.

## Instalación rápida

**Un solo `<script>`** al final del `<body>` del sitio (antes del `</body>`):

```html
<script
  src="https://quadro-beryl.vercel.app/widget/quadro-agent.js"
  async
  defer
></script>
```

Eso es todo. El widget inyecta su propio HTML + CSS al cargar la página, muestra el botón flotante abajo a la derecha, y se abre como ventana de chat al hacer clic.

## Configuración opcional

Si quieren overridear algún parámetro, colocar un bloque `<script>` **ANTES** del script de carga:

```html
<!-- OPCIONAL: config override -->
<script>
  window.QuadroAgentConfig = {
    whatsappNumber: '51938498725',            // sin + ni espacios
    welcomeMessage: 'Tu mensaje de bienvenida personalizado',
    privacyUrl:     'https://quadro-nt.com/privacy-policy'
  };
</script>

<!-- OBLIGATORIO: carga del widget -->
<script src="https://quadro-beryl.vercel.app/widget/quadro-agent.js" async defer></script>
```

Valores por defecto (se usan si no se overridean):

| Campo | Default |
|---|---|
| `webhookBase` | `https://quadro-agent.javier-vergara.workers.dev` |
| `whatsappNumber` | `51938498725` |
| `welcomeMessage` | `¡Hola! 👋 Soy el asistente de **Quadro**...` |
| `logoUrl` | `https://quadro-nt.com/favicon.png` |
| `privacyUrl` | `https://quadro-nt.com/privacy-policy` |

## Qué hace el widget

- Responde consultas sobre el catálogo (161 obras + 23 artistas) en tiempo real
- Flujo de venta guiado: inspiración → técnica/dimensiones → reserva 30% → compra directa
- Consulta de estado de pedidos por número de orden o código de tracking
- Link directo al carrito cuando el usuario muestra intención de compra
- Formulario de contacto integrado con validación anti-bot
- 5 accesos rápidos en el welcome: estado de pedido, costos de envío, tiempos, cuadros personalizados, devoluciones
- Botón de WhatsApp como escalación
- Sesión persistente vía `sessionStorage` (sobrevive al refresh, no al cerrar pestaña)
- Accesibilidad: `aria-label`, keyboard support, foco correcto
- Responsive: se adapta a mobile

## Requisitos técnicos

- No requiere jQuery, React, Vue ni ninguna librería externa
- JS vanilla (ES2020), funciona en todos los navegadores modernos (Chrome, Safari, Firefox, Edge)
- ~30KB gzipped
- Carga asíncrona, no bloquea el render de la página
- No interfiere con el CSS del sitio (todos los selectores están prefijados con `qdr-`)

## Seguridad

- Todas las llamadas van cifradas via HTTPS al Worker de Cloudflare (`quadro-agent.javier-vergara.workers.dev`)
- El Worker reenvía a n8n con validación de origen, rate limiting (20 req/min/IP para chat, 3/hora para leads) y honeypot anti-bot
- Nunca se almacena información sensible en `localStorage`; solo `sessionStorage` (clave `qdr_*`)
- El formulario de contacto incluye campo honeypot oculto

## Actualización

El widget se actualiza **automáticamente** cuando IJV Agency publica una nueva versión. Ustedes no necesitan hacer nada — la próxima carga de página del visitante toma la nueva versión.

Si prefieren versionado explícito para control de cambios, pueden pinnear a un commit hash específico (contactar a IJV para esto).

## Rotación de infraestructura

La URL del widget (`https://quadro-beryl.vercel.app/widget/quadro-agent.js`) es **estable**. La infraestructura backend (VM de n8n) rota cada 3 meses, pero eso se maneja desde el Cloudflare Worker — ustedes **NO** necesitan actualizar el código del sitio cuando eso pase.

## Testing en staging

Para probar en un entorno no-producción antes de publicar en quadro-nt.com:

1. Embeber el script en cualquier página de testing (`<script src="..." async defer></script>`)
2. Abrir la página, clicar el botón del chat
3. Probar queries tipo: "qué obras tienen de Vanessa Karin?", "mi pedido es 25", "quiero comprar Topology II"

## Contacto

Cualquier duda o feedback sobre el widget:
- IJV Agency · https://ijvagency.com
- Nacho (+51 938 498 725)
