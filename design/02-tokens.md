# Nexo UPA · Fase 2 · Design tokens

Versión de diseño 1.0 · 29 septiembre 2026. Fuente única de valores del diseño nuevo. No modifica la app experimental anterior.

Los patrones proceden de la auditoría; los valores siguientes son decisiones de diseño UPA, no tamaños supuestamente extraídos de X/Instagram. Solo modo claro. Nombre de trabajo propio: Nexo UPA; logotipo tipográfico «nexo» acompañado de UPA, sin marcas ajenas.

## Color

| Token | Valor | Uso |
|---|---|---|
| green.50 | #F0FDF6 | Hover suave / contexto seleccionado |
| green.100 | #DCFCEB | Selección y menta de apoyo |
| green.200 | #BBF7D5 | Selección presionada |
| green.300 | #86EFB2 | Anillo de stories; no texto sobre blanco |
| green.400 | #4ADE89 | Intermedio de escala; no texto sobre blanco |
| green.500 | #22C566 | Intermedio de escala; no CTA con texto blanco |
| green.600 | #16A052 | Intermedio de escala; no texto sobre blanco |
| green.700 | #087F4F | ÚNICO verde principal, acción y estado activo |
| green.800 | #16613F | Hover de acción primaria |
| green.900 | #124D34 | Pressed; texto sobre superficies verdes claras |
| neutral.white | #FFFFFF | Fondo principal y superficies |
| neutral.ink | #171A18 | Texto principal e iconos |
| neutral.muted | #59615C | Texto secundario y placeholder |
| neutral.surface | #F6F8F7 | Superficie secundaria y skeleton |
| neutral.divider | #E3E7E4 | Separación estructural, nunca único indicador de control |
| neutral.control | #7A857E | Borde de campo/controles que necesitan contraste |
| semantic.error | #A34343 | Error y acción destructiva exclusivamente |
| semantic.error-surface | #FFF5F5 | Fondo de error |
| semantic.warning | #875600 | Advertencia |
| semantic.warning-surface | #FFF8E6 | Fondo de advertencia |
| semantic.info | #126B70 | Información; extremo teal del anillo |
| semantic.info-surface | #EFFAFA | Fondo de información |
| overlay.scrim | rgba(23,26,24,0.40) | Velo detrás de modal; no superficie de texto |

Aliases: action=green.700; action-hover=green.800; action-pressed=green.900; on-action=neutral.white; selected-bg=green.100; selected-text=green.900; disabled-bg=neutral.divider; disabled-text=neutral.muted; focus=green.700; success=green.700; support-mint=green.100; support-forest=green.900.

Solo un acento dominante verde; por pantalla, como máximo un apoyo cromático adicional. Menta/bosque son tonos del mismo verde. Teal queda limitado al anillo o a un aviso informativo necesario; el error/advertencia desplaza el apoyo cromático opcional. Fotografía del usuario no se recolorea.

Único degradado: story.ring=135 grados, green.700 → green.300 → semantic.info. No se usa para texto ni fondos. Las tres paradas son la excepción expresamente solicitada para stories. Fuera del anillo, colores planos.

## Pares texto/fondo permitidos y contraste

Ratios calculados con luminancia relativa sRGB y (Lmayor+0.05)/(Lmenor+0.05). La validación usa valores completos, no redondeados. Todos los pares de texto autorizados superan 4,5:1, incluso texto pequeño. No están autorizadas otras combinaciones.

| Texto / fondo | Ratio |
|---|---:|
| neutral.ink / neutral.white | 17,54:1 |
| neutral.ink / neutral.surface | 16,44:1 |
| neutral.muted / neutral.white | 6,38:1 |
| neutral.muted / neutral.surface | 5,99:1 |
| neutral.muted / neutral.divider | 5,11:1 |
| neutral.white / green.700 | 5,05:1 |
| neutral.white / green.800 | 7,46:1 |
| neutral.white / green.900 | 9,83:1 |
| green.700 / neutral.white | 5,05:1 |
| green.700 / green.50 | 4,83:1 |
| green.900 / green.100 | 8,97:1 |
| green.900 / green.200 | 8,13:1 |
| semantic.error / neutral.white | 6,10:1 |
| semantic.error / semantic.error-surface | 5,70:1 |
| neutral.white / semantic.error | 6,10:1 |
| semantic.warning / semantic.warning-surface | 5,90:1 |
| semantic.warning / neutral.white | 6,25:1 |
| semantic.info / semantic.info-surface | 5,87:1 |
| semantic.info / neutral.white | 6,24:1 |

neutral.control / white = 3,83:1: válido como borde no textual; PROHIBIDO como texto. neutral.divider solo separa contenido y no constituye un campo o botón por sí mismo. Sobre fotos, el texto se coloca en panel opaco blanco o green.900; no se presume contraste del fondo de imagen.

