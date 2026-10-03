import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { appStorage } from './storage';
import type { ActiveBrew, Checkin, Profile, Session, Settings } from './types';
import { byId, CATALOG, STARTER_IDS } from '@/data/catalog';
import { MIN_LOGGED_MS, outcomeOf } from '@/lib/brew';
import { dayKey, streak } from '@/lib/stats';
import { makeDemoCheckins, makeDemoSessions } from '@/lib/demo';
import { makeTestData } from '@/lib/testUser';
import { withCheckin, withoutCheckin } from '@/lib/checkin';
import { cleanProfile } from '@/lib/profile';
import { discountFor, priceOf } from '@/lib/pricing';
import { earnBonus } from '@/lib/earnings';
import { canUseTestTools } from '@/lib/admin';
import { ALL_BONUS, allClaimed, bonusClaimed, claimKey, missionsFor, pruneClaims } from '@/lib/missions';

export const DEFAULT_SETTINGS: Settings = { language: 'pt', goalMin: 120, themeMode: 'system', autoStart: true, quickBrew: false, notifyOnDone: false, dimDuringBrew: false, faceUpSign: 0 };

type State = {
  coins: number;
  owned: string[];
  brewerId: string;
  cupId: string;
  /** pacote de café em uso; muda as moedas ganhas */
  packId: string;
  active: ActiveBrew | null;
  sessions: Session[];
  /** energia diária em xícaras (1 a 5), um registro por dia */
  checkins: Checkin[];
  lastResultId: string | null;
  /** missões diárias já resgatadas, como "2026-10-14:checkin" (só os últimos dias) */
  missionsClaimed: string[];
  /** missões resgatadas desde sempre (não conta o bônus) */
  missionsDone: number;
  /** dias em que as três missões foram resgatadas */
  missionBonusDays: number;
  /** dicas de primeira vez já vistas (chaves como 'coins' e 'early') */
  seenTips: string[];
  /** perfil opcional (dados pessoais e preferências de café) */
  profile: Profile;
  practiceAccepted: string | null; // dayKey
  practicesDone: string[]; // dayKeys
  articlesRead: string[];
  settings: Settings;
  /** a introdução já foi vista */
  onboarded: boolean;
  /** Início está na tela e em primeiro plano; usado para iniciar o copo ao virar o celular. */
  homeFocused: boolean;
  /** quando o último copo terminou, para não reiniciar sozinho */
  lastEndedAt: number;

  setOnboarded: (v: boolean) => void;
  setHomeFocused: (v: boolean) => void;
  setSettings: (s: Partial<Settings>) => void;
  start: (now?: number) => boolean;
  /** Encerra o copo ativo. Devolve o id da sessão registrada ou null se foi descartada. */
  finish: (now?: number) => string | null;
  /** Registra (ou troca) a energia de hoje, de 1 a 5 xícaras. */
  setCheckin: (energy: number, now?: number) => void;
  /** Apaga o check-in de um dia (para refazer). */
  removeCheckin: (day: string) => void;
  /** Resgata a recompensa de uma missão concluída hoje. Devolve as moedas ganhas (0 se não pôde). 'all' resgata o bônus das três. */
  claimMission: (id: string, now?: number) => number;
  /** Marca uma dica de primeira vez como vista. */
  markTip: (key: string) => void;
  /** Atualiza o perfil. Passe undefined para limpar um campo. */
  setProfile: (patch: Partial<Record<keyof Profile, unknown>>) => void;
  clearProfile: () => void;
  setResult: (id: string, patch: Partial<Pick<Session, 'trigger' | 'mood'>>) => void;
  buy: (id: string) => 'ok' | 'owned' | 'poor' | 'locked';
  equip: (id: string) => void;
  acceptPractice: () => void;
  completePractice: (coins: number) => void;
  markRead: (id: string) => boolean;
  addCoins: (n: number) => void;
  loadDemo: () => void;
  /** Progresso farto para testes: muitas moedas, todos os itens e 90 dias de histórico. */
  loadTestUser: () => void;
  resetAll: () => void;
};

