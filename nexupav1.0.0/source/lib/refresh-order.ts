/** Ignore a response from an older refresh or a previously active account. */
export function canApplySocialRefresh(
  requestAccountId:string,
  activeAccountId:string|null,
  requestSequence:number,
  appliedSequence:number
):boolean {
  return requestAccountId===activeAccountId&&requestSequence>=appliedSequence;
}
