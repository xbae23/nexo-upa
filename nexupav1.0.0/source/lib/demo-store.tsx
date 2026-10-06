"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { seed, expire, type DemoState } from "./community-state";
import { useNexoAuth, type NexoProfile } from "./nexo-auth";
import { socialApi, type SocialPerson, type SocialSnapshot } from "./social-api";
import { canApplySocialRefresh } from "./refresh-order";
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
};

function openDatabase():Promise<IDBDatabase> {return new Promise((resolve,reject)=>{const req=indexedDB.open("nexo-upa-v1-preview",2);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains("demo"))req.result.createObjectStore("demo");};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
const Context=createContext<StoreValue|null>(null);

function withOnlineProfile(state:DemoState,profile:NexoProfile|null):DemoState {
  return profile?{...state,profile:{...state.profile,name:profile.name,username:profile.username,program:profile.program,bio:profile.bio,note:profile.note,phone:profile.phone}}:state;
}

function withSocialSnapshot(current:DemoState,snapshot:SocialSnapshot):DemoState {
  const handles=new Map(snapshot.people.map(person=>[person.id,person.handle]));
  const previousThemes=new Map(current.conversations.map(item=>[item.id,item]));
  const conversations=snapshot.conversations.map(item=>{
    const previous=previousThemes.get(item.id);
    return {...item,theme:previous?.theme||item.theme,...(previous&&"pinned" in previous?{pinned:previous.pinned}:{})};
  });
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

  useEffect(()=>{
    if(!socialApi.enabled||!auth.account||!auth.profile||loadedKey!==storageKey)return;
    let alive=true;
    const load=()=>{if(alive)void refresh().catch(()=>{});};
    load();
    const interval=setInterval(()=>{if(document.visibilityState==="visible")load();},30_000);
    window.addEventListener("focus",load);
    return()=>{alive=false;clearInterval(interval);window.removeEventListener("focus",load);};
  },[auth.account,auth.profile,loadedKey,storageKey,refresh]);

  useEffect(()=>{if(auth.profile&&ready&&loadedKey===storageKey)setState(current=>withOnlineProfile(current,auth.profile));},[auth.profile,ready,loadedKey,storageKey]);
  useEffect(()=>{if(!ready||loadedKey!==storageKey||!db.current)return;try{const tx=db.current.transaction("demo","readwrite");tx.objectStore("demo").put(state,storageKey!);tx.onerror=()=>toast.error("No hay espacio para guardar. Prueba con archivos más pequeños.");}catch{toast.error("No se pudieron guardar los cambios.");}},[state,ready,loadedKey,storageKey]);
  useEffect(()=>{const timer=setInterval(()=>setState(current=>expire(current)),30_000);return()=>clearInterval(timer);},[]);

  const update=(fn:(current:DemoState)=>DemoState)=>setState(current=>fn(expire(current)));
  async function follow(handle:string){
    if(socialApi.enabled){const person=people.find(item=>item.handle===handle);
      if(!person)throw new Error("No encontramos a esa persona.");
      await socialApi.follow(person.id,!state.following.includes(handle));await refresh();return;}
    update(current=>{const active=current.following.includes(handle);const followingAt={...current.followingAt};
      if(active)delete followingAt[handle];else followingAt[handle]=Date.now();
      return {...current,following:active?current.following.filter(item=>item!==handle):[...current.following,handle],followingAt};});
  }
  async function publish(payload:SocialPost,file:File|null){
    if(!socialApi.enabled)throw new Error("La comunidad aún no está conectada.");
    const mediaId=file?(await socialApi.upload(file,payload.kind==="dump"?"story":"post")).id:undefined;
    if(payload.kind==="dump")await socialApi.story({body:payload.body,mediaId});
    else await socialApi.post({...payload,mediaId});
    await refresh();
  }
  async function postFlag(id:string,kind:"up"|"save"|"repost",enabled:boolean){
    await socialApi.flag(id,kind,enabled);await refresh();
  }
  async function commentPost(id:string,text:string,parentId?:string){
    await socialApi.comment(id,text,parentId);await refresh();
  }
  async function sendMessage(recipientId:string,text:string,file:File|null,replyTo?:string){
    const mediaId=file?(await socialApi.upload(file,"message")).id:undefined;
    const result=await socialApi.message({recipientId,text,mediaId,fileName:file?.name,replyTo});
    await refresh();return result.conversationId;
  }
  async function reactMessage(id:string,reaction:string){await socialApi.reactMessage(id,reaction);await refresh();}
  async function saveAvatar(file:File|null){
    const mediaId=file?(await socialApi.upload(file,"avatar")).id:null;
    await socialApi.avatar(mediaId);await refresh();
  }
  async function markRead(id?:string){await socialApi.readNotification(id);await refresh();}
  return <Context.Provider value={{state,ready,socialEnabled:socialApi.enabled,socialError,people,update,
    follow,publish,postFlag,commentPost,sendMessage,reactMessage,saveAvatar,markRead,refresh}}>{children}</Context.Provider>;
}
export function useDemo(){const value=useContext(Context);if(!value)throw new Error("DemoProvider missing");return value;}
export function fileData(file:Blob):Promise<string>{return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(new Error("No se pudo leer el archivo."));r.readAsDataURL(file);});}
export function initials(name:string){return name.trim().split(/\s+/).slice(0,2).map(n=>n[0]).join("").toUpperCase();}
