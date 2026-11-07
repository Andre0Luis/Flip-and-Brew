import test from 'node:test';
import assert from 'node:assert/strict';
import type { Session } from '@/store/types';
import { afterMissInsight, balanceScore, calendar, dayKey, fullCupsAverage, hourly, lastDays, streak, triggerCounts } from './stats';

const DAY = 86_400_000;
// 15 de outubro de 2025, 20:00 no fuso local
const NOW = new Date(2025, 9, 15, 20, 0, 0).getTime();

function session(daysAgo: number, hour: number, minutes: number, extra: Partial<Session> = {}): Session {
  const d = new Date(NOW - daysAgo * DAY);
  d.setHours(hour, 0, 0, 0);
  return {
    id: `t-${daysAgo}-${hour}`,
    brewerId: 'v60',
    cupId: 'cup',
    startedAt: d.getTime(),
    elapsedMs: minutes * 60_000,
    targetMs: 45 * 60_000,
    status: minutes >= 45 ? 'done' : 'interrupted',
    coins: minutes,
    quality: minutes >= 45 ? 'encorpado' : 'equilibrado',
    ...extra,
  };
}

test('sequência conta dias seguidos com pelo menos 10 minutos', () => {
  const s = [session(0, 8, 45), session(1, 8, 45), session(2, 8, 12), session(4, 8, 45)];
  assert.equal(streak(s, NOW), 3);
});

test('hoje sem copo ainda não quebra a sequência de ontem', () => {
  const s = [session(1, 8, 45), session(2, 8, 45)];
  assert.equal(streak(s, NOW), 2);
});

test('dia com menos de 10 minutos não conta', () => {
  assert.equal(streak([session(0, 8, 5)], NOW), 0);
});

test('sem sessões, tudo é vazio e não quebra', () => {
  assert.equal(streak([], NOW), 0);
  assert.equal(balanceScore([], 120, NOW), null);
  assert.equal(afterMissInsight([], NOW), null);
  assert.equal(lastDays([], 7, NOW).length, 7);
});

test('lastDays soma por dia e marca hoje', () => {
  const days = lastDays([session(0, 8, 30), session(0, 12, 15), session(2, 9, 60)], 7, NOW);
  assert.equal(days[6].isToday, true);
  assert.equal(Math.round(days[6].minutes), 45);
  assert.equal(Math.round(days[4].minutes), 60);
  assert.equal(days[5].minutes, 0);
});

test('calendário marca dia perdido só depois do primeiro uso', () => {
  const s = [session(10, 8, 45), session(8, 8, 45), session(0, 8, 45)];
  const cells = calendar(s, 120, 14, NOW);
  const key = (n: number) => dayKey(NOW - n * DAY);
  assert.equal(cells.find((c) => c.key === key(9))?.missed, true); // entre dois usos
  assert.equal(cells.find((c) => c.key === key(13))?.missed, false); // antes do primeiro uso
  assert.equal(cells.at(-1)?.isToday, true);
});

test('equilíbrio fica entre 0 e 100 e pesa meta, copos e sequência', () => {
  const perfect = Array.from({ length: 14 }, (_, i) => session(i, 8, 120, { status: 'done' }));
  assert.equal(balanceScore(perfect, 120, NOW)?.value, 100);
  const meh = [session(0, 8, 20, { status: 'interrupted' })];
  const v = balanceScore(meh, 120, NOW)!.value;
  assert.ok(v > 0 && v < 30, `valor ${v}`);
});

test('sessão que cruza a virada de hora divide os minutos', () => {
  const s = session(0, 8, 0);
  s.startedAt += 50 * 60_000; // 8:50
  s.elapsedMs = 30 * 60_000; // até 9:20
  const h = hourly([s], 30, NOW);
  assert.equal(Math.round(h[8]), 10);
  assert.equal(Math.round(h[9]), 20);
});

test('leitura antifrágil compara o dia seguinte a uma falha com a média', () => {
  // usa 10, 9 (60 min cada), falha no dia 8, volta no dia 7 com 120 min
  const s = [session(10, 8, 60), session(9, 8, 60), session(7, 8, 120)];
  const r = afterMissInsight(s, NOW);
  assert.ok(r);
  assert.equal(r!.percent, 100);
});

test('gatilhos contados e ordenados', () => {
  const s = [
    session(1, 8, 10, { trigger: 'work' }),
    session(2, 8, 10, { trigger: 'boredom' }),
    session(3, 8, 10, { trigger: 'work' }),
    session(4, 8, 50),
  ];
  assert.deepEqual(triggerCounts(s, 30, NOW), [
    { trigger: 'work', count: 2 },
    { trigger: 'boredom', count: 1 },
  ]);
});

test('média de copos cheios por dia usa só os dias desde o primeiro copo e separa os dias ativos', () => {
  const NOW2 = new Date(2026, 9, 14, 12).getTime();
  const mk = (back: number, q: 'encorpado' | 'equilibrado'): Session =>
    ({ id: `f${back}-${q}`, brewerId: 'melitta', cupId: 'paper', startedAt: NOW2 - back * 86_400_000, elapsedMs: 40 * 60_000, targetMs: 40 * 60_000, status: 'done', coins: 48, quality: q }) as Session;
  assert.deepEqual(fullCupsAverage([], 30, NOW2), { total: 0, perDay: 0, perActiveDay: 0, span: 1 });
  // primeiro copo há 3 dias: janela de 4 dias; 4 copos cheios em 2 dias ativos
  const sessions = [mk(3, 'encorpado'), mk(3, 'encorpado'), mk(1, 'encorpado'), mk(1, 'encorpado'), mk(0, 'equilibrado')];
  const a = fullCupsAverage(sessions, 30, NOW2);
  assert.equal(a.span, 4);
  assert.equal(a.total, 4);
  assert.equal(a.perDay, 1);
  assert.equal(a.perActiveDay, 2);
});
