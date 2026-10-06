import test from 'node:test';
import assert from 'node:assert/strict';
import { canApplySocialRefresh } from '../lib/refresh-order.ts';

test('una respuesta anterior no reemplaza una actualización social más reciente', () => {
  assert.equal(canApplySocialRefresh('cuenta-a', 'cuenta-a', 2, 2), true);
  assert.equal(canApplySocialRefresh('cuenta-a', 'cuenta-a', 1, 2), false);
});

test('una respuesta de otra cuenta no se aplica tras cambiar de sesión', () => {
  assert.equal(canApplySocialRefresh('cuenta-a', 'cuenta-b', 3, 0), false);
  assert.equal(canApplySocialRefresh('cuenta-b', 'cuenta-b', 1, 0), true);
});
