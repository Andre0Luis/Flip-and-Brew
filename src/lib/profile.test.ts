import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanProfile, hasProfile, isPhoneValid, parseAge, toggleChoice, toggleFlavor } from './profile';

test('telefone: aceita formatos comuns e vazio, recusa letras e tamanhos absurdos', () => {
  assert.equal(isPhoneValid(''), true);
  assert.equal(isPhoneValid('(11) 91234-5678'), true);
  assert.equal(isPhoneValid('+55 11 91234 5678'), true);
  assert.equal(isPhoneValid('123'), false);
  assert.equal(isPhoneValid('1234567890123456'), false);
  assert.equal(isPhoneValid('11 9abcd-5678'), false);
});

test('idade: vazio vale, número entre 10 e 120 vale, o resto é inválido', () => {
  assert.equal(parseAge(''), undefined);
  assert.equal(parseAge(' 34 '), 34);
  assert.equal(parseAge('9'), null);
  assert.equal(parseAge('121'), null);
  assert.equal(parseAge('3a'), null);
  assert.equal(parseAge('-5'), null);
});

test('o perfil limpo descarta vazios, desconhecidos e inválidos', () => {
  const p = cleanProfile({
    name: '  Ana  ', phone: 'abc', age: 200, favorite: '', roast: 'dark', grind: 'espuma', body: 'full',
    acidity: 'high', flavors: ['fruity', 'fruity', 'bacon', 'citrus'], extra: 'x',
  });
  assert.deepEqual(p, { name: 'Ana', roast: 'dark', body: 'full', acidity: 'high', flavors: ['fruity', 'citrus'] });
  assert.equal(hasProfile({}), false);
  assert.equal(hasProfile({ age: 30 }), true);
  assert.deepEqual(cleanProfile(null), {});
  assert.deepEqual(cleanProfile('texto'), {});
});

test('alternar escolha e sabores', () => {
  assert.equal(toggleChoice('dark', 'dark'), undefined);
  assert.equal(toggleChoice('dark', 'light'), 'light');
  assert.deepEqual(toggleFlavor(undefined, 'floral'), ['floral']);
  assert.deepEqual(toggleFlavor(['floral', 'nutty'], 'floral'), ['nutty']);
});
