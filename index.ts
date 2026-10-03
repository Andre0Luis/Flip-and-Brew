import 'expo-router/entry';
import { Platform } from 'react-native';

// O Android chama este manipulador, fora da interface do app, quando um widget é adicionado ou atualizado.
if (Platform.OS === 'android') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { registerWidgetTaskHandler } = require('react-native-android-widget') as typeof import('react-native-android-widget');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { widgetTaskHandler } = require('./src/widgets/android/widgetTaskHandler') as typeof import('./src/widgets/android/widgetTaskHandler');
  registerWidgetTaskHandler(widgetTaskHandler);
}
