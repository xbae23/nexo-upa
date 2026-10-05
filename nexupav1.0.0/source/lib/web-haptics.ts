/** Optional tactile feedback on browsers that expose the Vibration API. */
export function webHaptic(milliseconds = 10): boolean {
  if (typeof document === "undefined" || document.visibilityState !== "visible") return false;
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    return navigator.vibrate(milliseconds);
  } catch {
    return false;
  }
}
