# Nexo UPA · Fase 5 · Motion e interacción

Todos los valores remiten a 02-tokens.md. Las duraciones son decisiones UPA inspiradas en la sutileza de las referencias; no mediciones de X/Instagram.

| Interacción | Secuencia | Duración / curva | Reducir movimiento |
|---|---|---|---|
| Up! | Contorno→activo verde; contador actualiza sin mover sus vecinos; pulso único hasta transform.up y retorno | duration.feedback / easing.standard | Cambio instantáneo, sin pulso |
| Doble toque en medio | Activa Up! si estaba inactivo; no quita Up al segundo toque; botón equivalente siempre disponible | Mismo feedback de Up!; no overlay gigante | Activo instantáneo |
| Seguir | Etiqueta «Siguiendo», tratamiento suave verde; ancho reservado para ambas etiquetas | duration.feedback / easing.standard | Instantáneo |
| Guardar | Contorno→lleno verde; toast «Guardado»; segunda acción deshace | duration.feedback / easing.standard | Instantáneo y misma confirmación textual |
| Repost | Confirmación de opción, icono activo; si cita abre composer | duration.feedback / easing.standard | Instantáneo |
| Botón | Hover cambia fondo; pressed cambia tono con transform.press opcional; release restaura | duration.fast / easing.standard | Solo tono, sin escala |
| Pull-to-refresh | Gesto solicita actualización; indicador y texto fuera del contenido; conserva posición si falla | Indicador ligado a petición, no temporizador falso; asentamiento duration.normal | Sin desplazamiento animado; Reintentar/Actualizar como alternativa |
| Stories | Cambio de pieza sin carrusel 3D; progreso sigue tiempo real de reproducción; pausa explícita | Transición duration.normal / easing.standard | Cambio instantáneo; no autoavance por animación decorativa |
| Buffer de story | Detiene progreso, muestra «Cargando…», controles de salida activos | Hasta resolución real; no tiempo inventado | Estado estático |
| Modal | Velo y panel; entrada desde translate.sheet; foco al título/control pertinente | duration.overlay / easing.enter; cierre duration.normal / easing.exit | Panel aparece/desaparece sin desplazamiento |
| Tabs | Indicador cambia sin deslizar todos los posts; conservar foco | duration.fast / easing.standard | Instantáneo |
| Skeleton | Bloques quietos de la anatomía; sin loop ni parpadeo | Estático por defecto | Idéntico |
| Toast | Aparece en hueco reservado sobre navegación; sin empujar feed | duration.feedback / easing.standard | Instantáneo |

No usar motion para ocultar latencia. No retrasar la respuesta visual esperando una animación. Nunca bloquear cerrar por transición. Progreso de vídeo es dato temporal, no animación decorativa; su duración deriva del medio válido y conserva alternativa textual.

La duración de imágenes fijas en Dumps no fue especificada por el usuario: pendiente, no se rellena con un valor arbitrario. Expiración 3 h no equivale a tiempo de reproducción. Tampoco se fija un auto-dismiss arbitrario para mensajes de error; se mantienen hasta resolución o cierre consciente.
