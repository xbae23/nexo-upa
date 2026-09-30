# Nexo UPA · Fase 4 · Pantallas, templates y flujos

Depende de la auditoría, tokens y componentes. Diseño light-first. No son rutas implementadas ni promesa de funcionalidad disponible.

## Decisiones de alcance explícitas

- «Amigos» se interpreta como seguimiento mutuo; «Seguidos» incluye seguimiento unilateral. Es una definición UPA, no un dato inventado de Instagram.
- Las ofertas estudiantiles se encuentran mediante el filtro «Mercado» de Explorar y se publican como categoría de una publicación normal. No se añade una novena pantalla principal de marketplace ni una cuarta cuota.
- Normal no tiene límite diario. Notify y Report tienen dos usos diarios cada uno; reinicio a medianoche de America/Mexico_City; no se acumulan ni se consumen al fallar el envío. El servidor futuro deberá ser autoritativo.
- Dumps duran tres horas desde publicación aceptada; vídeo hasta 25 segundos. Vídeo de post hasta 30 segundos. Se muestran a toda la comunidad UPA, no solo seguidores.
- Chat completo caduca siete periodos de 24 horas desde el primer mensaje aceptado. Enviar otro mensaje no reinicia el plazo. Un intento fallido no inicia el periodo.
- «Notas» se toma como la intención de «tomas» del pedido original: texto breve sobre avatar en la bandeja, visible también en el contexto del chat. No se inventa un límite de caracteres o duración que no fue pedido; esos límites requieren definición de producto antes de implementar.
- Sin pagos, suscripciones, mapa en vivo, IA, gamificación, puntos, canales ni funciones extra tomadas de las referencias.

## Trabajo que resuelve cada superficie (JTBD)

| Necesidad | Superficie | Resultado visible |
|---|---|---|
| Enterarme y participar en la comunidad | Feed / detalle | Leo, doy Up!, comento o reposteo sin perder el contexto |
| Pedir ayuda o dar un aviso oportuno | Composer normal/Report/Notify | Distingo alcance y cuota antes de publicar |
| Compartir un momento del campus | Dumps | Sé que es temporal y cuánto le queda |
| Encontrar personas, contenido u ofertas | Explorar | Puedo buscar y abrir el resultado pertinente |
| Saber quién es alguien y seguirlo | Perfil | Veo identidad, publicaciones y estado de seguimiento |
| Resolver algo de forma privada | Mensajes | Converso y adjunto archivos con tamaño/plazo claros |
| Revisar mis interacciones | Notificaciones | Cada elemento abre su contexto original |

## Templates responsive compartidos

Móvil de referencia: container.mobile=375, comprobación estrecha container.min=320. Cabecera control.header; interior layout.mobile-gutter; contenido de una columna; barra inferior control.bottom-nav + safe-area. Notificaciones se abre desde cabecera; la barra incluye Inicio, Explorar, Crear, Mensajes y Perfil.

Tablet: container.tablet=768. Navegación lateral compacta de control.bottom-nav; contenido centrado hasta container.feed; margen tablet-gutter. Lista+hilo de Mensajes pueden coexistir en el espacio restante, con la lista a container.aside; en anchura insuficiente se usa navegación lista→hilo. No panel derecho.

Desktop: container.desktop=1280 y wide=1440. Sidebar container.sidebar + centro container.feed + aside container.aside; column-gap y desktop-gutter. Feed, Explorar, Perfil, Notificaciones y Detalle comparten este shell. Mensajes reemplaza centro+aside por lista+hilo. Composer es modal centrado; Dump es visor centrado sin competir con la navegación.

No estirar texto hasta llenar monitores grandes. A 200 % de texto, se permite crecimiento vertical. A zoom/reflow equivalente a 320, se usa template móvil sin scroll horizontal de toda la página. Carrusel de Dumps y tabs pueden desplazarse horizontalmente dentro de su región, sin arrastrar el feed entero.

### Inventario de pantallas

