# Nexo UPA · Fase 3 · Componentes atómicos

Depende de 02-tokens.md. Las medidas son nombres de token; se heredan sin excepciones locales. Estados descritos como diseño propio, no como estados medidos de Instagram/X.

## Contrato de estados compartido

| ID | Estado | Apariencia / comportamiento |
|---|---|---|
| S0 | Default | Blanco, ink, borde según variante. Todos los controles tienen nombre accesible |
| S1 | Hover | Primary→green.800; secondary/ghost/icon→green.50. No información exclusiva al hover |
| S2 | Focus-visible | Anillo focus sobre fondo blanco y separación focus.offset; no ocultar foco nativo |
| S3 | Pressed | Primary→green.900; secondary/selección→green.200 con green.900; no mover layout |
| S4 | Loading | Etiqueta contextual «Publicando…»/«Enviando…», aria-busy; conserva ancho; impide envío duplicado |
| S5 | Disabled | neutral.divider + neutral.muted; sin opacidad global; explica motivo junto al control; no es botón habilitado de apariencia tenue |
| S6 | Active/selected | Verde y cambio de forma/peso/etiqueta; aria-pressed/selected/current según rol |
| S7 | Error | semantic.error y explicación accionable; role=alert; datos del formulario conservados |
| S8 | Success | Confirmación textual breve; no navegar inesperadamente |
| S9 | Empty | Explica ausencia y ofrece solo acción pertinente ya existente |
| S10 | Offline | Texto «Sin conexión», mantiene lo ya visible, reintento explícito; no confirmar una escritura sin respuesta |

Prioridad de interacción: disabled > loading > pressed > hover; focus es una capa adicional, incluso sobre seleccionado. Error se anuncia al producirse, no en cada tecla. Loading/errores no sustituyen el nombre accesible por un icono sin texto.

## Átomos

| Componente | Anatomía / medidas | Variantes y estados | Uso correcto / incorrecto | Accesibilidad |
|---|---|---|---|---|
| Botón | Etiqueta body-strong, icon.md opcional, gap space.2, alto control.standard, padding space.5, radius.pill | Primary, secondary, ghost, icon, destructive; S0–S5,S7,S8. Toggle también S6 | Un primario por grupo; no varios CTA dominantes ni rojo para promoción | button nativo, nombre explícito, touch mínimo, disabled real; foco S2 |
| Icono | Caja icon.lg o md, stroke.icon, currentColor del control | Contorno/inactivo, relleno o marca/activo, ocupado mediante etiqueta. S1–S7 corresponden al botón contenedor | Icono decorativo no es botón; no iconos sueltos clicables | aria-hidden decorativo; alternativa textual en contenedor |
| Input | Label meta-strong arriba, gap space.2, alto mínimo standard, padding space.3/4, control border, radius.md; ayuda meta debajo | Texto, correo, contraseña, búsqueda, textarea; vacío/completo, S0–S5,S7,S8; readonly distinto de disabled | Etiqueta persistente, error cercano; no placeholder como única etiqueta | label asociado, descripción vinculada, aria-invalid; input body; autocomplete adecuado |
| Avatar | Círculo, xs/sm/md/lg/story/profile; fallback iniciales ink/surface | Con imagen, iniciales, imagen fallida, con/sin Dump, visto/no visto. Contenedor interactivo S0–S3,S5 | Imagen circular sin insignia inventada; no marcar «activo» solo por anillo | Texto alternativo si aporta identidad; botón de story con nombre y visto/no visto |
| Anillo Dump | story.ring con separación story.gap alrededor de avatar.story | No visto: degradado permitido; visto: divider; propio: acción añadir etiquetada; caducado: se retira | Solo indica historia, nunca presencia | Estado anunciado además de color; touch mínimo |
| Badge | Meta-strong/caption, espacio space.1/2, radius.pill | Conteo verde/blanco, etiqueta suave green.900/100, neutro; nuevo/leído/0; 0 oculto sin perder etiqueta | Contador es dato, no CTA | Etiqueta «N notificaciones sin leer»; anunciar cambio moderadamente |
| Chip | Meta-strong, padding space.3/4, radio pill, alto touch | Filter, selected; S0–S3,S5,S6; cuota agotada no confundida con seleccionado | Solo filtros existentes; no nuevo color por categoría | button toggle o control de selección apropiado |
| Divisor | border.hairline, neutral.divider | Horizontal/vertical; no estados interactivos (N/A) | Separación de regiones; no borde de input | Decorativo o separator según semántica |
| Tipografía | Roles de la tabla de tokens | Principal/secundaria/enlace/estado; enlace S0–S3 | Jerarquía por tamaño/peso; no varios estilos de titular en una pantalla | Encabezados en orden, enlaces distinguibles; reflow y ampliación |

## Moléculas

| Componente | Anatomía y medidas | Estados / variantes | Uso / accesibilidad |
|---|---|---|---|
| Barra de acciones | Up!, comentarios, repost, compartir, guardar; icon.md/lg y áreas touch; conteo meta | S0–S8 por acción; Up/repost/guardar S6; guardado privado | Cada acción opera independientemente de abrir post. En 320 se distribuye flex sin reducir touch. Botones con aria-pressed donde aplique |
| Búsqueda | Label, icono, input, limpiar de touch; radius.md, gap space.2 | Vacía, escribiendo, resultados, sin resultados, S2,S4,S5,S7,S10 | Enter busca; Escape limpia/cierra sugerencias sin borrar contexto inesperadamente. Listado sugerido sigue patrón combobox solo si realmente se implementa |
| Item de lista | Avatar.lg + nombre/body-strong + extracto/meta + tiempo/caption; padding space.4; mínimo touch | Normal, no leído, seleccionado, ocupado, eliminado/inaccesible, offline | Fila abre destino; acciones secundarias son botones independientes; no botones anidados |
| Tab bar | Botones de alto standard, label meta-strong, indicador border.focus | S0–S3,S5,S6; panel cargando/vacío/error conserva tab | role tablist/tab/tabpanel; flechas navegan; Home/End; Tab sale. Activación manual si cargar es lento |
| Toast | Texto meta sobre white o green.100; padding space.4; radius.md; acción touch si necesaria | Éxito, info, error; visible/cerrado; acción busy | role=status para información, alert para error. No desaparece un error que requiere acción. No cubre barra de navegación |

