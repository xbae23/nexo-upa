import { test } from "node:test";
import assert from "node:assert/strict";
import {
  clampZoom,
  distance,
  clampOffset,
  zoomAtPoint,
  isDoubleTap,
  classifySwipe,
} from "../lib/gesture-math.ts";

test("clampZoom stays between 1x and 4x", () => {
  assert.equal(clampZoom(0.5), 1);
  assert.equal(clampZoom(2.5), 2.5);
  assert.equal(clampZoom(9), 4);
  assert.equal(clampZoom(Number.NaN), 1);
});

test("distance uses the two pointer positions", () => {
  assert.equal(distance({ x: 1, y: 2 }, { x: 4, y: 6 }), 5);
  assert.equal(distance({ x: 12, y: 3 }, { x: 12, y: 3 }), 0);
});

test("clampOffset centers at 1x and constrains pan at higher zoom", () => {
  const viewport = { width: 300, height: 200 };
  assert.deepEqual(clampOffset({ x: 80, y: -40 }, 1, viewport), { x: 0, y: 0 });
  assert.deepEqual(clampOffset({ x: 500, y: -500 }, 2, viewport), { x: 150, y: -100 });
  assert.deepEqual(clampOffset({ x: -200, y: 60 }, 2, viewport), { x: -150, y: 60 });
  assert.deepEqual(clampOffset({ x: Number.NaN, y: Infinity }, 4, viewport), { x: 0, y: 0 });
});

test("letterboxed photos cannot pan beyond the visible stage", () => {
  const media = { width: 360, height: 180 };
  const stage = { width: 360, height: 800 };
  assert.deepEqual(clampOffset({ x: 999, y: 999 }, 4, media, stage), { x: 540, y: 0 });
  assert.deepEqual(zoomAtPoint(1, 4, { x: 0, y: 0 }, { x: 180, y: 0 }, media, stage).offset, { x: 0, y: 0 });
});

test("zoomAtPoint preserves the touched content point and clamps its output", () => {
  const viewport = { width: 300, height: 200 };
  const zoomed = zoomAtPoint(1, 2, { x: 0, y: 0 }, { x: 225, y: 100 }, viewport);
  assert.deepEqual(zoomed, { scale: 2, offset: { x: -75, y: 0 } });
  const back = zoomAtPoint(2, 1, zoomed.offset, { x: 225, y: 100 }, viewport);
  assert.deepEqual(back, { scale: 1, offset: { x: 0, y: 0 } });
  const edge = zoomAtPoint(1, 9, { x: 0, y: 0 }, { x: 300, y: 0 }, viewport);
  assert.deepEqual(edge, { scale: 4, offset: { x: -450, y: 300 } });
});

test("isDoubleTap requires nearby taps in chronological order", () => {
  const first = { x: 20, y: 30, time: 1000 };
  assert.equal(isDoubleTap(null, { x: 21, y: 31, time: 1100 }), false);
  assert.equal(isDoubleTap(first, { x: 44, y: 30, time: 1300 }), true);
  assert.equal(isDoubleTap(first, { x: 45, y: 30, time: 1100 }), false);
  assert.equal(isDoubleTap(first, { x: 20, y: 30, time: 1301 }), false);
  assert.equal(isDoubleTap(first, { x: 20, y: 30, time: 999 }), false);
  assert.equal(isDoubleTap(first, { x: 25, y: 30, time: 1400 }, { maxDelay: 500, maxDistance: 8 }), true);
});

test("classifySwipe uses threshold and dominant axis without diagonal ambiguity", () => {
  assert.equal(classifySwipe(50, 5, 50), "right");
  assert.equal(classifySwipe(-60, -15, 50), "left");
  assert.equal(classifySwipe(8, -52, 50), "up");
  assert.equal(classifySwipe(-12, 52, 50), "down");
  assert.equal(classifySwipe(49, 0, 50), null);
  assert.equal(classifySwipe(50, 50, 50), null);
  assert.equal(classifySwipe(Number.NaN, 100, 50), null);
});
