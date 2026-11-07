import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAdminUser, parseAdminEmails } from './admin';

test('a lista de administradores ignora espaços, caixa e vazios', () => {
  assert.deepEqual(parseAdminEmails(' Ana@x.com, ,bob@y.com '), ['ana@x.com', 'bob@y.com']);
  assert.deepEqual(parseAdminEmails(undefined), []);
  assert.deepEqual(parseAdminEmails(''), []);
});

test('só é administrador quem tem e-mail verificado e na lista', () => {
  const list = ['ana@x.com'];
  assert.equal(isAdminUser({ email: 'ANA@x.com', emailVerified: true }, list), true);
  assert.equal(isAdminUser({ email: 'ana@x.com', emailVerified: false }, list), false); // e-mail não verificado
  assert.equal(isAdminUser({ email: 'bob@y.com', emailVerified: true }, list), false);
  assert.equal(isAdminUser({ email: null, emailVerified: true }, list), false);
  assert.equal(isAdminUser(null, list), false);
  assert.equal(isAdminUser({ email: 'ana@x.com', emailVerified: true }, []), false); // sem lista, ninguém é
});
