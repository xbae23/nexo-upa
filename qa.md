# Verificación del rediseño · 4 de octubre de 2026

Implementación guiada por las capturas del usuario y las guías iOS, patrones sociales y pulido. La identidad propia usa blanco, verde, gris y negro; las referencias no implican afiliación con Apple, Instagram o X.

## Comprobado en esta revisión

- TypeScript sin errores; compilación de la demo correcta.
- Siete pruebas de gestos aprobadas (zoom, límites, doble toque y clasificación del deslizamiento).
- Buzón móvil con notas, fotos reales de perfiles de ejemplo, fijados y búsqueda.
- Envío local de un mensaje, reacción Up y preparación de una respuesta citada.
- Editor móvil a pantalla completa; cambio directo de Post a Venta y campos correspondientes. Corregido un desplazamiento causado por la propiedad CSS `translate`.
- Bienvenida y ventana pequeña de Nexo Connect; envío con datos ficticios cierra el acceso de prueba. El formulario no persiste credenciales.
- Dumps redondos; visor fotográfico, avance y pausa, sin flechas visibles. La navegación alternativa accesible permanece disponible.
- Perfil, ajustes de apariencia y actividad en modo oscuro.
- Sin desbordamiento horizontal del documento en los tamaños comprobados de 320 y 1440 px; revisión visual principal a 390 × 844.
- Corregido el recorte vertical de las notas del buzón; fechas de mensajes con jerarquía secundaria.

## Límites de la demo

Los mensajes y acciones se guardan en este navegador, no llegan a otras personas. Presencia y respuestas simuladas están identificadas. GitHub Pages no ejecuta el servidor local de autenticación.

No se certifican en esta revisión permisos físicos de cámara/micrófono, teclado de dispositivos iOS/Android reales, notificaciones push, carga concurrente, ni funcionamiento multiusuario. Las pruebas de gestos no sustituyen pruebas táctiles en hardware real.

El login definitivo se conecta mediante `loginUrl` y `createAccountUrl` en `lib/app-config.ts`; no deben ponerse contraseñas o secretos en ese archivo.
