import type { PlantStage } from '@/store/useFocusStore';

export type LeafSpec = { x: number; y: number; rot: number; scale: number; stage: number };
export type FruitSpec = { x: number; y: number; scale: number; stage: number };
export type BranchSpec = { d: string; w: number; stage: number };

// Folha mais desenhada (arábica) com drip tip
export const LEAF_PATH = 'M0,0 C12,-15 16,-30 10,-45 C6,-55 3,-62 0,-68 C-3,-62 -6,-55 -10,-45 C-16,-30 -12,-15 0,0 Z';
export const LEAF_MIDRIB = 'M0,-2 C2,-25 0,-45 0,-65';

export const TRUNK_PATH = 'M100,250 C95,200 105,150 100,60'; // Tronco mais alto

export const STAGE_INDEX: Record<PlantStage, number> = {
  empty: 0,
  seed_soil: 1,
  seedling_emergence: 2,
  cotyledon: 3,
  first_true_leaves: 4,
  early_vegetative_1: 5,
  early_vegetative_2: 6,
  vegetative_1: 7,
  vegetative_2: 8,
  bushy_vegetative: 9,
  pre_flowering: 10,
  flowering_buds: 11,
  flowering_full: 12,
  flowers_drop: 13,
  pinhead_fruits: 14,
  small_green_fruits: 15,
  large_green_fruits: 16,
  yellow_fruits: 17,
  orange_fruits: 18,
  light_red_fruits: 19,
  harvestable: 20,
  wilting: 20,
  dead: 20
};

// Gerador procedural determinístico para o arbusto de café
function generateCoffeeBush() {
  const branches: BranchSpec[] = [];
  const leaves: LeafSpec[] = [];
  const fruits: FruitSpec[] = [];

  // Cotyledons (orelha de onça) - Stage 3
  leaves.push({ x: 96, y: 220, rot: -70, scale: 0.3, stage: 3 });
  leaves.push({ x: 104, y: 220, rot: 70, scale: 0.3, stage: 3 });

  // Níveis do caule principal (nós)
  const nodes = [
    { y: 190, stage: 4, width: 80 },
    { y: 160, stage: 5, width: 110 },
    { y: 135, stage: 6, width: 130 },
    { y: 110, stage: 7, width: 140 },
    { y: 85,  stage: 8, width: 120 },
    { y: 65,  stage: 9, width: 90 },
  ];

  nodes.forEach((node, idx) => {
    // Tronco curva levemente, x varia em torno de 100
    const cx = 100 + Math.sin(node.y * 0.05) * 4;
    
    // Branch left
    const blx = cx - node.width / 2;
    const bly = node.y + 15;
    branches.push({ d: `M${cx},${node.y} Q${cx - 20},${node.y - 5} ${blx},${bly}`, w: 3 - (idx * 0.2), stage: node.stage });
    
    // Branch right
    const brx = cx + node.width / 2;
    const bry = node.y + 15;
    branches.push({ d: `M${cx},${node.y} Q${cx + 20},${node.y - 5} ${brx},${bry}`, w: 3 - (idx * 0.2), stage: node.stage });

    // Folhas ao longo dos galhos
    const leavesPerBranch = Math.max(1, 4 - Math.floor(idx / 2));
    for (let l = 1; l <= leavesPerBranch; l++) {
      const f = l / leavesPerBranch;
      // Esq
      leaves.push({
        x: cx - (node.width / 2) * f,
        y: node.y + 15 * f,
        rot: -60 - (f * 20) + (Math.random() * 10),
        scale: 0.6 + (1 - f) * 0.4,
        stage: node.stage + (l > 1 ? 1 : 0) // Folhas nas pontas demoram 1 estagio a mais
      });
      // Dir
      leaves.push({
        x: cx + (node.width / 2) * f,
        y: node.y + 15 * f,
        rot: 60 + (f * 20) - (Math.random() * 10),
        scale: 0.6 + (1 - f) * 0.4,
        stage: node.stage + (l > 1 ? 1 : 0)
      });
    }

    // Frutos agrupados nos nós principais (axilas)
    if (idx < 5) {
      for (let f = 0; f < 4; f++) {
        fruits.push({
          x: cx - 6 - Math.random() * 8,
          y: node.y - 2 + Math.random() * 8,
          scale: 0.8 + Math.random() * 0.4,
          stage: 11
        });
        fruits.push({
          x: cx + 6 + Math.random() * 8,
          y: node.y - 2 + Math.random() * 8,
          scale: 0.8 + Math.random() * 0.4,
          stage: 11
        });
      }
    }
  });

  // Coroa (Topo)
  leaves.push({ x: 98, y: 55, rot: -20, scale: 0.6, stage: 9 });
  leaves.push({ x: 102, y: 50, rot: 20, scale: 0.6, stage: 9 });
  leaves.push({ x: 100, y: 40, rot: 0, scale: 0.5, stage: 10 });

  return { branches, leaves, fruits };
}

export const BUSH = generateCoffeeBush();
export const BRANCHES = BUSH.branches;
export const LEAVES = BUSH.leaves;
export const FRUITS = BUSH.fruits;

export function leafCount(stage: PlantStage): number {
  const s = STAGE_INDEX[stage];
  return LEAVES.filter(l => l.stage <= s).length;
}

export function branchCount(stage: PlantStage): number {
  const s = STAGE_INDEX[stage];
  return BRANCHES.filter(b => b.stage <= s).length;
}

export function showsFruit(stage: PlantStage): boolean {
  return STAGE_INDEX[stage] >= STAGE_INDEX['flowering_buds'];
}

export function getFruitColor(stage: PlantStage): string {
  const s = STAGE_INDEX[stage];
  if (s < STAGE_INDEX['flowers_drop']) return '#FFFFFF'; // Flores brancas
  if (s === STAGE_INDEX['pinhead_fruits']) return '#8BC34A'; // Verde clarinho/pequeno
  if (s <= STAGE_INDEX['large_green_fruits']) return '#4CAF50'; // Verde forte
  if (s === STAGE_INDEX['yellow_fruits']) return '#FDD835'; // Amarelo
  if (s === STAGE_INDEX['orange_fruits']) return '#FB8C00'; // Laranja
  if (s === STAGE_INDEX['light_red_fruits']) return '#E53935'; // Vermelho claro
  if (s >= STAGE_INDEX['harvestable']) return '#B71C1C'; // Cereja escuro
  return 'transparent';
}
