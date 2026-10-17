/* =============================================================
   templates.js — el HTML de cada sección (lo usa build.js)
   -------------------------------------------------------------
   Los textos NO van acá: salen de content.js. Acá solo hay
   estructura. Un dato en null se muestra como «cambiar después».
   ============================================================= */
const { esc } = require("./lib");

const PEND = "cambiar después";
const pend = () => `<span class="pend">${PEND}</span>`;
const arrow = `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>`;

/* ---------- imágenes ---------- */
function variantsOf(M, id) {
  const m = M[id];
  if (!m) throw new Error(`La imagen "${id}" no está en assets/img/manifest.json (corré: npm run optimize)`);
  return { m, vs: [...m.variants].sort((a, b) => a.w - b.w) };
}

/* Cada variante tiene un rol (ver scripts/optimize-img.js):
   card = tarjetas y hero · big = lo primero que muestra el visor (y el hero en retina) · zoom = solo al hacer zoom */
const byRole = (vs, ...roles) => vs.filter((v) => roles.includes(v.role));
const cardSet = (vs) => byRole(vs, "card");
const heroSet = (vs) => byRole(vs, "card", "big");
const bigOf = (vs) => byRole(vs, "big")[0] || cardSet(vs).slice(-1)[0];
const zoomOf = (vs) => byRole(vs, "zoom")[0] || null;

/* srcset de tarjeta: solo las medidas de tarjeta (las grandes se bajan únicamente en el visor) */
function img(C, M, id, { sizes, eager = false, cls = "", set = cardSet } = {}) {
  const { vs } = variantsOf(M, id);
  const use = set(vs);
  const big = use[use.length - 1];
  const srcset = use.map((v) => `assets/img/${v.file} ${v.w}w`).join(", ");
  const alt = esc(C.IMAGES[id].alt);
  return `<img${cls ? ` class="${cls}"` : ""} src="assets/img/${big.file}" srcset="${srcset}" sizes="${sizes}" ` +
    `width="${big.w}" height="${big.h}" alt="${alt}" decoding="async" ` +
    (eager ? `fetchpriority="high"` : `loading="lazy"`) + `>`;
}

const bigFile = (M, id) => bigOf(variantsOf(M, id).vs).file;
const zoomFile = (M, id) => { const z = zoomOf(variantsOf(M, id).vs); return z ? z.file : ""; };

/* ---------- bloques chicos ---------- */
function button({ label, href, cls = "", detail = "" }, { external = true } = {}) {
  const d = detail ? `<span class="btn__detail">${esc(detail)}</span>` : "";
  if (href) {
    const ext = external ? ` target="_blank" rel="noopener"` : "";
    return `<a class="btn ${cls}" href="${esc(href)}"${ext}>${esc(label)}${d}${arrow}</a>`;
  }
  return `<span class="btn btn--pending ${cls}" aria-disabled="true">${esc(label)} ${pend()}</span>`;
}

/* ---------- videos ---------- */
function videoOf(V, id) {
  const v = V && V[id];
  if (!v) throw new Error(`El video "${id}" no está en assets/video/manifest.json (corré: npm run optimize:video)`);
  return v;
}

/* ---------- hero ---------- */
/* Con HERO.video: un video mudo encima de la foto. Nace sin src (data-src) y app.js lo arranca solo si no hay
   movimiento reducido ni ahorro de datos; aparece con un fundido cuando ya está reproduciendo. Sin JS queda la foto.
   Es decorativo (la foto ya tiene su texto alternativo) y se puede pausar: dura más de 5 s (WCAG 2.2.2). El botón de
   pausa es el «● REC» del visor (con el video corriendo, la cámara «graba»; pausado dice PAUSA): no ocupa lugar extra. */
function heroVideoHTML(C, V) {
  if (!C.HERO.video) return { media: "", rec: "" };
  const v = videoOf(V, C.HERO.video);
  return {
    media: `\n      <video class="hero__video" muted loop playsinline preload="none" data-src="assets/video/${v.file}" aria-hidden="true" tabindex="-1"></video>`,
    rec: `<button class="vf__rec vf__btn" type="button" aria-label="Pausar el video de fondo" hidden><i aria-hidden="true"></i><span class="vf__state" aria-hidden="true">REC</span></button>`,
  };
}

