import React from 'react';
import { Button, Card, Txt } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useApp } from '@/store/useApp';

/** Avisa, uma vez, as moedas que entraram pelo tempo com a tela bloqueada (lib/passive.ts). */
export function PassiveNotice() {
  const { t } = useI18n();
  const notice = useApp((s) => s.passive.notice);
  const dismiss = useApp((s) => s.dismissPassiveNotice);
  if (!notice) return null;
  return (
    <Card style={{ gap: 10 }}>
      <Txt v="body">{t('passive.notice', { coins: notice.coins })}</Txt>
      <Button label={t('passive.ok')} tone="quiet" onPress={dismiss} style={{ alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 16 }} />
    </Card>
  );
}
