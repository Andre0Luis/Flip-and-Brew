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
