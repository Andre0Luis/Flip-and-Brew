import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Icon } from '@/components/Icon';
import { postWhen } from '@/components/PostCard';
import { Button, Card, Field, Screen, Txt } from '@/components/ui';
import { useI18n, type Key } from '@/i18n';
import { getBackend } from '@/lib/cloud';
import type { PostComment } from '@/lib/cloud/apiClient';
import { communityErrorKey, personInitial, personName, type CommunityErrorKey } from '@/lib/community';
import { useTheme } from '@/theme/ThemeProvider';

/** Comentários de um post. Quem escreveu e o dono do post podem apagar. */
export default function Comentarios() {
  const { c } = useTheme();
  const { lang, t } = useI18n();
  const router = useRouter();
  const { id, title, mine } = useLocalSearchParams<{ id: string; title?: string; mine?: string }>();
  const api = getBackend()?.community;
  const [list, setList] = useState<PostComment[] | null>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<CommunityErrorKey | null>(null);

  const load = useCallback(async () => {
    if (!api || !id) return;
    try {
      setList(await api.comments(id));
      setError(null);
    } catch (e) {
      setError(communityErrorKey(e));
    }
  }, [api, id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const send = async () => {
    if (!api || !id || !text.trim()) return;
    setBusy(true);
    try {
      await api.comment(id, text.trim());
      setText('');
      await load();
    } catch (e) {
      setError(communityErrorKey(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (commentId: string) => {
    try {
      await api?.deleteComment(commentId);
      await load();
    } catch (e) {
      setError(communityErrorKey(e));
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ paddingTop: 8, gap: 4 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('common.back')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/comunidade'))} hitSlop={12} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}>
          <Icon name="back" color={c.muted} />
          <Txt v="label" color="muted">
            {t('common.back')}
          </Txt>
        </Pressable>
        <Txt v="display">{t('comments.title')}</Txt>
        {!!title && (
          <Txt v="body" color="muted" numberOfLines={2}>
            {title}
          </Txt>
        )}
      </View>

      {error && (
        <Txt v="small" color="bad" accessibilityLiveRegion="polite">
          {t(`community.err.${error}` as Key)}
        </Txt>
      )}

      <Card style={{ gap: 12 }}>
        {list === null ? (
          <Txt v="small" color="muted">
            {t('community.loading')}
          </Txt>
        ) : list.length === 0 ? (
          <Txt v="small" color="muted">
            {t('comments.empty')}
          </Txt>
        ) : (
          list.map((cm) => (
            <View key={cm.id} style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.soft, alignItems: 'center', justifyContent: 'center' }}>
                <Txt v="small" color="accent">
                  {personInitial(cm.author)}
                </Txt>
              </View>
              <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <Txt v="small" color="muted">
                  {`${personName(cm.author)} · ${postWhen(lang, cm.createdAt)}`}
                </Txt>
                <Txt v="body">{cm.body}</Txt>
              </View>
              {(cm.mine || mine === '1') && (
                <Pressable accessibilityRole="button" accessibilityLabel={t('comments.delete')} onPress={() => void remove(cm.id)} hitSlop={8}>
                  <Icon name="trash" size={18} color={c.muted} />
                </Pressable>
              )}
            </View>
          ))
        )}
      </Card>

      <Field label={t('comments.placeholder')} value={text} onChangeText={setText} maxLength={500} multiline />
      <Button label={t('comments.send')} disabled={busy || !text.trim()} onPress={() => void send()} />
    </Screen>
  );
}
