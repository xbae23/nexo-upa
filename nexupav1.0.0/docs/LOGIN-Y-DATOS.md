# Integración pendiente de tu acceso y los datos

## Lo que puedes reemplazar ahora

1. **Texto, imagen y botón inicial:** `source/components/nexo-access.tsx` (`AccessGate`).
2. **Ventana superpuesta:** el componente `InstitutionalLogin` del mismo archivo. Sus dimensiones están en `source/app/release-polish.css`, selector `.institutional-popup`: máximo 360 px y altura limitada a la pantalla.
3. **URL de tu pantalla:** `web/app-config.js`, propiedades `loginUrl` y `createAccountUrl`.
4. **Imagen pequeña:** `web/login-provider.svg` o el archivo indicado por `providerImage`.

El acceso inicial no pide correo, contraseña ni dominio. Dice «Regístrate con tu correo institucional». Tu servicio decidirá cómo verificarlo. No escribas claves, secretos ni contraseñas en archivos públicos o en GitHub.

## Lo que NO hace una URL de login

No autoriza acceso al feed, no valida alumnos y no crea una sesión compartida. `AccessGate` mantiene cerrada la interfaz de servidor hasta implementar la integración real. El botón de vista previa está separado y no equivale a autenticación.

## Contrato que deberá implementar tu backend

- Consultar la sesión desde el servidor mediante una cookie de sesión `HttpOnly`, `Secure` y una política `SameSite` adecuada a tu dominio; verificar expiración y cerrar sesión.
- Entregar el perfil del usuario verificado. Nombre, usuario y foto son datos del perfil; teléfono debe permanecer privado y ser opcional salvo que definas otro requisito.
- Sustituir el almacenamiento local de `lib/demo-store.tsx` por operaciones autenticadas: perfiles, publicaciones, comentarios, reacciones, seguidores, historias, notificaciones y conversaciones.
- Validar propiedad y participantes en cada operación del servidor. No aceptar un estado completo del cliente como autoridad ni confiar en `own`, autor, cupos o fechas enviados por el navegador.
- Aplicar los cupos de Notify/Reporte por usuario y día en `America/Mexico_City`, expiración de Dumps a las 3 horas y conversaciones a los 7 días desde su primer mensaje.
- Validar archivos en servidor: tipo real, tamaño, duración, almacenamiento privado para adjuntos de chat y acceso autorizado. Los límites de interfaz no sustituyen esos controles.
- Implementar respaldo y recuperación, límites de abuso, reportes/moderación y tratamiento de datos antes del lanzamiento público.

Estos servicios **no se presentan como implementados** en esta entrega. GitHub Pages no los ejecuta. El prototipo antiguo `local-server/` del repositorio raíz tampoco equivale a este backend y no se incluye en el paquete del servidor.
