/* =============================================================
   build.js — pre-renderiza el sitio y arma dist/ (lo ÚNICO que se publica)
   -------------------------------------------------------------
   Uso:   npm run build                 (publicación: indexable por Google)
          npm run build:revision        (para MOSTRÁRSELO A LA CLIENTA antes de publicar: NO se indexa)
          SITE_URL=https://ameliefrum.com npm run build     (con dominio)

   El modo revisión agrega <meta name="robots" content="noindex">, el header X-Robots-Tag y un robots.txt que prohíbe todo:
   un link de prueba no tiene que aparecer en Google con el sitio sin terminar. NO es una protección con clave: quien tenga
   el link lo puede abrir. Para publicar de verdad: volver a compilar con `npm run build`.

   1) Lee content.js + assets/img/manifest.json (lo genera: npm run optimize)
   2) Rellena index.html (marcadores <!--BUILD:x--> y {{TOKENS}})
   3) Copia SOLO lo necesario a dist/ — nunca contenido/ ni _analisis/
   4) Imprime el peso real y cuántos «cambiar después» quedan

   Sin SITE_URL no se emiten canonical / og:url / og:image / JSON-LD con URL
   (necesitan una URL absoluta): queda un aviso y un «cambiar después».
   ============================================================= */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { esc } = require("./lib");
const T = require("./templates");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const C = require(path.join(ROOT, "content.js"));
const SITE_URL = (process.env.SITE_URL || "").replace(/\/+$/, "");
const REVISION = process.argv.includes("--revision");   // build para mostrar: no indexable

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const hash = (s) => crypto.createHash("md5").update(s).digest("hex").slice(0, 8);
const kb = (n) => (n / 1024).toFixed(0) + " KB";

/* ---- 0) validaciones: que no se publique algo roto ---- */
const manifestPath = path.join(ROOT, "assets", "img", "manifest.json");
if (!fs.existsSync(manifestPath)) { console.error("\n✗ Falta assets/img/manifest.json — corré primero: npm run optimize\n"); process.exit(1); }
const M = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
// videos: manifest aparte (npm run optimize:video). Un frame puede ser una foto (IMAGES) o un video (VIDEOS).
const VIDEOS = C.VIDEOS || {};
const videoManifestPath = path.join(ROOT, "assets", "video", "manifest.json");
const V = fs.existsSync(videoManifestPath) ? JSON.parse(fs.readFileSync(videoManifestPath, "utf8")) : {};
// también las tapas de «Lo mejor» (FEATURED): un video puede usarse SOLO ahí (el bucle de «Cuando el sol») y sin esto no viajaba (404)
const featuredCovers = (C.FEATURED || []).map((f) => f.cover);
const usedVideos = new Set([C.HERO.video, ...C.PROJECTS.flatMap((p) => [...p.frames.filter((id) => VIDEOS[id]), p.watch && p.watch.video]),
                            ...(C.CREDITS || []).map((c) => c.play), ...featuredCovers.filter((id) => VIDEOS[id])].filter(Boolean));
