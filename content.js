/* =============================================================
   CONTENIDO — Amelie Frum
   -------------------------------------------------------------
   Acá vive TODO lo que se lee en el sitio: textos, proyectos,
   herramientas y contacto. El diseño (index.html + assets/css)
   no se toca para cambiar contenido.

   Después de editar:   npm run build      (o   npm start   para verlo)

   ▸ DATOS QUE FALTAN
     Un dato en null (o con confirmed:false) se muestra en el sitio
     con el texto "cambiar después". Cuando lo tengas, completalo y
     desaparece solo. Lista completa: _analisis/pendientes.md

   ▸ IMÁGENES
     Cada foto se declara en IMAGES con su grupo (carpeta dentro de
     contenido/) y el NOMBRE DE ARCHIVO. Se referencia por nombre, no
     por orden: sumar fotos nuevas a contenido/ no rompe nada.
     Para generar las versiones optimizadas:   npm run optimize

   ▸ VIDEOS
     Igual que las fotos, en VIDEOS (grupo + archivo + tramo). Se usan en
     PROJECTS[].frames como si fueran fotos, y en HERO.video.
     Para generar las versiones para la web:   npm run optimize:video
   ============================================================= */

/* Carpetas de contenido/: nombre corto → RUTA EXACTA (relativa a este proyecto, empieza con «./»).
   Antes se buscaban por el comienzo del nombre; con carpetas nuevas que se agregan solas eso daba 2 coincidencias y rompía todo.
   Las carpetas NUEVAS que aparecen en contenido/ no se declaran acá: se detectan solas (scripts/galeria.js, npm run fotos). */
const SOURCE = "contenido";                     // carpeta de originales (no se mueve ni se publica)
const GROUPS = {
  "808"       : "./contenido/PORTFOLIO CHUNI._/PRODUCCIÓN_/PRODUCCIÓN DE EVENTOS._/808 Trap Party. 10 de mayo y 10 de agosto 2024. _Producción, armado de guion y seteo completo para streaming multicamara, coordinación de Stands, Sponsors y Talentos._",
  "arena"     : "./contenido/PORTFOLIO CHUNI._/PRODUCCIÓN_/PRODUCCIÓN DE EVENTOS._/Arena Gamer de Burger King. Octubre 2023 hasta Diciembre 2024. _Producción, armado de guiones, diseño de flyers y escenas para OBS, coordinadora de talentos e influencers, armado de idea creativa,  hosting y transmisión en vivo._",
  "modelaje"  : "./contenido/PORTFOLIO CHUNI._/MARCA PERSONAL/MODELAJE Y CONTENT CREATOR",
  "brujas"    : "./contenido/PORTFOLIO CHUNI._/PRODUCCIÓN_/PRODUCCIONES CINEMATOGRÁFICAS_/_Brujas, viudas y viejas_. Noviembre 2025. Cortometraje. _Facultad Nacional de La Plata. _Guión, dirección y coordinadora de casting_",
  "sol"       : "./contenido/PORTFOLIO CHUNI._/PRODUCCIÓN_/PRODUCCIONES CINEMATOGRÁFICAS_/_Cuando el sol deja de salir_. Enero 2026. Microficción vertical._HACK MAFIZ MÁLAGA _producción, guión y dirección_",
  "baby"      : "./contenido/PORTFOLIO CHUNI._/PRODUCCIÓN_/PRODUCCIONES AUDIOVISUALES/_Baby Amatista_. Agosto 2025. Roggero Alex._Producción, cámara, gaffer y coordinadora de post._",
  "basado"    : "./contenido/PORTFOLIO CHUNI._/PRODUCCIÓN_/PRODUCCIONES AUDIOVISUALES/_Basado_. Septiembre 2026. Dennis133._Producción, realización, cámara y luces._",
  "prohibido" : "./contenido/PORTFOLIO CHUNI._/PRODUCCIÓN_/PRODUCCIONES AUDIOVISUALES/_Prohibido_. Agosto 2024. Holly HH. _Producción._",
  "sound"     : "./contenido/PORTFOLIO CHUNI._/PRODUCCIÓN_/PRODUCCIÓN DE EVENTOS._/Sound Urbano. Noviembre 2025. _Asistente de producción, seteo de streaming multicamara, armado de producción audiovisual y fotográfico._",
  "artistas"  : "./contenido/PORTFOLIO CHUNI._/FOTOGRAFÍA_/Artistas_",
  "estudio"   : "./contenido/PORTFOLIO CHUNI._/FOTOGRAFÍA_/Estudio",
  "eventos"   : "./contenido/PORTFOLIO CHUNI._/FOTOGRAFÍA_/Eventos sociales",
  "marcas"    : "./contenido/PORTFOLIO CHUNI._/FOTOGRAFÍA_/Marcas",
  "actuacion" : "./contenido/PORTFOLIO CHUNI._/MARCA PERSONAL/ACTUACIÓN_",
};
/* Subcarpeta de assets/img/ donde queda la salida optimizada de cada grupo (por defecto, el nombre del grupo). */
const DIRS = {};
/* Dónde crea `npm run serie` una carpeta nueva (dentro de SOURCE). */
const NEW_SERIES_DIR = "PORTFOLIO CHUNI._/FOTOGRAFÍA_";

/* Todas las imágenes del sitio.
   g = grupo · f = archivo · alt = qué se ve (sin nombres de personas)
   q     = (opcional) calidad WebP de esa imagen, si el optimizador avisa que pierde mucho (ver `npm run optimize`)
   minDb = (opcional) umbral de aviso del optimizador para esa imagen. Solo después de MIRAR el recorte al 100%:
           808-sala es arte posterizado de altísimo contraste; su PSNR bajo (31 dB) es del grano y a ojo no se nota. */
