Pod::Spec.new do |s|
  s.name           = 'UsageStats'
  s.version        = '1.0.0'
  s.summary        = 'Tempo de tela estimado pelo Tempo de Uso do iPhone (Family Controls e Device Activity)'
  s.description    = 'Pede a autorização do Tempo de Uso, liga o monitor diário e lê o que a extensão grava no App Group.'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.license        = 'MIT'
  s.platforms      = {
    :ios => '16.4'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'FamilyControls', 'DeviceActivity', 'SwiftUI'

  s.source_files = "**/*.{h,m,swift}"
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
