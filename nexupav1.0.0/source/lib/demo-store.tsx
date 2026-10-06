"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { seed, expire, dayKey, type DemoState } from "./community-state";
import { useNexoAuth, type NexoProfile } from "./nexo-auth";
import { socialApi, type SocialPerson, type SocialSnapshot } from "./social-api";
import { canApplySocialRefresh, mergeConversationPreferences, refreshAfterAcceptedWrite } from "./refresh-order";
import type { Post, PostKind, Story } from "./demo-data";
import { FEED_POLL_MS } from "./social-polling";
export { seed, expire, dayKey } from "./community-state";
export type { Message, Conversation, Notification, DemoState } from "./community-state";
export const uid = () => crypto.randomUUID();

type SocialPost = {kind:string;title:string;body:string;location?:string;price?:string;category?:string};
type StoreValue = {
  state:DemoState; ready:boolean; socialEnabled:boolean; socialError:string; people:SocialPerson[];
  update:(fn:(state:DemoState)=>DemoState)=>void;
  follow:(handle:string)=>Promise<void>;
  publish:(payload:SocialPost,file:File|null)=>Promise<void>;
  postFlag:(id:string,kind:"up"|"save"|"repost",enabled:boolean)=>Promise<void>;
  commentPost:(id:string,text:string,parentId?:string)=>Promise<void>;
  sendMessage:(recipientId:string,text:string,file:File|null,replyTo?:string)=>Promise<string>;
  reactMessage:(id:string,reaction:string)=>Promise<void>;
  saveAvatar:(file:File|null)=>Promise<void>;
  markRead:(id?:string)=>Promise<void>;
  refresh:()=>Promise<void>;
  refreshConversations:()=>Promise<void>;
};