Base normativa: [WCAG 2.2, contraste](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). El mínimo táctil propio será 44×44, más estricto que el criterio AA de 24×24 y sus excepciones: [WCAG 2.2, target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

## Tipografía

Familia única: system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif. Usa tipografía del sistema en iPhone/Android; no descarga fuentes comerciales. La jerarquía y el énfasis, no las fuentes licenciadas, recogen el acabado complementario.

| Token | Tamaño / interlineado / peso | Uso |
|---|---|---|
| type.caption | 12 / 16 / 400 | Hora, cuenta y ayuda breve |
| type.meta | 14 / 20 / 400 | Handle, contexto, listas secundarias |
| type.meta-strong | 14 / 20 / 600 | Estado o autor compacto |
| type.body | 16 / 24 / 400 | Post, mensaje, input |
| type.body-strong | 16 / 24 / 600 | Nombre y botón |
| type.section | 20 / 28 / 600 | Cabecera contextual |
| type.title | 24 / 32 / 700 | Perfil y título de diálogo |
| type.brand | 32 / 40 / 700 | Logotipo tipográfico |

Texto nunca menor que caption; inputs siempre body para evitar escalado involuntario. Escala del usuario respetada; no recortar mensajes/copy esencial por altura fija. Número de cuota/tiempo usa cifras tabulares. Tracking normal; se evita tipografía de énfasis gigante en el feed.

## Geometría

| Familia | Tokens y valores CSS px |
|---|---|
| space | 0=0, 1=4, 2=8, 3=12, 4=16, 5=20, 6=24, 8=32, 10=40, 11=44, 12=48, 14=56, 16=64, 20=80, 24=96 |
| radius | none=0, sm=8, md=12, lg=16, xl=24, pill=999 |
| border | hairline=1, focus=2 |
| icon | sm=16, md=20, lg=24; stroke=1.75 |
| avatar | xs=24, sm=32, md=40, lg=48, story=64, profile=80 |
| control | touch=44, standard=48, header=56, bottom-nav=64 |
| container | min=320, mobile=375, tablet=768, desktop=1280, wide=1440, feed=600, sidebar=216, aside=280, modal=480, story-viewer=375 |
| layout | mobile-gutter=space.4, tablet-gutter=space.6, desktop-gutter=space.8, column-gap=space.6; grid-unit=space.1 |
| media | portrait=4:5, landscape=16:9, story=9:16; profile-grid-columns=3; grid-gap=border.hairline |
| story | ring=border.focus, gap=space.1, track=space.1; item-width=space.20 |
| focus | width=border.focus, offset=space.1 |
| relative | full=100%, half=50%, flex=1, none=0 |
| safe-area | superior/inferior/laterales = insets que entregue el dispositivo; no constante inventada |

spacing 44 es una excepción documentada por el objetivo táctil. Bordes, iconos y tipografía son sus propias escalas; la regla 4/8 rige espaciado/layout, no obliga un borde de 4 px.

Feed sin tarjetas flotantes: superficie blanca, separación hairline, sin sombra ni radio exterior. Media radius.lg; botón radius.pill; input radius.md; diálogo radius.xl desktop y radius.none fullscreen móvil. Avatares circulares, sin sombras.

Elevación: shadow.none=none. shadow.dialog=0 4px 16px rgba(23,26,24,0.08), permitido solo en modal desktop. El prototipo visual usa shadow.none para evitar decoración innecesaria.

Capas: z.base=0; z.sticky=10; z.navigation=20; z.scrim=30; z.modal=40; z.toast=50. Un diálogo nunca queda debajo de la barra de navegación. Sin cadenas de capas arbitrarias.

## Responsive y templates

| Token/rango | Distribución |
|---|---|
| bp.min=320 a bp.tablet=768 (exclusivo) | Una columna; cabecera contextual; barra inferior; sin panel derecho; composer/visor ocupan la superficie móvil |
| bp.tablet=768 a bp.desktop=1280 (exclusivo) | Sidebar compacta control.bottom-nav de ancho; columna principal hasta container.feed; sin aside. Mensajes puede usar lista 280 + hilo con resto flexible |
| bp.desktop=1280 en adelante | Sidebar 216 + feed 600 + aside 280, espacios column-gap y márgenes desktop-gutter; grupo centrado |
| bp.wide=1440 en adelante | Misma anchura de lectura; crecen márgenes, no el cuerpo del feed |

En 1280: 216+600+280+24+24+32+32 = 1208 px; quedan 72 px que se reparten como aire exterior. En 375: área textual 343 px (375−16−16). En 320: área 288 px. Con texto ampliado, controles envuelven, el feed crece en alto y no se oculta contenido. Barra inferior siempre reserva safe-area y no tapa la última acción.

## Motion y estados básicos

duration.instant=0 ms; duration.fast=100 ms; duration.feedback=160 ms; duration.normal=200 ms; duration.overlay=240 ms. easing.standard=cubic-bezier(0.2,0,0,1); easing.enter=cubic-bezier(0,0,0.2,1); easing.exit=cubic-bezier(0.4,0,1,1).

transform.press=0.98; transform.up=1.08; translate.sheet=space.4. opacity.full=1; opacity.none=0; opacity.scrim=0.40; opacity.shadow=0.08. No parallax, confeti, spring ni loop decorativo. Reducir movimiento sustituye transición por instant; carga usa estado textual estático en vez de shimmer.

## Reglas de aplicación

Todo valor de las fases siguientes debe resolver a estos tokens o ser un dato de contenido (precio, cantidad, tiempo, etc.). No se incorporan tokens de la app guinda anterior. Un valor nuevo exige ampliar esta tabla antes de usarlo. La maqueta puede tener controles de revisión externos: no forman parte de la interfaz de UPA.
