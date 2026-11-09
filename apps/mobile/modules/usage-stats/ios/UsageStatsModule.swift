import DeviceActivity
import ExpoModulesCore
import FamilyControls
import SwiftUI

/**
 * Tempo de tela no iPhone pelo Tempo de Uso (ADR-0029). A Apple não entrega os números ao app: a extensão
 * `targets/screen-time` recebe um aviso a cada limite de uso atingido no dia e grava o maior no App Group.
 * Este módulo pede a autorização, liga o monitor e lê esses minutos. Nada sai do aparelho.
 * Não há contagem de desbloqueios nem de bloqueios no iPhone.
 */
public class UsageStatsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("UsageStats")

    Constant("countsUnlocks") { false }

    Function("hasUsageStatsPermission") { () -> Bool in
      ScreenTime.isActive
    }

    AsyncFunction("requestUsageStatsPermission") { (labels: PickerLabels, promise: Promise) in
      Task { @MainActor in
        promise.resolve(await self.request(labels))
      }
    }

    Function("getDailyUsage") { (days: Int) -> [[String: Any]] in
      ScreenTime.dailyUsage(days: days)
    }
  }

  @MainActor
  private func request(_ labels: PickerLabels) async -> Bool {
    do {
      try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
    } catch {
      return false
    }
    guard let selection = await pick(labels) else { return ScreenTime.isActive }
    return ScreenTime.start(selection)
  }

  /// Abre a lista do sistema para a pessoa escolher o que conta como tempo de tela (o ideal é tudo).
  @MainActor
  private func pick(_ labels: PickerLabels) async -> FamilyActivitySelection? {
    guard let presenter = appContext?.utilities?.currentViewController() else { return nil }
    return await withCheckedContinuation { continuation in
      var finished = false
      let controller = UIHostingController(rootView: PickerView(selection: ScreenTime.savedSelection() ?? FamilyActivitySelection(includeEntireCategory: true), labels: labels) { result in
        guard !finished else { return }
        finished = true
        presenter.dismiss(animated: true) { continuation.resume(returning: result) }
      })
      controller.isModalInPresentation = true
      presenter.present(controller, animated: true)
    }
  }
}

struct PickerLabels: Record {
  @Field var title: String = ""
  @Field var done: String = ""
  @Field var cancel: String = ""
}

struct PickerView: View {
  @State var selection: FamilyActivitySelection
  let labels: PickerLabels
  let onFinish: (FamilyActivitySelection?) -> Void

  var body: some View {
    NavigationView {
      FamilyActivityPicker(selection: $selection)
        .navigationTitle(labels.title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
          ToolbarItem(placement: .cancellationAction) {
            Button(labels.cancel) { onFinish(nil) }
          }
          ToolbarItem(placement: .confirmationAction) {
            Button(labels.done) { onFinish(selection) }
              .disabled(ScreenTime.isEmpty(selection))
          }
        }
    }
    .navigationViewStyle(.stack)
  }
}

/// Monitor diário e leitura do App Group. O formato da gravação é o mesmo de `targets/screen-time`.
enum ScreenTime {
  static let activity = DeviceActivityName("flipandbrew.screen-time")
  private static let daysKey = "screenTime.days"
  private static let selectionKey = "screenTime.selection"

  /// Limites de uso do dia, em minutos: de 15 em 15 até 8 h, depois de 30 em 30 até 16 h.
  static let thresholds: [Int] = Array(stride(from: 15, through: 480, by: 15)) + Array(stride(from: 510, through: 960, by: 30))

  private static var defaults: UserDefaults? {
    guard let bundle = Bundle.main.bundleIdentifier else { return nil }
    return UserDefaults(suiteName: "group.\(bundle)")
  }

  static var isActive: Bool {
    AuthorizationCenter.shared.authorizationStatus == .approved && DeviceActivityCenter().activities.contains(activity)
  }

  static func isEmpty(_ s: FamilyActivitySelection) -> Bool {
    s.applicationTokens.isEmpty && s.categoryTokens.isEmpty && s.webDomainTokens.isEmpty
  }

  static func savedSelection() -> FamilyActivitySelection? {
    guard let data = defaults?.data(forKey: selectionKey) else { return nil }
    return try? JSONDecoder().decode(FamilyActivitySelection.self, from: data)
  }

  static func start(_ selection: FamilyActivitySelection) -> Bool {
    guard !isEmpty(selection) else { return false }
    if let data = try? JSONEncoder().encode(selection) {
      defaults?.set(data, forKey: selectionKey)
    }
    let schedule = DeviceActivitySchedule(
      intervalStart: DateComponents(hour: 0, minute: 0),
      intervalEnd: DateComponents(hour: 23, minute: 59),
      repeats: true
    )
    var events: [DeviceActivityEvent.Name: DeviceActivityEvent] = [:]
    for minutes in thresholds {
      events[DeviceActivityEvent.Name("m\(minutes)")] = event(selection, minutes)
    }
    let center = DeviceActivityCenter()
    center.stopMonitoring([activity])
    do {
      try center.startMonitoring(activity, during: schedule, events: events)
      return true
    } catch {
      return false
    }
  }

  private static func event(_ s: FamilyActivitySelection, _ minutes: Int) -> DeviceActivityEvent {
    let threshold = DateComponents(hour: minutes / 60, minute: minutes % 60)
    if #available(iOS 17.4, *) {
      // Conta também o uso de hoje antes de ligar o monitor, para o primeiro dia não sair zerado.
      return DeviceActivityEvent(applications: s.applicationTokens, categories: s.categoryTokens, webDomains: s.webDomainTokens, threshold: threshold, includesPastActivity: true)
    }
    return DeviceActivityEvent(applications: s.applicationTokens, categories: s.categoryTokens, webDomains: s.webDomainTokens, threshold: threshold)
  }

  /// Uma entrada por dia, do mais antigo ao de hoje, no formato do Android. Dia sem registro do monitor vem com `tracked: false`.
  static func dailyUsage(days: Int) -> [[String: Any]] {
    guard isActive, days > 0 else { return [] }
    let stored = defaults?.dictionary(forKey: daysKey) as? [String: Int] ?? [:]
    let calendar = Calendar.current
    let today = calendar.startOfDay(for: Date())
    return (0..<days).reversed().compactMap { back in
      guard let day = calendar.date(byAdding: .day, value: -back, to: today) else { return nil }
      let minutes = stored[dayKey(day)]
      return [
        "dayStart": day.timeIntervalSince1970 * 1000,
        "unlocks": 0,
        "locks": 0,
        "screenMs": Double(minutes ?? 0) * 60_000,
        "tracked": minutes != nil,
      ]
    }
  }

  static func dayKey(_ date: Date) -> String {
    let f = DateFormatter()
    f.calendar = Calendar(identifier: .gregorian)
    f.locale = Locale(identifier: "en_US_POSIX")
    f.timeZone = TimeZone.current
    f.dateFormat = "yyyy-MM-dd"
    return f.string(from: date)
  }
}
