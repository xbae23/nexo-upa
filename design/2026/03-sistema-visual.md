# Nexo UPA 2026 · Fase 3: sistema visual «Campus Signal»

Fecha: 30 de septiembre de 2026. Esta fase transforma la presentación de la **demo existente**, no sus reglas de publicaciones ni su arquitectura local. Parte del [mapa de funciones](00-mapa-funciones.md), el [tablero de referencias](01-reference-board-mobbin.md) y el [análisis de brechas](02-brechas-y-contrato.md). Las referencias sirven para navegación, jerarquía y estados; la identidad y los recursos de Nexo son propios.

## Identidad y dirección

Nexo es un punto de encuentro estudiantil independiente. «Campus Signal» usa pino profundo, verde señal, superficies tranquilas y tipografía del sistema para que reportes, comunidad y conversaciones se lean antes que la decoración. El modo oscuro es la base de tokens; el modo claro tiene una paleta completa. Ningún color implica afiliación oficial con la universidad. Las fotografías del campus que ya utiliza la demo conservan su crédito.

## Tokens

Fuente de verdad: [`app/design-2026.css`](../../app/design-2026.css), siempre bajo `html.nexo-2026`; [`app/globals.css`](../../app/globals.css) sigue siendo el aspecto anterior.

| Papel | Oscuro | Claro | Uso |
|---|---|---|---|
| Fondo | `#080f0c` | `#f5f9f6` | Marco de la app |
| Superficie | `#101b15` | `#ffffff` | Feed, tarjetas, navegación |
| Superficie elevada | `#17251b` | `#ffffff` | Diálogos, campos, burbujas |
| Texto principal | `#edf8ef` | `#10261a` | Lectura |
| Texto secundario | `#afc4b5` | `#52685a` | Metadatos, estados |
| Acción primaria | `#75edaa` | `#08774c` | Crear, selección, links relevantes |
| Texto sobre primaria | `#082316` | `#ffffff` | Botones y burbujas propias |
| Borde | `#2d4334` | `#d7e5db` | Separación fina |
| Foco | `#a1fbc4` | `#08774c` | Contorno de teclado de 2 px |
| Destructivo | `#ff8292` | `#a52d3f` | Error/acción destructiva, no decoración |

Ambos temas definen además la escala neutra `--nexo-neutral-50…950` y una escala verde `--green-50…900`. Los roles semánticos (`--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--muted`, `--accent`, `--destructive`, `--border`, `--ring`) permiten que los componentes existentes hereden la apariencia sin duplicar su lógica. En las combinaciones principales, la relación WCAG calculada es: texto normal/superficie 16,20:1 oscuro y 15,98:1 claro; secundario/superficie 9,57:1 oscuro y 6,02:1 claro; texto/botón primario 11,45:1 oscuro y 5,59:1 claro. Esto **no** certifica todos los estados ni imágenes; la auditoría elemento por elemento sigue pendiente.

## Tipografía, espacio y forma

- Una familia de sistema: SF en iPhone, Segoe UI en Windows, `system-ui` en Android y resto. Texto base 16 px; controles y metadatos 12–16 px; títulos 600–700. Se evita cargar una fuente remota en el arranque.
- Escala de espacio base de 4 px heredada: 4/8/12/16/20/24/32/40/48/56/64 px. Radios operativos 12, 16, 20–24 px y pastilla; borde de 1 px; sombra contenida solo en superficie elevada.
- Lucide es el único set de iconos. Las acciones principales combinan icono y texto en escritorio, y tienen nombre accesible cuando el móvil muestra solo icono.
- El foco visible usa un contorno de 2 px con separación de 3 px. El objetivo mínimo es 44×44 px: se corrigieron tema, campana, crear cuenta, autor, título y acciones del post; aún hay que auditar todos los controles en cada pantalla.

## Componentes y estados de esta fase

