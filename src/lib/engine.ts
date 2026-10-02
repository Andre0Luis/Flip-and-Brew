import { GRACE_MS } from './brew';

export type Pose = 'up' | 'down' | 'other';

export const UP_HOLD_MS = 3_000; // tela para cima por este tempo conta como pegada
export const DOWN_HOLD_MS = 2_000; // virado para baixo por este tempo inicia o copo
export const RESTART_COOLDOWN_MS = 30_000; // depois de um copo, não reinicia sozinho nesse intervalo

/** Pose do celular a partir do acelerômetro (em g). `faceUpSign` é o sinal do eixo z com a tela para cima. */
export function poseFromAccel(x: number, y: number, z: number, faceUpSign: 1 | -1): Pose {
  const flat = Math.abs(x) < 0.4 && Math.abs(y) < 0.4 && Math.abs(z) > 0.8;
  if (!flat) return 'other';
  return Math.sign(z) === faceUpSign ? 'up' : 'down';
}

export type Active = { startedAt: number; targetMs: number };

export type EngineInput = {
  now: number;
  active: Active | null;
  /** sem calibração o sentido do eixo z pode estar invertido, então o sensor não decide nada */
  calibrated: boolean;
  autoStart: boolean;
  homeFocused: boolean;
  pose: { value: Pose; since: number };
  lastEndedAt: number;
};

/** O que fazer a cada segundo: encerrar o copo, iniciar um novo ou nada. */
export function decide(i: EngineInput): 'finish' | 'start' | null {
  if (i.active) {
    if (i.now >= i.active.startedAt + i.active.targetMs) return 'finish';
    const pickedUp = i.calibrated && i.pose.value === 'up' && i.now - i.pose.since >= UP_HOLD_MS;
    if (pickedUp && i.now - i.active.startedAt > GRACE_MS) return 'finish';
    return null;
  }
  const flipped = i.pose.value === 'down' && i.now - i.pose.since >= DOWN_HOLD_MS;
  if (i.calibrated && i.autoStart && i.homeFocused && flipped && i.now - i.lastEndedAt > RESTART_COOLDOWN_MS) return 'start';
  return null;
}

/** App reaberto ou tela destravada com um copo em andamento: encerra, ou volta para a tela do copo se for logo após iniciar. */
export function onReopen(active: Active | null, now: number): 'finish' | 'show' | null {
  if (!active) return null;
  if (now >= active.startedAt + active.targetMs) return 'finish';
  if (now - active.startedAt > GRACE_MS) return 'finish';
  return 'show';
}