const IMAGES = {
  /* — Brujas, viudas y viejas — */
  "brujas-caldero":  { g: "brujas", f: "20251205_151938.jpg", alt: "Una bruja de cabello blanco revuelve con una cuchara de madera un caldero que ilumina su rostro de verde turquesa, en un set oscuro." },
  "brujas-mesa":     { g: "brujas", f: "20251205_113927.jpg", alt: "Tres personajes conversan alrededor de una mesa con mantel de crochet, frente a una pared verde menta con frascos y un reloj." },
  "brujas-perfil":   { g: "brujas", f: "20251205_151930.jpg", alt: "La bruja de perfil, riendo, con el rostro iluminado por la luz del caldero." },
  "brujas-cocina":   { g: "brujas", f: "20251205_152015.jpg", alt: "Plano amplio de la cocina de las brujas: una bruja cocina en un caldero bajo ramos de hierbas y rosas colgados." },
  "brujas-set":      { g: "brujas", f: "20251205_111503.jpg", alt: "El set de la cocina de brujas en pleno rodaje: softbox colgado, jirafa de micrófono y el equipo trabajando." },
  "brujas-monitor":  { g: "brujas", f: "20251205_112500.jpg", alt: "Un monitor de dirección muestra la toma, con la claqueta en cuadro, en el set de la cocina de brujas." },

  /* — Portada: backstage de Brujas, viudas y viejas — */
  "backstage-set": { g: "brujas", f: "20251205_111538.jpg", alt: "Backstage del rodaje de «Brujas, viudas y viejas»: el equipo trabaja con micrófono de jirafa, softbox y reflectores alrededor del set de la cocina de brujas, mientras las actrices están sentadas a la mesa." },

  /* — Retrato de ella en el baño con grafitis (808): la foto de la PORTADA desde el 2026-10-14 — */
  "sobre-mi":    { g: "808", f: "DSC_0269.JPG", alt: "Retrato de Amelie en un baño con las paredes cubiertas de grafitis, bajo luz azul y magenta, con la mirada hacia abajo y una mano junto a la cara." },

  /* — Cuando el sol deja de salir — */
  "sol-claqueta":    { g: "sol", f: "WhatsApp Image 2026-10-06 at 6.03.28 AM (1).jpeg", alt: "Claqueta de «Cuando el sol deja de salir»: escena 3, plano 7, toma 1, director Amelie, cámara Wine Audiovisuales, 9/1/26." },
  "sol-sonido":      { g: "sol", f: "WhatsApp Image 2026-10-06 at 6.03.29 AM (2).jpeg", alt: "Una integrante del equipo sostiene un micrófono direccional bajo luz violeta." },
  "sol-reflector":   { g: "sol", f: "WhatsApp Image 2026-10-06 at 6.03.29 AM (3).jpeg", alt: "Dos personas sostienen un reflector circular a contraluz en una habitación teñida de violeta." },
  "sol-cortinas":    { g: "sol", f: "WhatsApp Image 2026-10-06 at 6.03.29 AM.jpeg",     alt: "Una persona de campera blanca entre cortinas metalizadas de luz rosa y violeta." },
  "sol-celular":     { g: "sol", f: "WhatsApp Image 2026-10-06 at 6.03.30 AM.jpeg",     alt: "Una persona recostada mira su celular, iluminada por luz violeta." },
  "sol-claqueta-2":  { g: "sol", f: "WhatsApp Image 2026-10-06 at 6.03.30 AM (2).jpeg", alt: "Una persona sostiene la claqueta de la escena 2, plano 2, toma 1, bajo luz azulada." },
  "sol-claqueta-3":  { g: "sol", f: "WhatsApp Image 2026-10-06 at 6.03.30 AM (3).jpeg", alt: "Claqueta de la escena 3, plano 1, toma 1, vista desde arriba." },
  "sol-pared":       { g: "sol", f: "WhatsApp Image 2026-10-06 at 6.03.29 AM (1).jpeg", alt: "Tres integrantes del equipo cuelgan un cortinado contra una pared iluminada de ámbar." },

  /* — 808 Trap Party — */
  "808-cantante":    { g: "808", f: "DSC_0316.JPG", alt: "Una cantante con micrófono y campera metalizada en el escenario de 808 Trap Party, con luz verde azulada." },
  "808-vivo":        { g: "808", f: "DSC_0402.JPG", alt: "Dos artistas cantan con micrófono mientras una persona los filma con una cámara, en 808 Trap Party." },
  "808-flash":       { g: "808", f: "DSC_0139.JPG", alt: "Una persona con camiseta de béisbol tapa su rostro con un flash frente a carteles de hojas, virado en verde azulado." },
  "808-escena":      { g: "808", f: "DSC_0208.JPG", alt: "Un artista con campera clara gesticula frente a una pared de grafitis, bajo luz verde azulada." },
  "808-neon":        { g: "808", f: "WhatsApp Image 2026-10-06 at 4.28.18 AM (1).jpeg", alt: "Una artista con anteojos de sol y colita alta, de perfil, frente a un cartel de neón violeta." },
  "808-perfil":      { g: "808", f: "WhatsApp Image 2026-10-06 at 4.28.17 AM.jpeg",     alt: "Un cantante de perfil con anteojos oscuros canta con el micrófono, bajo luz roja y magenta." },
  "808-voz":         { g: "808", f: "WhatsApp Image 2026-10-06 at 4.28.18 AM.jpeg",     alt: "Una cantante canta con los ojos cerrados y el micrófono en alto, bajo luz turquesa." },
  "808-capucha":     { g: "808", f: "WhatsApp Image 2026-10-06 at 4.28.17 AM (2).jpeg", alt: "Un cantante de buzo negro canta con el micrófono frente a un parlante, bajo luz azul y violeta." },

  /* — Arena Gamer · Burger King — */
  "arena-set":       { g: "arena", f: "WhatsApp Image 2026-10-06 at 4.55.43 AM (3).jpeg", alt: "El set de Arena Gamer: cartel violeta con círculos concéntricos, tres sillas gamer y un micrófono violeta sobre la mesa." },
  "arena-obs":       { g: "arena", f: "WhatsApp Image 2026-10-06 at 4.55.43 AM.jpeg",     alt: "Una persona opera OBS en el monitor del puesto de transmisión de Arena Gamer, junto a un aro de luz." },
  "arena-halloween": { g: "arena", f: "WhatsApp Image 2026-10-06 at 4.55.45 AM (2).jpeg", alt: "El set de Arena Gamer decorado para Halloween, con telarañas, neones de Burger King y AMD y participantes en las computadoras." },
  "arena-risas":     { g: "arena", f: "WhatsApp Image 2026-10-06 at 4.55.45 AM (4).jpeg", alt: "Dos mujeres se ríen frente a una notebook, bajo el cartel de Arena Gamer (foto en blanco y negro)." },
  "arena-gamer":     { g: "arena", f: "WhatsApp Image 2026-10-06 at 4.55.45 AM.jpeg",     alt: "Un participante con auriculares y camiseta de fútbol americano juega en una computadora del set, entre telarañas de Halloween." },
  "arena-amigas":    { g: "arena", f: "WhatsApp Image 2026-10-06 at 4.55.45 AM (3).jpeg", alt: "Dos chicas conversan en los puestos gamer del set decorado para Halloween, bajo el logo de Burger King y AMD." },
  "arena-grupo":     { g: "arena", f: "WhatsApp Image 2026-10-06 at 4.55.45 AM (1).jpeg", alt: "El equipo de Arena Gamer posa en grupo en el local, en blanco y negro." },
  "arena-ring":      { g: "arena", f: "WhatsApp Image 2026-10-06 at 4.55.44 AM (3).jpeg", alt: "El puesto de transmisión con aro de luz y monitor, mientras se arma el stream en el local." },

  /* — Modelaje y content creator — */
  "modelaje-gorra":    { g: "modelaje", f: "WhatsApp Image 2026-10-06 at 5.54.25 AM (1).jpeg", alt: "Retrato con gorra negra y campera negra frente a estantes con skates." },
  "modelaje-sillon":   { g: "modelaje", f: "WhatsApp Image 2026-10-06 at 5.54.25 AM (2).jpeg", alt: "Retrato con gorra beige y buzo de bloques de color, sobre un sillón gris." },
  "modelaje-detalle":  { g: "modelaje", f: "WhatsApp Image 2026-10-06 at 5.54.25 AM.jpeg",     alt: "Detalle de una riñonera de camuflaje con etiqueta Loop Company." },
  "actuacion-desencuentro": { g: "actuacion", f: "WhatsApp Image 2026-10-06 at 5.59.46 AM (1).jpeg", alt: "Fotograma de «Desencuentro»: Amelie enciende un cigarrillo de noche, con luces de la calle desenfocadas atrás." },
  "actuacion-axolotl":      { g: "actuacion", f: "WhatsApp Image 2026-10-06 at 5.59.47 AM (1).jpeg", alt: "Fotograma de «Axolotl»: Amelie, con gorra, mira de perfil una pecera donde se refleja su silueta." },

  /* — Baby Amatista · Roggero Alex (fotos de WhatsApp, 720 px) — */
  "baby-artista": { g: "baby", f: "WhatsApp Image 2026-10-14 at 1.29.15 PM (1).jpeg", alt: "El artista con anteojos transparentes, cadena plateada y dientes con brillo, mira a cámara sobre un fondo oscuro." },
  "baby-encaje":  { g: "baby", f: "WhatsApp Image 2026-10-14 at 1.29.16 PM (1).jpeg", alt: "Retrato de una joven con top de encaje rojo y un ramo de claveles rojos en la mano." },
  "baby-gimbal":  { g: "baby", f: "WhatsApp Image 2026-10-14 at 1.29.14 PM (2).jpeg", alt: "Dos integrantes del equipo operan una cámara montada en un estabilizador, con una luz de estudio detrás." },
  "baby-clavel":  { g: "baby", f: "WhatsApp Image 2026-10-14 at 1.29.16 PM (2).jpeg", alt: "El artista extiende un clavel rojo hacia cámara frente a una cortina roja, bajo un panel de luz." },
  "baby-duo":     { g: "baby", f: "WhatsApp Image 2026-10-14 at 1.29.16 PM.jpeg",     alt: "Una joven con un clavel en la mano y el artista con anteojos y campera de cuero, espalda con espalda." },
  "baby-rojo":    { g: "baby", f: "WhatsApp Image 2026-10-14 at 1.29.17 PM.jpeg",     alt: "El artista huele un clavel rojo, envuelto en luz roja." },

  /* — Basado · Dennis 133 (capturas del videoclip) — */
  "basado-titulo": { g: "basado", f: "Captura de pantalla 2026-10-14 132039.png", alt: "Placa de título del videoclip «Basado», de Dennis 133, sobre la imagen del artista en tonos cobre." },
  "basado-doble":  { g: "basado", f: "Captura de pantalla 2026-10-14 132104.png", alt: "Fotograma del videoclip: el artista, con gorro de calaveras, duplicado en espejo bajo luz cobre." },
  "basado-road":   { g: "basado", f: "Captura de pantalla 2026-10-14 132155.png", alt: "Fotograma del videoclip con el texto «Road to rich» sobre el artista, que se toma la cabeza." },

  /* — Prohibido · Holly HH (la misma sesión que los videos del backstage) — */
  "prohibido-foto": { g: "artistas", f: "IMG_1709.PNG", alt: "En un estudio de fondo blanco, una asistente acomoda el vestido de una modelo con corsé y pollera lila, junto a una luz con softbox." },

  /* — Sound Urbano (Nikon D7000, resolución completa) — */
  "sound-obs":     { g: "sound", f: "DSC_2165.jpg", alt: "La pantalla de OBS durante la transmisión de Sound Urbano: la vista previa de la cámara principal y la cámara 2 al aire." },
  "sound-podcast": { g: "sound", f: "DSC_2181.jpg", alt: "Dos invitados hablan frente a micrófonos, contra una pared de grafitis de colores." },
  "sound-camara":  { g: "sound", f: "DSC_2140.jpg", alt: "Una joven de remera roja con una cámara en la mano, apoyada contra una pared de grafitis." },

  /* — Fotografía: su selección de Estudio, Artistas, Eventos sociales y Marcas (exportadas por ella, ya editadas) — */
  "foto-gel-rojo":       { g: "estudio",  f: "IMG_1736.PNG",      alt: "Retrato de estudio de un artista con anteojos oscuros que sonríe y se toma el cuello del buzo, bañado en luz roja." },
  "foto-flores":         { g: "estudio",  f: "A6408332.jpg",      alt: "Retrato sobre fondo blanco de una joven con flores de colores en las manos y en el pelo, con un vestido rosa transparente." },
  "foto-sombra":         { g: "artistas", f: "IMG_1700.PNG",      alt: "Un rapero con gorra canta con micrófono frente a una pared clara donde se proyecta su sombra." },
  "foto-jardinero":      { g: "artistas", f: "IMG_1689 (1).PNG",  alt: "Retrato de una joven de pelo corto con jardinero blanco y remera de encaje negro, frente a una pared con grafitis." },
  "foto-banda":          { g: "estudio",  f: "A6408215.jpg",      alt: "Retrato grupal de estudio: cuatro músicos de traje y, en el centro, una joven con un ramo de flores y un platillo detrás de la cabeza como aureola." },
  "foto-cantante-verde": { g: "artistas", f: "IMG_1701.PNG",      alt: "Una cantante con campera verde canta con los ojos cerrados bajo luz magenta." },
  "foto-gel-naranja":    { g: "estudio",  f: "IMG_1738.PNG",      alt: "Retrato de estudio de un artista con trenzas, anteojos de sol y campera deportiva, sobre un fondo de luz naranja." },
  "foto-humo":           { g: "artistas", f: "IMG_1719.PNG",      alt: "Un rapero con gorra y anteojos canta entre el humo del escenario, en blanco y negro." },
  "foto-flores-piso":    { g: "estudio",  f: "A6408313.jpg",      alt: "Una joven recostada entre flores mira a cámara, con luz suave y colores pastel." },
  "foto-cantante-azul":  { g: "artistas", f: "IMG_1713.PNG",      alt: "Un cantante sonríe con el micrófono en la mano, bajo luces azules de escenario." },
  "evento-brindis":      { g: "eventos",  f: "IMG_1759.PNG",      alt: "Cuatro amigos brindan alrededor de una mesa redonda de bronce, de noche." },
  "evento-escalera":     { g: "eventos",  f: "IMG_1760.PNG",      alt: "Cuatro adultos posan en una escalera: dos mujeres de vestido turquesa y bordó delante, dos hombres de traje detrás." },
  "evento-graduado":     { g: "eventos",  f: "IMG_1749.PNG",      alt: "Un graduado sonríe de noche frente a un edificio histórico, con un ramo de flores en la mano." },
  "evento-biblioteca":   { g: "eventos",  f: "IMG_1758.PNG",      alt: "Cuatro adultos posan frente a una biblioteca de libros antiguos." },
  "foto-cumple":         { g: "eventos",  f: "IMG_1756.PNG",      alt: "Una mujer con vestido de lentejuelas bordó sostiene una porción de torta con una vela encendida, de noche." },
  "foto-pileta":         { g: "marcas",   f: "IMG_1707.PNG",      alt: "Retrato al sol de una joven con anteojos rosas y una flor violeta en el pelo, junto a una pileta." },
};