| ID | Pantalla | Jerarquía y grid | Adaptación tablet/desktop |
|---|---|---|---|
| P01 | Inicio / Feed | Marca/cabecera → Para ti/Seguidos → Dumps horizontales → entrada a composer → lista de posts | Shell compartido; composer inline desktop; aside con búsqueda/sugerencias |
| P02 | Composer | Cancelar/título/publicar → identidad → modo y cuota → texto → adjuntos → audiencia y estado | Fullscreen móvil; modal container.modal desktop; no navegación de fondo activa |
| P03 | Perfil | Cabecera → avatar/nombre/handle → bio → estadísticas/seguir → tabs Publicaciones/Medios/Guardados → contenido | Misma identidad; grid de medios media.profile-grid-columns. Guardados solo en perfil propio |
| P04 | Stories / Dumps | Carrusel en P01; visor: autor/progreso → medio story → controles/reply | Móvil prioriza medio; desktop centra visor container.story-viewer; cierre siempre accesible |
| P05 | Explorar | Título → búsqueda → filtros Todo/Personas/Mercado → resultados → detalle/perfil | Grid de medios o lista de texto según contenido, no mosaico de dashboards. Venta abre post existente |
| P06 | Notificaciones | Título → Todas/Menciones → actividad agrupada temporalmente | Lista en centro; aside solo contextual y no esencial |
| P07 | Mensajes | Bandeja: cabecera/búsqueda/notas/lista; hilo: identidad/presencia/plazo/mensajes/composer | Móvil lista→hilo con volver; desktop lista+hilo simultáneos |
| P08 | Detalle de post | Volver/título → post original → estadísticas/acciones → comentarios → respuesta | Columna feed estable; composer de respuesta contextual; hilo legible |

## P01 · Inicio / Feed

Flujo: abrir Inicio → leer tab actual → opcional cambiar Para ti/Seguidos → abrir Dump o post → interactuar → volver conservando posición y tab. Tap en una acción no abre el post de fondo.

Para ti: relevancia para la comunidad, actualidad, afinidad de seguimiento/interacciones y diversidad de autores; evitar repetición consecutiva del mismo contenido. Seguidos: orden cronológico. No se afirman pesos ni rendimiento de un algoritmo que no está implementado. Report urgente puede tener etiqueta contextual; no queda fijado eternamente ni ocupa toda la pantalla.

| Estado | Diseño / acción |
|---|---|
| Vacío | «Todavía no hay publicaciones aquí» + Publicar; en Seguidos, «Aún no sigues a nadie» + Explorar |
| Carga | Anatomía de post en neutral.surface; sin shimmer con reducir movimiento; cabecera/tabs estables |
| Error | «No pudimos cargar las publicaciones» + Reintentar; no borrar contenido ya leído |
| Offline | Aviso textual; contenido ya disponible permanece; acciones de escritura no aparentan haberse enviado |

Casos límite: sin stories se omite solo la fila vacía salvo «Tu Dump»; post eliminado conserva explicación al volver; medio fallido permite leer texto y reintentar el medio. Aceptación: al cambiar de tab no duplica posts, Up cambia estado sin scroll, acciones conservan área touch, no tapa la barra inferior el último post.

## P02 · Composer

Flujo: Crear → elegir Normal/Report/Notify → ver audiencia/cuota → redactar → adjuntar opcional → validar → publicar → confirmación y nuevo post. Al salir con cambios: Guardar borrador / Descartar / Seguir editando. No consume cuota guardar borrador.

Report tiene propósito explícito (aviso urgente, perdido o encontrado); Notify indica visibilidad ampliada a la comunidad. Normal indica «Notifica a tus amigos». «Venta» es categoría de Normal y permite describir producto/precio sin introducir cobro dentro de la app. Contador indica caracteres escritos; no inventa un máximo no acordado.

| Estado | Diseño / acción |
|---|---|
| Vacío | Placeholder descriptivo; Publicar disabled con motivo hasta tener contenido válido |
| Carga | Archivo «Preparando…» o botón «Publicando…»; sin envío repetido |
| Error | Explicación junto al medio o campo; conserva texto; vídeo excedido pide recortar/reemplazar, no corta silenciosamente |
| Offline | Guarda el estado de edición visualmente; «Sin conexión. Aún no publicado»; no promete persistencia del borrador sin backend |

Casos límite: cuota agotada muestra «Disponible mañana» y mantiene accesible Normal; rollover de fecha actualiza cuota al confirmar; adjunto retirado no deja contador fantasma; tipo cambiado no pierde texto; validación final impide vídeo inválido. Aceptación: dos cuotas independientes, duración indicada antes de adjuntar, cierre no destruye texto sin decisión, registro requerido devuelve al composer conservando el borrador cuando la futura implementación lo soporte.

