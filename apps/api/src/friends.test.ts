import test from 'node:test';
import assert from 'node:assert/strict';
import { eq } from 'drizzle-orm';
import { blocks, friendships, profiles } from './db/schema.js';
import { testApp } from './test/helpers.js';

type T = Awaited<ReturnType<typeof testApp>>;

/** Pessoa com perfil e apelido, pronta para ser encontrada. */
const person = async (t: T, handle: string, displayName = handle) => {
  const m = await t.member();
  await t.call('/v1/me', { token: m.token, method: 'PATCH', body: { handle, displayName } });
  return m;
};
const ask = (t: T, from: { token: string }, to: { id: string }) => t.call('/v1/friend-requests', { token: from.token, body: { userId: to.id } });
const befriend = async (t: T, a: { token: string; id: string }, b: { token: string; id: string }) => {
  const r = await ask(t, a, b);
  await t.call(`/v1/friend-requests/${r.body.friendship.id}/accept`, { token: b.token, method: 'POST', body: {} });
};

test('pedir amizade: só quem recebeu aceita, e depois os dois se enxergam como amigos', async () => {
  const t = await testApp();
  const ana = await person(t, 'ana_c');
  const bia = await person(t, 'bia_c');
  const sent = await ask(t, ana, bia);
  assert.equal(sent.status, 201);
  assert.equal(sent.body.accepted, false);
  const id = sent.body.friendship.id;
  assert.equal((await t.call('/v1/me/friend-requests', { token: bia.token })).body.requests[0].handle, 'ana_c');
  assert.equal((await t.call('/v1/me/friend-requests?direction=outgoing', { token: ana.token })).body.requests[0].handle, 'bia_c');
  assert.equal((await t.call('/v1/me/friend-requests', { token: ana.token })).body.requests.length, 0);
  assert.equal((await t.call('/v1/users/bia_c', { token: ana.token })).body.relation, 'request_sent');
  assert.equal((await t.call('/v1/users/ana_c', { token: bia.token })).body.relation, 'request_received');
  // quem pediu não pode aceitar o próprio pedido; um terceiro também não
  assert.equal((await t.call(`/v1/friend-requests/${id}/accept`, { token: ana.token, method: 'POST', body: {} })).status, 404);
  const cris = await person(t, 'cris_c');
  assert.equal((await t.call(`/v1/friend-requests/${id}/accept`, { token: cris.token, method: 'POST', body: {} })).status, 404);
  assert.equal((await t.call(`/v1/friend-requests/${id}/accept`, { token: bia.token, method: 'POST', body: {} })).status, 200);
  assert.deepEqual((await t.call('/v1/me/friends', { token: ana.token })).body.friends.map((f: { handle: string }) => f.handle), ['bia_c']);
  assert.deepEqual((await t.call('/v1/me/friends', { token: bia.token })).body.friends.map((f: { handle: string }) => f.handle), ['ana_c']);
  assert.equal((await t.call('/v1/users/bia_c', { token: ana.token })).body.relation, 'friends');
  assert.equal((await t.call('/v1/me/friends', { token: cris.token })).body.friends.length, 0);
  await t.close();
});

test('pedidos repetidos, para si mesmo ou para quem não existe são recusados', async () => {
  const t = await testApp();
  const ana = await person(t, 'ana_c');
  const bia = await person(t, 'bia_c');
  assert.equal((await ask(t, ana, ana)).status, 400);
  assert.equal((await ask(t, ana, { id: '00000000-0000-4000-8000-000000000000' })).status, 404);
  assert.equal((await t.call('/v1/friend-requests', { token: ana.token, body: { userId: 'nao-e-uuid' } })).status, 400);
  assert.equal((await ask(t, ana, bia)).status, 201);
  assert.equal((await ask(t, ana, bia)).body.error.code, 'already_requested');
  assert.equal((await t.handle.db.select().from(friendships)).length, 1); // um pedido repetido não cria outra linha
  await t.close();
});

