/* =============================================================
   lib.js — helpers compartidos por optimize-img.js y build.js
   ============================================================= */
const fs = require("fs");
const path = require("path");

const nfc = (s) => s.normalize("NFC");

/* Resuelve una carpeta de contenido/ por el COMIENZO del nombre de cada tramo, A CUALQUIER PROFUNDIDAD.
   "PRODUCCIONES CINEMATOGRÁFICAS_/_Brujas"  ->  ruta real completa, esté donde esté.
   A cualquier profundidad porque el material se reorganiza: el 2026-10-14 todo pasó a estar dentro de
   «PORTFOLIO CHUNI._/PRODUCCIÓN_/…» y la búsqueda desde la raíz dejó de encontrar las 35 fotos del sitio.
   Falla con un mensaje claro si no hay exactamente una coincidencia (nunca elige una al azar). */
function resolveDir(base, spec) {
  const segs = spec.split("/").map(nfc);
  const hits = [];
  const walk = (dir, trail) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const p = path.join(dir, e.name), t = [...trail, nfc(e.name)];
      if (t.length >= segs.length && segs.every((s, i) => t[t.length - segs.length + i].startsWith(s))) hits.push(p);
      walk(p, t);
    }
  };
  walk(base, []);
  if (hits.length !== 1) {
    throw new Error(`Carpeta "${spec}" dentro de ${base}: ${hits.length} coincidencias (se esperaba 1)` +
      (hits.length ? ":\n  " + hits.map((h) => path.relative(base, h)).join("\n  ") : ""));
  }
  return hits[0];
}

/* Ruta real de una imagen declarada en content.js (grupo + nombre de archivo). */
function resolveImage(contentDir, groups, img) {
  if (!groups[img.g]) throw new Error(`Grupo desconocido: "${img.g}"`);
  const dir = resolveDir(contentDir, groups[img.g]);
  const hit = fs.readdirSync(dir).find((n) => nfc(n) === nfc(img.f));
  if (!hit) throw new Error(`No existe "${img.f}" en ${dir}`);
  return path.join(dir, hit);
}

const esc = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

module.exports = { resolveDir, resolveImage, esc, nfc };
