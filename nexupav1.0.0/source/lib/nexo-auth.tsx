"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { appConfig } from "./app-config";

export type LoginAccount = { id:string; usuario:string; correo:string; creado?:string };
export type NexoProfile = { name:string; username:string; program:string; bio:string; note:string; phone:string; updatedAt?:string };
type AuthStatus = "loading" | "anonymous" | "authenticated" | "error";
type AuthValue = {
  status:AuthStatus;
  account:LoginAccount|null;
  profile:NexoProfile|null;
  error:string;
  saveProfile:(profile:NexoProfile)=>Promise<void>;
  signOut:()=>Promise<void>;
};

const TOKEN_KEY = "nexo_demo_session";
const Context = createContext<AuthValue|null>(null);
let bootstrapPromise:Promise<{account:LoginAccount|null;profile:NexoProfile|null}>|null = null;

class AuthError extends Error { constructor(message:string,readonly status:number){super(message);} }

async function requestJson<T>(path:string,options:RequestInit={}):Promise<T>{
  const response=await fetch(appConfig.authApiUrl+path,{...options,headers:{...(options.body?{"Content-Type":"application/json"}:{}),...options.headers}});
  const body=await response.json().catch(()=>({})) as Record<string,unknown>;
  if(!response.ok)throw new AuthError(typeof body.error==="string"?body.error:"No se pudo conectar con tu cuenta.",response.status);
  return body as T;
}

function token(){return localStorage.getItem(TOKEN_KEY)||"";}

async function bootstrap(){
  if(!appConfig.authApiUrl)return {account:null,profile:null};
  const code=new URLSearchParams(location.hash.slice(1)).get("nexo-code");
  if(code){
    const result=await requestJson<{token:string}>("/auth/canjear",{method:"POST",body:JSON.stringify({codigo:code})});
    localStorage.setItem(TOKEN_KEY,result.token);
    history.replaceState(null,"",location.pathname+location.search);
  }
  if(!token())return {account:null,profile:null};
  try{
    const me=await requestJson<{perfil:LoginAccount}>("/auth/yo",{headers:{Authorization:`Bearer ${token()}`}});
    const data=await requestJson<{perfil:NexoProfile|null}>("/perfil",{headers:{Authorization:`Bearer ${token()}`}});
    return {account:me.perfil,profile:data.perfil};
  }catch(error){
    if(error instanceof AuthError&&error.status===401){localStorage.removeItem(TOKEN_KEY);return {account:null,profile:null};}
    throw error;
  }
}

export function NexoAuthProvider({children}:{children:ReactNode}){
  const [status,setStatus]=useState<AuthStatus>("loading");
  const [account,setAccount]=useState<LoginAccount|null>(null);
  const [profile,setProfile]=useState<NexoProfile|null>(null);
  const [error,setError]=useState("");
  useEffect(()=>{
    let alive=true;
    bootstrapPromise??=bootstrap();
    bootstrapPromise.then(data=>{
      if(!alive)return;
      setAccount(data.account);setProfile(data.profile);
      setStatus(data.account?"authenticated":"anonymous");
    }).catch(cause=>{if(alive){setError(cause instanceof Error?cause.message:"No se pudo abrir tu cuenta.");setStatus("error");}});
    return()=>{alive=false;};
  },[]);
  async function saveProfile(next:NexoProfile){
    if(status!=="authenticated")throw new Error("Inicia sesión antes de guardar tu perfil.");
    const data=await requestJson<{perfil:NexoProfile}>("/perfil",{method:"PUT",headers:{Authorization:`Bearer ${token()}`},body:JSON.stringify(next)});
    setProfile(data.perfil);
  }
  async function signOut(){
    const previous=token();
    localStorage.removeItem(TOKEN_KEY);
    setAccount(null);setProfile(null);setStatus("anonymous");
    if(previous&&appConfig.authApiUrl){try{await requestJson("/auth/salir",{method:"POST",headers:{Authorization:`Bearer ${previous}`}});}catch{/* La sesión local ya terminó. */}}
  }
  return <Context.Provider value={{status,account,profile,error,saveProfile,signOut}}>{children}</Context.Provider>;
}

export function useNexoAuth(){const value=useContext(Context);if(!value)throw new Error("NexoAuthProvider missing");return value;}
