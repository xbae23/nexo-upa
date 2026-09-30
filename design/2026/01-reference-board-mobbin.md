# Nexo UPA 2026 · Fase 1: tablero de referencias Mobbin

Fecha de consulta: 29 de septiembre de 2026. Precede a cualquier diseño nuevo. Se inspeccionaron fichas públicas con imagen cargada de **diez apps**: Instagram, Facebook, Threads, X, Nextdoor, Orb Social, Yik Yak, Saturn Calendar, Snapchat y Headspace. Las imágenes de pantallas públicas miden aproximadamente 194 px de ancho; la mayoría de los flows completos y la descarga en alta resolución solicitan acceso a Mobbin. Se encontró **un flow público con video reproducible** de Headspace. El MCP `mobbin` aparece configurado en `codex mcp list`, pero no está expuesto como herramienta en esta sesión. Por eso el nivel de evidencia es **captura pública/miniatura más título/descripción**, salvo el tramo observado de video de Headspace; no hay sesión autenticada ni estudio de medidas o gestos.

Convención: **V** = imagen pública observada; **D** = título/descripción/categoría de la ficha; **NV** = no verificado. “Qué tomo” es una decisión original de Nexo inspirada en el patrón, no una afirmación de que copiamos esa app. La columna Motion solo describe animación vista directamente; **una captura estática no prueba movimiento, duración ni gesto**.

## Reference Board · 10 apps