/* Videos del sitio. g + f = como en IMAGES · from + dur = tramo en segundos (sin dur, entero)
   crf = (opcional) calidad de ESE video, si se mueve mucho y pesa de más (por defecto 26 en bucles; más alto = más liviano)
   loop: true = bucle mudo de pocos segundos (se reproduce solo al verse, con botón de pausa) · posterAt = segundo del póster
   film: true = pieza completa con sonido (se ve con un clic, desde el botón «watch» del proyecto)
   alt = qué se ve (para lectores de pantalla). Los tramos se eligieron mirando fotogramas cada 1–2 s. */
const VIDEOS = {
  "hero-rodaje":       { g: "brujas", f: "20251205_134849.mp4", from: 14.5, dur: 6, loop: true, alt: "El equipo de «Brujas, viudas y viejas» prepara la cámara sobre el dolly, en el set de la cocina de brujas." },
  "brujas-camara":     { g: "brujas", f: "20251205_152333.mp4", from: 0.1, dur: 6.3, loop: true, alt: "Detrás de cámara: en primer plano la cámara y su monitor; al fondo, la bruja revuelve el caldero iluminado." },
  "brujas-tablet":     { g: "brujas", f: "20251205_133924.mp4", from: 8, dur: 6, loop: true, alt: "Una tablet muestra la toma en vivo mientras se filma la escena de la mesa." },
  "prohibido-gimbal":  { g: "prohibido", f: "DSC_1113.MOV", from: 3.5, dur: 6, loop: true, alt: "Un camarógrafo filma con la cámara montada en un estabilizador, junto a una ventana." },
  "prohibido-estudio": { g: "prohibido", f: "DSC_1247.MOV", from: 5.5, dur: 6, loop: true, alt: "En el estudio de fondo blanco, la modelo posa con un velo mientras el equipo trabaja alrededor." },
  "prohibido-camara":  { g: "prohibido", f: "DSC_1254.MOV", from: 3.5, dur: 6, loop: true, alt: "Manos que ajustan una cámara sobre el trípode, en el estudio." },
  // 808: cámara de acción con la fecha quemada en la imagen (2017-03-16, el reloj estaba mal): se recorta arriba (crop)
  "808-show":          { g: "808", f: "20170316_174553A.mp4", from: 14, dur: 6, loop: true, crop: "iw*0.96:ih*0.96:iw*0.02:ih*0.04", alt: "Un artista canta con anteojos de sol bajo el neón rosa del rayo de 808 Trap Party." },
  "808-dj":            { g: "808", f: "20170316_122844A.mp4", from: 19.5, dur: 6, loop: true, crop: "iw*0.96:ih*0.96:iw*0.02:ih*0.04", alt: "Las manos del DJ sobre la consola, en 808 Trap Party." },
  "808-publico":       { g: "808", f: "20170316_190957A.mp4", from: 8, dur: 6, loop: true, crf: 28, crop: "iw*0.96:ih*0.96:iw*0.02:ih*0.04", alt: "El público de 808 Trap Party frente al escenario, bajo el neón rosa." },
  // eventos sociales (cámara Sony)
  "eventos-quince":    { g: "eventos", f: "C0030.MP4", from: 0.2, dur: 7, loop: true, alt: "En un trono blanco con luces y letras iluminadas, una chica de vestido blanco abraza a un nene de traje que sonríe a cámara." },
  "eventos-boda":      { g: "eventos", f: "C0028.MP4", from: 5, dur: 6, loop: true, crf: 28, alt: "La entrada de una boda: la novia, con corona de flores, saluda a los invitados en la puerta." },
  "sol-loop":          { g: "sol", f: "PILOTO.mp4", from: 17, dur: 6, loop: true, crf: 28, alt: "Primer plano de la protagonista de «Cuando el sol deja de salir», iluminada por la pantalla del celular en la oscuridad." },
  "sol-piloto":        { g: "sol", f: "PILOTO.mp4", film: true, posterAt: 13, alt: "«Cuando el sol deja de salir», microficción vertical (piloto)." },
};

