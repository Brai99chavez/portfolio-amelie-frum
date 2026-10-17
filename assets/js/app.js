/* =============================================================
   app.js — interactividad mínima (el contenido NO depende de esto:
   la página está pre-renderizada y se ve completa sin JS)
   ============================================================= */
(() => {
  "use strict";
  window.__app = true;   // avisa al inline del <head> que el JS cargó (ver index.html)

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* nav: fondo al scrollear */
  const nav = document.getElementById("nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* revelado al scroll. Al revelarse las herramientas, cada ícono «hace lo suyo» una vez (.is-play; ver site.css) */
  const els = document.querySelectorAll("[data-reveal]");
  const revealed = (e) => {
    e.classList.add("is-in");
    if (!reduce) e.querySelectorAll(".tool").forEach((t) => t.classList.add("is-play"));
  };
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(revealed);
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { revealed(en.target); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    els.forEach((e) => io.observe(e));
  }

  /* íconos de herramientas: al pasar el mouse se repite su animación (se saca y se vuelve a poner la clase, sin demora) */
  if (!reduce) document.querySelectorAll(".tool").forEach((t) => {
    t.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;
      t.style.setProperty("--d", "0s");
      t.classList.remove("is-play"); void t.offsetWidth; t.classList.add("is-play");
    });
  });

  /* visor de la portada: código de tiempo a 24 cuadros por segundo desde 01:00:00:00 (así arranca un master).
     Corre solo mientras la portada está a la vista y la pestaña abierta; con movimiento reducido queda quieto. */
  const tc = document.querySelector("[data-tc]");
  const hero = document.querySelector(".hero");
  if (tc && hero && !reduce) {
    const two = (n) => String(n).padStart(2, "0");
    let acc = 0, last = 0, raf = 0, shown = -1, onScreen = true;
    const tick = (now) => {
      if (last) acc += now - last;
      last = now;
      const f = Math.floor(acc / (1000 / 24));
      if (f !== shown) {
        shown = f;
        const s = Math.floor(f / 24) + 3600;
        tc.textContent = `${two(Math.floor(s / 3600))}:${two(Math.floor(s / 60) % 60)}:${two(s % 60)}:${two(f % 24)}`;
      }
      raf = requestAnimationFrame(tick);
    };
    const run = (on) => {
      if (on && !raf) { last = 0; raf = requestAnimationFrame(tick); }
      else if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
    };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; run(onScreen && !document.hidden); }).observe(hero);
    }
    document.addEventListener("visibilitychange", () => run(onScreen && !document.hidden));
    run(!document.hidden);
  }

  /* videos: mudos y en bucle. Se cargan recién cuando hace falta (data-src → src) y se pausan fuera de pantalla.
     Con movimiento reducido o «ahorro de datos» no arrancan solos (queda la foto / el póster) y el botón los reproduce. */
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const autoplayOK = !reduce && !saveData;
  const playVideo = (v) => {
    if (!v.getAttribute("src") && v.dataset.src) v.src = v.dataset.src;
    const pr = v.play();
    if (pr && pr.catch) pr.catch(() => {});
  };
  const watchVisible = (el, cb, threshold) => {
    if ("IntersectionObserver" in window) new IntersectionObserver(([en]) => cb(en.isIntersecting), { threshold }).observe(el);
    else cb(true);
  };

  // portada: el video aparece sobre la foto cuando ya está reproduciendo. El «● REC» del visor es su botón de pausa.
  const heroVideo = document.querySelector(".hero__video"), recBtn = document.querySelector(".vf__btn");
  if (heroVideo && recBtn && hero) {
    let userPaused = !autoplayOK;
    const staticRec = document.querySelector(".vf__rec--static");
    if (staticRec) staticRec.hidden = true;
    recBtn.hidden = false;
    const state = recBtn.querySelector(".vf__state");
    const sync = () => {
      const paused = heroVideo.paused;
      recBtn.classList.toggle("is-paused", paused);
      recBtn.setAttribute("aria-label", paused ? "Reproducir el video de fondo" : "Pausar el video de fondo");
      state.textContent = paused ? "PAUSA" : "REC";
    };
    heroVideo.addEventListener("playing", () => { heroVideo.classList.add("is-playing"); sync(); });
    heroVideo.addEventListener("pause", sync);
    recBtn.addEventListener("click", () => {
      if (heroVideo.paused) { userPaused = false; playVideo(heroVideo); } else { userPaused = true; heroVideo.pause(); }
    });
    // recién cuando terminó de cargar la página: que el video no le dispute la red a la foto de portada (que es lo que se ve primero)
    const start = () => watchVisible(hero, (on) => { if (on && !userPaused) playVideo(heroVideo); else if (!on && !heroVideo.paused) heroVideo.pause(); }, 0);
    if (document.readyState === "complete") start(); else window.addEventListener("load", start, { once: true });
    sync();
  }

  // galerías: cada video arranca cuando se ve por lo menos la mitad, y se pausa al salir
  document.querySelectorAll(".frame--video").forEach((f) => {
    const v = f.querySelector("video"), b = f.querySelector(".frame__play");
    if (!v || !b) return;
    const what = b.getAttribute("aria-label").replace(/^Pausar el /, "");   // «video 1 de 8»
    let userPaused = !autoplayOK;
    b.hidden = false;
    const sync = () => {
      b.classList.toggle("is-paused", v.paused);
      b.setAttribute("aria-label", (v.paused ? "Reproducir el " : "Pausar el ") + what);
    };
    v.addEventListener("play", sync);
    v.addEventListener("pause", sync);
    const toggle = () => { if (v.paused) { userPaused = false; playVideo(v); } else { userPaused = true; v.pause(); } };
    b.addEventListener("click", toggle);
    v.addEventListener("click", toggle);
    watchVisible(f, (on) => { if (on && !userPaused) playVideo(v); else if (!on && !v.paused) v.pause(); }, 0.5);
    sync();
  });

  /* «Lo mejor» (página principal): las tapas en video se reproducen solas, mudas, cuando la tarjeta se ve (por lo menos 60 %):
     en pantallas con mouse solo la grande (las demás, al pasar el mouse o con el foco); en el celular, la que está a la vista.
     El botón del encabezado las pausa (WCAG 2.2.2: se mueven más de 5 s). Con movimiento reducido o ahorro de datos no arrancan
     solas (queda el póster) y el botón ofrece «Reproducir». Cada video se baja recién cuando le toca reproducirse. */
  const featCards = [...document.querySelectorAll(".feat")].filter((c) => c.querySelector(".feat__video"));
  const featToggle = document.querySelector(".feats__toggle");
  if (featCards.length) {
    let auto = autoplayOK;                                     // ¿se reproducen solas las que se ven?
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const st = new Map(featCards.map((c) => [c, { seen: false, hover: false }]));
    const want = (c) => { const s = st.get(c); return (s.hover && !reduce) || (auto && s.seen && (!fine.matches || c.classList.contains("feat--big"))); };
    const sync = (c) => {
      const v = c.querySelector(".feat__video");
      if (want(c)) { c.classList.add("is-playing"); playVideo(v); } else { c.classList.remove("is-playing"); v.pause(); }
    };
    const label = () => {
      if (!featToggle) return;
      featToggle.classList.toggle("is-paused", !auto);
      featToggle.querySelector(".feats__toggle-t").textContent = auto ? "Pausar videos" : "Reproducir videos";
    };
    featCards.forEach((c) => {
      const link = c.querySelector(".feat__link");
      link.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { st.get(c).hover = true; sync(c); } });
      link.addEventListener("pointerleave", () => { st.get(c).hover = false; sync(c); });
      link.addEventListener("focus", () => { st.get(c).hover = true; sync(c); });
      link.addEventListener("blur", () => { st.get(c).hover = false; sync(c); });
      // la grande mide casi una pantalla y nunca llega al 60 % visible: a ella le alcanza con el 30 %
      watchVisible(c, (on) => { st.get(c).seen = on; sync(c); }, c.classList.contains("feat--big") ? 0.3 : 0.6);
    });
    if (featToggle) {
      featToggle.hidden = false;
      featToggle.addEventListener("click", () => { auto = !auto; label(); featCards.forEach(sync); });
    }
    fine.addEventListener("change", () => featCards.forEach(sync));
    label();
  }

  /* visor de video (la microficción, con sonido): los links con data-player abren el archivo en un <dialog>.
     Sin JS (o sin soporte de <dialog>) el link abre el video en el navegador. */
  const player = document.getElementById("player");
  if (player && typeof player.showModal === "function") {
    const pv = player.querySelector("video"), pc = player.querySelector(".player__cap");
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[data-player]");
      if (!a) return;
      e.preventDefault();
      pv.poster = a.dataset.poster || "";
      pv.src = a.getAttribute("href");
      pc.textContent = a.dataset.title || "";
      if (a.dataset.w && a.dataset.h) player.style.setProperty("--ar", (+a.dataset.w / +a.dataset.h).toFixed(4));
      player.showModal();
      document.documentElement.classList.add("is-locked");
      playVideo(pv);   // lo pidió la persona con un clic: arranca con sonido
    });
    player.querySelector(".player__close").addEventListener("click", () => player.close());
    player.addEventListener("click", (e) => { if (e.target === player) player.close(); });
    player.addEventListener("close", () => {
      pv.pause(); pv.removeAttribute("src"); pv.load();   // corta la descarga al cerrar
      document.documentElement.classList.remove("is-locked");
    });
  }

  /* visor en el celular: cuadro completo solo si entra entre el menú y el rótulo sin tocarlo (si no, queda la fila de arriba).
     Se mide con offsetTop (ignora el transform de la animación de entrada); en escritorio lo resuelve el CSS. */
  const vf = document.querySelector(".hero__vf"), eyebrow = document.querySelector(".hero__inner .eyebrow");
  const wide = window.matchMedia("(min-width: 900px), (orientation: landscape) and (max-height: 500px)");   // el mismo corte que el CSS: escritorio o celular acostado
  const fitVf = () => {
    if (!vf || !eyebrow) return;
    if (wide.matches) { vf.style.height = ""; vf.classList.add("is-framed"); return; }
    const room = eyebrow.offsetTop - vf.offsetTop - 18;
    vf.classList.toggle("is-framed", room >= 90);
    vf.style.height = room >= 90 ? `${Math.min(230, room)}px` : "";
  };
  fitVf();
  window.addEventListener("resize", fitVf);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitVf);

  /* claqueta: cuánto se abre el brazo. Se fija la apertura en la punta (~64 px), no el ángulo: con un ángulo fijo, en una
     pantalla ancha la punta subiría cientos de píxeles y taparía lo de arriba. */
  const slates = document.querySelectorAll(".slate");
  const openSlate = (s) => {
    const w = s.offsetWidth || 1;
    s.style.setProperty("--open", `${-Math.min(14, Math.max(2.5, Math.atan(64 / w) * 180 / Math.PI)).toFixed(2)}deg`);
  };
  slates.forEach(openSlate);
  if ("ResizeObserver" in window) { const ro = new ResizeObserver((es) => es.forEach((e) => openSlate(e.target))); slates.forEach((s) => ro.observe(s)); }

  /* filtro de trabajos: sin JS la barra queda oculta (atributo hidden) y se ven todos los proyectos.
     El estado va en la URL (?cat=ficcion) para poder compartir un filtro; usa replaceState, no ensucia el historial. */
  const bar = document.getElementById("filterbar");
  if (bar) {
    const chips = [...bar.querySelectorAll("[data-filter]")];
    const projects = [...document.querySelectorAll(".project[data-cat]")];
    const status = document.getElementById("filtersStatus");
    const valid = new Set(chips.map((c) => c.dataset.filter));
    const labelOf = (key) => (chips.find((c) => c.dataset.filter === key) || {}).firstChild?.textContent || "";

    const apply = (key, { push = true, scroll = false } = {}) => {
      if (!valid.has(key)) key = "todos";
      let shown = 0, first = null;
      projects.forEach((p) => {
        const on = key === "todos" || p.dataset.cat === key;
        p.hidden = !on;
        if (on) { shown++; first = first || p; }
      });
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.filter === key)));
      status.textContent = key === "todos"
        ? `Mostrando los ${projects.length} proyectos`
        : `Mostrando ${shown} de ${projects.length} proyectos: ${labelOf(key)}`;
      if (push) {
        const u = new URL(location.href);
        if (key === "todos") u.searchParams.delete("cat"); else u.searchParams.set("cat", key);
        history.replaceState(null, "", u);
      }
      // si ya estás más abajo del comienzo de Trabajo, llevar al primer proyecto que quedó a la vista
      const work = document.getElementById("trabajo");
      if (scroll && first && work && work.getBoundingClientRect().top < 0) first.scrollIntoView({ block: "start" });
    };

    bar.hidden = false;
    chips.forEach((c) => c.addEventListener("click", () => apply(c.dataset.filter, { scroll: true })));
    apply(new URLSearchParams(location.search).get("cat") || "todos", { push: false });

    // un link a un proyecto (#sol) que el filtro dejó oculto: mostrar todo y llevar hasta él
    const reveal = () => {
      const t = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (t && t.hidden) { apply("todos"); t.scrollIntoView({ block: "start" }); }
    };
    window.addEventListener("hashchange", reveal);
    reveal();
  }

  /* controles de cada galería (flechas, «01 / 06», barra de avance). Nacen ocultos: solo se muestran si la tira de verdad
     desborda (con pocas fotos en una pantalla ancha no hay nada que recorrer). Se recalculan al cambiar el tamaño. */
  document.querySelectorAll(".gallery").forEach((g) => {
    const rail = g.querySelector(".rail"), bar = g.querySelector(".rail__bar");
    if (!rail || !bar) return;
    const prev = bar.querySelector(".rail__prev"), next = bar.querySelector(".rail__next");
    const count = bar.querySelector(".rail__count"), fill = bar.querySelector(".rail__track i");
    const frames = [...rail.querySelectorAll(".frame")];
    const clips = [...bar.querySelectorAll(".rail__clips b")];
    const pad = (n) => String(n).padStart(2, "0");
    const max = () => rail.scrollWidth - rail.clientWidth;

    const update = () => {
      const can = max() > 4;
      bar.hidden = !can;
      if (!can) return;
      const x = rail.scrollLeft, rr = rail.getBoundingClientRect(), left = rr.left;
      // primer fotograma que se ve (por lo menos la mitad) desde el borde izquierdo de la tira
      let first = frames.findIndex((f) => f.getBoundingClientRect().right - left > f.offsetWidth * 0.5);
      if (first < 0) first = frames.length - 1;
      if (x >= max() - 4) first = frames.length - 1;     // al final, el contador llega a N / N
      count.textContent = `${pad(first + 1)} / ${pad(frames.length)}`;
      fill.style.setProperty("--w", `${Math.max(0, Math.min(100, (x / max()) * 100))}%`);   // el cabezal de reproducción
      // en la línea de tiempo se encienden los clips de las fotos que se ven (por lo menos la mitad)
      frames.forEach((f, k) => {
        const b = f.getBoundingClientRect();
        if (clips[k]) clips[k].classList.toggle("is-on", Math.min(b.right, rr.right) - Math.max(b.left, rr.left) > b.width * 0.5);
      });
      prev.disabled = x <= 4;
      next.disabled = x >= max() - 4;
    };
    // cada clip mide lo que mide su foto en la tira (el ancho real depende de la pantalla)
    const sizeClips = () => frames.forEach((f, k) => { if (clips[k] && f.offsetWidth) clips[k].style.flexGrow = f.offsetWidth; });
    const relayout = () => { sizeClips(); update(); };
    const go = (dir) => rail.scrollBy({ left: dir * rail.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
    prev.addEventListener("click", () => go(-1));
    next.addEventListener("click", () => go(1));
    rail.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
    if ("ResizeObserver" in window) new ResizeObserver(relayout).observe(rail); else window.addEventListener("resize", relayout);
    window.addEventListener("load", relayout);
    relayout();
  });

  /* botón «Copiar» del contacto: copia el dato, avisa con el propio botón y con un aviso para lectores de pantalla.
     Nace oculto: solo se muestra si el navegador puede copiar. */
  const copyStatus = document.getElementById("copyStatus");
  const canCopy = !!(navigator.clipboard && window.isSecureContext) || (document.queryCommandSupported && document.queryCommandSupported("copy"));
  document.querySelectorAll(".copy").forEach((b) => {
    if (!canCopy) return;
    b.hidden = false;
    const label = b.querySelector(".copy__t"), original = label.textContent;
    let t;
    b.addEventListener("click", async () => {
      const text = b.dataset.copy;
      let ok = false;
      try { await navigator.clipboard.writeText(text); ok = true; }
      catch {
        const ta = document.createElement("textarea");          // plan B (http o navegadores viejos)
        ta.value = text; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;opacity:0;top:0;left:0";
        document.body.appendChild(ta); ta.select();
        try { ok = document.execCommand("copy"); } catch { ok = false; }
        ta.remove();
      }
      clearTimeout(t);
      label.textContent = ok ? "¡Copiado!" : "No se pudo";
      b.classList.toggle("is-done", ok);
      if (copyStatus) copyStatus.textContent = ok ? `Copiado: ${text}` : "No se pudo copiar";
      t = setTimeout(() => { label.textContent = original; b.classList.remove("is-done"); }, 1800);
    });
  });

  /* menú del celular («índice de escenas»): un <dialog> modal, así el foco queda adentro y Esc lo cierra.
     Sin soporte de <dialog> (o sin JS) el botón no aparece y el sitio se recorre bajando. */
  const menu = document.getElementById("menu"), menuBtn = document.querySelector(".nav__menu");
  if (menu && menuBtn && typeof menu.showModal === "function") {
    menuBtn.hidden = false;
    const setOpen = (on) => { menuBtn.setAttribute("aria-expanded", String(on)); document.documentElement.classList.toggle("menu-open", on); };
    menuBtn.addEventListener("click", () => { menu.showModal(); setOpen(true); });
    menu.querySelector(".menu__close").addEventListener("click", () => menu.close());
    menu.addEventListener("close", () => setOpen(false));
    // una escena: cerrar, ir hasta la sección y dejarle el foco (para teclado y lectores de pantalla)
    menu.querySelectorAll('.menu__list a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const t = document.querySelector(a.getAttribute("href"));
      if (!t) return;
      e.preventDefault();
      menu.close();
      history.pushState(null, "", a.getAttribute("href"));
      t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      if (!t.hasAttribute("tabindex")) t.setAttribute("tabindex", "-1");
      t.focus({ preventScroll: true });
    }));
    // si se agranda la pantalla con el menú abierto (girar el teléfono), el botón desaparece: cerrarlo
    window.matchMedia("(min-width: 720px)").addEventListener("change", (m) => { if (m.matches && menu.open) menu.close(); });
  }

  /* menú: marca la sección en la que estás (aria-current), en la barra y en el índice del celular */
  const links = [...document.querySelectorAll('.nav__links a[href^="#"]:not(.btn), .menu__list a[href^="#"]')];
  const secs = [...new Set(links.map((a) => a.getAttribute("href")))].map((h) => document.querySelector(h)).filter(Boolean);
  if (secs.length && "IntersectionObserver" in window) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const mine = links.filter((l) => l.getAttribute("href") === "#" + en.target.id);
        if (!mine.length) return;
        if (en.isIntersecting) { links.forEach((l) => l.removeAttribute("aria-current")); mine.forEach((l) => l.setAttribute("aria-current", "location")); }
        else mine.forEach((l) => l.removeAttribute("aria-current"));
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    secs.forEach((s) => so.observe(s));
  }

  /* visor de imágenes (<dialog>): sin JS, cada miniatura es un link a la imagen grande.
     ZOOM: clic/toque acerca en ese punto · rueda o pellizco · arrastrar para mover · botones (− + ⤢) y teclado (+ − 0, flechas).
     Al empezar a acercar se baja la versión de alta resolución (data-zoom) para que no se vea borroso. */
  const lb = document.getElementById("lb");
  if (lb && typeof lb.showModal === "function") {
    const img = lb.querySelector(".lb__img");
    const cap = lb.querySelector(".lb__cap");
    const pct = lb.querySelector(".lb__pct");
    let items = [], idx = 0;

    /* ---- estado del zoom: s = escala (1 = ajustado a la pantalla), x/y = desplazamiento en px ---- */
    const Z = { s: 1, x: 0, y: 0, max: 6, zoomUrl: "", zoomed: false };

    // tamaño y centro de LAYOUT, sin transformar. Se leen de offsetLeft/Top/Width/Height (que ignoran transform) y no de
    // getBoundingClientRect: éste refleja la transformación que YA está pintada, y Z cambia antes de pintarse, así que
    // restarle Z desfasaba el centro y dejaba huecos al arrastrar. El diálogo es position:fixed, así que es el offsetParent.
    const geom = () => {
      const o = lb.getBoundingClientRect();
      return { w: img.offsetWidth, h: img.offsetHeight,
               cx: o.left + img.offsetLeft + img.offsetWidth / 2, cy: o.top + img.offsetTop + img.offsetHeight / 2 };
    };
    // que la imagen no se pueda sacar de la pantalla; si es más chica que la pantalla en ese eje, queda centrada
    const fitAxis = (t, lc, size, vp) =>
      size <= vp ? vp / 2 - lc : Math.min(size / 2 - lc, Math.max(vp - size / 2 - lc, t));
    const render = (animate) => {
      img.classList.toggle("is-anim", !!animate);
      img.style.transform = Z.s === 1 ? "" : `translate(${Z.x}px, ${Z.y}px) scale(${Z.s})`;
      lb.classList.toggle("is-zoomed", Z.s > 1.001);
      pct.textContent = (Math.round(Z.s * 10) / 10).toString().replace(".", ",") + "×";
    };
    const constrain = () => {
      if (Z.s <= 1.001) { Z.s = 1; Z.x = 0; Z.y = 0; return; }
      const g = geom();
      Z.x = fitAxis(Z.x, g.cx, g.w * Z.s, lb.clientWidth);
      Z.y = fitAxis(Z.y, g.cy, g.h * Z.s, lb.clientHeight);
    };
    // sube a la versión de alta resolución al empezar a acercar, sin parpadeo (se decodifica antes de cambiar)
    const loadZoom = () => {
      if (!Z.zoomUrl || Z.zoomed || Z.s < 1.05) return;
      Z.zoomed = true;
      const url = Z.zoomUrl, t = new Image();
      t.src = url;
      (t.decode ? t.decode() : Promise.resolve())
        .then(() => { if (Z.zoomUrl === url) img.src = url; })
        .catch(() => { Z.zoomed = false; });
    };
    // acerca/aleja manteniendo fijo el punto (px, py) de la pantalla
    const zoomAt = (ns, px, py, animate) => {
      ns = Math.min(Z.max, Math.max(1, ns));
      const g = geom(), k = ns / Z.s;
      Z.x = (px - g.cx) - k * ((px - g.cx) - Z.x);
      Z.y = (py - g.cy) - k * ((py - g.cy) - Z.y);
      Z.s = ns;
      constrain(); render(animate); loadZoom();
    };
    const reset = (animate) => { Z.s = 1; Z.x = 0; Z.y = 0; render(animate); };
    const center = () => ({ x: lb.clientWidth / 2, y: lb.clientHeight / 2 });

    const show = (i) => {
      idx = (i + items.length) % items.length;
      const a = items[idx], t = a.querySelector("img");
      Z.zoomUrl = a.dataset.zoom || ""; Z.zoomed = false; Z.max = Z.zoomUrl ? 6 : 4;
      reset(false);
      img.src = a.href;
      img.alt = t ? t.alt : "";
      img.title = "Clic para acercar";
      cap.textContent = a.dataset.cap || "";
      new Image().src = items[(idx + 1) % items.length].href;   // precarga la siguiente
    };

    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[data-lb]");
      if (!a) return;
      e.preventDefault();
      items = [...a.closest("[data-gallery]").querySelectorAll("a[data-lb]")];
      show(items.indexOf(a));
      lb.showModal();
    });

    lb.querySelector(".lb__close").addEventListener("click", () => lb.close());
    lb.querySelector(".lb__prev").addEventListener("click", () => show(idx - 1));
    lb.querySelector(".lb__next").addEventListener("click", () => show(idx + 1));
    lb.querySelector(".lb__zoomin").addEventListener("click", () => { const c = center(); zoomAt(Z.s * 1.5, c.x, c.y, true); });
    lb.querySelector(".lb__zoomout").addEventListener("click", () => { const c = center(); zoomAt(Z.s / 1.5, c.x, c.y, true); });
    lb.querySelector(".lb__fit").addEventListener("click", () => reset(true));
    lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener("close", () => {
      img.removeAttribute("src"); Z.zoomUrl = ""; reset(false); lb.classList.remove("is-panning");
    });

    /* teclado */
    lb.addEventListener("keydown", (e) => {
      const c = center();
      if (e.key === "+" || e.key === "=") { e.preventDefault(); zoomAt(Z.s * 1.4, c.x, c.y, true); }
      else if (e.key === "-" || e.key === "_") { e.preventDefault(); zoomAt(Z.s / 1.4, c.x, c.y, true); }
      else if (e.key === "0") { e.preventDefault(); reset(true); }
      else if (e.key.startsWith("Arrow")) {
        if (Z.s > 1.001) {                                  // con zoom, las flechas mueven la imagen
          e.preventDefault();
          const d = 90;
          if (e.key === "ArrowLeft") Z.x += d;
          if (e.key === "ArrowRight") Z.x -= d;
          if (e.key === "ArrowUp") Z.y += d;
          if (e.key === "ArrowDown") Z.y -= d;
          constrain(); render(true);
        } else if (e.key === "ArrowLeft") show(idx - 1);
        else if (e.key === "ArrowRight") show(idx + 1);
      }
    });

    /* rueda del mouse / pinch del trackpad (llega como ctrl+rueda): acerca en el cursor */
    lb.addEventListener("wheel", (e) => {
      if (!lb.open || e.target.closest(".lb__tools")) return;
      e.preventDefault();
      zoomAt(Z.s * Math.exp(-e.deltaY * (e.ctrlKey ? 0.012 : 0.0018)), e.clientX, e.clientY, false);
    }, { passive: false });

    /* punteros: un dedo/mouse arrastra (con zoom) o desliza para cambiar de imagen (sin zoom); dos dedos pellizcan.
       Un toque o clic sin movimiento acerca en ese punto, o vuelve a ajustar si ya hay zoom. */
    const ptrs = new Map();
    let g0 = null, lastToggle = 0, prevDist = 0, prevMid = null;
    const pair = () => {
      const [a, b] = [...ptrs.values()];
      return { d: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    };

    img.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      img.setPointerCapture(e.pointerId);
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 1) g0 = { sx: e.clientX, sy: e.clientY, moved: false };
      if (ptrs.size === 2) { const t = pair(); prevDist = t.d; prevMid = { x: t.x, y: t.y }; if (g0) g0.moved = true; }
    });
    img.addEventListener("pointermove", (e) => {
      const p = ptrs.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY;
      if (ptrs.size === 2) {                                // pellizco: escala alrededor del punto medio y arrastra con él
        const t = pair();
        if (prevDist > 0) zoomAt(Z.s * (t.d / prevDist), t.x, t.y, false);
        Z.x += t.x - prevMid.x; Z.y += t.y - prevMid.y;
        constrain(); render(false);
        prevDist = t.d; prevMid = { x: t.x, y: t.y };
        return;
      }
      if (!g0) return;
      if (!g0.moved && Math.hypot(e.clientX - g0.sx, e.clientY - g0.sy) > 6) {
        g0.moved = true;
        if (Z.s > 1.001) lb.classList.add("is-panning");
      }
      if (g0.moved && Z.s > 1.001) { Z.x += dx; Z.y += dy; constrain(); render(false); }
    });
    const endPtr = (e) => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.delete(e.pointerId);
      lb.classList.remove("is-panning");
      if (ptrs.size > 0) { if (g0) g0.moved = true; return; }   // terminó un pellizco: no cuenta como clic
      const gg = g0; g0 = null;
      if (!gg || e.type === "pointercancel") return;
      const dx = e.clientX - gg.sx, dy = e.clientY - gg.sy;
      if (!gg.moved) {                                          // clic / toque: alterna zoom (con antirrebote para el doble clic)
        const now = performance.now();
        if (now - lastToggle < 320) return;
        lastToggle = now;
        if (Z.s > 1.001) reset(true); else zoomAt(2.6, e.clientX, e.clientY, true);
      } else if (Z.s <= 1.001 && Math.abs(dx) > 60 && Math.abs(dx) > 1.5 * Math.abs(dy)) {
        show(idx + (dx < 0 ? 1 : -1));                          // deslizar sin zoom: imagen anterior/siguiente
      }
    };
    img.addEventListener("pointerup", endPtr);
    img.addEventListener("pointercancel", endPtr);
    img.addEventListener("dragstart", (e) => e.preventDefault());
    window.addEventListener("resize", () => { if (lb.open) { constrain(); render(false); } });
  }
})();
