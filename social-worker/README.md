# Activar la comunidad de Nexo en Cloudflare

Este Worker es **separado** de `nexo-acceso`. Usa las sesiones, cuentas y perfiles de la D1 existente `nexo-usuarios`; no modifica el login ni muestra correos en el directorio público de la app.

## Lo que debe hacer el propietario en Cloudflare

1. En **Storage & databases → R2 → Overview**, activa R2 si la consola lo solicita y crea un bucket **privado**, clase **Standard**, llamado `nexo-medios`. La activación de R2 puede pedir un método de pago aun cuando el uso quede dentro de la cuota gratuita. Vigila el consumo para evitar cargos.
2. En **Storage & databases → D1 → nexo-usuarios → Console**, pega y ejecuta el contenido íntegro de [`schema.sql`](schema.sql). Las sentencias `CREATE TABLE IF NOT EXISTS` agregan solo las tablas sociales; no eliminan cuentas, sesiones ni perfiles. Conserva una copia de seguridad de D1 antes de cualquier migración.
3. En **Workers & Pages → Create → Start with Hello World**, crea un Worker llamado `nexo-social`. Sustituye el código de ejemplo por el contenido íntegro de [`worker.js`](worker.js) y publícalo.
4. Dentro de `nexo-social`, en **Bindings → Add binding**, añade **D1 database** con nombre de variable `DB` y selecciona `nexo-usuarios`. Añade **R2 bucket** con nombre `MEDIA` y selecciona `nexo-medios`.
5. En **Settings → Variables and Secrets**, crea una variable de texto `ALLOWED_ORIGINS` con valor exacto `https://xbae23.github.io`. No pongas aquí `ADMIN_KEY` ni claves del login; la API verifica el token de sesión contra D1.
6. Añade un **Cron Trigger** `*/15 * * * *` al Worker. El Worker deja de mostrar contenido en cuanto vence y el cron borra físicamente filas y objetos de R2. Los Dumps vencen en 3 horas; posts, comentarios, seguimientos, avisos y chats en 3 días. La foto de perfil, la cuenta y el perfil no vencen.
7. Abre `https://<tu-worker>.workers.dev/v1/health`. Debe responder `{"ok":true,"service":"nexo-social"}`. Si indica `ok:false`, revisa los dos bindings.
8. Envía **solo la URL pública** del Worker para ponerla en `public/app-config.js` como `socialApiUrl` y desplegar el frontend actualizado en GitHub Pages. No envíes credenciales, tokens ni claves. Tras ese despliegue, prueba con dos cuentas en dispositivos distintos.

## Qué habilita

- Directorio de perfiles separados del usuario del login, sin exponer correos.
- Publicaciones, mercado, Dumps, seguimientos, Up!, comentarios, reposts, guardados y notificaciones compartidos.
- Chats entre cuentas con texto y adjuntos de hasta 10 MB, imagen, video, audio y archivo; lectura de adjuntos limitada a los dos participantes.
- Fotos y videos en R2, no en D1. La foto de perfil persiste; el resto del material se elimina al vencer.
- Presencia aproximada en el chat y actualización mientras la app está abierta (sondeo, no WebSocket).

## Límites y seguridad

El login actual **no verifica la propiedad del correo**: alguien que conozca un usuario o correo puede entrar como esa persona. Esta integración sirve para pruebas con cuentas ficticias, no para mensajes privados de alumnos reales. Antes de abrirla a estudiantes, añade verificación de identidad al login, moderación, controles contra abuso y una política de privacidad. El Worker social no puede arreglar por sí solo la debilidad del login.

La API valida la sesión en cada operación y el propietario de publicaciones/archivos. Los enlaces a medios de posts, Dumps y avatares son difíciles de adivinar pero pueden compartirse fuera de la app; **no trates esas fotos como privadas**. Los adjuntos de chat sí requieren la sesión de uno de los dos participantes.

El límite de duración de video (25 segundos Dump; 30 segundos post) lo comprueba el navegador. En esta versión de prueba, el Worker valida tipo y tamaño, pero no analiza la duración real de videos alterados o enviados fuera de la app.

## Pruebas de código

Desde la raíz del repositorio: `node --test social-worker/worker.test.mjs`. Estas pruebas usan una D1 simulada con SQLite local y R2 simulado; **no prueban la configuración real de tu cuenta Cloudflare**. La prueba final exige desplegar y comprobar dos dispositivos.
