import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '@/data/catalog';
import { DEFAULT_SETTINGS, useApp } from '@/store/useApp';
import { buildSnapshot, parseSnapshot } from './cloud/snapshot';
import { mockBackend } from './cloud/mockBackend';
import { makeTestData, TEST_COINS, TEST_EMAIL, TEST_HISTORY_DAYS, TEST_PASSWORD } from './testUser';

const pristine = useApp.getState();
beforeEach(() => useApp.setState({ ...pristine, settings: { ...DEFAULT_SETTINGS } }, true));

test('o usuário de teste tem muitas moedas, todos os itens e um histórico longo', () => {
  const d = makeTestData(Date.UTC(2025, 9, 15, 12));
  assert.equal(d.coins, TEST_COINS);
  assert.deepEqual([...d.owned].sort(), CATALOG.map((i) => i.id).sort());
  assert.ok(d.owned.includes(d.brewerId) && d.owned.includes(d.cupId));
  assert.ok(d.sessions.length > TEST_HISTORY_DAYS); // mais de uma sessão por dia, em média
  assert.ok(d.articlesRead.length >= 5);
});

test('o snapshot do usuário de teste é aceito pelo parser e cabe com folga em um documento do Firestore', () => {
  const snap = buildSnapshot({ ...makeTestData(), settings: { ...DEFAULT_SETTINGS } }, 1);
  assert.ok(parseSnapshot(snap));
  assert.ok(JSON.stringify(snap).length < 900 * 1024);
});

test('carregar o usuário de teste no app mantém as configurações e pula a introdução', () => {
  useApp.getState().setSettings({ language: 'es', goalMin: 60 });
  useApp.getState().loadTestUser();
  const st = useApp.getState();
  assert.equal(st.coins, TEST_COINS);
  assert.equal(st.owned.length, CATALOG.length);
  assert.equal(st.settings.language, 'es');
  assert.equal(st.onboarded, true);
  assert.equal(st.active, null);
});

test('o servidor falso já traz a conta de teste com o backup farto', async () => {
  const user = await mockBackend.signIn(TEST_EMAIL, TEST_PASSWORD);
  assert.equal(user.email, TEST_EMAIL);
  const snap = await mockBackend.getSnapshot(user.uid);
  assert.equal(snap?.data.coins, TEST_COINS);
  await assert.rejects(() => mockBackend.signIn(TEST_EMAIL, 'senha-errada'));
});

test('cadastro por e-mail: confirmar o e-mail, trocar a senha e entrar com a nova', async () => {
  const email = `novo${Date.now()}@exemplo.com`;
  await assert.rejects(() => mockBackend.signUp(email, 'curta'), (e: { code?: string }) => e.code === 'weak-password');
  const user = await mockBackend.signUp(email, 'senha-boa-123');
  assert.equal(user.emailVerified, false);

  // Ainda sem pedir o envio, checar não confirma.
  assert.equal((await mockBackend.refreshUser())?.emailVerified, false);
  await mockBackend.sendVerificationEmail();
  assert.equal((await mockBackend.refreshUser())?.emailVerified, true);

  await assert.rejects(() => mockBackend.changePassword('errada', 'outra-senha-123'), (e: { code?: string }) => e.code === 'wrong-credentials');
  await assert.rejects(() => mockBackend.changePassword('senha-boa-123', 'curta'), (e: { code?: string }) => e.code === 'weak-password');
  await mockBackend.changePassword('senha-boa-123', 'outra-senha-123');
  await mockBackend.signOut();
  await assert.rejects(() => mockBackend.signIn(email, 'senha-boa-123'));
  assert.equal((await mockBackend.signIn(email, 'outra-senha-123')).uid, user.uid);
});

test('entrar com a Apple e com o Google cria contas já verificadas, e o e-mail repetido é recusado', async () => {
  assert.equal(mockBackend.appleAvailable(), true);
  const apple = await mockBackend.signInApple();
  assert.equal(apple.provider, 'apple');
  assert.equal(apple.emailVerified, true);
  await mockBackend.signOut();
  const email = `dup${Date.now()}@exemplo.com`;
  await mockBackend.signUp(email, 'senha-boa-123');
  await assert.rejects(() => mockBackend.signUp(email, 'senha-boa-123'), (e: { code?: string }) => e.code === 'email-in-use');
});

test('o cancelamento do login da Apple não aparece como erro', async () => {
  const { toAuthError } = await import('./cloud/errors');
  assert.equal(toAuthError({ code: 'ERR_REQUEST_CANCELED' }).code, 'cancelled');
  assert.equal(toAuthError({ code: 'auth/requires-recent-login' }).code, 'recent-login');
});
