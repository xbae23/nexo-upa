"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { seed, expire, type DemoState } from "./community-state";
import { useNexoAuth, type NexoProfile } from "./nexo-auth";
export { seed, expire, dayKey } from "./community-state";
export type { Message, Conversation, Notification, DemoState } from "./community-state";
export const uid = () => crypto.randomUUID();


function openDatabase():Promise<IDBDatabase> {return new Promise((resolve,reject)=>{const req=indexedDB.open("nexo-upa-v1-preview",2);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains("demo"))req.result.createObjectStore("demo");};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
const Context=createContext<null|{state:DemoState;ready:boolean;update:(fn:(s:DemoState)=>DemoState)=>void;follow:(handle:string)=>void}>(null);
function withOnlineProfile(state:DemoState,profile:NexoProfile|null):DemoState {
  return profile?{...state,profile:{...state.profile,name:profile.name,username:profile.username,program:profile.program,bio:profile.bio,note:profile.note,phone:profile.phone}}:state;
}
export function DemoProvider({children}:{children:ReactNode}){
  const auth=useNexoAuth();
  const storageKey=auth.status==="loading"?null:auth.account?`account:${auth.account.id}`:"state";
  const [state,setState]=useState<DemoState>(seed);const [ready,setReady]=useState(false);const db=useRef<IDBDatabase|null>(null);
  const [loadedKey,setLoadedKey]=useState<string|null>(null);
  useEffect(()=>{let alive=true;db.current?.close();db.current=null;setReady(false);setLoadedKey(null);setState(seed());if(!storageKey)return()=>{alive=false;};openDatabase().then(database=>{if(!alive){database.close();return;}db.current=database;const req=database.transaction("demo").objectStore("demo").get(storageKey);req.onsuccess=()=>{if(alive){const restored=req.result?.version===2?expire(req.result as DemoState):seed();setState(withOnlineProfile(restored,auth.profile));setLoadedKey(storageKey);setReady(true);}};req.onerror=()=>{if(alive){setState(withOnlineProfile(seed(),auth.profile));setLoadedKey(storageKey);setReady(true);toast.error("No se pudieron recuperar los datos guardados.");}};}).catch(()=>{if(alive){setState(withOnlineProfile(seed(),auth.profile));setLoadedKey(storageKey);setReady(true);toast.error("Almacenamiento no disponible: esta sesión no se conservará.");}});return()=>{alive=false;db.current?.close();db.current=null;};},[storageKey]);
  useEffect(()=>{if(auth.profile&&ready&&loadedKey===storageKey)setState(current=>withOnlineProfile(current,auth.profile));},[auth.profile,ready,loadedKey,storageKey]);
  useEffect(()=>{if(!ready||loadedKey!==storageKey||!db.current)return;try{const tx=db.current.transaction("demo","readwrite");tx.objectStore("demo").put(state,storageKey!);tx.onerror=()=>toast.error("No hay espacio para guardar. Prueba con archivos más pequeños.");}catch{toast.error("No se pudieron guardar los cambios.");}},[state,ready,loadedKey,storageKey]);
  useEffect(()=>{const timer=setInterval(()=>setState(s=>expire(s)),30000);return()=>clearInterval(timer);},[]);
  const update=(fn:(s:DemoState)=>DemoState)=>setState(s=>fn(expire(s)));
  const follow=(handle:string)=>update(s=>{const active=s.following.includes(handle);const followingAt={...s.followingAt};if(active)delete followingAt[handle];else followingAt[handle]=Date.now();return {...s,following:active?s.following.filter(h=>h!==handle):[...s.following,handle],followingAt};});
  return <Context.Provider value={{state,ready,update,follow}}>{children}</Context.Provider>;
}
export function useDemo(){const value=useContext(Context);if(!value)throw new Error("DemoProvider missing");return value;}
export function fileData(file:Blob):Promise<string>{return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(new Error("No se pudo leer el archivo."));r.readAsDataURL(file);});}
export function initials(name:string){return name.trim().split(/\s+/).slice(0,2).map(n=>n[0]).join("").toUpperCase();}