for (const id of featuredCovers) if (!VIDEOS[id] && !C.IMAGES[id]) throw new Error(`FEATURED usa la tapa "${id}", que no está ni en IMAGES ni en VIDEOS`);
for (const id of usedVideos) {
  if (!VIDEOS[id]) throw new Error(`content.js usa el video "${id}" pero no está declarado en VIDEOS`);
  if (!V[id]) throw new Error(`El video "${id}" no está optimizado — corré: npm run optimize:video`);
  if (!VIDEOS[id].alt || VIDEOS[id].alt.length < 15) throw new Error(`El video "${id}" no tiene un alt descriptivo`);
}
const used = new Set([C.HERO.image, C.ABOUT.photo, ...C.PROJECTS.flatMap((p) => p.frames.filter((id) => !VIDEOS[id])), ...featuredCovers.filter((id) => !VIDEOS[id])]);
for (const id of used) {
  if (!C.IMAGES[id]) throw new Error(`content.js usa la imagen "${id}" pero no está declarada en IMAGES`);
  if (!M[id]) throw new Error(`La imagen "${id}" no está optimizada — corré: npm run optimize`);
  if (!C.IMAGES[id].alt || C.IMAGES[id].alt.length < 15) throw new Error(`La imagen "${id}" no tiene un alt descriptivo`);
}
const catKeys = new Set(C.CATEGORIES.map((c) => c.key));
for (const p of C.PROJECTS) if (!catKeys.has(p.cat)) throw new Error(`El proyecto "${p.slug}" tiene cat "${p.cat}", que no está en CATEGORIES`);
const slugs = C.PROJECTS.map((p) => p.slug);
if (new Set(slugs).size !== slugs.length) throw new Error("Hay slugs de proyecto repetidos");
// un ícono mal escrito no rompe nada (va el genérico), pero se avisa: si no, nadie se entera
const badIcons = T.TOOL_ICONS ? C.TOOLS.flatMap((g) => g.items).filter((t) => t.icon && !T.TOOL_ICONS[t.icon]) : [];
if (badIcons.length) console.warn(`  ⚠ Herramientas con un ícono que no existe (se muestra el genérico): ${badIcons.map((t) => `${t.name} → "${t.icon}"`).join(", ")}\n    Íconos disponibles: ${Object.keys(T.TOOL_ICONS).join(", ")}`);

