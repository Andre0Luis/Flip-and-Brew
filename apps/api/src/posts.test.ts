import test from 'node:test';
import assert from 'node:assert/strict';
import { isoWeek } from './shared.js';
import { testApp } from './test/helpers.js';

type T = Awaited<ReturnType<typeof testApp>>;

async function friends(t: T) {
  const a = await t.member('ana@exemplo.com');
  const b = await t.member('bia@exemplo.com');
  const c = await t.member('caio@exemplo.com'); // não é amigo de ninguém
  await t.call('/v1/me', { token: a.token, method: 'PATCH', body: { handle: 'ana', displayName: 'Ana' } });
  await t.call('/v1/me', { token: b.token, method: 'PATCH', body: { handle: 'bia', displayName: 'Bia' } });
  await t.call('/v1/me', { token: c.token, method: 'PATCH', body: { handle: 'caio' } });
  const req = await t.call('/v1/friend-requests', { token: a.token, body: { userId: b.id } });
  await t.call(`/v1/friend-requests/${req.body.friendship.id}/accept`, { token: b.token, method: 'POST' });
  return { a, b, c };
}

test('fotos: até 3 links de envio, no caminho da própria pessoa', async () => {
  const t = await testApp();
  const { a } = await friends(t);
  const up = await t.call('/v1/posts/uploads', { token: a.token, body: { count: 3 } });
  assert.equal(up.status, 200);
  assert.equal(up.body.uploads.length, 3);
  for (const u of up.body.uploads) {
    assert.match(u.path, new RegExp(`^${a.id}/[0-9a-f-]{36}\\.jpg$`));
    assert.match(u.url, /^https:\/\/storage\.local\/upload\//);
  }
  assert.equal((await t.call('/v1/posts/uploads', { token: a.token, body: { count: 4 } })).status, 400);
  await t.close();
});

test('post: título obrigatório, no máximo 3 fotos e só fotos próprias', async () => {
  const t = await testApp();
  const { a, b } = await friends(t);
  const paths = (await t.call('/v1/posts/uploads', { token: a.token, body: { count: 2 } })).body.uploads.map((u: { path: string }) => u.path);
  const ok = await t.call('/v1/posts', { token: a.token, body: { title: ' Meu V60 ', caption: 'Café da manhã', images: paths } });
  assert.equal(ok.status, 201);
  assert.equal(ok.body.post.title, 'Meu V60');
  assert.equal(ok.body.post.images.length, 2);
  assert.equal(ok.body.post.mine, true);
  assert.equal((await t.call('/v1/posts', { token: a.token, body: { title: '' } })).status, 400);
  const four = Array.from({ length: 4 }, () => `${a.id}/${crypto.randomUUID()}.jpg`);
  assert.equal((await t.call('/v1/posts', { token: a.token, body: { title: 'x', images: four } })).status, 400);
  const other = `${b.id}/${crypto.randomUUID()}.jpg`;
  assert.equal((await t.call('/v1/posts', { token: a.token, body: { title: 'x', images: [other] } })).status, 400);
  assert.equal((await t.call('/v1/posts', { token: a.token, body: { title: 'só texto' } })).status, 201);
  await t.close();
});

test('feed: o autor e os amigos veem; quem não é amigo ou foi bloqueado, não', async () => {
  const t = await testApp();
  const { a, b, c } = await friends(t);
  const post = (await t.call('/v1/posts', { token: a.token, body: { title: 'Prensa francesa' } })).body.post;
  assert.deepEqual((await t.call('/v1/feed', { token: a.token })).body.posts.map((p: { id: string }) => p.id), [post.id]);
  const feedB = (await t.call('/v1/feed', { token: b.token })).body;
  assert.equal(feedB.posts.length, 1);
  assert.equal(feedB.posts[0].author.handle, 'ana');
  assert.equal(feedB.posts[0].mine, false);
  assert.equal((await t.call('/v1/feed', { token: c.token })).body.posts.length, 0);
  assert.equal((await t.call(`/v1/posts/${post.id}/comments`, { token: c.token })).status, 404);
  await t.call('/v1/blocks', { token: b.token, body: { userId: a.id } });
  assert.equal((await t.call('/v1/feed', { token: b.token })).body.posts.length, 0);
  await t.close();
});

test('curtir avisa o autor uma vez; descurtir apaga o aviso não lido', async () => {
  const t = await testApp();
  const { a, b } = await friends(t);
  const post = (await t.call('/v1/posts', { token: a.token, body: { title: 'Moka' } })).body.post;
  assert.equal((await t.call(`/v1/posts/${post.id}/like`, { token: b.token, method: 'POST' })).status, 204);
  assert.equal((await t.call(`/v1/posts/${post.id}/like`, { token: b.token, method: 'POST' })).status, 204); // idempotente
  const card = (await t.call('/v1/feed', { token: b.token })).body.posts[0];
  assert.equal(card.likeCount, 1);
  assert.equal(card.likedByMe, true);
  let n = (await t.call('/v1/me/notifications', { token: a.token })).body;
  assert.equal(n.unread, 1);
  assert.equal(n.notifications[0].kind, 'like');
  assert.equal(n.notifications[0].actor.handle, 'bia');
  assert.equal(n.notifications[0].postTitle, 'Moka');
  await t.call(`/v1/posts/${post.id}/like`, { token: b.token, method: 'DELETE' });
  n = (await t.call('/v1/me/notifications', { token: a.token })).body;
  assert.equal(n.notifications.length, 0);
  assert.equal((await t.call('/v1/feed', { token: a.token })).body.posts[0].likeCount, 0);
  // Curtir o próprio post não gera aviso.
  await t.call(`/v1/posts/${post.id}/like`, { token: a.token, method: 'POST' });
  assert.equal((await t.call('/v1/me/notifications', { token: a.token })).body.notifications.length, 0);
  await t.close();
});

test('comentários: amigos comentam, o autor é avisado, e só quem pode apaga', async () => {
  const t = await testApp();
  const { a, b, c } = await friends(t);
  const post = (await t.call('/v1/posts', { token: a.token, body: { title: 'AeroPress' } })).body.post;
  const made = await t.call(`/v1/posts/${post.id}/comments`, { token: b.token, body: { body: '  Que lindo!  ' } });
  assert.equal(made.status, 201);
  assert.equal(made.body.comment.body, 'Que lindo!');
  assert.equal((await t.call(`/v1/posts/${post.id}/comments`, { token: b.token, body: { body: '' } })).status, 400);
  const list = (await t.call(`/v1/posts/${post.id}/comments`, { token: a.token })).body.comments;
  assert.equal(list.length, 1);
  assert.equal(list[0].id, made.body.comment.id); // o id é do comentário, não da pessoa
  assert.equal(list[0].author.id, b.id);
  assert.equal(list[0].author.handle, 'bia');
  assert.equal(list[0].mine, false);
  assert.equal((await t.call('/v1/feed', { token: a.token })).body.posts[0].commentCount, 1);
  const n = (await t.call('/v1/me/notifications', { token: a.token })).body;
  assert.equal(n.notifications[0].kind, 'comment');
  assert.equal((await t.call('/v1/me/notifications/read', { token: a.token, method: 'POST' })).status, 204);
  assert.equal((await t.call('/v1/me/notifications', { token: a.token })).body.unread, 0);
  assert.equal((await t.call(`/v1/comments/${made.body.comment.id}`, { token: c.token, method: 'DELETE' })).status, 404);
  assert.equal((await t.call(`/v1/comments/${made.body.comment.id}`, { token: a.token, method: 'DELETE' })).status, 204); // dono do post
  await t.close();
});

test('apagar o post (e a conta) remove as fotos do armazenamento', async () => {
  const t = await testApp();
  const { a, b } = await friends(t);
  const paths = (await t.call('/v1/posts/uploads', { token: a.token, body: { count: 1 } })).body.uploads.map((u: { path: string }) => u.path);
  const post = (await t.call('/v1/posts', { token: a.token, body: { title: 'Sifão', images: paths } })).body.post;
  assert.equal((await t.call(`/v1/posts/${post.id}`, { token: b.token, method: 'DELETE' })).status, 403);
  assert.equal((await t.call(`/v1/posts/${post.id}`, { token: a.token, method: 'DELETE' })).status, 204);
  assert.deepEqual(t.storage.removed, paths);
  const more = (await t.call('/v1/posts/uploads', { token: a.token, body: { count: 1 } })).body.uploads.map((u: { path: string }) => u.path);
  await t.call('/v1/posts', { token: a.token, body: { title: 'Outro', images: more } });
  assert.equal((await t.call('/v1/me', { token: a.token, method: 'DELETE' })).status, 204);
  assert.deepEqual(t.storage.removed, [...paths, ...more]);
  await t.close();
});

test('ranking: entre amigos todos aparecem; o geral só com quem ligou; só a semana atual', async () => {
  const t = await testApp();
  const { a, b, c } = await friends(t);
  const week = isoWeek(Date.now());
  assert.equal((await t.call('/v1/me/week', { token: a.token, method: 'PUT', body: { week, offlineMinutes: 300, cups: 6 } })).status, 204);
  await t.call('/v1/me/week', { token: b.token, method: 'PUT', body: { week, offlineMinutes: 500, cups: 9 } });
  await t.call('/v1/me/week', { token: c.token, method: 'PUT', body: { week, offlineMinutes: 900, cups: 20 } });
  // Atualizar substitui o valor da semana.
  await t.call('/v1/me/week', { token: a.token, method: 'PUT', body: { week, offlineMinutes: 320, cups: 7 } });
  assert.equal((await t.call('/v1/me/week', { token: a.token, method: 'PUT', body: { week: '2020-W01', offlineMinutes: 1, cups: 1 } })).status, 400);
  assert.equal((await t.call('/v1/me/week', { token: a.token, method: 'PUT', body: { week, offlineMinutes: 99999, cups: 1 } })).status, 400);

  const f = (await t.call('/v1/rankings', { token: a.token })).body;
  assert.equal(f.scope, 'friends');
  assert.deepEqual(f.entries.map((e: { person: { handle: string } }) => e.person.handle), ['bia', 'ana']); // caio não é amigo
  assert.equal(f.entries[1].me, true);
  assert.equal(f.entries[1].offlineMinutes, 320);
  assert.equal(f.entries[0].rank, 1);

  assert.equal((await t.call('/v1/rankings?scope=global', { token: a.token })).body.entries.length, 0); // ninguém ligou
  await t.call('/v1/me/privacy', { token: c.token, method: 'PATCH', body: { showInGlobalRanking: true } });
  await t.call('/v1/me/privacy', { token: a.token, method: 'PATCH', body: { showInGlobalRanking: true } });
  const g = (await t.call('/v1/rankings?scope=global', { token: b.token })).body;
  assert.deepEqual(g.entries.map((e: { person: { handle: string } }) => e.person.handle), ['caio', 'ana']);
  await t.close();
});

test('fotos: falha do armazenamento vira 502 com o status e o texto do Supabase, sem chave', async () => {
  const { supabaseStorage } = await import('./storage/supabase.js');
  const calls: string[] = [];
  const storage = supabaseStorage({
    url: 'https://x.supabase.co',
    serviceRoleKey: 'chave-secreta-de-teste-0123456789',
    fetchFn: (async (u: string) => {
      calls.push(String(u));
      return new Response(JSON.stringify({ statusCode: '403', error: 'Unauthorized', message: 'new row violates row-level security policy' }), { status: 403 });
    }) as unknown as typeof fetch,
  });
  await assert.rejects(storage.signUpload('a/b.jpg'), (e: Error) => /^storage bucket 403: .*Unauthorized/.test(e.message) && !e.message.includes('chave-secreta'));
  assert.equal(calls.length, 1);
});

test('fotos: o pedido do link de envio leva corpo (o Supabase recusa json com corpo vazio)', async () => {
  const { supabaseStorage } = await import('./storage/supabase.js');
  const bodies: Record<string, unknown> = {};
  const storage = supabaseStorage({
    url: 'https://x.supabase.co',
    serviceRoleKey: 'chave-secreta-de-teste-0123456789',
    fetchFn: (async (u: string, init?: RequestInit) => {
      bodies[String(u)] = init?.body;
      if (String(u).endsWith('/bucket')) return new Response('{}', { status: 200 });
      return new Response(JSON.stringify({ url: '/object/upload/sign/posts/a/b.jpg?token=t' }), { status: 200 });
    }) as unknown as typeof fetch,
  });
  assert.equal(await storage.signUpload('a/b.jpg'), 'https://x.supabase.co/storage/v1/object/upload/sign/posts/a/b.jpg?token=t');
  assert.equal(bodies['https://x.supabase.co/storage/v1/object/upload/sign/posts/a/b.jpg'], '{}');
});