test('se a outra pessoa já tinha pedido, o pedido de volta vira amizade na hora', async () => {
  const t = await testApp();
  const ana = await person(t, 'ana_c');
  const bia = await person(t, 'bia_c');
  await ask(t, ana, bia);
  const back = await ask(t, bia, ana);
  assert.equal(back.status, 200);
  assert.equal(back.body.accepted, true);
  assert.equal((await t.call('/v1/users/ana_c', { token: bia.token })).body.relation, 'friends');
  assert.equal((await ask(t, ana, bia)).body.error.code, 'already_friends');
  await t.close();
});

test('recusar, cancelar e desfazer amizade apagam a linha, e dá para pedir de novo', async () => {
  const t = await testApp();
  const ana = await person(t, 'ana_c');
  const bia = await person(t, 'bia_c');
  const cris = await person(t, 'cris_c');
  const first = (await ask(t, ana, bia)).body.friendship.id;
  assert.equal((await t.call(`/v1/friend-requests/${first}`, { token: cris.token, method: 'DELETE' })).status, 404); // terceiro
  assert.equal((await t.call(`/v1/friend-requests/${first}`, { token: bia.token, method: 'DELETE' })).status, 204); // recusa
  const second = (await ask(t, ana, bia)).body.friendship.id;
  assert.equal((await t.call(`/v1/friend-requests/${second}`, { token: ana.token, method: 'DELETE' })).status, 204); // cancela
  await befriend(t, ana, bia);
  assert.equal((await t.call(`/v1/friends/${ana.id}`, { token: bia.token, method: 'DELETE' })).status, 204);
  assert.equal((await t.call(`/v1/friends/${ana.id}`, { token: bia.token, method: 'DELETE' })).status, 404);
  assert.equal((await t.call('/v1/me/friends', { token: ana.token })).body.friends.length, 0);
  assert.equal((await ask(t, ana, bia)).status, 201);
  await t.close();
});

test('bloquear desfaz a amizade e a pessoa some dos dois lados; desbloquear traz de volta', async () => {
  const t = await testApp();
  const ana = await person(t, 'ana_c');
  const bia = await person(t, 'bia_c');
  await befriend(t, ana, bia);
  assert.equal((await t.call('/v1/blocks', { token: ana.token, body: { userId: bia.id } })).status, 204);
  assert.equal((await t.handle.db.select().from(friendships)).length, 0);
  for (const [who, other, handle] of [[ana, bia, 'bia_c'], [bia, ana, 'ana_c']] as const) {
    assert.equal((await t.call(`/v1/users/${handle}`, { token: who.token })).status, 404);
    assert.equal((await t.call('/v1/users/search?q=' + handle.slice(0, 3), { token: who.token })).body.users.length, 0);
    assert.equal((await ask(t, who, other)).status, 404);
  }
  assert.equal((await t.call('/v1/me/blocks', { token: ana.token })).body.blocked[0].handle, 'bia_c');
  assert.equal((await t.call('/v1/me/blocks', { token: bia.token })).body.blocked.length, 0);
  assert.equal((await t.call(`/v1/blocks/${bia.id}`, { token: ana.token, method: 'DELETE' })).status, 204);
  assert.equal((await t.call('/v1/users/bia_c', { token: ana.token })).status, 200);
  assert.equal((await t.call('/v1/blocks', { token: ana.token, body: { userId: ana.id } })).status, 400);
  await t.close();
});

