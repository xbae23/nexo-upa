# Nexo UPA 2026 · Fase 2: brechas P0/P1/P2 y contrato previo al backend

Fecha: 29 de septiembre de 2026. Base: [Mapa de funciones](00-mapa-funciones.md), [Reference Board](01-reference-board-mobbin.md) y el Catálogo del skill `social-superapp-2026` facilitado por el usuario. No se añade una función ni se presenta una simulación como si fuera una red multiusuario.

**Leyenda del skill:** E = ✅ existe en la demo local; P = 🔧 mejorar/parcial; A = ❌ falta. Cada fila usa ese estado; `Servidor` indica que el resultado real para varias personas necesita API y base de datos. La prioridad P0/P1/P2 es la del catálogo, no una promesa de que todo pueda activarse en GitHub Pages.

## A · Feed y publicación

| Prioridad | Requisito | Estado y evidencia | Brecha / dependencia |
|---|---|---|---|
| P0 | Para ti / Siguiendo | E local: `FeedView`, `rankPosts` | Sin paginación ni señales reales multiusuario; servidor para ranking compartido. |
| P0 | PostCard con autor, reply, repost, Up!, vistas, guardar y compartir | P: `PostCard` tiene todo salvo vistas; reply abre detalle | Añadir contador/semántica de vistas solo si hay medición servidor; distinguir Up! de like. |
| P0 | Hilos y respuestas anidadas | P: `PostCard(detail)` usa `parentId`, muestra hasta ocho niveles | Mejorar contexto, colapso y carga paginada; API de comentarios. |
| P0 | Expandir texto | A: cuerpo completo siempre visible | Client-only, con control “ver más” accesible. |
| P0 | Skeleton, pull-to-refresh, “nuevos posts” flotante | P: skeleton global al cargar; los otros dos A | Refresco real y aviso de nuevos requieren feed cursor/stream; alternativa botón a gesto. |
| P1 | Cita, menú de repost, encuestas, GIF, previews de enlaces, hashtags/mentions, traducir, silenciar palabra | A | Modelo/API específicos; previews seguros y licencias; traducción con proveedor/consentimiento. |
| P2 | Notas, posts programados, borradores sincronizados, tendencias | P: borrador **local** de título/cuerpo; los demás A | Programación, sincronización y tendencias necesitan jobs/servidor. |

La demo sí permite Post ilimitado, Notify y Reporte con cupos separados de 2/día, Venta y Dump. Esas reglas se preservan. El “Reporte” de urgencia/objeto perdido **no** cubre denuncia de abuso.

## B · Cámara, Dumps y video vertical

| Prioridad | Requisito | Estado y evidencia | Brecha / dependencia |
|---|---|---|---|
| P0 | Cámara full-screen Post/Story/Video; tap foto, hold video, anillo, flash, flip, timer, galería, foco, pinch zoom, preview/recorte/filtros | A salvo selección de archivo/previsualización en `PublishDialog` | Mayor brecha. Captura/zoom pueden hacerse en cliente con permiso informado; subida/almacenamiento compartido requieren servidor. Mantener 25 s Dump y 30 s post. |
| P0 | Stories/Dumps: progreso, tap izquierda/derecha, hold pausa, swipe abajo, respuestas/reacciones, visto por | P: `StoryViewer` tiene progreso, pausa por botón, flechas, swipe horizontal y responder que abre chat | Gestos y alternativas faltantes; reacción/viewed-by compartidos requieren API. Expiración de 3 h hoy es local. |
| P1 | Reels vertical con snap, autoplay silencioso, mute, progreso y precarga siguiente | A: hay videos cortos dentro de posts, no superficie vertical | Client UI/video policy, CDN/HLS y feed paginado antes de activarlo a escala. |
| P1 | Stickers/texto/dibujo/música, mejores amigos y destacados | A | Edición cliente posible; derechos de música, audiencia y persistencia en servidor. |
| P2 | Remix, subtítulos automáticos, plantillas y cortes | A | Procesamiento multimedia, permisos/licencias y revisión de seguridad. |

## C · Mensajería

