// Entry point: registra o task handler do widget Android ANTES de iniciar o
// app (o Android pode disparar o headless task sem a UI aberta), depois carrega
// o roteador do Expo Router.
import { Platform } from 'react-native';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from './src/widgets/widgetTaskHandler';

// Widget é Android-only; no iOS o módulo nativo é dummy e não deve registrar.
if (Platform.OS === 'android') {
  registerWidgetTaskHandler(widgetTaskHandler);
}

require('expo-router/entry');
