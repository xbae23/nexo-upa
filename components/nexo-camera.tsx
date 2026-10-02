"use client";

import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { Camera, Check, Image as ImageIcon, Minus, Plus, RotateCcw, SwitchCamera, Timer, Video, X, Zap, ZapOff } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cameraModeAfterSwipe, captureKind, clampCameraZoom, friendlyCameraError, supportedVideoMime, videoLimitSeconds, type CameraMode, type CameraZoomRange } from "@/lib/camera-utils";
import { webHaptic } from "@/lib/web-haptics";
import "@/app/nexo-camera.css";

type NexoCameraProps = {
  open: boolean;
  initialMode: "post" | "dump";
  onClose: () => void;
  /** The caller decides whether to attach or publish the local file. */
  onCapture: (file: File, kind: "post" | "dump") => void;
};

type Phase = "intro" | "live" | "review";
type CameraCapabilities = MediaTrackCapabilities & {
  zoom?: { min: number; max: number; step?: number };
  torch?: boolean[] | boolean;
  focusMode?: string[];
};
type CameraSettings = MediaTrackSettings & { zoom?: number; torch?: boolean };
type CameraConstraints = MediaTrackConstraintSet & {
  zoom?: number;
  torch?: boolean;
  focusMode?: string;
  pointsOfInterest?: Array<{ x: number; y: number }>;
};
type Point = { x: number; y: number };
type Preview = { file: File; url: string; kind: "post" | "dump" };
type Pinch = { distance: number; zoom: number };

const MODES: Array<{ id: CameraMode; label: string; description: string }> = [
  { id: "post", label: "Publicación", description: "Foto o video de hasta 30 s" },
  { id: "dump", label: "Dump", description: "Foto o video de hasta 25 s" },
  { id: "video", label: "Video", description: "Video de hasta 30 s" },
];

function pointerDistance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function stopTracks(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => {
    track.onended = null;
    track.stop();
  });
}

function nowFileName(type: "photo" | "video", mime: string): string {
  const extension = type === "photo" ? "jpg" : mime.includes("mp4") ? "mp4" : "webm";
  return `nexo-${type}-${new Date().toISOString().replaceAll(":", "-")}.${extension}`;
}

