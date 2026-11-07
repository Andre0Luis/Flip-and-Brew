import { lt } from 'drizzle-orm';
import type { Db } from '../db/client';
import { activity } from '../db/schema';

/** Presença guarda só 30 dias. Mensagens e posts ficam para sempre (decisão do dono, ADR-0024). */
export const ACTIVITY_RETENTION_DAYS = 30;

/** Apaga presença antiga. Devolve quantas linhas saíram. Pensada para rodar numa rotina agendada (fase de deploy). */
export async function purgeOldActivity(db: Db, now = Date.now(), days = ACTIVITY_RETENTION_DAYS): Promise<number> {
  const gone = await db.delete(activity).where(lt(activity.at, new Date(now - days * 86_400_000))).returning({ id: activity.id });
  return gone.length;
}
