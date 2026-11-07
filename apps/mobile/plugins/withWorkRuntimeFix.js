const { withAppBuildGradle } = require('expo/config-plugins');

/**
 * O react-native-android-widget traz androidx.work:work-runtime-ktx 2.7.1, e outra dependência traz
 * androidx.work:work-runtime 2.8.1, que já inclui as mesmas classes. Sem esta exclusão, o Gradle falha em
 * checkReleaseDuplicateClasses. Excluir o -ktx é seguro: as extensões Kotlin vivem no work-runtime desde a 2.8.
 */
const MARK = '// flip-and-brew: work-runtime-ktx duplicado';

module.exports = function withWorkRuntimeFix(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.contents.includes(MARK)) return cfg;
    cfg.modResults.contents += `\n${MARK}\nconfigurations.configureEach {\n    exclude group: "androidx.work", module: "work-runtime-ktx"\n}\n`;
    return cfg;
  });
};
