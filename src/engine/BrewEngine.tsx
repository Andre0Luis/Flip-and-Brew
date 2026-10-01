import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useRouter } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/store/useApp';
import { decide, onReopen, type Pose } from '@/lib/engine';
import { cancelBrewDone, scheduleBrewDone } from '@/lib/notifications';
import { poseOf, sensorAvailable } from './sensor';

/**
 * Cuida do ciclo do copo: inicia ao virar o celular, encerra ao pegar ou ao encher, retoma ao reabrir.
 * A contagem usa horários (startedAt), então continua certa com a tela apagada.
 * As decisões ficam em lib/engine.ts, que tem testes; aqui só ligamos sensor, relógio e navegação.
 */
export function BrewEngine() {
  const router = useRouter();
  const pose = useRef<{ value: Pose; since: number }>({ value: 'other', since: 0 });
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

  // Aviso silencioso de copo pronto (opcional): agenda ao iniciar e cancela ao encerrar.
  useEffect(() => {
    let lastStart: number | null = null;
    const sync = () => {
      const { active, settings } = useApp.getState();
      if (active && settings.notifyOnDone) {
        if (lastStart !== active.startedAt) {
          lastStart = active.startedAt;
          void scheduleBrewDone(active.startedAt + active.targetMs, settings.language);
        }
      } else if (lastStart !== null) {
        lastStart = null;
        void cancelBrewDone();
      }
    };
    sync();
    return useApp.subscribe(sync);
  }, []);

  useEffect(() => {
    const finishAndLeave = () => {
      const id = useApp.getState().finish(Date.now());
      if (id) {
        const s = useApp.getState().sessions.find((x) => x.id === id);
        if (s?.status === 'done') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        router.replace('/resultado');
      } else {
        router.dismissTo('/');
      }
    };

    const resolveOnOpen = () => {
      const action = onReopen(useApp.getState().active, Date.now());
      if (action === 'finish') finishAndLeave();
      else if (action === 'show') router.replace('/brew');
    };

    // Reabrir o app ou destravar a tela com um copo em andamento conta como pegar o celular.
    const appSub = AppState.addEventListener('change', (st) => {
      if (st !== 'active') return;
      pose.current = { value: 'other', since: Date.now() };
      resolveOnOpen();
    });

    if (useApp.persist.hasHydrated()) resolveOnOpen();
    const unsubHydration = useApp.persist.onFinishHydration(resolveOnOpen);

    const tick = setInterval(() => {
      const st = useApp.getState();
      const now = Date.now();
      const action = decide({
        now,
        active: st.active,
        calibrated: st.settings.faceUpSign !== 0,
        autoStart: st.settings.autoStart,
        homeFocused: st.homeFocused,
        pose: pose.current,
        lastEndedAt: st.lastEndedAt,
      });
      if (action === 'finish') finishAndLeave();
      else if (action === 'start' && st.start(now)) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        router.push('/brew');
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
