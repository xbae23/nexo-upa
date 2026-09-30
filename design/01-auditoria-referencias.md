# Nexo UPA · Fase 1 · Auditoría de referencias

Fecha de revisión: 29 de septiembre de 2026, zona America/Mexico_City.

Estado: investigación visual y documental ampliada. No es una especificación final ni una certificación de réplica al 100 %. No se ha escrito ni modificado código de la app para esta fase.

## 1. Alcance y precedencia

El nuevo brief es la fuente de verdad: SOLO DISEÑO; blanco + verde; estructura de X e Instagram; acabado de Rythm, Cash App, Ctrl y Sugar. El código experimental previo queda conservado, pero su paleta guinda/crema no es una propuesta válida para este brief. Despliegue y GitHub quedan fuera de esta fase.

Suposición de trabajo: se conservan las reglas funcionales UPA ya pedidas, sin incorporar funciones nuevas de las referencias. La fase de pantallas se limitará al inventario del brief. Las discrepancias de alcance se registran, no se resuelven añadiendo pantallas silenciosamente.

Jerarquía: identidad blanco/verde > patrones X/Instagram > acabado complementario. Consistencia > minimalismo > originalidad. Sin modo oscuro en esta entrega.

### Convención de evidencia

- **V**: visto en captura, página o demostración accesible. Describe esa versión, no todas las versiones del producto.
- **D**: descrito por documentación oficial. No demuestra geometría, color ni animación exacta.
- **M**: medida calculada del elemento renderizado en el navegador, en el viewport indicado. No es un token de UPA.
- **P**: decisión/requisito propio de UPA; no se atribuye a una referencia.
- **NV**: no verificado. No significa inexistente.

No se extraen tamaños CSS, tipografías exactas ni duraciones de animación de una captura reescalada. La fecha de consulta tampoco se confunde con la fecha de la captura.

## 2. Acceso directo a las seis referencias

