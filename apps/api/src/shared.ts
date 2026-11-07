// Único ponto que importa o pacote compartilhado (packages/shared), por caminho relativo.
// Assim qualquer bundler (inclusive o da Vercel) resolve sem entender alias do tsconfig.
// Na Vercel, ligue "Include source files outside of the Root Directory in the Build Step" (a pasta fica fora de apps/api).
export * from '../../../packages/shared/src/index';
