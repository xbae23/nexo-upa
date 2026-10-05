# Nexo UPA · 1.0.0

Interfaz móvil de la comunidad UPA. [Vista previa publicada](https://xbae23.github.io/nexo-upa/) · [Entrega para servidor](nexupav1.0.0/README.md).

## Qué cambió

Acceso como primera pantalla, marca de gorrión de dos colores, fotografía de perfil propia, menús sin duplicados, cámara/galería directa para Dumps y correcciones del editor y visor móvil que se mantienen al compilar. No se precargan usuarios, publicaciones, conversaciones o fotos inventadas.

La app exige una cuenta. El login y panel viven en el [repositorio separado practica-kj](https://github.com/xbae23/practica-kj) y ya usan Cloudflare D1. Esta versión incluye un [Worker social](social-worker/README.md) y la conexión desde la interfaz para compartir usuarios, publicaciones, medios y mensajes. **La función multiusuario no estará activa en GitHub Pages hasta que el propietario despliegue ese Worker, agregue R2 y configure `socialApiUrl`.** Mientras tanto, la actividad sigue limitada al dispositivo.

## Desarrollo

Node 22.13 o posterior:

```sh
npm ci
npm run dev:demo
npm run check
npm run test:release
npm run release
```

La prueba local abre en http://127.0.0.1:5174/. La compilación estática se crea en `dist-demo/`.

## Entrega separada

`nexupav1.0.0/` contiene `web/`, `servidor/`, `source/`, `docs/` y un inventario verificable. El generador usa una lista explícita de archivos, no copia bases, secretos, dependencias ni pruebas personales. Si editas manualmente un archivo de la entrega, el generador se detiene para no sobrescribirlo.

## Conexión del login y perfil

- URLs públicas del login y la API: [public/app-config.js](public/app-config.js), o `web/app-config.js` dentro de la entrega.
- Ventana pequeña: `InstitutionalLogin` en [components/nexo-access.tsx](components/nexo-access.tsx).
- Motor de sesión y perfil: [lib/nexo-auth.tsx](lib/nexo-auth.tsx). **No lo cambies al rediseñar el login.**
- Imagen reemplazable: [public/login-provider.svg](public/login-provider.svg).
- Pasos y límites: [LOGIN-Y-DATOS.md](release/LOGIN-Y-DATOS.md).
- Activación de la comunidad real: [social-worker/README.md](social-worker/README.md).

Nexo no captura credenciales; el login se diseña aparte. El nombre visible y alias que se introducen al entrar por primera vez no se copian del registro. Se guardan en una tabla separada y no aparecen en el panel. **El correo no se verifica en esta demo; conocer un usuario o correo permite entrar.** No uses `previewEnabled` como autenticación ni invites usuarios reales todavía.

## Publicación y pruebas

Cada push a `main` comprueba tipos, pruebas, compilado e inventario de la entrega antes de publicar GitHub Pages. La [revisión de esta versión](release/QA.md) distingue lo comprobado de lo pendiente. Los recursos ilustrativos antiguos están archivados en `design/archive-media/` y no se publican.

El prototipo histórico `local-server/` permanece separado y no se incluye como backend de producción. Este proyecto estudiantil no es un servicio oficial de la universidad.
