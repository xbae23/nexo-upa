"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowUp } from "lucide-react";
import { MediaViewer } from "@/components/nexo-media-viewer";
import { distance, isDoubleTap, type Point, type TapPoint } from "@/lib/gesture-math";
import { webHaptic } from "@/lib/web-haptics";
import type { Post } from "@/lib/demo-data";

type PostMediaProps = {
  post: Post;
  burst: boolean;
  gesturesEnabled: boolean;
  onDoubleUp: () => void;
};

export function PostMedia({ post, burst, gesturesEnabled, onDoubleUp }: PostMediaProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const start = useRef<Point | null>(null);
  const lastTap = useRef<TapPoint | null>(null);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (pending.current) clearTimeout(pending.current); }, []);

  if (!post.image) return null;

  function pointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (pending.current) clearTimeout(pending.current);
    pending.current = null;
    start.current = { x: event.clientX, y: event.clientY };
  }

  function pointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    const point = { x: event.clientX, y: event.clientY };
    if (!start.current || distance(start.current, point) > 14) {
      start.current = null;
      lastTap.current = null;
      return;
    }
    start.current = null;
    const current = { ...point, time: Date.now() };
    if (isDoubleTap(lastTap.current, current)) {
      lastTap.current = null;
      onDoubleUp();
      webHaptic();
    } else {
      lastTap.current = current;
      pending.current = setTimeout(() => {
        lastTap.current = null;
        setViewerOpen(true);
        pending.current = null;
      }, 310);
    }
  }

  const isVideo = post.mediaType === "video";
  return (
    <>
      <div className="post-media" onDoubleClick={!gesturesEnabled ? onDoubleUp : undefined}>
        {isVideo ? (
          <video src={post.image} controls playsInline preload="metadata" />
        ) : gesturesEnabled ? (
          <button
            type="button"
            className="post-media-trigger"
            aria-label={`Abrir foto de ${post.author}: ${post.title}. Doble toque para dar Up.`}
            onPointerDown={pointerDown}
            onPointerUp={pointerUp}
            onPointerCancel={() => { start.current = null; lastTap.current = null; }}
            onClick={(event) => { if (event.detail === 0) setViewerOpen(true); }}
          >
            <img src={post.image} alt={post.title} loading="lazy" style={post.imagePosition ? { objectPosition: post.imagePosition } : undefined} />
          </button>
        ) : (
          <img src={post.image} alt={post.title} loading="lazy" style={post.imagePosition ? { objectPosition: post.imagePosition } : undefined} />
        )}
        {burst && <span className="up-burst"><ArrowUp size={64} /></span>}
        {post.price && <span className="media-price">{post.price}</span>}
      </div>
      {viewerOpen && gesturesEnabled && !isVideo && (
        <MediaViewer src={post.image} alt={post.title} onClose={() => setViewerOpen(false)} />
      )}
    </>
  );
}
