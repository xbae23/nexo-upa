# Nexo UPA 2026 · Fase 4: matriz de gestos y zoom

Fecha: 30 de septiembre de 2026. La matriz se compara con el skill `social-superapp-2026` facilitado por el usuario. «Up!» es la reacción propia de Nexo: no se sustituye por un corazón ni se cambia la lógica existente. Un gesto es complemento de un control visible, nunca la única vía para completar la tarea. La columna de estado describe **esta rama** y separa implementación de validación física.

| Elemento y gesto | Resultado / feedback | Estado actual | Alternativa accesible / dependencia |
|---|---|---|---|
| Foto de post · doble toque | Dar Up! una sola vez, ráfaga visual y vibración breve si el navegador la admite | 🔧 Pointer Events detrás de `gestures2026`; falta probarlo en iPhone/Android físicos | Botón «Dar Up» del post. Es interacción **local**, no reacción enviada a otros usuarios. |
| Foto · toque simple | Abre visor sin confundirlo con el segundo toque de Up! | 🔧 Implementado con ventana de 310 ms; QA táctil físico pendiente | Botón de foto con nombre accesible y tecla Intro/Espacio. |
| Visor · pellizcar y mover | Zoom 1–4× con punto focal, desplazamiento acotado | 🔧 Matemática y Pointer Events implementados; multitouch físico pendiente | Botones Acercar, Alejar, Restablecer y mover en cuatro direcciones. |
| Visor · doble toque | Alterna 1× ↔ 2× alrededor del punto tocado | 🔧 Implementado; doble clic comprobado en navegador | Botones de zoom y restablecimiento. |
| Visor · arrastrar abajo | Cierra solo a escala 1×, con desvanecimiento | 🔧 Implementado; drag de escritorio comprobado, tacto físico pendiente | Botón «Cerrar foto» y Escape. |
| Carrusel · deslizar horizontal | Avanza medio con snap e indicador | ❌ El modelo actual tiene un solo medio por post | Flechas y puntos antes de activar el gesto; requiere ampliar modelo de medios. |
| Cámara · pellizcar | Cambia zoom e indica nivel | ❌ No existe cámara propia | Slider/botón de zoom; depende de `getUserMedia` y capacidades del dispositivo, no de servidor para la captura local. |
| Cámara · toque para enfocar | Foco/exposición visibles | ❌ | Botón/indicador de enfoque; enfoque físico solo si la cámara expone esa capacidad. |
| Cámara · doble toque | Voltea cámara | ❌ | Botón Voltear; liberar el stream anterior. |
| Cámara · deslizar modos | Post / Dump / Video con snap | ❌ | Tabs visibles de modo. |
| Cámara · mantener captura | Graba con anillo de progreso | ❌ | Botones foto y grabar/detener; `MediaRecorder`, permisos y límites 25/30 s. Publicación compartida necesitará backend. |
| Dump · toque izquierda/derecha | Anterior/siguiente con barra | 🔧 Implementado con Pointer Events; comprobado con ratón, tacto físico pendiente | Flechas existentes. |
| Dump · mantener | Pausa y reduce UI | 🔧 Implementado; pulsación táctil sostenida pendiente de prueba física | Botón Pausar/Reanudar ya existente. |
| Dump · deslizar abajo/arriba | Cerrar / abrir respuesta | 🔧 Implementado y comprobado con arrastre de ratón; tacto físico pendiente | X y Responder ya existentes. |
| Dump · deslizar horizontal | Anterior/siguiente | 🔧 Implementado con eje dominante y comprobado con arrastre de ratón; tacto físico pendiente | Flechas existentes. |
| Reel · deslizar vertical | Video siguiente/anterior con snap | ❌ No hay feed Reel | Botones anterior/siguiente; precarga requiere módulo de video y política de memoria. |
| Reel · toque | Pausar/reanudar | ❌ | Control de reproducción visible y nativo. |
| Post / mensaje · pulsación larga | Menú contextual / reacciones | ❌ | Menú `…` de post ya existe; reacción de mensaje requiere modelo y API para ser compartida. |
| Mensaje · deslizar horizontal | Responder con cita | ❌ | Botón Responder pendiente; `replyTo` local y contrato de mensajes del análisis de brechas antes de sincronizar. |
| Lista · deslizar | Revelar acciones seguras | ❌ | Menú visible con deshacer; bloquear/silenciar reales requieren backend y autorización. |
| Feed · tirar abajo | Refrescar sin secuestrar scroll | ❌ | Botón Refrescar pendiente; no fingir llegada de posts si no hay API. |
| Inicio · tocar tab activo | Volver al inicio y refrescar | 🔧 La navegación ya sube al inicio; no consulta red | Tab Inicio y futura acción explícita de refresco. |
| Sheet · arrastrar | Cerrar / snap points | ❌ Composer aún es Dialog | X y botón cerrar; evitar conflicto con scroll del formulario. |
| Video · doble toque lateral | ±10 s y ripple | ❌ Video usa controles nativos | Botones visibles ±10 s y controles nativos. |

