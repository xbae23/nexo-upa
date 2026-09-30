# Nexo UPA · Fase 6 · Verificación de diseño

Estado de este archivo: revisión histórica de la especificación, anterior a la implementación. Los «No» registran pendientes de aquella fase, no el estado actual de la demo. Para ejecutar y conocer los límites de la app, consulta el README de la raíz.

| Criterio del brief | Sí/No | Evidencia y límite |
|---|---|---|
| Arquitectura/modelo de contenido derivados de X/IG | Sí | Auditoría §4/6 y ocho superficies de 04. Adaptaciones UPA explícitas |
| Réplica visual exacta de layout/jerarquía/densidad/iconografía | No | Patrones y tokens definidos; faltan comparar todas las maquetas contra versiones objetivo y evidencias de algunos estados autenticados |
| Fondo blanco y mapa de acentos→verde | Sí | 01 §7 y 02 colores; no se afirma que todos los acentos de IG sean rojos |
| Máximo un dominante + un apoyo; sin decoración no permitida | Sí | 02 reglas cromáticas; degradado solo story.ring; sombra solo modal mínimo, no obligatoria |
| Rojo solo error/destructivo | Sí | 02 semantic.error y 03 estados; Report no se pinta rojo |
| Acabado vinculado a matriz | Sí | 01 §6 → botones/énfasis/motion de 02/03/05; accesibilidad prevalece sobre alturas pequeñas medidas |
| Valores de especificación provienen de tokens | Sí | Fases 3–5 referencian 02; números de cuota/plazo son requisitos de contenido, no estilos libres |
| Todos los estados documentados por componente | Sí | Contrato S0–S10, estados adicionales y N/A para elementos estáticos en 03 |
| Todos los estados representados y comprobados visualmente | No | La primera maqueta será una vista de revisión, no la biblioteca visual exhaustiva de todas las variantes |
| Responsive definido móvil/tablet/desktop | Sí | Templates 02 y 04; anchuras de referencia 320/375/768/1280/1440 |
| Responsive comprobado en todos los estados y tamaños | No | Requiere revisión completa de maquetas, reflow y escalado de texto |
| Contrastes de texto y verde AA comprobados | Sí | Cálculos de 20 pares de texto autorizados en 02; borde control aparte a 3,83:1 |
| Accesibilidad WCAG 2.2 AA completa verificada | No | Contraste calculado y interacción especificada; faltan pruebas de teclado/lector/reflow sobre implementación futura y revisión de toda la maqueta |
| Sin nuevas funciones/pantallas ajenas | Sí | Ocho pantallas del brief; ofertas dentro de Explorar; auth conserva petición previa como diálogo |

## Correcciones aplicadas durante esta revisión

1. Paleta guinda anterior excluida de la propuesta nueva.
2. No se copia el punto azul de DM; se adapta a verde sin falsear la referencia.
3. Controles inferiores a touch en algunas referencias no se copian literalmente.
4. Escala verde clara no se utiliza con texto blanco; action usa green.700, contraste 5,049:1.
5. No se copia la intro de Cash ni decoración 3D de Sugar dentro del feed.
6. No se añaden canales, mapas, pagos, suscripciones ni productos de las plataformas de referencia.
7. Se eliminó la inferencia de duración automática de un Dump de imagen: no fue solicitada.

## Decisiones funcionales aún abiertas

- Tiempo de exposición de una imagen fija en Dumps.
- Límite/duración de notas, si ese era el significado de «tomas».
- Si una conversación caducada permite abrir otra nueva y cómo se presenta el nuevo plazo.
- Dominio institucional permitido y política de verificación de correo para registro.

Estas decisiones no impiden revisar el aspecto visual, pero sí impiden declarar lista una implementación completa. No se usa una decisión implícita para exceder el alcance. Ninguna credencial real se pide para la maqueta.

## Entrega y estado real

Se han documentado en orden auditoría, tokens, componentes, pantallas/flujos y motion. Este checklist se ejecuta después de esas especificaciones. El diseño no se declara terminado al 100 % hasta resolver los «No» que correspondan a la entrega visual. Las pruebas de una app real solo pueden realizarse cuando se autorice volver a desarrollo.

Esta evaluación correspondía solo a la fase de diseño. Posteriormente se implementó la demo funcional, se realizaron comprobaciones de interacción y se preparó su publicación en GitHub Pages; el estado de publicación se documenta en el README.
