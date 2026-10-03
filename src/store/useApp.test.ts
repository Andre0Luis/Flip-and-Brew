import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS, useApp } from './useApp';
import type { Session } from './types';
import { dayKey } from '@/lib/stats';
import { useAuth } from './useAuth';
import { missionsFor } from '@/lib/missions';

const MIN = 60_000;
const DAY = 86_400_000;
const pristine = useApp.getState();

beforeEach(() => {
  useApp.setState({ ...pristine, settings: { ...DEFAULT_SETTINGS }, sessions: [], active: null, coins: 100, owned: [...pristine.owned] }, true);
});

const fullSession = (daysAgo: number): Session => {
  const startedAt = Date.now() - daysAgo * DAY - 3 * 60 * MIN;
  return { id: `s-${startedAt}`, brewerId: 'v60', cupId: 'cup', startedAt, elapsedMs: 45 * MIN, targetMs: 45 * MIN, status: 'done', coins: 54, quality: 'encorpado' };
};

test('iniciar usa o tempo da cafeteira, ou 1 minuto no modo de teste', () => {
  const t0 = 1_000_000;
  assert.equal(useApp.getState().start(t0), true);
  assert.deepEqual(useApp.getState().active, { brewerId: 'melitta', cupId: 'paper', packId: 'pack-extraforte', startedAt: t0, targetMs: 40 * MIN });
  assert.equal(useApp.getState().start(t0 + 1), false); // já há um copo em andamento

  // O modo de 1 minuto só vale para administrador; para os demais, a opção salva é ignorada.
  useApp.setState({ active: null });
  useApp.getState().setSettings({ quickBrew: true });
  useApp.getState().start(t0);
  assert.equal(useApp.getState().active?.targetMs, 40 * MIN);

  process.env.EXPO_PUBLIC_ADMIN_EMAILS = 'admin@flipandbrew.app';
  useAuth.setState({ user: { uid: 'u1', email: 'admin@flipandbrew.app', provider: 'google', emailVerified: true } });
  useApp.setState({ active: null });
  useApp.getState().start(t0);
  assert.equal(useApp.getState().active?.targetMs, MIN);
  useAuth.setState({ user: null });
  delete process.env.EXPO_PUBLIC_ADMIN_EMAILS;
});

test('encerrar um copo cheio registra a sessão e soma as moedas com bônus', () => {
  const t0 = 1_000_000;
  useApp.getState().start(t0);
  const id = useApp.getState().finish(t0 + 40 * MIN + 5000);
  const st = useApp.getState();
  assert.ok(id);
  assert.equal(st.active, null);
  assert.equal(st.sessions.length, 1);
  assert.equal(st.sessions[0].status, 'done');
  assert.equal(st.coins, 100 + 40 + 8); // Melitta: 40 min + 20% de bônus do copo cheio
  assert.equal(st.lastResultId, id);
});

test('parar cedo rende o proporcional e abaixo de 30 s a sessão é descartada', () => {
  const t0 = 1_000_000;
  useApp.getState().start(t0);
  useApp.getState().finish(t0 + 20 * MIN);
  assert.equal(useApp.getState().sessions[0].status, 'interrupted');
  assert.equal(useApp.getState().coins, 120);

  useApp.getState().start(t0 + 100 * MIN);
  assert.equal(useApp.getState().finish(t0 + 100 * MIN + 10_000), null);
  assert.equal(useApp.getState().sessions.length, 1);
  assert.equal(useApp.getState().active, null);
});

test('comprar: saldo, item já seu e item que só abre por sequência', () => {
  const st = useApp.getState();
  assert.equal(st.buy('press'), 'poor'); // 600 moedas, há 100
  useApp.getState().addCoins(900);
  assert.equal(useApp.getState().buy('press'), 'ok');
  assert.equal(useApp.getState().coins, 400); // 1000 - 600, sem desconto ainda
  assert.equal(useApp.getState().buy('press'), 'owned');
  assert.equal(useApp.getState().buy('chemex'), 'locked');
  assert.equal(useApp.getState().buy('inexistente'), 'locked');
});

test('o desconto de check-in seguido vale na compra da cafeteira, mas não na xícara especial', () => {
  const day = 86_400_000;
  const now = Date.now();
  useApp.setState({ coins: 20_000, checkins: Array.from({ length: 10 }, (_, i) => ({ day: dayKey(now - i * day), energy: 3, at: now - i * day })) });
  assert.equal(useApp.getState().buy('moka'), 'ok'); // 3300 com 10% de desconto = 2970
  assert.equal(useApp.getState().coins, 17_030);
  assert.equal(useApp.getState().buy('camp'), 'ok'); // série especial: preço cheio
  assert.equal(useApp.getState().coins, 13_430); // 17030 - 3600
});

test('a combinação cafeteira + xícara aumenta as moedas do copo cheio', () => {
  useApp.setState({ brewerId: 'moka', cupId: 'tiny', owned: [...useApp.getState().owned, 'moka', 'tiny'] });
  const t0 = 1_000_000;
  assert.ok(useApp.getState().start(t0));
  const id = useApp.getState().finish(t0 + 30 * MIN + 5000)!; // moka: 30 min, +20% + 2% + 5% de combinação = +27%
  const s = useApp.getState().sessions.find((x) => x.id === id)!;
  assert.equal(s.coins, Math.round((30 + 6) * 1.27));
});