## P03 · Perfil

Flujo: abrir autor/perfil → ver identidad → seguir o dejar de seguir → explorar Publicaciones/Medios → abrir un post. Perfil propio incluye Guardados y acceso al diálogo de sesión. El grid no es una colección pública de guardados.

| Estado | Diseño / acción |
|---|---|
| Vacío | Tab con «Aún no hay publicaciones», «Aún no hay medios» o «Aún no guardas nada» según contexto |
| Carga | Avatar/texto/grid skeleton, manteniendo cabecera |
| Error | «No pudimos cargar este perfil» + Reintentar; follow fallido revierte estado y explica |
| Offline | Última información disponible; no presentar conteos desactualizados como en tiempo real |

Casos límite: nombre largo envuelve; bio ausente no deja hueco gigante; avatar fallido usa iniciales; cuenta inexistente no parece perfil vacío normal. Aceptación: seguir cambia etiqueta/peso sin saltos; grid de medios no recorta controles; cada miniatura tiene alternativa y abre contexto; no mostrar Guardados privados en perfil ajeno.

## P04 · Dumps

Flujo: tap en avatar → abre primer Dump pendiente → progreso según medio → anterior/siguiente o pausa → respuesta privada → cierre vuelve al carrusel conservando posición. Crear Dump reutiliza flujo de adjunto/validación del composer, no un editor de efectos nuevo.

| Estado | Diseño / acción |
|---|---|
| Vacío | «No hay Dumps disponibles» + volver; no pantalla negra sin salida |
| Carga | Progreso pausado y «Cargando…»; controles de salida disponibles |
| Error | «No se pudo abrir este Dump» + Reintentar / Siguiente |
| Offline | Pausar medio sin buffer disponible; mostrar estado sin fingir avance |

Casos límite: expira mientras está abierto → aviso y siguiente disponible, sin error genérico; respuesta no disponible si chat caducó → explicación antes de enviar; teclado no tapa respuesta; cerrar/perder foco pausa. Duración de imagen fija pendiente de decisión de producto: no se inventa a partir del máximo de vídeo. Aceptación: video no supera 25 s; publicación desaparece a 3 h; botones alternativos a gestos; no sonido automático; texto legible sobre superficies opacas.

## P05 · Explorar

Flujo: abrir Explorar → buscar o elegir filtro → ver resultados → abrir perfil/post → volver con búsqueda y posición conservadas. Mercado filtra ofertas; «Contactar» desde una oferta conduce a Mensajes, sin añadir un checkout.

| Estado | Diseño / acción |
|---|---|
| Vacío | «No encontramos resultados» + Limpiar búsqueda; si no hay ofertas, mensaje específico |
| Carga | Resultados skeleton, buscador sigue visible y editable |
| Error | Mensaje con Reintentar sin borrar consulta |
| Offline | «La búsqueda necesita conexión»; no inventar resultados ni conservar una carga infinita |

Casos límite: consultas largas envuelven en el input/desplazamiento propio; múltiples coincidencias no producen perfiles duplicados; filtro no modifica el significado de Report/Notify. Aceptación: filtro seleccionado tiene estado accesible; búsqueda operable con teclado; no utilizar distintos colores por categoría; ofertas muestran autor y precio solo si fue proporcionado.

## P06 · Notificaciones

Flujo: abrir actividad → seleccionar Todas/Menciones → abrir elemento → ir al post/comentario/perfil original. Leer cambia indicador sin alterar el orden mientras se interactúa.

| Estado | Diseño / acción |
|---|---|
| Vacío | «Estás al día» y explicación breve, sin ilustración decorativa nueva |
| Carga | Filas skeleton con misma alineación |
| Error | «No pudimos cargar tu actividad» + Reintentar |
| Offline | Actividad disponible y aviso «Sin conexión»; no anunciar actividad nueva inexistente |

Casos límite: destino eliminado → estado explicativo en P08; muchos eventos del mismo origen pueden agruparse sin ocultar acceso al contenido; conteo actualizado sin mover foco. Aceptación: nuevo/leído se distingue por texto/peso además de verde; no confundir actividad interna con permiso de notificaciones del navegador.

## P07 · Mensajes: lista e hilo