| Prioridad | Requisito | Estado y evidencia | Brecha / dependencia |
|---|---|---|---|
| P0 | Lista, 1:1, burbujas, fotos | E local: `ChatsView` | Nadie recibe mensajes; debe seguir indicado hasta API/eventos. |
| P0 | Entregado/leído, escribiendo | A real: `CheckCheck` dice “guardado localmente”; presencia y respuesta son simuladas | No mostrar como entrega/lectura hasta recibos y canal en tiempo real. |
| P0 | Video en mensaje, reacción por long-press, swipe para responder | P: archivo video se adjunta pero se presenta como descarga; gestos A | Reproductor seguro; gestos con menú/botón equivalentes. Reacciones/replies requieren modelo de mensajes. |
| P1 | Voz con waveform, desaparición configurable, grupos, reenviar, buscar mensajes, solicitudes | P: voz grabada con control nativo; conversación completa caduca a 7 días desde primer mensaje; demás A | Grupos, solicitudes y búsqueda requieren índices/autorización. No alterar la regla UPA de 7 días por accidente. |
| P2 | Llamadas y canales | A | WebRTC/infraestructura y moderación; no apto para esta demo estática. |

Se conservan enlaces, adjuntos de hasta 10 MB, tres temas y nota del perfil en la bandeja. El límite, el plazo y las autorizaciones deberán comprobarse en servidor.

## D · Perfil y relaciones

| Prioridad | Requisito | Estado y evidencia | Brecha / dependencia |
|---|---|---|---|
| P0 | Header/avatar/bio/stats; tabs posts/replies/media/likes; follow/edit/ajenos | P: `ProfileView` tiene identidad básica, edición/follow local, posts/fotos/reposts/guardados | Faltan replies/Up! y estadísticas/perfiles independientes de posts; cuentas verificadas y API. No quitar pestañas existentes. |
| P1 | Seguidores, privado, verificación, varios enlaces, listas/favoritos | A | Modelo de permisos y revisión; no dibujar insignia de verificación sin proceso real. |
| P2 | Analítica/suscripciones | A | Consentimiento, facturación y modelos de datos separados. |

## E · Buscar y descubrir

| Prioridad | Requisito | Estado y evidencia | Brecha / dependencia |
|---|---|---|---|
| P0 | Recientes; tabs Top/Personas/Posts/Media; grid y tendencias | P: `ExploreView` busca posts/personas/venta local, con tabs Descubrir/Personas/Mercado | Recientes client-only; resultados por tipo, grid y trending requieren índices/analítica servidor. Conservar Mercado. |
| P1 | Sugerencias de follow, hashtag/lugar/audio y colecciones | P: rail de sugerencias desde posts; los otros A | Índices, privacidad y modelo de colecciones. |
| P2 | Grupos/eventos/marketplace opcional | P: Mercado existe y **no es opcional** para Nexo; grupos/eventos A | No despriorizar Venta actual; grupos/eventos requieren roles/moderación. |

## F · Actividad

| Prioridad | Requisito | Estado y evidencia | Brecha / dependencia |
|---|---|---|---|
| P0 | Agrupar actividad, no leído, push, deep links | P: `NotificationsView` tiene leído/no leído y salto a post **local** | No hay push ni fanout compartido; agrupación/API/preferencias/permisos antes de activarlo. |
| P1 | Filtros, preferencias y horas de silencio | A | Persistencia por cuenta y entrega programada. |

## G · Seguridad, privacidad y ajustes

| Prioridad | Requisito | Estado y evidencia | Brecha / dependencia |
|---|---|---|---|
| P0 | Denunciar abuso, bloquear, silenciar, restringir y desenfocar sensible | A: ocultar del feed **no** es bloquear; “Reporte” es post de ayuda | Tablas de relaciones de seguridad, reportes y moderación; blur visual no reemplaza clasificación real. |
| P0 | Editar/borrar posts, privacidad, exportar/borrar datos, control de comentarios, 2FA, ajustes organizados | A salvo edición de perfil local | Servidor, políticas de retención, identidad y auditoría. No ofrecer eliminación/exportación incompleta como final. |
| P1 | Cuentas múltiples | A | Gestión aislada de sesiones y datos; no mezclar cuentas en IndexedDB. |

**Bloqueo de lanzamiento real:** ninguna cuenta universitaria ni contraseña real debe recogerse en la demo de GitHub Pages. `local-server/server.mjs` es prototipo aislado. Antes de usuarios reales hacen falta HTTPS/cookies Secure, verificación de correo, recuperación, protección CSRF/abuso, autorización por recurso, respaldos, privacidad y moderación operativa.

## H · Accesibilidad, gestos y rendimiento transversales

