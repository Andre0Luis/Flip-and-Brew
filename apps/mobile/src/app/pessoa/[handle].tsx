import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Icon } from '@/components/Icon';
import { Button, Card, Screen, Txt } from '@/components/ui';
import { formatDateShort, useI18n, type Key } from '@/i18n';
import { getBackend } from '@/lib/cloud';
import type { PublicProfile } from '@/lib/cloud/apiClient';
import { communityErrorKey, personInitial, personName, type CommunityErrorKey } from '@/lib/community';
import { useTheme } from '@/theme/ThemeProvider';

/** Perfil público de alguém da comunidade, com pedir amizade, aceitar, desfazer e bloquear. */
export default function Pessoa() {
  const { c } = useTheme();
  const { lang, t } = useI18n();
  const router = useRouter();
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const api = getBackend()?.community;
  const [data, setData] = useState<PublicProfile | null | undefined>(undefined);
  const [error, setError] = useState<CommunityErrorKey | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [notice, setNotice] = useState<Key | null>(null);

  const load = useCallback(async () => {
    if (!api || !handle) return setData(null);
    try {
      setData(await api.user(handle));
      setError(null);
    } catch (e) {
      setError(communityErrorKey(e));
    }
  }, [api, handle]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const act = async (fn: () => Promise<unknown>, done?: Key) => {
    setBusy(true);
    setNotice(null);
    try {
      await fn();
      if (done) setNotice(done);
      await load();
    } catch (e) {
      setError(communityErrorKey(e));
    } finally {
      setBusy(false);
    }
  };

  // O id do pedido não vem no perfil: procura nas listas de pedidos.
  const requestId = async (direction: 'incoming' | 'outgoing', userId: string) => (await api!.requests(direction)).find((r) => r.id === userId)?.requestId;

  const p = data?.profile;
  const back = () => (router.canGoBack() ? router.back() : router.replace('/comunidade'));

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ paddingTop: 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('common.back')} onPress={back} hitSlop={12} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}>
          <Icon name="back" color={c.muted} />
          <Txt v="label" color="muted">
            {t('common.back')}
          </Txt>
        </Pressable>
      </View>

      {error && (
        <Txt v="small" color="bad" accessibilityLiveRegion="polite">
          {t(`community.err.${error}` as Key)}
        </Txt>
      )}

      {data === undefined ? (
        !error && (
          <Txt v="body" color="muted">
            {t('community.loading')}
          </Txt>
        )
      ) : !data || !p ? (
        <Card>
          <Txt v="body" color="muted">
            {t('person.notFound')}
          </Txt>
        </Card>
      ) : (
        <>
          <View style={{ alignItems: 'center', gap: 8, paddingVertical: 8 }}>
            <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: c.soft, alignItems: 'center', justifyContent: 'center' }}>
              <Txt v="display" color="accent">
                {personInitial(p)}
              </Txt>
            </View>
            <Txt v="display" style={{ textAlign: 'center' }}>
              {personName(p)}
            </Txt>
            {!!p.handle && !!p.displayName && (
              <Txt v="small" color="muted">
                {`@${p.handle}`}
              </Txt>
            )}
            <Txt v="small" color="muted">
              {t('person.since', { date: formatDateShort(lang, new Date(p.joinedAt).getTime()) })}
            </Txt>
          </View>

          {!!p.bio && (
            <Card>
              <Txt v="body">{p.bio}</Txt>
            </Card>
          )}

          {notice && (
            <Txt v="small" color="good" accessibilityLiveRegion="polite">
              {t(notice)}
            </Txt>
          )}

          <Card style={{ gap: 10 }}>
            {data.relation === 'self' && (
              <Txt v="body" color="muted">
                {t('person.you')}
              </Txt>
            )}
            {data.relation === 'none' && (
              <Button
                label={t('person.add')}
                disabled={busy}
                onPress={() => void act(async () => setNotice((await api!.requestFriend(p.id)).accepted ? 'person.accepted' : 'person.sent'))}
              />
            )}
            {data.relation === 'request_sent' && (
              <>
                <Txt v="body" color="muted">
                  {t('person.sent')}
                </Txt>
                <Button
                  label={t('person.cancel')}
                  tone="quiet"
                  disabled={busy}
                  onPress={() =>
                    void act(async () => {
                      const id = await requestId('outgoing', p.id);
                      if (id) await api!.removeRequest(id);
                    })
                  }
                />
              </>
            )}
            {data.relation === 'request_received' && (
              <>
                <Button
                  label={t('person.accept')}
                  disabled={busy}
                  onPress={() =>
                    void act(async () => {
                      const id = await requestId('incoming', p.id);
                      if (id) await api!.accept(id);
                    }, 'person.accepted')
                  }
                />
                <Button
                  label={t('person.decline')}
                  tone="quiet"
                  disabled={busy}
                  onPress={() =>
                    void act(async () => {
                      const id = await requestId('incoming', p.id);
                      if (id) await api!.removeRequest(id);
                    })
                  }
                />
              </>
            )}
            {data.relation === 'friends' && (
              <>
                <Txt v="body" color="good">
                  {t('person.friends')}
                </Txt>
                <Button label={t('person.unfriend')} tone="quiet" disabled={busy} onPress={() => void act(() => api!.unfriend(p.id))} />
              </>
            )}
          </Card>

          {data.relation !== 'self' && (
            <Card style={{ gap: 8 }}>
              <Txt v="small" color="muted">
                {t('person.blockHint')}
              </Txt>
              {confirmBlock ? (
                <Button
                  label={t('person.blockConfirm')}
                  tone="dark"
                  disabled={busy}
                  onPress={() =>
                    void act(async () => {
                      await api!.block(p.id);
                      back();
                    })
                  }
                />
              ) : (
                <Button label={t('person.block')} tone="quiet" onPress={() => setConfirmBlock(true)} />
              )}
            </Card>
          )}
        </>
      )}
    </Screen>
  );
}
