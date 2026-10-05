"use client";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowUpRight, GraduationCap } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { appConfig } from "@/lib/app-config";
import { useNexoAuth } from "@/lib/nexo-auth";
import { NexoLogo } from "./nexo-logo";
import { AppearanceButton } from "./nexo-appearance";

/** Presentación reemplazable: el motor de cuenta vive en lib/nexo-auth.tsx. */
export function InstitutionalLogin({intent}:{intent:"login"|"register"}) {
 const url=intent==="register"?appConfig.createAccountUrl||appConfig.loginUrl:appConfig.loginUrl;
 return <DialogContent className="institutional-popup" aria-describedby="access-description">
  <img className="institutional-provider-image" src={appConfig.providerImage} alt="Nexo UPA" width={48} height={48}/>
  <DialogHeader><DialogTitle>{intent==="register"?"Crea tu cuenta":"Inicia sesión"}</DialogTitle><DialogDescription id="access-description">Usa el acceso de demostración de Nexo. Al volver elegirás cómo aparecer en la app.</DialogDescription></DialogHeader>
  {url?<a className="button-primary institutional-link" href={url}>{intent==="register"?"Ir al registro":"Ir al inicio de sesión"} <ArrowUpRight size={18}/></a>:<div className="login-integration-slot"><GraduationCap size={28}/><p>La conexión del acceso está pendiente.</p><span>La dirección del login se configura en app-config.js.</span></div>}
 </DialogContent>;
}

function ProfileOnboarding(){
 const {saveProfile,signOut}=useNexoAuth();
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  const data=new FormData(event.currentTarget);
  const name=String(data.get("name")||"").trim();
  const username=String(data.get("username")||"").trim().toLowerCase();
  const program=String(data.get("program")||"").trim();
  const bio=String(data.get("bio")||"").trim();
  if(name.length<2||name.length>60||!/^[a-z0-9._]{3,24}$/.test(username)){setError("Escribe un nombre y un alias válido de 3 a 24 caracteres.");return;}
  setBusy(true);setError("");
  try{await saveProfile({name,username,program,bio,note:"",phone:""});}
  catch(cause){setError(cause instanceof Error?cause.message:"No se pudo guardar el perfil.");setBusy(false);}
 }
 return <main className="profile-setup-page"><section className="profile-setup-card">
  <div className="profile-setup-brand"><span><NexoLogo/></span><strong>nexo <em>UPA</em></strong></div>
  <div className="profile-setup-progress"><span className="active"/><span className="active"/><span/></div>
  <p className="profile-setup-eyebrow">Un último paso</p>
  <h1>Haz tuyo este espacio.</h1>
  <p className="profile-setup-intro">Tu cuenta ya está creada. Ahora elige tu identidad visible dentro de Nexo. Puede ser distinta del usuario que escribiste al registrarte.</p>
  <form onSubmit={submit} className="profile-setup-form">
   <label>Nombre visible<input name="name" autoComplete="name" placeholder="Como quieres que te conozcan" required minLength={2} maxLength={60}/></label>
   <label>Alias en Nexo<span className="profile-setup-input"><span>@</span><input name="username" autoCapitalize="none" autoComplete="off" placeholder="tu.alias" required minLength={3} maxLength={24} pattern="[A-Za-z0-9._]{3,24}"/></span></label>
   <label>Carrera <small>opcional</small><input name="program" placeholder="Tu carrera o área de interés" maxLength={80}/></label>
   <label>Algo sobre ti <small>opcional</small><textarea name="bio" placeholder="¿Qué te gustaría compartir con la comunidad?" maxLength={160} rows={3}/></label>
   {error&&<p className="profile-setup-error" role="alert">{error}</p>}
   <button className="button-primary profile-setup-submit" disabled={busy}>{busy?"Guardando perfil...":"Entrar a Nexo"}<ArrowUpRight size={18}/></button>
  </form>
  <button className="profile-setup-signout" type="button" onClick={()=>void signOut()}>Salir de esta cuenta</button>
  <small className="profile-setup-note">El panel de registro solo muestra tu ID, usuario y correo. Esta información de perfil se guarda aparte.</small>
 </section></main>;
}

export function AccessGate({children}:{children:ReactNode}) {
 const auth=useNexoAuth();
 const [entered,setEntered]=useState(false);
 const [popup,setPopup]=useState(false);
 const [intent,setIntent]=useState<"login"|"register">("register");
 useEffect(()=>{const back=()=>{setEntered(false);setPopup(false);};window.addEventListener("nexo:access",back);return()=>window.removeEventListener("nexo:access",back);},[]);
 function access(next:"login"|"register"){setIntent(next);setPopup(true);}
 if(auth.status==="loading")return <main className="access-page"><section className="access-welcome"><div className="access-logo"><NexoLogo/></div><p>Abriendo Nexo...</p></section></main>;
 if(auth.status==="error")return <main className="access-page"><section className="access-welcome"><div className="access-logo"><NexoLogo/></div><h1>No pudimos conectar tu cuenta</h1><p className="access-intro">{auth.error}</p><button className="institutional-button" onClick={()=>location.reload()}>Intentar otra vez</button></section></main>;
 if(auth.status==="authenticated")return auth.profile?<>{children}</>:<ProfileOnboarding/>;
 // La vista previa sigue siendo una prueba local; nunca representa una sesión real.
 if(entered&&appConfig.previewEnabled)return <>{children}</>;
 return <main className="access-page"><div className="access-appearance"><AppearanceButton/></div><section className="access-welcome">
  <div className="access-logo"><NexoLogo/></div><p className="access-wordmark">nexo <span>UPA</span></p>
  <h1>Tu campus.<br/>Tu comunidad.</h1><p className="access-intro">Un lugar para compartir, encontrar ayuda<br/>y conectar con quienes te rodean.</p>
  <div className="access-actions"><p>Crea una cuenta para esta demostración</p><button className="institutional-button" onClick={()=>access("register")}><img src={appConfig.providerImage} alt="" width={36} height={36}/><span>Crear cuenta</span><ArrowUpRight size={20}/></button><p className="access-existing">¿Ya tienes cuenta? <button onClick={()=>access("login")}>Iniciar sesión</button></p></div>
  {appConfig.previewEnabled&&<div className="access-preview"><button onClick={()=>setEntered(true)}>Explorar vista previa</button><small>Sin iniciar sesión. Tus pruebas solo se guardan en este dispositivo.</small></div>}
  <footer>Proyecto estudiantil independiente · No es un servicio oficial de la universidad.</footer>
 </section><Dialog open={popup} onOpenChange={setPopup}><InstitutionalLogin intent={intent}/></Dialog></main>;
}
