import test from "node:test";
import assert from "node:assert/strict";
import { cameraModeAfterSwipe, captureKind, clampCameraZoom, friendlyCameraError, supportedVideoMime, videoLimitSeconds } from "../lib/camera-utils.ts";

test("Los modos respetan 25 segundos para Dump y 30 para publicaciones", () => {
  assert.equal(videoLimitSeconds("dump"), 25);
  assert.equal(videoLimitSeconds("post"), 30);
  assert.equal(videoLimitSeconds("video"), 30);
  assert.equal(videoLimitSeconds("video", "dump"), 25);
  assert.equal(captureKind("dump"), "dump");
  assert.equal(captureKind("video"), "post");
  assert.equal(captureKind("video", "dump"), "dump");
});

test("El zoom se ajusta al rango y al paso que ofrece el dispositivo", () => {
  const range = { min: 1, max: 4, step: 0.5 };
  assert.equal(clampCameraZoom(2.24, range), 2);
  assert.equal(clampCameraZoom(8, range), 4);
  assert.equal(clampCameraZoom(-1, range), 1);
  assert.equal(clampCameraZoom(Number.NaN, range), 1);
});

test("Deslizar cambia de modo sin salirse de los tres modos", () => {
  assert.equal(cameraModeAfterSwipe("post", "left"), "dump");
  assert.equal(cameraModeAfterSwipe("dump", "left"), "video");
  assert.equal(cameraModeAfterSwipe("video", "left"), "video");
  assert.equal(cameraModeAfterSwipe("post", "right"), "post");
});

test("Se usa únicamente un contenedor de video que el navegador reconozca", () => {
  assert.equal(supportedVideoMime((mime) => mime === "video/webm"), "video/webm");
  assert.equal(supportedVideoMime(() => false), null);
});

test("Los errores de permisos y hardware no muestran mensajes técnicos", () => {
  assert.match(friendlyCameraError(new DOMException("", "NotAllowedError")), /permiso/);
  assert.match(friendlyCameraError(new DOMException("", "NotFoundError")), /cámara/);
});
