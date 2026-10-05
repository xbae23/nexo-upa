import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import worker from './worker.js';

function fixture() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys=ON');
  // Same permanent account/session/profile columns used by the separate login Worker.
  sqlite.exec(`CREATE TABLE usuarios(id TEXT PRIMARY KEY, usuario TEXT UNIQUE, correo TEXT UNIQUE, creado TEXT DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE sesiones(token_hash TEXT PRIMARY KEY, usuario_id TEXT NOT NULL, vence INTEGER NOT NULL);
    CREATE TABLE perfiles_nexo(usuario_id TEXT PRIMARY KEY, nombre TEXT NOT NULL, alias TEXT UNIQUE,
      carrera TEXT DEFAULT '', biografia TEXT DEFAULT '', nota TEXT DEFAULT '', telefono TEXT DEFAULT '',
      actualizado TEXT DEFAULT CURRENT_TIMESTAMP);`);
  sqlite.exec(readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
  const db = {
    prepare(sql) {
      let args = [];
      const statement = sqlite.prepare(sql);
      return {
        bind(...values) { args = values; return this; },
        first() { return statement.get(...args) || null; },
        all() { return { results: statement.all(...args) }; },
        run() { return { meta: { changes: statement.run(...args).changes } }; }
      };
    },
    async batch(items) { return Promise.all(items.map(item => item.run())); }
  };
  const objects = new Map();
  const media = {
    async put(key, bytes) { objects.set(key, bytes); },
    async get(key) { const bytes = objects.get(key); return bytes ? { body: bytes } : null; },
    async delete(key) { objects.delete(key); }
  };
  const env = { DB: db, MEDIA: media, ALLOWED_ORIGINS: 'https://xbae23.github.io' };
  function user(id, alias) {
    const token = id.repeat(64);
    const hash = createHash('sha256').update(token).digest('hex');
    sqlite.prepare('INSERT INTO usuarios(id,usuario,correo) VALUES (?,?,?)')
      .run(crypto.randomUUID(), alias, `${alias}@example.invalid`);
    const row = sqlite.prepare('SELECT id FROM usuarios WHERE usuario=?').get(alias);
    sqlite.prepare('INSERT INTO perfiles_nexo(usuario_id,nombre,alias) VALUES (?,?,?)')
      .run(row.id, alias.toUpperCase(), alias);
    sqlite.prepare('INSERT INTO sesiones(token_hash,usuario_id,vence) VALUES (?,?,?)')
      .run(hash, row.id, Date.now() + 10 * 86_400_000);
    return { id: row.id, token };
  }
  const a = user('a', 'ana'), b = user('b', 'bea'), c = user('c', 'cora');
  async function call(path, actor = a, method = 'GET', data, headers = {}) {
    const request = new Request(`https://nexo-social.example.test${path}`, {
      method,
      headers: { Origin: 'https://xbae23.github.io', Authorization: `Bearer ${actor.token}`,
        ...(data && !(data instanceof Uint8Array) ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: data instanceof Uint8Array ? data : data === undefined ? undefined : JSON.stringify(data),
      duplex: 'half'
    });
    const result = await worker.fetch(request, env);
    return { status: result.status, data: result.headers.get('Content-Type')?.includes('json') ? await result.json() : await result.arrayBuffer() };
  }
  return { sqlite, env, objects, a, b, c, call };
}

test('las cuentas existentes comparten directorio sin publicar correos', async () => {
  const { call } = fixture();
  const result = await call('/v1/bootstrap');
  assert.equal(result.status, 200);
  assert.equal(result.data.people.length, 3);
  assert.equal(result.data.people.some(person => Object.hasOwn(person, 'correo')), false);
  assert.deepEqual(result.data.posts, []);
});

test('publicaciones, Up, comentarios y seguimientos son visibles entre cuentas', async () => {
  const { a, b, call } = fixture();
  const created = await call('/v1/posts', a, 'POST', { kind: 'post', title: 'Encuentro', body: 'Hola UPA' });
  assert.equal(created.status, 201);
  const id = created.data.id;
  assert.equal((await call('/v1/bootstrap', b)).data.posts[0].body, 'Hola UPA');
  assert.equal((await call(`/v1/posts/${id}/up`, b, 'PUT')).status, 200);
  assert.equal((await call(`/v1/posts/${id}/comments`, b, 'POST', { text: 'Voy también' })).status, 201);
  assert.equal((await call(`/v1/follows/${a.id}`, b, 'PUT')).status, 200);
  const forAna = (await call('/v1/bootstrap', a)).data;
  assert.equal(forAna.posts[0].ups, 1);
  assert.equal(forAna.posts[0].comments[0].text, 'Voy también');
  assert.ok(forAna.notifications.length >= 2);
  assert.equal((await call('/v1/bootstrap', b)).data.following[0], a.id);
});

test('fotos en R2, mensajes privados y vencimiento no borran cuentas ni perfiles', async () => {
  const { sqlite, objects, a, b, c, call, env } = fixture();
  const picture = new Uint8Array([137, 80, 78, 71, 1, 2, 3]);
  const uploaded = await call('/v1/media', a, 'POST', picture, { 'X-Media-Purpose': 'post',
    'X-File-Name': 'campus.png', 'Content-Type': 'image/png' });
  assert.equal(uploaded.status, 201);
  const post = await call('/v1/posts', a, 'POST', { kind: 'post', body: 'Foto', mediaId: uploaded.data.id });
  assert.equal(post.status, 201);
  const feed = (await call('/v1/bootstrap', b)).data.posts;
  assert.match(feed[0].image, /\/v1\/media\//);
  assert.equal((await call(`/v1/media/${uploaded.data.id}`, b)).status, 200);
  const attachment = await call('/v1/media', b, 'POST', picture, { 'X-Media-Purpose': 'message',
    'X-File-Name': 'nota.png', 'Content-Type': 'image/png' });
  const sent = await call('/v1/messages', b, 'POST', { recipientId: a.id, text: 'Mira',
    mediaId: attachment.data.id, fileName: 'nota.png' });
  assert.equal(sent.status, 201);
  await call('/v1/bootstrap', b);
  assert.equal((await call('/v1/conversations', a)).data.conversations[0].messages[0].text, 'Mira');
  assert.equal((await call('/v1/conversations', a)).data.conversations[0].active, true);
  assert.equal((await call(`/v1/media/${attachment.data.id}`, c)).status, 403);
  assert.equal((await call(`/v1/media/${attachment.data.id}`, a)).status, 200);
  const oldNow = Date.now;
  try {
    const future = oldNow() + 3 * 86_400_000 + 1;
    Date.now = () => future;
    assert.deepEqual((await call('/v1/bootstrap', a)).data.posts, []);
    assert.deepEqual((await call('/v1/conversations', a)).data.conversations, []);
    await worker.scheduled({}, env);
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM usuarios').get().n, 3);
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM perfiles_nexo').get().n, 3);
    assert.equal(objects.size, 0);
  } finally { Date.now = oldNow; }
});

test('Notify se limita a dos por día incluso si la app no lo controla', async () => {
  const { call } = fixture();
  assert.equal((await call('/v1/posts', undefined, 'POST', { kind: 'notify', body: 'Uno' })).status, 201);
  assert.equal((await call('/v1/posts', undefined, 'POST', { kind: 'notify', body: 'Dos' })).status, 201);
  assert.equal((await call('/v1/posts', undefined, 'POST', { kind: 'notify', body: 'Tres' })).status, 429);
});

test('post normal avisa a seguidores; Reporte avisa a toda la comunidad', async () => {
  const { a, b, c, call } = fixture();
  await call(`/v1/follows/${a.id}`, b, 'PUT');
  await call('/v1/posts', a, 'POST', { kind: 'post', body: 'Solo mis amigos reciben aviso' });
  const forBea = (await call('/v1/bootstrap', b)).data.notifications;
  const forCora = (await call('/v1/bootstrap', c)).data.notifications;
  assert.ok(forBea.some(item => item.text.includes('publicó algo nuevo')));
  assert.equal(forCora.some(item => item.text.includes('publicó algo nuevo')), false);
  await call('/v1/posts', a, 'POST', { kind: 'reporte', body: 'Se encontró una credencial' });
  assert.ok((await call('/v1/bootstrap', c)).data.notifications.some(item => item.text.includes('Reporte')));
});
