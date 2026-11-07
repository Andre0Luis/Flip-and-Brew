import { Platform } from 'react-native';
import { Accelerometer } from 'expo-sensors';

import { poseFromAccel, type Pose } from '@/lib/engine';

export type { Pose };

/**
 * No Android o eixo z do acelerômetro fica em +1 g com a tela para cima. No iOS é o contrário.
 * Se o aparelho se comportar diferente, a pessoa calibra em Ajustes.
 */
export const defaultFaceUpSign = (): 1 | -1 => (Platform.OS === 'ios' ? -1 : 1);

export function poseOf(x: number, y: number, z: number, faceUpSign: -1 | 0 | 1): Pose {
  return poseFromAccel(x, y, z, faceUpSign === 0 ? defaultFaceUpSign() : faceUpSign);
}

export async function sensorAvailable(): Promise<boolean> {
  try {
    return await Accelerometer.isAvailableAsync();
  } catch {
    return false;
  }
}

/** Lê o sensor por ~1,2 s. Com o celular deitado de tela para cima, devolve o sinal do eixo z. */
export function calibrateFaceUp(): Promise<{ sign: 1 | -1 } | { error: 'unavailable' | 'not-flat' }> {
  return new Promise((resolve) => {
    let sum = 0;
    let n = 0;
    let flat = 0;
    let sub: { remove: () => void };
    try {
      Accelerometer.setUpdateInterval(100);
      sub = Accelerometer.addListener(({ x, y, z }) => {
        n++;
        sum += z;
        if (Math.abs(x) < 0.4 && Math.abs(y) < 0.4 && Math.abs(z) > 0.8) flat++;
      });
    } catch {
      return resolve({ error: 'unavailable' });
    }
    setTimeout(() => {
      sub.remove();
      if (n === 0) return resolve({ error: 'unavailable' });
      if (flat / n < 0.8) return resolve({ error: 'not-flat' });
      resolve({ sign: sum / n > 0 ? 1 : -1 });
    }, 1200);
  });
}
