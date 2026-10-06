"use client";
import { Fragment, useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type FormEvent, type PointerEvent } from "react";
import { ArrowLeft, ArrowUp, Camera, Check, ChevronRight, Clock3, Copy, FileText, Image as ImageIcon, Mic, MoreHorizontal, Paperclip, Pause, Pin, PinOff, Play, Plus, Reply, Search, Send, Square, SquarePen, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, elapsed, linkParts } from "./nexo-features";
import { fileData, initials, uid, useDemo, type Conversation, type Message } from "@/lib/demo-store";
import { socialApi } from "@/lib/social-api";
import { useNexoAuth } from "@/lib/nexo-auth";

type ReplyPreview = { id: string; name: string; text: string };
// Optional metadata stays in the existing local message record and shares its 3-day expiry.
type ChatMessage = Message & { replyTo?: ReplyPreview; reaction?: string };
type ChatConversation = Conversation & { pinned?: boolean };
const reactions = [{ emoji: "❤️", label: "Me encanta" }, { emoji: "👍", label: "UP" }, { emoji: "😂", label: "Me divierte" }, { emoji: "‼️", label: "Importante" }, { emoji: "❓", label: "Pregunta" }];
const groupWindow = 5 * 60 * 1000;
const preview = (message: Message) => message.text || message.attachment?.name || "Mensaje";
const isPinned = (conversation: ChatConversation) => conversation.pinned ?? ["chat-robotica", "chat-mariana"].includes(conversation.id);
const audioTime = (seconds: number) => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
const sameGroup = (first: Message | undefined, second: Message | undefined) => !!first && !!second && first.mine === second.mine && second.at - first.at < groupWindow && new Date(first.at).toDateString() === new Date(second.at).toDateString();
function timeLabel(at: number) {
  const date = new Date(at);
  const time = date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  if (date.toDateString() === new Date().toDateString()) return `Hoy, ${time}`;
  return `${date.toLocaleDateString("es-MX", { day: "numeric", month: "short" })}, ${time}`;
}

