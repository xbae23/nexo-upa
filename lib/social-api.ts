import { appConfig } from "./app-config";
import { nexoSessionToken } from "./nexo-auth";
import type { Post, Story } from "./demo-data";
import type { Conversation, Notification } from "./community-state";

export type SocialPerson = {
  id:string; name:string; username:string; handle:string; program:string; bio:string;
  note:string; avatar?:string;
};
export type SocialSnapshot = {
  me:{id:string;usuario:string;correo:string;creado:string;name:string;username:string;
    program:string;bio:string;note:string;avatar?:string};
  people:SocialPerson[]; posts:Post[]; stories:Story[];
  following:string[]; conversations:Conversation[]; notifications:Notification[];
  quota:{day:string;notify:number;reporte:number};
};

export class SocialApiError extends Error {
  constructor(message:string,readonly status:number){super(message);}
}

async function call<T>(path:string,options:RequestInit={}):Promise<T>{
  if(!appConfig.socialApiUrl)throw new SocialApiError("La comunidad aún no está conectada.",503);
  const token=nexoSessionToken();
  if(!token)throw new SocialApiError("Vuelve a iniciar sesión.",401);
  let response:Response;
  try{response=await fetch(appConfig.socialApiUrl+path,{
    ...options,headers:{Authorization:`Bearer ${token}`,...options.headers}
  });}catch{throw new SocialApiError("No se pudo conectar con la comunidad. Comprueba tu Internet.",0);}
  if(!response.ok){const data=await response.json().catch(()=>({})) as {error?:string};
    throw new SocialApiError(data.error||"No se pudo completar la acción.",response.status);}
  return response.json() as Promise<T>;
}

function json<T>(path:string,method:string,body:unknown):Promise<T>{
  return call<T>(path,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
}

export const socialApi={
  enabled:Boolean(appConfig.socialApiUrl),
  bootstrap:()=>call<SocialSnapshot>("/v1/bootstrap"),
  conversations:()=>call<{conversations:Conversation[]}>("/v1/conversations"),
  post:(payload:{kind:string;title:string;body:string;location?:string;price?:string;category?:string;mediaId?:string})=>
    json<{id:string;createdAt:number;expiresAt:number}>("/v1/posts","POST",payload),
  story:(payload:{body:string;mediaId?:string})=>json<{id:string;createdAt:number;expiresAt:number}>("/v1/stories","POST",payload),
  follow:(id:string,enabled:boolean)=>call<{ok:boolean}>(`/v1/follows/${encodeURIComponent(id)}`,{method:enabled?"PUT":"DELETE"}),
  flag:(postId:string,kind:"up"|"save"|"repost",enabled:boolean)=>
    call<{ok:boolean}>(`/v1/posts/${encodeURIComponent(postId)}/${kind}`,{method:enabled?"PUT":"DELETE"}),
  comment:(postId:string,text:string,parentId?:string)=>
    json<{id:string;createdAt:number}>(`/v1/posts/${encodeURIComponent(postId)}/comments`,"POST",{text,parentId}),
  message:(payload:{recipientId:string;text:string;mediaId?:string;fileName?:string;replyTo?:string})=>
    json<{id:string;conversationId:string;createdAt:number;expiresAt:number}>("/v1/messages","POST",payload),
  reactMessage:(id:string,reaction:string)=>json<{ok:boolean}>(`/v1/messages/${encodeURIComponent(id)}/reaction`,"PUT",{reaction}),
  readNotification:(id?:string)=>json<{ok:boolean}>("/v1/notifications/read","POST",{id}),
  avatar:(mediaId:string|null)=>json<{avatarId:string|null}>("/v1/avatar","PUT",{mediaId}),
  async upload(file:File,purpose:"post"|"story"|"message"|"avatar"){
    return call<{id:string;url:string}>("/v1/media",{
      method:"POST",headers:{"Content-Type":file.type,"X-Media-Purpose":purpose,
        "X-File-Name":file.name.replace(/[^\w.\- ]/g,"").slice(0,120)},body:file
    });
  },
  async privateMedia(url:string){
    const token=nexoSessionToken();
    const response=await fetch(url,{headers:{Authorization:`Bearer ${token}`}});
    if(!response.ok)throw new SocialApiError("El archivo ya no está disponible.",response.status);
    return response.blob();
  }
};