function heroHTML(C, M, V) {
  const { HERO } = C;
  const hv = heroVideoHTML(C, V);
  const vs = heroSet(variantsOf(M, HERO.image).vs);
  const big = vs[vs.length - 1];
  const srcset = vs.map((v) => `assets/img/${v.file} ${v.w}w`).join(", ");
  // encuadre de la foto del héroe: lo decide el contenido (HERO.focus), uno para celular (m) y otro para escritorio (d)
  const focus = { m: "50% 46%", d: "50% 52%", ...(HERO.focus || {}) };
  const lines = HERO.title.map((t, i) =>
    `<span class="hero__line${i === HERO.title.length - 1 ? " accent" : ""}">${esc(t)}</span>`).join(" ");
  return `
  <section class="hero" id="top">
    <div class="hero__media" style="--focus-m:${esc(focus.m)};--focus-d:${esc(focus.d)}">
      <img src="assets/img/${big.file}" srcset="${srcset}" sizes="(min-width: 900px) 50vw, 100vw"
           width="${big.w}" height="${big.h}" alt="${esc(C.IMAGES[HERO.image].alt)}" fetchpriority="high" decoding="async">${hv.media}
    </div>
    <div class="hero__scrim" aria-hidden="true"></div>
    <div class="hero__vf"><span class="vf__rec vf__rec--static" aria-hidden="true"><i></i>REC</span>${hv.rec}<span class="vf__tc" aria-hidden="true"><b>TC</b> <span data-tc>01:00:00:00</span></span></div>
    <div class="wrap hero__inner">
      <p class="eyebrow">${esc(HERO.eyebrow)}</p>
      <h1 class="hero__title">${lines}</h1>
      <p class="hero__lead">${esc(HERO.lead)}</p>
      <div class="hero__cta">
        <a class="btn btn--accent btn--clap" href="#trabajo"><span class="btn__label">Ver trabajo</span></a>
        ${HERO.watch ? button(HERO.watch, {}) : ""}
      </div>
      <p class="hero__cap mono">${esc(HERO.caption)}</p>
    </div>
  </section>${stripHTML(HERO)}`;
}

/* visor de cámara (hero__vf): esquinas de encuadre, REC y código de tiempo que corre a 24 cuadros por segundo desde 01:00:00:00
   (así arranca el código de tiempo en un master profesional). Es decorativo (aria-hidden); con movimiento reducido queda quieto. */

/* cinta de pilares bajo la portada: pasa despacio como un rollo de película. Es decorativa (aria-hidden): los mismos pilares
   están explicados en «Qué hago». Con prefers-reduced-motion queda quieta y en una sola tanda. */
function stripHTML(HERO) {
  const words = HERO.strip || [];
  if (!words.length) return "";
  const set = `<div class="strip__set">${words.map((w) => `<span>${esc(w)}</span>`).join("")}</div>`;
  return `
  <div class="strip" aria-hidden="true"><div class="strip__track">${set}${set}${set}</div></div>`;
}

/* ---------- proyectos ---------- */
function slateHTML(p, num) {
  const cell = (k, v) => v ? `<div class="slate__cell"><dt>${k}</dt><dd>${esc(v)}</dd></div>` : "";
  // la claqueta tiene dos palos: el de abajo fijo (slate__bar) y el brazo (slate__arm), que se cierra de golpe cuando el
  // proyecto entra en pantalla. Cuánto se abre lo calcula app.js según el ancho (--open), para que no tape lo de arriba.
  return `
      <header class="slate">
        <div class="slate__bar" aria-hidden="true"><i class="slate__arm"></i></div>
        <dl class="slate__grid">
          <div class="slate__cell slate__cell--title"><dt>Prod.</dt><dd><h2 class="project__title">${esc(p.title)}</h2></dd></div>
          ${cell("Escena", num)}
          ${cell("Plano", p.kind)}
          ${cell("Toma", p.year)}
        </dl>
      </header>`;
}

/* Un video dentro de la galería: bucle mudo con su póster. Nace sin src (data-src): app.js lo carga y lo reproduce
   cuando está a la vista (y lo pausa cuando no), con un botón para pausarlo. Sin JS se ve el póster como una foto. */
