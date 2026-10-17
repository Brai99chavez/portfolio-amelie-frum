# Portfolio de Amelie Frum — notas de desarrollo

Sitio de **dos páginas**: la principal (`index.html`: portada, «Lo mejor», sobre mí, qué hago, herramientas y contacto) y
la de trabajos (`trabajos.html`: los 11 proyectos con filtro, galerías, videos y los 20 créditos). Productora, guionista y
filmmaker (ficción corta, videoclips, transmisiones en vivo, eventos y fotografía).
HTML + CSS + JS puro, con un build que pre-renderiza todo y arma `dist/`.

**Diseño activo: v1.6 «lo mejor en video»** = la v1.5 «dos páginas» (la v1.4 + la página de trabajos aparte) con
**«Lo mejor»** rediseñado: 6 tarjetas en mosaico, 5 con tapa en video, y un botón grande «Ver todos los trabajos»
(ver **Dos páginas**). La portada es un retrato de ella, sin botón «Ver reel». Restaurar una versión anterior a la v1.5 vuelve a la página única; si una versión no sabe mostrar el contenido de hoy, el
script vuelve solo a como estaba (no queda nada a medias).
Se probó la v2 «Mesa de luz» (papel claro y rosa) y **no gustó**: queda guardada por si se quiere volver a mirarla.

## Cómo verlo

```bash
npm install        # una sola vez (trae sharp, solo para optimizar imágenes)
npm start          # arma dist/ y lo sirve en http://localhost:5173
```

## Cómo se edita (todo está en `content.js`)

Controles que decide el contenido (no hay que tocar CSS):

| Qué | Dónde | Ejemplo |
|---|---|---|
| Foto de la portada | `HERO.image` (un id de `IMAGES`) | `"backstage-set"` |
| Encuadre de la portada, en celular y en escritorio | `HERO.focus` | `{ m: "50% 92%", d: "50% 52%" }` |
| Palabras de la cinta bajo la portada | `HERO.strip` | `["Producción", "Realización", …]` |
| Retrato de «Sobre mí», su proporción y su encuadre | `ABOUT.photo`, `photoAr`, `photoPos` | `"sobre-mi"`, `0.8`, `"44% 50%"` |
| Hitos de la trayectoria | `TIMELINE` (año + texto) | `{ year: "2025", text: "…" }` |
| Dato que se copia con el botón «Copiar» | `CONTACT.channels[].copy` | `"+54 9 11 7385-0504"` |
| Ícono de cada herramienta | `TOOLS[].items[].icon` | `"timeline"`, `"color"`, `"wave"`… (lista en el comentario de `TOOLS`) |
| Video de la portada (encima de la foto) | `HERO.video` (un id de `VIDEOS`, o `null`) | `null` (con su retrato no va: lo taparía) |
| Las 6 tarjetas de «Lo mejor» (página principal; la primera es la grande) | `FEATURED` (proyecto + tapa: foto o video + encuadre) | `{ slug: "808", cover: "808-show", pos: "42% 50%" }` |
| Un video dentro de una galería | `PROJECTS[].frames` (ids de `VIDEOS` mezclados con los de fotos) | `["brujas-camara", "brujas-caldero", …]` |
| Ver una pieza propia acá mismo | `PROJECTS[].watch` | `{ label: "Ver microficción", video: "sol-piloto" }` |
| Lista de créditos (todo lo que hizo, con su rol) | `CREDITS` | `{ year, title, by, kind, role, href \| play }` |

Textos, proyectos, herramientas y contacto viven en **un solo archivo**: `content.js`. El diseño no se toca.

- **Un dato que falta** está en `null` (o con `confirmed: false`): el sitio muestra «cambiar después».
  Al cargarlo, desaparece solo. La lista de lo que falta está en `_analisis/pendientes.md`.
- **Filtro de Trabajo:** cada proyecto tiene `cat` (`ficcion`, `clips`, `vivo`, `foto`, `moda`) y las categorías se definen en `CATEGORIES`. Una categoría sin proyectos no se muestra, y con menos de 2 categorías no hay barra de filtros. El filtro es compartible por URL (`?cat=ficcion`) y sin JavaScript se ven todos los proyectos.
- **Sumar fotos:** copiarlas a `contenido/`, declararlas en `IMAGES` (grupo + **nombre de archivo**, no número de orden),
  agregarlas al `frames` del proyecto y correr:

```bash
npm run optimize   # genera las versiones WebP (sin EXIF/GPS) en assets/img/
npm run build      # pre-renderiza el sitio en dist/
```

- **Sumar un video:** declararlo en `VIDEOS` (grupo + archivo + `from`/`dur` en segundos + `loop: true` o `film: true` + `alt`),
  ponerlo en `frames`, `HERO.video` o `watch`, y correr `npm run optimize:video` (después `npm run build`).
- **Las carpetas de `contenido/` se buscan a cualquier profundidad** por el comienzo del nombre: reorganizarlas no rompe nada.
  Si un nombre coincide con dos carpetas, el build falla y dice cuáles.

## Diseños: probar un rediseño y volver atrás

El **diseño** (CSS, visor, `index.html`, plantillas, imagen para compartir) es independiente del **contenido** (`content.js`: textos, proyectos, contacto, fotos). Cambiar de diseño **nunca** toca el contenido.

```bash
npm run diseno -- lista                      # versiones guardadas (en _versiones/)
npm run diseno -- guardar mi-prueba          # congela el diseño actual antes de tocar algo
npm run diseno -- restaurar v1-modo-noche    # vuelve a la original y reconstruye el sitio
npm run diseno -- restaurar v1-1-mejorada    # la mejorada, SIN las animaciones nuevas ni los íconos
npm run diseno -- restaurar v1-2-isla-de-edicion   # v1.1 + animaciones + íconos, SIN los ajustes de celular
npm run diseno -- restaurar v1-3-celular     # v1.2 + menú y ajustes de celular (no conoce los videos)
npm run diseno -- restaurar v1-4-videos      # v1.3 + videos y créditos, en UNA página
npm run diseno -- restaurar v1-5-dos-paginas # principal con «Lo mejor» (tarjetas simples) + trabajos.html
npm run diseno -- restaurar v1-6-lo-mejor    # la activa hoy («Lo mejor» en mosaico, con video)
npm run diseno -- restaurar v2-mesa-de-luz   # la clara, que no gustó
```

- Al restaurar, lo que había antes se guarda solo (`antes-de-restaurar-<fecha>`): ir y volver no pierde nada.
- Restaurar reconstruye `dist/` **en el mismo modo en que estaba** (revisión o publicación). Antes lo dejaba siempre en
  publicación: volver atrás un diseño volvía indexable el link de revisión sin avisar.
- Se comprobó el ida y vuelta: cada archivo vuelve **idéntico byte a byte** y `content.js` no cambia.
- `_versiones/` no se sube (está en `.gitignore`).
- Después de restaurar, si cambió la foto del héroe o el nombre, correr `npm run og`.

| Versión | Qué es |
|---|---|
| `v1-modo-noche` | La original: negro azulado, acento violeta, titulares en Instrument Serif, claqueta (ESCENA / PLANO / TOMA), galerías horizontales |
| `v1-1-mejorada` | La v1 + portada de backstage, retrato de «Sobre mí», cinta de pilares que se desliza, flechas/contador/barra en cada galería, número de fotograma, trayectoria 2015–2026, botón «Copiar» en el contacto, menú con la sección activa y entrada animada de la portada |
| `v1-2-isla-de-edicion` | La v1.1 + animaciones del oficio (visor con REC y código de tiempo, franjas de cine, claqueta que se cierra, línea de tiempo con clips, barrido de títulos, retrato que se revela) e íconos propios de herramientas |
| `v1-3-celular` | La v1.2 + menú del celular («índice de escenas»), rótulo de la portada legible sobre la foto, portada para el celular acostado, sin hover pegado en pantallas táctiles |
| `v1-4-videos` | La v1.3 + videos (portada, galerías, la microficción en un visor) + lista de créditos. Restaurar una versión anterior con el contenido de hoy falla y vuelve sola |
| `v1-5-dos-paginas` | Principal corta (portada con su retrato, «Lo mejor», sobre mí, qué hago, herramientas, contacto) + `trabajos.html` con todo. Sin flyers. `trabajos.html` es opcional al guardar/restaurar |
| `v1-6-lo-mejor` | **La activa.** La v1.5 con «Lo mejor» en mosaico (una grande + cinco), tapas en video que se reproducen solas al verse (con botón «Pausar videos»), «Ver todos los trabajos» como botón grande, y sin «Ver reel» ni «Ver cortometraje» |
| `v2-mesa-de-luz` | Papel claro, tinta vino, **rosa** como único color, Bricolage Grotesque, rollos y fotogramas numerados, línea de tiempo |