/* ------------------------------------------------------------ */

const SITE = {
  // CAMBIAR DESPUÉS: confirmar con ella cómo quiere que figure su nombre (con o sin tildes).
  name: "Amelie Frum",
  role: "Productora, guionista y filmmaker",   // sus palabras (tagline de su Readymag)
  lang: "es-AR",
  description: "Amelie Frum — productora, guionista y filmmaker en Buenos Aires. Ficción corta, videoclips, transmisiones en vivo, eventos y fotografía.",
  location: "Ciudad Autónoma de Buenos Aires",
  year: new Date().getFullYear(),
};

const HERO = {
  eyebrow: "Productora · guionista · filmmaker",
  title: ["Escribo,", "produzco", "y dirijo."],   // la última línea lleva el acento
  lead: "Cine corto, videoclips, transmisiones en vivo y eventos. Del guion al set, del escenario al stream.",
  image: "sobre-mi",                            // un retrato de ella
  video: null,                                  // video de fondo encima de la foto: con su retrato no va (lo taparía). El del rodaje
                                                // pasó a la galería de Brujas y a la portada de trabajos.
  focus: { m: "34% 30%", d: "40% 45%" },        // encuadre por ancho: ella queda a la vista y el texto no le tapa la cara
  caption: "Retrato · 808 Trap Party, 2024",
  image2: "sol-claqueta",                      // segunda foto del héroe (la claqueta con su nombre de directora)
  strip: ["Producción", "Realización", "Fotografía", "Streaming", "Eventos", "Contenido"],   // franja bajo el héroe: sus pilares y áreas
  // watch: { label: "Ver reel", href: "https://…" },   // botón al reel: va cuando haya link
};

