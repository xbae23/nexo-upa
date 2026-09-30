"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Maximize2, Minus, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { clampOffset, clampZoom, distance, isDoubleTap, zoomAtPoint, type Point, type TapPoint } from "@/lib/gesture-math";
import { webHaptic } from "@/lib/web-haptics";

type MediaViewerProps = {
  src: string;
  alt: string;
  onClose: () => void;
};

type DragState = { start: Point; last: Point; moved: boolean };

export function MediaViewer({ src, alt, onClose }: MediaViewerProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const drag = useRef<DragState | null>(null);
  const pinch = useRef<{ distance: number; scale: number; offset: Point; point: Point; center: Point } | null>(null);
  const hadPinch = useRef(false);
  const lastTap = useRef<TapPoint | null>(null);
  const scaleRef = useRef(1);
  const offsetRef = useRef<Point>({ x: 0, y: 0 });
  const dismissRef = useRef(0);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [dismissY, setDismissY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [fitSize, setFitSize] = useState<Point | null>(null);

  function fitImage() {
    const image = imageRef.current;
    const stage = stageRef.current;
    if (!image?.naturalWidth || !image.naturalHeight || !stage) return;
    const factor = Math.min(stage.clientWidth / image.naturalWidth, stage.clientHeight / image.naturalHeight);
    const fitted = { x: Math.round(image.naturalWidth * factor), y: Math.round(image.naturalHeight * factor) };
    const bounded = clampOffset(offsetRef.current, scaleRef.current, { width: fitted.x, height: fitted.y }, { width: stage.clientWidth, height: stage.clientHeight });
    offsetRef.current = bounded;
    setOffset(bounded);
    setFitSize(fitted);
  }

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(fitImage);
    observer.observe(stage);
    if (imageRef.current?.complete) fitImage();
    return () => observer.disconnect();
  }, [src]);

  function dimensions() {
    const image = imageRef.current;
    const stage = stageRef.current;
    return { width: image?.offsetWidth || stage?.clientWidth || 1, height: image?.offsetHeight || stage?.clientHeight || 1 };
  }

  function stageSize() {
    const stage = stageRef.current;
    return { width: stage?.clientWidth || 1, height: stage?.clientHeight || 1 };
  }

  function imagePoint(client: Point): Point {
    const stage = stageRef.current?.getBoundingClientRect();
    const size = dimensions();
    if (!stage) return { x: size.width / 2, y: size.height / 2 };
    return {
      x: client.x - stage.left - (stage.width - size.width) / 2,
      y: client.y - stage.top - (stage.height - size.height) / 2,
    };
  }

  function commitZoom(next: number, point?: Point, from?: { scale: number; offset: Point }) {
    const size = dimensions();
    const origin = from || { scale: scaleRef.current, offset: offsetRef.current };
    const target = zoomAtPoint(origin.scale, clampZoom(next), origin.offset, point || { x: size.width / 2, y: size.height / 2 }, size, stageSize());
    scaleRef.current = target.scale;
    offsetRef.current = target.offset;
    setScale(target.scale);
    setOffset(target.offset);
  }

  function commitOffset(next: Point) {
    const bounded = clampOffset(next, scaleRef.current, dimensions(), stageSize());
    offsetRef.current = bounded;
    setOffset(bounded);
  }

  function reset() {
    scaleRef.current = 1;
    offsetRef.current = { x: 0, y: 0 };
    setScale(1);
    setOffset({ x: 0, y: 0 });
    dismissRef.current = 0;
    setDismissY(0);
  }

  function pointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    const point = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, point);
    if (pointers.current.size === 1) {
      drag.current = { start: point, last: point, moved: false };
      hadPinch.current = false;
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = {
        distance: Math.max(1, distance(a, b)),
        scale: scaleRef.current,
        offset: offsetRef.current,
        center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        point: imagePoint({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }),
      };
      hadPinch.current = true;
      dismissRef.current = 0;
      setDismissY(0);
    }
  }

  function pointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    const point = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, point);
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const next = zoomAtPoint(
        pinch.current.scale,
        pinch.current.scale * distance(a, b) / pinch.current.distance,
        pinch.current.offset,
        pinch.current.point,
        dimensions(),
        stageSize(),
      );
      const translated = clampOffset({
        x: next.offset.x + center.x - pinch.current.center.x,
        y: next.offset.y + center.y - pinch.current.center.y,
      }, next.scale, dimensions(), stageSize());
      scaleRef.current = next.scale;
      offsetRef.current = translated;
      setScale(next.scale);
      setOffset(translated);
      return;
    }
    if (hadPinch.current || !drag.current) return;
    const dx = point.x - drag.current.last.x;
    const dy = point.y - drag.current.last.y;
    if (distance(point, drag.current.start) > 8) drag.current.moved = true;
    drag.current.last = point;
    if (scaleRef.current > 1) {
      commitOffset({ x: offsetRef.current.x + dx, y: offsetRef.current.y + dy });
    } else {
      const fromStartX = point.x - drag.current.start.x;
      const fromStartY = point.y - drag.current.start.y;
      if (fromStartY > 0 && Math.abs(fromStartY) > Math.abs(fromStartX)) {
        dismissRef.current = Math.min(260, fromStartY);
        setDismissY(dismissRef.current);
      }
    }
  }

  function pointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size > 0) return;
    if (dismissRef.current > 110 && event.type === "pointerup") {
      onClose();
    } else if (!hadPinch.current && !drag.current?.moved && event.type === "pointerup") {
      const current = { x: event.clientX, y: event.clientY, time: Date.now() };
      if (isDoubleTap(lastTap.current, current)) {
        lastTap.current = null;
        commitZoom(scaleRef.current > 1 ? 1 : 2, imagePoint(current));
        webHaptic();
      } else {
        lastTap.current = current;
      }
    }
    dismissRef.current = 0;
    setDismissY(0);
    drag.current = null;
    hadPinch.current = false;
    setDragging(false);
  }

  const visible = stageSize();
  const media = fitSize || { x: 0, y: 0 };
  const panX = Math.max(0, (media.x * scale - visible.width) / 2);
  const panY = Math.max(0, (media.y * scale - visible.height) / 2);
  const panStep = 64;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="media-viewer-dialog" showCloseButton={false}>
        <DialogHeader className="sr-only">
          <DialogTitle>Visor de foto: {alt}</DialogTitle>
          <DialogDescription>Pellizca o usa los botones para ampliar. Desliza hacia abajo o pulsa cerrar para salir.</DialogDescription>
        </DialogHeader>
        <div className="media-viewer-toolbar">
          <span>Foto · Nexo UPA</span>
          <button type="button" aria-label="Cerrar foto" onClick={onClose}><X size={24} /></button>
        </div>
        <div
          ref={stageRef}
          className="media-viewer-stage"
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerEnd}
          onPointerCancel={pointerEnd}
          style={{ opacity: 1 - Math.min(.45, dismissY / 500) }}
        >
          <img
            ref={imageRef}
            src={src}
            alt={alt}
            draggable={false}
            onLoad={fitImage}
            style={{ width: fitSize?.x || "100%", height: fitSize?.y || "auto", transform: `translate3d(${offset.x}px, ${offset.y + dismissY}px, 0) scale(${scale})`, transition: dragging ? "none" : undefined }}
          />
        </div>
        <div className="media-viewer-controls">
          <div className="media-zoom-controls">
            <button type="button" aria-label="Alejar foto" disabled={scale <= 1} onClick={() => commitZoom(scale - .5)}><Minus size={20} /></button>
            <output aria-label="Nivel de zoom">{Math.round(scale * 100)}%</output>
            <button type="button" aria-label="Acercar foto" disabled={scale >= 4} onClick={() => commitZoom(scale + .5)}><Plus size={20} /></button>
            <button type="button" aria-label="Restablecer zoom" onClick={reset}><Maximize2 size={19} /></button>
          </div>
          <div className="media-pan-controls" aria-label="Mover foto ampliada">
            <button type="button" aria-label="Mover foto a la izquierda" disabled={offset.x <= -panX} onClick={() => commitOffset({ x: offsetRef.current.x - panStep, y: offsetRef.current.y })}><ArrowLeft size={19} /></button>
            <button type="button" aria-label="Mover foto arriba" disabled={offset.y <= -panY} onClick={() => commitOffset({ x: offsetRef.current.x, y: offsetRef.current.y - panStep })}><ArrowUp size={19} /></button>
            <button type="button" aria-label="Mover foto abajo" disabled={offset.y >= panY} onClick={() => commitOffset({ x: offsetRef.current.x, y: offsetRef.current.y + panStep })}><ArrowDown size={19} /></button>
            <button type="button" aria-label="Mover foto a la derecha" disabled={offset.x >= panX} onClick={() => commitOffset({ x: offsetRef.current.x + panStep, y: offsetRef.current.y })}><ArrowRight size={19} /></button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