## Animaciones (v1.2 «Isla de edición»)

El movimiento cita el oficio de Amelie (rodaje y montaje), con el trabajo siempre adelante:

| Dónde | Qué pasa | Sin JS / app.js caído / movimiento reducido |
|---|---|---|
| Portada | Dos franjas de cine se abren sobre la foto, que se asienta; aparece un **visor de cámara** (esquinas, REC titilando y **código de tiempo** a 24 cuadros por segundo desde 01:00:00:00, como un master) | Foto y visor quietos; código fijo en 01:00:00:00 |
| Visor en el celular | Cuadro completo solo si entra entre el menú y el rótulo (`app.js` lo mide); si no, solo la fila de arriba (REC · TC). Probado en 11 tamaños, de 320×568 a 1920×1080 | Solo la fila de arriba |
| Cada proyecto | La **claqueta** se cierra de golpe al entrar en pantalla (la punta abre ~64 px en cualquier ancho) | Cerrada |
| Cada galería | La barra es una **línea de tiempo de edición**: un clip por foto (ancho proporcional), se encienden las que se ven, y el cabezal avanza con la tira | Sin barra (como antes) |
| Fotos | Al pasar el mouse, esquinas de encuadre | Igual (es CSS) |
| Títulos de sección | Entran con un **barrido**, como una transición de montaje | Enteros desde el principio |
| «Sobre mí» | El retrato **se revela** (de blanco y negro a color); los hitos de la trayectoria aparecen en cascada | A color y visibles |
| Herramientas | Cada ícono **se dibuja** y después hace lo que hace la herramienta (el cabezal recorre la línea de tiempo, la rueda de color gira, las perillas se mueven, la onda de audio late, REC titila…); se repite al pasar el mouse | Dibujados y quietos |

**Íconos de herramientas:** son dibujos propios de lo que se **hace** con cada una (montar, corregir color, revelar, retocar,
audio, transmitir, en vivo, planillas), no los logos de las marcas. Los logos de Adobe, Microsoft y CapCut no tienen uso libre
(Adobe y Microsoft pidieron salir de la biblioteca libre Simple Icons) y mezclar cuatro logos oficiales con cinco dibujos se
vería desparejo. Para sumar una herramienta: `icon` con uno de la lista (si no existe, va un ícono genérico y el build avisa).

## En el celular (v1.3)

Revisado pantalla por pantalla en 375×812, 320×568 y acostado (844×390); probado además en 6 tamaños acostados y 4 parados.

| Qué | Cómo quedó |
|---|---|
| **Menú** | En el celular la barra no tiene lugar para los links de sección: un botón (44×44, al lado de «Escribime») abre el **índice de escenas** a pantalla completa (Escena 01 Trabajo … 05 Contacto) con WhatsApp, Email e Instagram abajo. Marca la escena en la que estás, lleva hasta la sección y le deja el foco; Esc o ✕ lo cierran. Es un `<dialog>` modal (el foco no se escapa a la página de atrás). Sin JS no aparece. Desde 720 px de ancho se ven los links de siempre |
| Rótulo de la portada | «Productora · guionista · filmmaker» va sobre una **etiqueta oscura**: sobre la foto daba 3,2:1 de contraste (medido) y ahora 5,6:1. En 320 y 360 px se compacta para entrar en un renglón |
| Celular acostado | La portada usa el diseño de escritorio (foto al costado) con tamaños según el alto: antes la foto se recortaba al piso y el título ocupaba dos pantallas. El epígrafe de la foto no se muestra en ese modo, y la barra de filtros no queda pegada (se comía un cuarto de la pantalla) |
| Pantallas táctiles | Los efectos de «pasar el mouse» (foto agrandada, esquinas, flecha pintada) solo con mouse: al tocar quedaban pegados |
| Detalles | En 320 px el nombre ya no se parte en dos renglones y la flecha del botón Email no queda sola |

