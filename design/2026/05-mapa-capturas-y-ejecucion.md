# Nexo UPA · mapa de las 13 capturas y ejecución visual

Fecha: 2 de octubre de 2026. Las capturas adjuntas por el propietario sustituyen a las referencias genéricas como autoridad visual para este corte. Se modifica el proyecto existente: React/TypeScript, vistas internas en `app/page.tsx`, funciones sociales en `components/nexo-features.tsx`, chat en `components/nexo-chat.tsx`, datos de demo en IndexedDB y estilos `app/globals.css` + `app/design-2026.css`. La API de cuentas local y el enlace configurable al login propio no se reemplazan.

## Captura → pantalla → código → decisión

| Captura | Pantalla/componente existente | Rasgos que se trasladan | Límite funcional |
|---|---|---|---|
| 1 | Menú de cuenta/tema: `app/page.tsx`, `nexo-appearance.tsx` | Selector de tema compacto, panel de cuenta con identidad arriba y acciones agrupadas | No mostrar varias cuentas reales: la demo solo tiene un perfil local. |
| 2 | Acceso: enlaces y aviso de login en `app/page.tsx` | Tarjeta centrada, jerarquía icono–título–campo–CTA y versión claro/oscuro | Un solo botón social sin marca; no inventar OAuth ni almacenar contraseña en la PWA. URL del login propio sigue configurable. |
| 3 | Perfil/ajustes: `ProfileView`, menú de cuenta pendiente | Encabezado de perfil y filas de ajustes con icono, divisor y estado | Omitir suscripción/otras cuentas no implementadas; conservar edición y tema existentes. |
| 4 | Dump: `StoryViewer` | Medio vertical protagonista, progreso y autor arriba, respuesta flotante abajo, controles sobre la imagen | Mantener tres horas y navegación/pausa/respuesta ya operativas. |
| 5 | Hilo móvil: `ChatsView` | Fondo oscuro inmersivo, medios en burbuja, composer compacto fijo | Mensajes continúan locales y expiran siete días desde el primero. |
| 6 | Cámara: `NexoCamera` | Vista negra a pantalla completa, X arriba, disparador blanco con aro acentuado, galería y voltear abajo | Pedir permiso solo tras explicación; no fingir captura cuando el dispositivo no la soporta. |
| 7 | Feed/post: `FeedView`, `PostCard` | Texto principal, avatar/metadatos compactos, media amplia, fila de acciones y barra inferior | La reacción continúa siendo **Up!**, no un corazón; no incorporar la marca X. |
| 8 | Inicio/creación: `StoriesRail`, `PublishDialog` | Historias con retratos visibles, navegación inferior y compositor de contenido con previa | Mantener Post/Notify/Reporte/Venta/Dump y cuotas existentes. |
| 9 | Comunidad/feed: `FeedView` | Ritmo de tarjetas y anillos de historias, buen aire blanco | No importar marcas de otra app ni inventar red de contactos real. |
| 10 | Chat móvil: `ChatsView` | Bandeja con historias/notas arriba, búsqueda, conversaciones destacadas y composer ligero | Conservar búsqueda, adjuntos, audio, temas y controles explícitos de demo. |
| 11 | Chat escritorio: `ChatsView` | Jerarquía de lista a la izquierda y conversación amplia a la derecha | No convertir la vista móvil en dashboard; esta composición solo aplica a ancho grande. |
| 12 | Historia/video: `StoryViewer` | Medio casi a sangre, overlay legible, progreso y autor discretos, respuesta al pie | Video nativo conserva controles; fotos reales de UPA mantienen crédito. |
| 13 | Feed comunitario: `FeedView`, `PostCard`, navegación | **Referencia principal del feed móvil:** fondo claro, cards de radio generoso, iconos finos, tab bar e imagen protagonista | La identidad Nexo y el verde institucional reemplazan marcas/colores ajenos; se conservan Notify/Reporte visibles. |

Las capturas 7, 8, 9 y 13 muestran feeds distintos, y 5, 10 y 11 muestran chats distintos. Para evitar una mezcla arbitraria, se aplica 13 como composición primaria de feed móvil; 7 especifica anatomía de publicación; 8 y 9 afinan historias/compositor. En chat, 10 guía bandeja móvil, 5 guía hilo móvil y 11 guía escritorio. El tema claro/oscuro de 1–2 guía el tratamiento transversal. Esta es una decisión de desempate visual; no se copian logos, nombres, fotos ni proveedores de las capturas.

## Secuencia corta de ejecución

1. Terminar cámara en el compositor existente detrás de `camera2026`, sin cambiar el estado de publicaciones ni el flujo de archivos.
2. Aplicar estilos de las capturas a feed/navegación, Dump y chat mediante hojas específicas bajo `html.nexo-2026`; conservar `?nexo2026=legacy`.
3. Completar acceso/menú/ajustes sin contradecir el login propio pendiente: demo local honesta, un único CTA social genérico.
4. Revisar un build y las pruebas funcionales esenciales; hacer una comparación visual móvil representativa y corregir errores evidentes. El propietario hará la revisión final de dispositivos.
5. Commit y push en `redesign-2026`; `main` y GitHub Pages no cambian hasta aprobar el corte.

No se considera completa la red multiusuario: el backend social, fotos de mayor resolución con permiso de uso y autenticación conectada al login del propietario siguen siendo trabajos separados.
