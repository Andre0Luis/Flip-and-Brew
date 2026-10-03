import test from 'node:test';
import assert from 'node:assert/strict';
import { applySnapshot, buildSnapshot, dataSignature, decideInitialSync, hasMeaningfulData, MAX_SESSIONS, parseSnapshot, type LocalData } from './snapshot';
import { isValidEmail, toAuthError } from './errors';
import { isFirebaseConfigured } from './config';
import { AuthError } from './types';
import type { Session } from '@/store/types';

const session = (i: number): Session => ({ id: `s${i}`, brewerId: 'v60', cupId: 'cup', startedAt: i, elapsedMs: 60_000, targetMs: 60_000, status: 'done', coins: 1, quality: 'encorpado' });
const fresh = (): LocalData => ({
  coins: 100,
  owned: ['v60', 'cup', 'x'],
  brewerId: 'v60',
  cupId: 'cup',
  sessions: [],
  checkins: [],
  practiceAccepted: null,
  practicesDone: [],
  articlesRead: [],
  settings: { goalMin: 120, language: 'pt', themeMode: 'system', autoStart: true, notifyOnDone: false, faceUpSign: 1, quickBrew: true },
});
const used = (): LocalData => ({ ...fresh(), coins: 340, sessions: [session(1), session(2)] });

test('o backup não leva configurações do aparelho', () => {
  const snap = buildSnapshot(used(), 99);
  assert.equal(snap.v, 1);
  assert.equal(snap.updatedAt, 99);
  assert.deepEqual(Object.keys(snap.data.settings).sort(), ['autoStart', 'goalMin', 'language', 'notifyOnDone', 'themeMode']);
});

test('o backup não leva campos undefined, que o Firestore rejeita', () => {
  const withUndefined = { ...fresh(), sessions: [{ ...session(1), trigger: undefined, mood: undefined }] };
  const snap = buildSnapshot(withUndefined, 1);
  assert.equal('trigger' in snap.data.sessions[0], false);
  assert.equal('mood' in snap.data.sessions[0], false);
  const hasUndefined = (v: unknown): boolean => v === undefined || (typeof v === 'object' && v !== null && Object.values(v).some(hasUndefined));
  assert.equal(hasUndefined(snap), false);
});

test('o backup guarda só as sessões mais recentes', () => {
  const many = { ...fresh(), sessions: Array.from({ length: MAX_SESSIONS + 50 }, (_, i) => session(i)) };
  const snap = buildSnapshot(many, 1);
  assert.equal(snap.data.sessions.length, MAX_SESSIONS);
  assert.equal(snap.data.sessions.at(-1)?.id, `s${MAX_SESSIONS + 49}`);
});

test('app recém-instalado não tem dados a proteger; com uso, tem', () => {
  assert.equal(hasMeaningfulData(fresh()), false);
  assert.equal(hasMeaningfulData(used()), true);
  assert.equal(hasMeaningfulData({ ...fresh(), articlesRead: ['a'] }), true);
});

test('decisão após o login', () => {
  const remote = buildSnapshot(used(), 5);
  assert.equal(decideInitialSync(fresh(), null), 'noop');
  assert.equal(decideInitialSync(used(), null), 'push');
  assert.equal(decideInitialSync(fresh(), remote), 'restore');
  assert.equal(decideInitialSync(used(), remote), 'noop'); // já iguais
  assert.equal(decideInitialSync({ ...used(), coins: 999 }, remote), 'ask'); // os dois lados têm dados diferentes
});

test('aplicar um backup troca o progresso e mantém as configurações do aparelho', () => {
  const current = { settings: { ...fresh().settings } };
  const remote = buildSnapshot({ ...used(), settings: { ...used().settings, language: 'es', goalMin: 60 } }, 7);
  const next = applySnapshot(current, remote);
  assert.equal(next.coins, 340);
  assert.equal(next.sessions.length, 2);
  assert.equal(next.settings.language, 'es');
  assert.equal(next.settings.faceUpSign, 1); // calibração do aparelho preservada
  assert.equal(next.settings.quickBrew, true);
});

test('só aceita snapshot que reconhece', () => {
  assert.ok(parseSnapshot(buildSnapshot(used(), 1)));
  assert.equal(parseSnapshot(null), null);
  assert.equal(parseSnapshot({ v: 2, updatedAt: 1, data: {} }), null);
  assert.equal(parseSnapshot({ v: 1, updatedAt: 1, data: { coins: 'x' } }), null);
});

