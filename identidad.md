# Nexo UPA · identidad y sistema visual

Nexo hace que la vida del campus se sienta cercana: compartir un momento, pedir ayuda y encontrar a tu comunidad debe tomar pocos toques.

**Personalidad:** cercana, ágil y expresiva.

## Autoridad visual

Las 13 capturas entregadas por el usuario fijan la composición: feed fotográfico compacto, Dumps inmersivos, acceso centrado de esquinas amplias, menú de cuenta flotante y conversación de mensajes clara. La guía iOS refina tipografía, gestos, estados, áreas táctiles y materiales. Mensajes de iPhone completa los patrones del chat. La identidad pertenece a Nexo; no se reutilizan marcas, logotipos ni interfaces completas de terceros.

## Paleta

| Uso | Claro | Oscuro |
| --- | --- | --- |
| Acción principal | Verde `#087f4f` | Verde suave `#85deb0` |
| Acento firma | Verde `#168359` | Verde suave `#85deb0` |
| Fondo | Blanco frío `#f8faf9` | Carbón `#17191a` |
| Superficie | `#ffffff` | `#232526` |
| Superficie secundaria | `#f2f6f5` | `#2a2d2d` |
| Texto principal | `#161c1d` | `#f7f8f6` |
| Texto secundario | `#657276` | `#aab0ab` |
| Error | `#a52d3f` | `#ff8f91` |

La identidad se limita a verde, blanco, gris y negro. El verde identifica acciones y selección; no se utiliza acento lima. El color de estado siempre se acompaña de texto, icono o selección visible. Los botones verdes oscuros del tema claro usan texto blanco; los botones verdes claros del tema oscuro usan texto carbón.

## Tipografía e iconos

Cuerpo y controles: fuente del dispositivo (`SF Pro Text` en iPhone, sistema en Android y escritorio). Marca y títulos destacados: Manrope, con fallback nativo. La carga externa es opcional para que la interfaz conserve sus medidas sin conexión. Se usan tres pesos del sistema: 400, 600 y 700. La escala se expresa en `rem`; los campos nunca bajan de 16px en móvil.

Lucide es la única familia de iconos de interfaz, con trazo consistente. La marca es el destello de cuatro puntas propio de Nexo. Los avatares fotográficos y las imágenes genéricas son ilustrativos; las fotografías reales de UPA mantienen su atribución correspondiente.

## Ritmo y componentes

Espaciado base de 4px: 4, 8, 12, 16, 20, 24, 32 y 48. El margen habitual móvil es 16px. Las medidas fotográficas, el dock flotante y las proporciones de las capturas tienen prioridad sobre uniformar todo en tarjetas. Las separaciones estructurales son finas; las sombras se reservan para elementos elevados.

`app/tokens.css` centraliza colores, fuente, tamaños, espaciado, radios, materiales y movimiento. `app/components.css` aplica esas decisiones a los componentes ya existentes: NavBar (`.header`), TabBar (`.mobile-nav`), Card (`.rail-card`), Avatar (`.avatar`), StoryRing (`.story-avatar`), Button, IconButton, Sheet (diálogos), Toggle, ListRow, Segmented, ChatBubble, Toast, Skeleton, EmptyState y Badge. Las capas `reference-*.css` conservan el trazado particular de cada captura.

Toda acción tiene área táctil mínima de 44px, foco visible y respuesta al toque. Un nombre de autor o enlace dentro de contenido conserva su composición mediante una zona de toque extendida. Los encabezados, visores y navegación respetan las áreas seguras; los paneles usan el alto dinámico del dispositivo. El desenfoque se limita a navegación y superficies elevadas.

## Momento firma

Dar **Up!** eleva brevemente la flecha con un pequeño rebote; el doble toque en una publicación muestra el destello Up existente. La misma energía aparece en el botón de crear. Con movimiento reducido, la selección y el contador proporcionan la confirmación sin desplazamiento.

## Voz y estados

Frases cortas, directas y cálidas: «Comparte con tu comunidad», «Mensaje», «Dar Up», «Guardado», «Inténtalo otra vez». Se explica qué ocurrió y qué puede hacer la persona; se conserva lo escrito si una acción falla. Los mensajes técnicos y decisiones de infraestructura quedan fuera del flujo cotidiano.

La demo permite experimentar con contenido local y perfiles de ejemplo. Su registro externo configurable y la futura sincronización no deben presentarse como servicios activos hasta estar conectados. Los límites propios de Nexo se mantienen: Dumps de 3 horas, videos de publicación de hasta 30 segundos, adjuntos de chat de hasta 10 MB y conversaciones temporales de 7 días desde el primer mensaje.