const initial = {
  coins: 100,
  owned: STARTER_IDS,
  brewerId: 'melitta',
  cupId: 'paper',
  packId: 'pack-extraforte',
  active: null as ActiveBrew | null,
  sessions: [] as Session[],
  checkins: [] as Checkin[],
  lastResultId: null as string | null,
  profile: {} as Profile,
  seenTips: [] as string[],
  missionsClaimed: [] as string[],
  missionsDone: 0,
  missionBonusDays: 0,
  practiceAccepted: null as string | null,
  practicesDone: [] as string[],
  articlesRead: [] as string[],
  settings: DEFAULT_SETTINGS,
  onboarded: false,
  homeFocused: false,
  lastEndedAt: 0,
};

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      ...initial,

      setOnboarded: (v) => set({ onboarded: v }),
      setHomeFocused: (v) => set({ homeFocused: v }),
      setCheckin: (energy, now = Date.now()) => set((st) => ({ checkins: withCheckin(st.checkins, energy, now) })),
      markTip: (key) => set((st) => (st.seenTips.includes(key) ? {} : { seenTips: [...st.seenTips, key] })),
      claimMission: (id, now = Date.now()) => {
        const st = get();
        const ms = missionsFor({ sessions: st.sessions, checkins: st.checkins, practicesDone: st.practicesDone, goalMin: st.settings.goalMin, claimed: st.missionsClaimed }, now);
        const key = claimKey(dayKey(now), id);
        if (st.missionsClaimed.includes(key)) return 0;
        let coins = 0;
        if (id === 'all') {
          if (!allClaimed(ms) || bonusClaimed(st.missionsClaimed, now)) return 0;
          coins = ALL_BONUS;
        } else {
          const m = ms.find((x) => x.id === id);
          if (!m || !m.done) return 0;
          coins = m.reward;
        }
        set({
          coins: st.coins + coins,
          missionsClaimed: pruneClaims([...st.missionsClaimed, key], now),
          ...(id === 'all' ? { missionBonusDays: st.missionBonusDays + 1 } : { missionsDone: st.missionsDone + 1 }),
        });
        return coins;
      },
      removeCheckin: (day) => set((st) => ({ checkins: withoutCheckin(st.checkins, day) })),
      setProfile: (patch) => set((st) => ({ profile: cleanProfile({ ...st.profile, ...patch }) })),
      clearProfile: () => set({ profile: {} }),
      setSettings: (s) => set((st) => ({ settings: { ...st.settings, ...s } })),

      start: (now = Date.now()) => {
        const st = get();
        if (st.active) return false;
        const brewer = byId(st.brewerId);
        const minutes = st.settings.quickBrew && canUseTestTools() ? 1 : brewer?.brewMinutes ?? 45;
        set({ active: { brewerId: st.brewerId, cupId: st.cupId, packId: st.packId, startedAt: now, targetMs: minutes * 60_000 } });
        return true;
      },

      finish: (now = Date.now()) => {
        const st = get();
        const a = st.active;
        if (!a) return null;
        const o = outcomeOf(a.startedAt, a.targetMs, now, earnBonus(a.brewerId, a.cupId, a.packId).total);
        if (o.elapsedMs < MIN_LOGGED_MS) {
          set({ active: null, lastEndedAt: now });
          return null;
        }
        const session: Session = {
          id: `s-${a.startedAt}`,
          brewerId: a.brewerId,
          cupId: a.cupId,
          startedAt: a.startedAt,
          elapsedMs: o.elapsedMs,
          targetMs: a.targetMs,
          status: o.status,
          coins: o.coins,
          quality: o.quality,
        };
        const sessions = [...st.sessions, session];
        // Cafeteiras liberadas por sequência.
        const days = streak(sessions, now);
        const unlocked = CATALOG.filter((i) => i.streakUnlock && days >= i.streakUnlock && !st.owned.includes(i.id)).map((i) => i.id);
        set({
          active: null,
          sessions,
          coins: st.coins + o.coins,
          owned: unlocked.length ? [...st.owned, ...unlocked] : st.owned,
          lastResultId: session.id,
          lastEndedAt: now,
        });
        return session.id;
      },

      setResult: (id, patch) => set((st) => ({ sessions: st.sessions.map((s) => (s.id === id ? { ...s, ...patch } : s)) })),

      buy: (id) => {
        const st = get();
        const item = byId(id);
        if (!item) return 'locked';
        if (st.owned.includes(id)) return 'owned';
        if (item.streakUnlock) return 'locked';
        const price = priceOf(item, discountFor({ checkins: st.checkins, sessions: st.sessions, goalMin: st.settings.goalMin }).percent);
        if (st.coins < price) return 'poor';
        set({ coins: st.coins - price, owned: [...st.owned, id] });
        return 'ok';
      },

      equip: (id) => {
        const st = get();
        const item = byId(id);
        if (!item || !st.owned.includes(id)) return;
        set(item.kind === 'brewer' ? { brewerId: id } : item.kind === 'beans' ? { packId: id } : { cupId: id });
      },

      acceptPractice: () => set({ practiceAccepted: dayKey(Date.now()) }),
      completePractice: (coins) =>
        set((st) => {
          const k = dayKey(Date.now());
          if (st.practicesDone.includes(k)) return {};
          return { practicesDone: [...st.practicesDone, k], coins: st.coins + coins };
        }),

      markRead: (id) => {
        const st = get();
        if (st.articlesRead.includes(id)) return false;
        set({ articlesRead: [...st.articlesRead, id], coins: st.coins + 2 });
        return true;
      },

      addCoins: (n) => set((st) => ({ coins: st.coins + n })),

      loadDemo: () =>
        set((st) => ({
          sessions: makeDemoSessions(),
          checkins: makeDemoCheckins(),
          coins: Math.max(st.coins, 480),
          owned: Array.from(new Set([...st.owned, 'press', 'mug', 'glass', 'tiny'])),
          practicesDone: [dayKey(Date.now() - 86_400_000), dayKey(Date.now() - 2 * 86_400_000), dayKey(Date.now() - 3 * 86_400_000)],
          articlesRead: ['antifragil', 'controle'],
        })),

      loadTestUser: () => set({ ...makeTestData(), active: null, lastResultId: null, onboarded: true }),

      resetAll: () => set({ ...initial, settings: get().settings, onboarded: true }),
    }),
    {
      name: 'flip-and-brew-v2',
      version: 3,
      storage: createJSONStorage(() => appStorage),
      // v1 guardava o gatilho como texto em português e não tinha idioma.
      migrate: (persisted) => {
        const p = (persisted ?? {}) as Record<string, any>;
        const legacy: Record<string, string> = { Notificação: 'notification', Tédio: 'boredom', Trabalho: 'work', Hábito: 'habit', Outro: 'other' };
        if (Array.isArray(p.sessions)) p.sessions = p.sessions.map((s: any) => (s.trigger && legacy[s.trigger] ? { ...s, trigger: legacy[s.trigger] } : s));
        p.settings = { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) };
        // Quem já usava o app não precisa da introdução.
        if (p.onboarded === undefined) p.onboarded = Array.isArray(p.sessions) && p.sessions.length > 0;
        // Quem já tem copos não precisa das dicas de primeira vez.
        if (p.seenTips === undefined && Array.isArray(p.sessions) && p.sessions.length > 0) p.seenTips = ['coins', 'early'];
        return p as State;
      },
      // O idioma e as demais configurações novas entram por cima do que já estava salvo.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        const owned = Array.from(new Set([...STARTER_IDS, ...(p.owned ?? current.owned)]));
        return { ...current, ...p, owned, settings: { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) } };
      },
      partialize: (s) => ({
        coins: s.coins,
        owned: s.owned,
        brewerId: s.brewerId,
        cupId: s.cupId,
        packId: s.packId,
        active: s.active,
        sessions: s.sessions,
        checkins: s.checkins,
        lastResultId: s.lastResultId,
        profile: s.profile,
        seenTips: s.seenTips,
        missionsClaimed: s.missionsClaimed,
        missionsDone: s.missionsDone,
        missionBonusDays: s.missionBonusDays,
        practiceAccepted: s.practiceAccepted,
        practicesDone: s.practicesDone,
        articlesRead: s.articlesRead,
        settings: s.settings,
        onboarded: s.onboarded,
      }),
    },
  ),
);
