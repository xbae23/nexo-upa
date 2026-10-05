# Nexo UPA · nexupav1.0.0

Entrega separada para publicar la interfaz web, sin usuarios, publicaciones ni fotos de ejemplo.

## Carpetas

- `web/`: archivos compilados. Es la única carpeta que debe quedar expuesta por un hosting estático.
- `servidor/`: servidor web Node sin dependencias externas, pruebas y ejemplo de servicio.
- `source/`: código editable y archivo de dependencias bloqueadas para reproducir la web.
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

## Tu login

Edita `web/app-config.js` sin recompilar. La imagen del botón es `web/login-provider.svg`; puedes sustituirla y cambiar `providerImage` por tu imagen.

La ventana pequeña se implementa en `source/components/nexo-access.tsx`, componente `InstitutionalLogin`. No contiene formularios ni captura correo o contraseña. No impone dominio institucional. El teléfono pertenece al perfil y no es público.

## Estado real de esta entrega

Esta entrega es la **interfaz publicable**, no un backend de red social multiusuario terminado. El servidor incluido sirve archivos, no cuentas, conversaciones compartidas, notificaciones push ni base de datos social. No autentica mediante el botón de prueba ni acepta contraseñas. Las rutas `/api/` devuelven 503 mientras no se conecten servicios reales.

Tu login y su integración de sesión siguen pendientes por indicación tuya. Enlazar una URL no crea una sesión de Nexo. Antes de admitir alumnos reales, conecta la sesión y la API social según `docs/LOGIN-Y-DATOS.md`. No debe anunciarse como servicio multiusuario terminado hasta comprobar esa integración.

La vista previa de GitHub permite probar la interfaz con almacenamiento en ese navegador. En esta carpeta está **deshabilitada por defecto**. Para una prueba local deliberada del paquete, inicia el servidor con `NEXO_PREVIEW=true`; esto no autentica ni sincroniza usuarios.

## Modificar y volver a compilar

Desde `source/`:

```sh
npm ci
npm run check
npm run test:release
npm run build:demo
```

La salida es `source/dist-demo/`. Para publicar cambios, reemplaza el contenido de `web/` con esa salida, conserva tu configuración y vuelve a deshabilitar `previewEnabled` antes de ponerlo en Internet. Para regenerar esta entrega y su inventario desde el repositorio original, ejecuta `npm run release` en la raíz del repositorio.