function videoFrameHTML(C, V, id, k, total, title) {
  const v = videoOf(V, id), n = String(k + 1).padStart(2, "0");
  const alt = C.VIDEOS[id].alt || title;
  // el póster es un <img loading="lazy"> DEBAJO del video (no el atributo poster, que el navegador baja apenas carga la
  // página aunque el video esté lejos: eran 5 pósters, ~250 KB, en la primera carga). El video sin src es transparente.
  return `<figure class="frame frame--video" data-n="${n}" style="--ar:${(v.w / v.h).toFixed(4)}">` +
    `<img class="frame__poster" src="assets/video/${v.poster}" width="${v.w}" height="${v.h}" alt="" loading="lazy" decoding="async">` +
    `<video muted loop playsinline preload="none" data-src="assets/video/${v.file}" width="${v.w}" height="${v.h}" aria-label="Video ${k + 1} de ${total}: ${esc(alt)}"></video>` +
    `<button class="frame__play" type="button" aria-label="Pausar el video ${k + 1} de ${total}" hidden><i aria-hidden="true"></i></button>` +
    `<figcaption class="sr-only">${esc(alt)}</figcaption></figure>`;
}

/* «Ver microficción» con un video propio: un link al archivo (sin JS lo abre el navegador) que app.js convierte en un visor. */
function watchVideoHTML(C, V, w, title) {
  const v = videoOf(V, w.video);
  return `<a class="btn" href="assets/video/${v.file}" data-player data-poster="assets/video/${v.poster}" data-title="${esc(title)}" data-w="${v.w}" data-h="${v.h}">${esc(w.label)}<span class="btn__detail">${Math.floor(v.dur / 60)}:${String(Math.round(v.dur % 60)).padStart(2, "0")}</span><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg></a>`;
}

function projectHTML(C, M, V, p, i) {
  const num = String(i + 1).padStart(2, "0");
  const maxH = p.low ? 420 : 560;
  const isVideo = (id) => !!(C.VIDEOS && C.VIDEOS[id]);
  const frames = p.frames.map((id, k) => {
    if (isVideo(id)) return videoFrameHTML(C, V, id, k, p.frames.length, p.title);
    const { m } = variantsOf(M, id);
    const ar = (m.w / m.h).toFixed(4);
    const cap = `${p.title} — ${k + 1}/${p.frames.length}`;
    const z = zoomFile(M, id);
    return `<a class="frame" href="assets/img/${bigFile(M, id)}"${z ? ` data-zoom="assets/img/${z}"` : ""} data-lb data-cap="${esc(cap)}" data-n="${String(k + 1).padStart(2, "0")}" style="--ar:${ar}" aria-label="Ampliar imagen ${k + 1} de ${p.frames.length}: ${esc(p.title)}">` +
      img(C, M, id, { sizes: `${Math.round(m.w / m.h * maxH)}px` }) + `</a>`;
  }).join("\n          ");
  // la barra de avance es una línea de tiempo de edición: un clip por foto (ancho proporcional; app.js lo ajusta al real)
  // y un cabezal de reproducción que avanza con la tira
  const arOf = (id) => { if (isVideo(id)) { const v = videoOf(V, id); return v.w / v.h; } const { m } = variantsOf(M, id); return m.w / m.h; };
  const clips = p.frames.map((id) => `<b${isVideo(id) ? ' class="is-video"' : ""} style="flex-grow:${arOf(id).toFixed(3)}"></b>`).join("");
  const roles = p.roles.map((r) => `<li>${esc(r)}</li>`).join("");
  return `
    <article class="project${p.low ? " project--low" : ""}" id="${esc(p.slug)}" data-cat="${esc(p.cat)}" data-reveal>
      ${slateHTML(p, num)}
      <div class="project__body">
        <div class="project__info">
          ${p.where ? `<p class="project__where mono">${esc(p.where)}</p>` : ""}
          <p class="project__text">${esc(p.text)}</p>
          <p class="label">Rol</p>
          <ul class="roles">${roles}</ul>
          ${p.credit ? `<p class="project__credit mono">${esc(p.credit)}</p>` : ""}
          ${p.watch ? `<div class="project__watch">${p.watch.video ? watchVideoHTML(C, V, p.watch, p.title) : button(p.watch)}</div>` : ""}
        </div>
        <div class="gallery">
          <div class="rail" role="region" aria-label="Galería: ${esc(p.title)}" data-gallery="${esc(p.slug)}">
            ${frames}
          </div>
          <div class="rail__bar" hidden>
            <button class="rail__btn rail__prev" type="button" aria-label="Fotogramas anteriores" disabled><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg></button>
            <button class="rail__btn rail__next" type="button" aria-label="Fotogramas siguientes"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
            <span class="rail__count mono" aria-hidden="true">01 / ${String(p.frames.length).padStart(2, "0")}</span>
            <span class="rail__track" aria-hidden="true"><span class="rail__clips">${clips}</span><i></i></span>
          </div>
        </div>
      </div>
    </article>`;
}

