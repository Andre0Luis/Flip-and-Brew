import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Icon } from '@/components/Icon';
import { postWhen } from '@/components/PostCard';
import { Card, Screen, Txt } from '@/components/ui';
import { useI18n, type Key } from '@/i18n';
import { getBackend } from '@/lib/cloud';
import type { AppNotification } from '@/lib/cloud/apiClient';
import { communityErrorKey, personName, type CommunityErrorKey } from '@/lib/community';
import { useTheme } from '@/theme/ThemeProvider';

/** Quem curtiu ou comentou meus posts. Abrir a tela marca tudo como lido. */
export default function Avisos() {
  const { c } = useTheme();
  const { lang, t } = useI18n();
  const router = useRouter();
  const api = getBackend()?.community;
  const [list, setList] = useState<AppNotification[] | null>(null);
  const [error, setError] = useState<CommunityErrorKey | null>(null);

  const load = useCallback(async () => {
    if (!api) return;
    try {
      const n = await api.notifications();
      setList(n.notifications);
      setError(null);
      if (n.unread > 0) void api.readNotifications().catch(() => {});
    } catch (e) {
      setError(communityErrorKey(e));
    }
  }, [api]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ paddingTop: 8, gap: 4 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('common.back')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/comunidade'))} hitSlop={12} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}>
          <Icon name="back" color={c.muted} />
          <Txt v="label" color="muted">
            {t('common.back')}
          </Txt>
        </Pressable>
        <Txt v="display">{t('notif.title')}</Txt>
      </View>
      {error && (
        <Txt v="small" color="bad" accessibilityLiveRegion="polite">
          {t(`community.err.${error}` as Key)}
        </Txt>
      )}
      <Card style={{ gap: 4 }}>
        {list === null ? (
          <Txt v="small" color="muted">
            {t('community.loading')}
          </Txt>
        ) : list.length === 0 ? (
          <Txt v="small" color="muted">
            {t('notif.empty')}
          </Txt>
        ) : (
          list.map((n) => (
            <Pressable
              key={n.id}
              accessibilityRole="button"
              disabled={!n.postId}
              onPress={() => n.postId && router.push({ pathname: '/post/[id]', params: { id: n.postId, title: n.postTitle ?? '', mine: '1' } })}
              style={{ flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 8, borderRadius: 12, backgroundColor: n.read ? 'transparent' : c.soft, paddingHorizontal: 8 }}
            >
              <Icon name={n.kind === 'like' ? 'heart' : 'comment'} color={c.accent} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Txt v="body">{t(n.kind === 'like' ? 'notif.like' : 'notif.comment', { name: personName(n.actor), title: n.postTitle ?? '' })}</Txt>
                <Txt v="small" color="muted">
                  {postWhen(lang, n.createdAt)}
                </Txt>
              </View>
            </Pressable>
          ))
        )}
      </Card>
    </Screen>
  );
}
