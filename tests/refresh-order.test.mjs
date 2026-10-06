import test from 'node:test';
import assert from 'node:assert/strict';
import { canApplySocialRefresh, mergeConversationPreferences, refreshAfterAcceptedWrite } from '../lib/refresh-order.ts';

test('una respuesta anterior no reemplaza una actualización social más reciente', () => {
  assert.equal(canApplySocialRefresh('cuenta-a', 'cuenta-a', 2, 2), true);
  assert.equal(canApplySocialRefresh('cuenta-a', 'cuenta-a', 1, 2), false);
});

test('una respuesta de otra cuenta no se aplica tras cambiar de sesión', () => {
  assert.equal(canApplySocialRefresh('cuenta-a', 'cuenta-b', 3, 0), false);
  assert.equal(canApplySocialRefresh('cuenta-b', 'cuenta-b', 1, 0), true);
});

test('el sondeo ligero actualiza mensajes sin perder tema ni fijado local', () => {
  const original = [{ id: 'chat-1', theme: 'gris', pinned: true, messages: [{ id: 'viejo' }] }];
  const remote = [{ id: 'chat-1', theme: 'verde', messages: [{ id: 'nuevo' }] }];
  const merged = mergeConversationPreferences(remote, original);
  assert.equal(merged[0].theme, 'gris');
  assert.equal(merged[0].pinned, true);
  assert.deepEqual(merged[0].messages, [{ id: 'nuevo' }]);
});

test('una escritura aceptada no se presenta como fallo si solo falla la lectura posterior', async () => {
  let saved=0;
  const refreshed=await refreshAfterAcceptedWrite(async()=>{throw new Error('sin red');},()=>{saved++;});
  assert.equal(refreshed,false);
  assert.equal(saved,1);
  assert.equal(await refreshAfterAcceptedWrite(async()=>{},()=>{saved++;}),true);
  assert.equal(saved,1);
});
