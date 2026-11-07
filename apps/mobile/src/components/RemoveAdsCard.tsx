import React, { useEffect, useState } from 'react';
import { Button, Card, Txt } from '@/components/ui';
import { buyRemoveAds, loadRemoveAds, type RemoveAdsOffer } from '@/lib/purchases';
import { useI18n } from '@/i18n';
import { usePro } from '@/store/usePro';

/** Compra única "Remover anúncios". Quem tem o Pro já está sem anúncios. */
export function RemoveAdsCard() {
  const { t } = useI18n();
  const adFree = usePro((s) => s.adFree);
  const proActive = usePro((s) => s.active);
  const setPro = usePro((s) => s.set);
  const [offer, setOffer] = useState<RemoveAdsOffer | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    void loadRemoveAds().then((o) => live && setOffer(o));
    return () => {
      live = false;
    };
  }, []);

  const buy = async () => {
    if (!offer) return;
    setBusy(true);
    setMsg(null);
    const info = await buyRemoveAds(offer);
    setBusy(false);
    if (info) setPro(info);
    else setMsg(t('ads.failed'));
  };

  return (
    <Card style={{ gap: 10 }}>
      <Txt v="title">{t('ads.title')}</Txt>
      <Txt v="small" color="muted">
        {adFree ? (proActive ? t('ads.viaPro') : t('ads.on')) : t('ads.off')}
      </Txt>
      {!adFree && offer && <Button label={t('ads.buy', { price: offer.price })} disabled={busy} onPress={() => void buy()} />}
      {!adFree && offer === null && (
        <Txt v="small" color="muted">
          {t('ads.unavailable')}
        </Txt>
      )}
      {msg && (
        <Txt v="small" color="muted">
          {msg}
        </Txt>
      )}
    </Card>
  );
}
