import type { Post, Story } from "./demo-data";
export type Message = { id:string; text:string; mine:boolean; at:number; attachment?:{name:string;url:string;type:string} };
export type Conversation = { id:string; name:string; initials:string; active:boolean; firstMessageAt:number|null; messages:Message[]; theme:"verde"|"gris"|"blanco" };
export type Notification = { id:string; text:string; detail:string; postId?:string; read:boolean; at:number };
export type DemoState = { version:2; posts:Post[]; stories:Story[]; following:string[]; hidden:string[]; profile:{name:string;bio:string;program:string;note:string;avatar?:string;username?:string;phone?:string}; conversations:Conversation[]; notifications:Notification[]; quota:{day:string;notify:number;reporte:number}; draft:{kind:string;title:string;body:string} };
export function dayKey(now=Date.now()) { return new Intl.DateTimeFormat("en-CA",{timeZone:"America/Mexico_City",year:"numeric",month:"2-digit",day:"2-digit"}).format(now); }
export function seed():DemoState {
 return {version:2,posts:[],stories:[],following:[],hidden:[],profile:{name:"Tu perfil",bio:"",program:"",note:"",username:"",phone:""},conversations:[],notifications:[],quota:{day:dayKey(),notify:0,reporte:0},draft:{kind:"post",title:"",body:""}};
}
export function expire(state:DemoState,now=Date.now()):DemoState {
  const stories=state.stories.filter(s=>(s.expiresAt||0)>now);
  const conversations=state.conversations.map(c=>c.firstMessageAt!==null&&now>=c.firstMessageAt+7*86400000?{...c,firstMessageAt:null,messages:[]}:c);
  return {...state,stories,conversations,quota:state.quota.day===dayKey(now)?state.quota:{day:dayKey(now),notify:0,reporte:0}};
}