/* Categorías del filtro de Trabajo. Una categoría sin proyectos NO se muestra (y «Todo» solo aparece
   si hay al menos 2 categorías con proyectos): al cargar más material, el filtro se arma solo.
   Cada proyecto declara cat: "<key>". Para sumar una categoría, agregala acá. */
const CATEGORIES = [
  { key: "ficcion", label: "Ficción" },
  { key: "clips",   label: "Videoclips" },
  { key: "vivo",    label: "Eventos y streaming" },
  { key: "foto",    label: "Fotografía" },
  { key: "moda",    label: "Actuación y modelaje" },
];

/* Proyectos, en el orden en que se muestran.
   cat     = categoría del filtro (ver CATEGORIES)
   roles   = lo que hizo (sus palabras)
   frames  = ids de IMAGES o de VIDEOS, en orden
   low     = true si las fotos son de baja resolución (se muestran más chicas)
   watch   = link a la pieza terminada: { label, href } (href null = «cambiar después»; omitir = no se muestra)
             o { label, video: "<id de VIDEOS>" } para verla acá mismo */
const PROJECTS = [
  {
    slug: "brujas",
    cat: "ficcion",
    kind: "Cortometraje",
    title: "Brujas, viudas y viejas",
    year: "2025",                                // confirmado: su propio Readymag rotula el set de Brujas como 2025 (el mes no se muestra)
    where: "Facultad de Artes · UNLP",           // así figura en los créditos de «Testigo» (Departamento de Artes Audiovisuales, Facultad de Artes, UNLP); su carpeta dice «Facultad Nacional de La Plata»
    roles: ["Guion", "Dirección", "Coordinación de casting"],
    text: "Una cocina de brujas armada en estudio: caldero, hierbas colgadas y mucho verde. Imágenes del rodaje.",
    // watch: { label: "Ver cortometraje", href: "https://…" },   // botón al corto: va cuando haya link
    frames: ["hero-rodaje", "brujas-caldero", "brujas-mesa", "brujas-camara", "brujas-cocina", "brujas-tablet", "brujas-monitor", "brujas-perfil"],
  },
  {
    slug: "sol",
    cat: "ficcion",
    kind: "Microficción vertical",
    title: "Cuando el sol deja de salir",
    year: "Enero 2026",
    where: "HACK MAFIZ MÁLAGA",
    roles: ["Producción", "Guion", "Dirección"],
    credit: "Cámara: Wine Audiovisuales",        // CAMBIAR DESPUÉS: confirmar si se acredita y cómo
    text: "Rodaje nocturno en interior, con luz de gel violeta y ámbar y claqueta escrita a mano.",
    watch: { label: "Ver microficción", video: "sol-piloto" },   // el archivo se llama PILOTO.mp4
    low: true,
    frames: ["sol-claqueta", "sol-sonido", "sol-reflector", "sol-cortinas", "sol-celular", "sol-claqueta-2", "sol-claqueta-3", "sol-pared"],
  },
  {
    slug: "baby-amatista",
    cat: "clips",
    kind: "Videoclip",
    title: "Baby Amatista",
    where: "Roggero Alex",
    year: "Agosto 2025",
    roles: ["Producción", "Cámara", "Gaffer", "Coordinación de posproducción"],
    text: "Videoclip oficial, en estudio: luz roja, claveles y la cámara en estabilizador.",
    watch: { label: "Ver videoclip", href: "https://www.youtube.com/watch?v=BhZCUQqZd6o" },
    low: true,
    frames: ["baby-artista", "baby-encaje", "baby-gimbal", "baby-clavel", "baby-duo", "baby-rojo"],
  },
  {
    slug: "basado",
    cat: "clips",
    kind: "Videoclip",
    title: "Basado",
    where: "Dennis 133",
    year: "Septiembre 2026",
    roles: ["Producción", "Realización", "Cámara", "Luces"],
    text: "Videoclip en una sola toma, en luz cobre y con placas de título.",
    watch: { label: "Ver videoclip", href: "https://www.youtube.com/watch?v=kII1mxXlw44" },
    low: true,
    frames: ["basado-titulo", "basado-doble", "basado-road"],
  },
  {
    slug: "prohibido",
    cat: "clips",
    kind: "Producción audiovisual",               // CAMBIAR DESPUÉS: qué pieza es «Prohibido» (¿videoclip, sesión de fotos?) y si hay link
    title: "Prohibido",
    where: "Holly HH",
    year: "Agosto 2024",
    roles: ["Producción"],
    text: "Rodaje en un estudio de fondo blanco: cámara en estabilizador, maquillaje y una modelo con corsé y velo. Imágenes del backstage.",
    frames: ["prohibido-gimbal", "prohibido-foto", "prohibido-estudio", "prohibido-camara"],
  },
  {
    slug: "808",
    cat: "vivo",
    kind: "Evento en vivo",
    title: "808 Trap Party",
    year: "10 de mayo y 10 de agosto de 2024",
    roles: ["Producción", "Armado de guion", "Seteo completo para streaming multicámara", "Coordinación de stands, sponsors y talentos"],
    text: "Dos fechas de música en vivo, con streaming multicámara, feria de emprendimientos y una sala cuasi inmersiva en la de agosto.",
    frames: ["808-show", "808-cantante", "808-neon", "808-dj", "808-perfil", "808-vivo", "808-publico", "808-voz", "808-flash", "808-escena"],
  },
  {
    slug: "arena",
    cat: "vivo",
    kind: "Transmisión en vivo",
    title: "Arena Gamer · Burger King",
    year: "Octubre 2023 – diciembre 2024",
    roles: ["Producción", "Guiones", "Diseño de flyers y escenas para OBS", "Coordinación de talentos e influencers", "Idea creativa", "Hosting y transmisión en vivo"],
    text: "Un set gamer con transmisión por Twitch, ciclos con artistas y jurado, y ediciones benéficas.",
    low: true,
    frames: ["arena-set", "arena-obs", "arena-halloween", "arena-gamer", "arena-amigas", "arena-risas", "arena-ring", "arena-grupo"],
  },
  {
    slug: "sound-urbano",
    cat: "vivo",
    kind: "Streaming multicámara",
    title: "Sound Urbano",
    year: "Noviembre 2025",                      // CAMBIAR DESPUÉS: la carpeta dice noviembre de 2025 y la cámara, junio de 2025
    roles: ["Asistencia de producción", "Seteo de streaming multicámara", "Producción audiovisual y fotográfica"],
    text: "Una transmisión en vivo con varias cámaras, operada en OBS, frente a una pared de grafitis.",
    frames: ["sound-obs", "sound-podcast", "sound-camara"],
  },
  {
    slug: "fotografia",
    cat: "foto",
    kind: "Fotografía",
    title: "Fotografía",
    roles: ["Retrato de estudio", "Artistas en vivo", "Eventos sociales", "Marcas"],
    text: "Retratos de estudio, artistas en vivo, eventos y marcas: una selección de su fotografía.",
    frames: ["foto-gel-rojo", "foto-flores", "foto-sombra", "foto-cantante-verde", "foto-banda", "foto-jardinero",
             "foto-gel-naranja", "foto-humo", "foto-cantante-azul", "foto-pileta", "foto-flores-piso"],
  },
  {
    slug: "eventos-sociales",
    cat: "foto",
    kind: "Foto y video de eventos",
    title: "Eventos sociales",
    roles: ["Fotografía", "Video"],
    text: "Fiestas, cumpleaños, graduaciones y bodas: la cobertura en foto y en video.",
    frames: ["eventos-quince", "evento-brindis", "evento-escalera", "foto-cumple", "eventos-boda", "evento-graduado", "evento-biblioteca"],
  },
  {
    slug: "modelaje",
    cat: "moda",
    kind: "Actuación y modelaje",
    title: "Frente a cámara",
    roles: ["Actuación (Desencuentro, Axolotl)", "Modelaje", "Content creator"],
    text: "Actúa en cortos de la UNLP y hace modelaje y contenido para marcas.",   // CAMBIAR DESPUÉS: confirmar para qué marcas trabajó y quién hizo las fotos
    low: true,
    frames: ["actuacion-desencuentro", "modelaje-gorra", "actuacion-axolotl", "modelaje-detalle"],
  },
];

