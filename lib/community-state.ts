import type { Post, Story } from "./demo-data";
export type Message = { id:string; text:string; mine:boolean; at:number; attachment?:{name:string;url:string;type:string} };
export type Conversation = { id:string; peerId?:string; handle?:string; name:string; initials:string; active:boolean; createdAt?:number; firstMessageAt:number|null; messages:Message[]; theme:"verde"|"gris"|"blanco" };
export type Notification = { id:string; text:string; detail:string; postId?:string; read:boolean; at:number };
export type DemoState = { version:2; posts:Post[]; stories:Story[]; following:string[]; followingAt?:Record<string,number>; hidden:string[]; profile:{name:string;bio:string;program:string;note:string;avatar?:string;username?:string;phone?:string}; conversations:Conversation[]; notifications:Notification[]; quota:{day:string;notify:number;reporte:number}; draft:{kind:string;title:string;body:string;savedAt?:number} };
export const SOCIAL_CONTENT_MS = 3 * 86400000;
export function dayKey(now=Date.now()) { return new Intl.DateTimeFormat("en-CA",{timeZone:"America/Mexico_City",year:"numeric",month:"2-digit",day:"2-digit"}).format(now); }
export function seed():DemoState {
 return {version:2,posts:[],stories:[],following:[],followingAt:{},hidden:[],profile:{name:"Tu perfil",bio:"",program:"",note:"",username:"",phone:""},conversations:[],notifications:[],quota:{day:dayKey(),notify:0,reporte:0},draft:{kind:"post",title:"",body:""}};
}
export function expire(state:DemoState,now=Date.now()):DemoState {
  // Older local posts had no timestamp. Keep them for one final three-day window.
  const posts=state.posts.map(post=>post.createdAt?post:{...post,createdAt:now}).filter(post=>post.createdAt!+SOCIAL_CONTENT_MS>now);
  const activePostIds=new Set(posts.map(post=>post.id));
  const notifications=state.notifications.filter(item=>item.at+SOCIAL_CONTENT_MS>now&&(!item.postId||activePostIds.has(item.postId)));
  const stories=state.stories.filter(s=>(s.expiresAt||0)>now);
  const conversations=state.conversations.map(c=>({...c,createdAt:c.createdAt??c.firstMessageAt??c.messages[0]?.at??now})).filter(c=>(c.firstMessageAt??c.createdAt!)+SOCIAL_CONTENT_MS>now);
  const previousFollowTimes=state.followingAt??{};
  const following=state.following.filter(handle=>(previousFollowTimes[handle]??now)+SOCIAL_CONTENT_MS>now);
  const followingAt=Object.fromEntries(following.map(handle=>[handle,previousFollowTimes[handle]??now]));
  const draftHasContent=Boolean(state.draft.title||state.draft.body);
  const savedAt=state.draft.savedAt??now;
  const draft=draftHasContent&&savedAt+SOCIAL_CONTENT_MS>now?{...state.draft,savedAt}:{kind:"post",title:"",body:""};
  return {...state,posts,notifications,stories,conversations,following,followingAt,hidden:state.hidden.filter(id=>activePostIds.has(id)),draft,quota:state.quota.day===dayKey(now)?state.quota:{day:dayKey(now),notify:0,reporte:0}};
}
