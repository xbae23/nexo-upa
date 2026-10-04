# Pantallas e interacciones

| Pantalla | Componentes y estados | Interacción/movimiento |
|---|---|---|
| Inicio | StoriesRail, PostCard, pestañas, skeleton de carga, lista vacía | Up inmediato, guardar/repost, abrir comentario o medio; entrada breve y feedback táctil visual |
| Dumps | Avatares circulares, foto/video, progreso, autor y respuesta | Tap lateral, swipe, mantener para pausar, cierre vertical; teclado y lector de pantalla |
| Publicar | Editor de texto/medios, modos, previa, borrador, validación | Cambio de tipo en una pulsación; cámara/galería; publicación local inmediata |
| Mensajes | Búsqueda, notas, fijados, lista y conversación | Selección de contacto, adjuntos, audio, respuestas, reacciones; burbujas agrupadas |
| Perfil | Avatar, identidad, estadísticas, tabs y edición | Seguir, mensaje, editar, guardados, fotos y reposts |
| Actividad | Filtros y grupos temporales, estados leído/no leído | Abre el contenido y permite marcar como leído |
| Explorar/Mercado | Búsqueda, pestañas, personas y fichas | Filtrar por texto, seguir y contactar vendedor |
| Acceso | Tarjeta principal y pequeño formulario social superpuesto | Nexo Connect ficticio; datos temporales descartados al continuar |
| Ajustes | Filas del sistema, tema y preferencias locales | Cambio claro/oscuro inmediato; estados persistidos |

El banner sin conexión permite distinguir la sesión local del servicio multiusuario futuro. Los fallos de almacenamiento, carga de archivos y permisos muestran mensajes específicos. Se conserva `prefers-reduced-motion`; no se presenta la actividad de demo como comunicación real con otras personas.

Implementación: componentes existentes de React y estado local IndexedDB. Tokens en `app/tokens.css`, reglas compartidas en `app/components.css`, composición específica en `app/reference-*.css`.