/* Lo mejor: la selección que muestra la página principal (la lista entera está en trabajos.html).
   slug = el proyecto · cover = una foto o un video de ese proyecto · pos = encuadre de la tapa (object-position).
   De preferencia, proyectos con video subido: los videos de tapa se reproducen solos, mudos, cuando
   la tarjeta se ve (la grande en escritorio; la que está a la vista en el celular) y al pasar el mouse; hay un botón para pausarlos. */
const FEATURED = [
  // la primera es la grande (en escritorio ocupa dos columnas y dos filas); las dos que siguen van arriba a la derecha
  { slug: "brujas",           cover: "hero-rodaje",       pos: "50% 45%" },
  { slug: "eventos-sociales", cover: "eventos-quince",    pos: "58% 50%" },
  { slug: "808",              cover: "808-show",          pos: "42% 50%" },
  { slug: "sol",              cover: "sol-loop",          pos: "50% 40%" },
  { slug: "prohibido",        cover: "prohibido-estudio", pos: "45% 50%" },
  { slug: "baby-amatista",    cover: "baby-artista",      pos: "50% 35%" },   // su video está en YouTube (link en el proyecto)
];

/* Texto de «Sobre mí»: sale de su Readymag (su voz, 2026-10-13), con las erratas corregidas ("profesionarlizarme", "iniciarian"…).
   Lema (quote): también es suyo, está en su Readymag. */
const ABOUT = {
  title: "Entre el set y el stream.",
  quote: "Habitar el instante a través de la imagen.",
  // CAMBIAR DESPUÉS: confirmar que es ella y que quiere usarla de retrato. Indicio fuerte: su propio Readymag usa esta foto
  // bajo «modelaje y actuación».
  photo: "modelaje-sillon",                     // su retrato de modelaje (gorra beige): el del baño pasó a la portada (2026-10-14)
  photoAr: 0.8,                                 // recorte vertical 4:5
  photoPos: "50% 40%",                          // la cara arriba del centro
  paragraphs: [
    "Soy Amelie, productora, guionista y filmmaker. Escribo, produzco y dirijo ficción corta: <em>Brujas, viudas y viejas</em> (2025) y <em>Cuando el sol deja de salir</em> (2026). También produzco videoclips para artistas de la escena urbana, como <em>Basado</em>, de Dennis 133, y <em>Baby Amatista</em>, de Roggero Alex.",
    "Escribo y fotografío desde 2015. Mis primeras producciones fueron en Río Negro, antes de la pandemia, en 2019, y trabajo profesionalmente en Buenos Aires desde 2023. Empecé atendiendo al público a muy temprana edad y emprendiendo por mi cuenta desde la adolescencia.",
    "También produzco y conduzco transmisiones en vivo y eventos: desde 2023 armé guiones y escenas para OBS y coordiné talentos e influencers en <em>Arena Gamer</em>, de Burger King, y en 2024 produje <em>808 Trap Party</em>.",
    "Estoy por recibirme de la Licenciatura en Artes Audiovisuales, con orientación en guion y especialización en producción ejecutiva, en la Universidad de La Plata. Me formé además en actuación frente a cámara, streaming, locución, maquillaje y estilismo.",
  ],
  stats: [
    { n: "16", label: "producciones audiovisuales" },   // contadas en CREDITS: 9 cortos (incluye los que están en producción) + 7 videoclips y piezas
    { n: "2",  label: "ficciones dirigidas" },
    { n: "15", label: "meses con Arena Gamer" },
  ],
};

/* Línea de tiempo de «Sobre mí». Fuentes: 2015, 2019 y «Buenos Aires desde 2023» salen de su Readymag; Arena Gamer (oct 2023),
   808 (2024), Brujas (2025) y Sol (enero 2026) salen de los nombres de carpeta y de las claquetas. */
