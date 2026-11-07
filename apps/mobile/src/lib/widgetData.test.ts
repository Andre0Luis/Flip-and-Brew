import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWidgetData, withLiveBrew } from './widgetData';
import { withCheckin } from './checkin';
import type { Session } from '@/store/types';

const NOW = new Date(2026, 9, 14, 12).getTime();
const MIN = 60_000;
const sess = (hour: number, minutes: number): Session => {
  const d = new Date(NOW);
  d.setHours(hour, 0, 0, 0);
  return { id: `w${hour}`, brewerId: 'melitta', cupId: 'paper', startedAt: d.getTime(), elapsedMs: minutes * MIN, targetMs: 40 * MIN, status: 'done', coins: minutes, quality: 'encorpado' } as Session;
};
const base = { sessions: [] as Session[], checkins: [], practicesDone: [] as string[], missionsClaimed: [] as string[], coins: 250, goalMin: 120, active: null, language: 'pt' as const };

test('sem dados, o widget traz a frase do dia traduzida e tudo zerado', () => {
  const d = buildWidgetData(base, NOW);
  assert.equal(d.lang, 'pt');
  assert.ok(d.quote.text.length > 0 && d.quote.author.length > 0);
  assert.equal(d.labels.quote, 'Frase do dia');
  assert.deepEqual(d.brew.active, false);
  assert.equal(d.streak, 0);
  assert.equal(d.coins, 250);
  assert.equal(d.today.percent, 0);
  assert.equal(d.missions.total, 3);
  assert.equal(d.energy, null);
});

test('os rótulos acompanham o idioma e a frase é a mesma da tela', () => {
  const en = buildWidgetData({ ...base, language: 'en' }, NOW);
  assert.equal(en.labels.quote, 'Quote of the day');
  assert.notEqual(en.quote.text, buildWidgetData(base, NOW).quote.text);
});

test('o progresso do dia, a energia e o copo em andamento entram no retrato', () => {
  const active = { brewerId: 'melitta', startedAt: NOW - 10 * MIN, targetMs: 40 * MIN };
  const d = buildWidgetData({ ...base, sessions: [sess(8, 60)], checkins: withCheckin([], 4, NOW), active }, NOW);
  assert.equal(d.today.minutes, 60);
  assert.equal(d.today.percent, 50);
  assert.equal(d.energy, 4);
  assert.equal(d.brew.active, true);
  assert.equal(d.brew.percent, 25);
  assert.equal(d.brew.remainingMin, 30);
  assert.equal(d.brew.name, 'Coador Melitta');
});

test('o copo é recalculado na hora de desenhar e termina em 100%', () => {
  const active = { brewerId: 'melitta', startedAt: NOW, targetMs: 40 * MIN };
  const d = buildWidgetData({ ...base, active }, NOW);
  const mid = withLiveBrew(d, NOW + 20 * MIN);
  assert.equal(mid.brew.percent, 50);
  assert.equal(mid.brew.remainingMin, 20);
  const end = withLiveBrew(d, NOW + 90 * MIN);
  assert.equal(end.brew.active, false);
  assert.equal(end.brew.percent, 100);
  assert.equal(withLiveBrew(buildWidgetData(base, NOW), NOW).brew.active, false);
});