test('o pacote de café equipado entra nas moedas do copo e equipar pacote exige tê-lo', () => {
  assert.equal(useApp.getState().packId, 'pack-extraforte');
  useApp.getState().equip('pack-especial');
  assert.equal(useApp.getState().packId, 'pack-extraforte'); // não é dono ainda
  useApp.setState({ coins: 20_000 });
  assert.equal(useApp.getState().buy('pack-especial'), 'ok');
  useApp.getState().equip('pack-especial');
  assert.equal(useApp.getState().packId, 'pack-especial');
  const t0 = 2_000_000;
  assert.ok(useApp.getState().start(t0));
  const id = useApp.getState().finish(t0 + 40 * MIN + 5000)!; // Melitta (40 min) + papel + pacote especial: +35%
  assert.equal(useApp.getState().sessions.find((x) => x.id === id)!.coins, Math.round(48 * 1.35));
});

test('missões: resgatar só vale se concluída, uma vez por dia, e as três dão bônus', () => {
  const now = Date.now();
  const first = () => useApp.getState();
  const ms = missionsFor({ sessions: first().sessions, checkins: first().checkins, practicesDone: first().practicesDone, goalMin: first().settings.goalMin, claimed: first().missionsClaimed }, now);
  assert.equal(first().claimMission(ms[0].id, now), 0); // ainda não concluída
  // Conclui as três do dia com dados reais.
  useApp.setState({
    checkins: [{ day: dayKey(now), energy: 3, at: now }],
    practicesDone: [dayKey(now)],
    sessions: [8, 21, 12].map((h, i) => {
      const d = new Date(now);
      d.setHours(h, 0, 0, 0);
      return { id: `mm${i}`, brewerId: 'melitta', cupId: 'paper', startedAt: d.getTime(), elapsedMs: 400 * MIN, targetMs: 40 * MIN, status: 'done', coins: 0, quality: 'encorpado' } as Session;
    }),
    coins: 0,
  });
  let total = 0;
  for (const m of ms) {
    const got = first().claimMission(m.id, now);
    assert.equal(got, m.reward, m.id);
    assert.equal(first().claimMission(m.id, now), 0); // não resgata duas vezes
    total += got;
  }
  assert.equal(first().claimMission('all', now), 30);
  assert.equal(first().claimMission('all', now), 0);
  assert.equal(first().coins, total + 30);
});

test('equipar só funciona com item que a pessoa tem', () => {
  useApp.getState().equip('moka');
  assert.equal(useApp.getState().brewerId, 'melitta');
  useApp.getState().addCoins(5000);
  useApp.getState().buy('moka');
  useApp.getState().equip('moka');
  assert.equal(useApp.getState().brewerId, 'moka');
});

test('30 dias de sequência liberam a Chemex ao encerrar um copo', () => {
  const past = Array.from({ length: 29 }, (_, i) => fullSession(i + 1));
  useApp.setState({ sessions: past });
  assert.equal(useApp.getState().owned.includes('chemex'), false);
  const t0 = Date.now() - 50 * MIN;
  useApp.getState().start(t0);
  useApp.getState().finish(t0 + 45 * MIN);
  assert.equal(useApp.getState().owned.includes('chemex'), true);
});

test('prática do dia só paga uma vez por dia, e artigo lido só uma vez', () => {
  useApp.getState().completePractice(5);
  useApp.getState().completePractice(5);
  assert.equal(useApp.getState().coins, 105);
  assert.deepEqual(useApp.getState().practicesDone, [dayKey(Date.now())]);
  assert.equal(useApp.getState().markRead('antifragil'), true);
  assert.equal(useApp.getState().markRead('antifragil'), false);
  assert.equal(useApp.getState().coins, 107);
});

test('apagar tudo mantém as configurações e não repete a introdução', () => {
  useApp.getState().setSettings({ language: 'es', goalMin: 60 });
  useApp.getState().addCoins(900);
  useApp.getState().resetAll();
  const st = useApp.getState();
  assert.equal(st.coins, 100);
  assert.equal(st.settings.language, 'es');
  assert.equal(st.settings.goalMin, 60);
  assert.equal(st.onboarded, true);
});

test('migração da versão 1: gatilhos viram chaves e quem já usava pula a introdução', () => {
  const migrate = useApp.persist.getOptions().migrate!;
  const old = {
    coins: 10,
    sessions: [{ id: 'a', trigger: 'Notificação' }, { id: 'b', trigger: 'Tédio' }, { id: 'c' }],
    settings: { goalMin: 90 },
  };
  const out = migrate(old, 1) as unknown as ReturnType<typeof useApp.getState>;
  assert.deepEqual(out.sessions.map((s) => s.trigger), ['notification', 'boredom', undefined]);
  assert.equal(out.settings.goalMin, 90);
  assert.equal(out.settings.language, 'pt');
  assert.equal(out.onboarded, true);
  const fresh = migrate({ sessions: [] }, 1) as unknown as ReturnType<typeof useApp.getState>;
  assert.equal(fresh.onboarded, false);
});
