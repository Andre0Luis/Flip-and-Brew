import test from 'node:test';
import assert from 'node:assert/strict';
import { gateScreen, type GateInput } from './loginGate';

const base: GateInput = { required: true, onboarded: true, status: 'signedIn', firstStepsDone: true };

test('a introdução vem primeiro, com ou sem login obrigatório', () => {
  assert.equal(gateScreen({ ...base, onboarded: false, status: 'signedOut' }), 'intro');
  assert.equal(gateScreen({ ...base, required: false, onboarded: false }), 'intro');
});

test('com login obrigatório: espera o estado, pede o login e só depois libera o app', () => {
  assert.equal(gateScreen({ ...base, status: 'loading' }), 'loading');
  assert.equal(gateScreen({ ...base, status: 'signedOut' }), 'login');
  assert.equal(gateScreen({ ...base, firstStepsDone: false }), 'firstSteps');
  assert.equal(gateScreen(base), 'app');
});

test('sair da conta (ou excluí-la) volta para a tela de entrar', () => {
  assert.equal(gateScreen({ ...base, status: 'signedOut' }), 'login');
});

test('sem login obrigatório o app abre direto e nunca mostra entrar nem primeiros passos', () => {
  for (const status of ['loading', 'signedOut', 'signedIn'] as const) {
    assert.equal(gateScreen({ ...base, required: false, status, firstStepsDone: false }), 'app');
  }
});
