import test from 'node:test';
import assert from 'node:assert/strict';
import { GRACE_MS } from './brew';
import { decide, DOWN_HOLD_MS, onReopen, poseFromAccel, RESTART_COOLDOWN_MS, UP_HOLD_MS, type EngineInput } from './engine';

const MIN = 60_000;
const base: EngineInput = {
  now: 1_000_000,
  active: null,
  calibrated: true,
  autoStart: true,
  homeFocused: true,
  pose: { value: 'other', since: 0 },
  lastEndedAt: 0,
};

test('pose: deitado de tela para cima, para baixo ou em pé', () => {
  assert.equal(poseFromAccel(0.05, 0.02, 1, 1), 'up');
  assert.equal(poseFromAccel(0.05, 0.02, -1, 1), 'down');
  assert.equal(poseFromAccel(0.05, 0.02, -1, -1), 'up'); // aparelho com o eixo invertido
  assert.equal(poseFromAccel(0.7, 0.1, 0.7, 1), 'other'); // inclinado
  assert.equal(poseFromAccel(0, 0.9, 0.3, 1), 'other'); // em pé
});

test('virar para baixo por 2 s na tela Início inicia o copo', () => {
  const pose = { value: 'down' as const, since: base.now - DOWN_HOLD_MS };
  assert.equal(decide({ ...base, pose }), 'start');
  assert.equal(decide({ ...base, pose: { value: 'down', since: base.now - DOWN_HOLD_MS + 1 } }), null);
});

test('não inicia sozinho sem calibrar, fora do Início, com a opção desligada ou logo após um copo', () => {
  const pose = { value: 'down' as const, since: 0 };
  assert.equal(decide({ ...base, pose, calibrated: false }), null);
  assert.equal(decide({ ...base, pose, homeFocused: false }), null);
  assert.equal(decide({ ...base, pose, autoStart: false }), null);
  assert.equal(decide({ ...base, pose, lastEndedAt: base.now - RESTART_COOLDOWN_MS + 1 }), null);
  assert.equal(decide({ ...base, pose, lastEndedAt: base.now - RESTART_COOLDOWN_MS - 1 }), 'start');
});

test('copo em andamento termina ao encher, mesmo sem calibrar', () => {
  const active = { startedAt: base.now - 45 * MIN, targetMs: 45 * MIN };
  assert.equal(decide({ ...base, active, calibrated: false }), 'finish');
  assert.equal(decide({ ...base, active: { ...active, startedAt: base.now - 44 * MIN } }), null);
});

test('pegar o celular (tela para cima por 3 s) encerra, depois do tempo para pousá-lo', () => {
  const active = { startedAt: base.now - 10 * MIN, targetMs: 45 * MIN };
  const up = { value: 'up' as const, since: base.now - UP_HOLD_MS };
  assert.equal(decide({ ...base, active, pose: up }), 'finish');
  assert.equal(decide({ ...base, active, pose: { value: 'up', since: base.now - UP_HOLD_MS + 1 } }), null);
  // logo após iniciar, a pessoa ainda está pousando o celular
  assert.equal(decide({ ...base, active: { startedAt: base.now - GRACE_MS + 1000, targetMs: 45 * MIN }, pose: up }), null);
  // sem calibração o sensor não encerra
  assert.equal(decide({ ...base, active, pose: up, calibrated: false }), null);
});

test('reabrir o app: encerra, ou volta à tela do copo se foi logo após iniciar', () => {
  const now = 5 * MIN;
  assert.equal(onReopen(null, now), null);
  assert.equal(onReopen({ startedAt: now - 10_000, targetMs: 45 * MIN }, now), 'show');
  assert.equal(onReopen({ startedAt: now - GRACE_MS - 1, targetMs: 45 * MIN }, now), 'finish');
  assert.equal(onReopen({ startedAt: now - 50 * MIN, targetMs: 45 * MIN }, now), 'finish');
});
