# Nexo UPA

Demo instalable y adaptable de una red social para la comunidad de la Universidad Politécnica de Atlautla. Está diseñada primero para teléfonos y funciona también en tabletas y escritorio. Las fotografías institucionales provienen del [sitio oficial de UPA](https://upa.edomex.gob.mx/) y se identifican como ejemplos dentro de la interfaz.

## Probarla

Requiere Node.js 22.13 o posterior. En la carpeta del proyecto:

```sh
npm ci
npm run dev:demo
```

Abrir la dirección local que muestra Vite (normalmente `http://127.0.0.1:5173/`). Para revisar exactamente la versión estática que se publicará en GitHub Pages:

```sh
npm run check
npm run build:demo
npm run preview:demo
```

La versión de producción incluye `manifest.webmanifest`, iconos y service worker para poder instalarla como app web desde un navegador compatible. El navegador decide cuándo ofrece **Instalar** o **Añadir a pantalla de inicio**; no todos muestran el mismo aviso. También se puede ejecutar la variante Vinext con `npm run dev`.

## Qué se puede probar ahora

- Feed «Para ti» / «Siguiendo», búsqueda, perfiles, seguir/dejar de seguir, Up!, repost, guardados, compartir, ocultar, comentarios y respuestas.
- Crear Post sin cupo, Notify y Reporte con cupos **separados** de dos al día, y Venta con ficha de producto.
- Dumps visibles para la comunidad durante tres horas; videos de Dump de hasta 25 segundos y videos de publicaciones de hasta 30 segundos.
- Mensajes con búsqueda, temas, notas, enlaces, archivos de hasta 10 MB, fotos y audio grabado, cuando el navegador permite micrófono. Una conversación caduca a los siete días del primer mensaje; los posteriores no reinician el plazo.
- Estados animados ligeros, reducción de movimiento según el sistema, navegación táctil, diseño responsivo e instalación PWA.

**Alcance de la demo:** el contenido inicial, los perfiles y la actividad de otros usuarios son ilustrativos. Tus cambios se guardan en **IndexedDB de este navegador/dispositivo**. No se sincronizan entre personas o equipos. La presencia y las notificaciones son simuladas; no hay push, moderación, verificación universitaria ni chat compartido en tiempo real. Borrar los datos del sitio borra los cambios de la demo. GitHub Pages sirve archivos estáticos y no ejecuta la API de cuentas.

## Conectar tu pantalla de login

Edita solo las direcciones de [lib/app-config.ts](lib/app-config.ts):

```ts
createAccountUrl: "https://tu-dominio/crear-cuenta",
loginUrl: "https://tu-dominio/iniciar-sesion",
```

Los botones «Crear cuenta» e «Iniciar sesión» ya usan esos campos. Mientras estén vacíos, se muestra un aviso explicando que falta el enlace, sin pedir contraseñas. No pongas contraseñas, tokens ni claves en ese archivo o en la web. Aún no conocemos la URL de tu login; enlazarlo **no equivale a autenticar** a quien usa Nexo. La integración real debe verificar la sesión desde un servidor antes de permitir acciones entre usuarios.

## Base de cuentas local, separada de la demo pública

Hay un prototipo de servidor en [local-server/server.mjs](local-server/server.mjs). Arráncalo con `npm run auth:local`; atiende solamente en `http://127.0.0.1:8788`, y guarda su SQLite en `.local/nexo-users.sqlite` (ignorados por Git). El correo es único; las contraseñas no se guardan en claro: se guarda una derivación `scrypt` con sal aleatoria. La sesión usa una cookie `HttpOnly`, `SameSite=Strict`. No contiene usuarios ni contraseñas reales.

Desde una página de registro que se ejecute **localmente en el origen permitido**, el contrato es:

| Acción | Método y ruta | JSON de solicitud |
|---|---|---|
| Crear cuenta | `POST /auth/register` | `{ "name": "...", "email": "...", "password": "..." }` |
| Entrar | `POST /auth/login` | `{ "email": "...", "password": "..." }` |
| Consultar sesión | `GET /auth/me` | — |
| Salir | `POST /auth/logout` | — |

El registro exige contraseña de 12 a 128 caracteres. Las peticiones del navegador deben usar `credentials: "include"` para la cookie. El servidor permite por defecto los orígenes locales 5173 y 5174. Ejecuta `npm run test:auth` para comprobar registro, login, cierre, duplicados y almacenamiento derivado.

**Antes de usar cuentas reales:** este servidor de prueba no puede funcionar en GitHub Pages ni autenticará automáticamente tu login externo. Necesitará hospedaje de servidor, HTTPS, dominio/orígenes y cookies configurados para ese entorno, verificación de correo, recuperación de contraseña, protección y auditoría de abuso, políticas de privacidad, autorización por usuario y respaldo de la base. Las operaciones sociales tendrán que moverse de IndexedDB a una API multiusuario. No se deben registrar alumnos reales ni recolectar contraseñas con la demo actual.

## Publicación de prueba

Repositorio: [github.com/xbae23/nexo-upa](https://github.com/xbae23/nexo-upa). Demo publicada: [xbae23.github.io/nexo-upa](https://xbae23.github.io/nexo-upa/).

El repositorio incluye [.github/workflows/pages.yml](.github/workflows/pages.yml) y tiene **GitHub Actions** como origen de Pages. Cada actualización de `main` ejecuta comprobación de tipos, compila `dist-demo` y lo despliega. La ruta base es relativa, así que sirve en una URL de proyecto. La demo funciona sin hosting de backend, con las limitaciones indicadas arriba.

Para actualizarla, edita el código, comprueba `npm run check` y `npm run build:demo`, crea un commit y súbelo a `main`. El despliegue automático aparecerá en la pestaña **Actions** del repositorio. No introduzcas credenciales en Git; `.local/`, compilados y dependencias quedan ignorados.

## Organización

- `app/`, `components/`, `lib/`: interfaz, funciones y datos de la demo.
- `public/`: fotos, iconos, manifiesto y service worker.
- `local-server/`: prototipo de cuentas local y prueba automatizada.
- `design/`: investigación de referencias, sistema visual y decisiones de producto. Es documentación histórica: algunas fases fueron redactadas antes de desarrollar esta demo.
- `index.html`, `demo-entry.tsx`, `vite.demo.config.ts`: entrada estática compatible con Pages.

La aplicación usa patrones de navegación y densidad de información estudiados en X e Instagram, con una identidad verde/blanca propia; no está afiliada a esas plataformas. Las publicaciones de ejemplo no son avisos oficiales de UPA.
