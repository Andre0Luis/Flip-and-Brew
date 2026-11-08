import test from 'node:test';
import assert from 'node:assert/strict';
import { MIN_AGE, ageOn, profilePatchSchema, snapshotPutSchema } from './index';

const at = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d, 12);

test('a idade só sobe no aniversário', () => {
  assert.equal(ageOn('2008-11-07', at(2026, 11, 6)), 17);
  assert.equal(ageOn('2008-11-07', at(2026, 11, 7)), 18);
  assert.equal(ageOn('2000-02-29', at(2026, 2, 28)), 25);
  assert.equal(ageOn('2000-02-29', at(2026, 3, 1)), 26);
});

test('data inexistente, mal escrita ou no futuro não tem idade', () => {
  assert.equal(ageOn('2026-02-30', at(2026, 11, 7)), null);
  assert.equal(ageOn('07/11/2008', at(2026, 11, 7)), null);
  assert.equal(ageOn('2030-01-01', at(2026, 11, 7)), null);
});

test('a idade mínima é 18', () => {
  assert.equal(MIN_AGE, 18);
});

test('o perfil não aceita campos que não existem (nada de role pelo cliente)', () => {
  assert.equal(profilePatchSchema.safeParse({ displayName: 'Ana' }).success, true);
  assert.equal(profilePatchSchema.safeParse({ role: 'admin' }).success, false);
  assert.equal(profilePatchSchema.safeParse({ handle: 'Ana Maria' }).success, false);
});

test('o backup exige versão, horário e dados', () => {
  assert.equal(snapshotPutSchema.safeParse({ v: 1, updatedAt: 1, data: {} }).success, true);
  assert.equal(snapshotPutSchema.safeParse({ v: 2, updatedAt: 1, data: {} }).success, false);
  assert.equal(snapshotPutSchema.safeParse({ v: 1, updatedAt: 0, data: {} }).success, false);
});

test('semana ISO: segunda a domingo, e a virada de ano vai para a semana certa', async () => {
  const { isoWeek } = await import('./index');
  assert.equal(isoWeek(Date.UTC(2026, 10, 9)), '2026-W46'); // segunda
  assert.equal(isoWeek(Date.UTC(2026, 10, 15, 23)), '2026-W46'); // domingo à noite
  assert.equal(isoWeek(Date.UTC(2026, 10, 16)), '2026-W47');
  assert.equal(isoWeek(Date.UTC(2027, 0, 1)), '2026-W53'); // 1º de janeiro de 2027 é sexta: ainda semana 53 de 2026
  assert.equal(isoWeek(Date.UTC(2024, 11, 30)), '2025-W01');
});
