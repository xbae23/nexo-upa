/** Geometry shared by touch, pointer, and mouse gestures. Coordinates are CSS pixels. */
export type Point = { x: number; y: number };
export type Viewport = { width: number; height: number };
export type TapPoint = Point & { time: number };
export type SwipeDirection = "left" | "right" | "up" | "down";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

export function clampZoom(value: number): number {
  return Number.isFinite(value)
    ? Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
    : MIN_ZOOM;
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Bounds translation for media that fills the given viewport at 1x and has
 * `transform-origin: center`. Pass the visible media rectangle as viewport.
 */
export function clampOffset(offset: Point, scale: number, viewport: Viewport): Point {
  const zoom = clampZoom(scale);
  const width = Number.isFinite(viewport.width) ? Math.max(0, viewport.width) : 0;
  const height = Number.isFinite(viewport.height) ? Math.max(0, viewport.height) : 0;
  const maxX = (width * (zoom - 1)) / 2;
  const maxY = (height * (zoom - 1)) / 2;
  const x = Number.isFinite(offset.x) ? offset.x : 0;
  const y = Number.isFinite(offset.y) ? offset.y : 0;
  return {
    x: maxX === 0 ? 0 : Math.min(maxX, Math.max(-maxX, x)),
    y: maxY === 0 ? 0 : Math.min(maxY, Math.max(-maxY, y)),
  };
}

/** Keep the content under a focal point stationary while changing zoom. */
export function zoomAtPoint(
  scale: number,
  nextScale: number,
  offset: Point,
  point: Point,
  viewport: Viewport,
): { scale: number; offset: Point } {
  const from = clampZoom(scale);
  const to = clampZoom(nextScale);
  const current = clampOffset(offset, from, viewport);
  const centerX = viewport.width / 2;
  const centerY = viewport.height / 2;
  const focalX = Number.isFinite(point.x) ? point.x - centerX : 0;
  const focalY = Number.isFinite(point.y) ? point.y - centerY : 0;
  const ratio = to / from;
  return {
    scale: to,
    offset: clampOffset(
      {
        x: current.x * ratio + focalX * (1 - ratio),
        y: current.y * ratio + focalY * (1 - ratio),
      },
      to,
      viewport,
    ),
  };
}

export function isDoubleTap(
  previous: TapPoint | null,
  current: TapPoint,
  { maxDelay = 300, maxDistance = 24 }: { maxDelay?: number; maxDistance?: number } = {},
): boolean {
  if (!previous || !Number.isFinite(previous.time) || !Number.isFinite(current.time)) return false;
  if (!Number.isFinite(maxDelay) || maxDelay < 0 || !Number.isFinite(maxDistance) || maxDistance < 0) return false;
  const delay = current.time - previous.time;
  return delay >= 0 && delay <= maxDelay && distance(previous, current) <= maxDistance;
}

/** Only the dominant axis can win; equal diagonal motion is ambiguous. */
export function classifySwipe(dx: number, dy: number, threshold: number): SwipeDirection | null {
  if (!Number.isFinite(dx) || !Number.isFinite(dy) || !Number.isFinite(threshold) || threshold < 0) return null;
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax < threshold && ay < threshold) return null;
  if (ax > ay) return dx > 0 ? "right" : "left";
  if (ay > ax) return dy > 0 ? "down" : "up";
  return null;
}
