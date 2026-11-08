// Os passos do tutorial do Início, em ordem. Cada um diz onde o balão fica, para apontar a parte certa da tela.
export type TutorialPlace = 'top' | 'middle' | 'bottom' | 'tabs' | 'center';
export const TUTORIAL_STEPS: { id: 'top' | 'brewer' | 'start' | 'tabs' | 'done'; place: TutorialPlace }[] = [
  { id: 'top', place: 'top' },
  { id: 'brewer', place: 'middle' },
  { id: 'start', place: 'bottom' },
  { id: 'tabs', place: 'tabs' },
  { id: 'done', place: 'center' },
];
