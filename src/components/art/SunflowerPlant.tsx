import React, { useMemo } from 'react';
import Svg, { G, Path, Circle, Defs, RadialGradient, LinearGradient, Stop } from 'react-native-svg';
import { useArtColors } from '@/hooks/use-theme';
import type { PlantStage } from '@/store/useFocusStore';

export interface SunflowerPlantProps {
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

export function SunflowerPlant({ stage, health, size }: SunflowerPlantProps) {
  const c = useArtColors();
  const idx = getStageIndex(stage);
  
  const isDead = stage === 'dead';
  const isSick = health <= 50 || stage === 'wilting';
  const droop = isDead ? 40 : isSick ? 20 : 0;
  
  const trunkColor = isDead ? c.trunkShade : '#4CAF50';
  const leafColor = isDead ? c.trunkShade : isSick ? '#81C784' : '#2E7D32';
  const petalColor = isDead ? '#A1887F' : isSick ? '#FBC02D' : '#FFEB3B';
  const centerColor = isDead ? '#3E2723' : '#4E342E';

  // Math for growth
  const heightProgress = Math.min(1, Math.max(0, (idx - 1) / 10)); // Full height at stage 11
  const trunkHeight = heightProgress * 180;
  const showBud = idx >= 11;
  const isBlooming = idx >= 16; // Starts blooming later
  const bloomProgress = Math.min(1, Math.max(0, (idx - 16) / 4)); // Fully bloomed at 20

  if (idx === 0) return null;

  return (
    <Svg width={size} height={size * 1.2} viewBox="0 0 200 260">
      <Defs>
        <RadialGradient id="sunCenter" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={isDead ? '#2b1b18' : '#3e2723'} />
          <Stop offset="100%" stopColor={centerColor} />
        </RadialGradient>
        <LinearGradient id="sunLeaf" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={leafColor} />
          <Stop offset="100%" stopColor={isDead ? c.trunkShade : '#1B5E20'} />
        </LinearGradient>
      </Defs>

      <G transform={`translate(0, 250) rotate(${droop * 0.2}, 100, 0)`}>
        {/* Haste Principal */}
        {trunkHeight > 0 && (
          <Path 
            d={`M100,0 Q105,${-trunkHeight/2} 100,${-trunkHeight}`} 
            stroke={trunkColor} 
            strokeWidth={Math.max(3, trunkHeight/15)} 
            strokeLinecap="round" 
            fill="none" 
          />
        )}

        {/* Semente / Broto */}
        {idx === 1 && <Circle cx="100" cy="-5" r="5" fill="#5D4037" />}
        {idx === 2 && <Path d="M100,0 Q95,-10 100,-15" stroke="#81C784" strokeWidth="3" fill="none" />}

        {/* Folhas (Distribuídas ao longo da haste) */}
        {trunkHeight > 20 && Array.from({ length: Math.floor(trunkHeight / 25) }).map((_, i) => {
          const y = -(i + 1) * 25;
          const leafScale = 0.4 + (i * 0.1);
          const isLeft = i % 2 === 0;
          const rot = isLeft ? -40 - droop : 40 + droop;
          const leafPath = "M0,0 C20,-10 40,-5 45,-20 C30,-30 10,-20 0,0"; // Formato coração/lança
          return (
            <G key={`leaf-${i}`} transform={`translate(100, ${y}) scale(${isLeft ? -leafScale : leafScale}, ${leafScale}) rotate(${rot})`}>
              <Path d={leafPath} fill="url(#sunLeaf)" />
            </G>
          );
        })}

        {/* Flor / Botão */}
        {showBud && (
          <G transform={`translate(100, ${-trunkHeight}) rotate(${droop}, 0, 0)`}>
            {!isBlooming ? (
              // Botão Verde Fechado
              <Path d="M-15,0 C-20,-20 0,-30 0,-30 C0,-30 20,-20 15,0 Z" fill={leafColor} />
            ) : (
              // Flor de Girassol Aberta
              <G transform={`scale(${0.5 + (bloomProgress * 0.5)})`}>
                {/* Pétalas */}
                {Array.from({ length: 16 }).map((_, i) => (
                  <Path 
                    key={`petal-${i}`} 
                    d="M0,-15 C10,-35 0,-50 0,-50 C0,-50 -10,-35 0,-15" 
                    fill={petalColor} 
                    transform={`rotate(${(i * 360) / 16})`} 
                  />
                ))}
                {/* Miolo */}
                <Circle cx="0" cy="-15" r="18" fill="url(#sunCenter)" />
              </G>
            )}
          </G>
        )}
      </G>
    </Svg>
  );
}
