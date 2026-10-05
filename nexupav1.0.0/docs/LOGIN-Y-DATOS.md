# Acceso y datos de esta demostración

El login y el panel viven en el repositorio separado [`xbae23/practica-kj`](https://github.com/xbae23/practica-kj). Allí están el Cloudflare Worker y el SQL de D1. Nexo consume esa API desde `source/lib/nexo-auth.tsx`.

## ⛔ No tocar al rediseñar el login

Puedes reemplazar el aspecto de `index.html` y `styles.css` en el repo del login. Conserva los IDs de los formularios y `auth-client.js`, `cloudflare/worker.js`, `cloudflare/schema.sql`. En Nexo, conserva `source/lib/nexo-auth.tsx`, el flujo de `source/components/nexo-access.tsx` y las rutas `/auth/canjear`, `/auth/yo` y `/perfil`.

## Qué ocurre ahora

1. El registro crea en D1 una cuenta con `id`, `usuario` y `correo`.
2. Un código de un solo uso devuelve a la persona a Nexo. Nexo lo canjea por una sesión de siete días.
3. Si no hay perfil interno, Nexo pide un **nombre visible y alias nuevos**. No copia automáticamente el usuario del login. El perfil se guarda en una tabla separada de D1.
4. El panel del login muestra solo los campos del registro, no el perfil visible de Nexo.
5. El contenido social de esta versión sigue en IndexedDB del navegador, ahora particionado por ID de cuenta para que dos cuentas en el mismo dispositivo no compartan sus posts y chats locales.

## Configuración necesaria

En `web/app-config.js`, establece `authApiUrl` con la URL pública del Worker. `loginUrl` y `createAccountUrl` apuntan al repositorio del login. Ninguna clave privada debe aparecer en `app-config.js`. En Cloudflare, el binding D1 se llama `DB`, los orígenes permitidos se configuran en `ALLOWED_ORIGINS` y la clave del panel se guarda como Secret `ADMIN_KEY`.

## Alcance y seguridad

**Este acceso es deliberadamente inseguro para una prueba:** el correo no se verifica. Conocer el correo o usuario de una cuenta permite entrar en ella. No se deben invitar alumnos reales ni subir datos sensibles hasta añadir verificación de identidad, límites de abuso y protección operativa. La sesión en `localStorage` es solo para esta demo; una implementación real debe usar un mecanismo de sesión más robusto.

El backend de cuentas **no convierte todavía la red social en multiusuario en tiempo real**. Publicaciones, comentarios, reacciones, seguidores, historias, notificaciones, fotos y mensajes no se sincronizan entre dispositivos. Para un lanzamiento real hay que añadir API y almacenamiento de medios, validación de propiedad en cada operación, moderación, respaldos y controles de privacidad.
