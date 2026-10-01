import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import type { CoffeeWidgetData } from './CoffeeWidget';
import { DEFAULT_WIDGET_DATA } from './CoffeeWidget';

/**
 * Ponte de dados app → widget via arquivo JSON no `documentDirectory`
 * (= `context.filesDir` no Android), lido nativamente pelo task handler do
 * widget. Evita depender do MMKV Nitro (C++) em outro processo.
 */
const WIDGET_FILE = FileSystem.Paths.document.uri + 'widget_state.json';

export async function writeWidgetState(data: CoffeeWidgetData) {
  try {
    await FileSystem.writeAsStringAsync(WIDGET_FILE, JSON.stringify(data));
  } catch {
    // best-effort: o widget cai no default se o arquivo não existir
  }
}

export async function readWidgetState(): Promise<CoffeeWidgetData> {
  try {
    const info = await FileSystem.getInfoAsync(WIDGET_FILE);
    if (!info.exists) return DEFAULT_WIDGET_DATA;
    const json = await FileSystem.readAsStringAsync(WIDGET_FILE);
    return { ...DEFAULT_WIDGET_DATA, ...JSON.parse(json) };
  } catch {
    return DEFAULT_WIDGET_DATA;
  }
}

/**
 * Pede ao Android pra re-renderizar o widget agora (ex.: ao fechar o flip /
 * iniciar foco). Só roda no Android e ignora se o widget não estiver na tela.
 */
export async function refreshWidget(data: CoffeeWidgetData) {
  if (Platform.OS !== 'android') return;
  try {
    const { requestWidgetUpdate } = await import('react-native-android-widget');
    const React = await import('react');
    const { CoffeeWidget } = await import('./CoffeeWidget');
    await requestWidgetUpdate({
      widgetName: 'Coffee',
      renderWidget: () => React.createElement(CoffeeWidget, data),
      widgetNotFound: () => {},
    });
  } catch {
    // widget não adicionado / plataforma sem suporte
  }
}
