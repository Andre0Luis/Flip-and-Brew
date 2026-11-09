import DeviceActivity
import Foundation

/**
 * Roda fora do app, chamada pelo sistema (ADR-0029). O monitor diário tem um evento por limite de uso
 * ("m15", "m30"...); a cada um atingido, grava no App Group o maior limite do dia. O módulo usage-stats lê
 * esse número como tempo de tela. Memória da extensão é de poucos MB: nada além de UserDefaults aqui.
 */
class DeviceActivityMonitorExtension: DeviceActivityMonitor {
  override func intervalDidStart(for activity: DeviceActivityName) {
    super.intervalDidStart(for: activity)
    // Marca o dia como acompanhado, mesmo que ele termine sem nenhum limite atingido.
    ScreenTimeStore.record(minutes: 0)
  }

  override func eventDidReachThreshold(_ event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
    super.eventDidReachThreshold(event, activity: activity)
    guard event.rawValue.hasPrefix("m"), let minutes = Int(event.rawValue.dropFirst()) else { return }
    ScreenTimeStore.record(minutes: minutes)
  }
}

/// Mesmo formato de `ScreenTime` em `modules/usage-stats/ios/UsageStatsModule.swift`: dia local "yyyy-MM-dd" para minutos.
enum ScreenTimeStore {
  private static let daysKey = "screenTime.days"
  private static let keepDays = 40

  /// O grupo do app: o id desta extensão sem o último pedaço (".screen-time").
  private static var defaults: UserDefaults? {
    guard let bundle = Bundle.main.bundleIdentifier, let dot = bundle.lastIndex(of: ".") else { return nil }
    return UserDefaults(suiteName: "group.\(bundle[..<dot])")
  }

  static func record(minutes: Int) {
    guard let defaults else { return }
    let now = Date()
    let calendar = Calendar.current
    // Tempo de tela de hoje não passa do tempo que já correu hoje. Um aviso atrasado da véspera, entregue
    // depois da meia-noite, ou um disparo adiantado do sistema ficam de fora em vez de inflar o dia.
    let elapsed = Int(now.timeIntervalSince(calendar.startOfDay(for: now)) / 60)
    guard minutes <= elapsed else { return }

    var days = defaults.dictionary(forKey: daysKey) as? [String: Int] ?? [:]
    let key = dayKey(now)
    days[key] = max(days[key] ?? 0, minutes)
    if days.count > keepDays {
      for old in days.keys.sorted().prefix(days.count - keepDays) { days.removeValue(forKey: old) }
    }
    defaults.set(days, forKey: daysKey)
  }

  private static func dayKey(_ date: Date) -> String {
    let f = DateFormatter()
    f.calendar = Calendar(identifier: .gregorian)
    f.locale = Locale(identifier: "en_US_POSIX")
    f.timeZone = TimeZone.current
    f.dateFormat = "yyyy-MM-dd"
    return f.string(from: date)
  }
}