Flujo: seleccionar conversación → ver plazo → redactar/adjuntar → validar 10 MB → enviar → estado enviado/fallido. Tema se elige desde cabecera del chat y solo entre tratamientos blanco/verde del mismo sistema, no fotos de fondo ni paletas ajenas. La presencia nunca se deduce del estado leído.

| Estado | Lista | Hilo |
|---|---|---|
| Vacío | «Tus conversaciones aparecerán aquí» | «Inicia la conversación. El plazo de 7 días empieza con el primer mensaje enviado» |
| Carga | Filas skeleton | Mensajes skeleton; envío deshabilitado con motivo |
| Error | Reintentar bandeja | Burbuja fallida, Reintentar o retirar adjunto; texto conservado |
| Offline | Historial disponible con aviso | Pendiente claramente no enviado; no iniciar/reiniciar contador |

Casos límite: exactamente 10 MB válido; más de 10 MB rechazado antes de envío; link largo se parte sin desbordar; audio dispone de control pausar y tiempo; permiso de micrófono denegado conserva entrada de texto; mensaje enviado al límite de caducidad obtiene confirmación final antes de considerarse enviado. A los siete días se muestra estado caducado y no se mantiene el hilo como si siguiera activo.

El aviso no promete borrado de capturas ni copias que otro usuario haya hecho. Una conversación nueva después de caducar, y el destino de una respuesta a Dump en ese caso, son decisiones de producto pendientes: no se implementan silenciosamente como reinicio automático.

Aceptación: lista e hilo mantienen identidad coherente, tema no reduce contraste, adjuntos muestran nombre/tamaño, texto y enlaces son seleccionables, el contador no se reinicia al recibir ni enviar.

## P08 · Detalle de publicación y comentarios

Flujo: abrir post → leer contexto completo → ver/responder comentario → enviar → conservar posición con confirmación → volver al feed. Repost con comentario abre el mismo composer, referenciando al original.

| Estado | Diseño / acción |
|---|---|
| Vacío | Post visible + «Sé la primera persona en comentar»; no se considera feed vacío |
| Carga | Post disponible permanece; skeleton solo en comentarios pendientes |
| Error | Error localizado en comentarios o post; reintento de esa región |
| Offline | Conversación disponible, respuesta no confirmada; conserva texto |

Casos límite: post eliminado, respuesta padre no disponible, comentarios extensos, varias profundidades. Desde la profundidad acordada se aplana sangría pero no la relación, usando «En respuesta a…». Aceptación: no deslizar horizontalmente para leer un hilo; respuesta indica a quién responde; reacciones consistentes con P01; no perder el borrador por abrir teclado.

## Acceso y registro dentro del flujo

Invocación desde Perfil o al intentar una acción que requiere cuenta → cuadro «Inicia sesión o regístrate» → elegir tab → correo y contraseña → validación → estado enviando → éxito o error. Registro puede mostrar «Revisa tu correo» solamente si el proveedor real confirma envío, nunca en esta maqueta. Campo contraseña vacío por defecto, no datos reales. No existe almacenamiento implementado.

El código futuro de autenticación y almacenamiento seguro se documentará en la fase de desarrollo que el usuario autorice después; no pertenece al diseño actual. El diseño reserva espacio para validaciones sin mostrar secretos.

## Heurísticas de Nielsen aplicadas

| Heurística | Evidencia en el diseño |
|---|---|
| Estado visible | Cuotas, enviado/fallido, presencia, caducidad y carga localizados |
| Lenguaje familiar | Publicar, Mensajes, Seguidos, Guardado; Up!/Dump definidos por identidad UPA |
| Control y salida | Volver, cerrar, pausar, deshacer reacción, conservar borrador |
| Consistencia | Un post y una barra de acciones en feed/detalle/perfil |
| Prevención | Duración/tamaño/cuota visibles antes del envío |
| Reconocimiento | Labels y contexto de respuesta, sin iconos crípticos únicos |
| Eficiencia | Navegación persistente y retorno con posición conservada |
| Minimalismo | Sin landing animada dentro del feed, sin decoración 3D, sin módulos ajenos |
| Recuperación | Error explica el problema y propone reintento local |
| Ayuda contextual | Plazo de chat y límites cerca de la acción; sin centro de ayuda nuevo |
