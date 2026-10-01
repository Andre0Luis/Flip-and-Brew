import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useRouter } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/store/useApp';
import { GRACE_MS } from '@/lib/brew';
import { poseOf, sensorAvailable, type Pose } from './sensor';

const UP_HOLD_MS = 3_000; // tela para cima por este tempo conta como pegada
const DOWN_HOLD_MS = 2_000; // virado para baixo por este tempo inicia o copo
const RESTART_COOLDOWN_MS = 30_000;

/**
 * Cuida do ciclo do copo: inicia ao virar o celular, encerra ao pegar ou ao encher.
 * A contagem usa horários (startedAt), então continua certa com a tela apagada.
 */
export function BrewEngine() {
  const router = useRouter();
  const pose = useRef<{ value: Pose; since: number }>({ value: 'other', since: Date.now() });
  // O acelerômetro só fica ligado quando há decisão a tomar: copo em andamento, ou Início aberto com início automático.
  const needSensor = useApp((s) => !!s.active || (s.settings.autoStart && s.homeFocused));

  useEffect(() => {
    if (!needSensor) return;
    let sub: { remove: () => void } | null = null;
    let cancelled = false;
    pose.current = { value: 'other', since: Date.now() };
    sensorAvailable().then((ok) => {
      if (!ok || cancelled) return;
      try {
        Accelerometer.setUpdateInterval(500);
        sub = Accelerometer.addListener(({ x, y, z }) => {
          const p = poseOf(x, y, z, useApp.getState().settings.faceUpSign);
          if (p !== pose.current.value) pose.current = { value: p, since: Date.now() };
        });
      } catch {
        // Sem sensor (web, emulador): o copo segue pelo botão e por reabrir o app.
      }
    });
    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [needSensor]);

  useEffect(() => {
    const finishAndLeave = (why: 'done' | 'pickup') => {
      const id = useApp.getState().finish(Date.now());
      if (id) {
        const s = useApp.getState().sessions.find((x) => x.id === id);
        if (s?.status === 'done') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        router.replace('/resultado');
      } else {
        router.dismissTo('/');
      }
      void why;
    };

    const resolveOnOpen = () => {
      const { active } = useApp.getState();
      if (!active) return;
      const now = Date.now();
      if (now >= active.startedAt + active.targetMs) finishAndLeave('done');
      else if (now - active.startedAt > GRACE_MS) finishAndLeave('pickup');
      else router.replace('/brew');
    };

    // Reabrir o app ou destravar a tela com um copo em andamento conta como pegar o celular.
    const appSub = AppState.addEventListener('change', (st) => {
      if (st !== 'active') return;
      pose.current = { value: 'other', since: Date.now() };
      resolveOnOpen();
    });

    const startHydrated = () => resolveOnOpen();
    if (useApp.persist.hasHydrated()) startHydrated();
    const unsubHydration = useApp.persist.onFinishHydration(startHydrated);

    const tick = setInterval(() => {
      const st = useApp.getState();
      const now = Date.now();
      const { active } = st;
      const { value, since } = pose.current;
      // Sem calibração o sentido do eixo z pode estar invertido. Nesse caso o sensor não decide nada
      // e o copo só termina ao encher, ao pegar o celular (reabrir o app) ou pelo botão.
      const calibrated = st.settings.faceUpSign !== 0;
      if (active) {
        if (now >= active.startedAt + active.targetMs) finishAndLeave('done');
        else if (calibrated && now - active.startedAt > GRACE_MS && value === 'up' && now - since >= UP_HOLD_MS) finishAndLeave('pickup');
        return;
      }
      if (calibrated && st.settings.autoStart && st.homeFocused && value === 'down' && now - since >= DOWN_HOLD_MS && now - st.lastEndedAt > RESTART_COOLDOWN_MS) {
        if (st.start(now)) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          router.push('/brew');
        }
      }
    }, 1000);

    return () => {
      clearInterval(tick);
      appSub.remove();
      unsubHydration();
    };
  }, [router]);

  return null;
}