## Organismos

| Componente | Anatomía / medidas con tokens | Variantes y estados | Uso correcto / incorrecto / accesibilidad |
|---|---|---|---|
| Publicación | Autor avatar.md + nombre/handle/tiempo + menú touch; texto body; medios radius.lg; barra de acciones; padding space.4; divisor | Normal, Report, Notify; texto/imagen/vídeo/oferta; cargando, fallo de medio, eliminado, offline; interacciones S0–S8 | Un solo sistema de tarjeta, sin sombra. Report/Notify son etiquetas, no fondos enteros de color. article con encabezado de autor; medio con alt y controles de vídeo accesibles |
| Composer | Cabecera cerrar/publicar, autor, selector normal/Report/Notify, texto, adjuntos, contador de caracteres, audiencia, borrador, vista previa/validación | Vacío, texto válido, adjunto cargando/invalidado, cuota agotada, borrador, envío, error, éxito, offline | No cambia de modo ocultamente; cuota por tipo; conserva contenido al fallo. Mobile fullscreen, desktop dialog.modal. Envío sin duplicados |
| Cabecera perfil | Avatar.profile, nombre/title, handle/meta, bio/body, estadísticas, seguir/siguiendo, tabs | Propio/ajeno, sin bio/medios, siguiendo/no siguiendo, follow ocupado/error, inaccesible | Sin insignias de verificación nuevas. Estadísticas no clicables si no hay destino solicitado. Botón seguir informa cambio |
| Visor Dump | Región central story con progreso, autor, pausa, cerrar, anterior/siguiente, respuesta | Foto/vídeo; reproduciendo/pausado, buffer, fallido, visto, caducado, sin conexión | Controles sobre panel opaco cuando haya texto. No autoplay de audio; pausa al perder foco/documento oculto. Teclado y botones además de gestos |
| Hilo de mensajes | Cabecera volver + avatar + presencia + tema; aviso de caducidad; mensajes; input/adjuntos/enviar | Sin mensajes, activo, enviando, fallido/reintentar, adjunto inválido, caducado, offline | Caducidad se calcula desde primer mensaje aceptado. No etiqueta un pendiente como enviado. Orden de lectura cronológico; nuevos mensajes con live polite sin repetir historial |
| Comentario anidado | Avatar.sm, autor/meta-strong, texto/body, tiempo/caption, responder/Up; indent space.4; línea divisoria | Principal/respuesta, expandido/contraído, cargando, error, eliminado | No aumenta indentación indefinidamente: desde segunda profundidad, enlace «En respuesta a…» y misma alineación; preservar jerarquía en texto accesible |
| Sidebar | Marca, Inicio/Explorar/Notificaciones/Mensajes/Perfil, Publicar, cuenta; ancho sidebar o bottom-nav compacta | Normal, sección actual, ocupado/desconectado, sesión anónima | nav con aria-label, enlaces con aria-current; icono+label en desktop, nombre accesible en tablet |
| Barra inferior | Inicio/Explorar/Crear/Mensajes/Perfil; alto bottom-nav + safe-area; cinco áreas flex | Actual, no leído, Create abre composer; modal la oculta | Todas las áreas ≥touch; no dar destino a Create como si fuera una página permanente; nav separada de contenido |
| Panel derecho | Búsqueda y sugerencias de cuentas/temas existentes | Normal, sin sugerencias, carga, error, offline | Complementario, nunca único acceso a una función esencial; aside; se elimina en tablet/móvil |

### Registro/inicio de sesión: requisito previo conservado, sin pantalla principal nueva

Es un diálogo dentro de los flujos de Perfil/Composer, con los mismos átomos. Tabs «Iniciar sesión» y «Registrarte»; label de correo/contraseña, mostrar contraseña, enviar, error, carga y recuperación como enlace del flujo de acceso. Campos vacíos no envían. Al cerrar, el foco vuelve al invocador. No se solicita ni guarda una contraseña real en la maqueta. La recuperación no se simula como enviada.

Modal: título, explicación breve, cierre touch, ancho container.modal, padding space.6, radius.xl; móvil usa ancho disponible y permite scroll cuando aparezca teclado. Foco dentro mientras abierto, Escape cierra, restauración de foco. El diseño no especifica un backend de autenticación ni almacena secretos.

## Controles de consistencia

Todos los componentes interactivos remiten al contrato S0–S10 y declaran los estados adicionales propios. Los estáticos no tienen estados de interacción artificiales. Misma etiqueta para la misma acción; «Up!» siempre significa la reacción solicitada, «Report» el aviso comunitario, «Reportar contenido» no se introduce como función nueva.

Patrones de accesibilidad: [Tabs WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) y [Dialog WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). Son requisitos para futura implementación; la tabla no equivale a una auditoría con lector de pantalla de una app terminada.
