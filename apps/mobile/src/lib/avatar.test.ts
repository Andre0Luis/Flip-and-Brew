import test from 'node:test';
import assert from 'node:assert/strict';
import { AVATAR_IDS, cleanAvatar, coffeeEmoji, firstName } from './avatar';
import { METHODS } from './profile';

test('só vale um desenho conhecido ou o arquivo da foto na pasta do app', () => {
  assert.deepEqual(cleanAvatar({ kind: 'preset', id: 'moka' }), { kind: 'preset', id: 'moka' });
  assert.equal(cleanAvatar({ kind: 'preset', id: 'outro' }), null);
  assert.deepEqual(cleanAvatar({ kind: 'photo', uri: 'file:///data/user/0/app/files/avatar-1.jpg' }), { kind: 'photo', uri: 'file:///data/user/0/app/files/avatar-1.jpg' });
  assert.equal(cleanAvatar({ kind: 'photo', uri: 'https://exemplo.com/x.jpg' }), null); // nada de endereço da web
  assert.equal(cleanAvatar({ kind: 'photo', uri: 'file://' + 'a'.repeat(600) }), null);
  assert.equal(cleanAvatar(null), null);
  assert.equal(cleanAvatar('bean'), null);
  assert.equal(AVATAR_IDS.length, 5);
});

test('o primeiro nome vem do começo do nome e é cortado se for enorme', () => {
  assert.equal(firstName('  Ana Maria Souza '), 'Ana');
  assert.equal(firstName('Ana'), 'Ana');
  assert.equal(firstName(undefined), '');
  assert.equal(firstName(''), '');
  assert.equal(firstName('Maximiliano-Alexandrino Silva').length, 14);
  assert.ok(firstName('Maximiliano-Alexandrino Silva').endsWith('…'));
});

test('todo método de preparo do perfil tem emoji, e sem método vale a xícara', () => {
  for (const m of METHODS) assert.ok(coffeeEmoji(m).length > 0, m);
  assert.equal(coffeeEmoji(undefined), '\u2615');
  assert.equal(coffeeEmoji('pourover'), '\u2615');
  assert.equal(coffeeEmoji('espresso'), '\u{1FAD8}');
  assert.equal(coffeeEmoji('press'), '\u{1FAD6}');
  assert.equal(coffeeEmoji('coldbrew'), '\u{1F9CA}');
});
