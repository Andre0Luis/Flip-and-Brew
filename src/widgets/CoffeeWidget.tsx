"use no memo";
import React from 'react';
import { FlexWidget, TextWidget, SvgWidget } from 'react-native-android-widget';
import { Colors } from '@/constants/theme';
import { plantPotSvg } from '@/components/art/plantSvg';
import type { PlantStage } from '@/store/useFocusStore';
import type { PotVariant } from '@/components/art/Pot';

export interface CoffeeWidgetData {
  stage: PlantStage;
  accumulated: number;
  focusing: boolean;
  pot: PotVariant;
  opens: number;
  closes: number;
  scheme: 'light' | 'dark';
}

export const DEFAULT_WIDGET_DATA: CoffeeWidgetData = {
  stage: 'seed_soil',
  accumulated: 0,
  focusing: false,
  pot: 'clay',
  opens: 0,
  closes: 0,
  scheme: 'dark',
};

function formatShort(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/**
 * Widget da cover screen do Z Flip 7. Mostra a planta (mesma arte do app,
 * via plantPotSvg) + o status do foco. Toque abre o app.
 */
export function CoffeeWidget({ stage, accumulated, focusing, pot, opens, closes, scheme }: CoffeeWidgetData) {
  const c = Colors[scheme];
  const svg = plantPotSvg({ stage, pot, scheme });

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: c.bg,
        borderRadius: 24,
        padding: 12,
      }}
    >
      <SvgWidget svg={svg} style={{ width: 104, height: 142 }} />
      <TextWidget
        text={focusing ? 'Cultivando…' : 'Em pausa'}
        style={{ fontSize: 12, color: c.accent, fontWeight: '700', marginTop: 4 }}
      />
      <TextWidget
        text={formatShort(accumulated)}
        style={{ fontSize: 18, color: c.textPrimary, fontWeight: 'bold' }}
      />
      <FlexWidget style={{ flexDirection: 'row', marginTop: 2 }}>
        <TextWidget
          text={`▽ ${closes}`}
          style={{ fontSize: 11, color: c.leaf, fontWeight: '700', marginRight: 8 }}
        />
        <TextWidget
          text={`△ ${opens}`}
          style={{ fontSize: 11, color: c.textSecondary, fontWeight: '600' }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

export default CoffeeWidget;
