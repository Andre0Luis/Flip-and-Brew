import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '@/store/useApp';
import { calibrateFaceUp, sensorAvailable } from './sensor';

const COUNTDOWN_S = 4;

/** Calibra o sentido do eixo z. Dá alguns segundos para a pessoa apoiar o celular na mesa, tela para cima. */
export function useCalibrate() {
  const set = useApp((s) => s.setSettings);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
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
      setMessage(`Apoie o celular numa mesa, com a tela para cima. Lendo em ${i}…`);
      await new Promise((r) => setTimeout(r, 1000));
    }
    const res = await calibrateFaceUp();
    if (!alive.current) return;
    setBusy(false);
    if ('sign' in res) {
      set({ faceUpSign: res.sign });
      setMessage('Pronto. Agora virar o celular para baixo inicia o copo, e pegá-lo encerra.');
    } else if (res.error === 'not-flat') setMessage('O celular não estava deitado e parado. Apoie-o numa mesa, com a tela para cima, e tente de novo.');
    else setMessage('Este aparelho não tem acelerômetro disponível.');
  }, [busy, set]);

  return { run, busy, message, available };
}
