import test from 'node:test';
import assert from 'node:assert/strict';
import { FEED_POLL_MS, CHAT_POLL_MS, CHAT_LIST_POLL_MS } from '../lib/social-polling.ts';

test('el sondeo programado de 50 personas durante ocho horas deja margen en el plan gratis', () => {
  const activeUsers=50;
  const activeMs=8*60*60*1000;
  const scheduledRequests=activeUsers*activeMs/FEED_POLL_MS+activeUsers*activeMs/CHAT_POLL_MS;
  assert.ok(scheduledRequests<80_000);
  assert.ok(CHAT_POLL_MS<FEED_POLL_MS);
  assert.ok(CHAT_LIST_POLL_MS>=FEED_POLL_MS);
});