function projectsHTML(C, M, V = {}) {
  return C.PROJECTS.map((p, i) => projectHTML(C, M, V, p, i)).join("\n");
}

/* ---------- créditos ---------- */
/* Todo lo audiovisual, con su rol: un proyecto destacado arriba muestra el oficio; esta lista muestra el recorrido.
   Cada fila: año · título (y artista) · tipo · rol · link (YouTube/Instagram, o el visor si el video es propio). */
function creditsHTML(C, V = {}) {
  const list = C.CREDITS || [];
  if (!list.length) return "";
  const host = (u) => /youtube\.com|youtu\.be/.test(u) ? "YouTube" : /instagram\.com/.test(u) ? "Instagram" : "Ver";
  const rows = list.map((c) => {
    const name = c.title + (c.by ? ` — ${c.by}` : "");
    let go = "";
    if (c.play) {
      const v = videoOf(V, c.play);
      go = `<a class="cr__go" href="assets/video/${v.file}" data-player data-poster="assets/video/${v.poster}" data-title="${esc(c.title)}" data-w="${v.w}" data-h="${v.h}" aria-label="Ver «${esc(name)}»">Ver <svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg></a>`;
    } else if (c.href) {
      go = `<a class="cr__go" href="${esc(c.href)}" target="_blank" rel="noopener" aria-label="Ver «${esc(name)}» en ${host(c.href)}">${host(c.href)}${arrow}</a>`;
    }
    return `
        <li class="cr">
          <span class="cr__y mono">${esc(c.year)}</span>
          <span class="cr__main"><b class="cr__t">${esc(c.title)}</b>${c.by ? ` <span class="cr__by">— ${esc(c.by)}</span>` : ""}<span class="cr__k">${esc(c.kind)}${c.note ? ` · ${esc(c.note)}` : ""}</span></span>
          <span class="cr__r">${esc(c.role)}</span>
          ${go || `<span class="cr__go cr__go--none" aria-hidden="true"></span>`}
        </li>`;
  }).join("");
  return `
      <div class="credits" id="creditos" data-reveal>
        <p class="label">Créditos</p>
        <h2 class="credits__title">Todo lo que hice, con mi rol.</h2>
        <ol class="credits__list">${rows}
        </ol>
      </div>`;
}

/* ---------- filtros de trabajo ---------- */
/* Solo se muestran las categorías que tienen proyectos. Con una sola categoría no hay nada que filtrar.
   Sin JS no se ve (la barra nace oculta y app.js la activa): todos los proyectos quedan a la vista. */
function filtersHTML(C) {
  const counts = {};
  for (const p of C.PROJECTS) counts[p.cat] = (counts[p.cat] || 0) + 1;
  const cats = C.CATEGORIES.filter((c) => counts[c.key]);
  if (cats.length < 2) return "";
  const chip = (key, label, n, on) =>
    `<button type="button" class="chip" data-filter="${esc(key)}" aria-pressed="${on}">${esc(label)}<span class="chip__n" aria-hidden="true">${n}</span></button>`;
  return `
      <div class="filterbar" id="filterbar" hidden>
        <div class="filters" role="group" aria-label="Filtrar trabajos por tipo">
          ${chip("todos", "Todo", C.PROJECTS.length, "true")}
          ${cats.map((c) => chip(c.key, c.label, counts[c.key], "false")).join("")}
        </div>
        <p class="sr-only" id="filtersStatus" role="status" aria-live="polite"></p>
      </div>`;
}

/* ---------- sobre mí ---------- */
function aboutHTML(C, M) {
  const { ABOUT, TIMELINE = [] } = C;
  const { m } = variantsOf(M, ABOUT.photo);
  const stats = ABOUT.stats.map((s) =>
    `<div class="stat"><b>${esc(s.n)}</b><span>${esc(s.label)}</span></div>`).join("");
  const tl = TIMELINE.map((t, k) => `
        <li class="tl" style="--i:${k}"><b class="tl__y">${esc(t.year)}</b><span class="tl__t">${esc(t.text)}</span></li>`).join("");
  return `
  <section class="section wrap about" id="sobre">
    <figure class="about__photo" data-reveal style="--ar:${ABOUT.photoAr || (m.w / m.h).toFixed(4)};--pos:${esc(ABOUT.photoPos || "50% 50%")}">
      ${img(C, M, ABOUT.photo, { sizes: "(min-width: 900px) 420px, 80vw" })}
    </figure>
    <div class="about__text" data-reveal>
      <p class="scene mono">Escena 02 — Sobre mí</p>
      <h2 class="about__big">${esc(ABOUT.title)}</h2>
      ${ABOUT.quote ? `<blockquote class="about__quote">“${esc(ABOUT.quote)}”</blockquote>` : ""}
      ${ABOUT.paragraphs.map((t) => `<p>${t}</p>`).join("\n      ")}
      <div class="stats">${stats}</div>
    </div>
    ${tl ? `<div class="timeline-wrap" data-reveal>
      <p class="label">Trayectoria</p>
      <ol class="timeline">${tl}
      </ol>
    </div>` : ""}
  </section>`;
}

