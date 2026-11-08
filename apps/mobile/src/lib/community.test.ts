import test from 'node:test';
import assert from 'node:assert/strict';
import { accountName, communityErrorKey, isValidHandle, personInitial, personName, sanitizeHandle, searchTerm, suggestHandle } from './community';

test('o apelido sai no formato da API: minúsculas, sem acento, espaço vira _', () => {
  assert.equal(sanitizeHandle('João Café!'), 'joao_cafe');
  assert.equal(sanitizeHandle('  Ana  Maria '), '_ana_maria_');
  assert.equal(sanitizeHandle('a'.repeat(30)).length, 20);
  assert.equal(isValidHandle('ana_cafe'), true);
  assert.equal(isValidHandle('an'), false);
  assert.equal(isValidHandle('Ana'), false);
});

test('a sugestão vem do nome do perfil e só vale com 3 letras ou mais', () => {
  assert.equal(suggestHandle('Ana Maria'), 'ana_maria');
  assert.equal(suggestHandle('Li'), '');
  assert.equal(suggestHandle(undefined), '');
});

test('a busca aceita @ e pede pelo menos 2 letras', () => {
  assert.equal(searchTerm('@Ana'), 'ana');
  assert.equal(searchTerm(' a '), null);
  assert.equal(searchTerm(''), null);
});

test('nome e inicial: usa o nome, senão o apelido', () => {
  assert.equal(personName({ displayName: 'Bia', handle: 'bia' }), 'Bia');
  assert.equal(personName({ displayName: null, handle: 'bia' }), '@bia');
  assert.equal(personInitial({ displayName: null, handle: 'bia' }), 'B');
  assert.equal(personInitial({ displayName: null, handle: null }), '?');
});

test('erros da API viram mensagens da tela', () => {
  assert.equal(communityErrorKey({ status: 409, code: 'handle_taken' }), 'handleTaken');
  assert.equal(communityErrorKey({ status: 400, code: 'invalid_input' }), 'handleInvalid');
  assert.equal(communityErrorKey({ status: 0, code: 'network' }), 'network');
  assert.equal(communityErrorKey({ status: 429, code: 'too_many_requests' }), 'tooMany');
  assert.equal(communityErrorKey(new Error('x')), 'generic');
});

test('o nome na comunidade vem da conta: perfil do app primeiro, depois o login', () => {
  assert.equal(accountName('Ana', 'Ana Souza'), 'Ana');
  assert.equal(accountName(undefined, 'Ana Souza'), 'Ana Souza');
  assert.equal(accountName('  ', ' Bia '), 'Bia');
  assert.equal(accountName(undefined, undefined), undefined);
  assert.equal(accountName('x'.repeat(80), undefined)?.length, 60);
});
