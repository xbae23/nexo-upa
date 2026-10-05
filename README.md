# Nexo UPA · 1.0.0

Interfaz móvil de la comunidad UPA. [Vista previa publicada](https://xbae23.github.io/nexo-upa/) · [Entrega para servidor](nexupav1.0.0/README.md).

## Qué cambió

Acceso como primera pantalla, marca de gorrión de dos colores, fotografía de perfil propia, menús sin duplicados, cámara/galería directa para Dumps y correcciones del editor y visor móvil que se mantienen al compilar. No se precargan usuarios, publicaciones, conversaciones o fotos inventadas.

La vista previa de GitHub permite probar sin iniciar sesión; solo conserva las acciones en ese navegador. La entrega de servidor mantiene ese acceso de prueba deshabilitado. **Es una interfaz publicable, no un backend social multiusuario terminado.** Tu login se deja para que lo reemplaces; las cuentas, sesiones y sincronización real aún requieren integración de servidor.

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

## Dónde conectar tu login

- URL e imagen: [public/app-config.js](public/app-config.js), o `web/app-config.js` dentro de la entrega.
- Ventana pequeña: `InstitutionalLogin` en [components/nexo-access.tsx](components/nexo-access.tsx).
- Imagen reemplazable: [public/login-provider.svg](public/login-provider.svg).
- Pasos y límites: [LOGIN-Y-DATOS.md](release/LOGIN-Y-DATOS.md).

No hay campos de correo/contraseña ni un dominio fijado por nosotros. Enlazar una URL no valida una sesión: no uses `previewEnabled` como autenticación.

## Publicación y pruebas

Cada push a `main` comprueba tipos, pruebas, compilado e inventario de la entrega antes de publicar GitHub Pages. La [revisión de esta versión](release/QA.md) distingue lo comprobado de lo pendiente. Los recursos ilustrativos antiguos están archivados en `design/archive-media/` y no se publican.

El prototipo histórico `local-server/` permanece separado y no se incluye como backend de producción. Este proyecto estudiantil no es un servicio oficial de la universidad.
