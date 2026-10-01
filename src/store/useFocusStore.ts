import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';
import { writeWidgetState, refreshWidget } from '@/widgets/widgetState';
import type { CoffeeWidgetData } from '@/widgets/CoffeeWidget';

export const mmkvStorage = createMMKV({
  id: 'flip-and-brew-storage',
});

const zustandStorage: StateStorage = {
  setItem: (name, value) => mmkvStorage.set(name, value),
  getItem: (name) => mmkvStorage.getString(name) ?? null,
  removeItem: (name) => mmkvStorage.remove(name),
};

export type PlantStage = 
  | 'empty'
  | 'seed_soil'
  | 'seedling_emergence'
  | 'cotyledon'
  | 'first_true_leaves'
  | 'early_vegetative_1'
  | 'early_vegetative_2'
  | 'vegetative_1'
  | 'vegetative_2'
  | 'bushy_vegetative'
  | 'pre_flowering'
  | 'flowering_buds'
  | 'flowering_full'
  | 'flowers_drop'
  | 'pinhead_fruits'
  | 'small_green_fruits'
  | 'large_green_fruits'
  | 'yellow_fruits'
  | 'orange_fruits'
  | 'light_red_fruits'
  | 'harvestable'
  | 'wilting'
  | 'dead';

export interface FocusState {
  // Core Focus
  isFocusing: boolean;
  startTime: number | null;
  accumulatedTime: number;
  
  // Economy & Status
  coins: number;
  health: number; // 0 to 100
  plantStage: PlantStage;

  // Z Flip 7 — contagem de aberturas/fechamentos da concha
  flipOpens: number;
  flipCloses: number;
  
  // Inventories
  unlockedBrewers: string[];
  unlockedPots: string[];
  unlockedCups: string[];
  unlockedSeeds: string[];

  // Selections
  selectedBrewer: string;
  selectedPot: string;
  selectedCup: string;
  selectedSeed: string;

  // Economy Timestamps
  lastLoginDate: string;
  lastActionDate: string;
  dailyActionsCount: number;
  
  // Actions
  startFocus: () => void;
  breakFocus: () => void;
  addTime: (timeMs: number) => void;
  takeDamage: () => void;
  buyItem: (type: 'brewer' | 'pot' | 'cup' | 'seed', id: string, price: number) => boolean;
  selectItem: (type: 'brewer' | 'pot' | 'cup' | 'seed', id: string) => void;
  plantNewSeed: () => void;
  buyCoins: (amount: number) => void;
  registerFlip: (kind: 'open' | 'close') => void;
  syncBackgroundTime: () => void;
  syncDailyFlips: (count: number) => void;
  harvestCoffee: () => void;
  waterPlant: () => void;
  checkDailyLogin: () => boolean;
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      isFocusing: false,
      startTime: null,
      accumulatedTime: 0,
      
      coins: 5000,
      health: 100,
      plantStage: 'seed_soil', // Starts with a planted seed

      flipOpens: 0,
      flipCloses: 0,
      
      unlockedBrewers: ['v60'], // Default unlocked
      unlockedPots: ['clay'], // Default unlocked
      unlockedCups: ['cup_1'], // Default unlocked
      unlockedSeeds: ['coffee'], // Default unlocked
      
      selectedBrewer: 'v60',
      selectedPot: 'clay',
      selectedCup: 'cup_1',
      selectedSeed: 'coffee',

      lastLoginDate: '',
      lastActionDate: '',
      dailyActionsCount: 0,

      startFocus: () => set({ 
        isFocusing: true, 
        startTime: Date.now() 
      }),
      
      breakFocus: () => set({ 
        isFocusing: false, 
        startTime: null 
      }),
      
      addTime: (timeMs) => set((state) => {
        if (state.plantStage === 'empty' || state.plantStage === 'dead') {
          return { accumulatedTime: Math.max(0, state.accumulatedTime + timeMs) };
        }

        const newTime = Math.max(0, state.accumulatedTime + timeMs);
        let newStage: PlantStage = 'seed_soil';
        
        const m = 60000;
        if (newTime >= m * 228) newStage = 'harvestable';          // > 3h 48m
        else if (newTime >= m * 216) newStage = 'light_red_fruits';
        else if (newTime >= m * 204) newStage = 'orange_fruits';
        else if (newTime >= m * 192) newStage = 'yellow_fruits';
        else if (newTime >= m * 180) newStage = 'large_green_fruits';
        else if (newTime >= m * 168) newStage = 'small_green_fruits';
        else if (newTime >= m * 156) newStage = 'pinhead_fruits';
        else if (newTime >= m * 144) newStage = 'flowers_drop';
        else if (newTime >= m * 132) newStage = 'flowering_full';
        else if (newTime >= m * 120) newStage = 'flowering_buds';
        else if (newTime >= m * 108) newStage = 'pre_flowering';
        else if (newTime >= m * 96) newStage = 'bushy_vegetative';
        else if (newTime >= m * 84) newStage = 'vegetative_2';
        else if (newTime >= m * 72) newStage = 'vegetative_1';
        else if (newTime >= m * 60) newStage = 'early_vegetative_2';
        else if (newTime >= m * 48) newStage = 'early_vegetative_1';
        else if (newTime >= m * 36) newStage = 'first_true_leaves';
        else if (newTime >= m * 24) newStage = 'cotyledon';
        else if (newTime >= m * 12) newStage = 'seedling_emergence';
        else newStage = 'seed_soil';

        // Quantas moedas a pessoa deveria ter pelo tempo novo vs tempo antigo
        const coinsOld = Math.floor(state.accumulatedTime / 60000);
        const coinsNew = Math.floor(newTime / 60000);
        const coinDiff = coinsNew - coinsOld;

        return { 
          accumulatedTime: newTime, 
          plantStage: newStage,
          coins: Math.max(0, state.coins + coinDiff)
        };
      }),

