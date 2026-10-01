import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useFocusStore } from '@/store/useFocusStore';
import {
  isFlipSensorAvailable,
  startFlipSensor,
  stopFlipSensor,
  addFlipListener,
} from '../../modules/flip-sensor';

/**
 * Conta aberturas/fechamentos da concha do Z Flip 7.
 *
 * Preferência: sensor de ângulo de dobradiça (`TYPE_HINGE_ANGLE`) — medição
 * EXATA das transições aberto↔fechado, via módulo nativo `flip-sensor`.
 *
 * Fallback (devices sem dobradiça / iOS / emulador): proxy por `AppState`,
 * onde `background` ≈ fechamento e `active` ≈ abertura.
 */
export function useFlipCounter() {
  const registerFlip = useFocusStore((s) => s.registerFlip);
  const prev = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    // 1) Caminho exato: sensor de dobradiça
    if (isFlipSensorAvailable()) {
      startFlipSensor();
      const sub = addFlipListener((e) => {
        registerFlip(e.state === 'open' ? 'open' : 'close');
      });
      return () => {
        sub.remove();
        stopFlipSensor();
      };
    }

    // 2) Fallback: proxy por AppState
    const sub = AppState.addEventListener('change', (next) => {
      const before = prev.current;
      if (next === 'background' && before !== 'background') {
        registerFlip('close');
      } else if (next === 'active' && before === 'background') {
        registerFlip('open');
      }
      prev.current = next;
    });
    return () => sub.remove();
  }, [registerFlip]);
}
