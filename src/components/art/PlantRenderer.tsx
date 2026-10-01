import React from 'react';
import type { PlantStage } from '@/store/useFocusStore';
import { CoffeePlant } from './CoffeePlant';
import { SunflowerPlant } from './SunflowerPlant';
import { TulipPlant } from './TulipPlant';

export interface PlantRendererProps {
  seed: string;
  stage: PlantStage;
  health: number;
  size: number;
}

export function PlantRenderer({ seed, stage, health, size }: PlantRendererProps) {
  switch (seed) {
    case 'sunflower':
      return <SunflowerPlant stage={stage} health={health} size={size} />;
    case 'tulip':
      return <TulipPlant stage={stage} health={health} size={size} />;
    case 'coffee':
    default:
      return <CoffeePlant stage={stage} health={health} size={size} />;
  }
}