| Prioridad | Requisito | Estado y evidencia | Brecha / dependencia |
|---|---|---|---|
| P0 transversal | Alt, lector de pantalla, texto dinámico, contraste AA, reduce-motion, captions, ES/EN | P: `alt`/ARIA en varias superficies, foco visible y `prefers-reduced-motion`; faltan auditoría AA, escalado de texto, captions y EN | Auditar por pantalla/estado. El español actual no equivale a internacionalización. |
| P0 transversal | Matriz completa de gestos con alternativa de botón y haptics | P: swipe horizontal en Dump, doble clic de medio, botones de pausa/siguiente; no doble tap móvil, pinch/long-press/reply swipe, pull refresh, etc. | Implementar por componentes, evitar conflicto scroll/zoom y respetar reduce-motion. Vibración web solo donde exista/permiso; fallback visual. |
| P0 transversal | Listas virtualizadas y cursores | A: `.map` completo en feed, explorar, perfil, chat y actividad | Virtualizar antes de escala; cursor API para datos compartidos. |
| P0 transversal | Caché responsiva de imagen, video visible/siguiente, cargas de fondo, offline con cola, optimismo/rollback | P: `img loading=lazy` solo en feed, video metadata, SW network-first/IndexedDB, UI instantánea local; faltan variantes, preload controlado, cola y rollback | CDN/medios, SWR/cache con límites, sync seguro. No confundir la persistencia local con sincronización. |
| P0 transversal | Budgets: cold start <2 s, TTI feed cache <1.5 s, 60 fps, gesto <32 ms, memoria estable; crash reporting | NV: no mediciones en móvil ni telemetría | Establecer pruebas de laboratorio/dispositivo y reportar percentiles antes de afirmar cumplimiento. |

## Contrato mínimo del servidor, antes de construir funciones dependientes

La web pública de GitHub Pages solo sirve archivos estáticos; no ejecuta SQLite, API, sockets, jobs de expiración ni push. La API propia necesitará hosting HTTPS y origen/cookies definidos. Este es el contrato de diseño —no endpoints ya desplegados—. Toda mutación requiere identidad, autorización por recurso, validación servidor, idempotencia donde aplique, límite de abuso y paginación por cursor; las respuestas no deberán exponer secretos.

| Capacidad | Tablas/índices propuestos | Endpoints/eventos propuestos | Reglas UPA que valida servidor |
|---|---|---|---|
| Identidad | `users` y `sessions` existentes en prototipo; añadir `email_verifications`, `password_resets`, `mfa_factors`, `audit_events` | `POST /v1/auth/register`, `/login`, `/logout`, `/verify-email`, `/recover`, `/mfa/challenge`; `GET /v1/auth/me` | Correo único, contraseña derivada y sesión protegida; no se activa red real sin correo verificado y recuperación. |
| Perfil/relaciones | `profiles(user_id, handle UNIQUE, ...)`, `follows(follower_id,followee_id UNIQUE)`, `blocks`, `mutes`, `restrictions` | `GET/PATCH /v1/profiles/{handle}`, `POST/DELETE /v1/profiles/{id}/follow`, `GET /v1/profiles/{id}/followers|following`; rutas de block/mute/restrict | Autorizar visibilidad por privacidad/bloqueos; cambio de follow consistente en todas las vistas. |
| Feed/posts | `posts`, `post_media`, `comments(parent_id)`, `reactions(post_id,user_id UNIQUE)`, `reposts`, `saves`, `post_views` agregados con privacidad | `GET /v1/feed?mode=for-you|following&cursor=...`, `GET/POST/PATCH/DELETE /v1/posts`, `GET/POST /v1/posts/{id}/comments`, rutas de Up!/repost/save/view | Autoría original, visibilidad, edición/borrado, cupos según tipo; no inflar vistas por recarga. |
| Cupos | `daily_quota(user_id, day_mx, kind, used, UNIQUE...)` | Incluido en `POST /v1/posts`; `GET /v1/quotas/today` | Transacción atómica: 2 Notify y 2 Reporte por día `America/Mexico_City`, sin acumulación. |
| Medios y cámara | `media_objects(owner_id, storage_key, mime, bytes, duration_ms, width, height, alt, status)`; almacenamiento privado/entrega CDN | `POST /v1/uploads/init`, `/complete`; URL firmada de subida/lectura; job de transcodificación | Revalidar archivo, MIME real, tamaño y duración: post video ≤30 s, Dump video ≤25 s, chat adjunto ≤10 MB. |
| Dumps/Stories | `stories(expires_at)`, `story_views`, `story_reactions`, `story_replies`, índices por caducidad/audiencia | `GET/POST /v1/stories`, `GET /v1/stories/{id}`, `POST /v1/stories/{id}/view|react|reply` | Toda la comunidad por defecto; caducidad 3 h calculada y aplicada en servidor, borrado/retención definidos. |
| Chat | `conversations(first_message_at, expires_at)`, `participants`, `messages`, `message_attachments`, `message_receipts`, `message_reactions` | `GET/POST /v1/conversations`, `GET/POST /v1/conversations/{id}/messages?cursor=...`, `POST /v1/messages/{id}/read|react`; WebSocket/SSE para eventos | 7 días desde **primer** mensaje; mensajes posteriores no reinician. Solo participantes pueden leer; adjuntos ≤10 MB; recibos verificables. |
| Actividad/push | `notifications(recipient_id, read_at, ...)`, `notification_preferences`, `push_subscriptions` | `GET /v1/notifications?cursor=...`, `PATCH /v1/notifications/{id}`, `POST/DELETE /v1/push-subscriptions`; evento de actividad | Fanout respetando privacidad, silencios y permisos; push nunca simulado como entregado. |
| Seguridad/moderación | `abuse_reports`, `moderation_actions`, `content_labels`, `user_blocks`, `comment_policies`, `privacy_requests` | `POST /v1/abuse-reports`, rutas de block/mute/restrict, `PATCH /v1/posts/{id}/comment-policy`, `POST /v1/privacy/export|delete` | Denunciar abuso distinto de publicar Reporte; revisión/appeal, exportación y eliminación comprobables. |
| Búsqueda | Índice de texto y proyecciones de búsqueda con controles de visibilidad | `GET /v1/search?q=...&type=posts|people|media&cursor=...`, `GET /v1/trends` | No mostrar perfiles privados/bloqueados ni derivar ubicación sensible. |