/* ---- 1) SEO y compartir ---- */
const WORKS_DESC = `Trabajos de ${C.SITE.name}: ${C.PROJECTS.length} proyectos (cortos, videoclips, eventos, streaming y fotografía) y ${(C.CREDITS || []).length} créditos con su rol.`;
const PAGES = {
  home:  { file: "index.html",    url: "/",              title: `${C.SITE.name} — ${C.SITE.role}`, desc: C.SITE.description },
  works: { file: "trabajos.html", url: "/trabajos.html", title: `Trabajos — ${C.SITE.name}`,       desc: WORKS_DESC },
};
function seoHTML(page = "home") {
  const { SITE, HERO } = C;
  const P = PAGES[page];
  const { vs } = T.variantsOf(M, HERO.image);
  const og = fs.existsSync(path.join(ROOT, "assets", "og.jpg"));
  const lines = [
    ...(REVISION ? [`<meta name="robots" content="noindex, nofollow" />`] : []),
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="${esc(SITE.lang.replace("-", "_"))}" />`,
    `<meta property="og:site_name" content="${esc(SITE.name)}" />`,
    `<meta property="og:title" content="${esc(P.title)}" />`,
    `<meta property="og:description" content="${esc(P.desc)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ];
  if (SITE_URL) {
    lines.push(`<link rel="canonical" href="${SITE_URL}${P.url}" />`, `<meta property="og:url" content="${SITE_URL}${P.url}" />`);
    if (og) lines.push(`<meta property="og:image" content="${SITE_URL}/assets/og.jpg" />`,
                       `<meta property="og:image:width" content="1200" />`, `<meta property="og:image:height" content="630" />`,
                       `<meta property="og:image:alt" content="${esc(C.IMAGES[HERO.image].alt)}" />`);
    const ig = (C.CONTACT.channels.find((c) => c.key === "instagram") || {}).href;   // sale del contenido: no se duplica el dato
    const ld = { "@context": "https://schema.org", "@type": "Person", name: SITE.name,
                 jobTitle: SITE.role, url: SITE_URL + "/",
                 ...(ig ? { sameAs: [ig] } : {}),
                 ...(SITE.location ? { homeLocation: { "@type": "Place", name: SITE.location } } : {}) };
    if (page === "home") lines.push(`<script type="application/ld+json">${JSON.stringify(ld)}</script>`);
  } else {
    lines.push(`<!-- ${T.PEND.toUpperCase()}: canonical, og:url, og:image y JSON-LD necesitan el dominio. Compilá con SITE_URL=https://… -->`);
  }
  return lines.join("\n  ");
}

function preloadHTML() {
  const vs = T.heroSet(T.variantsOf(M, C.HERO.image).vs);
  const srcset = vs.map((v) => `assets/img/${v.file} ${v.w}w`).join(", ");
  return `<link rel="preload" as="image" imagesrcset="${srcset}" imagesizes="(min-width: 900px) 50vw, 100vw" fetchpriority="high" />`;
}

/* ---- 2) armar el HTML ---- */
const css = read("assets/css/site.css"), js = read("assets/js/app.js");
const vars = {
  SITE_LANG: esc(C.SITE.lang), SITE_NAME: esc(C.SITE.name), SITE_ROLE: esc(C.SITE.role), SITE_DESC: esc(C.SITE.description),
  V_CSS: hash(css), V_JS: hash(js),
};
vars.WORKS_DESC = esc(WORKS_DESC);
const shared = { contact: T.contactHTML(C), footer: T.footerHTML(C) };
const pageBlocks = {
  home: { ...shared, seo: seoHTML("home"), preload: preloadHTML(), nav: T.navHTML(C, "home"), menu: T.menuHTML(C, "home"),
          hero: T.heroHTML(C, M, V), featured: T.featuredHTML(C, M, V), about: T.aboutHTML(C, M), services: T.servicesHTML(C), tools: T.toolsHTML(C) },
  works: { ...shared, seo: seoHTML("works"), nav: T.navHTML(C, "works"), menu: T.menuHTML(C, "works"),
           workshead: T.worksHeadHTML(C), filters: T.filtersHTML(C), projects: T.projectsHTML(C, M, V), credits: T.creditsHTML(C, V) },
};
const render = (page) => {
  let h = read(PAGES[page].file);
  for (const [k, v] of Object.entries(pageBlocks[page])) {
    const marker = `<!--BUILD:${k}-->`;
    if (!h.includes(marker)) throw new Error(`${PAGES[page].file} no tiene el marcador ${marker}`);
    h = h.replace(marker, () => v);
  }
  h = h.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (!(k in vars)) throw new Error(`Token {{${k}}} sin valor en build.js`);
    return vars[k];
  });
  if (h.match(/\{\{|<!--BUILD:/)) throw new Error(`Quedaron marcadores sin reemplazar en ${PAGES[page].file}`);
  return h;
};
const html = render("home"), worksHtml = render("works");

/* ---- 3) dist/ ---- */
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, "assets", "css"), { recursive: true });
fs.mkdirSync(path.join(DIST, "assets", "js"), { recursive: true });
fs.mkdirSync(path.join(DIST, "assets", "img"), { recursive: true });
fs.mkdirSync(path.join(DIST, "assets", "video"), { recursive: true });
fs.writeFileSync(path.join(DIST, "index.html"), html);
fs.writeFileSync(path.join(DIST, "trabajos.html"), worksHtml);
// El CSS publicado no lleva comentarios de desarrollo (mencionan carpetas y notas internas); la fuente los conserva.
fs.writeFileSync(path.join(DIST, "assets", "css", "site.css"), css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\n[ \t]*\n+/g, "\n"));
fs.writeFileSync(path.join(DIST, "assets", "js", "app.js"), js);
// Solo se copia lo que el manifest referencia: un .webp suelto (de una corrida vieja) no viaja al deploy.
const keep = new Set(Object.values(M).flatMap((m) => m.variants.map((v) => v.file)));
const orphans = [];
for (const f of fs.readdirSync(path.join(ROOT, "assets", "img"))) {
  if (!f.endsWith(".webp")) continue;
  if (keep.has(f)) fs.copyFileSync(path.join(ROOT, "assets", "img", f), path.join(DIST, "assets", "img", f));
  else orphans.push(f);
}
if (orphans.length) console.warn(`  ⚠ ${orphans.length} .webp sin usar en assets/img (no se publican): corré npm run optimize para limpiarlos`);
if (fs.existsSync(path.join(ROOT, "assets", "og.jpg"))) fs.copyFileSync(path.join(ROOT, "assets", "og.jpg"), path.join(DIST, "assets", "og.jpg"));
// videos: solo los que el sitio usa (con su póster)
let videoBytes = 0;
for (const id of usedVideos) for (const f of [V[id].file, V[id].poster]) {
  fs.copyFileSync(path.join(ROOT, "assets", "video", f), path.join(DIST, "assets", "video", f));
  videoBytes += fs.statSync(path.join(ROOT, "assets", "video", f)).size;
}

