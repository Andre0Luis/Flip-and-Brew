import { create } from 'zustand';
import { fetchPro, listenPro, restore } from '@/lib/purchases';
import { NO_PRO, type ProInfo } from '@/lib/proRules';

type ProState = ProInfo & {
  refresh: () => Promise<void>;
  restore: () => Promise<void>;
  set: (p: ProInfo) => void;
};

/** Estado do Pro. Não é persistido: o RevenueCat guarda o cache e o app abre offline sem problema. */
export const usePro = create<ProState>((set) => ({
  ...NO_PRO,
  set: (p) => set(p),
  refresh: async () => set(await fetchPro()),
  restore: async () => set(await restore()),
}));

let stop: (() => void) | null = null;

/** Chame uma vez ao abrir o app. */
export function startPro() {
  if (stop) return;
  void usePro.getState().refresh();
  stop = listenPro((p) => usePro.getState().set(p));
}
