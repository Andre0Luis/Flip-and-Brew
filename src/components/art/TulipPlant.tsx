import React from 'react';
import Svg, { G, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useArtColors } from '@/hooks/use-theme';
import type { PlantStage } from '@/store/useFocusStore';

export interface TulipPlantProps {
  stage: PlantStage;
  health: number;
  size: number;
}

const STAGE_ORDER: PlantStage[] = [
  'empty', 'seed_soil', 'seedling_emergence', 'cotyledon', 'first_true_leaves',
  'early_vegetative_1', 'early_vegetative_2', 'vegetative_1', 'vegetative_2',
  'bushy_vegetative', 'pre_flowering', 'flowering_buds', 'flowering_full',
  'flowers_drop', 'pinhead_fruits', 'small_green_fruits', 'large_green_fruits',
  'yellow_fruits', 'orange_fruits', 'light_red_fruits', 'harvestable', 'wilting', 'dead'
];

function getStageIndex(stage: PlantStage) {
  return STAGE_ORDER.indexOf(stage);
}

export function TulipPlant({ stage, health, size }: TulipPlantProps) {
  const c = useArtColors();
  const idx = getStageIndex(stage);
  
  const isDead = stage === 'dead';
  const isSick = health <= 50 || stage === 'wilting';
  const droop = isDead ? 50 : isSick ? 25 : 0;
  
  const leafColor = isDead ? c.trunkShade : isSick ? '#9CCC65' : '#558B2F';
  const petalColor = isDead ? '#A1887F' : isSick ? '#FF8A65' : '#E53935';
  
  // Math for growth
  const leafGrowth = Math.min(1, Math.max(0, (idx - 2) / 8)); // Leaves fully grown at 10
  const stemGrowth = Math.min(1, Math.max(0, (idx - 10) / 6)); // Stem grown at 16
  const stemHeight = stemGrowth * 140;
  const bloomProgress = Math.min(1, Math.max(0, (idx - 16) / 4)); // Fully open at 20

  if (idx === 0) return null;

  return (
    <Svg width={size} height={size * 1.2} viewBox="0 0 200 260">
      <Defs>
        <LinearGradient id="tulipLeaf" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={leafColor} />
          <Stop offset="100%" stopColor={isDead ? c.trunkShade : '#33691E'} />
        </LinearGradient>
        <LinearGradient id="tulipPetal" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={petalColor} />
          <Stop offset="100%" stopColor={isDead ? '#5D4037' : '#C62828'} />
        </LinearGradient>
      </Defs>

      <G transform={`translate(0, 250)`}>
        {/* Bulbo / Broto inicial */}
        {idx === 1 && <Path d="M90,0 Q100,-15 110,0 Z" fill="#795548" />}
        {idx === 2 && <Path d="M95,0 Q100,-20 105,0 Z" fill={leafColor} />}

        <G transform={`rotate(${droop * 0.3}, 100, 0)`}>
          {/* Folhas base longas (Tulipa) */}
          {leafGrowth > 0 && (
            <>
              {/* Folha Esquerda */}
              <Path 
                d={`M95,0 Q50,${-50 * leafGrowth} 60,${-120 * leafGrowth} Q80,${-80 * leafGrowth} 98,0 Z`} 
                fill="url(#tulipLeaf)" 
              />
              {/* Folha Direita */}
              <Path 
                d={`M105,0 Q150,${-40 * leafGrowth} 140,${-100 * leafGrowth} Q120,${-70 * leafGrowth} 102,0 Z`} 
                fill="url(#tulipLeaf)" 
              />
            </>
          )}

          {/* Haste Lisa */}
          {stemHeight > 0 && (
            <Path 
              d={`M100,0 L100,${-stemHeight}`} 
              stroke={leafColor} 
              strokeWidth="6" 
              strokeLinecap="round" 
            />
          )}

          {/* Flor (Copo da Tulipa) */}
          {stemHeight > 0 && idx >= 11 && (
            <G transform={`translate(100, ${-stemHeight}) rotate(${droop * 0.5}, 0, 0)`}>
              {bloomProgress === 0 ? (
                // Botão Fechado Verde/Avermelhado
                <Path d="M-10,0 C-15,-20 -5,-30 0,-35 C5,-30 15,-20 10,0 Z" fill={leafColor} />
              ) : (
                // Flor Abrindo
                <G transform={`scale(${0.6 + bloomProgress * 0.4})`}>
                  {/* Pétala de trás */}
                  <Path d="M-8,5 C-10,-10 0,-35 0,-35 C0,-35 10,-10 8,5 Z" fill="#B71C1C" />
                  {/* Pétala Esquerda */}
                  <Path d={`M-5,5 C-25,-10 -20,-30 -15,-35 C-5,-20 0,-10 0,5 Z`} fill="url(#tulipPetal)" />
                  {/* Pétala Direita */}
                  <Path d={`M5,5 C25,-10 20,-30 15,-35 C5,-20 0,-10 0,5 Z`} fill="url(#tulipPetal)" />
                  {/* Pétala Frontal */}
                  <Path d="M-12,2 C-15,-15 0,-30 0,-30 C0,-30 15,-15 12,2 C5,10 -5,10 -12,2 Z" fill="url(#tulipPetal)" />
                </G>
              )}
            </G>
          )}
        </G>
      </G>
    </Svg>
  );
}