function AudioMessage({ url }: { url: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [failed, setFailed] = useState(false);
  async function toggle() {
    if (!audio.current) return;
    if (playing) audio.current.pause();
    else try { await audio.current.play(); setFailed(false); } catch { setFailed(true); }
  }
  return <div className="chat-audio"><audio ref={audio} src={url} preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onError={() => setFailed(true)} onDurationChange={event => { const value = event.currentTarget.duration; if (Number.isFinite(value)) setDuration(value); }} onTimeUpdate={event => setPosition(event.currentTarget.currentTime)}/><button type="button" className="icon-button" onClick={toggle} aria-label={playing ? "Pausar nota de voz" : "Reproducir nota de voz"}>{playing ? <Pause size={20}/> : <Play size={20}/>}</button><div><input type="range" min={0} max={duration || 1} step={.1} value={Math.min(position, duration || 1)} disabled={!duration} aria-label="Posición de la nota de voz" onChange={event => { if (audio.current) { audio.current.currentTime = Number(event.target.value); setPosition(Number(event.target.value)); } }}/><span>{failed ? "Toca reproducir para reintentar" : audioTime(position || duration)}</span></div><Mic size={16}/></div>;
}

function useAttachmentUrl(url?:string){
  const {socialEnabled}=useDemo();
  const [resolved,setResolved]=useState("");
  useEffect(()=>{
    if(!url){setResolved("");return;}
    if(!socialEnabled){setResolved(url);return;}
    let alive=true;let objectUrl="";
    socialApi.privateMedia(url).then(blob=>{objectUrl=URL.createObjectURL(blob);if(alive)setResolved(objectUrl);else URL.revokeObjectURL(objectUrl);}).catch(()=>{if(alive)setResolved("");});
    return()=>{alive=false;if(objectUrl)URL.revokeObjectURL(objectUrl);};
  },[url,socialEnabled]);
  return resolved;
}

function MessageItem({ message, name, handle, groupStart, groupEnd, onReply, onReact }: { message: ChatMessage; name: string; handle?: string; groupStart: boolean; groupEnd: boolean; onReply: (message: ChatMessage) => void; onReact: (id: string, reaction: string) => void }) {
  const [menu, setMenu] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const attachmentUrl=useAttachmentUrl(message.attachment?.url);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gesture = useRef<{ x: number; y: number; held: boolean } | null>(null);
  function cancelHold() { if (hold.current) clearTimeout(hold.current); hold.current = null; }
  useEffect(() => () => cancelHold(), []);
  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0 || (event.target as HTMLElement).closest("a,button,input,audio,video")) return;
    gesture.current = { x: event.clientX, y: event.clientY, held: false };
    hold.current = setTimeout(() => { if (gesture.current) { gesture.current.held = true; setMenu(true); } }, 460);
  }
  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current;
    if (start && (Math.abs(event.clientX - start.x) > 10 || Math.abs(event.clientY - start.y) > 10)) cancelHold();
  }
  function pointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current;
    cancelHold(); gesture.current = null;
    if (start && !start.held && event.clientX - start.x > 60 && Math.abs(event.clientY - start.y) < 28) onReply(message);
  }
  async function copy() {
    try { await navigator.clipboard.writeText(preview(message)); toast("Mensaje copiado"); }
    catch { toast.error("No se pudo copiar el mensaje. Puedes seleccionar su texto."); }
  }
  return <div className={`message-row${message.mine ? " mine" : ""}${groupStart ? " group-start" : ""}${groupEnd ? " group-end" : ""}${message.reaction ? " has-reaction" : ""}`}>
    {!message.mine && <span className={"message-sender" + (groupEnd ? "" : " hidden-sender")} aria-hidden="true"><Avatar name={name} handle={handle}/></span>}
    <div className="message-cluster">
      <div className="message-bubble" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={() => { cancelHold(); gesture.current = null; }} onContextMenu={event => { event.preventDefault(); setMenu(true); }} onDoubleClick={event => { if (!(event.target as HTMLElement).closest("a,audio,video,button")) setMenu(true); }}>
        {message.replyTo && <div className="message-quote"><Reply size={14}/><div><strong>{message.replyTo.name}</strong><span>{message.replyTo.text}</span></div></div>}
        {message.attachment && (attachmentUrl ? message.attachment.type.startsWith("image/") && !message.attachment.type.includes("svg") ? <button type="button" className="chat-image-button" onClick={() => setImageOpen(true)} aria-label={"Ampliar " + message.attachment.name}><img src={attachmentUrl} alt={message.attachment.name} loading="lazy" decoding="async"/></button> : message.attachment.type.startsWith("audio/") ? <AudioMessage url={attachmentUrl}/> : message.attachment.type.startsWith("video/") ? <video controls playsInline preload="metadata" src={attachmentUrl}/> : <a className="chat-attachment" href={attachmentUrl} download={message.attachment.name}><FileText size={24}/><span>{message.attachment.name}<small>Descargar archivo</small></span></a> : <span className="chat-attachment"><FileText size={24}/><span>Abriendo {message.attachment.name}…</span></span>)}
        {message.text && <p>{linkParts(message.text)}</p>}
        <time className="message-meta" dateTime={new Date(message.at).toISOString()}>{new Date(message.at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</time>
      </div>
      {message.reaction && <button className="message-reaction" onClick={() => setMenu(true)} aria-label={`Tu reacción ${message.reaction}. Cambiar o quitar`}>{message.reaction}</button>}
    </div>
    <DropdownMenu open={menu} onOpenChange={setMenu}>
      <DropdownMenuTrigger asChild><button className="message-more" aria-label={`Opciones del mensaje de ${message.mine ? "ti" : name}`}><MoreHorizontal size={20}/></button></DropdownMenuTrigger>
      <DropdownMenuContent className="chat-context-menu" align={message.mine ? "end" : "start"} side="top">
        <div className="chat-tapbacks">{reactions.map(reaction => <DropdownMenuItem key={reaction.emoji} className={message.reaction === reaction.emoji ? "is-selected" : ""} aria-label={message.reaction === reaction.emoji ? `Quitar ${reaction.label}` : reaction.label} onSelect={() => onReact(message.id, reaction.emoji)}>{reaction.emoji}</DropdownMenuItem>)}</div>
        <DropdownMenuSeparator/>
        <DropdownMenuItem onSelect={() => onReply(message)}><Reply size={20}/>Responder</DropdownMenuItem>
        <DropdownMenuItem onSelect={copy}><Copy size={20}/>Copiar</DropdownMenuItem>
        {message.reaction && <DropdownMenuItem onSelect={() => onReact(message.id, message.reaction!)}><X size={20}/>Quitar reacción</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
    {message.attachment&&attachmentUrl&&<Dialog open={imageOpen} onOpenChange={setImageOpen}><DialogContent className="chat-media-dialog"><DialogHeader className="sr-only"><DialogTitle>{message.attachment.name}</DialogTitle><DialogDescription>Imagen compartida en esta conversación.</DialogDescription></DialogHeader><img src={attachmentUrl} alt={message.attachment.name}/></DialogContent></Dialog>}
  </div>;
}

export function ChatsView({ contact, onContactConsumed }: { contact: string | null; onContactConsumed: () => void }) {
  const { state, update, ready, socialEnabled, people:directory, sendMessage, reactMessage, refresh } = useDemo();
  const auth=useNexoAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pending,setPending]=useState<Conversation|null>(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [newChat, setNewChat] = useState(false);
  const [editNote, setEditNote] = useState(false);
  const [note, setNote] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioStarting, setAudioStarting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [localUrl, setLocalUrl] = useState("");
  const [error, setError] = useState("");
  const [replyTo, setReplyTo] = useState<ReplyPreview | null>(null);
  const [offline, setOffline] = useState(false);
  const [viewport, setViewport] = useState<{ height: number; top: number; keyboard: boolean } | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const messagesPane = useRef<HTMLDivElement>(null);
  const followBottom = useRef(true);
  const sending = useRef(false);
  const currentId = useRef<string | null>(null);
  const audioRequest = useRef(0);
  const recordTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selected = state.conversations.find(conversation => conversation.id === selectedId)||(pending?.id===selectedId?pending:null);
  const people = socialEnabled ? directory.filter(person=>person.id!==auth.account?.id).map(person=>({name:person.name,handle:person.handle,id:person.id})) : Array.from(new Set(state.posts.filter(post => !post.own).map(post => post.author))).map(name=>({name,handle:name,id:name}));
  const filtered = [...(pending?[pending]:[]),...state.conversations].filter(conversation => conversation.name.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es"))).sort((a, b) => (b.messages.at(-1)?.at || 0) - (a.messages.at(-1)?.at || 0));
  const pinned = filtered.filter(isPinned);
  function cancelRecording() {
    audioRequest.current += 1;
    if (recordTimer.current) clearTimeout(recordTimer.current);
    if (recorder.current) { recorder.current.onstop = null; recorder.current.ondataavailable = null; if (recorder.current.state === "recording") recorder.current.stop(); recorder.current.stream.getTracks().forEach(track => track.stop()); }
    setRecording(false); setAudioStarting(false);
  }
  function chooseConversation(id: string | null) { currentId.current = id; cancelRecording(); setSelectedId(id); if(id===null)setPending(null); setDraft(""); setAttachment(null); setReplyTo(null); setError(""); followBottom.current = true; }
  function open(identifier: string) {
    const person=people.find(item=>item.handle===identifier||item.id===identifier||item.name===identifier);
    if(socialEnabled&&!person){toast.error("No encontramos a esa persona en Nexo.");return;}
    const name=person?.name||identifier;
    let found = state.conversations.find(conversation => socialEnabled?conversation.peerId===person?.id:conversation.name===name);
    if (!found) { found = { id: uid(), peerId:person?.id, handle:person?.handle, name, initials: initials(name), active: false, createdAt: Date.now(), firstMessageAt: null, messages: [], theme: "verde" }; const next = found; if(socialEnabled)setPending(next);else update(current => ({ ...current, conversations: [next, ...current.conversations] })); }
    chooseConversation(found.id); setNewChat(false);
  }
  useEffect(() => { if (contact) { open(contact); onContactConsumed(); } }, [contact]);
  useEffect(()=>{if(!socialEnabled||!ready)return;const timer=setInterval(()=>{if(document.visibilityState==="visible")void refresh().catch(()=>{});},12_000);return()=>clearInterval(timer);},[socialEnabled,ready,refresh]);
  useEffect(() => { if (followBottom.current) bottom.current?.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }); }, [selected?.messages.length, selectedId]);
  useEffect(() => { if (input.current) { input.current.style.height = "auto"; input.current.style.height = `${Math.min(input.current.scrollHeight, 120)}px`; } }, [draft, selectedId]);
  useEffect(() => { if (!attachment) { setLocalUrl(""); return; } const url = URL.createObjectURL(attachment); setLocalUrl(url); return () => URL.revokeObjectURL(url); }, [attachment]);
  useEffect(() => { const refresh = () => setOffline(!navigator.onLine); refresh(); window.addEventListener("online", refresh); window.addEventListener("offline", refresh); return () => { window.removeEventListener("online", refresh); window.removeEventListener("offline", refresh); }; }, []);
  useEffect(() => {
    const refresh = () => { const visual = window.visualViewport; setViewport({ height: visual?.height || window.innerHeight, top: visual?.offsetTop || 0, keyboard: !!visual && window.innerHeight - visual.height > 100 }); };
    refresh(); window.visualViewport?.addEventListener("resize", refresh); window.visualViewport?.addEventListener("scroll", refresh); window.addEventListener("resize", refresh);
    return () => { window.visualViewport?.removeEventListener("resize", refresh); window.visualViewport?.removeEventListener("scroll", refresh); window.removeEventListener("resize", refresh); };
  }, []);
  useEffect(() => { if (!recording) return; setRecordSeconds(0); const started = Date.now(); const timer = setInterval(() => setRecordSeconds(Math.floor((Date.now() - started) / 1000)), 1000); return () => clearInterval(timer); }, [recording]);
  useEffect(() => () => { audioRequest.current += 1; if (recordTimer.current) clearTimeout(recordTimer.current); if (recorder.current) { recorder.current.onstop = null; if (recorder.current.state === "recording") recorder.current.stop(); recorder.current.stream.getTracks().forEach(track => track.stop()); } }, []);
  function mutate(fn: (conversation: ChatConversation) => ChatConversation) { update(current => ({ ...current, conversations: current.conversations.map(conversation => conversation.id === selectedId ? fn(conversation) : conversation) })); }
  function reply(message: ChatMessage) { setReplyTo({ id: message.id, name: message.mine ? "Tú" : selected?.name || "Mensaje", text: preview(message) }); requestAnimationFrame(() => input.current?.focus()); }
  function react(id: string, reaction: string) {if(socialEnabled){const current=(selected?.messages.find(message=>message.id===id) as ChatMessage|undefined)?.reaction;void reactMessage(id,current===reaction?"":reaction).catch(error=>toast.error(error instanceof Error?error.message:"No se pudo reaccionar."));return;} mutate(conversation => ({ ...conversation, messages: conversation.messages.map(message => message.id === id ? { ...message, reaction: (message as ChatMessage).reaction === reaction ? undefined : reaction } : message) })); }
  async function send(event?: FormEvent) {
    event?.preventDefault(); if (!selected || sending.current || recording || (!draft.trim() && !attachment)) return;
    sending.current = true; setBusy(true); setError("");
    const conversationId = selected.id;
    try {
      if(socialEnabled){if(!selected.peerId)throw new Error("No encontramos a la persona destinataria.");
        const realId=await sendMessage(selected.peerId,draft.trim(),attachment,replyTo?.id);
        currentId.current=realId;setPending(null);setSelectedId(realId);followBottom.current=true;setDraft("");setAttachment(null);setReplyTo(null);requestAnimationFrame(()=>input.current?.focus());return;}
      const payload = attachment ? { name: attachment.name, url: await fileData(attachment), type: attachment.type } : undefined;
      const at = Date.now(); const message: ChatMessage = { id: uid(), text: draft.trim(), mine: true, at, attachment: payload, ...(replyTo ? { replyTo } : {}) };
      update(current => ({ ...current, conversations: current.conversations.map(conversation => conversation.id === conversationId ? { ...conversation, firstMessageAt: conversation.firstMessageAt || at, messages: [...conversation.messages, message] } : conversation) }));
      if (currentId.current === conversationId) { followBottom.current = true; setDraft(""); setAttachment(null); setReplyTo(null); requestAnimationFrame(() => input.current?.focus()); }
    } catch(cause) { setError(cause instanceof Error?cause.message:"No se pudo enviar. Tu mensaje sigue aquí; intenta otra vez."); }
    finally { sending.current = false; setBusy(false); }
  }
  function attach(event: ChangeEvent<HTMLInputElement>) { const chosen = event.target.files?.[0]; event.target.value = ""; if (!chosen) return; if (chosen.size > 10 * 1024 * 1024) { setError("El archivo supera los 10 MB. Elige uno más pequeño."); return; } setError(""); setAttachment(chosen); }
  function pick(kind: "photo" | "camera" | "file") { if (!file.current) return; file.current.accept = kind === "file" ? "" : "image/*,video/*"; if (kind === "camera") file.current.setAttribute("capture", "environment"); else file.current.removeAttribute("capture"); file.current.click(); }
  async function audio() {
    if (recording) { recorder.current?.stop(); return; }
    if (audioStarting) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setError("Este navegador no puede grabar audio. Puedes adjuntar una nota de voz desde Archivos."); return; }
    const request = ++audioRequest.current; setAudioStarting(true); let pendingStream: MediaStream | null = null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); pendingStream = stream;
      if (request !== audioRequest.current) { stream.getTracks().forEach(track => track.stop()); return; }
      const activeRecorder = new MediaRecorder(stream); recorder.current = activeRecorder; const chunks: BlobPart[] = [];
      activeRecorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      activeRecorder.onstop = () => { stream.getTracks().forEach(track => track.stop()); setRecording(false); if (recordTimer.current) clearTimeout(recordTimer.current); const blob = new Blob(chunks, { type: activeRecorder.mimeType }); if (blob.size > 10 * 1024 * 1024) { setError("La nota de voz supera los 10 MB. Prueba con una más corta."); return; } if (blob.size) setAttachment(new File([blob], "nota-de-voz." + (activeRecorder.mimeType.includes("mp4") ? "m4a" : "webm"), { type: activeRecorder.mimeType })); };
      activeRecorder.onerror = () => { cancelRecording(); setError("La grabación se interrumpió. Intenta grabar otra nota."); };
      activeRecorder.start(); setRecording(true); setError(""); recordTimer.current = setTimeout(() => { if (activeRecorder.state === "recording") activeRecorder.stop(); }, 120000);
    } catch { pendingStream?.getTracks().forEach(track => track.stop()); if (request === audioRequest.current) setError("No se pudo abrir el micrófono. Revisa su permiso o adjunta un audio desde Archivos."); }
    finally { if (request === audioRequest.current) setAudioStarting(false); }
  }
  const viewportStyle = viewport ? { "--chat-viewport-height": `${viewport.height}px`, "--chat-viewport-top": `${viewport.top}px` } as CSSProperties : undefined;
  return <div className={"chat-layout " + (selected ? "mobile-conversation" : "") + (viewport?.keyboard ? " keyboard-open" : "")} style={viewportStyle}>
    <aside className="chat-list">
      <div className="chat-list-head"><div><h2>Mensajes</h2><span>Tu comunidad, más cerca</span></div><button className="icon-button" onClick={() => setNewChat(true)} aria-label="Nuevo mensaje"><SquarePen size={22}/></button></div>
      <div className="chat-notes"><button onClick={() => { setNote(state.profile.note); setEditNote(true); }}><span className="note-bubble">{state.profile.note || "Comparte una nota"}</span><Avatar name={state.profile.name} handle={"@"+state.profile.username}/><small>Tu nota</small></button>{socialEnabled&&directory.filter(person=>person.id!==auth.account?.id&&person.note).slice(0,8).map(person=><button key={person.id} onClick={()=>open(person.id)}><span className="note-bubble">{person.note}</span><Avatar name={person.name} handle={person.handle}/><small>{person.name}</small></button>)}</div>
      <div className="chat-search"><Search size={20}/><input aria-label="Buscar conversaciones" placeholder="Buscar" value={query} onChange={event => setQuery(event.target.value)}/>{query && <button className="icon-button" aria-label="Borrar búsqueda" onClick={() => setQuery("")}><X size={20}/></button>}</div>
      {!query && pinned.length > 0 && <section className="chat-pinned"><h3><Pin size={15}/>Fijados</h3><div>{pinned.map(conversation => <button key={conversation.id} className={conversation.id === selectedId ? "active" : ""} onClick={() => chooseConversation(conversation.id)}><span className="presence-avatar"><Avatar name={conversation.name} handle={conversation.handle}/>{conversation.active && <i/>}</span><strong>{conversation.name}</strong><small>{conversation.messages.at(-1)?.text || "Inicia una conversación"}</small></button>)}</div></section>}
      <h3 className="chat-all-title">{query ? "Resultados" : "Todos los mensajes"}</h3><div className="chat-people">{!ready ? <div className="chat-list-loading" role="status" aria-label="Cargando conversaciones"><span/><span/><span/></div> : filtered.map(conversation => <button key={conversation.id} className={conversation.id === selectedId ? "active" : ""} onClick={() => chooseConversation(conversation.id)}><span className="presence-avatar"><Avatar name={conversation.name} handle={conversation.handle}/>{conversation.active && <i/>}</span><span className="chat-person-copy"><strong>{conversation.name}</strong><small>{conversation.messages.at(-1)?.text || conversation.messages.at(-1)?.attachment?.name || "Inicia una conversación"}</small></span><time>{conversation.messages.at(-1) ? elapsed(conversation.messages.at(-1)?.at) : ""}</time></button>)}</div>
      {ready && !filtered.length && <div className="chat-search-empty"><Search size={24}/><strong>{query ? "No encontramos ese nombre" : "Tu próxima conversación empieza aquí"}</strong><p>{query ? "Prueba con otro nombre de la comunidad." : "Comparte una idea con alguien de UPA."}</p><button className="button-secondary" onClick={() => query ? setQuery("") : setNewChat(true)}>{query ? "Ver conversaciones" : "Nuevo mensaje"}</button></div>}
      <p className="chat-local-note">Tus conversaciones duran 3 días.</p>
    </aside>
    {selected ? <section className={"conversation theme-" + selected.theme}>
      <header><button className="icon-button chat-back" onClick={() => chooseConversation(null)} aria-label="Volver a mensajes"><ArrowLeft size={24}/></button><span className="presence-avatar"><Avatar name={selected.name} handle={selected.handle}/>{selected.active && <i/>}</span><div className="conversation-title"><strong>{selected.name}</strong><small>{selected.active ? "Activo ahora" : "Sin actividad reciente"}</small></div><DropdownMenu><DropdownMenuTrigger asChild><button className="icon-button" aria-label="Opciones de conversación"><MoreHorizontal size={24}/></button></DropdownMenuTrigger><DropdownMenuContent className="chat-context-menu" align="end"><DropdownMenuItem onClick={() => mutate(conversation => ({ ...conversation, theme: "verde" }))}>Tema Nexo {selected.theme === "verde" && <Check size={20}/>}</DropdownMenuItem><DropdownMenuItem onClick={() => mutate(conversation => ({ ...conversation, theme: "gris" }))}>Tema grafito {selected.theme === "gris" && <Check size={20}/>}</DropdownMenuItem><DropdownMenuItem onClick={() => mutate(conversation => ({ ...conversation, theme: "blanco" }))}>Tema perla {selected.theme === "blanco" && <Check size={20}/>}</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem onClick={() => mutate(conversation => ({ ...conversation, pinned: !isPinned(conversation) }))}>{isPinned(selected) ? <PinOff size={20}/> : <Pin size={20}/>} {isPinned(selected) ? "Desfijar conversación" : "Fijar conversación"}</DropdownMenuItem></DropdownMenuContent></DropdownMenu></header>
      <div className="chat-expiry"><Clock3 size={14}/>{selected.firstMessageAt ? "Se borra el " + new Date(selected.firstMessageAt + 3 * 86400000).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Se borrará 3 días después del primer mensaje"}</div>
      {offline && <p className="chat-offline" role="status">Sin conexión · los mensajes necesitan Internet para enviarse.</p>}
      <div className="messages" ref={messagesPane} role="log" aria-label={"Conversación con " + selected.name} aria-live="polite" onScroll={() => { const pane = messagesPane.current; if (pane) followBottom.current = pane.scrollHeight - pane.scrollTop - pane.clientHeight < 100; }}>
        <div className="chat-person-intro"><Avatar name={selected.name} handle={selected.handle}/><strong>{selected.name}</strong><small>{directory.find(person=>person.id===selected.peerId)?.note||"Comunidad UPA"}</small></div>
        {!selected.messages.length && <div className="chat-thread-empty"><span>Una idea puede empezar algo.</span><p>Saluda a {selected.name.split(" ")[0]} para comenzar.</p></div>}
        {selected.messages.map((message, index, messages) => <Fragment key={message.id}>{(!index || message.at - messages[index - 1].at >= groupWindow || new Date(message.at).toDateString() !== new Date(messages[index - 1].at).toDateString()) && <div className="chat-time-divider"><time dateTime={new Date(message.at).toISOString()}>{timeLabel(message.at)}</time></div>}<MessageItem message={message as ChatMessage} name={selected.name} handle={selected.handle} groupStart={!sameGroup(messages[index - 1], message)} groupEnd={!sameGroup(message, messages[index + 1])} onReply={reply} onReact={react}/></Fragment>)}
        {selected.messages.at(-1)?.mine && <p className="chat-local-status"><Check size={12}/>{socialEnabled?"Enviado":"En este dispositivo"}</p>}
        <div ref={bottom}/>
      </div>
      {error && <div className="chat-error" role="alert"><p>{error}</p><button className="icon-button" aria-label="Cerrar aviso" onClick={() => setError("")}><X size={20}/></button></div>}
      {replyTo && <div className="chat-reply-preview"><Reply size={20}/><div><strong>Respondiendo a {replyTo.name}</strong><span>{replyTo.text}</span></div><button className="icon-button" aria-label="Cancelar respuesta" onClick={() => setReplyTo(null)}><X size={20}/></button></div>}
      {attachment && <div className="chat-file-preview">{attachment.type.startsWith("image/") && !attachment.type.includes("svg") ? <img src={localUrl} alt={"Vista previa de " + attachment.name}/> : attachment.type.startsWith("audio/") ? <audio controls src={localUrl}/> : <Paperclip size={20}/>}<span className="chat-file-copy"><strong>{attachment.name}</strong><small>{(attachment.size / 1024 / 1024).toFixed(1)} MB · listo para enviar</small></span><button className="icon-button" aria-label="Quitar adjunto" onClick={() => setAttachment(null)}><X size={20}/></button></div>}
      {recording&&<div className="recording-status" role="status"><span/>Grabando {audioTime(recordSeconds)} · máximo 2:00</div>}
      <form className="chat-send" onSubmit={send}><input ref={file} type="file" hidden onChange={attach}/><DropdownMenu><DropdownMenuTrigger asChild><button type="button" className="icon-button chat-add" aria-label="Añadir fotos, cámara, audio o archivos" disabled={recording || busy}><Plus size={24}/></button></DropdownMenuTrigger><DropdownMenuContent className="chat-context-menu chat-attachment-menu" align="start" side="top"><DropdownMenuItem onSelect={() => pick("photo")}><ImageIcon size={24}/><span>Fotos y videos<small>Elige de tu galería</small></span></DropdownMenuItem><DropdownMenuItem onSelect={() => pick("camera")}><Camera size={24}/><span>Cámara<small>Captura un momento</small></span></DropdownMenuItem><DropdownMenuItem onSelect={audio}><Mic size={24}/><span>Nota de voz<small>Usa tu micrófono</small></span></DropdownMenuItem><DropdownMenuItem onSelect={() => pick("file")}><FileText size={24}/><span>Archivos<small>Hasta 10 MB</small></span></DropdownMenuItem></DropdownMenuContent></DropdownMenu><textarea ref={input} rows={1} aria-label="Mensaje" placeholder={recording ? "Grabando nota de voz…" : "Mensaje…"} value={draft} onChange={event => setDraft(event.target.value)} maxLength={4000} disabled={busy || audioStarting} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && window.matchMedia("(pointer: fine)").matches) { event.preventDefault(); void send(); } }}/>{recording ? <button type="button" className="icon-button recording" aria-label="Detener grabación" onClick={audio}><Square size={20}/></button> : draft.trim() || attachment ? <button className="chat-send-button" aria-label={busy ? "Preparando mensaje" : "Enviar mensaje"} disabled={busy}><ArrowUp size={24}/></button> : <button type="button" className="icon-button chat-mic" aria-label="Grabar nota de voz" onClick={audio}><Mic size={24}/></button>}</form>
    </section> : <section className="conversation chat-empty"><div className="chat-empty-icon"><Send size={40}/></div><h2>Tus conversaciones, más cerca.</h2><p>Comparte una idea, pregunta o un archivo.<br/>Los mensajes son temporales.</p><button className="button-primary" onClick={() => setNewChat(true)}>Nuevo mensaje</button></section>}
    <Dialog open={newChat} onOpenChange={setNewChat}><DialogContent className="edit-dialog"><DialogHeader><DialogTitle>Nuevo mensaje</DialogTitle><DialogDescription>Elige a alguien de tu comunidad.</DialogDescription></DialogHeader><div className="new-chat-people">{!people.length&&<p className="empty-text">Las personas de tu comunidad aparecerán aquí cuando estén disponibles.</p>}{people.map(person => <button key={person.id} onClick={() => open(person.id)}><Avatar name={person.name} handle={person.handle}/>{person.name}<Send size={20}/></button>)}</div></DialogContent></Dialog>
    <Dialog open={editNote} onOpenChange={setEditNote}><DialogContent className="edit-dialog"><DialogHeader><DialogTitle>Tu nota</DialogTitle><DialogDescription>Un pensamiento para tu comunidad.</DialogDescription></DialogHeader><form className="auth-form" onSubmit={event => { event.preventDefault();const next=note.trim();if(socialEnabled){void auth.saveProfile({name:state.profile.name,username:state.profile.username||"",program:state.profile.program,bio:state.profile.bio,note:next,phone:state.profile.phone||""}).then(()=>{update(current=>({...current,profile:{...current.profile,note:next}}));setEditNote(false);toast("Nota actualizada");}).catch(error=>toast.error(error instanceof Error?error.message:"No se pudo guardar la nota."));}else{update(current => ({ ...current, profile: { ...current.profile, note: next } })); setEditNote(false); toast("Nota actualizada");} }}><label>¿Qué estás pensando?<input value={note} onChange={event => setNote(event.target.value)} maxLength={60} placeholder="Comparte algo breve…"/></label><button className="button-primary">Guardar nota</button></form></DialogContent></Dialog>
  </div>;
}