export function NexoCamera({ open, initialMode, onClose, onCapture }: NexoCameraProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [mode, setMode] = useState<CameraMode>(initialMode);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [zoomRange, setZoomRange] = useState<CameraZoomRange | null>(null);
  const [zoom, setZoom] = useState(1);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [focusSupported, setFocusSupported] = useState(false);
  const [focusPoint, setFocusPoint] = useState<Point | null>(null);
  const [countdownChoice, setCountdownChoice] = useState<0 | 3 | 10>(0);
  const [countdown, setCountdown] = useState(0);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [filter, setFilter] = useState<"none" | "warm" | "mono">("none");

  const openRef = useRef(false);
  const epochRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const microphoneRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const previewRef = useRef<Preview | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const recordingSinceRef = useRef(0);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingLimitRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdActiveRef = useRef(false);
  const holdTriggeredRef = useRef(false);
  const pointerStartRef = useRef<Point | null>(null);
  const pointersRef = useRef(new Map<number, Point>());
  const pinchRef = useRef<Pinch | null>(null);
  const hadPinchRef = useRef(false);
  const lastTapRef = useRef<{ at: number; point: Point } | null>(null);
  const zoomRequestedRef = useRef<number | null>(null);
  const zoomApplyingRef = useRef(false);
  const zoomRef = useRef(1);
  const zoomRangeRef = useRef<CameraZoomRange | null>(null);

  function clearTimers() {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (recordingLimitRef.current) clearTimeout(recordingLimitRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    recordingTimerRef.current = null;
    recordingLimitRef.current = null;
    countdownRef.current = null;
    holdTimerRef.current = null;
    focusTimerRef.current = null;
  }

  function stopCameraStream() {
    stopTracks(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    zoomRequestedRef.current = null;
  }

  function cleanupMedia() {
    epochRef.current++;
    clearTimers();
    const recorder = recorderRef.current;
    recorderRef.current = null;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      recorder.ondataavailable = null;
      recorder.onerror = null;
      recorder.stop();
    }
    stopTracks(microphoneRef.current);
    microphoneRef.current = null;
    stopCameraStream();
    if (previewRef.current) URL.revokeObjectURL(previewRef.current.url);
    previewRef.current = null;
    pointersRef.current.clear();
    pinchRef.current = null;
    holdActiveRef.current = false;
  }

  useEffect(() => {
    openRef.current = open;
    if (open) {
      setPhase("intro");
      setMode(initialMode);
      setFacing("environment");
      setReady(false);
      setBusy(false);
      setError("");
      setNotice("");
      setPreview(null);
      setRecording(false);
      setElapsed(0);
    } else {
      cleanupMedia();
    }
    return () => {
      openRef.current = false;
      cleanupMedia();
    };
  }, [open]);

  useEffect(() => {
    if (phase !== "live" || !ready || !streamRef.current || !videoRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    videoRef.current.play().catch(() => setNotice("Toca la vista previa para activar el video de la cámara."));
  }, [phase, ready]);

  useEffect(() => {
    if (!open) return;
    function visibilityChange() {
      if (document.visibilityState !== "hidden") return;
      if (recorderRef.current) stopRecording();
      else if (streamRef.current) {
        stopCameraStream();
        setReady(false);
        setPhase("intro");
        setNotice("La cámara se cerró al salir de la app. Puedes activarla de nuevo.");
      }
    }
    document.addEventListener("visibilitychange", visibilityChange);
    return () => document.removeEventListener("visibilitychange", visibilityChange);
  }, [open]);

  async function activateCamera(nextFacing: "environment" | "user" = facing) {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError("Esta cámara web necesita HTTPS o localhost y un navegador compatible. Puedes elegir un archivo de tu galería.");
      return;
    }
    if (recorderRef.current) return;
    const epoch = ++epochRef.current;
    stopCameraStream();
    setReady(false);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: nextFacing }, width: { ideal: 1280 }, height: { ideal: 1920 } },
        audio: false,
      });
      if (epoch !== epochRef.current || !openRef.current) {
        stopTracks(stream);
        return;
      }
      const track = stream.getVideoTracks()[0];
      if (!track) throw new Error("No video track");
      streamRef.current = stream;
      track.onended = () => {
        if (streamRef.current !== stream) return;
        stopCameraStream();
        setReady(false);
        setPhase("intro");
        setError("La cámara se desconectó. Puedes intentar activarla de nuevo.");
      };
      const capabilities = (track.getCapabilities?.() || {}) as CameraCapabilities;
      const settings = track.getSettings() as CameraSettings;
      const range = capabilities.zoom && Number.isFinite(capabilities.zoom.min) && Number.isFinite(capabilities.zoom.max) && capabilities.zoom.max > capabilities.zoom.min
        ? { min: capabilities.zoom.min, max: capabilities.zoom.max, step: capabilities.zoom.step || 0.1 }
        : null;
      zoomRangeRef.current = range;
      zoomRef.current = settings.zoom || range?.min || 1;
      setZoomRange(range);
      setZoom(zoomRef.current);
      const hasTorch = Array.isArray(capabilities.torch) ? capabilities.torch.includes(true) : capabilities.torch === true;
      setTorchSupported(hasTorch);
      setTorchOn(Boolean(settings.torch));
      const supported = navigator.mediaDevices.getSupportedConstraints?.() as MediaTrackSupportedConstraints & { pointsOfInterest?: boolean } | undefined;
      setFocusSupported(Boolean(supported?.pointsOfInterest && capabilities.focusMode?.some((item) => item === "single-shot" || item === "continuous")));
      setFacing(nextFacing);
      setPhase("live");
      setReady(true);
      webHaptic(8);
    } catch (cause) {
      if (epoch === epochRef.current && openRef.current) setError(friendlyCameraError(cause));
    } finally {
      if (epoch === epochRef.current && openRef.current) setBusy(false);
    }
  }

  async function applyZoom(value: number) {
    const range = zoomRangeRef.current;
    if (!range) return;
    zoomRequestedRef.current = clampCameraZoom(value, range);
    if (zoomApplyingRef.current) return;
    zoomApplyingRef.current = true;
    try {
      while (zoomRequestedRef.current !== null) {
        const next = zoomRequestedRef.current;
        zoomRequestedRef.current = null;
        const track = streamRef.current?.getVideoTracks()[0];
        if (!track) break;
        try {
          await track.applyConstraints({ advanced: [{ zoom: next } as CameraConstraints] });
          if (streamRef.current?.getVideoTracks()[0] !== track) break;
          const applied = (track.getSettings() as CameraSettings).zoom || next;
          const previous = zoomRef.current;
          zoomRef.current = applied;
          setZoom(applied);
          if (Math.abs(previous - 1) > 0.1 && Math.abs(applied - 1) <= 0.1) webHaptic(8);
        } catch {
          setNotice("El dispositivo no permitió cambiar el zoom.");
          setZoomRange(null);
          zoomRangeRef.current = null;
          break;
        }
      }
    } finally {
      zoomApplyingRef.current = false;
    }
  }

  async function toggleTorch() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track || !torchSupported) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn } as CameraConstraints] });
      setTorchOn(Boolean((track.getSettings() as CameraSettings).torch ?? !torchOn));
    } catch {
      setTorchSupported(false);
      setNotice("El flash continuo no está disponible en esta cámara.");
    }
  }

  async function focusAt(client: Point) {
    const track = streamRef.current?.getVideoTracks()[0];
    const stage = stageRef.current;
    if (!track || !stage || !focusSupported) return;
    const bounds = stage.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (client.x - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (client.y - bounds.top) / bounds.height));
    try {
      await track.applyConstraints({ advanced: [{ focusMode: "single-shot", pointsOfInterest: [{ x: facing === "user" ? 1 - x : x, y }] } as CameraConstraints] });
      setFocusPoint({ x: x * 100, y: y * 100 });
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
      focusTimerRef.current = setTimeout(() => setFocusPoint(null), 700);
    } catch {
      setFocusSupported(false);
      setNotice("Esta cámara mantiene el enfoque automático; no admite enfoque por toque.");
    }
  }

  function changeMode(next: CameraMode) {
    if (recording || busy || countdown) return;
    setMode(next);
    setError("");
    setNotice(next === "video" ? `Toca grabar para iniciar. Límite: ${videoLimitSeconds(next, initialMode)} segundos.` : "Toca para foto; mantén para grabar video.");
    webHaptic(8);
  }

  function flipCamera() {
    if (!ready || recording || busy || countdown) return;
    activateCamera(facing === "environment" ? "user" : "environment");
    webHaptic(8);
  }

  function stagePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Some browsers do not capture. */ }
    const point = { x: event.clientX, y: event.clientY };
    pointersRef.current.set(event.pointerId, point);
    if (pointersRef.current.size === 1) {
      pointerStartRef.current = point;
      hadPinchRef.current = false;
    } else if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()];
      pinchRef.current = { distance: Math.max(1, pointerDistance(a, b)), zoom: zoomRef.current };
      hadPinchRef.current = true;
      lastTapRef.current = null;
    }
  }

  function stagePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size !== 2 || !pinchRef.current || !zoomRangeRef.current) return;
    const [a, b] = [...pointersRef.current.values()];
    applyZoom(pinchRef.current.zoom * pointerDistance(a, b) / pinchRef.current.distance);
  }

  function stagePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const start = pointerStartRef.current;
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size === 0) pinchRef.current = null;
    if (!start || hadPinchRef.current || !ready || recording) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) >= 55 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      changeMode(cameraModeAfterSwipe(mode, dx < 0 ? "left" : "right"));
      lastTapRef.current = null;
      return;
    }
    if (Math.hypot(dx, dy) > 14) return;
    const point = { x: event.clientX, y: event.clientY };
    const last = lastTapRef.current;
    if (last && Date.now() - last.at < 320 && pointerDistance(last.point, point) < 36) {
      lastTapRef.current = null;
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
      flipCamera();
    } else {
      lastTapRef.current = { at: Date.now(), point };
      if (focusSupported) focusTimerRef.current = setTimeout(() => focusAt(point), 320);
    }
  }

  function stagePointerCancel(event: ReactPointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId);
    if (!pointersRef.current.size) pinchRef.current = null;
    lastTapRef.current = null;
  }

  function setCaptured(file: File, kind: "post" | "dump") {
    if (!openRef.current) return;
    if (previewRef.current) URL.revokeObjectURL(previewRef.current.url);
    const item = { file, url: URL.createObjectURL(file), kind };
    previewRef.current = item;
    stopCameraStream();
    setReady(false);
    setPreview(item);
    setPhase("review");
    setBusy(false);
    setRecording(false);
    setCountdown(0);
    webHaptic(10);
  }

  async function capturePhoto() {
    const video = videoRef.current;
    const stage = stageRef.current;
    if (!ready || !video?.videoWidth || !video.videoHeight || !stage || busy) return;
    setBusy(true);
    setError("");
    try {
      const aspect = stage.clientWidth / stage.clientHeight;
      const canvas = document.createElement("canvas");
      canvas.height = Math.min(1600, video.videoHeight);
      canvas.width = Math.round(canvas.height * aspect);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas unavailable");
      const sourceAspect = video.videoWidth / video.videoHeight;
      const sourceWidth = sourceAspect > aspect ? video.videoHeight * aspect : video.videoWidth;
      const sourceHeight = sourceAspect > aspect ? video.videoHeight : video.videoWidth / aspect;
      const sourceX = (video.videoWidth - sourceWidth) / 2;
      const sourceY = (video.videoHeight - sourceHeight) / 2;
      context.filter = filter === "warm" ? "saturate(1.12) sepia(.12)" : filter === "mono" ? "grayscale(1) contrast(1.08)" : "none";
      if (facing === "user") {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      context.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
      if (!blob || blob.size > 10 * 1024 * 1024) throw new Error("La foto supera 10 MB. Usa una imagen más pequeña.");
      setCaptured(new File([blob], nowFileName("photo", "image/jpeg"), { type: "image/jpeg" }), captureKind(mode));
    } catch (cause) {
      setError(cause instanceof Error && cause.message.includes("10 MB") ? cause.message : "No pudimos capturar la foto. Inténtalo de nuevo.");
      setBusy(false);
    }
  }

  function captureWithTimer() {
    if (countdownChoice === 0) {
      capturePhoto();
      return;
    }
    let remaining = countdownChoice;
    setCountdown(remaining);
    countdownRef.current = setInterval(() => {
      remaining--;
      setCountdown(remaining);
      if (remaining <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        countdownRef.current = null;
        capturePhoto();
      }
    }, 1000);
  }

  async function startRecording(source: "button" | "hold") {
    if (!ready || busy || recorderRef.current || countdown) return;
    if (typeof MediaRecorder === "undefined") {
      setError("Este navegador no permite grabar video desde la web. Puedes seleccionar un video de tu galería.");
      return;
    }
    const mime = supportedVideoMime((option) => MediaRecorder.isTypeSupported(option));
    if (!mime) {
      setError("Este navegador no ofrece un formato de video compatible. Usa tu galería para elegir uno.");
      return;
    }
    const cameraStream = streamRef.current;
    if (!cameraStream) return;
    setBusy(true);
    setError("");
    setNotice("");
    let microphone: MediaStream | null = null;
    try {
      try {
        microphone = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } catch {
        setNotice("Micrófono no autorizado: el video se grabará sin audio.");
      }
      if (!openRef.current || streamRef.current !== cameraStream || (source === "hold" && !holdActiveRef.current)) {
        stopTracks(microphone);
        setBusy(false);
        return;
      }
      microphoneRef.current = microphone;
      const combined = new MediaStream([...cameraStream.getVideoTracks(), ...(microphone?.getAudioTracks() || [])]);
      const recorder = new MediaRecorder(combined, { mimeType: mime, videoBitsPerSecond: 2_000_000, audioBitsPerSecond: 96_000 });
      const chunks: Blob[] = [];
      const recordingKind = captureKind(mode, initialMode);
      const limit = videoLimitSeconds(mode, initialMode);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onerror = () => setError("La grabación falló. Prueba de nuevo o selecciona un video de tu galería.");
      recorder.onstop = () => {
        recorderRef.current = null;
        stopTracks(microphoneRef.current);
        microphoneRef.current = null;
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        if (recordingLimitRef.current) clearTimeout(recordingLimitRef.current);
        recordingTimerRef.current = null;
        recordingLimitRef.current = null;
        setRecording(false);
        const normalizedMime = (recorder.mimeType || mime).split(";")[0];
        const blob = new Blob(chunks, { type: normalizedMime });
        if (!openRef.current) return;
        if (!blob.size) {
          setBusy(false);
          setError("La grabación quedó vacía. Inténtalo otra vez.");
        } else if (blob.size > 30 * 1024 * 1024) {
          setBusy(false);
          setError("El video supera 30 MB. Graba uno más corto.");
        } else {
          setCaptured(new File([blob], nowFileName("video", blob.type), { type: blob.type }), recordingKind);
        }
      };
      recorder.start(250);
      recordingSinceRef.current = Date.now();
      setElapsed(0);
      setRecording(true);
      setBusy(false);
      webHaptic(12);
      recordingTimerRef.current = setInterval(() => setElapsed(Math.min(limit, (Date.now() - recordingSinceRef.current) / 1000)), 100);
      recordingLimitRef.current = setTimeout(stopRecording, limit * 1000 - 200);
    } catch {
      stopTracks(microphone);
      microphoneRef.current = null;
      recorderRef.current = null;
      setBusy(false);
      setError("No fue posible iniciar la grabación. Revisa los permisos de cámara y micrófono.");
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    setBusy(true);
    recorder.stop();
    webHaptic(10);
  }

  function shutterPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (!ready || busy || countdown || recording) return;
    holdActiveRef.current = true;
    holdTriggeredRef.current = false;
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Button still supports tap. */ }
    if (mode !== "video") holdTimerRef.current = setTimeout(() => {
      holdTriggeredRef.current = true;
      startRecording("hold");
    }, 340);
  }

  function shutterPointerUp() {
    const held = holdTriggeredRef.current;
    holdActiveRef.current = false;
    holdTriggeredRef.current = false;
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = null;
    if (held) {
      if (recorderRef.current) stopRecording();
      return;
    }
    if (recording) stopRecording();
    else if (mode === "video") startRecording("button");
    else captureWithTimer();
  }

  function shutterPointerCancel() {
    holdActiveRef.current = false;
    holdTriggeredRef.current = false;
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = null;
    if (recorderRef.current) stopRecording();
  }

  function galleryChanged(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const allowed = /^image\/(jpeg|png|webp|gif)$|^video\/(mp4|webm|quicktime)$/.test(file.type);
    if (!allowed) {
      setError("Elige una foto JPG, PNG, WebP, GIF o un video MP4, WebM o MOV.");
      return;
    }
    if (file.size > (file.type.startsWith("video") ? 30 : 10) * 1024 * 1024) {
      setError("La foto admite hasta 10 MB; el video, hasta 30 MB.");
      return;
    }
    setCaptured(file, captureKind(mode, initialMode));
  }

  function close() {
    openRef.current = false;
    cleanupMedia();
    onClose();
  }

  function accept() {
    if (!preview) return;
    onCapture(preview.file, preview.kind);
    close();
  }

  function retake() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current.url);
    previewRef.current = null;
    setPreview(null);
    setError("");
    setPhase("intro");
    activateCamera();
  }

  const limit = videoLimitSeconds(mode, initialMode);
  const ring = recording ? Math.min(100, elapsed / limit * 100) : 0;
  const filteredStyle = filter === "warm" ? "saturate(1.12) sepia(.12)" : filter === "mono" ? "grayscale(1) contrast(1.08)" : undefined;

  return <DialogPrimitive.Root open={open} onOpenChange={(value) => { if (!value) close(); }}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="nexo-camera-overlay" />
      <DialogPrimitive.Content className="nexo-camera-panel" onEscapeKeyDown={(event) => { if (busy && recording) event.preventDefault(); }}>
        <DialogPrimitive.Title className="nexo-camera-sr">Cámara de Nexo UPA</DialogPrimitive.Title>
        <DialogPrimitive.Description className="nexo-camera-sr">Captura una foto o un video corto. El archivo se preparará localmente y tú decidirás si lo adjuntas.</DialogPrimitive.Description>

        {phase === "intro" && <div className="nexo-camera-intro">
          <div className="nexo-camera-intro-top"><span className="nexo-camera-wordmark">NEXO <b>UPA</b></span><button className="nexo-camera-icon" type="button" aria-label="Cerrar cámara" onClick={close}><X size={24}/></button></div>
          <div className="nexo-camera-intro-art" aria-hidden="true"><div className="nexo-camera-intro-frame"><Camera size={42}/><span>CAPTURA TU CAMPUS</span></div></div>
          <div className="nexo-camera-intro-copy"><span className="nexo-camera-eyebrow">Crea desde Nexo</span><h2>Tu momento, en primer plano.</h2><p>Para abrir la vista previa, este sitio solicitará acceso a la cámara. El micrófono se pedirá solo si decides grabar video. Puedes retirar los permisos desde tu navegador en cualquier momento.</p><div className="nexo-camera-permission"><span>●</span> Nada se publica al capturar: primero podrás revisar o descartar el archivo.</div>{notice && <p className="nexo-camera-notice" role="status">{notice}</p>}{error && <p className="nexo-camera-error" role="alert">{error}</p>}<button className="nexo-camera-primary" type="button" disabled={busy} onClick={() => activateCamera()}>{busy ? "Abriendo cámara…" : "Continuar y activar cámara"}</button><button className="nexo-camera-secondary" type="button" onClick={() => galleryRef.current?.click()}><ImageIcon size={19}/> Elegir de la galería</button><p className="nexo-camera-small">Funciona en HTTPS o localhost. En esta demo, el archivo solo se guarda en tu navegador.</p></div>
        </div>}

        {phase === "live" && <div className="nexo-camera-live">
          <div ref={stageRef} className="nexo-camera-stage" onPointerDown={stagePointerDown} onPointerMove={stagePointerMove} onPointerUp={stagePointerUp} onPointerCancel={stagePointerCancel}>
            <video ref={videoRef} muted autoPlay playsInline aria-label="Vista previa en vivo de la cámara" className={facing === "user" ? "is-mirrored" : ""} style={{ filter: mode !== "video" ? filteredStyle : undefined }}/>
            <div className="nexo-camera-grid" aria-hidden="true"/>
            {focusPoint && <span className="nexo-camera-focus" style={{ left: `${focusPoint.x}%`, top: `${focusPoint.y}%` }} aria-hidden="true"/>}
          </div>
          <div className="nexo-camera-live-ui">
            <div className="nexo-camera-topbar"><button className="nexo-camera-icon" type="button" aria-label="Cerrar cámara" onClick={close}><X size={24}/></button><span className="nexo-camera-live-brand">NEXO <b>CAM</b></span><button className="nexo-camera-icon" type="button" aria-label="Voltear cámara" disabled={busy || recording} onClick={flipCamera}><SwitchCamera size={24}/></button></div>
            <div className="nexo-camera-tools"><button className="nexo-camera-tool" type="button" aria-label={torchSupported ? torchOn ? "Apagar flash" : "Encender flash" : "Flash no disponible"} title={torchSupported ? "Flash continuo" : "Flash no disponible"} disabled={!torchSupported || busy || recording} onClick={toggleTorch}>{torchOn ? <Zap size={19}/> : <ZapOff size={19}/>}<span>{torchSupported ? "Flash" : "Sin flash"}</span></button><button className="nexo-camera-tool" type="button" title="Temporizador para fotos" aria-label={`Temporizador para fotos: ${countdownChoice ? `${countdownChoice} segundos` : "desactivado"}. Cambiar.`} disabled={recording || busy} onClick={() => setCountdownChoice(countdownChoice === 0 ? 3 : countdownChoice === 3 ? 10 : 0)}><Timer size={19}/><span>{countdownChoice ? `${countdownChoice} s` : "Timer"}</span></button><span className="nexo-camera-focus-label">{focusSupported ? "Toca para enfocar" : "Enfoque automático"}</span></div>
            <div className="nexo-camera-spacer"/>
            {zoomRange && <div className="nexo-camera-zoom"><button type="button" aria-label="Reducir zoom" disabled={busy || zoom <= zoomRange.min} onClick={() => applyZoom(zoom - Math.max(zoomRange.step, 0.2))}><Minus size={18}/></button><label><span>{zoom.toFixed(1)}×</span><input aria-label="Zoom de cámara" type="range" min={zoomRange.min} max={zoomRange.max} step={zoomRange.step} value={zoom} disabled={busy} onChange={(event) => applyZoom(Number(event.target.value))}/></label><button type="button" aria-label="Aumentar zoom" disabled={busy || zoom >= zoomRange.max} onClick={() => applyZoom(zoom + Math.max(zoomRange.step, 0.2))}><Plus size={18}/></button></div>}
            {countdown > 0 && <div className="nexo-camera-countdown" role="status" aria-live="assertive">{countdown}</div>}
            {recording && <div className="nexo-camera-record-status" role="status"><span className="nexo-camera-record-dot"/> Grabando {elapsed.toFixed(1)} / {limit} s</div>}
            {notice && <p className="nexo-camera-live-notice" role="status">{notice}</p>}
            {error && <p className="nexo-camera-live-error" role="alert">{error}</p>}
            <div className="nexo-camera-mode-tabs" role="tablist" aria-label="Modo de cámara">{MODES.map((item) => <button key={item.id} type="button" role="tab" aria-selected={mode === item.id} aria-label={`${item.label}: ${item.id === "video" && initialMode === "dump" ? "video para Dump de hasta 25 s" : item.description}`} disabled={recording || busy || countdown > 0} className={mode === item.id ? "is-active" : ""} onClick={() => changeMode(item.id)}>{item.label}</button>)}</div>
            {mode !== "video" && !recording && <div className="nexo-camera-filter-row" role="group" aria-label="Filtro de foto"><span>FOTO</span><button type="button" className={filter === "none" ? "is-active" : ""} onClick={() => setFilter("none")}>Natural</button><button type="button" className={filter === "warm" ? "is-active" : ""} onClick={() => setFilter("warm")}>Cálido</button><button type="button" className={filter === "mono" ? "is-active" : ""} onClick={() => setFilter("mono")}>Mono</button></div>}
            <div className="nexo-camera-controls"><button className="nexo-camera-gallery" type="button" aria-label="Elegir foto o video de la galería" disabled={recording || busy} onClick={() => galleryRef.current?.click()}><ImageIcon size={24}/><span>Galería</span></button><button className={`nexo-camera-shutter${recording ? " is-recording" : ""}`} type="button" aria-label={recording ? "Detener grabación" : mode === "video" ? "Iniciar grabación" : "Tomar foto; mantén pulsado para grabar video"} disabled={!ready || busy || countdown > 0} style={{ "--record-progress": `${ring}%` } as CSSProperties} onPointerDown={shutterPointerDown} onPointerUp={shutterPointerUp} onPointerCancel={shutterPointerCancel} onClick={(event) => { if (event.detail === 0) { if (recording) stopRecording(); else if (mode === "video") startRecording("button"); else captureWithTimer(); } }}><span>{recording ? <span className="nexo-camera-stop-square"/> : mode === "video" ? <Video size={24}/> : <Camera size={25}/>}</span></button><button className="nexo-camera-gallery" type="button" aria-label="Voltear cámara" disabled={recording || busy} onClick={flipCamera}><SwitchCamera size={25}/><span>Voltear</span></button></div>
            <div className="nexo-camera-action-row">{!recording ? <button type="button" disabled={busy || !ready || countdown > 0} onClick={() => startRecording("button")}><Video size={18}/> Iniciar video · máx. {limit} s</button> : <button type="button" disabled={busy} onClick={stopRecording}><span className="nexo-camera-record-dot"/> Detener video</button>}</div>
            <p className="nexo-camera-hint">{mode === "video" ? "Graba con el botón. Desliza para cambiar de modo." : "Toca para foto · mantén para video · desliza para cambiar"}</p>
          </div>
        </div>}

        {phase === "review" && preview && <div className="nexo-camera-review"><div className="nexo-camera-review-top"><span>VISTA PREVIA</span><button className="nexo-camera-icon" type="button" aria-label="Descartar y cerrar" onClick={close}><X size={24}/></button></div><div className="nexo-camera-review-media">{preview.file.type.startsWith("video") ? <video src={preview.url} controls playsInline preload="metadata" aria-label="Video capturado"/> : <img src={preview.url} alt="Foto capturada"/>}</div><div className="nexo-camera-review-actions"><p>Solo tú ves este archivo hasta que decidas adjuntarlo. {preview.kind === "dump" ? "El Dump podrá durar 3 horas al publicarse." : "Se agregará a tu publicación."}</p><div><button type="button" className="nexo-camera-secondary" onClick={retake}><RotateCcw size={19}/> Repetir</button><button type="button" className="nexo-camera-primary" onClick={accept}><Check size={19}/> Usar {preview.kind === "dump" ? "en Dump" : "en publicación"}</button></div></div></div>}

        <input ref={galleryRef} className="nexo-camera-hidden-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" onChange={galleryChanged}/>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>;
}