test('busca: começo do apelido, 2 letras no mínimo, sem curingas e sem expor quem não deve', async () => {
  const t = await testApp();
  const me = await person(t, 'maria');
  await person(t, 'marcos');
  await person(t, 'a_b');
  await person(t, 'axb');
  const banned = await person(t, 'marta');
  await t.handle.db.update(profiles).set({ bannedAt: new Date() }).where(eq(profiles.id, banned.id));
  const semApelido = await t.member();
  const q = async (s: string) => t.call(`/v1/users/search?q=${encodeURIComponent(s)}`, { token: me.token });
  assert.deepEqual((await q('mar')).body.users.map((u: { handle: string }) => u.handle), ['marcos']); // sem mim, sem banida
  assert.equal((await q('m')).status, 400);
  assert.equal((await q('ma%')).status, 400);
  assert.deepEqual((await q('a_')).body.users.map((u: { handle: string }) => u.handle), ['a_b']); // o _ não é curinga
  const found = (await q('mar')).body.users[0];
  assert.deepEqual(Object.keys(found).sort(), ['avatarPath', 'displayName', 'handle', 'id']);
  assert.equal((await t.call('/v1/users/search?q=zz', { token: semApelido.token })).body.users.length, 0);
  await t.close();
});

test('perfil público: sem e-mail, cafés só se a pessoa deixou, e o próprio perfil é "self"', async () => {
  const t = await testApp();
  const ana = await person(t, 'ana_c', 'Ana');
  const bia = await person(t, 'bia_c', 'Bia');
  await t.call('/v1/me/prefs', { token: bia.token, method: 'PATCH', body: { favoriteCoffees: ['espresso'], roast: 'escura' } });
  const hidden = await t.call('/v1/users/bia_c', { token: ana.token });
  assert.equal(hidden.status, 200);
  assert.equal(hidden.body.profile.displayName, 'Bia');
  assert.equal(hidden.body.prefs, null);
  assert.equal('email' in hidden.body.profile, false);
  assert.equal('birthDate' in hidden.body.profile, false);
  assert.equal(hidden.body.relation, 'none');
  await t.call('/v1/me/privacy', { token: bia.token, method: 'PATCH', body: { showCoffeePrefs: true } });
  assert.deepEqual((await t.call('/v1/users/bia_c', { token: ana.token })).body.prefs.favoriteCoffees, ['espresso']);
  assert.equal((await t.call('/v1/users/ana_c', { token: ana.token })).body.relation, 'self');
  assert.equal((await t.call('/v1/users/nao_existe', { token: ana.token })).status, 404);
  assert.equal((await t.call('/v1/users/Ana%20Maria', { token: ana.token })).status, 400);
  await t.handle.db.update(profiles).set({ bannedAt: new Date() }).where(eq(profiles.id, bia.id));
  assert.equal((await t.call('/v1/users/bia_c', { token: ana.token })).status, 404);
  await t.close();
});

test('há um limite de pedidos sem resposta por pessoa', async () => {
  const t = await testApp();
  const ana = await person(t, 'ana_c');
  for (let i = 0; i < 50; i++) {
    const other = await t.member();
    assert.equal((await ask(t, ana, other)).status, 201);
  }
  assert.equal((await ask(t, ana, await t.member())).status, 429);
  await t.close();
});

test('excluir a conta apaga amizades e bloqueios dela', async () => {
  const t = await testApp();
  const ana = await person(t, 'ana_c');
  const bia = await person(t, 'bia_c');
  const cris = await person(t, 'cris_c');
  await befriend(t, ana, bia);
  await t.call('/v1/blocks', { token: ana.token, body: { userId: cris.id } });
  assert.equal((await t.call('/v1/me', { token: ana.token, method: 'DELETE' })).status, 204);
  assert.equal((await t.handle.db.select().from(friendships)).length, 0);
  assert.equal((await t.handle.db.select().from(blocks)).length, 0);
  assert.equal((await t.call('/v1/me/friends', { token: bia.token })).body.friends.length, 0);
  await t.close();
});

test('sem login ou sem perfil, nada de amizade', async () => {
  const t = await testApp();
  const ghost = await t.user();
  for (const path of ['/v1/me/friends', '/v1/me/friend-requests', '/v1/me/blocks', '/v1/users/search?q=ab', '/v1/users/alguem']) {
    assert.equal((await t.call(path)).status, 401);
    assert.equal((await t.call(path, { token: ghost.token })).status, 404);
  }
  assert.equal((await t.call('/v1/friend-requests', { token: ghost.token, body: { userId: ghost.id } })).status, 404);
  await t.close();
});
