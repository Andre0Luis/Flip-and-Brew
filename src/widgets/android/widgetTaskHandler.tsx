import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { appStorage } from '@/store/storage';
import { buildWidgetData, WIDGET_DATA_KEY, withLiveBrew, type WidgetData } from '@/lib/widgetData';
import { WIDGETS, WidgetError, type WidgetName } from './widgets';

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
      try {
        props.renderWidget(<Widget data={readWidgetData()} />);
      } catch (e) {
        // Um widget em branco não diz nada. Se a montagem falhar, o próprio widget mostra o motivo.
        props.renderWidget(<WidgetError message={e instanceof Error ? e.message : String(e)} />);
      }
      break;
    default:
      break;
  }
}