| Referencia | Resultado | Qué permite auditar | Qué no permite concluir |
|---|---|---|---|
| [X](https://x.com/) | Navegador: pantalla pública de acceso. Lector web: 403 | Entrada pública, controles de acceso | Feed, perfil, composer, DM y estados de una sesión autenticada |
| [Instagram](https://www.instagram.com/) | Navegador: pantalla de acceso. Lector web: 429 | Entrada pública, campos y acciones de acceso | Arquitectura completa y estados autenticados actuales |
| [Rythm](https://rythm.fm/) | Aplicación musical pública accesible | Controles, búsqueda, navegación, tarjetas, tipografía | Todo el sistema de variantes y estados de su producto |
| [Cash App /new](https://cash.app/new) | Página de lanzamiento accesible con JavaScript | Intro, jerarquía tipográfica, tarjetas, CTA | UI bancaria completa; la página corresponde al lanzamiento de otoño de 2025 |
| [Ctrl](https://ctrl.xyz/) | Sitio de marketing accesible con aviso de cierre | CTA, titular, navegación, FAQ, formulario | Producto operativo: el aviso informa cierre el 19 de agosto de 2026 |
| [Sugar](https://sugar-app.webflow.io/) | Landing accesible | Presentación secuencial, progreso segmentado, CTA, tipografía | Funciones reales de la app ni estados de un feed operativo |

No se inició sesión, no se solicitaron credenciales ni se realizaron acciones sociales, registros o suscripciones.

## 3. Fuentes alternativas de X e Instagram

### Fuentes inspeccionadas visualmente

| ID | Fuente y fecha | Evidencia útil | Límite |
|---|---|---|---|
| IG-V1 | [Meta: funciones para conectar](https://about.fb.com/news/2025/08/new-instagram-features-help-you-connect/), 6 agosto 2025; [captura oficial](https://about.fb.com/wp-content/uploads/2025/08/01_Repost_Carousel-02.jpg?fit=1920%2C1672) | Perfil móvil y feed: avatar circular, estadísticas, bio, botones de perfil, pestañas, grid de tres columnas, stories arriba, autor/menú/medio/acciones, barra inferior | Material promocional oficial de esa fecha; no prueba despliegue idéntico actual en México ni valores CSS |
| IG-V2 | [Meta: actualizaciones de DM](https://about.fb.com/news/2024/03/instagram-dm-updates/), marzo 2024; [captura de bandeja](https://about.fb.com/wp-content/uploads/2024/03/03_Pin-Chat.jpg?fit=960%2C836) | Cabecera contextual, notas sobre avatares, pestañas, lista con avatar/nombre/extracto/tiempo, puntos de actividad y no leído, menú de una conversación | Versión de 2024. Los puntos de no leído son azules en esta captura; no se describen como rojos |
| IG-V3 | [Meta: stickers de Stories](https://about.fb.com/news/2024/05/new-stickers-in-instagram-stories/), mayo 2024; [visor](https://about.fb.com/wp-content/uploads/2024/05/02_Frames.jpg?w=960&resize=960%2C836) | Story vertical, progreso superior, autor/tiempo, menú/cierre, respuesta y acciones inferiores | Captura estática: no confirma gestos ni timing. No se incorporan los stickers a UPA |
| X-V1 | [Trekhleb: análisis de timeline](https://trekhleb.dev/blog/2024/api-design-x-home-timeline/), 12 diciembre 2024; [captura desktop](https://trekhleb.dev/static/cb6b75eb6eb338b77c7fa05cc9bb7c06/3acf0/02-home.jpg) | Navegación izquierda; timeline central con Para ti/Siguiendo; búsqueda y sugerencias a la derecha; anatomía de post, medio y acciones | Fuente externa, histórica y anotada. El marco/flecha rojos son anotaciones del autor, NO UI de X. No se usan sus inferencias de API como requisitos |
| X-V2 | [X en App Store, publicado por X Corp.](https://apps.apple.com/us/app/x/id333903271), consultado en esta auditoría | La primera imagen promocional muestra fragmentos de posts, avatares, nombres, texto y contadores en móvil | Marketing en perspectiva y tema oscuro: no sirve para medir geometría ni certificar navegación completa de la versión vigente |

### Fuentes oficiales funcionales

| Área | Qué documenta | Fuente |
|---|---|---|
| X · feed | Para ti combina recomendaciones y seguidos; Siguiendo contiene cuentas seguidas; cambio de vista y apertura del detalle | [Timeline](https://help.x.com/en/using-x/x-timeline) |
| X · crear | Texto, enlaces, fotos, GIF y vídeo; control de publicación y contador | [Cómo publicar](https://help.x.com/en/using-x/how-to-post) |
| X · repost/cita | Repost, comentario añadido, resaltado activo y posibilidad de deshacer | [Repost](https://help.x.com/en/using-x/how-to-repost) |
| X · guardados | Guardado privado y confirmación de la acción | [Bookmarks](https://help.x.com/en/using-x/bookmarks) |
| X · conversación | Respuesta contextual y subconversaciones | [Conversaciones](https://help.x.com/en/using-x/x-conversations) |
| X · respuestas | Anidación y ordenación de respuestas | [Recomendaciones de conversaciones](https://help.x.com/en/resources/recommender-systems/conversations-recommendations) |
| X · perfil | Foto, cabecera, nombre, bio y post fijado; sus medidas de archivo no equivalen a tamaños en pantalla | [Personalizar perfil](https://help.x.com/en/managing-your-account/how-to-customize-your-profile) |
| X · notificaciones | Actividad, menciones, respuestas y seguidores, con filtros | [Notificaciones](https://help.x.com/en/managing-your-account/understanding-the-notifications-timeline) |
| X · mensajes | Navegación a mensajes, historial, adjuntos, solicitudes y lectura configurable | [Mensajes directos](https://help.x.com/en/using-x/direct-messages) |
| Instagram · feed | Vistas de seguidos/favoritos frente al feed recomendado | [Vistas de feed, 2022](https://about.fb.com/news/2022/03/two-new-ways-to-control-your-instagram-feed/) |
| Instagram · repost | Repost público con autor original y pestaña en el perfil | [Reposts, 2025](https://about.fb.com/news/2025/08/new-instagram-features-help-you-connect/) |
| Instagram · DM | Respuestas con medios/voz, temas de chat y controles de lectura | [DM, 2024](https://about.fb.com/news/2024/03/instagram-dm-updates/) |
| Instagram · notas | Notas en la bandeja y respuestas que llegan por DM | [Notas, 2022](https://about.fb.com/news/2022/12/sharing-features-on-instagram-notes-group-profiles-and-more/) |
| Instagram · tablet | Vista de mensajes con lista e hilo simultáneos; aprovecha pantalla grande | [Instagram para iPad, 2025](https://about.fb.com/fr/news/2025/09/decouvrez-instagram-pour-ipad-concu-pour-les-grands-ecrans/) |
| Instagram · cambios de navegación | Anuncio de DM al centro y Reels en segunda posición; distingue prueba Reels-first de India de simplificación anunciada globalmente | [Navegación, 28 septiembre 2025](https://about.fb.com/news/2025/09/in-india-instagram-debuts-a-reels-first-experience-for-its-mobile-app/) |

Las fuentes de lanzamiento documentan comportamientos en su fecha. No demuestran por sí solas una versión universal de 2026. No se copian todas sus funciones ni sus límites de producto.

### Galerías secundarias localizadas, no tomadas como fuente de verdad

- [Uiland: flujo Home de Instagram](https://uiland.design/screens/instagram/screens/1cd8f3a4-8a22-4f6b-a71d-2a1ee8fce6c3/flows/home): parte pública limitada; imágenes con fecha aparente 2024 en el nombre del archivo, sin versión certificada. No se sortea el acceso restringido.
- [AppFuel: navegación de Twitter](https://theappfuel.com/examples/twitter_navigation): útil como archivo histórico, no como evidencia de X actual.
- [Opera: Instagram en escritorio](https://www.opera.com/es/features/instagram): confirma contexto de uso web y acceso a feed/historias/DM; una vista embebida en el navegador no equivale al layout desktop completo de Instagram.

Se descartan como prueba del producto real los rediseños conceptuales de Figma/Dribbble y los clones. Pueden ser inspiración, pero el brief pide evidencia de X/Instagram.

## 4. Arquitectura y modelos: evidencia por función

| Función | Patrón comprobado | Aplicación prevista a UPA | Pendiente / restricción |
|---|---|---|---|
| Navegación primaria | X-V1: sidebar y centro/derecha. IG-V1: barra inferior móvil y cabecera local | Misma familia de estructura: móvil con navegación inferior; desktop con navegación lateral | Orden exacto final se fijará en fase 4, no mezclando distintas versiones de IG |
| Feed | X-V1 e IG-V1: autor → contenido → acciones; contenido textual y visual | Publicaciones normales, Report y Notify dentro de un mismo modelo de post | Sus límites son UPA, no de las referencias |
| Post de texto | X-V1: avatar al inicio, nombre/handle/tiempo, menú, texto, medios opcionales, contadores | Dar prioridad a lectura y conversación | Sin copiar textos, nombres o fotos del ejemplo |
| Post visual | IG-V1: medio dominante; barra de acciones posterior, guardar separado | Fotos y vídeos de hasta 30 s | No inventar relación de aspecto definitiva a partir de imagen promocional |
| Up!, comentar, compartir | IG-V1/X-V1 verifican iconos y contadores inactivos; docs verifican acciones | Up! sustituye el nombre de like; feedback verde según brief | Doble toque, animación exacta y todos los estados activos: NV en sesión viva |
| Repost/cita | Docs X y Meta describen atribución y reutilización del contenido | Mantener autor original; diferenciar repost de comentario añadido | No duplicar artificialmente la autoría |
| Guardar | Docs X: privado; control visible en IG-V1 | Estado guardado consistente en feed/detalle/perfil | Detalle visual de colecciones de IG: NV; no añadir colecciones nuevas |
| Composer | Docs X: texto y adjuntos, publicar, contador | Composer único con tipos solicitados | Público/audiencia/borradores se especificarán sin atribuir medidas no observadas |
| Perfil | IG-V1: avatar, bio, conteos, acciones, tabs y grid; docs X aportan cabecera textual | Mezcla coherente de perfil social + publicaciones/medios | Grid de la captura es tres columnas; no se afirma que todo desktop actual conserve tres |
| Stories / Dumps | IG-V1: carrusel y anillos. IG-V3: visor con progreso y respuesta | Dumps de 3 h y vídeo de hasta 25 s; visibles a la comunidad | Gestos/pausa/expiración durante apertura requieren diseño explícito, no inferido de foto |
| Explorar | Docs X: búsqueda/tendencias; ficha oficial de Instagram describe descubrimiento | Encontrar contenido y personas UPA | La configuración visual actual de resultados de IG no está comprobada aquí |
| Notificaciones | Docs X: lista de actividad y filtros | Actividad social y reglas Notify/Report de UPA | Sus categorías no autorizan agregar nuevos módulos |
| Mensajes · lista | IG-V2: notas, avatares, extracto, tiempo y estados de lectura/actividad | Chats rápidos, notas si se conserva ese requisito, presencia | No se copian canales, mapa ni funciones de pago |
| Mensajes · hilo | Docs Meta/X: conversación, adjuntos, temas, controles de lectura | Fotos, enlaces, audio, archivos hasta 10 MB; conversación caduca a los 7 días desde primer mensaje | Diseño del contador/aviso de caducidad es UPA; no es la regla de IG |
| Comentarios anidados | Docs X describen subconversaciones y detalle | Jerarquía legible sin perder contexto del post | Profundidad y colapso exactos no demostrados visualmente |
| Vacío/error/carga/offline | Cobertura pública insuficiente para todos los casos | Se deberán diseñar en fase 4, señalados como decisiones propias | No se declaran copias de estados reales de X/IG |

### Relaciones documentadas de contenido

Una cuenta publica contenido; un post conserva su autor y puede tener medios, respuestas, reacciones y reposts. Un repost referencia al original. Un perfil agrupa la identidad y sus publicaciones. La bandeja lista conversaciones y el hilo contiene mensajes/adjuntos. Una story se abre desde su avatar/carrusel. Las notificaciones llevan al contenido o perfil que origina la actividad.

Este mapa describe relaciones, no rutas técnicas ni un modelo de base de datos. La implementación está fuera de esta entrega.

## 5. Auditoría de acabado de las referencias complementarias

Las cifras siguientes son observaciones, NO tokens de Nexo UPA. Se normalizarán después sobre escala 4/8 y accesibilidad. Paletas, logos y assets de estos sitios quedan excluidos.

### Botones y tipografía: mediciones reproducibles

| Fuente / muestra | Viewport observado | Altura / padding / radio / borde | Tipografía declarada | Motion declarado en CSS, no prueba de todos los estados |
|---|---|---|---|---|
| Rythm · crear cuenta | Desktop 1280 × 720 | 38 px; 11 × 15 px; radio 100 px; sin borde | Saans, 13 px, peso 500 | background-position 500 ms |
| Rythm · iniciar sesión | Desktop 1280 × 720 | 38 px; 11 × 15 px; radio 100 px; sin borde | Saans, 13 px, peso 500 | color/fondo/borde 200 ms |
| Rythm · siguiente carrusel | Desktop 1280 × 720 | 48 × 48 px; radio 50 %; borde 1 px | Icono | transición declarada 200 ms |
| Rythm · tarjeta de contenido | Desktop 1280 × 720 | Alto 300 px; radio 10,5 px; sin padding/borde | Jerarquía de título y autor | Transiciones cromáticas 200 ms |
| Rythm · heading de género | Desktop 1280 × 720 | Sin contenedor decorativo | Saans, 19 px, peso 700 | No se adopta su interlineado compacto como regla UPA |
| Cash · CTA fijo de registro | Desktop 1280 × 720 | 50 px alto; 260 px ancho; interior 25 px horizontal; capa visual radio 40 px | Cash Sans, texto 16 px, peso 400 | Transformaciones y colores 250 ms |
| Cash · heading de sección | Desktop 1280 / móvil 375 | Medida tipográfica, no tamaño de tarjeta | 42/42 px desktop; 30/36 px móvil; peso 400 | Intro observada; su duración total no medida |
| Ctrl · botón Download | Móvil 375 × 812 | 46,875 px alto; padding horizontal 26,042 px; radio 41,667 px; borde 2 px | Tomato Grotesk, 16,667 px, peso 500 | Borde 500 ms, cubic-bezier(0.165, 0.84, 0.44, 1) |
| Ctrl · botón menú | Móvil 375 × 812 | 46,875 px alto; radio 100 % | Icono | Estado abierto/cerrado no medido en esta pasada |
| Ctrl · titular principal | Móvil 375 × 812 | Sin caja de contenido social | Tomato Grotesk, 57,292 px, peso 600 | No extrapolar tamaño de landing a feed |
| Sugar · heading inicial | Móvil 375 × 812 | Jerarquía editorial centrada | Haffer, 39,375 px; interlineado 35,438 px; peso 400 | Presentación secuencial observada |
| Sugar · enlace de waitlist del footer | Móvil 375 × 812 | 27,094 px alto; radio pill; texto con padding 6,275 / 12,551 / 8,284 px | Haffer, 12,551 px; texto peso 500 | 400 ms, cubic-bezier(0.5, 0.75, 0, 1) |

Importante: la muestra de Sugar medida es el enlace del footer, NO el CTA grande del hero. Las alturas menores de 44 px vistas en referencias no se reproducirán como área táctil en UPA.

### Cobertura de componentes y variantes

| Categoría exigida | Rythm | Cash /new | Ctrl | Sugar |
|---|---|---|---|---|
| Primario / pill | V/M, crear cuenta | V/M, CTA fijo | V/M, descargar | V, CTA; M, enlace footer |
| Secundario / ghost | V/M, iniciar sesión sin relleno destacado | NV como variante reutilizable | V, enlaces secundarios | V, enlaces de navegación |
| Botón icono | V/M, carrusel y reproductor | V, flecha del CTA | V/M, menú | NV como sistema de variantes |
| Destructivo | NV | NV | NV | NV |
| Input | V/M, búsqueda; la altura medida del input no es la del contenedor completo | V, formulario de idea | V, newsletter | Formulario externo no auditado |
| Chips / tabs | V, selección/nav/categorías; no biblioteca completa | NV | NV como chips/tabs de app | V, indicadores de presentación; no tabs de app |
| Cards | V/M, medios con esquinas contenidas | V, mosaico de funciones | V, bloques de funciones | V, paneles e imágenes de presentación |
| Modales | NV en esta auditoría | NV en esta auditoría | Aviso actual visible en página, no se supone modal | NV |
| Toasts | NV | NV | NV | NV |
| Badges | NV como sistema | NV como sistema | NV como sistema | NV como sistema |
| Motion | Declaraciones CSS medidas; feedback real completo NV | Intro observada; transiciones CSS | Transiciones CSS | Progreso/paneles observados; transiciones CSS |
| Tono | Funcional y directo | Beneficio breve y acción clara | Titulares cortos con verbo | Cercano, social y participativo |

### Estados de botones: no confundir disponibilidad con prueba

| Estado | Evidencia disponible | Tratamiento de auditoría |
|---|---|---|
| Default | V/M en las cuatro referencias | Base de proporciones y jerarquía |
| Hover | CSS declarado en varias muestras, sin recorrido sistemático | NV del comportamiento completo; no prometer igualdad |
| Focus | No se registró recorrido de teclado completo | NV; se definirá foco accesible propio |
| Pressed | No se documentó pulsación mantenida | NV |
| Loading | No se enviaron formularios ni se crearon cuentas | NV |
| Disabled | Rythm muestra controles de reproducción deshabilitados; X/IG muestran continuar/acceso deshabilitado sin datos | V de esos casos concretos; no extrapolar a todas las variantes |

## 6. Matriz de coincidencias y resolución de contradicciones

| Referencia | Qué se toma | Elemento UPA | Conflicto detectado | Resolución |
|---|---|---|---|---|
| X | Timeline textual, identidad compacta, respuestas/reposts, estructura desktop | Feed, post, comentario, sidebar, panel derecho | Sidebar incluye productos y suscripciones fuera de alcance | Conservar patrón; no copiar esas secciones |
| Instagram | Medio dominante, stories, perfil con grid, acciones sociales, bandeja | Post visual, Dumps, perfil, mensajes | Existen distintas barras inferiores documentadas | Mantener una sola arquitectura UPA; fecha/versionado de la inspiración explícitos |
| X + Instagram | Autor reconocible y acciones consistentes | Tarjeta única con variantes texto/media | Densidad de texto y de imagen distinta | Variantes del mismo componente; no dos sistemas visuales |
| Instagram | Estado de reacción y actividad reconocible | Up!, badge, no leído | No todos los estados originales son rojos | Verde por decisión de UPA; el mapa no falsea el color original |
| Rythm | Controles compactos, iconos contenidos, jerarquía clara | Botones icono, listas, búsqueda | Tema oscuro, gradiente en CTA y alturas menores de 44 px | Excluir paleta/gradiente; elevar área táctil al requisito UPA |
| Cash | CTA legible, esquinas suaves, copy orientado a acción | Botón primario y énfasis puntual | Intro animada protagonista y paleta muy saturada | No añadir intro al uso cotidiano ni adoptar su paleta |
| Ctrl | Peso tipográfico claro, botones redondeados | CTA y cabeceras | Tipografía de landing demasiado grande; producto cerrado | Tomar proporción/énfasis, no escala literal ni supuesta funcionalidad viva |
| Sugar | Cercanía del lenguaje y progreso segmentado | Copy y referencia secundaria del visor | 3D, inclinaciones, animación promocional y fondos decorativos | Descartar decoración; Stories se rige primero por Instagram |
| Todas | Separación entre acción principal y secundaria | Familia de controles | Sus bibliotecas completas no son públicas | Definir estados UPA en fase 3 y etiquetarlos como diseño propio |

No se usan las fuentes tipográficas comerciales de estas referencias como assets. Su nombre se registra solo como observación. La familia tipográfica UPA se decidirá en tokens con disponibilidad y licencia apropiadas.

## 7. Mapa de sustitución de color

Es un mapa semántico, no una afirmación de que Instagram use rojo en cada caso. Los valores hexadecimales y ratios pertenecen a fase 2 y aún no están fijados.

| Uso de referencia / brief | Estado UPA | Sustitución requerida | Señal adicional al color |
|---|---|---|---|
| Corazón/like activo | Up! activo | Verde primario; no rojo | Icono activo y estado pulsado accesible |
| Like inactivo | Up! inactivo | Casi negro/gris neutro | Contorno y etiqueta de acción |
| Badge de actividad | Actividad nueva | Fondo verde + cifra de alto contraste | Número y etiqueta accesible |
| Punto de no leído (azul en IG-V2) | Conversación sin leer | Verde primario | Nombre/extracto con énfasis y estado «Sin leer» |
| Conteo nuevo | Nuevos elementos | Verde primario o texto bosque sobre verde suave | Cifra y descripción |
| Acento de acción destacada | Publicar / enviar / seguir | Verde primario | Texto inequívoco; no depender de tono solamente |
| Repost activo | Repost de la persona | Verde primario | Estado activo y posibilidad de deshacer |
| Guardado activo | Contenido guardado | Verde primario | Icono lleno y etiqueta «Guardado» |
| Anillo de historia sin ver | Dump disponible | Única excepción de degradado: verde → menta → teal | Estado accesible de no visto |
| Anillo visto | Dump ya visto | Neutro | Estado «Visto» |
| Presencia | Persona activa | Verde con texto de estado | «Activo» / «No activo»; independiente de no leído |
| Confirmación | Acción realizada | Verde semántico | Mensaje breve de éxito |
| Error / acción destructiva | Fallo / eliminar | Rojo desaturado permitido; NO convertirlo a éxito verde | Icono y mensaje de error o verbo destructivo |
| Aviso preventivo | Atención | Ámbar semántico | Explicación; no alerta roja decorativa |
| Información | Aviso neutral | Teal semántico cuando sea necesario | Texto informativo |
| Report de UPA | Publicación urgente/perdido/encontrado | Tratamiento verde/neutro con etiqueta explícita | No usar rojo solo para llamar la atención |

Regla por pantalla: un acento dominante verde y, como máximo, un apoyo visible. Cuando compitan varios semánticos, priorizar el estado que necesita acción y resolver otros mensajes con texto/icono neutros. El error conserva siempre su semántica; no se pinta de verde para satisfacer una regla decorativa.

La regla cromática se aplica a la UI propia, no a recolorear fotografías o vídeos que suban los usuarios. No habrá degradados decorativos fuera del anillo de Dumps ni sombras pesadas.

## 8. Reglas UPA preservadas, no extraídas de Instagram/X

| Requisito original | Estado de diseño |
|---|---|
| Normal ilimitado, notificación a amigos | Conservado; «ilimitado» se refiere a cantidad de posts, no a caracteres |
| Notify 2/día y Report 2/día sin acumular | Conservado como cuotas independientes |
| Report para urgencias, perdido/encontrado | Conservado; no se confunde con denunciar contenido a moderación |
| Ofertas de estudiantes | Conservado en el modelo de contenido; ubicación exacta pendiente sin agregar una pantalla no incluida en el nuevo inventario |
| Fotos/vídeos de post hasta 30 s | Conservado |
| Dumps hasta 25 s, caducidad 3 h, para toda la comunidad | Conservado |
| Up!, seguir, repost y comentarios | Conservado |
| Chat: archivos 10 MB, fotos, audio, links, temas y presencia | Conservado |
| Hilo temporal: 7 días desde el primer mensaje | Conservado; nuevos mensajes no reinician el plazo |
| Acceso/registro con correo | Sigue siendo requisito anterior; integración visual con el inventario nuevo pendiente. No se diseñará almacenamiento inseguro de contraseñas |
| PWA móvil iPhone/Android | Contexto responsive; instalación/hosting no se implementan en esta fase |

## 9. Cobertura pendiente y criterio para avanzar

La búsqueda externa resolvió la ausencia de acceso a feeds, perfil, stories y bandeja, aportando referencias públicas reales. No se requiere entrar a una cuenta personal para continuar documentando patrones.

Todavía no están verificados como UI viva actual: todos los estados hover/focus/pressed/loading, doble toque, velocidad/curvas reales de animación, errores/offline, composición completa de Instagram desktop y ciertas variantes autenticadas de comentarios/composer.

Esos huecos se mantienen como NV. Para afirmarlos como réplicas exactas harían falta capturas o grabaciones de las versiones objetivo. Para diseñar soluciones UPA se pueden definir posteriormente decisiones propias explícitas; eso no convierte lo desconocido en un dato de la referencia.

### Control de fase

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Intentar las seis URL del brief | Sí | Sección 2 |
| Buscar fuentes alternativas de X/IG | Sí | Sección 3 |
| Distinguir oficial / tercero / archivo histórico | Sí | Convención y registro de fuentes |
| Separar medidas reales de estimaciones | Sí | Solo medidas DOM en sección 5; sin medidas inventadas de capturas |
| Matriz de coincidencias | Sí | Sección 6 |
| Mapa de sustitución de color | Sí | Sección 7 |
| Todos los estados de referencias verificados | No | Lista NV en secciones 4, 5 y 9 |
| Fases 2–6 terminadas | No | No se ha pasado a tokens, componentes, pantallas, motion ni DoD final |
| Código de app modificado para este brief | No | Trabajo limitado a investigación y documentación |

Esta auditoría no se etiqueta «100 % completada» ni se presenta como una demo desplegada. Los incumplimientos y límites están visibles para que las fases siguientes no se apoyen en datos inventados.