Las rutas son propuestas de contrato, no APIs existentes. Las tablas `users`/`sessions` **solo** existen en el servidor local; las demás deben diseñarse/migrarse/probarse. El service worker de la PWA debe excluir de caché toda API/autenticación/medio privado; el futuro cliente separará demo local de sesión real de forma explícita. Si el login externo y la API quedan en dominios distintos, la cookie `SameSite=Strict` del prototipo no transportará automáticamente una sesión; el dominio y el flujo de autenticación deben diseñarse antes de prometer conexión.

**Decisión de producto pendiente:** “avisar solo a amigos” para un Post normal puede significar seguidores o seguimiento mutuo. El frontend actual no envía esos avisos; el usuario debe decidir esa regla antes de que el servidor implemente fanout. La visibilidad del Post en el feed es una decisión separada.

## Secuencia de implementación y flags (sin activar aún)

| Fase siguiente | Entrega mínima | Flag nuevo propuesto | Criterio de salida |
|---|---|---|---|
| 3 · Fundamentos visuales | Tokens y componentes, modo oscuro/claro, iconos, navegación sin pérdida de funciones | `design2026` | Ambas apariencias, accesibilidad inicial, build y regresión de rutas. |
| 4 · Feed | Rediseño PostCard/feed/skeleton, listas eficientes, acciones actuales intactas | `feed2026` | Siguiendo/Para ti, Up!/reply/repost/save/share/ocultar y scroll comprobados. |
| 5 · Cámara/compositor | Captura local, preview, zoom y validación existente | `camera2026` | Permisos explicados; límites de 25/30 s; alternativa galería; sin subida falsa. |
| 6 · Dumps/video | Visor y gestos P0; video vertical P1 solo cuando rendimiento y medios estén listos | `stories2026`, `reels2026` | 3 h, pausa, siguiente, cierre, teclado y reduce-motion. |
| 7 · Descubrimiento/perfil/actividad/seguridad | Rediseño existente y P0 que tenga contrato/servidor | `discovery2026`, `safety2026` | Privacidad/denuncia/bloqueo reales o flag cerrado; no simular. |
| 8 · Mensajes | Rediseño bandeja/hilo, gestos y medios; recibos solo con API | `chat2026` | 7 días/10 MB, alternativas gestuales y estados honestos. |
| 9 · P1/P2/pulido | Extras opt-in detrás de flags específicos | Por función | Telemetría y presupuesto en dispositivos, pruebas end-to-end. |

Los flags de UI nueva estarán apagados hasta que la fase correspondiente pase QA. Los flags de función dependiente de servidor seguirán apagados en la demo estática; no se resolverá su ausencia con presencia, envío o notificación fingidos.

## Control de fase

- Cambio de aplicación: **ninguno**; esta fase define faltantes y dependencias antes de programar.
- Verificación de esta fase documental: TypeScript, build estático y la prueba de cuentas locales se ejecutaron al cerrar fases 0 y 1 sin cambios de aplicación desde entonces; deben volver a correrse antes del primer commit de código visual. Ninguna métrica de dispositivo se declara alcanzada.
- Qué probar: revisar cada estado E/P/A contra la demo y confirmar que las reglas UPA y Mercado siguen en la ruta de preservación.
- Siguiente fase: sistema de diseño oscuro/claro, tokens/componentes/iconografía y primer flag de apariencia; verificar compilación y regresión tras esa implementación.