test('a assinatura muda quando o backup muda e não muda por coisas fora dele', () => {
  const a = dataSignature(used());
  assert.equal(dataSignature({ ...used(), settings: { ...used().settings, faceUpSign: -1 } }), a);
  assert.notEqual(dataSignature({ ...used(), coins: 341 }), a);
  assert.notEqual(dataSignature({ ...used(), settings: { ...used().settings, language: 'en' } }), a);
});

test('erros do Firebase e do Google viram códigos da interface', () => {
  assert.equal(toAuthError({ code: 'auth/email-already-in-use' }).code, 'email-in-use');
  assert.equal(toAuthError({ code: 'auth/invalid-credential' }).code, 'wrong-credentials');
  assert.equal(toAuthError({ code: 'auth/network-request-failed' }).code, 'network');
  assert.equal(toAuthError({ code: 'auth/requires-recent-login' }).code, 'recent-login');
  assert.equal(toAuthError({ code: 'SIGN_IN_CANCELLED' }).code, 'cancelled');
  assert.equal(toAuthError(new Error('qualquer')).code, 'unknown');
  const own = new AuthError('too-many');
  assert.equal(toAuthError(own), own);
});

test('validação de e-mail e das chaves', () => {
  assert.equal(isValidEmail(' a@b.co '), true);
  assert.equal(isValidEmail('a@b'), false);
  assert.equal(isValidEmail('sem arroba'), false);
  assert.equal(isFirebaseConfigured({ apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' }), false);
  assert.equal(isFirebaseConfigured({ apiKey: 'k', authDomain: '', projectId: 'p', storageBucket: '', messagingSenderId: '', appId: 'a' }), true);
});

test('o check-in de energia vai e volta pelo backup, e um backup antigo sem ele ainda vale', () => {
  const withCheckin = { ...fresh(), checkins: [{ day: '2026-10-14', energy: 4, at: 1 }] };
  const snap = buildSnapshot(withCheckin, 3);
  assert.deepEqual(snap.data.checkins, [{ day: '2026-10-14', energy: 4, at: 1 }]);
  assert.equal(hasMeaningfulData(withCheckin), true);
  assert.notEqual(dataSignature(withCheckin), dataSignature(fresh()));
  assert.deepEqual(applySnapshot({ settings: fresh().settings }, snap).checkins, withCheckin.checkins);

  const old = JSON.parse(JSON.stringify(buildSnapshot(used(), 4)));
  delete old.data.checkins;
  assert.ok(parseSnapshot(old));
  assert.deepEqual(applySnapshot({ settings: fresh().settings }, old).checkins, []);
  assert.equal(parseSnapshot({ ...old, data: { ...old.data, checkins: 'x' } }), null);
});

test('o perfil vai e volta pelo backup, vazio não conta como dado e campo inválido é descartado', () => {
  const profile = { name: 'Ana', phone: '(11) 91234-5678', age: 30, roast: 'dark', flavors: ['fruity'] };
  const withProfile = { ...fresh(), profile };
  const snap = buildSnapshot(withProfile, 3);
  assert.deepEqual(snap.data.profile, profile);
  assert.equal(hasMeaningfulData(withProfile), true);
  assert.equal(hasMeaningfulData({ ...fresh(), profile: {} }), false);
  assert.deepEqual(applySnapshot({ settings: fresh().settings }, snap).profile, profile);
  assert.notEqual(dataSignature(withProfile), dataSignature(fresh()));

  const dirty = buildSnapshot({ ...fresh(), profile: { phone: 'abc', age: 5, grind: 'espuma' } as never }, 4);
  assert.deepEqual(dirty.data.profile, {});
  const old = JSON.parse(JSON.stringify(buildSnapshot(used(), 5)));
  delete old.data.profile;
  assert.ok(parseSnapshot(old));
  assert.deepEqual(applySnapshot({ settings: fresh().settings }, old).profile, {});
  assert.equal(parseSnapshot({ ...old, data: { ...old.data, profile: [] } }), null);
});

test('as missões resgatadas vão no backup e um backup antigo sem elas ainda vale', () => {
  const snap = buildSnapshot({ ...fresh(), missionsClaimed: ['2026-10-14:checkin'] }, 6);
  assert.deepEqual(snap.data.missionsClaimed, ['2026-10-14:checkin']);
  assert.deepEqual(applySnapshot({ settings: fresh().settings }, snap).missionsClaimed, ['2026-10-14:checkin']);
  assert.equal(buildSnapshot({ ...fresh(), missionsDone: 7, missionBonusDays: 2 }, 6).data.missionsDone, 7);
  const old = JSON.parse(JSON.stringify(buildSnapshot(used(), 7)));
  delete old.data.missionsClaimed;
  assert.ok(parseSnapshot(old));
  assert.deepEqual(applySnapshot({ settings: fresh().settings }, old).missionsClaimed, []);
});