| Componente del skill | Estado de fase 3 | Continuación |
|---|---|---|
| Button / IconButton | Retokenizados, estados hover/press/focus; tamaño móvil principal ≥44 px | Revisar todos los secundarios y disabled |
| Avatar con anillo | Anillo de Dump con contraste en ambos temas | Foto real y estados vistos/no vistos en fase de historias |
| Chip / Badge / Card | Post, mercado, cuotas y filtros adoptan roles semánticos | Estados de filtro y contenido sensible |
| PostCard | Colores y objetivos táctiles; lógica intacta | Jerarquía, texto expandible, feed en fase siguiente |
| TabBar | Feed, perfil, Explorar y barra móvil retematizados | Scroll al tocar tab activo y gestos |
| Dialog / Menú contextual | Superficie elevada y foco; se conserva el diálogo de publicación | Sheets con snap points en fases de cámara y gestos |
| Toast / Skeleton | Toast ligado a modo claro/oscuro; skeleton existente conserva función | Estados vacíos/error/offline por lista |

No se dibujan recibos, verificaciones, notificaciones push ni seguridad del backend como si funcionaran. El aviso de demo local permanece visible.

## Navegación y movimiento

La estructura sigue siendo Inicio, Explorar, Notificaciones, Chats y Perfil. En móvil (≤767 px) hay cinco destinos inferiores y cabecera compacta; en escritorio hay rail izquierdo y panel contextual derecho, excepto Chats, que usa dos columnas propias. A 360 px, la cabecera mantiene «Iniciar sesión» y «Crear cuenta» en una línea; los enlaces siguen apuntando a la configuración pendiente del login del usuario.

El cambio de tema está disponible en la cabecera, se guarda solo como preferencia de ese navegador y actualiza el color de la barra del navegador. Press usa escala `.96`, 120 ms, ease-out; transiciones de color 160 ms. La transición de vista existente dura 200 ms. Barra/cabecera usan transparencia y blur si el navegador lo permite; el color sólido es el fallback. El ajuste global `prefers-reduced-motion` del proyecto acorta animaciones y desactiva scroll animado; el rediseño también suprime blur en esa preferencia. Springs, haptics, zoom y gestos del skill **no** se declaran implementados en esta fase.

## Activación y reversión

- La rama `redesign-2026` muestra el diseño nuevo por defecto. `VITE_DESIGN_2026=off` lo desactiva al compilar la demo; `?nexo2026=legacy` vuelve al aspecto anterior sin cambiar datos. La rama pública `main` no se modifica en esta fase.
- La preferencia usa `localStorage` con clave `nexo-upa-appearance-2026`; no guarda contraseña ni datos de sesión. Si no hay preferencia se usa el tema del dispositivo. Si no hay acceso a almacenamiento, se usa oscuro.
- Al ser una PWA estática, el splash del manifiesto es oscuro por defecto; el tema de la barra del navegador sí cambia en la página abierta. La opción de login sigue sin URL real hasta que el usuario facilite la suya.

## Verificación de fase y límites

Revisado visualmente en el navegador local: Inicio, Explorar, Mercado, Notificaciones, Chats, Perfil y editor a 360 px; feed y chats a 1280 px; modo oscuro y claro; persistencia del tema tras recargar; fallback `legacy`; sin desbordamiento horizontal observado en esas vistas. El chat en escritorio y el contraste de avisos oscuros se corrigieron tras revisión independiente. Se confirmó la presencia de nombres/roles accesibles en el árbol de accesibilidad, pero **no** se ha completado una prueba manual con VoiceOver/TalkBack. Tampoco se han validado aún cámara, gestos de la matriz, backend de moderación o rendimiento en un dispositivo físico: pertenecen a fases posteriores y no deben presentarse como aprobados.

Puerta para la fase de feed: compilación TypeScript, build Vite, pruebas del servidor local y `git diff --check`; después, probar que publicación, seguimiento, guardados, chat, cupos y Dumps permanecen funcionales en la demo. Ninguna credencial se sube a GitHub Pages.