## Dos páginas (v1.5)

Braian: *«hay mucho contenido en la landing, hacé un html aparte para los trabajos y en la principal una preview de lo mejorcito»*.

| Página | Qué tiene | Alto (escritorio / celular) |
|---|---|---|
| `index.html` | Portada (retrato de ella) → **«Lo mejor»** (6 tarjetas: Brujas, Eventos sociales, 808, Cuando el sol, Prohibido, Baby Amatista; cada una lleva a su proyecto) → «Ver todos los trabajos» → Sobre mí → Qué hago → Herramientas → Contacto | 6.136 / 7.465 px (antes ~15.000 / ~21.000) |
| `trabajos.html` | «Lo que hice.» → filtro → 11 proyectos agrupados (Ficción → Videoclips → Eventos y streaming → Fotografía → Actuación y modelaje) → 20 créditos → Contacto | 12.008 / 15.940 px |

- **«Lo mejor» (v1.6):** Braian pidió *«estilizalo más, que arriba esté eventos sociales, y que estén los que tienen video»*. En escritorio es un mosaico: Brujas grande a la izquierda y Eventos sociales y 808 a su lado; abajo, Cuando el sol, Prohibido y Baby Amatista. 5 de las 6 tienen tapa en video (solo hay 5 proyectos con video; Baby Amatista va con foto hasta que llegue otro). Cada tarjeta: «Esc. 01», marca «Video», tipo y año, título, rol y una franja de claqueta abajo.
- **Cuándo se mueven las tapas:** en escritorio arranca sola la grande cuando se ve y las demás al pasar el mouse (o con el foco del teclado); en el celular las tarjetas se deslizan de costado y se reproduce la que está a la vista. Fuera de pantalla se pausan. El botón **«Pausar videos»** frena todo (y «Reproducir videos» lo retoma). Con movimiento reducido o ahorro de datos no arranca ninguna sola y no se baja ningún video. Cada video se baja recién cuando se va a ver.
- **«Ver todos los trabajos»**: un botón ancho con la franja de claqueta, «11 proyectos · 20 créditos» y una flecha (en 320 px la flecha no se muestra para que entre el texto).
- La barra marca «Trabajos» cuando estás en esa página; desde trabajos, «Sobre mí», «Qué hago» y «Herramientas» vuelven a la principal.
- **Nunca flyers** (pedido de Braian): 808 y Arena muestran fotos y videos de la noche y del set. El build no lo controla solo: lo controla `verify_paginas.js` (por nombre de archivo y por el `alt`).

## Videos (v1.4)

`npm run optimize:video` (`scripts/optimize-video.js`) los arma desde `contenido/` (los originales no se tocan):

| Qué | Cómo |
|---|---|
| Medida | Lado corto a **720 px** (vertical 720×1280, horizontal 1280×720): no hace falta Full HD ni 4K para verse bien en la página, y pesa una fracción |
| Calidad | H.264 (lo reproduce cualquier navegador y celular). **Elegida midiendo** el clip de portada: a 720 px, CRF 23 = 1,43 MB · 26 = 0,98 MB · 28 = 0,78 MB · 30 = 0,62 MB por cada 6 s; al 100 % el 26 se ve igual que el 23 y en el 30 aparecen bloques → **bucles en CRF 26 (~1 MB cada 6 s)**. La microficción (62 s, con sonido y mucho grano): CRF 25 = 22,7 MB · 28 = 9,8 MB → **28 (9,8 MB)**, se baja solo al darle play |
| HDR del celular | Los de *Brujas* venían en HDR (HLG, 10 bits): se convierten a color normal (BT.709); si no, en la web se ven lavados |
| Rotación | Los 4K del celular vienen «acostados» con la rotación aparte: se lee y se respeta |
| Por video | `crf` (más alto = más liviano, para los que se mueven mucho: público de 808 y la boda van en 28) y `crop` (recorte: los de 808 traían la fecha de la cámara quemada arriba, «2017-03-16», que estaba mal) |
| Bucles | 6 s, **mudos**, sin pista de audio. Se cargan recién cuando se van a ver y se pausan fuera de pantalla; cada uno tiene botón de pausa. El de portada arranca después de que cargó la foto, y su botón de pausa es el «● REC» del visor |
| Sin JS / movimiento reducido / ahorro de datos | No se baja ningún video: se ve la foto de portada y el póster de cada video, y el botón ofrece «Reproducir» |
| Peso medido (red) | Portada sin el video: 0,60 MB (escritorio) y 0,82 MB (celular @3x); el video de portada suma 0,98 MB |