const TIMELINE = [
  { year: "2015", text: "Empiezo con la escritura y la fotografía." },
  { year: "2019", text: "Primeras producciones, en Río Negro." },
  { year: "2022", text: "Primeros cortos en la Universidad Nacional de La Plata: Axolotl, sobre un cuento de Cortázar, y Desencuentro." },
  { year: "2023", text: "Trabajo profesionalmente en Buenos Aires. Empieza Arena Gamer, de Burger King." },
  { year: "2024", text: "Produzco 808 Trap Party, en mayo y en agosto, y los videoclips Prohibido y Marilyn Monroe." },
  { year: "2025", text: "Escribo y dirijo Brujas, viudas y viejas. Produzco Baby Amatista." },
  { year: "2026", text: "Dirijo Cuando el sol deja de salir. Produzco y realizo Basado." },
];

/* Créditos: todo lo audiovisual que hizo, con su rol. Sale de los NOMBRES DE LAS CARPETAS de contenido/ (ella escribe ahí
   proyecto, fecha, institución o artista y su rol), con las erratas corregidas. Los links salen de los .docx de cada carpeta
   (sin los parámetros de lista de reproducción). Varias carpetas están vacías (todavía sin material): igual son créditos.
   Orden: del más reciente al más viejo. play = id de VIDEOS para verlo acá; href = link externo. */
const CREDITS = [
  { year: "2026", title: "Paradise", kind: "Cortometraje · Facultad de Artes, UNLP", role: "Producción", note: "Desde agosto de 2026" },
  { year: "2026", title: "Involucrados", kind: "Cortometraje · tesis, ISER", role: "Producción", note: "Octubre de 2026" },
  { year: "2026", title: "Casi llegamos tarde", kind: "Teatro", role: "Guion y asistencia de producción", note: "Proyecto para noviembre de 2026" },
  { year: "2026", title: "Basado", by: "Dennis 133", kind: "Videoclip", role: "Producción, realización, cámara y luces", href: "https://www.youtube.com/watch?v=kII1mxXlw44" },
  { year: "2026", title: "Gardenia", kind: "Producción fotográfica y audiovisual", role: "Producción, cronograma y publicaciones en redes" },
  { year: "2026", title: "DJ Set", by: "Fiama Amorosi", kind: "Producción audiovisual", role: "Producción, dirección, cámara, dron y coordinación de posproducción" },
  { year: "2026", title: "Cuando el sol deja de salir", kind: "Microficción vertical · HACK MAFIZ MÁLAGA", role: "Producción, guion y dirección", play: "sol-piloto" },
  { year: "2025", title: "En los ojos de Estefan", kind: "Cortometraje en stop motion · Facultad de Artes, UNLP", role: "Producción y asistencia de dirección", note: "Noviembre de 2025 y octubre de 2026" },
  { year: "2025", title: "Feliz", kind: "Cortometraje · tesis, Facultad de Artes, UNLP", role: "Asistencia de producción y claqueta", href: "https://www.instagram.com/reel/DS9A20YEncD/" },
  { year: "2025", title: "Brujas, viudas y viejas", kind: "Cortometraje · Facultad de Artes, UNLP", role: "Guion, dirección y coordinación de casting" },
  { year: "2025", title: "Jf Ventilaciones", kind: "Contenido para marca", role: "Redes, producción fotográfica y audiovisual", note: "Septiembre a noviembre de 2025" },
  { year: "2025", title: "Baby Amatista", by: "Roggero Alex", kind: "Videoclip", role: "Producción, cámara, gaffer y coordinación de posproducción", href: "https://www.youtube.com/watch?v=BhZCUQqZd6o" },
  { year: "2025", title: "Lolly", by: "Yomikua ft. Gyano", kind: "Videoclip", role: "Asistencia de locación, coordinación y foto fija", href: "https://www.youtube.com/watch?v=uuvpL9e_u6Q" },
  // CAMBIAR DESPUÉS: qué es «By Chunilov» (¿su marca propia? «Chunilov» es su usuario de Twitch)
  { year: "2025", title: "By Chunilov", kind: "Contenido", role: "Producción, redes, coordinación de talentos e influencers, fotografía y audiovisual", note: "Desde 2025" },
  { year: "2024", title: "Fix You", by: "Diagonal 8", kind: "Videoclip · cover de Coldplay", role: "Asistencia de producción y foto fija", href: "https://www.youtube.com/watch?v=RjbCv3cOwqc" },
  { year: "2024", title: "Marilyn Monroe", by: "Nil Felox", kind: "Producción audiovisual", role: "Producción, dirección, cámara y posproducción" },
  { year: "2024", title: "Prohibido", by: "Holly HH", kind: "Producción audiovisual", role: "Producción" },
  { year: "2023", title: "Testigo", kind: "Cortometraje · Facultad de Artes, UNLP", role: "Guion, producción y posproducción de sonido", href: "https://www.youtube.com/watch?v=4LrHYMwForU" },
  { year: "2022", title: "Desencuentro", kind: "Cortometraje · UNLP", role: "Asistencia de producción, coordinación de locación y actuación", href: "https://www.youtube.com/watch?v=98QI5NbEuqA" },
  { year: "2022", title: "Axolotl", kind: "Cortometraje · UNLP · sobre el cuento de Julio Cortázar", role: "Producción y actuación", href: "https://www.youtube.com/watch?v=zeAttTqmIlk" },
];

/* «Qué hago»: sale de las secciones PRODUCCIÓN / REALIZACIÓN / FOTOGRAFÍA / AUDIOVISUALES / DE EVENTOS / CONTENT CREATOR de su
   Readymag (sus palabras, erratas corregidas). Se agrupó en 4 tarjetas. Se dejó afuera «pruebas de MVP» (no se entiende a qué
   se refiere: preguntarle) y «Coordinación de casting» sale del nombre de la carpeta de Brujas. */
