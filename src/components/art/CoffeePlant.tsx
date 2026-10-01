import React, { useMemo } from 'react';
import Svg, { G, Path, Circle, Ellipse, Defs, LinearGradient, RadialGradient, Stop } from 'react-native-svg';
import { useArtColors } from '@/hooks/use-theme';
import type { PlantStage } from '@/store/useFocusStore';
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
 * Árvore de café desenhada em SVG, por camadas (tronco → galhos → folhas → frutos).
 * Traço artesanal: strokes arredondados, formas orgânicas e leve assimetria.
 * O crescimento é controlado por `stage`; a saúde dessatura/curva nas fases ruins.
 *
 * Geometria compartilhada com o widget em `./plantData`.
 * viewBox 0 0 200 260 — a base do tronco fica em (100, 250) para "plantar" no vaso.
 */

export interface CoffeePlantProps {
  stage: PlantStage;
  /** 0..100 — abaixo de ~50 a planta murcha visualmente */
  health?: number;
  size?: number;
}

export function CoffeePlant({ stage, health = 100, size = 240 }: CoffeePlantProps) {
  const c = useArtColors();
  const w = size;
  const h = size * (260 / 200);

  const droop = stage === 'wilting' ? 14 : stage === 'dead' ? 26 : 0;
  const sick = stage === 'wilting' || stage === 'dead';
  const isDead = stage === 'dead';

  const leafFill = isDead ? c.trunkShade : sick ? c.leafDark : c.leaf;
  const leafLight = isDead ? c.trunk : sick ? c.leaf : c.leafLight;

  const currentLeaves = useMemo(() => LEAVES.slice(0, leafCount(stage)), [stage]);
  const currentBranches = useMemo(() => BRANCHES.slice(0, branchCount(stage)), [stage]);
  
  const showFruitsOrFlowers = showsFruit(stage);
  const fruitFill = getFruitColor(stage);
  const isFlowering = fruitFill === '#FFFFFF';

  // Se 'empty' não desenha nada
  if (stage === 'empty') return <Svg width={w} height={h} viewBox="0 0 200 260" />;

  const isSeedSoil = stage === 'seed_soil';
  const isSeedling = stage === 'seedling_emergence';

  return (
    <Svg width={w} height={h} viewBox="0 0 200 260">
      <Defs>
        <LinearGradient id="leafGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={leafLight} />
          <Stop offset="1" stopColor={leafFill} />
        </LinearGradient>
        <RadialGradient id="fruitGrad" cx="30%" cy="30%" r="70%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.8} />
          <Stop offset="20%" stopColor={fruitFill} />
          <Stop offset="100%" stopColor={fruitFill} stopOpacity={0.7} />
        </RadialGradient>
      </Defs>

      {isSeedSoil ? (
        // Semente plantada, apenas um relevo de terra
        <Ellipse cx={100} cy={245} rx={15} ry={4} fill={c.trunk} opacity={0.5} />
      ) : isSeedling ? (
        // Fósforo emergindo
        <Path d="M100,250 C98,240 105,230 100,220" stroke={c.leafLight} strokeWidth={4} strokeLinecap="round" fill="none" />
      ) : (
        <G rotation={droop * 0.15} origin="100, 250">
          {/* Tronco */}
          <Path
            d={TRUNK_PATH}
            stroke={isDead ? c.trunkShade : c.trunk}
            strokeWidth={10}
            strokeLinecap="round"
            fill="none"
          />
          {/* Galhos */}
          {currentBranches.map((b, i) => (
            <Path
              key={`branch-${i}`}
              d={b.d}
              stroke={isDead ? c.trunkShade : c.branch}
              strokeWidth={b.w}
              strokeLinecap="round"
              fill="none"
            />
          ))}

          {/* Folhas Arábicas */}
          {!isDead && currentLeaves.map((l, i) => (
            <G key={`leaf-${i}`} x={l.x} y={l.y} rotation={l.rot + droop * (l.x < 100 ? 0.4 : -0.4)}>
              <Path
                d={LEAF_PATH}
                fill="url(#leafGrad)"
                stroke={c.outline}
                strokeWidth={1.4}
                transform={`scale(${l.scale})`}
              />
              <Path d={LEAF_MIDRIB} stroke={c.outline} strokeWidth={0.8} opacity={0.4} transform={`scale(${l.scale})`} />
            </G>
          ))}

          {/* Frutos ou Flores */}
          {!isDead && showFruitsOrFlowers && FRUITS.map((f, i) => (
            <G key={`fruit-${i}`} x={f.x} y={f.y} transform={`scale(${f.scale})`}>
              {isFlowering ? (
                // Flor branca em forma de estrela simples
                <Path d="M0,-5 L1.5,-1.5 L5,0 L1.5,1.5 L0,5 L-1.5,1.5 L-5,0 L-1.5,-1.5 Z" fill="#FFFFFF" />
              ) : (
                // Cereja de café (esfera com radial gradient)
                <Circle cx={0} cy={0} r={5} fill={fruitFill !== 'transparent' ? "url(#fruitGrad)" : "transparent"} />
              )}
            </G>
          ))}
        </G>
      )}
    </Svg>
  );
}

export default CoffeePlant;
