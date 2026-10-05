"use client";
import { useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useDemo } from "@/lib/demo-store";
import type { PostKind } from "@/lib/demo-data";

type Tool={name:string;title:string;description:string;inputSchema:Record<string,unknown>;annotations:{readOnlyHint:false};execute:(input:unknown)=>unknown};
type Context={registerTool:(tool:Tool,options:{signal:AbortSignal})=>void|Promise<void>};
type DocumentWithTools=Document&{modelContext?:Context};

export function NexoWebTools({onCompose,onOpenChat}:{onCompose:(kind:PostKind|"dump")=>void;onOpenChat:(name:string)=>void}){
 const {state,follow}=useDemo();
 const current=useRef({state,follow,onCompose,onOpenChat});current.current={state,follow,onCompose,onOpenChat};
 useEffect(()=>{
  const context=(document as DocumentWithTools).modelContext;
  if(!context?.registerTool)return;
  const lifecycle=new AbortController();
  const register=(tool:Tool)=>{try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
  register({name:"nexo_set_following",title:"Seguir o dejar de seguir",description:"Actualiza el botón Seguir de un perfil visible en la comunidad.",inputSchema:{type:"object",properties:{handle:{type:"string"},following:{type:"boolean"}},required:["handle","following"],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){const value=input as {handle?:unknown;following?:unknown};if(typeof value?.handle!=="string"||typeof value.following!=="boolean"||!current.current.state.posts.some(p=>p.handle===value.handle))throw new Error("Perfil no encontrado o parámetros inválidos.");if(current.current.state.following.includes(value.handle)!==value.following)flushSync(()=>current.current.follow(value.handle as string));return {handle:value.handle,following:current.current.state.following.includes(value.handle)};}});
  register({name:"nexo_open_composer",title:"Preparar publicación",description:"Abre el editor visible de Post, Notify, Reporte, Venta o Dump para terminar de redactar.",inputSchema:{type:"object",properties:{kind:{type:"string",enum:["post","notify","reporte","venta","dump"]}},required:["kind"],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){const value=input as {kind?:unknown};if(!["post","notify","reporte","venta","dump"].includes(String(value?.kind)))throw new Error("Formato inválido.");flushSync(()=>current.current.onCompose(value.kind as PostKind|"dump"));return {editorOpen:true,kind:value.kind};}});
  register({name:"nexo_open_chat",title:"Abrir conversación",description:"Abre el chat de una persona o grupo que aparece en la comunidad.",inputSchema:{type:"object",properties:{name:{type:"string"}},required:["name"],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){const value=input as {name?:unknown};if(typeof value?.name!=="string"||![...current.current.state.posts.map(p=>p.author),...current.current.state.conversations.map(c=>c.name)].includes(value.name))throw new Error("Contacto no encontrado.");flushSync(()=>current.current.onOpenChat(value.name as string));return {chatOpen:true,name:value.name};}});
  return()=>lifecycle.abort();
 },[]);
 return null;
}
