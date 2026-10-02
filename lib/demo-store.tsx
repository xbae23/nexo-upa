"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { initialPosts, initialStories, type Post, type Story } from "./demo-data";

export type Message = { id:string; text:string; mine:boolean; at:number; attachment?:{name:string;url:string;type:string} };
export type Conversation = { id:string; name:string; initials:string; active:boolean; firstMessageAt:number|null; messages:Message[]; theme:"verde"|"gris"|"blanco" };
export type Notification = { id:string; text:string; detail:string; postId?:string; read:boolean; at:number };
export type DemoState = { version:2; posts:Post[]; stories:Story[]; following:string[]; hidden:string[]; profile:{name:string;bio:string;program:string;note:string}; conversations:Conversation[]; notifications:Notification[]; quota:{day:string;notify:number;reporte:number}; draft:{kind:string;title:string;body:string} };
export const uid = () => crypto.randomUUID();
export function dayKey(now=Date.now()) { return new Intl.DateTimeFormat("en-CA",{timeZone:"America/Mexico_City",year:"numeric",month:"2-digit",day:"2-digit"}).format(now); }
export function seed():DemoState {
  const now=Date.now();
  return {version:2,posts:initialPosts.map(p=>({...p,image:p.image?.replace(/^\//,""),createdAt:now-p.ageMinutes*60000})),stories:initialStories.map(s=>({...s,media:s.media?.replace(/^\//,""),expiresAt:now+s.remainingMinutes*60000})),following:["@vida.upa","@robotica.upa","@mariana.v"],hidden:[],profile:{name:"Alex UPA",bio:"Ideas, café y proyectos que nos conectan.",program:"Comunidad UPA",note:"¿Quién estudia en la biblioteca?"},conversations:[{id:"chat-robotica",name:"Club de Robótica",initials:"CR",active:true,firstMessageAt:now-86400000,theme:"verde",messages:[{id:"m1",text:"¡Hola! ¿Te sumas a las pruebas del jueves?",mine:false,at:now-3600000},{id:"m2",text:"Sí, ¿nos vemos en el laboratorio?",mine:true,at:now-3500000}]},{id:"chat-mariana",name:"Mariana V.",initials:"MV",active:false,firstMessageAt:now-2*86400000,theme:"verde",messages:[{id:"m3",text:"¡Todavía hay brownies! Entrego junto a la cafetería.",mine:false,at:now-7200000}]}],notifications:[{id:"n1",text:"Un reporte para la comunidad",detail:"Ana Sofía encontró una cartera cerca de la biblioteca.",postId:"wallet",read:false,at:now-360000},{id:"n2",text:"Robótica compartió un proyecto",detail:"Ya puedes ver las pruebas del nuevo prototipo.",postId:"robotics",read:false,at:now-1440000}],quota:{day:dayKey(),notify:0,reporte:0},draft:{kind:"post",title:"",body:""}};
}
export function expire(state:DemoState,now=Date.now()):DemoState {
  const activeStories=state.stories.filter(s=>(s.expiresAt||0)>now);
  // Keep illustrative campus stories available across return visits. Personal Dumps still expire.
  const sampleStories=initialStories.filter(s=>!activeStories.some(active=>active.id===s.id)).map(s=>({...s,media:s.media?.replace(/^\//,""),expiresAt:now+s.remainingMinutes*60000}));
  const stories=[...activeStories,...sampleStories];
  const conversations=state.conversations.map(c=>c.firstMessageAt!==null&&now>=c.firstMessageAt+7*86400000?{...c,firstMessageAt:null,messages:[]}:c);
  return {...state,stories,conversations,quota:state.quota.day===dayKey(now)?state.quota:{day:dayKey(now),notify:0,reporte:0}};
}
function openDatabase():Promise<IDBDatabase> {return new Promise((resolve,reject)=>{const req=indexedDB.open("nexo-upa-demo",2);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains("demo"))req.result.createObjectStore("demo");};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
const Context=createContext<null|{state:DemoState;ready:boolean;update:(fn:(s:DemoState)=>DemoState)=>void;follow:(handle:string)=>void}>(null);
export function DemoProvider({children}:{children:ReactNode}){
  const [state,setState]=useState<DemoState>(seed);const [ready,setReady]=useState(false);const db=useRef<IDBDatabase|null>(null);
  useEffect(()=>{let alive=true;openDatabase().then(database=>{if(!alive){database.close();return;}db.current=database;const req=database.transaction("demo").objectStore("demo").get("state");req.onsuccess=()=>{if(alive){if(req.result?.version===2){const saved=req.result as DemoState;const fresh=seed();const missing=fresh.posts.filter(p=>p.id.startsWith("campus-")&&!saved.posts.some(x=>x.id===p.id));setState(expire({...saved,posts:[...missing,...saved.posts.map(p=>{if(p.own)return p;const reference=fresh.posts.find(r=>r.id===p.id);return reference?{...p,image:reference.image,imagePosition:reference.imagePosition,source:reference.source,program:reference.program}:p;})],stories:saved.stories.map(s=>{if(s.own)return s;const ref=fresh.stories.find(r=>r.id===s.id);return ref?{...s,media:ref.media,text:ref.text,author:ref.author,source:ref.source}:s;})}));}setReady(true);}};req.onerror=()=>{setReady(true);toast.error("No se pudo recuperar la demo guardada.");};}).catch(()=>{setReady(true);toast.error("Almacenamiento no disponible: esta sesión no se conservará.");});return()=>{alive=false;db.current?.close();};},[]);
  useEffect(()=>{if(!ready||!db.current)return;try{const tx=db.current.transaction("demo","readwrite");tx.objectStore("demo").put(state,"state");tx.onerror=()=>toast.error("No hay espacio para guardar. Prueba con archivos más pequeños.");}catch{toast.error("No se pudieron guardar los cambios.");}},[state,ready]);
  useEffect(()=>{const timer=setInterval(()=>setState(s=>expire(s)),30000);return()=>clearInterval(timer);},[]);
  const update=(fn:(s:DemoState)=>DemoState)=>setState(s=>fn(expire(s)));
  const follow=(handle:string)=>update(s=>({...s,following:s.following.includes(handle)?s.following.filter(h=>h!==handle):[...s.following,handle]}));
  return <Context.Provider value={{state,ready,update,follow}}>{children}</Context.Provider>;
}
export function useDemo(){const value=useContext(Context);if(!value)throw new Error("DemoProvider missing");return value;}
export function fileData(file:Blob):Promise<string>{return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(new Error("No se pudo leer el archivo."));r.readAsDataURL(file);});}
export function initials(name:string){return name.trim().split(/\s+/).slice(0,2).map(n=>n[0]).join("").toUpperCase();}
