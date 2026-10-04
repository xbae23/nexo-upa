export type View = "inicio" | "explorar" | "mercado" | "chats" | "perfil" | "notificaciones";
export type PostKind = "post" | "notify" | "reporte" | "venta";
export type Comment = { id: string; author: string; text: string; parentId?: string };
export type Post = {
  id: string;
  kind: PostKind;
  author: string;
  handle: string;
  initials: string;
  program: string;
  ageMinutes: number;
  title: string;
  body: string;
  location?: string;
  image?: string;
  imageSrcSet?: string;
  mediaType?: "image" | "video";
  price?: string;
  category?: string;
  ups: number;
  comments: Comment[];
  reposts: number;
  isFriend: boolean;
  tags: string[];
  own?: boolean;
  liked?: boolean;
  saved?: boolean;
  reposted?: boolean;
  createdAt?: number;
  source?: {title:string;url:string};
  imagePosition?: string;
};

export type Story = {
  id: string;
  author: string;
  initials: string;
  text: string;
  tone: string;
  remainingMinutes: number;
  media?: string;
  mediaType?: "image" | "video";
  own?: boolean;
  expiresAt?: number;
  source?: {title:string;url:string};
};

export const initialPosts: Post[] = [
  {
    id:"campus-edificio",kind:"post",author:"Vida en UPA",handle:"@vida.upa",initials:"VU",program:"Comunidad · ejemplo",ageMinutes:18,
    title:"Un lugar para encontrarnos",
    body:"Vista del campus de Atlautla publicada en el sitio de la universidad. Esta publicación es un ejemplo para explorar Nexo.",
    image:"media/upa-visitas.jpeg",imagePosition:"right center",mediaType:"image",ups:46,reposts:4,comments:[{id:"campus-edificio-c1",author:"Mariana",text:"¡Nos vemos en el campus!"}],isFriend:true,tags:["campus","comunidad"],
    source:{title:"Foto: Universidad Politécnica de Atlautla",url:"https://upa.edomex.gob.mx/"},
  },
  {
    id:"campus-atlautla",kind:"post",author:"Vida en UPA",handle:"@vida.upa",initials:"VU",program:"Comunidad · ejemplo",ageMinutes:3,
    title:"El campus también se vive fuera del salón",
    body:"Entre clases también pasan cosas buenas. ¿Cuál es tu lugar favorito para encontrarte con amigos? Imagen ilustrativa.",
    image:"media/campus-ilustrativo-960.webp",imageSrcSet:"media/campus-ilustrativo-480.webp 480w, media/campus-ilustrativo-960.webp 960w",mediaType:"image",ups:87,reposts:8,comments:[{id:"campus-c1",author:"Alex",text:"¡Qué buena forma de hacer comunidad!"}],isFriend:true,tags:["campus","comunidad"],
  },
  {
    id: "wallet", kind: "reporte", author: "Ana Sofía", handle: "@anasofia",
    initials: "AS", program: "Ing. en Manufactura", ageMinutes: 6,
    title: "Encontré una cartera cerca de la biblioteca",
    body: "La dejé en vigilancia para que su dueño pueda recuperarla. Si conoces a alguien que la esté buscando, comparte este reporte.",
    location: "Biblioteca · entrada principal",
    ups: 42, comments: [{ id: "c1", author: "Diego", text: "Lo comparto con mi grupo, gracias." }], reposts: 12,
    isFriend: false, tags: ["objetos", "ayuda", "biblioteca"],
  },
  {
    id: "robotics", kind: "post", author: "Club de Robótica", handle: "@robotica.upa",
    initials: "CR", program: "Comunidad", ageMinutes: 90,
    title: "El prototipo ya sigue la línea completa 🤖",
    body: "El jueves hacemos pruebas abiertas en el laboratorio. No necesitas experiencia para sumarte. Trae curiosidad y ganas de crear. Imagen ilustrativa.",
    image:"media/robotica-ilustrativa-960.webp",imageSrcSet:"media/robotica-ilustrativa-480.webp 480w, media/robotica-ilustrativa-960.webp 960w",imagePosition:"center 65%",mediaType:"image",
    location: "Laboratorio de robótica",
    ups: 128, comments: [{ id: "c2", author: "Valeria", text: "¡Yo me apunto!" }], reposts: 31,
    isFriend: true, tags: ["robótica", "proyectos", "clubes"],
  },
  {
    id: "brownies", kind: "venta", author: "Mariana V.", handle: "@mariana.v",
    initials: "MV", program: "Administración", ageMinutes: 39,
    title: "Brownies para la salida 🍫",
    body: "Caja de 4 por $55. Entrego hoy junto a la cafetería. Escríbeme para apartar una; me quedan siete cajas. Imagen ilustrativa del producto.",
    location: "Cafetería · 14:00 a 16:00",
    image: "media/brownies-ilustrativo.webp", mediaType: "image",
    price: "$55", category: "Comida", ups: 36,
    comments: [{ id: "c3", author: "Sofía", text: "¡Aparto una caja!" }], reposts: 5,
    isFriend: true, tags: ["comida", "venta", "brownies"],
  },
  {
    id: "tutoring", kind: "notify", author: "Diego Ramírez", handle: "@diego.r",
    initials: "DR", program: "Tecnologías de la Información", ageMinutes: 77,
    title: "¿Alguien necesita ayuda con cálculo?",
    body: "Hoy estaré en la biblioteca después de clase. Armemos una mesa de estudio para resolver las dudas del parcial.",
    location: "Biblioteca · 16:30", ups: 58,
    comments: [{ id: "c4", author: "Juan Pablo", text: "Me sumo, llevo mis apuntes." }], reposts: 9,
    isFriend: false, tags: ["asesoría", "cálculo", "ayuda"],
  },
];

