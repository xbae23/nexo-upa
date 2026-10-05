export type View = "inicio" | "explorar" | "mercado" | "chats" | "perfil" | "notificaciones";
export type PostKind = "post" | "notify" | "reporte" | "venta";
export type Comment = { id: string; author: string; text: string; parentId?: string };
export type Post = {
  id: string;
  authorId?: string;
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
  authorId?: string;
  handle?: string;
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
