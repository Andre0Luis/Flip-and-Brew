// Extensão do Tempo de Uso (ADR-0029): grava no App Group o tempo de tela estimado de cada dia.
/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'device-activity-monitor',
  name: 'ScreenTimeMonitor',
  bundleIdentifier: '.screen-time',
  deploymentTarget: '16.4',
  frameworks: ['DeviceActivity'],
  entitlements: {
    'com.apple.developer.family-controls': true,
    // O mesmo grupo dos widgets (expo-widgets), que o módulo usage-stats lê.
    'com.apple.security.application-groups': [`group.${config.ios.bundleIdentifier}`],
  },
});
