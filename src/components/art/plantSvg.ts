import { ArtColors, type ArtPalette } from '@/constants/theme';
import type { PlantStage } from '@/store/useFocusStore';
import type { PotVariant } from './Pot';
import {
  LEAVES,
  FRUITS,
  LEAF_PATH,
  LEAF_MIDRIB,
  TRUNK_PATH,
  BRANCHES,
  leafCount,
  showsFruit,
  branchCount,
  getFruitColor,
} from './plantData';

/**
 * Gera a árvore de café (+ vaso) como STRING SVG, para o widget Android
 */

export interface PlantSvgOptions {
  stage: PlantStage;
  pot?: PotVariant;
  scheme?: 'light' | 'dark';
}

function potSvg(variant: PotVariant, c: ArtPalette): string {
  const body = variant === 'glass' ? c.potGlass : variant === 'ceramic' ? c.potCeramic : c.potClay;
  const opacity = variant === 'glass' ? 0.8 : 1;
  return `
    <path d="M58,258 L70,322 Q72,330 80,330 L120,330 Q128,330 130,322 L142,258 Z"
      fill="${body}" fill-opacity="${opacity}" stroke="${c.outline}" stroke-width="2" stroke-linejoin="round"/>
    <ellipse cx="100" cy="256" rx="44" ry="10" fill="${body}" fill-opacity="${opacity}" stroke="${c.outline}" stroke-width="2"/>
    <ellipse cx="100" cy="256" rx="36" ry="6.5" fill="${c.soil}"/>
  `;
}

export function plantPotSvg({ stage, pot = 'clay', scheme = 'dark' }: PlantSvgOptions): string {
  const c = ArtColors[scheme];

  const sick = stage === 'wilting' || stage === 'dead';
  const isDead = stage === 'dead';
  const leafFill = isDead ? c.trunkShade : sick ? c.leafDark : c.leaf;
  const fruitFill = getFruitColor(stage);
  const showFruitsOrFlowers = showsFruit(stage);
  const isFlowering = fruitFill === '#FFFFFF';
  const droop = stage === 'wilting' ? 14 : stage === 'dead' ? 26 : 0;

  let plant = '';

  if (stage === 'empty') {
    plant = '';
  } else if (stage === 'seed_soil') {
    plant = `<ellipse cx="100" cy="245" rx="15" ry="4" fill="${c.trunk}" opacity="0.5" />`;
  } else if (stage === 'seedling_emergence') {
    plant = `<path d="M100,250 C98,240 105,230 100,220" stroke="${c.leafLight}" stroke-width="4" stroke-linecap="round" fill="none" />`;
  } else {
    const trunkColor = isDead ? c.trunkShade : c.trunk;
    const branchColor = isDead ? c.trunkShade : c.branch;
    const currentBranches = BRANCHES.slice(0, branchCount(stage));
    
    const trunk =
      `<path d="${TRUNK_PATH}" stroke="${trunkColor}" stroke-width="10" stroke-linecap="round" fill="none"/>` +
      currentBranches.map(
        (b) =>
          `<path d="${b.d}" stroke="${branchColor}" stroke-width="${b.w}" stroke-linecap="round" fill="none"/>`,
      ).join('');

    const currentLeaves = LEAVES.slice(0, leafCount(stage));
    const leaves = isDead
      ? ''
      : currentLeaves
          .map((l) => {
            const rot = l.rot + droop * (l.x < 100 ? 0.4 : -0.4);
            const t = `translate(${l.x},${l.y}) rotate(${rot}) scale(${l.scale})`;
            return (
              `<path d="${LEAF_PATH}" fill="${leafFill}" stroke="${c.outline}" stroke-width="1.4" transform="${t}"/>` +
              `<path d="${LEAF_MIDRIB}" stroke="${c.outline}" stroke-width="0.8" stroke-opacity="0.4" fill="none" transform="${t}"/>`
            );
          })
          .join('');

    const fruits = (!isDead && showFruitsOrFlowers)
      ? FRUITS.map((f) => {
          const t = `translate(${f.x},${f.y}) scale(${f.scale})`;
          if (isFlowering) {
             return `<path d="M0,-5 L1.5,-1.5 L5,0 L1.5,1.5 L0,5 L-1.5,1.5 L-5,0 L-1.5,-1.5 Z" fill="#FFFFFF" transform="${t}"/>`;
          }
          if (fruitFill === 'transparent') return '';
          return `<circle cx="0" cy="0" r="5" fill="${fruitFill}" stroke="${c.outline}" stroke-width="0.8" transform="${t}"/>`;
        }).join('')
      : '';

    // droop aplicado ao grupo inteiro a partir da base do vaso
    plant = `<g transform="rotate(${droop * 0.15}, 100, 250)">${trunk}${leaves}${fruits}</g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 340">${potSvg(pot, c)}${plant}</svg>`;
}
