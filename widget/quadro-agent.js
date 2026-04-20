/*!
 * Quadro Agent — Widget embebible
 * Version: 1.0.0 · 2026-04-18
 * Author: IJV Agency (https://ijvagency.com)
 *
 * Uso: pegar una sola línea al final del <body> del sitio:
 *   <script src="https://<CDN>/widget/quadro-agent.js" async></script>
 *
 * Config opcional (colocar ANTES del <script> anterior):
 *   <script>
 *     window.QuadroAgentConfig = {
 *       whatsappNumber: '51938498725',
 *       welcomeMessage: '¡Hola! ...'
 *     };
 *   </script>
 *
 * El widget inyecta su propio HTML + CSS y no tiene dependencias externas.
 * Todas las clases e IDs están prefijadas con 'qdr-' para no colisionar.
 */
(function () {
  'use strict';

  if (window.__quadroAgentLoaded) return;
  window.__quadroAgentLoaded = true;

  // ── DEFAULTS (override via window.QuadroAgentConfig) ─────────────
  var DEFAULTS = {
    webhookBase:    'https://quadro-agent.javier-vergara.workers.dev',
    chatPath:       '/chat',
    leadsPath:      '/leads',
    whatsappNumber: '51938498725',
    welcomeMessage: '¡Hola! 👋 Soy **Miguel Ángel**, el asistente de **Quadro**.\n\nEstoy aquí para ayudarte a descubrir obras de arte, conocer a nuestros artistas y resolver cualquier consulta sobre compras y envíos. ¿Qué te trae por acá hoy?',
    logoUrl:        'https://quadro-nt.com/favicon.png',
    privacyUrl:     'https://quadro-nt.com/privacy-policy'
  };
  var CFG = window.QuadroAgentConfig = window.QuadroAgentConfig || {};
  for (var k in DEFAULTS) { if (CFG[k] === undefined || CFG[k] === null) CFG[k] = DEFAULTS[k]; }

  var QDR_WEBHOOK = CFG.webhookBase + CFG.chatPath;
  var QDR_LEADS   = CFG.webhookBase + CFG.leadsPath;
  var STORAGE_KEY = 'qdr_msgs_v2';
  var QDR_WA      = CFG.whatsappNumber;
  var LOGO        = CFG.logoUrl;

  // ── Inyección de CSS ─────────────────────────────────────────────
  var STYLE = [
    '#qdr-btn{position:fixed;bottom:24px;right:24px;width:60px;height:60px;border-radius:50%;background:#fff;border:2px solid #8B5CF6;cursor:pointer;z-index:9999;box-shadow:0 4px 16px rgba(139,92,246,.35);display:flex;align-items:center;justify-content:center;overflow:hidden;transition:transform .2s,box-shadow .2s;padding:0;}',
    '#qdr-btn:hover{transform:scale(1.07);box-shadow:0 6px 24px rgba(139,92,246,.5);}',
    '#qdr-btn img{width:54px;height:54px;object-fit:contain;border-radius:50%;}',
    '#qdr-window{display:none;position:fixed;bottom:96px;right:24px;width:380px;max-height:620px;background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(139,92,246,.18);z-index:9998;flex-direction:column;overflow:hidden;font-family:\'Poppins\',\'Inter\',sans-serif;}',
    '#qdr-window.open{display:flex;}',
    '#qdr-header{background:#8B5CF6;color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;}',
    '#qdr-header .qdr-avatar{width:36px;height:36px;border-radius:50%;overflow:hidden;flex-shrink:0;background:#fff;}',
    '#qdr-header .qdr-avatar img{width:36px;height:36px;object-fit:contain;border-radius:50%;}',
    '#qdr-header .qdr-info{flex:1;}',
    '#qdr-header .qdr-name{font-size:14px;font-weight:600;}',
    '#qdr-header .qdr-status{font-size:11px;opacity:.75;}',
    '#qdr-close,#qdr-reset{background:none;border:none;color:#fff;font-size:18px;cursor:pointer;opacity:.8;padding:4px 6px;}',
    '#qdr-close{font-size:20px;}',
    '#qdr-close:hover,#qdr-reset:hover{opacity:1;}',
    '#qdr-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;background:#f9f7fe;}',
    '.qdr-msg{max-width:84%;padding:10px 14px;border-radius:14px;font-size:13.5px;line-height:1.55;word-break:break-word;}',
    '.qdr-msg.bot{background:#fff;border:1px solid #e8e0fa;border-bottom-left-radius:4px;align-self:flex-start;display:flex;gap:8px;align-items:flex-start;max-width:92%;}',
    '.qdr-msg.bot .qdr-bot-av{width:24px;height:24px;border-radius:50%;overflow:hidden;flex-shrink:0;background:#fff;}',
    '.qdr-msg.bot .qdr-bot-av img{width:24px;height:24px;object-fit:contain;}',
    '.qdr-msg.bot .qdr-bot-text{flex:1;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",Roboto,"Helvetica Neue",Arial,sans-serif;}',
    '.qdr-msg.bot .qdr-bot-text img{max-width:1.2em!important;max-height:1.2em!important;width:auto!important;height:auto!important;display:inline-block!important;vertical-align:text-bottom!important;margin:0 1px!important;}',
    '.qdr-msg.bot .qdr-bot-text strong{font-weight:600;}',
    '.qdr-msg.bot .qdr-bot-text em{font-style:italic;}',
    '.qdr-msg.bot .qdr-bot-text ul{margin:6px 0 2px 16px;padding:0;}',
    '.qdr-msg.bot .qdr-bot-text li{margin-bottom:3px;}',
    '.qdr-msg.bot .qdr-bot-text table{border-collapse:collapse;font-size:12px;width:100%;margin:8px 0;}',
    '.qdr-msg.bot .qdr-bot-text th{background:#8B5CF6;color:#fff;padding:4px 8px;text-align:left;}',
    '.qdr-msg.bot .qdr-bot-text td{border:1px solid #e0d6f7;padding:4px 8px;}',
    '.qdr-msg.bot .qdr-bot-text tr:nth-child(even) td{background:#f3effd;}',
    '.qdr-msg.user{background:#8B5CF6;color:#fff;border-bottom-right-radius:4px;align-self:flex-end;}',
    '.qdr-typing{display:flex;gap:5px;align-items:center;padding:10px 14px;background:#fff;border:1px solid #e8e0fa;border-radius:14px;border-bottom-left-radius:4px;align-self:flex-start;}',
    '.qdr-typing span{width:7px;height:7px;background:#8B5CF6;border-radius:50%;animation:qdrb .9s infinite;opacity:.5;}',
    '.qdr-typing span:nth-child(2){animation-delay:.15s;}',
    '.qdr-typing span:nth-child(3){animation-delay:.3s;}',
    '@keyframes qdrb{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}',
    '.qdr-inline-btn{display:inline-flex;align-items:center;gap:6px;margin-top:10px;background:#8B5CF6;color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:12.5px;font-weight:600;cursor:pointer;transition:background .2s;font-family:inherit;}',
    '.qdr-inline-btn:hover{background:#7C3AED;}',
    '.qdr-inline-btn svg{width:14px;height:14px;fill:currentColor;}',
    '.qdr-inline-btn.wa{background:#25D366;}',
    '.qdr-inline-btn.wa:hover{background:#1EBE5A;}',
    '.qdr-chips{display:flex;flex-direction:column;gap:8px;margin-top:-4px;align-self:stretch;}',
    '.qdr-chip{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #e0d6f7;border-radius:10px;padding:10px 14px;font-size:13px;color:#2a1f3d;cursor:pointer;transition:all .15s ease;font-family:inherit;text-align:left;}',
    '.qdr-chip:hover{background:#f3effd;border-color:#8B5CF6;}',
    '.qdr-chip-icon{font-size:16px;line-height:1;flex-shrink:0;}',
    '.qdr-chip-label{flex:1;}',
    '#qdr-input-area{display:flex;gap:8px;padding:12px 16px;border-top:1px solid #f0e8ff;align-items:center;background:#fff;flex-shrink:0;}',
    '#qdr-input{flex:1;border:1px solid #e0d6f7;border-radius:20px;padding:8px 14px;font-size:13.5px;outline:none;resize:none;font-family:inherit;max-height:90px;overflow-y:auto;line-height:1.5;}',
    '#qdr-input:focus{border-color:#8B5CF6;}',
    '#qdr-send{width:36px;height:36px;border-radius:50%;background:#8B5CF6;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .2s;padding:0;}',
    '#qdr-send:hover{background:#7C3AED;}',
    '#qdr-send svg{width:16px;height:16px;fill:#fff;}',
    '.qdr-privacy{text-align:center;padding:4px 12px 2px;font-size:9px;color:#bbb;background:#fff;flex-shrink:0;line-height:1.3;}',
    '.qdr-privacy a{color:#8B5CF6;text-decoration:none;}',
    '.qdr-privacy a:hover{text-decoration:underline;}',
    '#qdr-footer{text-align:center;padding:4px 0 8px;font-size:10px;color:#aaa;background:#fff;flex-shrink:0;}',
    '#qdr-footer a{color:#8B5CF6;text-decoration:none;}',
    '#qdr-form-wrap{display:none;flex-direction:column;flex:1;min-height:0;background:#fff;overflow:hidden;}',
    '#qdr-form-wrap.open{display:flex;}',
    '#qdr-form-body{padding:16px;display:flex;flex-direction:column;gap:12px;flex:1;overflow-y:auto;}',
    '#qdr-form-header{background:#8B5CF6;color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;}',
    '#qdr-form-header .qdr-name{font-size:14px;font-weight:600;flex:1;}',
    '#qdr-form-back{background:none;border:none;color:#fff;font-size:20px;cursor:pointer;opacity:.8;padding:0 6px;}',
    '#qdr-form-back:hover{opacity:1;}',
    '.qdr-field{display:flex;flex-direction:column;gap:4px;}',
    '.qdr-field label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#6b7280;}',
    '.qdr-field input,.qdr-field select,.qdr-field textarea{border:1px solid #e0d6f7;border-radius:8px;padding:9px 12px;font-size:13.5px;font-family:inherit;outline:none;color:#1f2937;width:100%;box-sizing:border-box;background:#fff;}',
    '.qdr-field input:focus,.qdr-field select:focus,.qdr-field textarea:focus{border-color:#8B5CF6;}',
    '.qdr-field textarea{resize:vertical;min-height:72px;}',
    '.qdr-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}',
    '.qdr-phone-row{display:flex;gap:8px;}',
    '#qdr-phone-prefix{width:130px;flex-shrink:0;}',
    '#qdr-form-submit{background:#8B5CF6;color:#fff;border:none;border-radius:8px;padding:11px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s;margin:0 16px 8px;}',
    '#qdr-form-submit:hover{background:#7C3AED;}',
    '.qdr-section-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#8B5CF6;margin-top:4px;margin-bottom:-4px;}',
    '#qdr-form-success{display:none;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;text-align:center;gap:12px;flex:1;}',
    '#qdr-form-success.show{display:flex;}',
    '#qdr-form-success .qdr-icon{font-size:48px;}',
    '#qdr-form-success h3{font-size:17px;font-weight:700;color:#1f2937;}',
    '#qdr-form-success p{font-size:13px;color:#6b7280;}',
    '#qdr-form-success-back{background:#8B5CF6;color:#fff;border:none;border-radius:8px;padding:10px 24px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;margin-top:8px;}',
    '@media (max-width: 440px){#qdr-window{width:calc(100vw - 16px);right:8px;bottom:80px;max-height:75vh;}#qdr-btn{bottom:16px;right:16px;}}'
  ].join('\n');

  var styleEl = document.createElement('style');
  styleEl.id = 'qdr-styles';
  styleEl.textContent = STYLE;
  document.head.appendChild(styleEl);

  // ── Inyección de HTML ────────────────────────────────────────────
  var HTML = [
    '<button id="qdr-btn" type="button" aria-label="Abrir chat Quadro">',
    '  <img src="' + LOGO + '" alt="Quadro" />',
    '</button>',
    '<div id="qdr-window" role="dialog" aria-label="Chat Quadro">',
    '  <div id="qdr-header">',
    '    <div class="qdr-avatar"><img src="' + LOGO + '" alt="Q"/></div>',
    '    <div class="qdr-info"><div class="qdr-name">Miguel Ángel · Quadro</div><div class="qdr-status">Asistente de arte • Online</div></div>',
    '    <button id="qdr-reset" type="button" aria-label="Nueva conversación" title="Nueva conversación">⟳</button>',
    '    <button id="qdr-close" type="button" aria-label="Cerrar">✕</button>',
    '  </div>',
    '  <div id="qdr-messages"></div>',
    '  <div id="qdr-input-area">',
    '    <textarea id="qdr-input" placeholder="Pregúntame sobre una obra, artista..." rows="1"></textarea>',
    '    <button id="qdr-send" type="button" aria-label="Enviar">',
    '      <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
    '    </button>',
    '  </div>',
    '  <div class="qdr-privacy" id="qdr-chat-privacy">Al usar este chatbot acepto la <a href="' + CFG.privacyUrl + '" target="_blank" rel="noopener">política de privacidad</a> de Quadro.</div>',
    '  <div id="qdr-footer">Powered by <a href="https://ijvagency.com" target="_blank" rel="noopener">IJV</a></div>',
    '  <div id="qdr-form-wrap">',
    '    <div id="qdr-form-header">',
    '      <div class="qdr-name">Contactar al equipo</div>',
    '      <button id="qdr-form-back" type="button" aria-label="Volver">←</button>',
    '    </div>',
    '    <div id="qdr-form-body">',
    '      <div style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true">',
    '        <label>No llenar</label>',
    '        <input type="text" id="qdr-hp" name="hp" tabindex="-1" autocomplete="off" />',
    '      </div>',
    '      <div class="qdr-section-label">Tu información</div>',
    '      <div class="qdr-field"><label>Nombre *</label><input type="text" id="qdr-nombre" placeholder="Tu nombre completo" /></div>',
    '      <div class="qdr-row">',
    '        <div class="qdr-field"><label>Email *</label><input type="email" id="qdr-email" placeholder="correo@ejemplo.com" /></div>',
    '        <div class="qdr-field"><label>País</label><select id="qdr-pais"><option value="">Seleccionar</option><option value="Perú">🇵🇪 Perú</option><option value="Estados Unidos">🇺🇸 Estados Unidos</option><option value="Canadá">🇨🇦 Canadá</option></select></div>',
    '      </div>',
    '      <div class="qdr-field"><label>Teléfono</label>',
    '        <div class="qdr-phone-row">',
    '          <select id="qdr-phone-prefix"><option value="+51">🇵🇪 +51</option><option value="+1">🇺🇸 +1</option><option value="+1-CA">🇨🇦 +1</option><option value="+507">🇵🇦 +507</option><option value="+52">🇲🇽 +52</option><option value="+54">🇦🇷 +54</option><option value="+56">🇨🇱 +56</option><option value="+57">🇨🇴 +57</option><option value="+58">🇻🇪 +58</option><option value="+593">🇪🇨 +593</option><option value="+34">🇪🇸 +34</option><option value="+55">🇧🇷 +55</option></select>',
    '          <input type="tel" id="qdr-telefono" placeholder="Número" style="flex:1;min-width:0;" />',
    '        </div>',
    '      </div>',
    '      <div class="qdr-section-label">Tu interés</div>',
    '      <div class="qdr-field"><label>Artista de interés *</label><select id="qdr-artista"><option value="">Seleccionar artista</option></select></div>',
    '      <div class="qdr-field"><label>Obra de interés</label><select id="qdr-obra" disabled><option value="">— Primero selecciona un artista —</option></select></div>',
    '      <div class="qdr-field"><label>Presupuesto aproximado</label><select id="qdr-presupuesto"><option value="">Seleccionar</option><option value="Menos de USD 500">Menos de USD 500</option><option value="USD 500 – 1,000">USD 500 – 1,000</option><option value="USD 1,000 – 3,000">USD 1,000 – 3,000</option><option value="USD 3,000 – 5,000">USD 3,000 – 5,000</option><option value="Más de USD 5,000">Más de USD 5,000</option></select></div>',
    '      <div class="qdr-field"><label>Consulta o mensaje</label><textarea id="qdr-consulta" placeholder="Cuéntanos qué buscas, qué te gustó, o cualquier duda..."></textarea></div>',
    '    </div>',
    '    <div class="qdr-privacy" style="padding:4px 16px 6px;">Al enviar, aceptas la <a href="' + CFG.privacyUrl + '" target="_blank" rel="noopener">política de privacidad</a> de Quadro.</div>',
    '    <button id="qdr-form-submit" type="button">Enviar consulta</button>',
    '    <div id="qdr-form-success">',
    '      <div class="qdr-icon">🎨</div>',
    '      <h3>¡Gracias por tu interés!</h3>',
    '      <p>El equipo de Quadro se pondrá en contacto contigo pronto.</p>',
    '      <button id="qdr-form-success-back" type="button">Volver al chat</button>',
    '    </div>',
    '    <div id="qdr-footer" style="margin-top:auto;">Powered by <a href="https://ijvagency.com" target="_blank" rel="noopener">IJV</a></div>',
    '  </div>',
    '</div>'
  ].join('\n');

  var container = document.createElement('div');
  container.id = 'qdr-container';
  container.innerHTML = HTML;
  document.body.appendChild(container);

  // ── Catálogo de obras por artista (para el form) ─────────────────
  var CATALOG = {
    'Alberto Gayoso Díaz':['Dominio','Abisal','Mercado','Monopolio','Sin Título','Septiembre','Abismo','Susurro Bajo las Raíces','Interludio, Silencio','Memoria de un Eco','Olvido oficial','Bestiario Líquido','Materia de retorno','Convulsión Primigenia 2025'],
    'Cecilia Maximiliano':['Sin nombre'],
    'Claudia Luque':['1.Floating Points. 2.Ilusion 3.City Garden 4.Serenity Keeper 5.Ella Baila','Garden Inside','Tokio'],
    'David Francisco Rejas Álvarez':['We can do it','La muerte de marat','Kids','Niña reina','Basquiat vs Savage'],
    'FRH ARTE - Fiorella Reinoso Hudtwalcker':['Diosas','100 años de soledad','Raíces','Matices','EL PODER DE LA ACTITUD','MUNDO MULTICOLOR','INSPIRACION MULTICOLOR','CONECTANDO COLORES','CAMINOS MULTICOLOR','Explosion de Colores','NATURALEZA VIVA','Luna Llena','Atardecer en la costa','Amanecer en la costa'],
    'Giancarlo Giovanni Melgar Novoa':['Telar # 03','Telar # 02','Telar # 01','Estudio de Montaña # 02','Estudio de Montaña # 01'],
    'Jose Antonio Torres':['Aires vibracionales de norte y sur','Recovecos en Miraflores','La sutileza de la piel','El pacto de la bailarina','La fantástica creación','Susurros','La luz entre los árboles'],
    'Laura Ferrand':['Hilos que unen (1)','Hilos que unen (2)','Hilos que unen (3)','Hilos que unen (4)','Hilos que unen (5)','Hilos que unen (6)'],
    'Leonardo Beltrán Garcia':['Cadencia fortuita','REBERVERACIÓN III','REBERVERACIÓN II','Reverberación I','Trama suspendida','Eco inmóvil','Destello suspendido','Fractura sutil','Geometría errante'],
    'Lucía Bringas':['Pupa I','Pupa II','Pupa III','Pupa IV','Pupa V','Pupa VI','Retrato de Alejandro','Retrato de Daniel'],
    'Marysol NJ':['Paloma (brazo)','Rejas (pie)','Nudo','Herida 1','Fuego 2','Bolsas','Púas (pie)','Cadenas','Botellas','Tela 1','Hongos','Clavos','Telaraña','Rocas'],
    'Sandra Rizo Patron':['Inflexión S6-36','Convergencia 07','Convergencia 05','Individuo 06','Individuo 05','Confinamiento 12','Confinamiento 05','Inflexión S6-34','Inflexión S6-35'],
    'Teo Baertl Grau':['Pintura Sexanxiofilica #6','Pintura Sexanxiofilica - Prueba #5','Pintura Sexanxiofilica - Prueba #4'],
    'Vanessa Karin':['La oscuridad que empiezo a entender','La oscuridad que me arrastra','La cascada donde se ahogan nuestras lagrimas','Los ojitos que tanto ame','El rayo que nos premia','La luz que nos guia','La selva que ya no hay que temer','El cielo que descubrimos','Las cascadas que nos limpian','El viento que me abraza','Renacer','Beso a la libertad','La vida que no es mía','La sinfonía que compusimos juntos','Sueños de una noche de primavera','La cascada que nos une'],
    'Ximena Giuria':['Despertar','Cosecha','Alma','Vibrante','Textura','Reflejo','Texturas del Alma','Latido','Huella','Esencia','Arraigo'],
    'Yulia Katkova':['Sunny 04','Sunny 02','Sunny 05']
  };

  // ── Lógica del widget ─────────────────────────────────────────────
  var QDR_SESSION = sessionStorage.getItem('qdr_session') || (crypto.randomUUID ? crypto.randomUUID() : (Date.now() + '-' + Math.random().toString(36).slice(2)));
  sessionStorage.setItem('qdr_session', QDR_SESSION);

  var $ = function(id){ return document.getElementById(id); };
  var btn = $('qdr-btn'), win = $('qdr-window'), closeBtn = $('qdr-close'), resetBtn = $('qdr-reset');
  var messages = $('qdr-messages'), input = $('qdr-input'), sendBtn = $('qdr-send');
  var formWrap = $('qdr-form-wrap');
  var formSubmit = $('qdr-form-submit'), formBack = $('qdr-form-back');
  var formSuccess = $('qdr-form-success'), inputArea = $('qdr-input-area');

  var lastData = {};
  try { lastData = JSON.parse(sessionStorage.getItem('qdr_data') || '{}'); } catch(e) { lastData = {}; }

  var WELCOME_MSG = CFG.welcomeMessage;

  var QDR_CHIPS = [
    { icon:'📦', label:'Estado de pedido',      query:'Quiero consultar el estado de mi pedido' },
    { icon:'🚚', label:'Costos de envío',        query:'¿Cuáles son los costos de envío?' },
    { icon:'🕐', label:'Tiempos de entrega',     query:'¿Cuánto demora un envío?' },
    { icon:'🎨', label:'Cuadros personalizados', query:'Quiero un cuadro personalizado' },
    { icon:'🔄', label:'Devoluciones',           query:'¿Cómo funcionan las devoluciones?' }
  ];

  var saved = sessionStorage.getItem(STORAGE_KEY);
  if (saved) {
    messages.innerHTML = saved;
    rewireChips();
  } else {
    addBotMessage(WELCOME_MSG);
    showWelcomeChips();
  }

  function saveMsgs() { sessionStorage.setItem(STORAGE_KEY, messages.innerHTML); }

  btn.addEventListener('click', function(){ win.classList.add('open'); });
  closeBtn.addEventListener('click', function(){ win.classList.remove('open'); });
  resetBtn.addEventListener('click', function(){
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem('qdr_data');
    QDR_SESSION = (crypto.randomUUID ? crypto.randomUUID() : (Date.now() + '-' + Math.random().toString(36).slice(2)));
    sessionStorage.setItem('qdr_session', QDR_SESSION);
    lastData = {};
    messages.innerHTML = '';
    addBotMessage(WELCOME_MSG);
    showWelcomeChips();
    showToast('Nueva conversación iniciada');
  });

  function showWelcomeChips() {
    if (messages.querySelector('.qdr-chips')) return;
    var wrap = document.createElement('div');
    wrap.className = 'qdr-chips';
    QDR_CHIPS.forEach(function(c){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'qdr-chip';
      b.setAttribute('data-qdr-query', c.query);
      b.innerHTML = '<span class="qdr-chip-icon">' + c.icon + '</span><span class="qdr-chip-label">' + c.label + '</span>';
      b.addEventListener('click', function(){ handleChipClick(b); });
      wrap.appendChild(b);
    });
    messages.appendChild(wrap);
    saveMsgs();
  }

  function rewireChips() {
    messages.querySelectorAll('.qdr-chip[data-qdr-query]').forEach(function(b){
      b.addEventListener('click', function(){ handleChipClick(b); });
    });
  }

  function handleChipClick(btnEl) {
    var q = btnEl.getAttribute('data-qdr-query');
    var chipsContainer = btnEl.closest('.qdr-chips');
    if (chipsContainer) chipsContainer.remove();
    input.value = q;
    sendMessage();
  }

  function showToast(text) {
    var toast = $('qdr-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'qdr-toast';
      toast.style.cssText = 'position:absolute;top:56px;left:50%;transform:translateX(-50%);background:rgba(40,25,60,.92);color:#fff;padding:8px 14px;border-radius:20px;font-size:12px;z-index:10;opacity:0;transition:opacity .25s;pointer-events:none;white-space:nowrap;';
      win.appendChild(toast);
    }
    toast.textContent = text;
    requestAnimationFrame(function(){ toast.style.opacity = '1'; });
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function(){ toast.style.opacity = '0'; }, 2000);
  }

  function parseMd(t) {
    var lines = t.split('\n');
    var out = '', inTable = false;
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i].trim();
      if (l.startsWith('|') && l.endsWith('|')) {
        var isSep = /^\|[\s\-:|]+\|$/.test(l);
        if (isSep) continue;
        var cells = l.slice(1,-1).split('|').map(function(c){ return c.trim(); });
        if (!inTable) {
          inTable = true;
          out += '<table><thead><tr>' + cells.map(function(c){return '<th>'+c+'</th>';}).join('') + '</tr></thead><tbody>';
        } else {
          out += '<tr>' + cells.map(function(c){return '<td>'+c+'</td>';}).join('') + '</tr>';
        }
      } else {
        if (inTable) { out += '</tbody></table>'; inTable = false; }
        out += l + '\n';
      }
    }
    if (inTable) out += '</tbody></table>';
    t = out;
    t = t.replace(/\[IMG:(https?:\/\/[^\]\s]+)\]/g, '<img src="$1" alt="Obra" style="display:block;max-width:100%;border-radius:8px;margin:6px 0;" loading="lazy" />');
    t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#8B5CF6;text-decoration:underline;">$1</a>');
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*(.+?)\*/g, '<em>$1</em>');
    t = t.replace(/^[\*\-•] (.+)/gm, '<li>$1</li>');
    t = t.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
    t = t.replace(/<\/ul>\s*<ul>/g, '');
    t = t.replace(/\n{2,}/g, '<br><br>');
    t = t.replace(/\n/g, '<br>');
    return t;
  }

  function addBotMessage(text) {
    var msg = document.createElement('div');
    msg.className = 'qdr-msg bot';
    msg.innerHTML = '<div class="qdr-bot-av"><img src="' + LOGO + '" alt="Q"/></div><div class="qdr-bot-text">' + parseMd(text) + '</div>';
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
    saveMsgs();
    extractDataFromMessage(text);
  }

  function addUserMessage(text) {
    var msg = document.createElement('div');
    msg.className = 'qdr-msg user';
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
    saveMsgs();
  }

  var typingEl = null;
  function showTyping() {
    typingEl = document.createElement('div');
    typingEl.className = 'qdr-typing';
    typingEl.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(typingEl);
    messages.scrollTop = messages.scrollHeight;
  }
  function hideTyping() { if (typingEl) { typingEl.remove(); typingEl = null; } }

  function sleep(ms) { return new Promise(function(r){ setTimeout(r, ms); }); }

  async function streamBotResponse(text) {
    var msg = document.createElement('div');
    msg.className = 'qdr-msg bot';
    var av = document.createElement('div'); av.className = 'qdr-bot-av';
    av.innerHTML = '<img src="' + LOGO + '" alt="Q"/>';
    var body = document.createElement('div'); body.className = 'qdr-bot-text';
    msg.appendChild(av); msg.appendChild(body);
    messages.appendChild(msg);

    var blocks = text.split(/\n{2,}/);
    var fullText = '';
    for (var bi = 0; bi < blocks.length; bi++) {
      var block = blocks[bi];
      var words = block.split(/(\s+)/);
      for (var wi = 0; wi < words.length; wi++) {
        var w = words[wi];
        fullText += w;
        body.innerHTML = parseMd(fullText);
        messages.scrollTop = messages.scrollHeight;
        if (w.trim()) await sleep(28);
      }
      fullText += '\n\n';
      body.innerHTML = parseMd(fullText);
      messages.scrollTop = messages.scrollHeight;
      await sleep(60);
    }

    saveMsgs();
    extractDataFromMessage(fullText);
    requestAnimationFrame(function(){ messages.scrollTop = messages.scrollHeight; });
    return { text: fullText, body: body };
  }

  function appendContactButton(bodyEl) {
    if (!bodyEl || bodyEl.querySelector('.qdr-inline-btn')) return;
    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;';

    var formBtn = document.createElement('button');
    formBtn.type = 'button';
    formBtn.className = 'qdr-inline-btn';
    formBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>Contactar al equipo';
    formBtn.addEventListener('click', openLeadForm);
    wrap.appendChild(formBtn);

    if (QDR_WA) {
      var waBtn = document.createElement('button');
      waBtn.type = 'button';
      waBtn.className = 'qdr-inline-btn wa';
      waBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20.52 3.48A11.89 11.89 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.12.56 4.19 1.62 6.01L0 24l6.16-1.61A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.2-3.48-8.52zM12 22c-1.84 0-3.63-.49-5.21-1.41l-.37-.22-3.66.96.98-3.57-.24-.38A9.93 9.93 0 0 1 2 12C2 6.49 6.49 2 12 2s10 4.49 10 10-4.49 10-10 10zm5.47-7.14c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.8-1.67-2.1-.17-.3-.02-.47.13-.62.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.12 3.23 5.12 4.53.72.3 1.28.5 1.72.65.72.22 1.37.19 1.88.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z"/></svg>Abrir WhatsApp';
      waBtn.addEventListener('click', openWhatsApp);
      wrap.appendChild(waBtn);
    }

    bodyEl.appendChild(wrap);
    saveMsgs();
    requestAnimationFrame(function(){ messages.scrollTop = messages.scrollHeight; });
  }

  function extractDataFromMessage(text) {
    var artistas = ['Vanessa Karin','Alberto Gayoso','Jose Antonio Torres','Marysol NJ','Alejandra Bambarén','ABAMGU','Sandra Allende','Ignacio Alvaro','Leonardo Beltrán','Sandra Rizo','David Rejas','Giancarlo Melgar','Alfredo Grosman','FRH ARTE','Fiorella Reinoso','Entes Jiménez','Entes','Laura Ferrand','Teo Baertl','Claudia Luque','Yulia Katkova','Cecilia Maximiliano','Ian Deneumostier','Lucía Bringas','Ximena Giuria'];
    for (var ai = 0; ai < artistas.length; ai++) { if (text.indexOf(artistas[ai]) > -1) { lastData.obra_artista = artistas[ai]; break; } }
    var bulletMatches = [].slice.call((text.matchAll ? text.matchAll(/\*\*([^*]+)\*\*\s*[—–-]\s*USD/g) : []) || []);
    if (bulletMatches.length > 0) lastData.obra_titulo = bulletMatches[bulletMatches.length - 1][1].trim();
    if (!lastData.obra_titulo) {
      var proseMatch = text.match(/"([^"]{5,80})"/);
      if (proseMatch) lastData.obra_titulo = proseMatch[1];
    }
    var urlMatches = [].slice.call((text.matchAll ? text.matchAll(/\[Ver obra\]\((https?:\/\/[^\)]+)\)/g) : []) || []);
    if (urlMatches.length > 0) lastData.obra_url = urlMatches[urlMatches.length - 1][1];
    var usdMatch = text.match(/USD\s*([\d,]+)/);
    if (usdMatch && !lastData.precio_referencia) lastData.precio_referencia = usdMatch[1];
    var nombreMatch = text.match(/[Hh]ola,?\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)!/);
    if (nombreMatch && nombreMatch[1] !== 'Gracias') lastData.nombre = nombreMatch[1];
    sessionStorage.setItem('qdr_data', JSON.stringify(lastData));
  }

  function userWantsForm(text) { return /\b(contact|equipo|llámenme|escríbanme|mándenme|comuníquense|hablar con|dejar mis datos|dejar mi info|quiero comprar|cerrar la compra)/i.test(text); }
  function userWantsWhatsApp(text) { return /\b(whatsapp|wsp|wa\.me)/i.test(text); }
  function botSuggestsContact(text) { return /\b(contactar a nuestro equipo|contactar al equipo|nuestro equipo|comunícate con el equipo|contactar)/i.test(text); }

  async function sendMessage() {
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.style.height = 'auto';
    var wantsForm = userWantsForm(text);
    var wantsWA   = userWantsWhatsApp(text);
    addUserMessage(text);
    showTyping();
    try {
      var res = await fetch(QDR_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: QDR_SESSION, channel: 'web', userName: null })
      });
      var data = await res.json();
      hideTyping();
      var botReply = data.output || data.text || data.message || 'Lo siento, hubo un problema de conexión.';
      var streamed = await streamBotResponse(botReply);
      if (wantsWA) {
        setTimeout(openWhatsApp, 1200);
      } else if (wantsForm || botSuggestsContact(botReply)) {
        appendContactButton(streamed.body);
      }
    } catch(e) {
      hideTyping();
      addBotMessage('Tuve un problema de conexión. Por favor, intenta de nuevo en un momento.');
    }
  }

  input.addEventListener('input', function(){
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 90) + 'px';
  });
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', function(e){
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  // Poblar el select de artistas
  var artistaSelect = $('qdr-artista');
  var obraSelect    = $('qdr-obra');
  Object.keys(CATALOG).sort().forEach(function(a){
    var opt = document.createElement('option');
    opt.value = a; opt.textContent = a;
    artistaSelect.appendChild(opt);
  });

  artistaSelect.addEventListener('change', function(){
    var artista = artistaSelect.value;
    obraSelect.innerHTML = '';
    if (!artista) {
      obraSelect.disabled = true;
      obraSelect.innerHTML = '<option value="">— Primero selecciona un artista —</option>';
      return;
    }
    var obras = CATALOG[artista] || [];
    obraSelect.disabled = false;
    obraSelect.innerHTML = '<option value="">Seleccionar obra (opcional)</option>';
    obras.forEach(function(o){
      var opt = document.createElement('option');
      opt.value = o; opt.textContent = o;
      obraSelect.appendChild(opt);
    });
  });

  function openLeadForm() {
    var d = lastData;
    if (d.nombre) $('qdr-nombre').value = d.nombre;
    if (d.obra_artista) {
      var matchedArtist = Object.keys(CATALOG).find(function(a){ return d.obra_artista.indexOf(a.split(' ')[0]) > -1; });
      if (matchedArtist) {
        artistaSelect.value = matchedArtist;
        artistaSelect.dispatchEvent(new Event('change'));
      }
    }
    $('qdr-header').style.display = 'none';
    messages.style.display = 'none';
    inputArea.style.display = 'none';
    $('qdr-chat-privacy').style.display = 'none';
    $('qdr-footer').style.display = 'none';
    formWrap.classList.add('open');
  }

  function closeLeadForm() {
    formWrap.classList.remove('open');
    $('qdr-header').style.display = 'flex';
    messages.style.display = 'flex';
    inputArea.style.display = 'flex';
    $('qdr-chat-privacy').style.display = '';
    $('qdr-footer').style.display = '';
  }

  function openWhatsApp() {
    var WA = QDR_WA || '51938498725';
    var obra    = lastData.obra_titulo  || '';
    var artista = lastData.obra_artista || '';
    var url     = lastData.obra_url     || '';

    var msg = 'Hola Quadro,\n\n';
    if (obra) {
      msg += 'Me interesa la obra "' + obra + '"';
      if (artista) msg += ' de ' + artista;
      msg += '.';
      if (url) msg += '\n' + url;
    } else if (artista) {
      msg += 'Me interesa conocer obras de ' + artista + '.';
    } else {
      msg += 'Me gustaría recibir más información sobre sus obras.';
    }
    msg += '\n\n¿Pueden ayudarme?';

    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank');
  }

  formBack.addEventListener('click', closeLeadForm);
  $('qdr-form-success-back').addEventListener('click', function(){
    formSuccess.classList.remove('show');
    $('qdr-form-body').style.display = 'flex';
    $('qdr-form-submit').style.display = 'block';
    closeLeadForm();
  });

  formSubmit.addEventListener('click', async function(){
    var nombre  = $('qdr-nombre').value.trim();
    var email   = $('qdr-email').value.trim();
    var artista = $('qdr-artista').value;
    if (!nombre || !email) { alert('Por favor completa al menos tu nombre y email.'); return; }
    if (!artista) { alert('Por favor selecciona un artista de interés.'); return; }

    var prefix  = $('qdr-phone-prefix').value;
    var tel     = $('qdr-telefono').value.trim();
    var telefono = tel ? (prefix + ' ' + tel) : '';
    var obra    = $('qdr-obra').value;
    var obra_artista = obra ? (artista + ' — ' + obra) : artista;

    var payload = {
      nombre: nombre,
      email: email,
      telefono: telefono,
      pais: $('qdr-pais').value,
      obra_artista: obra_artista,
      presupuesto: $('qdr-presupuesto').value,
      consulta: $('qdr-consulta').value.trim(),
      hp: $('qdr-hp').value
    };

    formSubmit.textContent = 'Enviando...';
    formSubmit.disabled = true;

    try {
      await fetch(QDR_LEADS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      $('qdr-form-body').style.display = 'none';
      formSubmit.style.display = 'none';
      formSuccess.classList.add('show');
    } catch(e) {
      alert('Hubo un problema al enviar. Por favor intenta nuevamente.');
      formSubmit.textContent = 'Enviar consulta';
      formSubmit.disabled = false;
    }
  });

})();
