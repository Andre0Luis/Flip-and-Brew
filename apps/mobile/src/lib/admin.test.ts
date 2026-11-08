import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAdminUser } from './admin';

test('só é administrador quem tem e-mail verificado e o papel admin dado pelo servidor', () => {
  assert.equal(isAdminUser({ emailVerified: true }, 'admin'), true);
  assert.equal(isAdminUser({ emailVerified: false }, 'admin'), false); // e-mail não verificado
  assert.equal(isAdminUser({ emailVerified: true }, 'user'), false);
  assert.equal(isAdminUser({ emailVerified: true }, null), false); // servidor ainda não respondeu, ou sem servidor
  assert.equal(isAdminUser(null, 'admin'), false); // saiu da conta
});
