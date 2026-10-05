"use client";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight, GraduationCap } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { appConfig } from "@/lib/app-config";
import { NexoLogo } from "./nexo-logo";
import { AppearanceButton } from "./nexo-appearance";

/** Replace this slot with your login. There are deliberately no credential fields. */
export function InstitutionalLogin({intent}:{intent:"login"|"register"}) {
 const url=intent==="register"?appConfig.createAccountUrl||appConfig.loginUrl:appConfig.loginUrl;
 return <DialogContent className="institutional-popup" aria-describedby="access-description">
  <img className="institutional-provider-image" src={appConfig.providerImage} alt="Acceso institucional" width={48} height={48}/>
  <DialogHeader><DialogTitle>{intent==="register"?"Crea tu cuenta":"Inicia sesión"}</DialogTitle><DialogDescription id="access-description">Regístrate con tu correo institucional.</DialogDescription></DialogHeader>
  {url?<a className="button-primary institutional-link" href={url}>Continuar al acceso institucional <ArrowUpRight size={18}/></a>:<div className="login-integration-slot"><GraduationCap size={28}/><p>El acceso institucional estará disponible aquí.</p><span>Tu cuenta se administra desde el servicio de tu universidad.</span></div>}
 </DialogContent>;
}

export function AccessGate({children}:{children:ReactNode}) {
 const [entered,setEntered]=useState(false);
 const [popup,setPopup]=useState(false);
 const [intent,setIntent]=useState<"login"|"register">("register");
 useEffect(()=>{const back=()=>{setEntered(false);setPopup(false);};window.addEventListener("nexo:access",back);return()=>window.removeEventListener("nexo:access",back);},[]);
 function access(next:"login"|"register"){setIntent(next);setPopup(true);}
 // Preview is an explicit UI test, never a successful login or an authenticated session.
 if(entered&&appConfig.previewEnabled)return <>{children}</>;
 return <main className="access-page"><div className="access-appearance"><AppearanceButton/></div><section className="access-welcome">
  <div className="access-logo"><NexoLogo/></div><p className="access-wordmark">nexo <span>UPA</span></p>
  <h1>Tu campus.<br/>Tu comunidad.</h1><p className="access-intro">Un lugar para compartir, encontrar ayuda<br/>y conectar con quienes te rodean.</p>
  <div className="access-actions"><p>Regístrate con tu correo institucional</p><button className="institutional-button" onClick={()=>access("register")}><img src={appConfig.providerImage} alt="" width={36} height={36}/><span>Crear cuenta</span><ArrowUpRight size={20}/></button><p className="access-existing">¿Ya tienes cuenta? <button onClick={()=>access("login")}>Iniciar sesión</button></p></div>
  {appConfig.previewEnabled&&<div className="access-preview"><button onClick={()=>setEntered(true)}>Explorar vista previa</button><small>Sin iniciar sesión. Tus pruebas solo se guardan en este dispositivo.</small></div>}
  <footer>Hecho para nuestra comunidad.</footer>
 </section><Dialog open={popup} onOpenChange={setPopup}><InstitutionalLogin intent={intent}/></Dialog></main>;
}