Como en el portfolio de Agustín, el video va comprimido para la web y nunca crudo; acá además se mide la pérdida y se elige.

## Créditos

Debajo de los proyectos, una lista de **todo lo que hizo con su rol** (20 entradas, 2022–2026), armada con los nombres de
las carpetas de `contenido/` (ella escribe ahí proyecto, fecha, institución o artista y su rol). Los proyectos destacados
muestran el oficio; los créditos muestran el recorrido. Los links salen de los `.docx` de cada carpeta y se verificaron
(YouTube responde con el título y el canal de cada video).

## Calidad de las imágenes (y por qué pesan lo que pesan)

- **Calidad alta a propósito:** WebP q90 en las fotos grandes y q95 en las que ya llegaron comprimidas por WhatsApp (nunca se agrandan). Se probó q78 y se perdía grano y detalle oscuro.
- **Tres tamaños por foto:** `card` (tarjetas y portada), `big` (lo primero que muestra el visor) y `zoom` (alta resolución; **solo se descarga cuando alguien hace zoom**). El navegador elige según el dispositivo.
- **El optimizador mide la pérdida** de cada variante (PSNR contra el original sin comprimir): avisa por debajo de 34 dB y falla por debajo de 30 dB. Si una imagen avisa, **mirar el recorte antes de subir la calidad**; si a ojo está bien, se anota `minDb` en `content.js`.
- Para ajustar: `Q=92 npm run optimize` (todas) o `q: 95` en la imagen dentro de `IMAGES`.
- El peso total de `dist/` lo imprime `npm run build`; la **primera carga** es mucho menor que el total, porque lo grande se baja a pedido.

## Imagen para compartir (`assets/og.jpg`)

Es la que aparece al pasar el link por WhatsApp, Instagram o redes. Se genera con **`npm run og`** a partir de `content.js` (nombre, rótulo, bajada) y de la foto del héroe: **correrlo cada vez que cambie alguno de esos o después de `npm run optimize`** (los archivos de imagen llevan hash en el nombre y cambian). Necesita `npm i --no-save puppeteer-core` (no queda en `package.json`) y **chrome-headless-shell** (Chrome sin interfaz: no crea ventanas). El navegador lo elige `scripts/browser.js`, que **rechaza Microsoft Edge**: sus páginas aparecen en Alt+Tab como ventanas fantasma. Si falta: `npx @puppeteer/browsers install chrome-headless-shell@stable --path %USERPROFILE%\.cache\puppeteer`. Falla con un mensaje claro si falta la foto en vez de salir sin ella.

## Visor de imágenes

Al tocar una foto se abre el visor, con **zoom**: clic o toque acerca en ese punto; rueda del mouse o pellizco con dos dedos; arrastrar para mover; botones `−` `+` `⤢`; teclado `+` `−` `0` y flechas. Deslizar el dedo (sin zoom) o `←` `→` cambia de foto.

## Estructura

```
Amelie Frum/
├── content.js          # ⭐ todo el contenido
├── index.html          # esqueleto con marcadores <!--BUILD:x-->
├── assets/
│   ├── css/site.css    # diseño (paleta y tipografías en :root)
│   ├── js/app.js       # revelado al scroll y visor de imágenes
│   ├── img/            # WebP generados (no editar a mano) + manifest.json
│   └── og.jpg          # imagen para compartir (1200×630)
├── scripts/            # build.js · optimize-img.js · templates.js · lib.js · disenos.js · og/
├── _versiones/         # diseños guardados (v1, v2…) — NO se sube
├── contenido/          # material original de Amelie — NO se sube
├── _analisis/          # ficha, análisis del material y pendientes — NO se sube
└── dist/               # salida del build: lo ÚNICO que se publica
```

## Subirlo a Netlify: dos cosas distintas

Solo se sube **`dist/`**, siempre. Hay dos formas de armarlo, según para qué:

| | Para **mostrárselo a Amelie** (revisión) | Para **publicarlo** de verdad |
|---|---|---|
| Comando | `npm run build:revision` | `SITE_URL=https://su-dominio.com npm run build` |
| Google | **No lo indexa** (`noindex` en el HTML, header `X-Robots-Tag` y `robots.txt` que prohíbe todo) | Lo indexa |
| Pendientes («cambiar después») | Pueden quedar: es justo lo que se le muestra | **Tienen que ser 0 y 0** |
| Imagen y datos para compartir el link | No se emiten (sin dominio no hay URL absoluta) | `canonical`, `og:image`, JSON-LD |
| Quién lo ve | Cualquiera que tenga el link (**no tiene clave**) | Todo el mundo |

**Pasos para la revisión (conectado a GitHub, sin zip ni arrastre):**
1. El sitio vive en el repo `Brai99chavez/portfolio-amelie-frum` (sin `contenido/`, `_analisis/`, `_versiones/` ni `dist/`: los ignora `.gitignore`).
2. Una sola vez: en https://app.netlify.com → *Add new site* → *Import an existing project* → *GitHub* → elegir `portfolio-amelie-frum` → *Deploy*. No hay que tocar nada: `netlify.toml` ya dice el comando (`npm run build:revision`) y la carpeta (`dist`).
3. Netlify devuelve un link con nombre aleatorio. Ese es el que se le manda. Desde ahí, cada cambio que se sube al repo (`git push`) actualiza el sitio solo.

**Sin git (alternativa manual):**
1. `npm run build:revision` (el build tiene que decir «MODO REVISIÓN»).
2. Entrar a https://app.netlify.com/drop y subir el sitio, de **una** de estas tres formas (de la más a la menos confiable):
   - **`npm run zip`** → genera `amelie-frum-sitio.zip` (dice en qué modo quedó `dist/`) y se **arrastra ese .zip**. Es lo más seguro.
   - Botón **«choose a folder»** de la pantalla de Netlify → elegir `dist/` en el selector de Windows (no usa el arrastre).
   - Arrastrar la carpeta **`dist/`** desde el **Explorador de Windows** (no desde el panel de archivos de VS Code).
3. Netlify devuelve un link con nombre aleatorio. Ese es el que se le manda.

**Si Netlify dice «A requested file or directory could not be found at the time an operation was processed»:** es un error del *navegador* al leer lo que se arrastró (no del sitio). Usar el .zip o «choose a folder». No comprimir `dist/` a mano con «Enviar a → Carpeta comprimida»: el comprimir de Windows PowerShell 5.1 guarda las rutas con `\` (verificado: `assets\img\foto.txt`) y en Netlify, que corre en Linux, pueden quedar mal. `npm run zip` las guarda con `/` y deja `index.html` en la raíz del zip.

**Para publicar:** volver a compilar con `npm run build` (el build tiene que decir «MODO PUBLICACIÓN»), con el dominio real en `SITE_URL`, y arrastrar de nuevo `dist/` sobre el mismo sitio (pestaña *Deploys*). Conectado a GitHub: en `netlify.toml` cambiar el comando a `npm run build` y en Netlify definir `SITE_URL` como variable de entorno (*Site configuration → Environment variables*).

Los headers de cache se generan en `dist/_headers`: largos solo para archivos con hash o `?v=` en la URL.

**No publicar (modo publicación) mientras el build muestre pendientes distintos de 0.** Y antes de publicar, resolver lo de `_analisis/pendientes.md` (autorización de imagen, nombre, derechos).

## Identidad (v1 «Modo noche», la activa)

- Fondo `#0A0A10` · texto `#EEEAF4` · acento violeta `#B084FF` (`:root` de `site.css`).
- Tipografías: **Instrument Serif** (titulares; la palabra de acento va en cursiva) · **DM Sans** (texto) · **IBM Plex Mono** (claquetas y etiquetas).
  Instrument Serif solo existe en peso 400 y cursiva: no pedirle otro peso (el navegador inventaría una negrita falsa).

*(La v2 «Mesa de luz» usaba papel `#F3F0EA`, tinta `#17090F`, rosa `#FF4F9A` y Bricolage Grotesque; está en `_versiones/v2-mesa-de-luz`.)*
