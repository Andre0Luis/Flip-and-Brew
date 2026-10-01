import { Platform } from 'react-native';
import { NativeModule, requireNativeModule } from 'expo';

/**
 * Módulo nativo (Android) que lê o sensor de ângulo de dobradiça do Z Flip
 * (`Sensor.TYPE_HINGE_ANGLE`) e emite transições aberto/fechado — contagem
 * EXATA, sem depender do proxy de AppState. Em devices sem dobradiça (e no iOS)
 * `isAvailable()` retorna false e o consumidor cai no fallback.
 */

export type FlipState = 'open' | 'closed';
export type FlipEvent = { state: FlipState; angle: number };

type FlipSensorModuleEvents = {
  onFlip: (event: FlipEvent) => void;
};

declare class FlipSensorNativeModule extends NativeModule<FlipSensorModuleEvents> {
  isAvailable(): boolean;
  start(): void;
  stop(): void;
}

const native: FlipSensorNativeModule | null = (() => {
  if (Platform.OS !== 'android') return null;
  try {
    return requireNativeModule<FlipSensorNativeModule>('FlipSensor');
  } catch {
    return null;
  }
})();

/** O device tem sensor de dobradiça (foldable)? */
export function isFlipSensorAvailable(): boolean {
  try {
    return native?.isAvailable() ?? false;
  } catch {
    return false;
  }
}

export function startFlipSensor(): void {
  try {
    native?.start();
  } catch {
    /* noop */
  }
}

export function stopFlipSensor(): void {
  try {
    native?.stop();
  } catch {
    /* noop */
  }
}

export function addFlipListener(listener: (event: FlipEvent) => void): { remove: () => void } {
  if (!native) return { remove() {} };
  return native.addListener('onFlip', listener);
}