## Implementación y límites de esta entrega

- `components/nexo-post-media.tsx` evita que el doble toque de foto se dispare sobre controles de video; el video conserva sus controles nativos. Un toque simple abre el visor y dos toques cercanos activan Up!, con botón alternativo. `components/nexo-media-viewer.tsx` usa `pointerdown/move/up/cancel`, no listeners pasivos globales ni bloqueo de scroll fuera del visor. `touch-action: none` se limita al área inmersiva de foto.
- `lib/gesture-math.ts` concentra límites, punto focal, distancia, doble toque y dirección dominante; siete pruebas `node:test` cubren la geometría. La bandera `VITE_GESTURES_2026=off` o la apariencia `?nexo2026=legacy` devuelven el comportamiento anterior. No hay cambios de datos ni de API.
- El visor limita el pan según el tamaño real de la foto y del escenario (también panorámicas), sigue el punto medio al pellizcar y ofrece botones de pan accesibles. `StoryViewer` añade los gestos del Dump en el modo nuevo; ignora botones, enlaces y controles de video, conserva los controles nativos y sigue ofreciendo navegación, pausa, respuesta y cierre visibles. La zona superior e inferior de ambos visores respeta el área segura de teléfonos con notch.
- `navigator.vibrate()` es un efecto **opcional** de pocos milisegundos con detección de capacidad, documento visible y respeto a movimiento reducido. La [especificación W3C](https://www.w3.org/TR/vibration/) dice que se implementa en Chromium y que WebKit se opone; por tanto, la PWA de iPhone **no ofrece haptics reales**. Eso requeriría empaquetado nativo, por ejemplo [Capacitor Haptics](https://capacitorjs.com/docs/apis/haptics). La interfaz nunca depende de la vibración para comunicar el resultado.
- La foto deportiva oficial usada en la demo tiene resolución de miniatura (250×188 px). El visor revela esa limitación; se está verificando una fuente oficial de mayor tamaño antes de presentarla como experiencia final.

## QA de fase

Comprobado en navegador local: apertura/cierre del visor, controles 1×→1,5×→1× y pan con botón, doble clic hasta 2×, arrastrar abajo para cerrar, anchura sin overflow a 360 px. En un origen de prueba con Dumps semilla, se verificaron toques a izquierda/derecha, deslizamiento lateral, abajo para cerrar y arriba para abrir Responder; el modo `?nexo2026=legacy` no activa los gestos nuevos. Pasaron TypeScript, build Vite, siete pruebas matemáticas y el test de autenticación local. **Pendiente:** pinza real de dos dedos, doble toque táctil sobre post, mantener pulsado en dispositivo, VoiceOver/TalkBack, rendimiento en equipo de gama media, imagen de alta resolución y el resto de la matriz. Esta fase no debe considerarse como la matriz completa implementada.

Siguiente corte de fase: cámara/composer con permisos explicados y validación de captura, sin publicar contenido ni pedir credenciales. Las funciones que necesitan sincronización real deberán esperar las tablas/endpoints de [Fase 2](02-brechas-y-contrato.md).
