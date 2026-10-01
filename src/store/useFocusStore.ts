import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';

export const mmkvStorage = createMMKV({
  id: 'flip-and-brew-storage',
});

const zustandStorage: StateStorage = {
  setItem: (name, value) => mmkvStorage.set(name, value),
  getItem: (name) => mmkvStorage.getString(name) ?? null,
  removeItem: (name) => mmkvStorage.remove(name),
};

export interface FocusState {
  // Core Focus
  isFocusing: boolean;
  startTime: number | null;
  accumulatedTime: number;

  // Economy & Status
  coins: number;

  // Inventories
  unlockedBrewers: string[];
  unlockedPots: string[];
  unlockedCups: string[];

  // Selections
  selectedBrewer: string;
  selectedPot: string;
  selectedCup: string;

  // Economy Timestamps
  lastLoginDate: string;

  // Actions
  startFocus: () => void;
  breakFocus: () => void;
  addTime: (timeMs: number) => void;
  buyItem: (type: 'brewer' | 'pot' | 'cup', id: string, price: number) => boolean;
  selectItem: (type: 'brewer' | 'pot' | 'cup', id: string) => void;
  buyCoins: (amount: number) => void;
  syncBackgroundTime: () => void;
  checkDailyLogin: () => boolean;
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      isFocusing: false,
      startTime: null,
      accumulatedTime: 0,

      coins: 5000,

      unlockedBrewers: ['v60'], // Default unlocked
      unlockedPots: ['clay'], // Default unlocked
      unlockedCups: ['cup_1'], // Default unlocked

      selectedBrewer: 'v60',
      selectedPot: 'clay',
      selectedCup: 'cup_1',

      lastLoginDate: '',

      startFocus: () => set({
        isFocusing: true,
        startTime: Date.now()
      }),

      breakFocus: () => set({
        isFocusing: false,
        startTime: null
      }),

      // Provisório até a mecânica de extração (Fase 2): 1 moeda por minuto offline.
      addTime: (timeMs) => set((state) => {
        const newTime = Math.max(0, state.accumulatedTime + timeMs);
        const coinDiff = Math.floor(newTime / 60000) - Math.floor(state.accumulatedTime / 60000);
        return {
          accumulatedTime: newTime,
          coins: Math.max(0, state.coins + coinDiff),
        };
      }),

      buyItem: (type, id, price) => {
        const state = get();
        if (state.coins >= price) {
          const inventoryKey = type === 'brewer' ? 'unlockedBrewers' : type === 'pot' ? 'unlockedPots' : 'unlockedCups';
          if (!state[inventoryKey].includes(id)) {
            set({
              coins: state.coins - price,
              [inventoryKey]: [...state[inventoryKey], id]
            });
            return true;
          }
        }
        return false;
      },

      selectItem: (type, id) => set((state) => {
        if (type === 'brewer' && state.unlockedBrewers.includes(id)) return { selectedBrewer: id };
        if (type === 'pot' && state.unlockedPots.includes(id)) return { selectedPot: id };
        if (type === 'cup' && state.unlockedCups.includes(id)) return { selectedCup: id };
        return {};
      }),

      buyCoins: (amount) => set((state) => ({ coins: state.coins + amount })),

      syncBackgroundTime: () => {
        const state = get();
        if (state.isFocusing && state.startTime) {
          const now = Date.now();
          const timePassed = now - state.startTime;
          if (timePassed > 0) {
            get().addTime(timePassed);
            set({ startTime: now });
          }
        }
      },

      checkDailyLogin: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        if (state.lastLoginDate !== today) {
          set({
            lastLoginDate: today,
            coins: state.coins + 25
          });
          return true; // Rewarded
        }
        return false;
      }
    }),
    {
      name: 'flip-and-brew-gamified',
      storage: createJSONStorage(() => zustandStorage),
      version: 2,
      // v1 guardava planta, saúde, sementes, flips e contadores de ação diária.
      migrate: (persisted) => {
        const {
          health, plantStage, flipOpens, flipCloses, unlockedSeeds, selectedSeed,
          lastActionDate, dailyActionsCount, ...kept
        } = (persisted ?? {}) as Record<string, unknown>;
        return kept as unknown as FocusState;
      },
    }
  )
);
