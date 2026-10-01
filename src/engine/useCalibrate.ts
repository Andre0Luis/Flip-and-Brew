import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '@/store/useApp';
import { calibrateFaceUp, sensorAvailable } from './sensor';
import { useI18n, type Key } from '@/i18n';

const COUNTDOWN_S = 4;

/** Calibra o sentido do eixo z. Dá alguns segundos para a pessoa apoiar o celular na mesa, tela para cima. */
export function useCalibrate() {
  const set = useApp((s) => s.setSettings);
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  // Guardamos a chave e o contador, não o texto, para a mensagem acompanhar a troca de idioma.
  const [msg, setMsg] = useState<{ key: Key; n?: number } | null>(null);
  const [available, setAvailable] = useState(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    sensorAvailable().then((ok) => alive.current && setAvailable(ok));
    return () => {
      alive.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    for (let i = COUNTDOWN_S; i > 0; i--) {
      if (!alive.current) return;
      setMsg({ key: 'calib.countdown', n: i });
      await new Promise((r) => setTimeout(r, 1000));
    }
    const res = await calibrateFaceUp();
    if (!alive.current) return;
    setBusy(false);
    if ('sign' in res) {
      set({ faceUpSign: res.sign });
      setMsg({ key: 'calib.ok' });
    } else if (res.error === 'not-flat') setMsg({ key: 'calib.notFlat' });
    else setMsg({ key: 'calib.unavailable' });
  }, [busy, set]);

  const message = msg ? t(msg.key, msg.n !== undefined ? { n: msg.n } : undefined) : null;
  return { run, busy, message, available };
}