| App | Pantalla pública comprobada | Qué tomo | Cómo lo adapto a Nexo UPA | Motion |
|---|---|---|---|---|
| Instagram | [Add to story](https://mobbin.com/explore/screens/15edad4b-f6b7-4aaa-acf3-31c62f2d742a) (V/D) | Entrada directa a crear una historia con medios recientes y controles de cámara. | Cámara del Dump de 3 h, galería y acceso a preview, con límite de video de 25 s y controles de alto contraste propios. | NV; foto fija. |
| Facebook | [Reel View](https://mobbin.com/explore/screens/06b7f322-18a1-4830-9cee-157f7381e143) (V/D) | Medio vertical como foco, acciones y respuesta en segundo plano visual. | Video corto de la comunidad con Up!, comentario y compartir; reproducción solo cuando visible y límites UPA. No copiar interfaz de Meta. | NV; foto fija. |
| Threads | [Reply Composition](https://mobbin.com/explore/screens/c6f17190-7b64-4143-b657-1b114fc25dbe) (V/D) | Contexto de respuesta, entrada de texto y panel inferior. | Compositor de comentarios/respuestas con padre visible y botón claro; el GIF observado es candidato P1, no una función P0 asumida. | NV; foto fija. |
| X | [All Notifications](https://mobbin.com/explore/screens/daab40f4-ac54-4642-b354-a665062e4970) (V/D) | Actividad ordenada en una superficie dedicada con pestaña de conjunto. | Actividad de Nexo diferenciando Up!, comentario, follow, Notify y Reporte; marcar leído y deep link. Push depende del servidor. | NV; foto fija. |
| Nextdoor | [Home Feed](https://mobbin.com/explore/screens/2aeb4bc9-a474-4696-92b6-5f1b3994a0a9) (V/D) | Relevancia geográfica/comunitaria y navegación inferior. | Relevancia de campus y ubicación de ayuda, sin publicidad ni inferir geolocalización de estudiantes. | NV; foto fija. |
| Orb Social | [Home Feed](https://mobbin.com/explore/screens/c2a535cc-6e63-4ac5-88ee-38ba48e9f946) (V/D) | Tarjeta social con autor identificable y continuidad vertical. | Un solo PostCard con variantes texto/medio/venta/urgencia; conservar identidad verde UPA y el nombre Up!. | NV; foto fija. |
| Yik Yak | [Yak Details](https://mobbin.com/explore/screens/2358a5c6-385d-46a7-bded-76b8439b8fc6) (V/D) | Detalle de conversación comunitaria con comentarios y campo de respuesta. | Hilo de campus legible con respuestas anidadas; no adoptar anonimato ni reputación ajena. | NV; foto fija. |
| Saturn Calendar | [Activity Notification](https://mobbin.com/explore/screens/cd4b9b80-6d23-49c7-99b9-79e5443d7c62) (V/D) | Actividad con contexto inmediato y legibilidad de información local. | Alertas útiles para horarios/eventos de UPA solo cuando existan datos reales; no trasladar clima ni agenda sin fuente. | NV; foto fija. |
| Snapchat | [Camera View](https://mobbin.com/explore/screens/09676419-0724-48f6-ad02-dbe9c6dd628c) (V/D) | Cámara a pantalla completa y acción principal evidente. | Modos Post/Dump/Video, disparador propio, galería, foco, zoom y alternativas accesibles. La lógica y colores son de Nexo. | **NV** en esta ficha: no se vio video ni interacción. |
| Headspace · referente de motion | [Onboarding, pestaña Video](https://mobbin.com/explore/flows/7cdc08c0-3bcb-4882-90dd-5cf92019616f?tab=video) (video observado) | Transición ilustrada coherente con una instrucción de respiración: se vio “Breathe out” y luego “Welcome to Headspace”. | Tomar el principio de movimiento que **explica un cambio de estado**; en Nexo aplicarlo a captura, confirmación y transiciones de contenido con forma/color propios. No usar personaje, marca, paleta ni copiar la secuencia. | **V parcial**: video público reprodujo (38.13 s en total; fotogramas observados aprox. 4.74–8.72 s). No se midieron curva, duración de cada transición ni interacción de entrada. |

Estas fichas pertenecen a productos y versiones capturados por Mobbin; no demuestran el estado universal de septiembre de 2026. La columna de adaptación es una decisión de diseño de Nexo, pendiente de prototipo y pruebas.

## Cobertura de patrones solicitados por el skill

| Patrón | Evidencia pública comprobada | Aplicación / límite de evidencia |
|---|---|---|
| Camera | [Instagram Add to story](https://mobbin.com/explore/screens/15edad4b-f6b7-4aaa-acf3-31c62f2d742a), [Snapchat Camera View](https://mobbin.com/explore/screens/09676419-0724-48f6-ad02-dbe9c6dd628c) | Estructura visible; tap/hold/foco/zoom son requisitos del skill, no gestos demostrados por la captura. |
| Stories | [Instagram Story View](https://mobbin.com/explore/screens/c185e307-d66d-4a30-854a-8c1b09443c64) | Jerarquía de visor/progreso; caducidad Nexo de 3 h es propia. |
| Reels | [Facebook Reel View](https://mobbin.com/explore/screens/06b7f322-18a1-4830-9cee-157f7381e143) | Composición inmersiva visible; autoplay/snap/precarga son especificación Nexo, no verificación de esta ficha. |
| Post card | [Instagram Feed](https://mobbin.com/explore/screens/a72f8d36-7a0a-4109-b858-f0d66c603113), [Orb Social Home Feed](https://mobbin.com/explore/screens/c2a535cc-6e63-4ac5-88ee-38ba48e9f946) | Autor, contenido y acciones; sin medidas exactas desde miniaturas. |
| Composer | [Facebook Create Post](https://mobbin.com/explore/screens/fd20309a-6f00-492d-a4ea-20389dd40ed5), [Threads Reply Composition](https://mobbin.com/explore/screens/c6f17190-7b64-4143-b657-1b114fc25dbe) | Separar tipo de publicación de edición; preservar Post/Notify/Reporte/Venta/Dump. |
| Comments | [Instagram Comments section](https://mobbin.com/explore/screens/f2ba6180-c050-4827-b4da-2d01039b49cf), [Yik Yak Yak Details](https://mobbin.com/explore/screens/2358a5c6-385d-46a7-bded-76b8439b8fc6) | Lista + respuesta; Nexo conservará anidación y alternativas accesibles. |
| DMs | [Instagram Chat Detail](https://mobbin.com/explore/screens/65dbc4a6-310a-4272-a008-3cfc1d564e2a) | Burbujas y adjuntos observables. La ficha tiene título genérico; no se infieren estados entregado/leído ni presencia. |
| Profile | [Instagram Profile](https://mobbin.com/explore/screens/5139b966-861e-4767-af30-560e310b36ec) | Identidad, estadísticas y organización de contenido; datos reales requieren backend. |
| Search / Explore | [Orb Social Search](https://mobbin.com/explore/screens/75230750-6f60-443d-87b8-f8531a8be950) | Búsqueda/descubrimiento; no adoptar resultados ajenos ni algoritmo implícito. |
| Notifications | [X All Notifications](https://mobbin.com/explore/screens/daab40f4-ac54-4642-b354-a665062e4970), [Saturn Activity](https://mobbin.com/explore/screens/cd4b9b80-6d23-49c7-99b9-79e5443d7c62) | Actividad diferenciada y contextual. |
| Settings | [Nextdoor Settings](https://mobbin.com/explore/screens/3efa5b71-8d1f-4d5a-87b5-ad864a4863c1) | Agrupación de controles; la seguridad/privacidad efectiva será función de servidor. |
| Bottom sheet | [Instagram Comments section](https://mobbin.com/explore/screens/f2ba6180-c050-4827-b4da-2d01039b49cf) | Panel de comentarios sobre post atenuado, visualmente confirmado; arrastre/cierre no verificados. |
| Empty states | [Nextdoor Empty State](https://mobbin.com/explore/screens/186c122a-1abf-4abd-9733-feb2f1d6ccd2) | Un vacío debe orientar la siguiente acción; texto y gráfico propios de Nexo. |
| Onboarding | [X Suggested Accounts](https://mobbin.com/explore/screens/9d61c2b2-8b45-4324-b985-5bff8d812d0f), [Headspace Onboarding Video](https://mobbin.com/explore/flows/7cdc08c0-3bcb-4882-90dd-5cf92019616f?tab=video) | Sugerir personas de campus sin forzar seguimiento; usar motion para explicar estado, no personajes ni promesas de otra app. |
| Report / Block | [Saturn Report](https://mobbin.com/explore/screens/2b5a83f8-79ac-4926-8e86-837a93228ff3), [Threads Block](https://mobbin.com/explore/screens/927e8558-fbf8-48fe-816f-2587f53a6ce4) | Denuncia de abuso y bloqueo son distintos del post tipo “Reporte” por objeto perdido/urgencia. Requieren contrato de moderación. |

## Conclusiones de producto, no copias

1. Unificar el PostCard y sus variantes, con Up! como reacción Nexo. La urgencia y los cupos de Notify/Reporte son la diferencia propia de la comunidad UPA.
2. La cámara es acceso principal, no un botón escondido en un modal. Dump sigue siendo comunitario y caduca a las 3 h; stories de referencia no determinan sus reglas.
3. Hilos y chat deben conservar contexto, pero sus estados compartidos no se dibujarán como reales hasta que exista servidor. La demo seguirá etiquetada.
4. La navegación, tipografía, color y microanimaciones se definirán en el sistema Nexo. No se copian logos, fotos, marcas, texto ni archivos de las referencias.

## Evidencia pendiente

Se pidieron al usuario capturas de alta resolución o un video breve de cámara, Stories y chat de Mobbin. La investigación puede seguir con miniaturas públicas. **Solo se verificó movimiento en el tramo indicado del flow de Headspace**; motion de las demás fichas, gestos, timings, foco, estados de carga y geometría fina permanecen NV. Si llegan capturas/video, actualizar este tablero antes de atribuirles especificaciones de movimiento. El rediseño puede proponer motion original con medición propia; no lo atribuirá sin prueba a las referencias.

## Control de fase

- Cambio de aplicación: **ninguno**. Solo evidencia, decisiones de adaptación y límites de verificación.
- Verificación de regresión en esta fase documental: TypeScript pasó; build estático Vite pasó sin cambio de bundle (1 JS 136.41 kB gzip y 1 CSS 27.78 kB gzip); prueba de API local pasó 1/1. No equivale a QA de gestos o dispositivo real.
- Qué revisar: abrir cualquiera de las fichas vinculadas, comprobar que la pantalla/título corresponde y que “Motion NV” no se toma como comportamiento observado.
- Siguiente fase: análisis de brechas P0/P1/P2 contra el catálogo del skill, incluyendo contrato de tablas/endpoints antes de cualquier función que necesite backend.
