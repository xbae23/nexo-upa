# Correcciones del documento Document77777.odt

## Implementación

- Foto de perfil opcional: carga JPG/PNG/WebP, límite 5 MB, recorte cuadrado y conversión a WebP de 512 px; cambiar y quitar foto.
- Nombre de usuario y teléfono opcional en editar perfil, no en el login. El teléfono no aparece en el perfil público.
- Las funciones originales de editar, compartir, guardados y reposts permanecen. Las opciones duplicadas del menú se sustituyen por restaurar publicaciones ocultas, descargar los datos propios y consultar privacidad.
- Notas limitadas a dos líneas sin invadir el avatar; sin notas ni conversaciones precargadas.
- Eliminados los botones de respuesta/presencia simuladas. Feed, historias, actividad y seguidores iniciales vacíos.
- Dumps abren la superficie de cámara con galería al pie; no se solicitan permisos hasta activar la cámara. Seleccionar de galería no exige permisos de cámara.
- Corregido el desplazamiento de publicación y visor: el compilador eliminaba `translate:none`. Se conservan variables de traducción nula y una prueba del CSS compilado.
- Gorrión propio de dos colores, también en favicon e iconos PWA.
- Acceso como primera pantalla; botón de registro con imagen reemplazable, sin campos de correo ni contraseña ni dominio impuesto. Ventana pequeña por encima de la primera pantalla.
- Los medios de ejemplo se conservaron en `design/archive-media` del repositorio; no se incluyen en la web ni en esta entrega.

## Verificado

- Tipos de TypeScript y compilación estática.
- Pruebas automatizadas de cámara, gestos, estado inicial vacío, expiración, cuotas y servidor estático.
- Cinco pruebas de la API social con SQLite/R2 simulados: directorio privado, dos cuentas que interactúan, fotos y mensajes, notificaciones, cuotas y eliminación temporal sin borrar cuentas/perfiles.
- API de Cloudflare desplegada: dos cuentas ficticias probaron directorio, seguir, publicación con imagen en R2, Up!, comentario, Dump, mensaje con adjunto, notificaciones y avatar. El adjunto fue accesible al destinatario y rechazó acceso anónimo (HTTP 401). `/v1/health` devolvió `ok:true`; la respuesta CORS aceptó el origen de GitHub Pages.
- En la web compilada: subir icono de prueba como avatar, guardar nombre/usuario y conservar foto de 512 px tras recargar.
- Dump → galería → vista previa → adjuntar; sin activar cámara ni micrófono.
- Crear publicación con imagen desde móvil.
- Editor y visor encuadrados exactamente en (0,0), 390 × 844 px, traducción calculada de 0 px; imagen completa visible.
- Acceso y ventana de registro de 288 px en pantalla de 320 px, sin campos de credenciales ni desbordamiento; menú de perfil y mensajes vacíos revisados.
- Paquete separado: tipos y compilación de `source/` comprobados con las dependencias instaladas del proyecto; servidor ejecutado y comprobado en el puerto 8080, con vista previa cerrada por defecto.

## Pendientes ajenos a esta validación

No se ha verificado hardware físico de iPhone/Android, grabación con permisos reales ni una sesión de interfaz en dos dispositivos físicos. El chat usa sondeo y no WebSocket. El login actual tampoco verifica la propiedad del correo; no se deben usar datos privados reales. La eliminación programada se probó en SQLite/R2 simulados, pero todavía no se ha observado transcurrir el plazo de tres días en Cloudflare.
