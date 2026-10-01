package expo.modules.flipsensor

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Lê o sensor de ângulo de dobradiça (Sensor.TYPE_HINGE_ANGLE, API 30+) e emite
 * o evento "onFlip" sempre que o estado cruza os limiares fechado/aberto.
 * O JS conta as transições — medição exata da abertura/fechamento do Z Flip 7.
 */
class FlipSensorModule : Module(), SensorEventListener {
  // 0° = totalmente fechado, ~180° = totalmente aberto. Faixa intermediária
  // (tent / desk mode) é ignorada para não contar como abrir/fechar.
  private val closedMax = 20f
  private val openMin = 150f

  private var lastState: String? = null
  private var listening = false

  private val sensorManager: SensorManager?
    get() = appContext.reactContext?.getSystemService(Context.SENSOR_SERVICE) as? SensorManager

  private val hingeSensor: Sensor?
    get() = sensorManager?.getDefaultSensor(Sensor.TYPE_HINGE_ANGLE)

  override fun definition() = ModuleDefinition {
    Name("FlipSensor")

    Events("onFlip")

    Function("isAvailable") {
      hingeSensor != null
    }

    Function("start") {
      startListening()
    }

    Function("stop") {
      stopListening()
    }

    OnDestroy {
      stopListening()
    }
  }

  private fun startListening() {
    if (listening) return
    val sensor = hingeSensor ?: return
    sensorManager?.registerListener(this, sensor, SensorManager.SENSOR_DELAY_NORMAL)
    listening = true
  }

  private fun stopListening() {
    if (!listening) return
    sensorManager?.unregisterListener(this)
    listening = false
    lastState = null
  }

  override fun onSensorChanged(event: SensorEvent?) {
    if (event == null || event.sensor.type != Sensor.TYPE_HINGE_ANGLE) return
    val angle = event.values.firstOrNull() ?: return

    val state = when {
      angle <= closedMax -> "closed"
      angle >= openMin -> "open"
      else -> return
    }

    if (state == lastState) return
    val previous = lastState
    lastState = state

    // A primeira leitura só estabelece o baseline; não conta como transição.
    if (previous != null) {
      sendEvent("onFlip", mapOf("state" to state, "angle" to angle.toDouble()))
    }
  }

  override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}
