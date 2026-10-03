import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { appStorage } from '@/store/storage';
import { buildWidgetData, WIDGET_DATA_KEY, withLiveBrew, type WidgetData } from '@/lib/widgetData';
import { WIDGETS, type WidgetName } from './widgets';

/** Lê o último retrato gravado pelo app. Sem ele, mostra um widget vazio em português. */
export function readWidgetData(): WidgetData {
  try {
    const raw = appStorage.getItem(WIDGET_DATA_KEY);
    if (typeof raw === 'string') return withLiveBrew(JSON.parse(raw) as WidgetData);
  } catch {
    // cai no padrão
  }
  return buildWidgetData({ sessions: [], checkins: [], practicesDone: [], missionsClaimed: [], coins: 0, goalMin: 120, active: null, language: 'pt' });
}

/** Chamado pelo sistema quando um widget é adicionado, atualizado ou tocado. Roda sem a interface do app. */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const Widget = WIDGETS[props.widgetInfo.widgetName as WidgetName];
  if (!Widget) return;
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      props.renderWidget(<Widget data={readWidgetData()} />);
      break;
    default:
      break;
  }
}
