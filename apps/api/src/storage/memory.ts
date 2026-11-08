import type { StorageProvider } from './provider.js';

/** Armazenamento de mentira para testes e desenvolvimento local: devolve links previsíveis e anota o que foi removido. */
export function memoryStorage(): StorageProvider & { removed: string[] } {
  const removed: string[] = [];
  return {
    removed,
    signUpload: async (path) => `https://storage.local/upload/${path}`,
    signRead: async (paths) => new Map(paths.map((p) => [p, `https://storage.local/read/${p}`])),
    remove: async (paths) => void removed.push(...paths),
  };
}
