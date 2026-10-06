# Nexo UPA · nexupav1.0.0

Entrega separada para publicar la interfaz web, sin usuarios, publicaciones ni fotos de ejemplo.

## Carpetas

- `web/`: archivos compilados. Es la única carpeta que debe quedar expuesta por un hosting estático.
- `servidor/`: servidor web Node sin dependencias externas, pruebas y ejemplo de servicio.
- `source/`: código editable y archivo de dependencias bloqueadas para reproducir la web.
- `source/social-worker/`: API social de Cloudflare, migración D1, pruebas y pasos de activación.
- `docs/`: conexión de tu login, instrucciones y alcance de esta entrega.
- `release-manifest.json`: inventario con huellas SHA-256.
- `verify.mjs`: verifica que no falten archivos ni hayan cambiado desde la preparación.

## Arrancar en un servidor

Requiere Node 22.13 o posterior. Desde esta carpeta:

```sh
node verify.mjs
node servidor/static-server.mjs
```

Abre `http://127.0.0.1:8080/`. La comprobación de disponibilidad es `/health`.

Para cambiar el puerto, define `PORT`; para un contenedor o una red privada, `HOST`. No expongas HTTP directamente a Internet: configura HTTPS en el proxy del servidor. El proceso debe ejecutarse con un usuario sin privilegios.

En un hosting estático, sube únicamente el contenido de `web/`. Mantén `app-config.js`, `sw.js` e `index.html` sin caché prolongada. La aplicación utiliza rutas con `#` y no necesita reescrituras de rutas.

## Login y perfil

Edita `web/app-config.js` sin recompilar: `authApiUrl` apunta al Worker de acceso y `socialApiUrl` al Worker social desplegado. `loginUrl` y `createAccountUrl` apuntan al login separado en `xbae23/practica-kj`.

La ventana pequeña se implementa en `source/components/nexo-access.tsx`, componente `InstitutionalLogin`. No captura credenciales. Tras registrarse, Nexo pide un nombre visible y alias propios, separados del usuario del login; esos datos se guardan en D1 mediante `source/lib/nexo-auth.tsx`. El panel del login solo muestra ID, usuario y correo del registro.

## Estado real de esta entrega

Esta entrega incluye la interfaz y el código de una API social multiusuario para Cloudflare. El Worker `nexo-social` ya responde con D1 y R2, y la configuración incluida apunta a su URL. Se comprobó la API real con dos cuentas ficticias. El servidor Node incluido solo sirve archivos; las rutas `/api/` no hacen de backend social.

El flujo de cuenta y perfil ya usa el Worker de acceso separado. **No verifica la propiedad del correo**: cualquiera que conozca el correo o usuario podría entrar. Antes de admitir alumnos reales, añade verificación de identidad y los controles indicados en `source/social-worker/README.md`. No debe anunciarse como servicio para datos privados reales.

La entrada sin cuenta está deshabilitada. Con `socialApiUrl` configurado, la app lee y escribe actividad compartida mediante Cloudflare. Si ese Worker no responde, la interfaz muestra un error y no simula que la operación se guardó.

## Modificar y volver a compilar

Desde `source/`:

```sh
npm ci
npm run check
npm run test:release
npm run build:demo
```

La salida es `source/dist-demo/`. Para publicar cambios, reemplaza el contenido de `web/` con esa salida, conserva tu configuración y vuelve a deshabilitar `previewEnabled` antes de ponerlo en Internet. Para regenerar esta entrega y su inventario desde el repositorio original, ejecuta `npm run release` en la raíz del repositorio.
