/** Único ponto que importa o SDK de anúncios (nativo). Na web existe `adsSdk.web.ts`, vazio, para o bundle não puxar o módulo nativo. */
export type AdsSdk = typeof import('react-native-google-mobile-ads');

export function loadAdsSdk(): AdsSdk {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('react-native-google-mobile-ads') as AdsSdk;
}