function openDatabase():Promise<IDBDatabase> {return new Promise((resolve,reject)=>{const req=indexedDB.open("nexo-upa-v1-preview",2);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains("demo"))req.result.createObjectStore("demo");};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
const Context=createContext<StoreValue|null>(null);

function withOnlineProfile(state:DemoState,profile:NexoProfile|null):DemoState {
  return profile?{...state,profile:{...state.profile,name:profile.name,username:profile.username,program:profile.program,bio:profile.bio,note:profile.note,phone:profile.phone}}:state;
}

function withSocialSnapshot(current:DemoState,snapshot:SocialSnapshot):DemoState {
  const handles=new Map(snapshot.people.map(person=>[person.id,person.handle]));
  const conversations=mergeConversationPreferences(snapshot.conversations,current.conversations);
  return {...current,
    posts:snapshot.posts,stories:snapshot.stories,following:snapshot.following.map(id=>handles.get(id)).filter((value):value is string=>!!value),
    followingAt:Object.fromEntries(snapshot.following.map(id=>handles.get(id)).filter((value):value is string=>!!value).map(handle=>[handle,Date.now()])),
    conversations,notifications:snapshot.notifications,quota:snapshot.quota,
    profile:{...current.profile,name:snapshot.me.name,username:snapshot.me.username,
      program:snapshot.me.program,bio:snapshot.me.bio,note:snapshot.me.note,
      avatar:snapshot.me.avatar}
  };
}

export function DemoProvider({children}:{children:ReactNode}){
  const auth=useNexoAuth();
  const storageKey=auth.status==="loading"?null:auth.account?`account:${auth.account.id}`:"state";
  const [state,setState]=useState<DemoState>(seed);
  const [ready,setReady]=useState(false);
  const [people,setPeople]=useState<SocialPerson[]>([]);
  const [socialError,setSocialError]=useState("");
  const db=useRef<IDBDatabase|null>(null);
  const [loadedKey,setLoadedKey]=useState<string|null>(null);
  const activeAccountId=useRef<string|null>(null);
  const refreshSequence=useRef(0);
  const appliedSequence=useRef(0);
  activeAccountId.current=auth.account?.id??null;

  useEffect(()=>{
    let alive=true;db.current?.close();db.current=null;setReady(false);setLoadedKey(null);setState(seed());setPeople([]);
    refreshSequence.current=0;appliedSequence.current=0;
    if(!storageKey)return()=>{alive=false;};
    openDatabase().then(database=>{
      if(!alive){database.close();return;}
      db.current=database;
      const req=database.transaction("demo").objectStore("demo").get(storageKey);
      req.onsuccess=()=>{if(alive){const restored=req.result?.version===2?expire(req.result as DemoState):seed();
        setState(withOnlineProfile(restored,auth.profile));setLoadedKey(storageKey);
        if(!socialApi.enabled)setReady(true);}};
      req.onerror=()=>{if(alive){setState(withOnlineProfile(seed(),auth.profile));setLoadedKey(storageKey);
        if(!socialApi.enabled)setReady(true);toast.error("No se pudieron recuperar los datos guardados.");}};
    }).catch(()=>{if(alive){setState(withOnlineProfile(seed(),auth.profile));setLoadedKey(storageKey);
      if(!socialApi.enabled)setReady(true);toast.error("Almacenamiento no disponible: esta sesión no se conservará.");}});
    return()=>{alive=false;db.current?.close();db.current=null;};
  },[storageKey]);

  const refresh=useCallback(async()=>{
    if(!socialApi.enabled||!auth.account)return;
    const accountId=auth.account.id;
    const sequence=++refreshSequence.current;
    try{
      const snapshot=await socialApi.bootstrap();
      if(activeAccountId.current!==accountId)return;
      if(snapshot.me.id!==accountId)throw new Error("La cuenta no coincide con la sesión.");
      if(!canApplySocialRefresh(accountId,activeAccountId.current,sequence,appliedSequence.current))return;
      appliedSequence.current=sequence;
      setPeople(snapshot.people);
      setState(current=>withSocialSnapshot(current,snapshot));
      setReady(true);setSocialError("");
    }catch(error){if(!canApplySocialRefresh(accountId,activeAccountId.current,sequence,appliedSequence.current))return;
      const message=error instanceof Error?error.message:"No se pudo cargar la comunidad.";
      setSocialError(message);throw error;}
  },[auth.account]);

  const refreshConversations=useCallback(async()=>{
    if(!socialApi.enabled||!auth.account)return;
    const accountId=auth.account.id;
    const sequence=++refreshSequence.current;
    try{
      const result=await socialApi.conversations();
      if(!canApplySocialRefresh(accountId,activeAccountId.current,sequence,appliedSequence.current))return;
      appliedSequence.current=sequence;
      setState(current=>({...current,conversations:mergeConversationPreferences(result.conversations,current.conversations)}));
      setSocialError("");
    }catch(error){
      if(!canApplySocialRefresh(accountId,activeAccountId.current,sequence,appliedSequence.current))return;
      setSocialError(error instanceof Error?error.message:"No se pudieron actualizar los mensajes.");
      throw error;
    }
  },[auth.account]);

  useEffect(()=>{
    if(!socialApi.enabled||!auth.account||!auth.profile||loadedKey!==storageKey)return;
    let alive=true,lastAutomaticLoad=0;
    const load=()=>{
      if(!alive||document.visibilityState!=="visible"||Date.now()-lastAutomaticLoad<5000)return;
      lastAutomaticLoad=Date.now();void refresh().catch(()=>{});
    };
    const visible=()=>{if(document.visibilityState==="visible")load();};
    load();
    const interval=setInterval(load,FEED_POLL_MS);
    window.addEventListener("focus",load);
    document.addEventListener("visibilitychange",visible);
    return()=>{alive=false;clearInterval(interval);window.removeEventListener("focus",load);document.removeEventListener("visibilitychange",visible);};
  },[auth.account,auth.profile,loadedKey,storageKey,refresh]);

  useEffect(()=>{if(auth.profile&&ready&&loadedKey===storageKey)setState(current=>withOnlineProfile(current,auth.profile));},[auth.profile,ready,loadedKey,storageKey]);
  useEffect(()=>{if(!ready||loadedKey!==storageKey||!db.current)return;try{const tx=db.current.transaction("demo","readwrite");tx.objectStore("demo").put(state,storageKey!);tx.onerror=()=>toast.error("No hay espacio para guardar. Prueba con archivos más pequeños.");}catch{toast.error("No se pudieron guardar los cambios.");}},[state,ready,loadedKey,storageKey]);
  useEffect(()=>{const timer=setInterval(()=>setState(current=>expire(current)),30_000);return()=>clearInterval(timer);},[]);

  const update=(fn:(current:DemoState)=>DemoState)=>setState(current=>fn(expire(current)));
  async function syncAfterWrite(reload:()=>Promise<void>,showSaved:()=>void){
    const accountId=auth.account?.id??null;
    const refreshed=await refreshAfterAcceptedWrite(reload,()=>{
      if(activeAccountId.current===accountId)showSaved();
    });
    if(!refreshed&&activeAccountId.current===accountId){
      appliedSequence.current=Math.max(appliedSequence.current,refreshSequence.current);
      setSocialError("");
      toast.warning("Guardado en Nexo. La pantalla se actualizará al recuperar la conexión.");
    }
  }
  async function follow(handle:string){
    if(socialApi.enabled){const person=people.find(item=>item.handle===handle);
      if(!person)throw new Error("No encontramos a esa persona.");
      const enabled=!state.following.includes(handle);
      await socialApi.follow(person.id,enabled);
      await syncAfterWrite(refresh,()=>setState(current=>{
        const followingAt={...current.followingAt};
        if(enabled)followingAt[handle]=Date.now();else delete followingAt[handle];
        return {...current,following:enabled?[...new Set([...current.following,handle])]:current.following.filter(item=>item!==handle),followingAt};
      }));return;}
    update(current=>{const active=current.following.includes(handle);const followingAt={...current.followingAt};
      if(active)delete followingAt[handle];else followingAt[handle]=Date.now();
      return {...current,following:active?current.following.filter(item=>item!==handle):[...current.following,handle],followingAt};});
  }
  async function publish(payload:SocialPost,file:File|null){
    if(!socialApi.enabled)throw new Error("La comunidad aún no está conectada.");
    const uploaded=file?await socialApi.upload(file,payload.kind==="dump"?"story":"post"):null;
    const mediaId=uploaded?.id;
    if(payload.kind==="dump"){
      const result=await socialApi.story({body:payload.body,mediaId});
      await syncAfterWrite(refresh,()=>setState(current=>{
        const story:Story={id:result.id,authorId:auth.account?.id,author:current.profile.name,
          handle:"@"+current.profile.username,initials:initials(current.profile.name),text:payload.body,
          tone:"green",remainingMinutes:180,media:uploaded?.url,
          mediaType:file?.type.startsWith("video/")?"video":"image",own:true,expiresAt:result.expiresAt};
        return {...current,stories:[story,...current.stories]};
      }));
    }else{
      const result=await socialApi.post({...payload,mediaId});
      await syncAfterWrite(refresh,()=>setState(current=>{
        const kind=payload.kind as PostKind;
        const post:Post={id:result.id,authorId:auth.account?.id,kind,author:current.profile.name,
          handle:"@"+current.profile.username,initials:initials(current.profile.name),program:current.profile.program,
          ageMinutes:0,createdAt:result.createdAt,title:payload.title,body:payload.body,
          location:payload.location,image:uploaded?.url,mediaType:file?.type.startsWith("video/")?"video":"image",
          price:payload.price,category:payload.category,ups:0,reposts:0,comments:[],isFriend:true,tags:[],own:true};
        const currentQuota=current.quota.day===dayKey()?current.quota:{day:dayKey(),notify:0,reporte:0};
        const quota=kind==="notify"||kind==="reporte"?{...currentQuota,[kind]:Math.min(2,currentQuota[kind]+1)}:currentQuota;
        return {...current,posts:[post,...current.posts],quota};
      }));
    }
  }
  async function postFlag(id:string,kind:"up"|"save"|"repost",enabled:boolean){
    await socialApi.flag(id,kind,enabled);
    const key=kind==="up"?"liked":kind==="save"?"saved":"reposted";
    await syncAfterWrite(refresh,()=>setState(current=>({...current,posts:current.posts.map(post=>post.id===id?{...post,[key]:enabled}:post)})));
  }
  async function commentPost(id:string,text:string,parentId?:string){
    const result=await socialApi.comment(id,text,parentId);
    await syncAfterWrite(refresh,()=>setState(current=>({...current,posts:current.posts.map(post=>post.id===id?{
      ...post,comments:[...post.comments,{id:result.id,author:current.profile.name,text,parentId}]
    }:post)})));
  }
  async function sendMessage(recipientId:string,text:string,file:File|null,replyTo?:string){
    const uploaded=file?await socialApi.upload(file,"message"):null;
    const mediaId=uploaded?.id;
    const result=await socialApi.message({recipientId,text,mediaId,fileName:file?.name,replyTo});
    await syncAfterWrite(refreshConversations,()=>setState(current=>{
      const message={id:result.id,text,mine:true,at:result.createdAt,
        ...(file&&uploaded?{attachment:{name:file.name,url:uploaded.url,type:file.type}}:{})};
      const existing=current.conversations.find(item=>item.id===result.conversationId);
      if(existing)return {...current,conversations:current.conversations.map(item=>item.id===result.conversationId?{
        ...item,messages:item.messages.some(previous=>previous.id===result.id)?item.messages:[...item.messages,message]
      }:item)};
      const person=people.find(item=>item.id===recipientId);
      const name=person?.name||"Comunidad UPA";
      return {...current,conversations:[{id:result.conversationId,peerId:recipientId,handle:person?.handle,
        name,initials:initials(name),active:false,createdAt:result.createdAt,firstMessageAt:result.createdAt,
        messages:[message],theme:"verde"},...current.conversations]};
    }));
    return result.conversationId;
  }
  async function reactMessage(id:string,reaction:string){
    await socialApi.reactMessage(id,reaction);
    await syncAfterWrite(refreshConversations,()=>setState(current=>({...current,conversations:current.conversations.map(item=>({
      ...item,messages:item.messages.map(message=>message.id===id?{...message,reaction}:message)
    }))})));
  }
  async function saveAvatar(file:File|null){
    const uploaded=file?await socialApi.upload(file,"avatar"):null;
    await socialApi.avatar(uploaded?.id||null);
    await syncAfterWrite(refresh,()=>setState(current=>({...current,profile:{...current.profile,avatar:uploaded?.url}})));
  }
  async function markRead(id?:string){
    await socialApi.readNotification(id);
    await syncAfterWrite(refresh,()=>setState(current=>({...current,notifications:current.notifications.map(item=>!id||item.id===id?{...item,read:true}:item)})));
  }
  return <Context.Provider value={{state,ready,socialEnabled:socialApi.enabled,socialError,people,update,
    follow,publish,postFlag,commentPost,sendMessage,reactMessage,saveAvatar,markRead,refresh,refreshConversations}}>{children}</Context.Provider>;
}
export function useDemo(){const value=useContext(Context);if(!value)throw new Error("DemoProvider missing");return value;}
export function fileData(file:Blob):Promise<string>{return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(new Error("No se pudo leer el archivo."));r.readAsDataURL(file);});}
export function initials(name:string){return name.trim().split(/\s+/).slice(0,2).map(n=>n[0]).join("").toUpperCase();}
