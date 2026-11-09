import test from 'node:test';
import assert from 'node:assert/strict';
import { sessionRoute } from './sessionRoute';

test('o foco do Pomodoro abre a tela do Pomodoro e o café abre a do copo', () => {
  assert.equal(sessionRoute({ pomodoro: true }), '/pomodoro');
  assert.equal(sessionRoute({}), '/brew');
  assert.equal(sessionRoute({ pomodoro: false }), '/brew');
  assert.equal(sessionRoute(null), '/brew');
  assert.equal(sessionRoute(undefined), '/brew');
});
