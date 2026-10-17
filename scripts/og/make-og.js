/* =============================================================
   make-og.js — genera assets/og.jpg (1200×630), la imagen que se ve al compartir el link
   -------------------------------------------------------------
   Uso:   npm run og
   Requiere un navegador real (para renderizar las tipografías):
          npm i --no-save puppeteer-core          (no queda en package.json: es solo para esto)
          Usa chrome-headless-shell (scripts/browser.js). NUNCA Edge: sus páginas aparecen en Alt+Tab. CHROME_PATH sirve para elegir otro Chrome.

   Lee de content.js y del manifest de imágenes (nombre, rótulo, bajada y foto del héroe). Por eso hay que correrlo:
     · después de `npm run optimize` (los archivos llevan hash en el nombre y cambian si cambia la foto o la calidad)
     · cuando cambie el nombre, el rótulo o la foto del héroe
   Lección: antes el nombre de la foto estaba escrito a mano en la plantilla, se desactualizó y la imagen salió SIN foto, sin ningún error.
   Este script falla si el archivo de la foto no existe y comprueba que la imagen quedó cargada.
   ============================================================= */
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const ROOT = path.resolve(__dirname, "..", "..");
const C = require(path.join(ROOT, "content.js"));
const manifestPath = path.join(ROOT, "assets", "img", "manifest.json");
const { resolveBrowser } = require("../browser");   // NUNCA Edge (sus páginas aparecen en Alt+Tab): ver scripts/browser.js

let puppeteer;
try { puppeteer = require("puppeteer-core"); }
catch { console.error("\n✗ Falta puppeteer-core. Instalalo sin tocar package.json:\n    npm i --no-save puppeteer-core\n"); process.exit(1); }
let BROWSER;
try { BROWSER = resolveBrowser(); } catch (e) { console.error("\n✗ " + e.message + "\n"); process.exit(1); }
if (!fs.existsSync(manifestPath)) { console.error("\n✗ Falta assets/img/manifest.json — corré primero: npm run optimize\n"); process.exit(1); }

const M = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const hero = M[C.HERO.image];
if (!hero) { console.error(`\n✗ La imagen del héroe "${C.HERO.image}" no está en el manifest.\n`); process.exit(1); }
const card = hero.variants.filter((v) => v.role === "card").pop();         // la más grande de tarjeta (1080 px)
const heroFile = path.join(ROOT, "assets", "img", card.file);
if (!fs.existsSync(heroFile)) { console.error(`\n✗ No existe ${card.file}. Corré: npm run optimize\n`); process.exit(1); }

const [first, ...rest] = C.SITE.name.split(" ");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const tokens = {
  HERO_URL: pathToFileURL(heroFile).href,
  HERO_POS: (C.HERO.focus && C.HERO.focus.d) || "50% 40%",   // el mismo encuadre que el sitio (HERO.focus)
  EYEBROW: esc(C.HERO.eyebrow),
  NAME_FIRST: esc(first),
  NAME_REST: esc(rest.join(" ")),
  TAGLINE: esc(C.HERO.title.join(" ")),
};
let html = fs.readFileSync(path.join(__dirname, "og.template.html"), "utf8");
for (const [k, v] of Object.entries(tokens)) html = html.split(`{{${k}}}`).join(v);
if (/\{\{[A-Z_]+\}\}/.test(html)) { console.error("\n✗ Quedaron {{TOKENS}} sin reemplazar en la plantilla.\n"); process.exit(1); }

const tmp = path.join(__dirname, ".og.tmp.html");
fs.writeFileSync(tmp, html);

(async () => {
  const browser = await puppeteer.launch({ ...BROWSER, args: ["--allow-file-access-from-files"] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(tmp).href, { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);
    const check = await page.evaluate(() => ({
      img: (() => { const i = document.querySelector(".img img"); return i.complete && i.naturalWidth > 0; })(),
      fonts: [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family),
    }));
    if (!check.img) throw new Error("la foto del héroe no cargó en la imagen (¿ruta o archivo roto?)");
    if (!check.fonts.includes("Instrument Serif")) throw new Error("no cargó la tipografía Instrument Serif (¿sin conexión a Google Fonts?)");
    const out = path.join(ROOT, "assets", "og.jpg");
    await page.screenshot({ path: out, type: "jpeg", quality: 86 });
    console.log(`\n✓ assets/og.jpg  (${(fs.statSync(out).size / 1024).toFixed(0)} KB)  · foto: ${card.file} · fuentes: ${[...new Set(check.fonts)].join(", ")}\n`);
  } finally { await browser.close(); fs.rmSync(tmp, { force: true }); }
})().catch((e) => { console.error("\n✗ " + e.message + "\n"); process.exit(1); });