/* ---------- qué hago ---------- */
function servicesHTML(C) {
  const { SERVICES } = C;
  const cards = SERVICES.items.map((it) => `
      <article class="svc">
        <p class="svc__n mono">${esc(it.n)}</p>
        <h3 class="svc__t">${esc(it.title)}</h3>
        ${it.text ? `<p class="svc__d">${esc(it.text)}</p>` : ""}
        <ul class="svc__l">${it.list.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      </article>`).join("");
  return `
  <section class="section wrap services" id="hago">
    <div data-reveal>
      <p class="scene mono">Escena 03 — Qué hago</p>
      <h2 class="h2">${esc(SERVICES.title)}</h2>
      <p class="services__lead">${esc(SERVICES.lead)}</p>
    </div>
    <div class="services__grid" data-reveal>${cards}
    </div>
  </section>`;
}

/* ---------- herramientas ---------- */
/* Íconos propios, dibujados para este sitio: muestran QUÉ se hace con cada herramienta (montar, corregir color, revelar…),
   no el logo de la marca. Los logos de Adobe, Microsoft y CapCut no tienen uso libre (Adobe y Microsoft pidieron salir de la
   biblioteca libre Simple Icons) y mezclar logos oficiales con dibujos propios se vería desparejo.
   Solo <path> (pathLength="1" funciona en todos los navegadores): así cada ícono «se dibuja» al entrar en pantalla.
   Las piezas con clase i-* son las que se mueven (site.css → «herramientas»). Un ícono que no está acá usa «generic». */
const TOOL_ICONS = {
  timeline: `<path class="i-ruler" d="M3 4h18"/><path class="i-clip" d="M3 8h9.5v3.6H3z"/><path class="i-clip" d="M14 8h7v3.6h-7z"/><path class="i-clip" d="M9 15h12v3.6H9z"/><path class="i-ph" d="M5.4 2.2h2.4L6.6 4zM6.6 4v17"/>`,
  color:    `<path d="M3.5 12a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0-17 0"/><path d="M12 11v2M11 12h2"/><path class="i-puck" d="M13.9 8.4a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0"/>`,
  phone:    `<path d="M9 2.5h6a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-15a2 2 0 0 1 2-2z"/><path class="i-play" d="M10.6 8.6v5.4l4.4-2.7z"/><path class="i-bar" d="M9.8 17.6h4.4"/>`,
  sliders:  `<path d="M4 7h16M4 12h16M4 17h16"/><path class="i-k i-k1" d="M7 7a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/><path class="i-k i-k2" d="M13 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/><path class="i-k i-k3" d="M9 17a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/>`,
  layers:   `<path d="M3.5 16l8.5 4.5 8.5-4.5"/><path d="M3.5 12l8.5 4.5 8.5-4.5"/><path class="i-l1" d="M12 3.5l8.5 4.5-8.5 4.5-8.5-4.5z"/>`,
  wave:     `<path class="i-w" style="--k:0" d="M4 10v4"/><path class="i-w" style="--k:1" d="M7.2 7v10"/><path class="i-w" style="--k:2" d="M10.4 4v16"/><path class="i-w" style="--k:3" d="M13.6 8v8"/><path class="i-w" style="--k:4" d="M16.8 5.5v13"/><path class="i-w" style="--k:5" d="M20 9.5v5"/>`,
  monitor:  `<path d="M4.5 4h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M9 21h6M12 17v4"/><path d="M11 8.6h6.5M7 12.6h10.5"/><path class="i-rec i-fill" d="M5.5 8.6a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0"/>`,
  live:     `<path class="i-fill" d="M10.3 12a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0"/><path class="i-a1" d="M8.6 8.6a4.8 4.8 0 0 0 0 6.8M15.4 8.6a4.8 4.8 0 0 1 0 6.8"/><path class="i-a2" d="M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8"/>`,
  sheet:    `<path d="M5 4h14a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 19 20H5a1.5 1.5 0 0 1-1.5-1.5v-13A1.5 1.5 0 0 1 5 4z"/><path d="M3.5 9h17M3.5 14.5h17M9.5 9v11"/><path class="i-txt" d="M11.7 11.75h5.8"/><path class="i-txt i-txt2" d="M11.7 17.25h3.6"/>`,
  generic:  `<path d="M12 4c.7 5 3 7.3 8 8-5 .7-7.3 3-8 8-.7-5-3-7.3-8-8 5-.7 7.3-3 8-8z"/>`,
};
const toolIcon = (key) => `<span class="tool__ico" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">` +
  (TOOL_ICONS[key] || TOOL_ICONS.generic).replace(/<path /g, '<path pathLength="1" ') + `</svg></span>`;

