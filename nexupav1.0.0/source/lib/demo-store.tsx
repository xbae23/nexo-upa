"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { seed, expire, type DemoState } from "./community-state";
export { seed, expire, dayKey } from "./community-state";
export type { Message, Conversation, Notification, DemoState } from "./community-state";
export const uid = () => crypto.randomUUID();


function openDatabase():Promise<IDBDatabase> {return new Promise((resolve,reject)=>{const req=indexedDB.open("nexo-upa-v1-preview",2);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains("demo"))req.result.createObjectStore("demo");};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
const Context=createContext<null|{state:DemoState;ready:boolean;update:(fn:(s:DemoState)=>DemoState)=>void;follow:(handle:string)=>void}>(null);
export function DemoProvider({children}:{children:ReactNode}){
  const [state,setState]=useState<DemoState>(seed);const [ready,setReady]=useState(false);const db=useRef<IDBDatabase|null>(null);
  useEffect(()=>{let alive=true;db.current=null;setReady(false);openDatabase().then(database=>{if(!alive){database.close();return;}db.current=database;const req=database.transaction("demo").objectStore("demo").get("state");req.onsuccess=()=>{if(alive){if(req.result?.version===2){setState(expire(req.result as DemoState));}setReady(true);}};req.onerror=()=>{setReady(true);toast.error("No se pudieron recuperar los datos guardados.");};}).catch(()=>{setReady(true);toast.error("Almacenamiento no disponible: esta sesión no se conservará.");});return()=>{alive=false;db.current?.close();db.current=null;};},[]);
  useEffect(()=>{if(!ready||!db.current)return;try{const tx=db.current.transaction("demo","readwrite");tx.objectStore("demo").put(state,"state");tx.onerror=()=>toast.error("No hay espacio para guardar. Prueba con archivos más pequeños.");}catch{toast.error("No se pudieron guardar los cambios.");}},[state,ready]);
  useEffect(()=>{const timer=setInterval(()=>setState(s=>expire(s)),30000);return()=>clearInterval(timer);},[]);
  const update=(fn:(s:DemoState)=>DemoState)=>setState(s=>fn(expire(s)));
  const follow=(handle:string)=>update(s=>({...s,following:s.following.includes(handle)?s.following.filter(h=>h!==handle):[...s.following,handle]}));
  return <Context.Provider value={{state,ready,update,follow}}>{children}</Context.Provider>;
}
export function useDemo(){const value=useContext(Context);if(!value)throw new Error("DemoProvider missing");return value;}
export function fileData(file:Blob):Promise<string>{return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(new Error("No se pudo leer el archivo."));r.readAsDataURL(file);});}
export function initials(name:string){return name.trim().split(/\s+/).slice(0,2).map(n=>n[0]).join("").toUpperCase();}
