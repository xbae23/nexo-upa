/** Ignore a response from an older refresh or a previously active account. */
import type { Conversation } from "./community-state";

export function canApplySocialRefresh(
  requestAccountId:string,
  activeAccountId:string|null,
  requestSequence:number,
  appliedSequence:number
):boolean {
  return requestAccountId===activeAccountId&&requestSequence>=appliedSequence;
}

/** Keep chat appearance choices on this device while replacing remote messages. */
export function mergeConversationPreferences(incoming:Conversation[],current:Conversation[]):Conversation[] {
  const previous=new Map(current.map(item=>[item.id,item]));
  return incoming.map(item=>{
    const saved=previous.get(item.id) as (Conversation&{pinned?:boolean})|undefined;
    return {...item,theme:saved?.theme||item.theme,...(saved&&"pinned" in saved?{pinned:saved.pinned}:{})};
  });
}

/** An accepted write stays successful even when its follow-up read fails. */
export async function refreshAfterAcceptedWrite(reload:()=>Promise<void>,showSaved:()=>void):Promise<boolean> {
  try{await reload();return true;}
  catch{showSaved();return false;}
}
