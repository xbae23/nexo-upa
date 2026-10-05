"use client";
import { lazy, Suspense, useEffect, useMemo, useRef, useState, type FormEvent, type ChangeEvent, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowLeft, ArrowUp, Bell, Bookmark, Camera, Check, CheckCheck, ChevronRight, CircleAlert, Clock3, GraduationCap, Grid2X2, Image as ImageIcon, MapPin, MessageCircle, MoreHorizontal, Pause, Play, Plus, Repeat2, Search, Send, Share2, ShoppingBag, ThumbsUp, UserRound, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PostMedia } from "@/components/nexo-post-media";
import { useNexoAppearance } from "@/components/nexo-appearance";
import { featureFlags } from "@/lib/feature-flags";
import { classifySwipe } from "@/lib/gesture-math";
import { useDemo, uid, initials, fileData, dayKey } from "@/lib/demo-store";
import { rankPosts, type Post, type PostKind, type Story } from "@/lib/demo-data";
import { profileImage } from "@/lib/profile-image";
import { useNexoAuth } from "@/lib/nexo-auth";
export type Quota={notify:number;reporte:number};
const NexoCamera=lazy(()=>import("@/components/nexo-camera").then(module=>({default:module.NexoCamera})));
export function Avatar({name,small=false,src:explicitSrc}:{name:string;small?:boolean;src?:string}) {
 const {state}=useDemo();const src=explicitSrc??(name===state.profile.name?state.profile.avatar:undefined);const [failedSrc,setFailedSrc]=useState<string>();
 return <span className={"avatar"+(small?" small":"")} aria-hidden="true">{src&&failedSrc!==src?<img src={src} alt="" width={128} height={128} loading="lazy" decoding="async" draggable={false} onError={()=>setFailedSrc(src)}/>:initials(name)}</span>;
}
export function linkParts(value:string){return value.split(/(https?:\/\/[^\s]+)/g).map((p,i)=>/^https?:\/\//.test(p)?<a href={p} key={i} target="_blank" rel="noopener noreferrer">{p}</a>:<span key={i}>{p}</span>);}
export function elapsed(at?:number){const n=Math.max(0,Math.floor((Date.now()-(at||Date.now()))/60000));return n<1?"ahora":n<60?n+" min":n<1440?Math.floor(n/60)+" h":Math.floor(n/1440)+" d";}
export function FollowButton({handle}:{handle:string}){const {state,follow}=useDemo();const active=state.following.includes(handle);return <button className={active?"following-button":"follow-button"} aria-pressed={active} onClick={()=>follow(handle)}>{active?"Siguiendo":"Seguir"}</button>;}
export function StoriesRail({onStory,onCreate}:{onStory:(s:Story)=>void;onCreate:()=>void}){
 const {state}=useDemo();return <section className="stories-block" aria-label="Dumps de la comunidad"><div className="section-title"><h2>Dumps <small>· 3 horas</small></h2><span className="stories-all">Toda la comunidad</span></div><div className="stories-scroll"><button className="story" onClick={onCreate} aria-label="Crear tu Dump"><span className="story-avatar mine"><span><Avatar name={state.profile.name}/></span><i className="story-add"><Plus size={16}/></i></span><strong>Tu Dump</strong></button>{state.stories.map(s=><button className="story" key={s.id} onClick={()=>onStory(s)} aria-label={"Ver Dump de "+s.author}><span className="story-avatar"><span><Avatar name={s.author}/></span></span><strong>{s.author}</strong></button>)}</div></section>;
}
export function PostCard({post,onContact,onDetail,onAuthor,detail=false}:{post:Post;onContact:(name:string)=>void;onDetail:(id:string)=>void;onAuthor:(handle:string)=>void;detail?:boolean}){
 const {state,update}=useDemo();const [comment,setComment]=useState("");const [parent,setParent]=useState<string|undefined>();const [burst,setBurst]=useState(false);
 const {enabled:designEnabled}=useNexoAppearance();const gesturesEnabled=designEnabled&&featureFlags.gestures2026;
 function toggle(key:"liked"|"saved"|"reposted"){update(s=>({...s,posts:s.posts.map(p=>p.id===post.id?{...p,[key]:!p[key]}:p)}));if(key==="saved")toast(post.saved?"Quitado de guardados":"Guardado en tu perfil");}
 function add(e:FormEvent){e.preventDefault();if(!comment.trim())return;update(s=>({...s,posts:s.posts.map(p=>p.id===post.id?{...p,comments:[...p.comments,{id:uid(),author:s.profile.name,text:comment.trim(),parentId:parent}]}:p)}));setComment("");setParent(undefined);}
 async function share(){const url=new URL(location.href);url.hash="post/"+post.id;try{if(navigator.share)await navigator.share({title:post.title,url:url.href});else{await navigator.clipboard.writeText(url.href);toast("Enlace copiado");}}catch(error){if((error as Error).name!=="AbortError")toast.error("No se pudo compartir el enlace.");}}
 function doubleUp(){if(!post.liked)toggle("liked");setBurst(true);setTimeout(()=>setBurst(false),500);}
 function comments(parentId?:string,depth=0):React.ReactNode{return post.comments.filter(c=>c.parentId===parentId).map(c=><div key={c.id} className={depth?"comment-reply":""}><div className="comment"><Avatar name={c.author}/><div><b>{c.author}</b><p>{linkParts(c.text)}</p><button className="comment-reply-button" onClick={()=>setParent(c.id)}>Responder</button></div></div>{depth<8&&comments(c.id,depth+1)}</div>);}
 return <article className={"post-card "+post.kind} data-post-id={post.id}>
 {(post.kind==="notify"||post.kind==="reporte")&&<div className="post-strip">{post.kind==="notify"?<Zap size={16}/>:<CircleAlert size={16}/>}<span className="post-type-label">{post.kind==="notify"?"Notify":"Reporte · ayuda"}</span><span>Para toda UPA</span></div>}
 <div className="post-head"><button className="author-avatar" aria-label={"Ver perfil de "+post.author} onClick={()=>onAuthor(post.handle)}><Avatar name={post.author}/></button><div><button className="author-name" onClick={()=>onAuthor(post.handle)}>{post.own?state.profile.name:post.author}</button><small>{post.handle} · {elapsed(post.createdAt)}</small></div>{!post.own&&<FollowButton handle={post.handle}/>}<DropdownMenu><DropdownMenuTrigger asChild><button className="more-button" aria-label={"Opciones de "+post.author}><MoreHorizontal size={20}/></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={share}>Compartir enlace</DropdownMenuItem><DropdownMenuItem onClick={()=>{update(s=>({...s,hidden:[...s.hidden,post.id]}));toast("Publicación ocultada",{action:{label:"Deshacer",onClick:()=>update(s=>({...s,hidden:s.hidden.filter(id=>id!==post.id)}))}});}}>Ocultar de mi feed</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
 <div className="post-content"><h3><button onClick={()=>onDetail(post.id)}>{post.title}</button></h3><p>{linkParts(post.body)}</p>{post.location&&<span className="location"><MapPin size={14}/>{post.location}</span>}</div>
 <PostMedia post={post} burst={burst} gesturesEnabled={gesturesEnabled} onDoubleUp={doubleUp}/>
 {post.source&&<a className="photo-credit" href={post.source.url} target="_blank" rel="noopener noreferrer">{post.source.title}</a>}
 {post.kind==="venta"&&<div className="sale-footer"><span><ShoppingBag size={16}/>{post.category}</span><button onClick={()=>onContact(post.author)}>Contactar vendedor</button></div>}
 <div className="post-actions"><button className={post.liked?"selected":""} aria-label={post.liked?"Quitar Up":"Dar Up"} aria-pressed={!!post.liked} onClick={()=>toggle("liked")}><ArrowUp size={22}/><strong>{post.ups+Number(!!post.liked)}</strong><span>Up!</span></button><button aria-label="Ver comentarios" onClick={()=>onDetail(post.id)}><MessageCircle size={20}/><strong>{post.comments.length}</strong></button><button className={post.reposted?"selected":""} aria-label={post.reposted?"Deshacer repost":"Repostear"} aria-pressed={!!post.reposted} onClick={()=>toggle("reposted")}><Repeat2 size={21}/><strong>{post.reposts+Number(!!post.reposted)}</strong></button><button className={post.saved?"selected":""} aria-label={post.saved?"Quitar de guardados":"Guardar"} aria-pressed={!!post.saved} onClick={()=>toggle("saved")}><Bookmark size={20} fill={post.saved?"currentColor":"none"}/></button><button aria-label="Compartir publicación" onClick={share}><Share2 size={19}/></button></div>
 {detail&&<section className="comments-panel"><h4>Comentarios · {post.comments.length}</h4>{comments()}{!post.comments.length&&<p className="empty-text">Inicia la conversación.</p>}{parent&&<button className="reply-indicator" onClick={()=>setParent(undefined)}>Respondiendo a un comentario <X size={16}/></button>}<form onSubmit={add}><input aria-label="Nuevo comentario" placeholder="Escribe un comentario…" value={comment} onChange={e=>setComment(e.target.value)} maxLength={2000}/><button disabled={!comment.trim()} aria-label="Enviar comentario"><Send size={18}/></button></form></section>}
 </article>;
}
type Actions={onContact:(name:string)=>void;onDetail:(id:string)=>void;onAuthor:(handle:string)=>void};
export function FeedView({onCreate,onStory,...actions}:Actions&{onCreate:(kind:PostKind|"dump")=>void;onStory:(s:Story)=>void}){
 const {state}=useDemo();const [mode,setMode]=useState("para-ti");const posts=rankPosts(state.posts.filter(p=>!state.hidden.includes(p.id)).map(p=>({...p,isFriend:state.following.includes(p.handle),ageMinutes:(Date.now()-(p.createdAt||Date.now()))/60000})),mode==="siguiendo"?"amigos":"para-ti");
 return <>
  <StoriesRail onStory={onStory} onCreate={()=>onCreate("dump")}/>
  <Tabs value={mode} onValueChange={setMode} className="feed-tab-root"><TabsList variant="line" className="feed-tabs"><TabsTrigger value="para-ti">Para ti</TabsTrigger><TabsTrigger value="siguiendo">Siguiendo</TabsTrigger></TabsList><TabsContent value={mode}><div className="posts">{posts.map(p=><PostCard post={p} key={p.id} {...actions}/>)}{!posts.length&&<p className="empty-text">Aún no hay publicaciones. Comparte el primer momento de tu comunidad.</p>}</div></TabsContent></Tabs>
  <section className="compose-card"><button className="compose-top" onClick={()=>onCreate("post")}><Avatar name={state.profile.name}/><span>¿Qué está pasando en UPA?</span><ImageIcon size={20}/></button><div className="compose-options"><button onClick={()=>onCreate("post")}><ImageIcon size={18}/>Post</button><button onClick={()=>onCreate("notify")}><Zap size={18}/>Notify <em>{2-state.quota.notify}/2</em></button><button onClick={()=>onCreate("reporte")}><CircleAlert size={18}/>Reporte <em>{2-state.quota.reporte}/2</em></button></div></section>

 </>;
}
export function ExploreView({onCreate,...actions}:Actions&{onCreate:(kind:PostKind)=>void}){
 const {state}=useDemo();const [query,setQuery]=useState("");const [tab,setTab]=useState("destacados");const q=query.toLocaleLowerCase("es");
 const posts=state.posts.filter(p=>!state.hidden.includes(p.id)&&[p.title,p.body,p.author,p.category||""].join(" ").toLocaleLowerCase("es").includes(q));
 const people=Array.from(new Map(state.posts.filter(p=>!p.own).map(p=>[p.handle,p])).values()).filter(p=>(p.author+" "+p.program).toLocaleLowerCase("es").includes(q));
 return <><div className="feature-view"><div className="feature-search"><Search size={20}/><input type="search" aria-label="Buscar en UPA" placeholder="Buscar personas, publicaciones, productos" value={query} onChange={e=>setQuery(e.target.value)}/></div></div><Tabs value={tab} onValueChange={setTab} className="feed-tab-root"><TabsList variant="line" className="feed-tabs"><TabsTrigger value="destacados">Descubrir</TabsTrigger><TabsTrigger value="personas">Personas</TabsTrigger><TabsTrigger value="mercado">Mercado</TabsTrigger></TabsList><TabsContent value="destacados">{posts.map(p=><PostCard post={p} key={p.id} {...actions}/>)}{!posts.length&&<p className="empty-text">No hay resultados para “{query}”.</p>}</TabsContent><TabsContent value="personas"><div className="community-list feature-view">{people.map(p=><article key={p.handle}><button className="author-avatar" onClick={()=>actions.onAuthor(p.handle)} aria-label={"Ver perfil de "+p.author}><Avatar name={p.author}/></button><div><h3>{p.author}</h3><p>{p.program}</p><small>{p.handle}</small></div><FollowButton handle={p.handle}/></article>)}{!people.length&&<p className="empty-text">No encontramos personas.</p>}</div></TabsContent><TabsContent value="mercado"><div className="feature-view"><div className="market-heading"><h2>Entre estudiantes</h2><button className="button-secondary" onClick={()=>onCreate("venta")}><Plus size={18}/>Vender</button></div><div className="product-grid">{posts.filter(p=>p.kind==="venta").map(p=><article key={p.id}><button className="product-image" onClick={()=>actions.onDetail(p.id)} aria-label={"Ver "+p.title}>{p.image?<img src={p.image} alt={p.title}/>:<ShoppingBag size={32}/>}</button><div className="product-info"><strong>{p.price}</strong><h4>{p.title}</h4><p>{p.author}</p><button onClick={()=>actions.onContact(p.author)}>Enviar mensaje</button></div></article>)}</div>{!posts.some(p=>p.kind==="venta")&&<p className="empty-text">No hay productos para esta búsqueda.</p>}<p className="form-footnote market-footnote">Acuerda las entregas en espacios públicos del campus.</p></div></TabsContent></Tabs></>;
}
export function ProfileView({handle,...actions}:Actions&{handle:string|null}){
 const {state,update}=useDemo();
 const auth=useNexoAuth();
 const own=!handle||handle==="@tu.perfil"||handle==="@"+state.profile.username;
 const person=state.posts.find(p=>p.handle===handle);
 const name=own?state.profile.name:person?.author||"Perfil";
 const [edit,setEdit]=useState(false);
 const [tab,setTab]=useState("posts");
 const [settings,setSettings]=useState(false);
 const [followingOpen,setFollowingOpen]=useState(false);
 const [privacy,setPrivacy]=useState(false);const [avatar,setAvatar]=useState<string>();const [photoBusy,setPhotoBusy]=useState(false);const [profileSaving,setProfileSaving]=useState(false);const [photoError,setPhotoError]=useState("");const photoInput=useRef<HTMLInputElement>(null);
 useEffect(()=>{if(edit){setAvatar(state.profile.avatar);setPhotoError("");}},[edit]);
 async function chooseAvatar(event:ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];event.target.value="";if(!file)return;setPhotoBusy(true);setPhotoError("");try{setAvatar(await profileImage(file));}catch(error){setPhotoError((error as Error).message);}finally{setPhotoBusy(false);}}
 function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const anchor=document.createElement("a");anchor.href=url;anchor.download="nexo-mis-datos.json";anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 const appearance=useNexoAppearance();
 const authored=state.posts.filter(p=>own?p.own:p.handle===handle);
 const visible=tab==="guardados"?state.posts.filter(p=>p.saved):tab==="reposts"?state.posts.filter(p=>p.reposted):authored;
 const media=authored.filter(p=>p.image);
 const following=Array.from(new Map(state.posts.filter(p=>state.following.includes(p.handle)).map(p=>[p.handle,p])).values());
 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();if(photoBusy||profileSaving)return;const data=new FormData(e.currentTarget);const name=String(data.get("name")||"").trim();const username=String(data.get("username")||"").trim().toLowerCase();if(!name||!/^[a-z0-9._]{3,24}$/.test(username)){setPhotoError("Escribe tu nombre y un usuario de 3 a 24 letras, números, puntos o guiones bajos.");return;}const next={name,username,phone:String(data.get("phone")||"").trim(),bio:String(data.get("bio")||"").trim(),program:String(data.get("program")||"").trim(),note:String(data.get("note")||"").trim()};setProfileSaving(true);setPhotoError("");try{if(auth.account)await auth.saveProfile(next);update(s=>({...s,profile:{...s.profile,...next,avatar},posts:s.posts.map(p=>p.own?{...p,author:name,handle:"@"+username}:p),stories:s.stories.map(story=>story.own?{...story,author:name}:story)}));setEdit(false);toast.success("Perfil actualizado");}catch(error){setPhotoError(error instanceof Error?error.message:"No se pudo guardar el perfil.");}finally{setProfileSaving(false);}}

 async function shareProfile(){const url=new URL(location.href);url.hash="profile/"+encodeURIComponent(own?"@"+(state.profile.username||"tu.perfil"):handle||"");try{if(navigator.share)await navigator.share({title:name+" · Nexo UPA",url:url.href});else{await navigator.clipboard.writeText(url.href);toast("Enlace de perfil copiado");}}catch(error){if((error as Error).name!=="AbortError")toast.error("No se pudo compartir el perfil.");}}
 return <div className="profile-view">
  <section className="profile-header">
   <div className="profile-topline"><span>{own?"Tu perfil":handle}</span><div><button aria-label="Copiar nombre de usuario" onClick={()=>{navigator.clipboard.writeText("@"+(state.profile.username||"tu.perfil")).then(()=>toast("Usuario copiado")).catch(()=>toast.error("No se pudo copiar."));}}><UserRound size={20}/></button>{own&&<button aria-label="Ajustes de tu cuenta" onClick={()=>setSettings(true)}><MoreHorizontal size={22}/></button>}</div></div>
   <div className="profile-top"><div className="profile-avatar-wrap"><Avatar name={name}/>{own&&state.profile.note&&<span className="profile-note-bubble"><MessageCircle size={13}/></span>}</div><div className="profile-stats"><button onClick={()=>setTab("posts")}><b>{authored.length}</b><span>publicaciones</span></button>{own&&<button onClick={()=>setFollowingOpen(true)}><b>{state.following.length}</b><span>siguiendo</span></button>}<div><b>{authored.reduce((sum,p)=>sum+p.ups+Number(!!p.liked),0)}</b><span>Up! recibidos</span></div></div></div>
   <h2>{name}</h2><p className="profile-handle">{own?"@"+(state.profile.username||"tu.perfil"):handle}</p>
   <p className="profile-bio">{own?state.profile.bio:"Compartiendo ideas y momentos en la comunidad UPA."}</p>
   <span className="profile-program"><GraduationCap size={16}/>{own?state.profile.program:person?.program}</span>
   <div className="profile-controls">{own?<><button className="button-secondary" onClick={()=>setEdit(true)}>Editar perfil</button><button className="button-secondary" onClick={shareProfile}>Compartir perfil</button>{auth.account&&<button className="button-secondary" onClick={()=>void auth.signOut()}>Cerrar sesión</button>}</>:<><FollowButton handle={handle||""}/><button className="button-secondary" onClick={()=>actions.onContact(name)}><MessageCircle size={17}/>Mensaje</button></>}</div>
   {own&&state.profile.note&&<button className="profile-note" onClick={()=>setEdit(true)} aria-label="Editar tu nota"><MessageCircle size={16}/><span>{state.profile.note}</span><ChevronRight size={16}/></button>}
  </section>
  <Tabs value={tab} onValueChange={setTab} className="feed-tab-root profile-tab-root"><TabsList variant="line" className="feed-tabs"><TabsTrigger value="posts"><UserRound size={19}/><span>Posts</span></TabsTrigger><TabsTrigger value="media"><Grid2X2 size={19}/><span>Fotos</span></TabsTrigger>{own&&<><TabsTrigger value="reposts"><Repeat2 size={19}/><span>Reposts</span></TabsTrigger><TabsTrigger value="guardados"><Bookmark size={19}/><span>Guardados</span></TabsTrigger></>}</TabsList><TabsContent value={tab}>{tab==="media"?<div className="profile-grid">{media.map(p=><button key={p.id} aria-label={"Ver "+p.title} onClick={()=>actions.onDetail(p.id)}>{p.mediaType==="video"?<><video src={p.image} muted preload="metadata"/><Play size={18}/></>:<img src={p.image} alt={p.title} loading="lazy" decoding="async"/>}</button>)}</div>:<div className="profile-posts">{visible.map(p=><PostCard key={p.id} post={p} {...actions}/>)}</div>}{(tab==="media"?!media.length:!visible.length)&&<div className="profile-empty">{tab==="guardados"?<Bookmark size={28}/>:tab==="reposts"?<Repeat2 size={28}/>:<Grid2X2 size={28}/>}<h3>{tab==="guardados"?"Lo que quieras volver a ver":tab==="reposts"?"Comparte lo que te inspira":"Tu historia empieza aquí"}</h3><p>{tab==="guardados"?"Guarda una publicación y encuéntrala en este espacio.":tab==="reposts"?"Tus reposts aparecerán aquí.":"Tus publicaciones y momentos aparecerán en tu perfil."}</p></div>}</TabsContent></Tabs>
  <Dialog open={followingOpen} onOpenChange={setFollowingOpen}><DialogContent className="profile-following-dialog"><DialogHeader><DialogTitle>Siguiendo</DialogTitle><DialogDescription>Personas y comunidades que te interesan.</DialogDescription></DialogHeader><div className="profile-following-list">{following.map(p=><div key={p.handle}><button onClick={()=>{setFollowingOpen(false);actions.onAuthor(p.handle);}}><Avatar name={p.author}/><span><b>{p.author}</b><small>{p.handle}</small></span></button><FollowButton handle={p.handle}/></div>)}{!following.length&&<p className="empty-text">Las personas que sigas aparecerán aquí.</p>}</div></DialogContent></Dialog>
  <Dialog open={settings} onOpenChange={setSettings}><DialogContent className="account-settings-dialog"><DialogHeader><DialogTitle>Tu cuenta</DialogTitle><DialogDescription>Tu espacio en la comunidad UPA.</DialogDescription></DialogHeader><div className="settings-identity"><Avatar name={name}/><div><b>{name}</b><small>@{state.profile.username||"tu.perfil"}</small></div><Check size={20}/></div><div className="settings-section"><h3>Preferencias y datos</h3><button onClick={()=>{update(s=>({...s,hidden:[]}));toast("Se restauraron las publicaciones ocultas");}} disabled={!state.hidden.length}><Grid2X2 size={20}/><span>Restaurar publicaciones ocultas ({state.hidden.length})</span><ChevronRight size={18}/></button><button onClick={exportData}><Bookmark size={20}/><span>Descargar mis datos</span><ChevronRight size={18}/></button><button onClick={()=>{setSettings(false);setPrivacy(true);}}><UserRound size={20}/><span>Privacidad y almacenamiento</span><ChevronRight size={18}/></button></div>{appearance.enabled&&<div className="settings-section"><h3>Apariencia</h3><div className="settings-theme-options"><button className={appearance.theme==="light"?"chosen":""} aria-pressed={appearance.theme==="light"} onClick={()=>{if(appearance.theme!=="light")appearance.toggle();}}>Claro{appearance.theme==="light"&&<Check size={16}/>}</button><button className={appearance.theme==="dark"?"chosen":""} aria-pressed={appearance.theme==="dark"} onClick={()=>{if(appearance.theme!=="dark")appearance.toggle();}}>Oscuro{appearance.theme==="dark"&&<Check size={16}/>}</button></div></div>}<p className="settings-caption">Tus preferencias se guardan en este dispositivo.</p></DialogContent></Dialog>
  <Dialog open={edit} onOpenChange={setEdit}><DialogContent className="edit-dialog profile-edit-dialog"><DialogHeader><DialogTitle>Editar perfil</DialogTitle><DialogDescription>Haz que tu perfil hable de ti.</DialogDescription></DialogHeader><form className="auth-form" onSubmit={save}><div className="profile-photo-editor"><Avatar name={name} src={avatar||""}/><input hidden ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseAvatar}/><div className="profile-photo-actions"><button type="button" disabled={photoBusy} onClick={()=>photoInput.current?.click()}>{photoBusy?"Preparando…":"Cambiar foto"}</button>{avatar&&<button type="button" onClick={()=>setAvatar("")}>Quitar foto</button>}</div><small>Opcional · JPG, PNG o WebP · hasta 5 MB</small></div><label>Nombre<input name="name" defaultValue={state.profile.name} required maxLength={60}/></label><label>Nombre de usuario<input name="username" defaultValue={state.profile.username} required minLength={3} maxLength={24} pattern="[a-zA-Z0-9._]{3,24}" autoCapitalize="none" placeholder="tu.usuario"/></label><label>Teléfono (opcional)<input name="phone" type="tel" autoComplete="tel" defaultValue={state.profile.phone} maxLength={24}/></label><small className="profile-private-note">Tu teléfono no aparece en tu perfil público.</small><label>Carrera<input name="program" defaultValue={state.profile.program} maxLength={80}/></label><label>Biografía<textarea name="bio" defaultValue={state.profile.bio} maxLength={160}/></label><label>Nota para tus chats<input name="note" defaultValue={state.profile.note} maxLength={60}/></label>{photoError&&<p className="form-error" role="alert">{photoError}</p>}<button className="button-primary" disabled={photoBusy}>Guardar cambios</button></form></DialogContent></Dialog>
 <Dialog open={privacy} onOpenChange={setPrivacy}><DialogContent className="privacy-information"><DialogHeader><DialogTitle>Privacidad y almacenamiento</DialogTitle><DialogDescription>Controla lo que compartes.</DialogDescription></DialogHeader><p>Tu nombre, foto, carrera y biografía aparecen en tu perfil. El teléfono no es público.</p><p>Los Dumps caducan en 3 horas. Publicaciones, conversaciones y demás actividad caducan en 3 días; tu cuenta y perfil permanecen.</p><p>Por ahora, las publicaciones y los mensajes se guardan en este dispositivo; aún no se sincronizan entre personas.</p></DialogContent></Dialog>
 </div>;
}
export function NotificationsView({onDetail}:{onDetail:(id:string)=>void}){
 const {state,update}=useDemo();const [filter,setFilter]=useState<"all"|"unread">("all");
 const unread=state.notifications.filter(n=>!n.read).length;
 const today=new Date();today.setHours(0,0,0,0);
 const groups=[{label:"Hoy",test:(at:number)=>at>=today.getTime()},{label:"Esta semana",test:(at:number)=>at<today.getTime()&&at>=today.getTime()-6*86400000},{label:"Antes",test:(at:number)=>at<today.getTime()-6*86400000}];
 const notifications=state.notifications.filter(n=>filter==="all"||!n.read);
 return <section className="activity-view"><div className="view-toolbar"><div><h2>Actividad</h2><span>{unread?`${unread} ${unread===1?"novedad para ti":"novedades para ti"}`:"Estás al día"}</span></div><button className="activity-read-all" aria-label="Marcar todas como leídas" title="Marcar todas como leídas" disabled={!unread} onClick={()=>{update(s=>({...s,notifications:s.notifications.map(n=>({...n,read:true}))}));toast("Todo al día");}}><CheckCheck size={22}/></button></div><div className="activity-filters" role="group" aria-label="Filtrar actividad"><button aria-pressed={filter==="all"} onClick={()=>setFilter("all")}>Todas</button><button aria-pressed={filter==="unread"} onClick={()=>setFilter("unread")}>No leídas{unread>0&&<span>{unread}</span>}</button></div>
 {groups.map(group=>{const items=notifications.filter(n=>group.test(n.at));return items.length>0&&<section className="activity-group" key={group.label}><h3>{group.label}</h3><div className="notification-list">{items.map(n=>{const post=state.posts.find(p=>p.id===n.postId);const Icon=post?.kind==="reporte"?CircleAlert:post?.kind==="notify"?Zap:Bell;return <button key={n.id} className={n.read?"":"unread"} onClick={()=>{update(s=>({...s,notifications:s.notifications.map(x=>x.id===n.id?{...x,read:true}:x)}));if(n.postId)onDetail(n.postId);else toast(n.detail);}}><span className="notification-avatar">{post?<Avatar name={post.author}/>:<span className="notification-symbol"><Bell size={20}/></span>}<i><Icon size={12}/></i></span><span className="notification-copy"><b>{n.text}</b><span>{n.detail}</span><small>{elapsed(n.at)}</small></span>{post?.image&&post.mediaType!=="video"&&<img className="notification-preview" src={post.image} alt="" loading="lazy" decoding="async"/>}{!n.read&&<i className="unread-dot" aria-label="No leída"/>}</button>;})}</div></section>;})}
 {!notifications.length&&<div className="activity-empty"><Bell size={32}/><h3>Todo al día</h3><p>Las novedades de tu comunidad aparecerán aquí.</p>{filter==="unread"&&<button className="button-secondary" onClick={()=>setFilter("all")}>Ver toda la actividad</button>}</div>}</section>;
}
async function duration(file:File):Promise<number>{return new Promise((resolve,reject)=>{const video=document.createElement("video");const url=URL.createObjectURL(file);const done=()=>{URL.revokeObjectURL(url);video.removeAttribute("src");};video.onloadedmetadata=()=>{const d=video.duration;done();Number.isFinite(d)?resolve(d):reject(new Error("Duración no válida"));};video.onerror=()=>{done();reject(new Error("No se pudo leer el video"));};video.src=url;});}
export function PublishDialog({open,initialKind,onClose,onDone}:{open:boolean;initialKind:PostKind|"dump";onClose:()=>void;onDone:()=>void}){
 const {state,update}=useDemo();const [kind,setKind]=useState<PostKind|"dump">(initialKind);const [title,setTitle]=useState("");const [body,setBody]=useState("");const [location,setLocation]=useState("");const [price,setPrice]=useState("");const [category,setCategory]=useState("Comida");const [file,setFile]=useState<File|null>(null);const [preview,setPreview]=useState("");const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [showDetails,setShowDetails]=useState(false);const fileRef=useRef<HTMLInputElement>(null);
 const {enabled:designEnabled}=useNexoAppearance();const cameraEnabled=designEnabled&&featureFlags.camera2026;const [cameraOpen,setCameraOpen]=useState(false);
 useEffect(()=>{if(open){setKind(initialKind);setTitle(state.draft.title);setBody(state.draft.body);setShowDetails(!!state.draft.title);setError("");if(initialKind==="dump"&&cameraEnabled)setCameraOpen(true);}},[open,initialKind]);
 useEffect(()=>{if(!open)setCameraOpen(false);},[open]);
 useEffect(()=>{if(!file){setPreview("");return;}const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url);},[file]);
 const options=[{id:"post",name:"Post",icon:ImageIcon,note:"Ilimitados"},{id:"notify",name:"Notify",icon:Zap,note:(2-state.quota.notify)+"/2 hoy"},{id:"reporte",name:"Reporte",icon:CircleAlert,note:(2-state.quota.reporte)+"/2 hoy"},{id:"venta",name:"Venta",icon:ShoppingBag,note:"Mercado"},{id:"dump",name:"Dump",icon:Camera,note:"Dura 3 h"}] as const;
 async function acceptFile(f:File,targetKind:PostKind|"dump"=kind){setError("");if(!/^image\/(jpeg|png|webp|gif)$|^video\/(mp4|webm|quicktime)$/.test(f.type)){setError("Selecciona una foto JPG, PNG, WebP, GIF o un video MP4, WebM o MOV.");return;}if(f.size>(f.type.startsWith("video")?30:10)*1024*1024){setError("La foto admite hasta 10 MB; el video, hasta 30 MB.");return;}setBusy(true);try{if(f.type.startsWith("video")&&await duration(f)>(targetKind==="dump"?25:30))throw new Error("El video supera "+(targetKind==="dump"?25:30)+" segundos.");setKind(targetKind);setFile(f);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 async function choose(e:ChangeEvent<HTMLInputElement>){const f=e.target.files?.[0];e.target.value="";if(f)await acceptFile(f);}
 async function publish(e:FormEvent){e.preventDefault();if(busy)return;const limited=kind==="notify"||kind==="reporte";if(limited&&state.quota.day===dayKey()&&state.quota[kind]>=2){setError("Ya usaste tus dos "+kind+" de hoy.");return;}if(!body.trim()&&!file){setError("Escribe algo o adjunta un archivo.");return;}if(kind==="venta"&&(!price||Number(price)<=0)){setError("Escribe un precio válido.");return;}setBusy(true);setError("");try{
 if(file?.type.startsWith("video")&&await duration(file)>(kind==="dump"?25:30)){setError("El video supera "+(kind==="dump"?25:30)+" segundos para este formato.");return;}
 const media=file?await fileData(file):undefined;const id=uid();const now=Date.now();const mediaType=file?.type.startsWith("video")?"video":"image";
 update(s=>{const quota={...s.quota};if(limited){if(quota[kind]>=2)return s;quota[kind]++;}
 const base={...s,quota,draft:{kind:"post",title:"",body:""}};
 if(kind==="dump")return {...base,stories:[{id,author:s.profile.name,initials:initials(s.profile.name),text:body.trim(),tone:"green",remainingMinutes:180,expiresAt:now+3*3600000,media,mediaType,own:true},...s.stories]};
 const post:Post={id,kind,author:s.profile.name,handle:"@"+(s.profile.username||"tu.perfil"),initials:initials(s.profile.name),program:s.profile.program,ageMinutes:0,createdAt:now,title:title.trim()||(kind==="reporte"?"Reporte de la comunidad":kind==="venta"?"Producto de la comunidad":kind==="notify"?"Aviso para UPA":"Publicación de "+s.profile.name),body:body.trim(),location:location.trim(),image:media,mediaType,price:kind==="venta"?"$"+Number(price).toFixed(2):undefined,category:kind==="venta"?category:undefined,ups:0,reposts:0,comments:[],isFriend:true,tags:[],own:true};
 return {...base,posts:[post,...s.posts],notifications:[{id:uid(),text:kind==="notify"?"Tu Notify está publicado":kind==="reporte"?"Tu reporte está publicado":"Publicación guardada",detail:limited?"Aviso compartido con tu comunidad.":"Tu publicación está disponible en tu perfil.",postId:id,read:false,at:now},...s.notifications]};});
 setTitle("");setBody("");setFile(null);setPrice("");setLocation("");onClose();onDone();toast.success(kind==="dump"?"Dump compartido por 3 horas":"Publicación creada");
 }catch{setError("No se pudo preparar el archivo. Prueba uno más pequeño.");}finally{setBusy(false);}}
 function close(){update(s=>({...s,draft:{kind,title,body,savedAt:Date.now()}}));onClose();}
 return <>
  <Dialog open={open} onOpenChange={v=>{if(!v)close();}}><DialogContent className="publish-dialog" showCloseButton={false}>
   <DialogHeader className="sr-only"><DialogTitle>Crear publicación</DialogTitle><DialogDescription>Escribe y cambia de formato con un toque. Tu borrador se conserva al cerrar.</DialogDescription></DialogHeader>
   <header className="publish-topbar"><button type="button" className="publish-cancel" onClick={close}>Cancelar</button><span>{kind==="dump"?"Nuevo Dump":"Crear"}</span><button form="nexo-publish-form" type="submit" className="button-primary" disabled={busy||(!body.trim()&&!file)||(kind==="notify"&&state.quota.notify>=2)||(kind==="reporte"&&state.quota.reporte>=2)}>{busy?"Preparando…":kind==="dump"?"Compartir":"Publicar"}</button></header>
   <form id="nexo-publish-form" className="publish-form" onSubmit={publish}>
    <div className="publish-kinds" role="group" aria-label="Tipo de publicación">{options.map(({id,name,icon:Icon})=><button type="button" key={id} aria-pressed={kind===id} className={kind===id?"active":""} onClick={()=>{setKind(id);setError("");if(id==="dump"&&cameraEnabled)setCameraOpen(true);}}><Icon size={16}/><b>{name}</b></button>)}</div>
    <div className="publish-author"><Avatar name={state.profile.name}/><div><b>{state.profile.name}</b><span>{kind==="post"?"Tu comunidad · avisos a amigos":kind==="dump"?"Toda UPA · desaparece en 3 horas":kind==="venta"?"Mercado de estudiantes":"Toda UPA · "+(2-state.quota[kind])+" disponibles hoy"}</span></div></div>
    <div className="publish-writing">{(showDetails||kind==="venta"||kind==="reporte")&&kind!=="dump"&&<input className="publish-title" aria-label="Título" placeholder={kind==="venta"?"¿Qué vendes?":"Título (opcional)"} value={title} onChange={e=>setTitle(e.target.value)} maxLength={120}/>}<textarea aria-label="Contenido de la publicación" placeholder={kind==="reporte"?"¿Qué pasó? Cuéntale a la comunidad…":kind==="venta"?"Cuéntanos sobre tu producto…":kind==="dump"?"Comparte este momento…":"¿Qué está pasando en UPA?"} value={body} onChange={e=>setBody(e.target.value)} maxLength={4000}/>
    {file&&<div className="upload-preview">{file.type.startsWith("video")?<video src={preview} controls playsInline/>:<img src={preview} alt="Vista previa"/>}<button type="button" aria-label="Quitar archivo" onClick={()=>setFile(null)}><X size={18}/></button></div>}
    {kind==="venta"&&<div className="form-two"><input type="number" min=".01" step=".01" value={price} onChange={e=>setPrice(e.target.value)} placeholder="Precio en MXN" aria-label="Precio"/><Select value={category} onValueChange={setCategory}><SelectTrigger aria-label="Categoría"><SelectValue/></SelectTrigger><SelectContent>{["Comida","Material","Servicios"].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>}
    {showDetails&&kind!=="dump"&&<label className="publish-location"><MapPin size={18}/><input aria-label="Lugar" placeholder="Añadir lugar (opcional)" value={location} onChange={e=>setLocation(e.target.value)} maxLength={120}/></label>}{error&&<p className="form-error" role="alert">{error}</p>}</div>
    <input ref={fileRef} hidden type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" onChange={choose}/>
    <footer className="publish-footer"><div className="media-actions"><button type="button" aria-label="Añadir foto o video" title="Foto o video" disabled={busy} onClick={()=>fileRef.current?.click()}><ImageIcon size={22}/></button>{cameraEnabled&&(kind==="post"||kind==="dump")&&<button type="button" aria-label="Abrir cámara" title="Abrir cámara" disabled={busy} onClick={()=>setCameraOpen(true)}><Camera size={22}/></button>}{kind!=="dump"&&<button type="button" aria-label="Título y lugar" title="Título y lugar" aria-pressed={showDetails} onClick={()=>setShowDetails(!showDetails)}><MapPin size={22}/></button>}<span className="character-count">{body.length.toLocaleString("es")}/4.000</span></div><p className="form-footnote">{kind==="dump"?"Dura 3 horas · video de hasta 25 s":kind==="notify"||kind==="reporte"?"2 al día, sin acumular · dura 3 días":"Fotos y videos de hasta 30 s · dura 3 días"}</p></footer>
   </form>
  </DialogContent></Dialog>
  {cameraEnabled&&cameraOpen&&<Suspense fallback={<div role="status" className="camera-loading">Abriendo cámara…</div>}><NexoCamera open initialMode={kind==="dump"?"dump":"post"} onClose={()=>setCameraOpen(false)} onCapture={(captured,capturedKind)=>{setCameraOpen(false);void acceptFile(captured,capturedKind);}}/></Suspense>}
 </>;
}
export function StoryViewer({storyId,onClose,onReply}:{storyId:string|null;onClose:()=>void;onReply:(name:string)=>void}){
 const {state}=useDemo();
 const {enabled:designEnabled}=useNexoAppearance();
 const gesturesEnabled=designEnabled&&featureFlags.gestures2026;
 const [index,setIndex]=useState(0);
 const [progress,setProgress]=useState(0);
 const [manualPaused,setManualPaused]=useState(false);
 const [holding,setHolding]=useState(false);
 const [seconds,setSeconds]=useState(5);
 const video=useRef<HTMLVideoElement>(null);
 const touch=useRef(0);
 const pointer=useRef<{id:number;x:number;y:number}|null>(null);
 const holdTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const holdTriggered=useRef(false);
 const stories=state.stories;
 const story=stories[index];
 const paused=manualPaused||holding;

 useEffect(()=>{if(holdTimer.current){clearTimeout(holdTimer.current);holdTimer.current=null;}pointer.current=null;holdTriggered.current=false;setHolding(false);if(storyId){const i=stories.findIndex(s=>s.id===storyId);setIndex(Math.max(0,i));setProgress(0);setManualPaused(false);}},[storyId]);
 useEffect(()=>{setProgress(0);setSeconds(5);},[index]);
 useEffect(()=>{const next=stories[index+1];if(next?.media&&next.mediaType!=="video"){const image=new window.Image();image.src=next.media;}},[index,stories]);
 useEffect(()=>{if(paused)video.current?.pause();else video.current?.play().catch(()=>{});},[paused,index]);
 useEffect(()=>{if(!storyId||paused)return;const timer=setInterval(()=>{if(document.hidden)return;setProgress(p=>Math.min(100,p+100/(seconds*10)));},100);return()=>clearInterval(timer);},[storyId,paused,index,seconds]);
 useEffect(()=>{if(progress>=100){if(index+1<stories.length)setIndex(i=>i+1);else onClose();}},[progress]);
 useEffect(()=>()=>{if(holdTimer.current)clearTimeout(holdTimer.current);},[]);

 function move(delta:number){if(index+delta<0)return;if(index+delta>=stories.length)onClose();else setIndex(i=>i+delta);}
 function reply(){if(!story)return;onReply(story.author);onClose();}
 function clearHold(){if(holdTimer.current){clearTimeout(holdTimer.current);holdTimer.current=null;}setHolding(false);}
 function pointerDown(event:ReactPointerEvent<HTMLDivElement>){
  if(event.button!==0)return;
  if(pointer.current){pointer.current=null;holdTriggered.current=false;clearHold();return;}
  if((event.target as Element).closest("button, a, .story-progress, .story-top, .story-controls, .story-bottom"))return;
  pointer.current={id:event.pointerId,x:event.clientX,y:event.clientY};
  holdTriggered.current=false;
  try{event.currentTarget.setPointerCapture(event.pointerId);}catch{}
  const pointerId=event.pointerId;
  holdTimer.current=setTimeout(()=>{if(pointer.current?.id===pointerId){holdTriggered.current=true;setHolding(true);}},220);
 }
 function pointerMove(event:ReactPointerEvent<HTMLDivElement>){
  const start=pointer.current;
  if(!start||start.id!==event.pointerId||holdTriggered.current)return;
  if(Math.hypot(event.clientX-start.x,event.clientY-start.y)>12&&holdTimer.current){clearTimeout(holdTimer.current);holdTimer.current=null;}
 }
 function pointerUp(event:ReactPointerEvent<HTMLDivElement>){
  const start=pointer.current;
  if(!start||start.id!==event.pointerId)return;
  pointer.current=null;
  const wasHolding=holdTriggered.current;
  holdTriggered.current=false;
  clearHold();
  if(wasHolding)return;
  const dx=event.clientX-start.x;
  const dy=event.clientY-start.y;
  const swipe=classifySwipe(dx,dy,55);
  if(swipe==="left"){move(1);return;}
  if(swipe==="right"){move(-1);return;}
  if(swipe==="down"&&Math.abs(dy)>=70){onClose();return;}
  if(swipe==="up"&&Math.abs(dy)>=70){reply();return;}
  if(Math.hypot(dx,dy)>12)return;
  const bounds=event.currentTarget.getBoundingClientRect();
  move(event.clientX-bounds.left<bounds.width/2?-1:1);
 }
 function pointerCancel(event:ReactPointerEvent<HTMLDivElement>){if(pointer.current?.id!==event.pointerId)return;pointer.current=null;holdTriggered.current=false;clearHold();}

 return <Dialog open={!!storyId} onOpenChange={v=>{if(!v)onClose();}}><DialogContent
  className={"story-dialog"+(gesturesEnabled?" story-gestures":"")+(holding?" is-holding":"")}
  showCloseButton={false}
  onPointerDown={gesturesEnabled?pointerDown:undefined}
  onPointerMove={gesturesEnabled?pointerMove:undefined}
  onPointerUp={gesturesEnabled?pointerUp:undefined}
  onPointerCancel={gesturesEnabled?pointerCancel:undefined}
  onKeyDown={event=>{if((event.target as Element).closest("input, textarea"))return;if(event.key==="ArrowRight"){event.preventDefault();move(1);}else if(event.key==="ArrowLeft"){event.preventDefault();move(-1);}else if(event.key===" "){event.preventDefault();setManualPaused(value=>!value);}}}
  onTouchStart={!gesturesEnabled?e=>{touch.current=e.touches[0].clientX;}:undefined}
  onTouchEnd={!gesturesEnabled?e=>{const delta=e.changedTouches[0].clientX-touch.current;if(Math.abs(delta)>50)move(delta<0?1:-1);}:undefined}
 ><DialogHeader className="sr-only"><DialogTitle>Dump de {story?.author}</DialogTitle><DialogDescription>Toca a los lados o desliza para cambiar de historia. Mantén pulsado para pausar y desliza abajo para cerrar. También puedes usar las flechas del teclado.</DialogDescription></DialogHeader>{story?<><div className="story-progress">{stories.map((s,i)=><div key={s.id}><span style={{transform:`scaleX(${(i<index?100:i===index?progress:0)/100})`}}/></div>)}</div><div className="story-top"><Avatar name={story.author}/><div><b>{story.author}</b><small>{Math.max(1,Math.ceil(((story.expiresAt||0)-Date.now())/60000))} min restantes</small></div><button aria-label={paused?"Reanudar historia":"Pausar historia"} onClick={()=>setManualPaused(!manualPaused)}>{paused?<Play size={20}/>:<Pause size={20}/>}</button><button aria-label="Cerrar historia" onClick={onClose}><X size={24}/></button></div>{story.media&&<div className="story-media" key={story.id}>{story.mediaType==="video"?<video ref={video} src={story.media} autoPlay muted playsInline onLoadedMetadata={e=>setSeconds(Math.min(25,e.currentTarget.duration)||5)} onEnded={()=>move(1)}/>:<img src={story.media} alt={story.text||"Dump de "+story.author} draggable={false} decoding="async"/>}</div>}<p className="story-copy" key={story.id+"-copy"}>{story.text}</p><div className="story-accessible-navigation"><button className="sr-only" disabled={!index} onClick={()=>move(-1)}>Historia anterior</button><button className="sr-only" onClick={()=>move(1)}>{index+1<stories.length?"Historia siguiente":"Cerrar al terminar historias"}</button></div><div className="story-bottom"><span>Visible 3 horas · toda UPA{story.source&&<> · <a href={story.source.url} target="_blank" rel="noopener noreferrer">{story.source.title}</a></>}</span><button onClick={reply}>Responder a {story.author.split(" ")[0]} <Send size={18}/></button></div></>:<p>Esta historia ya no está disponible.</p>}</DialogContent></Dialog>;
}
