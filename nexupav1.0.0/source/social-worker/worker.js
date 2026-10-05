// Nexo social API. Deploy as a NEW Worker; the login Worker remains unchanged.
// Bind the existing D1 database as DB and a private R2 bucket as MEDIA.
const encoder = new TextEncoder();
const THREE_DAYS = 3 * 86_400_000;
const THREE_HOURS = 3 * 3_600_000;
const UPLOAD_WINDOW = 15 * 60_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN = /^[a-f0-9]{64}$/;
const KINDS = new Set(["post", "notify", "reporte", "venta"]);

function cors(request, env) {
  const origin = request.headers.get("Origin");
  const allowed = String(env.ALLOWED_ORIGINS || "https://xbae23.github.io")
    .split(",").map(value => value.trim()).filter(Boolean);
  if (origin && !allowed.includes(origin)) return null;
  return {
    "Access-Control-Allow-Origin": origin || allowed[0],
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Media-Purpose, X-File-Name",
    "Vary": "Origin"
  };
}

function response(request, env, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors(request, env), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }
  });
}

function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

async function jsonBody(request) {
  if (Number(request.headers.get("Content-Length") || 0) > 16_384) fail(413, "La solicitud es demasiado grande.");
  const raw = await request.text();
  if (raw.length > 16_384) fail(413, "La solicitud es demasiado grande.");
  try { return JSON.parse(raw); } catch { fail(400, "Datos inválidos."); }
}

async function account(request, env) {
  const header = request.headers.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!TOKEN.test(token)) fail(401, "Inicia sesión para continuar.");
  const bytes = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  const hash = Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
  const user = await env.DB.prepare(`SELECT u.id, u.usuario, u.correo, u.creado,
      p.nombre, p.alias, p.carrera, p.biografia, p.nota
    FROM sesiones s JOIN usuarios u ON u.id=s.usuario_id
    LEFT JOIN perfiles_nexo p ON p.usuario_id=u.id
    WHERE s.token_hash=? AND s.vence>?`).bind(hash, Date.now()).first();
  if (!user) fail(401, "Tu sesión venció. Vuelve a iniciar sesión.");
  if (!user.alias) fail(409, "Completa tu perfil antes de usar Nexo.");
  return user;
}

function mediaUrl(request, id) {
  return id ? `${new URL(request.url).origin}/v1/media/${id}` : undefined;
}