// Cache: largo solo donde la URL cambia con el contenido (img con hash en el nombre; css/js con ?v=hash)
fs.writeFileSync(path.join(DIST, "_headers"),
`/assets/img/*
  Cache-Control: public, max-age=31536000, immutable
/assets/video/*
  Cache-Control: public, max-age=31536000, immutable
/assets/css/*
  Cache-Control: public, max-age=31536000, immutable
/assets/js/*
  Cache-Control: public, max-age=31536000, immutable
/assets/og.jpg
  Cache-Control: public, max-age=86400
/index.html
  Cache-Control: public, max-age=0, must-revalidate
/trabajos.html
  Cache-Control: public, max-age=0, must-revalidate
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin${REVISION ? "\n  X-Robots-Tag: noindex, nofollow" : ""}
`);
fs.writeFileSync(path.join(DIST, "robots.txt"), REVISION ? "User-agent: *\nDisallow: /\n" : "User-agent: *\nAllow: /\n");

/* ---- 4) resumen ---- */
function dirSize(d) { let n = 0; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); n += e.isDirectory() ? dirSize(p) : fs.statSync(p).size; } return n; }
const heroVs = T.variantsOf(M, C.HERO.image).vs.filter((v) => v.role === "card");   // lo que baja un celular/escritorio normal; en retina baja además la "big"
const heroBig = heroVs[heroVs.length - 1];
const first = Buffer.byteLength(html) + Buffer.byteLength(css) + Buffer.byteLength(js) + heroBig.bytes;
/* Dos conteos de pendientes (el gate de entrega es que ambos den 0):
   1) visibles: lo que se ve en la página (incluye los datos en null, que no tienen texto en la fuente)
   2) marcadores en el código: comentarios «CAMBIAR DESPUÉS:» (mayúsculas + dos puntos) en datos provisorios
   Los dos usan "despu.{1,2}s" y no "despu[eé]s": con la consola de Windows sin locale, la é
   ocupa 2 bytes y el corchete NO la encuentra (da un falso cero). */
const pendOf = (h) => (h.replace(/<!--[\s\S]*?-->/g, "").match(/cambiar despu.{1,2}s/gi) || []).length;
const pendHome = pendOf(html), pendWorks = pendOf(worksHtml), pendHtml = pendHome + pendWorks;
const pendSrc = ["content.js", "index.html", "trabajos.html", "scripts/templates.js"].reduce((n, f) => n + (read(f).match(/CAMBIAR DESPU.{1,2}S:/g) || []).length, 0);

console.log(`\n✓ Build listo — ${REVISION ? "MODO REVISIÓN (no indexable: para mostrar, no para publicar)" : "MODO PUBLICACIÓN (indexable)"}`);
console.log(`  ${C.PROJECTS.length} proyectos · ${used.size} imágenes · ${usedVideos.size} videos (${(videoBytes / 1048576).toFixed(1)} MB) · dist/ = ${(dirSize(DIST) / 1048576).toFixed(2)} MB`);
console.log(`  Primer pantallazo (HTML + CSS + JS + hero ${heroBig.w}w): ${kb(first)}  (sin tipografías de Google Fonts)`);
if (C.HERO.video) console.log(`  + video de portada: ${kb(V[C.HERO.video].bytes)} (lo arranca app.js después de la foto; no con movimiento reducido ni ahorro de datos)`);
console.log(`  Pendientes visibles en las páginas («cambiar después»): ${pendHtml}  (principal ${pendHome} · trabajos ${pendWorks}; el de los créditos de foto va en el pie de las dos)`);
console.log(`  Marcadores en el código («CAMBIAR DESPUÉS:»):          ${pendSrc}`);
console.log(`  → para PUBLICAR los dos tienen que dar 0 (detalle: _analisis/pendientes.md)`);
if (!SITE_URL) console.log(`  ⚠ Sin SITE_URL: no se emitieron canonical, og:url, og:image ni JSON-LD`);
if (!fs.existsSync(path.join(ROOT, "assets", "og.jpg"))) console.log(`  ⚠ Falta assets/og.jpg (imagen para compartir, 1200×630)`);
console.log("");
