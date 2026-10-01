import type { StateStorage } from 'zustand/middleware';

type KV = { get(k: string): string | null; set(k: string, v: string): void; del(k: string): void };

function makeKV(): KV {
  // MMKV é nativo. Na web ou num build sem o módulo, cai para localStorage e, por último, memória.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createMMKV } = require('react-native-mmkv');
    const mm = createMMKV({ id: 'flip-and-brew' });
    return {
      get: (k) => mm.getString(k) ?? null,
      set: (k, v) => mm.set(k, v),
      del: (k) => mm.remove(k),
    };
  } catch {
    // segue para o próximo
  }
  try {
    if (typeof localStorage !== 'undefined') {
      return {
        get: (k) => localStorage.getItem(k),
        set: (k, v) => localStorage.setItem(k, v),
        del: (k) => localStorage.removeItem(k),
      };
    }
  } catch {
    // segue para memória
  }
  const mem = new Map<string, string>();
  return { get: (k) => mem.get(k) ?? null, set: (k, v) => void mem.set(k, v), del: (k) => void mem.delete(k) };
}

const kv = makeKV();

export const appStorage: StateStorage = {
  getItem: (name) => kv.get(name),
  setItem: (name, value) => kv.set(name, value),
  removeItem: (name) => kv.del(name),
};