      takeDamage: () => set((state) => {
        if (state.plantStage === 'empty' || state.plantStage === 'dead') return {};

        const newHealth = Math.max(0, state.health - 25);
        let newStage: PlantStage = state.plantStage;

        if (newHealth <= 0) {
          newStage = 'dead';
        } else if (newHealth <= 50) {
          newStage = 'wilting';
        }

        return { health: newHealth, plantStage: newStage };
      }),

      buyItem: (type, id, price) => {
        const state = get();
        if (state.coins >= price) {
          const inventoryKey = type === 'brewer' ? 'unlockedBrewers' : type === 'pot' ? 'unlockedPots' : type === 'seed' ? 'unlockedSeeds' : 'unlockedCups';
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
        if (type === 'seed' && state.unlockedSeeds.includes(id)) {
          if (state.selectedSeed !== id) {
            return { selectedSeed: id, plantStage: 'seed_soil', accumulatedTime: 0, health: 100 };
          }
          return { selectedSeed: id };
        }
        return {};
      }),

      plantNewSeed: () => set({ 
        plantStage: 'seed_soil', 
        health: 100, 
        accumulatedTime: 0 
      }),

      buyCoins: (amount) => set((state) => ({ coins: state.coins + amount })),

      registerFlip: (kind) =>
        set((state) => {
          if (kind === 'open') {
            // Opening the flip (using phone) damages the plant slightly
            let newHealth = state.health;
            let newStage = state.plantStage;
            if (state.plantStage !== 'empty' && state.plantStage !== 'dead') {
              newHealth = Math.max(0, state.health - 15);
              if (newHealth <= 0) newStage = 'dead';
              else if (newHealth <= 50) newStage = 'wilting';
            }
            return { flipOpens: state.flipOpens + 1, health: newHealth, plantStage: newStage };
          }
          return { flipCloses: state.flipCloses + 1 };
        }),

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

      syncDailyFlips: (count: number) => {
        set({ flipOpens: count });
      },

      harvestCoffee: () => {
        const state = get();
        if (state.plantStage === 'harvestable') {
          const today = new Date().toISOString().split('T')[0];
          let extraCoins = 0;
          let newActionsCount = state.dailyActionsCount;

          if (state.lastActionDate !== today) {
            newActionsCount = 1;
            extraCoins = 10;
          } else if (state.dailyActionsCount < 2) {
            newActionsCount++;
            extraCoins = 10;
          }

          set({
            coins: state.coins + 200 + extraCoins, // 200 from normal harvest + 10 daily reward if eligible
            accumulatedTime: 60000 * 108,
            plantStage: 'pre_flowering',
            lastActionDate: today,
            dailyActionsCount: newActionsCount
          });
        }
      },

      waterPlant: () => {
        const state = get();
        if (state.plantStage === 'dead' || state.plantStage === 'empty') return;
        
        const today = new Date().toISOString().split('T')[0];
        let extraCoins = 0;
        let newActionsCount = state.dailyActionsCount;

        if (state.lastActionDate !== today) {
          newActionsCount = 1;
          extraCoins = 10;
        } else if (state.dailyActionsCount < 2) {
          newActionsCount++;
          extraCoins = 10;
        }

        let newStage = state.plantStage;
        if (state.plantStage === 'wilting') {
          // Volta para o estágio correspondente ao seu accumulatedTime (já que health voltou pra 100)
          // Mas como não podemos recalcular toda a arvore sem chamar o mesmo bloco,
          // Vamos fazer uma pequena lógica para voltar pra adulto ou apenas voltar pra harvestable
          newStage = 'harvestable'; // Simplificando por enquanto, ou a gente recalcula.
        }
        
        set({
          health: 100,
          plantStage: newStage,
          coins: state.coins + extraCoins,
          lastActionDate: today,
          dailyActionsCount: newActionsCount
        });
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
    }
  )
);

/**
 * Espelha o estado relevante para o widget Android (react-native-android-widget):
 * grava um JSON no documentDirectory (lido nativamente pelo task handler) e pede
 * um refresh imediato — para a planta na cover screen reagir ao iniciar/quebrar foco.
 */
function syncWidget(state: FocusState) {
  const data: CoffeeWidgetData = {
    stage: state.plantStage,
    accumulated: state.accumulatedTime,
    focusing: state.isFocusing,
    pot: state.selectedPot as CoffeeWidgetData['pot'],
    opens: state.flipOpens,
    closes: state.flipCloses,
    scheme: 'dark',
  };
  writeWidgetState(data);
  void refreshWidget(data);
}

syncWidget(useFocusStore.getState());
useFocusStore.subscribe(syncWidget);
