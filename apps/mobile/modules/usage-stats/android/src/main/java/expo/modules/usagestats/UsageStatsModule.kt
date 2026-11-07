package expo.modules.usagestats

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.Calendar

/**
 * Lê do sistema quantas vezes o celular foi desbloqueado e por quanto tempo a tela ficou ligada.
 * Tudo fica no aparelho: o app só consulta o UsageStatsManager e nunca envia esses dados.
 */
class UsageStatsModule : Module() {
  private fun hasPermission(context: Context): Boolean {
    val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      appOps.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, android.os.Process.myUid(), context.packageName)
    } else {
      @Suppress("DEPRECATION")
      appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, android.os.Process.myUid(), context.packageName)
    }
    return mode == AppOpsManager.MODE_ALLOWED
  }

  override fun definition() = ModuleDefinition {
    Name("UsageStats")

    Function("hasUsageStatsPermission") {
      val context = appContext.reactContext ?: return@Function false
      hasPermission(context)
    }

    Function("requestUsageStatsPermission") {
      val context = appContext.reactContext ?: return@Function null
      val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      context.startActivity(intent)
      null
    }

    // Uma entrada por dia, do mais antigo ao de hoje. O Android guarda poucos dias de eventos,
    // então os dias mais antigos podem vir com zeros.
    Function("getDailyUsage") { days: Int ->
      val result = mutableListOf<Map<String, Any>>()
      val context = appContext.reactContext ?: return@Function result
      if (!hasPermission(context)) return@Function result

      val manager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
      val now = System.currentTimeMillis()

      val today = Calendar.getInstance()
      today.set(Calendar.HOUR_OF_DAY, 0)
      today.set(Calendar.MINUTE, 0)
      today.set(Calendar.SECOND, 0)
      today.set(Calendar.MILLISECOND, 0)

      for (back in (days - 1) downTo 0) {
        val dayCal = today.clone() as Calendar
        dayCal.add(Calendar.DAY_OF_YEAR, -back)
        val start = dayCal.timeInMillis
        dayCal.add(Calendar.DAY_OF_YEAR, 1)
        val end = minOf(dayCal.timeInMillis, now)

        var unlocks = 0
        var locks = 0
        var screenMs = 0L
        var onSince = -1L
        var sawScreenEvent = false

        val events = manager.queryEvents(start, end)
        val event = UsageEvents.Event()
        while (events.hasNextEvent()) {
          events.getNextEvent(event)
          val type = event.eventType
          if (type == UsageEvents.Event.KEYGUARD_HIDDEN) {
            unlocks++
          } else if (type == UsageEvents.Event.SCREEN_INTERACTIVE) {
            if (onSince < 0) onSince = event.timeStamp
            sawScreenEvent = true
          } else if (type == UsageEvents.Event.SCREEN_NON_INTERACTIVE) {
            locks++ // a tela apagou ou foi bloqueada
            if (onSince >= 0) {
              screenMs += event.timeStamp - onSince
            } else if (!sawScreenEvent) {
              // a tela já estava ligada à meia-noite
              screenMs += event.timeStamp - start
            }
            onSince = -1L
            sawScreenEvent = true
          }
        }
        if (onSince >= 0) screenMs += end - onSince

        result.add(mapOf("dayStart" to start, "unlocks" to unlocks, "locks" to locks, "screenMs" to screenMs))
      }
      result
    }
  }
}