function dayKey(now = Date.now()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function initials(name) {
  return String(name || "").trim().split(/\s+/).slice(0, 2).map(part => part[0] || "").join("").toUpperCase();
}

async function requiredMedia(env, id, userId, purpose) {
  if (!UUID.test(String(id))) fail(400, "Archivo inválido.");
  const row = await env.DB.prepare(`SELECT id, mime, target_id FROM social_media
    WHERE id=? AND owner_id=? AND purpose=? AND target_id IS NULL AND expires_at>?`)
    .bind(id, userId, purpose, Date.now()).first();
  if (!row) fail(400, "El archivo no está disponible para esta publicación.");
  return row;
}

async function notify(env, userId, actorId, kind, postId, body, now) {
  if (!userId || userId === actorId) return;
  await env.DB.prepare(`INSERT INTO social_notifications
    (id,user_id,actor_id,kind,post_id,body,created_at,expires_at)
    VALUES (?,?,?,?,?,?,?,?)`).bind(crypto.randomUUID(), userId, actorId, kind, postId || null, body || "", now, now + THREE_DAYS).run();
}

async function people(env, request) {
  const { results } = await env.DB.prepare(`SELECT u.id, p.nombre AS name, p.alias AS username,
      p.carrera AS program, p.biografia AS bio, p.nota AS note, a.media_id AS avatarId
    FROM perfiles_nexo p JOIN usuarios u ON u.id=p.usuario_id
    LEFT JOIN social_avatars a ON a.user_id=u.id
    ORDER BY p.actualizado DESC LIMIT 300`).all();
  return results.map(person => ({ ...person, handle: `@${person.username}`, avatar: mediaUrl(request, person.avatarId) }));
}

async function posts(env, request, user) {
  const now = Date.now();
  const { results: rows } = await env.DB.prepare(`SELECT p.*,
      a.nombre AS author, a.alias AS alias, a.carrera AS program, m.mime AS media_mime,
      (SELECT COUNT(*) FROM social_ups x WHERE x.post_id=p.id) AS ups,
      (SELECT COUNT(*) FROM social_reposts x WHERE x.post_id=p.id) AS reposts,
      EXISTS(SELECT 1 FROM social_ups x WHERE x.post_id=p.id AND x.user_id=?) AS liked,
      EXISTS(SELECT 1 FROM social_saves x WHERE x.post_id=p.id AND x.user_id=?) AS saved,
      EXISTS(SELECT 1 FROM social_reposts x WHERE x.post_id=p.id AND x.user_id=?) AS reposted
    FROM social_posts p JOIN perfiles_nexo a ON a.usuario_id=p.author_id
    LEFT JOIN social_media m ON m.id=p.media_id
    WHERE p.expires_at>? ORDER BY p.created_at DESC LIMIT 80`)
    .bind(user.id, user.id, user.id, now).all();
  const ids = rows.map(row => row.id);
  let comments = [];
  if (ids.length) {
    const marks = ids.map(() => "?").join(",");
    const data = await env.DB.prepare(`SELECT c.id,c.post_id,c.parent_id,c.body,c.created_at,
      a.nombre AS author FROM social_comments c JOIN perfiles_nexo a ON a.usuario_id=c.author_id
      WHERE c.post_id IN (${marks}) ORDER BY c.created_at ASC LIMIT 1000`).bind(...ids).all();
    comments = data.results;
  }
  return rows.map(row => ({
    id: row.id, authorId: row.author_id, kind: row.kind, author: row.author,
    handle: `@${row.alias}`, initials: initials(row.author), program: row.program,
    ageMinutes: (now - row.created_at) / 60_000, title: row.title, body: row.body,
    location: row.location, price: row.price, category: row.category,
    image: mediaUrl(request, row.media_id), mediaType: row.media_mime?.startsWith("video/") ? "video" : "image",
    ups: Number(row.ups) - Number(!!row.liked), reposts: Number(row.reposts) - Number(!!row.reposted), liked: !!row.liked,
    saved: !!row.saved, reposted: !!row.reposted,
    comments: comments.filter(item => item.post_id === row.id).map(item => ({
      id: item.id, author: item.author, text: item.body, parentId: item.parent_id || undefined
    })), isFriend: false, tags: [], own: row.author_id === user.id, createdAt: row.created_at
  }));
}

async function stories(env, request, user) {
  const { results } = await env.DB.prepare(`SELECT s.*, p.nombre AS author, p.alias AS alias, m.mime AS media_mime
    FROM social_stories s JOIN perfiles_nexo p ON p.usuario_id=s.author_id
    LEFT JOIN social_media m ON m.id=s.media_id
    WHERE s.expires_at>? ORDER BY s.created_at DESC LIMIT 100`).bind(Date.now()).all();
  return results.map(row => ({
    id: row.id, authorId: row.author_id, author: row.author, handle: `@${row.alias}`, initials: initials(row.author),
    text: row.body, tone: "green", remainingMinutes: Math.max(0, Math.ceil((row.expires_at - Date.now()) / 60_000)),
    media: mediaUrl(request, row.media_id), mediaType: row.media_mime?.startsWith("video/") ? "video" : "image",
    expiresAt: row.expires_at, own: row.author_id === user.id
  }));
}

async function conversations(env, request, user) {
  const now = Date.now();
  const { results: rows } = await env.DB.prepare(`SELECT c.*,
      CASE WHEN c.user_a=? THEN c.user_b ELSE c.user_a END AS peer_id,
      p.nombre AS peer_name, p.alias AS peer_alias, presence.seen_at AS peer_seen_at
    FROM social_conversations c JOIN perfiles_nexo p
      ON p.usuario_id=CASE WHEN c.user_a=? THEN c.user_b ELSE c.user_a END
    LEFT JOIN social_presence presence ON presence.user_id=p.usuario_id
    WHERE (c.user_a=? OR c.user_b=?) AND c.expires_at>?
    ORDER BY c.first_message_at DESC LIMIT 80`).bind(user.id, user.id, user.id, user.id, now).all();
  if (!rows.length) return [];
  const marks = rows.map(() => "?").join(",");
  const { results: messages } = await env.DB.prepare(`SELECT m.*, media.mime AS media_mime,
    quoted.body AS reply_body, quoted.file_name AS reply_file, reply_author.nombre AS reply_author
    FROM social_messages m LEFT JOIN social_media media ON media.id=m.media_id
    LEFT JOIN social_messages quoted ON quoted.id=m.reply_to
    LEFT JOIN perfiles_nexo reply_author ON reply_author.usuario_id=quoted.sender_id
    WHERE m.conversation_id IN (${marks}) ORDER BY m.created_at ASC LIMIT 1500`)
    .bind(...rows.map(row => row.id)).all();
  return rows.map(row => ({
    id: row.id, peerId: row.peer_id, handle: `@${row.peer_alias}`,
    name: row.peer_name, initials: initials(row.peer_name), active: Number(row.peer_seen_at||0)>now-90_000,
    createdAt: row.created_at, firstMessageAt: row.first_message_at, expiresAt: row.expires_at,
    theme: "verde", messages: messages.filter(item => item.conversation_id === row.id).map(item => ({
      id: item.id, text: item.body, mine: item.sender_id === user.id, at: item.created_at,
      replyTo: item.reply_to ? { id: item.reply_to, name: item.reply_author||"Mensaje", text: item.reply_body||item.reply_file||"Mensaje" } : undefined,
      reaction: item.reaction || undefined,
      attachment: item.media_id ? { name: item.file_name, url: mediaUrl(request, item.media_id), type: item.media_mime } : undefined
    }))
  }));
}

async function touchPresence(env, user) {
  const now=Date.now();
  await env.DB.prepare(`INSERT INTO social_presence (user_id,seen_at) VALUES (?,?)
    ON CONFLICT(user_id) DO UPDATE SET seen_at=excluded.seen_at
    WHERE social_presence.seen_at<?`).bind(user.id,now,now-60_000).run();
}

async function notifications(env, user) {
  const { results } = await env.DB.prepare(`SELECT n.*, p.nombre AS actor_name FROM social_notifications n
    JOIN perfiles_nexo p ON p.usuario_id=n.actor_id
    WHERE n.user_id=? AND n.expires_at>? ORDER BY n.created_at DESC LIMIT 100`)
    .bind(user.id, Date.now()).all();
  return results.map(row => ({ id: row.id, text: `${row.actor_name} ${row.kind}`,
    detail: row.body, postId: row.post_id || undefined, read: !!row.read_at, at: row.created_at }));
}

async function quota(env, user) {
  const key = dayKey();
  const { results } = await env.DB.prepare(`SELECT kind,COUNT(*) AS count FROM social_posts
    WHERE author_id=? AND day_key=? AND kind IN ('notify','reporte') GROUP BY kind`)
    .bind(user.id, key).all();
  return { day: key, notify: Number(results.find(row => row.kind === "notify")?.count || 0),
    reporte: Number(results.find(row => row.kind === "reporte")?.count || 0) };
}

async function bootstrap(env, request, user) {
  const [directory, feed, rail, threads, alerts, limits, follows] = await Promise.all([
    people(env, request), posts(env, request, user), stories(env, request, user),
    conversations(env, request, user), notifications(env, user), quota(env, user),
    env.DB.prepare("SELECT followee_id FROM social_follows WHERE follower_id=? AND expires_at>?")
      .bind(user.id, Date.now()).all()
  ]);
  const avatars = new Map(directory.map(person => [person.id, person.avatar]));
  return { me: { id: user.id, usuario: user.usuario, correo: user.correo, creado: user.creado,
      name: user.nombre, username: user.alias, program: user.carrera, bio: user.biografia,
      note: user.nota, avatar: avatars.get(user.id) },
    people: directory, posts: feed, stories: rail, conversations: threads,
    notifications: alerts, quota: limits, following: follows.results.map(row => row.followee_id) };
}

async function createPost(env, user, body) {
  const kind = String(body.kind || "");
  const title = String(body.title || "").trim();
  const text = String(body.body || "").trim();
  const location = String(body.location || "").trim();
  const price = String(body.price || "").trim();
  const category = String(body.category || "").trim();
  const mediaId = body.mediaId || null;
  if (!KINDS.has(kind) || title.length > 120 || text.length > 4000 || location.length > 120 ||
      price.length > 40 || category.length > 40 || (!text && !mediaId)) fail(400, "Revisa el contenido de la publicación.");
  if (kind === "venta" && (!/^\$?\d+(\.\d{1,2})?$/.test(price) || Number(price.replace("$", "")) <= 0)) fail(400, "Precio inválido.");
  if (mediaId) await requiredMedia(env, mediaId, user.id, "post");
  const now = Date.now(), id = crypto.randomUUID(), key = dayKey(now);
  const args = [id, user.id, kind, title, text, location, price, category, mediaId, key, now, now + THREE_DAYS];
  let query = `INSERT INTO social_posts
    (id,author_id,kind,title,body,location,price,category,media_id,day_key,created_at,expires_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;
  if (kind === "notify" || kind === "reporte") {
    query = `INSERT INTO social_posts
      (id,author_id,kind,title,body,location,price,category,media_id,day_key,created_at,expires_at)
      SELECT ?,?,?,?,?,?,?,?,?,?,?,? WHERE
      (SELECT COUNT(*) FROM social_posts WHERE author_id=? AND kind=? AND day_key=?)<2`;
    args.push(user.id, kind, key);
  }
  const result = await env.DB.prepare(query).bind(...args).run();
  if (result.meta.changes !== 1) fail(429, `Ya usaste tus dos ${kind} de hoy.`);
  if (mediaId) await env.DB.prepare("UPDATE social_media SET target_id=?,expires_at=? WHERE id=? AND owner_id=?")
    .bind(id, now + THREE_DAYS, mediaId, user.id).run();
  if (kind !== "venta") {
    const recipients = kind === "post"
      ? await env.DB.prepare("SELECT follower_id AS id FROM social_follows WHERE followee_id=? AND expires_at>?").bind(user.id, now).all()
      : await env.DB.prepare("SELECT usuario_id AS id FROM perfiles_nexo WHERE usuario_id<>? LIMIT 300").bind(user.id).all();
    if (recipients.results.length) {
      const label = kind === "post" ? "publicó algo nuevo" : kind === "notify" ? "envió un Notify" : "publicó un Reporte";
      await env.DB.batch(recipients.results.map(person => env.DB.prepare(`INSERT INTO social_notifications
        (id,user_id,actor_id,kind,post_id,body,created_at,expires_at) VALUES (?,?,?,?,?,?,?,?)`)
        .bind(crypto.randomUUID(), person.id, user.id, label, id, title || text.slice(0, 100), now, now + THREE_DAYS)));
    }
  }
  return { id, createdAt: now, expiresAt: now + THREE_DAYS };
}

async function createStory(env, user, body) {
  const text = String(body.body || "").trim();
  const mediaId = body.mediaId || null;
  if (text.length > 4000 || (!text && !mediaId)) fail(400, "Escribe algo o añade una foto.");
  if (mediaId) await requiredMedia(env, mediaId, user.id, "story");
  const now = Date.now(), id = crypto.randomUUID();
  await env.DB.prepare("INSERT INTO social_stories (id,author_id,body,media_id,created_at,expires_at) VALUES (?,?,?,?,?,?)")
    .bind(id, user.id, text, mediaId, now, now + THREE_HOURS).run();
  if (mediaId) await env.DB.prepare("UPDATE social_media SET target_id=?,expires_at=? WHERE id=? AND owner_id=?")
    .bind(id, now + THREE_HOURS, mediaId, user.id).run();
  return { id, createdAt: now, expiresAt: now + THREE_HOURS };
}

async function upload(request, env, user) {
  const purpose = request.headers.get("X-Media-Purpose") || "";
  const requestedMime = (request.headers.get("Content-Type") || "").split(";")[0].toLowerCase();
  const mime = requestedMime || "application/octet-stream";
  const name = (request.headers.get("X-File-Name") || "archivo").replace(/[^\w.\- ]/g, "").slice(0, 120);
  const image = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mime);
  const video = ["video/mp4", "video/webm", "video/quicktime"].includes(mime);
  const max = purpose === "avatar" ? 5 * 1024 * 1024 : purpose === "message" ? 10 * 1024 * 1024 : video ? 30 * 1024 * 1024 : 10 * 1024 * 1024;
  if (!["post", "story", "message", "avatar"].includes(purpose) ||
      (purpose === "avatar" && !image) || (purpose !== "message" && !image && !video) ||
      (purpose === "message" && mime.length > 128)) {
    fail(415, "Ese tipo de archivo no está permitido.");
  }
  if (Number(request.headers.get("Content-Length") || 0) > max) fail(413, "El archivo es demasiado grande.");
  const bytes = await request.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > max) fail(413, "El archivo es demasiado grande.");
  const usage = await env.DB.prepare("SELECT COALESCE(SUM(bytes),0) AS total FROM social_media WHERE owner_id=? AND created_at>?")
    .bind(user.id,Date.now()-86_400_000).first();
  if(Number(usage?.total||0)+bytes.byteLength>40*1024*1024)fail(429,"Llegaste al límite temporal de 40 MB de archivos por día. Intenta mañana.");
  const id = crypto.randomUUID(), key = `${purpose}/${id}`, now = Date.now();
  await env.MEDIA.put(key, bytes, { httpMetadata: { contentType: mime } });
  try {
    await env.DB.prepare(`INSERT INTO social_media
      (id,owner_id,object_key,purpose,mime,file_name,bytes,created_at,expires_at)
      VALUES (?,?,?,?,?,?,?,?,?)`).bind(id, user.id, key, purpose, mime, name, bytes.byteLength, now, now + UPLOAD_WINDOW).run();
  } catch (error) { await env.MEDIA.delete(key); throw error; }
  return { id, url: mediaUrl(request, id), mime, bytes: bytes.byteLength };
}

async function serveMedia(request, env, id) {
  if (!UUID.test(id)) fail(404, "Archivo no encontrado.");
  const row = await env.DB.prepare("SELECT * FROM social_media WHERE id=? AND target_id IS NOT NULL AND (expires_at IS NULL OR expires_at>?)")
    .bind(id, Date.now()).first();
  if (!row) fail(404, "El archivo ya no está disponible.");
  if (row.purpose === "message") {
    const user = await account(request, env);
    const allowed = await env.DB.prepare(`SELECT c.id FROM social_messages m
      JOIN social_conversations c ON c.id=m.conversation_id
      WHERE m.id=? AND c.expires_at>? AND (c.user_a=? OR c.user_b=?)`).bind(row.target_id, Date.now(), user.id, user.id).first();
    if (!allowed) fail(403, "No puedes abrir este archivo.");
  }
  const object = await env.MEDIA.get(row.object_key);
  if (!object) fail(404, "Archivo no encontrado.");
  const headers = new Headers({ ...cors(request, env), "Content-Type": row.mime,
    "Cache-Control": row.purpose === "avatar" ? "public, max-age=3600" : "private, max-age=60",
    "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "sandbox" });
  if (row.purpose === "message" || ["application/pdf", "text/plain", "application/zip"].includes(row.mime)) {
    headers.set("Content-Disposition", `attachment; filename="${row.file_name || "archivo"}"`);
  }
  return new Response(object.body, { headers });
}

async function setAvatar(env, user, body) {
  const id = body.mediaId;
  if (id !== null) await requiredMedia(env, id, user.id, "avatar");
  const previous = await env.DB.prepare("SELECT media_id FROM social_avatars WHERE user_id=?").bind(user.id).first();
  if (id === null) await env.DB.prepare("DELETE FROM social_avatars WHERE user_id=?").bind(user.id).run();
  else {
    await env.DB.prepare(`INSERT INTO social_avatars (user_id,media_id,updated_at) VALUES (?,?,?)
      ON CONFLICT(user_id) DO UPDATE SET media_id=excluded.media_id,updated_at=excluded.updated_at`)
      .bind(user.id, id, Date.now()).run();
    await env.DB.prepare("UPDATE social_media SET target_id=?,expires_at=NULL WHERE id=? AND owner_id=?")
      .bind(user.id, id, user.id).run();
  }
  if (previous?.media_id && previous.media_id !== id) {
    await env.DB.prepare("UPDATE social_media SET expires_at=? WHERE id=?").bind(Date.now(), previous.media_id).run();
  }
  return { avatarId: id };
}

async function setFollow(env, user, id, enabled) {
  if (!UUID.test(id) || id === user.id) fail(400, "Persona inválida.");
  const person = await env.DB.prepare("SELECT usuario_id FROM perfiles_nexo WHERE usuario_id=?").bind(id).first();
  if (!person) fail(404, "Esa persona no existe.");
  if (enabled) {
    const now = Date.now();
    await env.DB.prepare(`INSERT INTO social_follows (follower_id,followee_id,created_at,expires_at)
      VALUES (?,?,?,?) ON CONFLICT(follower_id,followee_id)
      DO UPDATE SET created_at=excluded.created_at,expires_at=excluded.expires_at`)
      .bind(user.id, id, now, now + THREE_DAYS).run();
    await notify(env, id, user.id, "empezó a seguirte", null, "Ahora forma parte de tus seguidores.", now);
  } else await env.DB.prepare("DELETE FROM social_follows WHERE follower_id=? AND followee_id=?").bind(user.id, id).run();
}

async function setPostFlag(env, user, id, type, enabled) {
  if (!UUID.test(id)) fail(400, "Publicación inválida.");
  const table = { up: "social_ups", save: "social_saves", repost: "social_reposts" }[type];
  if (!table) fail(404, "Acción desconocida.");
  const post = await env.DB.prepare("SELECT author_id FROM social_posts WHERE id=? AND expires_at>?").bind(id, Date.now()).first();
  if (!post) fail(404, "La publicación ya no está disponible.");
  if (enabled) {
    const result = await env.DB.prepare(`INSERT OR IGNORE INTO ${table} (post_id,user_id,created_at) VALUES (?,?,?)`)
      .bind(id, user.id, Date.now()).run();
    if (result.meta.changes === 1 && type !== "save") await notify(env, post.author_id, user.id,
      type === "up" ? "dio Up! a tu publicación" : "reposteó tu publicación", id, "Tu publicación recibió actividad.", Date.now());
  } else await env.DB.prepare(`DELETE FROM ${table} WHERE post_id=? AND user_id=?`).bind(id, user.id).run();
}

async function createComment(env, user, id, body) {
  const text = String(body.text || "").trim(), parentId = body.parentId || null;
  if (!UUID.test(id) || !text || text.length > 2000 || (parentId && !UUID.test(parentId))) fail(400, "Comentario inválido.");
  const post = await env.DB.prepare("SELECT author_id FROM social_posts WHERE id=? AND expires_at>?").bind(id, Date.now()).first();
  if (!post) fail(404, "La publicación ya no está disponible.");
  if (parentId) {
    const parent = await env.DB.prepare("SELECT id FROM social_comments WHERE id=? AND post_id=?").bind(parentId, id).first();
    if (!parent) fail(400, "La respuesta no pertenece a esta publicación.");
  }
  const now = Date.now(), commentId = crypto.randomUUID();
  await env.DB.prepare("INSERT INTO social_comments (id,post_id,author_id,parent_id,body,created_at) VALUES (?,?,?,?,?,?)")
    .bind(commentId, id, user.id, parentId, text, now).run();
  await notify(env, post.author_id, user.id, "comentó tu publicación", id, text.slice(0, 160), now);
  return { id: commentId, createdAt: now };
}

async function sendMessage(env, user, body) {
  const recipientId = String(body.recipientId || "");
  const text = String(body.text || "").trim();
  const mediaId = body.mediaId || null;
  const fileName = String(body.fileName || "").replace(/[^\w.\- ]/g, "").slice(0, 120);
  const replyTo = body.replyTo || null;
  if (!UUID.test(recipientId) || recipientId === user.id || text.length > 4000 || (!text && !mediaId) ||
      (replyTo && !UUID.test(replyTo))) fail(400, "Mensaje inválido.");
  const recipient = await env.DB.prepare("SELECT usuario_id FROM perfiles_nexo WHERE usuario_id=?").bind(recipientId).first();
  if (!recipient) fail(404, "Esa persona no está disponible.");
  if (mediaId) await requiredMedia(env, mediaId, user.id, "message");
  const now = Date.now();
  const pair = [user.id, recipientId].sort();
  let conversation = await env.DB.prepare(`SELECT id,expires_at FROM social_conversations
    WHERE user_a=? AND user_b=? AND expires_at>? ORDER BY created_at DESC LIMIT 1`)
    .bind(pair[0], pair[1], now).first();
  if (!conversation) {
    conversation = { id: crypto.randomUUID(), expires_at: now + THREE_DAYS };
    await env.DB.prepare(`INSERT INTO social_conversations
      (id,user_a,user_b,created_at,first_message_at,expires_at) VALUES (?,?,?,?,?,?)`)
      .bind(conversation.id, pair[0], pair[1], now, now, conversation.expires_at).run();
  }
  if (replyTo) {
    const original = await env.DB.prepare("SELECT id FROM social_messages WHERE id=? AND conversation_id=?")
      .bind(replyTo, conversation.id).first();
    if (!original) fail(400, "No se encontró el mensaje respondido.");
  }
  const id = crypto.randomUUID();
  await env.DB.prepare(`INSERT INTO social_messages
    (id,conversation_id,sender_id,body,media_id,file_name,reply_to,created_at)
    VALUES (?,?,?,?,?,?,?,?)`).bind(id, conversation.id, user.id, text, mediaId, fileName, replyTo, now).run();
  if (mediaId) await env.DB.prepare("UPDATE social_media SET target_id=?,expires_at=? WHERE id=? AND owner_id=?")
    .bind(id, conversation.expires_at, mediaId, user.id).run();
  await notify(env, recipientId, user.id, "te envió un mensaje", null, text.slice(0, 160) || fileName, now);
  return { id, conversationId: conversation.id, createdAt: now, expiresAt: conversation.expires_at };
}

async function reactMessage(env, user, id, body) {
  if (!UUID.test(id)) fail(400, "Mensaje inválido.");
  const reaction = String(body.reaction || "");
  if (reaction.length > 12) fail(400, "Reacción inválida.");
  const result = await env.DB.prepare(`UPDATE social_messages SET reaction=? WHERE id=? AND
    conversation_id IN (SELECT id FROM social_conversations WHERE expires_at>? AND (user_a=? OR user_b=?))`)
    .bind(reaction, id, Date.now(), user.id, user.id).run();
  if (result.meta.changes !== 1) fail(404, "El mensaje ya no está disponible.");
}

async function cleanExpired(env) {
  const now = Date.now();
  // Delete dependent records first; account and profile tables are never touched.
  await env.DB.batch([
    env.DB.prepare("DELETE FROM social_notifications WHERE expires_at<=?").bind(now),
    env.DB.prepare("DELETE FROM social_follows WHERE expires_at<=?").bind(now),
    env.DB.prepare("DELETE FROM social_presence WHERE seen_at<=?").bind(now-THREE_DAYS),
    env.DB.prepare("DELETE FROM social_messages WHERE conversation_id IN (SELECT id FROM social_conversations WHERE expires_at<=?)").bind(now),
    env.DB.prepare("DELETE FROM social_conversations WHERE expires_at<=?").bind(now),
    env.DB.prepare("DELETE FROM social_stories WHERE expires_at<=?").bind(now),
    env.DB.prepare("DELETE FROM social_comments WHERE post_id IN (SELECT id FROM social_posts WHERE expires_at<=?)").bind(now),
    env.DB.prepare("DELETE FROM social_ups WHERE post_id IN (SELECT id FROM social_posts WHERE expires_at<=?)").bind(now),
    env.DB.prepare("DELETE FROM social_saves WHERE post_id IN (SELECT id FROM social_posts WHERE expires_at<=?)").bind(now),
    env.DB.prepare("DELETE FROM social_reposts WHERE post_id IN (SELECT id FROM social_posts WHERE expires_at<=?)").bind(now),
    env.DB.prepare("DELETE FROM social_posts WHERE expires_at<=?").bind(now)
  ]);
  const { results } = await env.DB.prepare("SELECT id,object_key FROM social_media WHERE expires_at IS NOT NULL AND expires_at<=? LIMIT 100")
    .bind(now).all();
  for (const row of results) {
    await env.MEDIA.delete(row.object_key);
    await env.DB.prepare("DELETE FROM social_media WHERE id=?").bind(row.id).run();
  }
  return results.length;
}

export default {
  async fetch(request, env) {
    const allowed = cors(request, env);
    if (!allowed) return new Response("Origen no permitido", { status: 403 });
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: allowed });
    const { pathname } = new URL(request.url);
    try {
      if (pathname === "/v1/health" && request.method === "GET") {
        return response(request, env, { ok: !!env.DB && !!env.MEDIA, service: "nexo-social" }, env.DB && env.MEDIA ? 200 : 503);
      }
      if (pathname.startsWith("/v1/media/") && request.method === "GET") {
        return await serveMedia(request, env, pathname.slice("/v1/media/".length));
      }
      const user = await account(request, env);
      if (pathname === "/v1/bootstrap" && request.method === "GET") {
        await touchPresence(env,user);
        return response(request, env, await bootstrap(env, request, user));
      }
      if (pathname === "/v1/conversations" && request.method === "GET") {
        await touchPresence(env,user);
        return response(request, env, { conversations: await conversations(env, request, user) });
      }
      if (pathname === "/v1/media" && request.method === "POST") return response(request, env, await upload(request, env, user), 201);
      if (pathname === "/v1/avatar" && request.method === "PUT") return response(request, env, await setAvatar(env, user, await jsonBody(request)));
      if (pathname === "/v1/posts" && request.method === "POST") return response(request, env, await createPost(env, user, await jsonBody(request)), 201);
      if (pathname === "/v1/stories" && request.method === "POST") return response(request, env, await createStory(env, user, await jsonBody(request)), 201);
      if (pathname === "/v1/messages" && request.method === "POST") return response(request, env, await sendMessage(env, user, await jsonBody(request)), 201);
      const messageReaction = pathname.match(/^\/v1\/messages\/([0-9a-f-]+)\/reaction$/i);
      if (messageReaction && request.method === "PUT") {
        await reactMessage(env, user, messageReaction[1], await jsonBody(request));
        return response(request, env, { ok: true });
      }
      if (pathname === "/v1/notifications/read" && request.method === "POST") {
        const body = await jsonBody(request), id = body.id || null;
        if (id && !UUID.test(id)) fail(400, "Notificación inválida.");
        await env.DB.prepare("UPDATE social_notifications SET read_at=? WHERE user_id=? AND (id=? OR ? IS NULL)")
          .bind(Date.now(), user.id, id, id).run();
        return response(request, env, { ok: true });
      }
      const follow = pathname.match(/^\/v1\/follows\/([0-9a-f-]+)$/i);
      if (follow && ["PUT", "DELETE"].includes(request.method)) {
        await setFollow(env, user, follow[1], request.method === "PUT");
        return response(request, env, { ok: true });
      }
      const flag = pathname.match(/^\/v1\/posts\/([0-9a-f-]+)\/(up|save|repost)$/i);
      if (flag && ["PUT", "DELETE"].includes(request.method)) {
        await setPostFlag(env, user, flag[1], flag[2], request.method === "PUT");
        return response(request, env, { ok: true });
      }
      const comment = pathname.match(/^\/v1\/posts\/([0-9a-f-]+)\/comments$/i);
      if (comment && request.method === "POST") return response(request, env,
        await createComment(env, user, comment[1], await jsonBody(request)), 201);
      return response(request, env, { error: "Ruta no encontrada." }, 404);
    } catch (error) {
      const status = error.status || 500;
      if (status === 500) console.error("Nexo social API error", error);
      return response(request, env, { error: status === 500 ? "Error del servidor. Intenta de nuevo." : error.message }, status);
    }
  },
  async scheduled(_event, env) { await cleanExpired(env); }
};

export { dayKey, cleanExpired };