const SERVICES = {
  title: "Qué hago.",
  lead: "Lo que me toca en cada proyecto, de la idea a la entrega.",
  items: [
    { n: "01", title: "Guion y realización",
      text: "Piezas audiovisuales que cubren todo el proceso creativo y técnico, con una mirada estética y narrativa propia.",
      list: ["Guion", "Dirección", "Rodaje y postproducción", "Coordinación de casting"] },
    { n: "02", title: "Producción audiovisual",
      list: ["Producción ejecutiva y asistencia de producción",
             "Presupuestos, catering, planes de rodaje, permisos y planillas",
             "Scouting y casting",
             "Planilla de gastos y tesorería; gestión de clientes y pagos",
             "Coordinación de pre, rodaje y postproducción: equipos técnicos y locaciones"] },
    { n: "03", title: "Producción de eventos",
      list: ["Sponsors, stands, artistas, talentos, comunidades y locaciones",
             "Hosting y streaming multicámara",
             "Equipo técnico y práctico de foto y filmmaking",
             "Guiones e ideas creativas de cada evento"] },
    { n: "04", title: "Fotografía y contenido",
      text: "Eventos, marcas, productos y proyectos artísticos, trabajando la composición, la iluminación y la narrativa visual.",
      list: ["Contenido para redes, marcas, emprendimientos y empresas",
             "Actuación y creación de contenido, con o sin guion",
             "Modelaje y fotoproducto"] },
  ],
};

/* confirmed:true = lo dijo ella o el material lo prueba. Si no, se muestra «cambiar después».
   Lista que pasó ella bajo "EDICIÓN": Lightroom, Premiere, Photoshop, CapCut, Pro Tools, DaVinci Resolve
   y "paquete de Office: sí". OBS Studio y Twitch salen de su trabajo en Arena Gamer.
   Programa de guion (ej. Final Draft) y de diseño (ej. Canva): NO se listan hasta que ella diga cuáles usa.
   La captura se cortaba en la línea de Office: confirmar si seguía con DISEÑO y GUION.
   icon = el dibujo que va al lado (lo que se HACE con la herramienta, no su logo): timeline (montaje) · color (corrección de
   color) · phone (edición en el celular) · sliders (revelado de foto) · layers (retoque por capas) · wave (audio) ·
   monitor (escenas de transmisión) · live (en vivo) · sheet (planillas y documentos). Sin icon, o con uno que no existe,
   va un ícono genérico. Los dibujos están en scripts/templates.js (TOOL_ICONS). */
const TOOLS = [
  { group: "Edición de video y foto", items: [
    { name: "Adobe Premiere Pro",  icon: "timeline", confirmed: true },
    { name: "DaVinci Resolve",     icon: "color",    confirmed: true },
    { name: "CapCut",              icon: "phone",    confirmed: true },
    { name: "Adobe Lightroom",     icon: "sliders",  confirmed: true },
    { name: "Adobe Photoshop",     icon: "layers",   confirmed: true },
  ]},
  { group: "Audio", items: [
    { name: "Pro Tools", icon: "wave", confirmed: true },
  ]},
  { group: "Transmisión", items: [
    { name: "OBS Studio", icon: "monitor", confirmed: true },
    { name: "Twitch",     icon: "live",    confirmed: true },
  ]},
  { group: "Oficina", items: [
    { name: "Paquete Office", icon: "sheet", confirmed: true },
  ]},
];

const CONTACT = {
  title: "¿Armamos algo?",
  lead: "Producción, guion, dirección o una transmisión en vivo: contame la idea.",
  /* Datos de TRABAJO que pasó ella por WhatsApp el 2026-10-13. href en null = «cambiar después».
     detail = lo que se ve junto al botón (para poder copiarlo).
     WhatsApp: wa.me/<54 + 9 + área sin 0 + número sin 15>  →  54 9 11 73850504 */
  channels: [
    { key: "whatsapp",  label: "WhatsApp",  detail: "11 7385-0504", copy: "+54 9 11 7385-0504",         href: "https://wa.me/5491173850504?text=" + encodeURIComponent("Hola Amelie, vi tu portfolio y quería consultarte por un proyecto.") },
    { key: "email",     label: "Email",     detail: "frumamelie@gmail.com", copy: "frumamelie@gmail.com", href: "mailto:frumamelie@gmail.com" },
    { key: "instagram", label: "Instagram", detail: "@amelie.frum",         href: "https://instagram.com/amelie.frum" },
  ],
  availability: "Consultar disponibilidad",     // sus palabras
};

const FOOTER = {
  credits: "Algunas imágenes pertenecen a las producciones y marcas mencionadas.",
  photoCredits: null,                           // ej: "Fotos: …" → null = «cambiar después»
};

/* ---------- fotos nuevas y carpetas nuevas, sin tocar código (npm run fotos; ver scripts/galeria.js y contenido/LEEME.txt) ----------
   · una foto nueva en una carpeta que ya existe se suma al FINAL de la galería del proyecto que más fotos de esa carpeta tiene;
   · una carpeta nueva en contenido/ arma sola un proyecto nuevo de fotografía. Lo que ya estaba al empezar no se toca (fotos-vistas.json). */
const { discover } = require("./scripts/galeria.js");
const { resolveDir } = require("./scripts/lib.js");
const ownerOf = (g) => {
  let best = null, top = -1;
  for (const p of PROJECTS) { const n = p.frames.filter((id) => IMAGES[id] && IMAGES[id].g === g).length; if (n > top) { top = n; best = p.slug; } }
  return best;
};
const FOUND = discover({ root: __dirname, source: SOURCE, groups: GROUPS, images: IMAGES, ownerOf, resolveDir, defaults: { cat: "foto", kind: "Fotografía" }, takenSlugs: PROJECTS.map((p) => p.slug) });
Object.assign(GROUPS, FOUND.groups);
for (const x of FOUND.photos) IMAGES[x.id] = { g: x.g, f: x.f, alt: x.alt, ...(x.genericAlt ? { genericAlt: true } : {}) };
for (const x of FOUND.photos) {
  if (FOUND.projects.some((p) => p.slug === x.project)) continue;          // las de un proyecto nuevo ya vienen en su frames
  const p = PROJECTS.find((q) => q.slug === x.project);
  if (!p) throw new Error(`La foto nueva ${x.f} va al proyecto «${x.project}», que no existe (revisá serie.json → destino)`);
  p.frames.push(x.id);
}
// este diseño no tiene desplegable: en un proyecto nuevo van todas en su galería
for (const np of FOUND.projects) { np.frames = [...np.frames, ...(np.more || [])]; delete np.more; }
PROJECTS.push(...FOUND.projects);
for (const im of Object.values(IMAGES)) im.dir = DIRS[im.g] || im.g;

module.exports = { SOURCE, NEW_SERIES_DIR, FOUND, GROUPS, IMAGES, VIDEOS, SITE, HERO, CATEGORIES, PROJECTS, FEATURED, ABOUT, TIMELINE, CREDITS, SERVICES, TOOLS, CONTACT, FOOTER };