export const initialStories: Story[] = [
  { id: "s-valeria", author: "Vida UPA", initials: "VU", text: "Los mejores planes empiezan entre clases. Imagen ilustrativa.", tone: "green", remainingMinutes: 161, media:"media/campus-ilustrativo-960.webp",mediaType:"image" },
  { id: "s-robotica", author: "Robótica", initials: "CR", text: "Ideas que toman forma 🤖 · Imagen ilustrativa", tone: "green", remainingMinutes: 128,media:"media/robotica-ilustrativa-960.webp",mediaType:"image" },
  { id: "s-mariana", author: "Mariana", initials: "MV", text: "Brownies recién hechos. ¡Nos vemos en la cafetería! · Imagen ilustrativa", tone: "green", remainingMinutes: 86,media:"media/brownies-ilustrativo.webp",mediaType:"image" },
  { id: "s-terapia", author: "Campus", initials: "CU", text: "Haciendo equipo. Foto de archivo: UPA Atlautla · ejemplo de Dump.", tone: "green", remainingMinutes: 48,media:"media/upa-actividad.jpeg",mediaType:"image",source:{title:"Foto: UPA Atlautla",url:"https://upa.edomex.gob.mx/actividades-deportivas-culturales"} },
  { id: "s-diego", author: "Diego", initials: "DR", text: "¿Quién se suma al grupo de estudio?", tone: "ink", remainingMinutes: 21 },
];

export type Community = { id: string; name: string; initials: string; detail: string; members: number; theme: string };
export const communities: Community[] = [
  { id: "robotica", name: "Club de Robótica", initials: "CR", detail: "Proyectos, prototipos y retos", members: 246, theme: "wine" },
  { id: "bienestar", name: "Bienestar en campus", initials: "BC", detail: "Movimiento y salud entre clases", members: 182, theme: "gold" },
  { id: "codigo", name: "Código Abierto UPA", initials: "CA", detail: "Aprendemos creando software", members: 137, theme: "ink" },
];

export const people = [
  { id: "valeria", name: "Valeria Gómez", initials: "VG", program: "Terapia Física", interests: "Voluntariado · bienestar" },
  { id: "diego", name: "Diego Ramírez", initials: "DR", program: "Tecnologías de la Información", interests: "Asesorías · código" },
  { id: "mariana", name: "Mariana V.", initials: "MV", program: "Administración", interests: "Emprendimiento · repostería" },
];

// Orden estable y explicable para la demo. En producción se calcula en el servidor
// con señales de afinidad, actualidad, conversación y diversidad de autores.
export function rankPosts(posts: Post[], mode: "para-ti" | "amigos"): Post[] {
  const eligible = mode === "amigos" ? posts.filter((post) => post.isFriend || post.own) : posts;
  return [...eligible].sort((a, b) => score(b) - score(a));
}

function score(post: Post): number {
  if (post.own) return 1_000;
  const freshness = Math.max(0, 50 - post.ageMinutes / 6);
  const conversation = Math.min(22, post.comments.length * 5 + post.reposts * 0.3);
  const helpfulness = Math.min(18, post.ups * 0.11);
  const affinity = post.isFriend ? 18 : 0;
  const urgency = post.kind === "reporte" ? 30 : post.kind === "notify" ? 15 : 0;
  const visualContext = post.image ? 12 : 0;
  return freshness + conversation + helpfulness + affinity + urgency + visualContext;
}