function toolsHTML(C) {
  let n = 0;   // orden global: los íconos se dibujan en cascada, de la primera herramienta a la última
  const groups = C.TOOLS.map((g) => `
      <div class="tools__group">
        <h3 class="label">${esc(g.group)}</h3>
        <ul class="tools__list">
          ${g.items.map((t) => `<li class="tool${t.confirmed ? "" : " tool--pending"}" style="--i:${n++}">${toolIcon(t.icon)}<span class="tool__n">${esc(t.name)}</span>${t.confirmed ? "" : ` ${pend()}`}</li>`).join("\n          ")}
        </ul>
      </div>`).join("");
  return `
  <section class="section wrap tools" id="herramientas">
    <div data-reveal>
      <p class="scene mono">Escena 04 — Herramientas</p>
      <h2 class="h2">Con qué trabajo.</h2>
    </div>
    <div class="tools__grid" data-reveal>${groups}
    </div>
  </section>`;
}

/* ---------- contacto ---------- */
function contactHTML(C) {
  const { CONTACT, SITE } = C;
  const chans = CONTACT.channels.map((c) => {
    const external = c.key !== "email";
    const btn = button({ label: c.label, href: c.href, detail: c.detail, cls: "btn--lg" }, { external });
    // «Copiar»: solo si hay link y valor a copiar (con «cambiar después» no hay nada que copiar). Va FUERA del <a>
    // y nace oculto: app.js lo muestra solo si el navegador puede copiar (sin JS no hay botones que no hagan nada).
    const copy = c.href && c.copy
      ? `<button class="copy" type="button" data-copy="${esc(c.copy)}" aria-label="Copiar ${esc(c.label)}: ${esc(c.copy)}" hidden><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg><span class="copy__t">Copiar</span></button>`
      : "";
    return `<div class="chan${copy ? " chan--split" : ""}">${btn}${copy}</div>`;
  }).join("\n        ");
  const meta = (t, label) => t ? `<span>${esc(t)}</span>` : `<span>${esc(label)} ${pend()}</span>`;
  return `
  <section class="section contact" id="contacto">
    <div class="wrap contact__inner" data-reveal>
      <p class="scene mono">Escena 05 — Contacto</p>
      <h2 class="contact__title">${esc(CONTACT.title).replace(/^(.*?)(\S+)$/, '$1<span class="accent">$2</span>')}</h2>
      <p class="contact__lead">${esc(CONTACT.lead)}</p>
      <div class="contact__actions">
        ${chans}
      </div>
      <p class="sr-only" id="copyStatus" role="status" aria-live="polite"></p>
      <p class="contact__meta mono">
        ${meta(SITE.location, "Ubicación")}
        <i aria-hidden="true">/</i>
        ${meta(CONTACT.availability, "Disponibilidad")}
      </p>
    </div>
  </section>`;
}

/* ---------- menú del celular: «índice de escenas» ---------- */
/* En el celular la barra no tiene lugar para los links de sección: un botón abre este índice a pantalla completa
   (un <dialog>: el foco queda adentro, Esc lo cierra). Las escenas son las mismas que anuncia cada sección («Escena 01 — Trabajo»)
   y abajo van los canales de contacto, que salen de CONTACT. Sin JS el botón no aparece y el sitio se recorre bajando. */
/* Dos páginas: la principal (index.html) y la de trabajos (trabajos.html). Cada enlace sabe en cuál vive cada sección:
   desde la otra página va con el nombre del archivo (index.html#sobre), desde la misma, solo con el ancla (#sobre). */
