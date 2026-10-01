import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { CoffeeWidget } from './CoffeeWidget';
import { readWidgetState } from './widgetState';

/**
 * Headless task que o Android chama quando o widget é adicionado/atualizado/
 * redimensionado. Lê o estado persistido em JSON e renderiza a planta atual.
 * Atualizações imediatas (ao iniciar foco) vêm do app via `refreshWidget`.
 */
const nameToWidget = {
  Coffee: CoffeeWidget,
};

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  try {
    const widgetName = props.widgetInfo.widgetName as keyof typeof nameToWidget;
    const Widget = nameToWidget[widgetName];
    if (!Widget) return;

    switch (props.widgetAction) {
      case 'WIDGET_ADDED':
      case 'WIDGET_UPDATE':
      case 'WIDGET_RESIZED':
      case 'WIDGET_CLICK': {
        const data = await readWidgetState();
        props.renderWidget(<Widget {...data} />);
        break;
      }
      case 'WIDGET_DELETED':
      default:
        break;
    }
  } catch (error) {
    // Evita crash no LogBoxData quando rodando em modo Headless JS 
    console.warn('Erro silencioso no widgetTaskHandler (Headless Task):', error);
  }
}
