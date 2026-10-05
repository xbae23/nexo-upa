export type CameraMode = "post" | "dump" | "video";

export type CameraZoomRange = { min: number; max: number; step: number };

export function captureKind(mode: CameraMode, videoContext: "post" | "dump" = "post"): "post" | "dump" {
  return mode === "video" ? videoContext : mode;
}

export function videoLimitSeconds(mode: CameraMode, videoContext: "post" | "dump" = "post"): number {
  return captureKind(mode, videoContext) === "dump" ? 25 : 30;
}

export function clampCameraZoom(value: number, range: CameraZoomRange): number {
  if (!Number.isFinite(value)) return range.min;
  const bounded = Math.max(range.min, Math.min(range.max, value));
  const steps = Math.round((bounded - range.min) / range.step);
  return Math.max(range.min, Math.min(range.max, range.min + steps * range.step));
}

export function cameraModeAfterSwipe(mode: CameraMode, direction: "left" | "right"): CameraMode {
  const modes: CameraMode[] = ["post", "dump", "video"];
  const index = modes.indexOf(mode);
  return modes[Math.max(0, Math.min(modes.length - 1, index + (direction === "left" ? 1 : -1)))];
}

export function supportedVideoMime(isSupported: (mime: string) => boolean): string | null {
  const options = ["video/mp4;codecs=h264,aac", "video/mp4", "video/webm;codecs=vp8,opus", "video/webm"];
  return options.find(isSupported) || null;
}

export function friendlyCameraError(error: unknown): string {
  const name = error instanceof DOMException ? error.name : error && typeof error === "object" && "name" in error ? String(error.name) : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError") {
    return "No se autorizó la cámara. Activa el permiso para este sitio en tu navegador e inténtalo de nuevo.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") return "No encontramos una cámara disponible en este dispositivo.";
  if (name === "NotReadableError" || name === "TrackStartError") return "La cámara está ocupada por otra aplicación. Ciérrala e inténtalo de nuevo.";
  if (name === "OverconstrainedError") return "Esta cámara no admite la configuración solicitada. Prueba con otra cámara.";
  return "No se pudo iniciar la cámara. Revisa los permisos y vuelve a intentarlo.";
}