const SECTIONS = [["trabajos", "01", "Trabajos", "works"], ["sobre", "02", "Sobre mí", "home"], ["hago", "03", "Qué hago", "home"],
                  ["herramientas", "04", "Herramientas", "home"], ["contacto", "05", "Contacto", "both"]];
const hrefOf = (id, where, page) => id === "trabajos" ? "trabajos.html"
  : where === "both" || where === page ? `#${id}` : `index.html#${id}`;

function navHTML(C, page) {
  const { SITE } = C;
  const links = SECTIONS.filter(([id]) => id !== "contacto").map(([id, , t, where]) =>
    `<a href="${hrefOf(id, where, page)}"${id === "trabajos" && page === "works" ? ' aria-current="page"' : ""}>${esc(t)}</a>`).join("\n      ");
  return `
  <header class="nav" id="nav">
    <a class="nav__brand" href="${page === "home" ? "#top" : "index.html"}" aria-label="${esc(SITE.name)} — inicio"><i aria-hidden="true"></i>${esc(SITE.name)}</a>
    <nav class="nav__links" aria-label="Principal">
      ${links}
      <a class="btn btn--sm" href="#contacto">Escribime</a>
      <!-- celular: abre el índice de escenas. Nace oculto: app.js lo muestra si el navegador puede abrirlo -->
      <button class="nav__menu" type="button" aria-label="Abrir el menú" aria-expanded="false" aria-controls="menu" hidden><span class="nav__menu-ico" aria-hidden="true"><i></i><i></i></span></button>
    </nav>
  </header>`;
}

function menuHTML(C, page = "home") {
  const items = SECTIONS.map(([id, n, t, where], k) =>
    // el espacio entre los dos <span> no se ve (es un flex) pero hace que el lector de pantalla diga «Escena 01 Trabajos» y no «01Trabajos»
    `<li style="--i:${k}"><a href="${hrefOf(id, where, page)}"${id === "trabajos" && page === "works" ? ' aria-current="page"' : ""}><span class="menu__n mono">Escena ${n}</span> <span class="menu__t">${esc(t)}</span></a></li>`).join("\n        ");
  const chans = C.CONTACT.channels.filter((c) => c.href).map((c) => {
    const ext = c.key !== "email" ? ` target="_blank" rel="noopener"` : "";
    return `<a class="menu__chan" href="${esc(c.href)}"${ext}>${esc(c.label)}${arrow}</a>`;
  }).join("");
  return `
  <dialog class="menu" id="menu" aria-label="Menú">
    <div class="menu__bar" aria-hidden="true"></div>
    <div class="menu__top">
      <p class="menu__kicker mono">Índice de escenas</p>
      <button class="menu__close" type="button" aria-label="Cerrar el menú">✕</button>
    </div>
    <nav aria-label="Secciones">
      <ol class="menu__list">
        ${items}
      </ol>
    </nav>
    ${chans ? `<div class="menu__chans">${chans}</div>` : ""}
  </dialog>`;
}

/* ---------- página principal: «Lo mejor» (una muestra; todo está en trabajos.html) ---------- */
/* Una tarjeta por proyecto destacado (FEATURED): una sola imagen o video, el tipo, el año y el rol, y un link a ese proyecto
   en la página de trabajos. Un video de tapa se reproduce solo al pasar el mouse o con el foco (nadie lo arranca sin querer:
   no hace falta botón de pausa); en el celular, o sin JS, se ve su póster. En el celular las tarjetas se deslizan de costado. */
function featuredHTML(C, M, V) {
  const list = C.FEATURED || [];
  if (!list.length) return "";
  const cards = list.map((f, k) => {
    const p = C.PROJECTS.find((x) => x.slug === f.slug);
    if (!p) throw new Error(`FEATURED: no existe el proyecto "${f.slug}"`);
    const pos = f.pos || "50% 45%";
    const big = k === 0;   // la primera es la grande (en escritorio, dos columnas por dos filas)
    const isVideo = !!(C.VIDEOS && C.VIDEOS[f.cover]);
    let media;
    if (isVideo) {
      const v = videoOf(V, f.cover);
      media = `<img class="feat__img" src="assets/video/${v.poster}" width="${v.w}" height="${v.h}" alt="" loading="lazy" decoding="async">` +
        `<video class="feat__video" muted loop playsinline preload="none" data-src="assets/video/${v.file}" aria-hidden="true" tabindex="-1"></video>`;
    } else {
      media = img(C, M, f.cover, { sizes: big ? "(min-width: 900px) 60vw, 80vw" : "(min-width: 900px) 30vw, 80vw", cls: "feat__img" }).replace(/ alt="[^"]*"/, ' alt=""');
    }
    // en la tarjeta va solo el año (o «2023–2024»): la fecha completa está en el proyecto
    const years = [...new Set(String(p.year || "").match(/\d{4}/g) || [])];
    const meta = [p.kind, years.join("–")].filter(Boolean).join(" · ");
    return `
        <li class="feat${big ? " feat--big" : ""}${isVideo ? " feat--video" : ""}" style="--i:${k}">
          <a class="feat__link" href="trabajos.html#${esc(p.slug)}">
            <span class="feat__media" style="--pos:${esc(pos)}">${media}</span>
            <span class="feat__shade" aria-hidden="true"></span>
            <span class="feat__top" aria-hidden="true"><span class="feat__n mono">Esc. ${String(k + 1).padStart(2, "0")}</span>${isVideo ? `<span class="feat__rec mono"><i></i>Video</span>` : ""}</span>
            <span class="feat__body">
              <span class="feat__k mono">${esc(meta)}</span>
              <h3 class="feat__t">${esc(p.title)}</h3>
              <span class="feat__r">${p.roles.slice(0, 3).map(esc).join(" · ")}</span>
            </span>
            <span class="feat__bar" aria-hidden="true"></span>
          </a>
        </li>`;
  }).join("");
  const n = C.PROJECTS.length, nc = (C.CREDITS || []).length;
  const anyVideo = list.some((f) => C.VIDEOS && C.VIDEOS[f.cover]);
  // los videos de tapa se mueven solos más de 5 s: hace falta una forma de pausarlos (WCAG 2.2.2). Nace oculto: sin JS no hay videos.
  const toggle = anyVideo ? `
      <button class="feats__toggle mono" type="button" hidden><i aria-hidden="true"></i><span class="feats__toggle-t">Pausar videos</span></button>` : "";
  return `
  <section class="section wrap work" id="trabajo">
    <div class="work__head feats__head" data-reveal>
      <div>
        <p class="scene mono">Escena 01 — Trabajo</p>
        <h2 class="h2">Lo mejor.</h2>
        <p class="work__lead">Una selección. Todos los trabajos, con sus fotos, videos y créditos, están en <a class="link" href="trabajos.html">Trabajos</a>.</p>
      </div>${toggle}
    </div>
    <ol class="feats" data-reveal>${cards}
    </ol>
    <p class="feats__more" data-reveal>
      <a class="more" href="trabajos.html">
        <span class="more__bar" aria-hidden="true"></span>
        <span class="more__body">
          <span class="more__t">Ver todos los <em>trabajos</em></span>
          <span class="more__n mono">${n} proyectos · ${nc} créditos</span>
        </span>
        <span class="more__go" aria-hidden="true"><svg class="ico" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </a>
    </p>
  </section>`;
}

/* ---------- página de trabajos: encabezado ---------- */
function worksHeadHTML(C) {
  const cats = C.CATEGORIES.filter((c) => C.PROJECTS.some((p) => p.cat === c.key)).map((c) => c.label.toLowerCase());
  return `
      <div class="work__head works__head" id="top">
        <p class="scene mono">Trabajos</p>
        <h1 class="works__title">Lo que hice.</h1>
        <p class="work__lead">${esc(C.PROJECTS.length)} proyectos: ${esc(cats.join(" · "))}. Filtrá por tipo, deslizá cada galería y tocá una foto para verla grande. Al final, todos los créditos.</p>
      </div>`;
}

/* ---------- footer ---------- */
function footerHTML(C) {
  const { SITE, FOOTER } = C;
  return `
  <footer class="footer wrap">
    <p class="mono">© ${SITE.year} ${esc(SITE.name)}</p>
    <p class="mono">${esc(FOOTER.credits)}</p>
    <p class="mono">${FOOTER.photoCredits ? esc(FOOTER.photoCredits) : `Créditos de fotografía ${pend()}`}</p>
    <a class="mono footer__top" href="#top">Volver arriba ↑</a>
  </footer>`;
}

module.exports = { TOOL_ICONS, heroSet: heroSet, heroHTML, filtersHTML, projectsHTML, creditsHTML, featuredHTML, worksHeadHTML, navHTML, aboutHTML, servicesHTML, toolsHTML, contactHTML, footerHTML, menuHTML, variantsOf, videoOf, PEND };
