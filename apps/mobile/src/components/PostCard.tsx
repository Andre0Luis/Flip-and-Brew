import React, { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { Button, Card, Txt } from '@/components/ui';
import { formatDateShort, useI18n } from '@/i18n';
import type { PostCard as Post } from '@/lib/cloud/apiClient';
import { personInitial, personName } from '@/lib/community';
import { useTheme } from '@/theme/ThemeProvider';

export function postWhen(lang: 'pt' | 'en' | 'es', iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${formatDateShort(lang, d.getTime())}, ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Um post no feed: autor, fotos (até 3, deslizando), título, legenda, curtir e comentários. */
export function PostCard({ post, onLike, onComments, onDelete }: { post: Post; onLike: () => void; onComments: () => void; onDelete?: () => void }) {
  const { c, r } = useTheme();
  const { lang, t } = useI18n();
  const [confirm, setConfirm] = useState(false);
  const [w, setW] = useState(0);
  const author = post.author ?? { id: '', handle: null, displayName: null, avatarPath: null };
  return (
    <Card style={{ gap: 10, paddingHorizontal: 0, paddingVertical: 14, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.soft, alignItems: 'center', justifyContent: 'center' }}>
          <Txt v="title" color="accent">
            {personInitial(author)}
          </Txt>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Txt v="body" numberOfLines={1}>
            {personName(author)}
          </Txt>
          <Txt v="small" color="muted">
            {postWhen(lang, post.createdAt)}
          </Txt>
        </View>
      </View>

      {post.images.length > 0 && (
        <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
          {w > 0 && (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {post.images.map((img, i) => (
                <Image key={i} source={{ uri: img.url }} style={{ width: w, height: w, backgroundColor: c.soft }} resizeMode="cover" accessibilityLabel={t('post.photoA11y', { n: i + 1, total: post.images.length })} />
              ))}
            </ScrollView>
          )}
          {post.images.length > 1 && (
            <View style={{ position: 'absolute', right: 10, top: 10, backgroundColor: c.surface, borderRadius: r.pill, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Txt v="small">{t('post.photoCount', { n: post.images.length })}</Txt>
            </View>
          )}
        </View>
      )}

      <View style={{ paddingHorizontal: 14, gap: 4 }}>
        <Txt v="title">{post.title}</Txt>
        {!!post.caption && (
          <Txt v="body" color="muted">
            {post.caption}
          </Txt>
        )}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18, paddingHorizontal: 14 }}>
        <Pressable accessibilityRole="button" accessibilityState={{ selected: post.likedByMe }} accessibilityLabel={t(post.likedByMe ? 'post.unlike' : 'post.like')} onPress={onLike} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="heart" color={post.likedByMe ? c.accent : c.muted} strokeWidth={post.likedByMe ? 2.6 : 1.8} />
          <Txt v="small" color={post.likedByMe ? 'accent' : 'muted'}>
            {t('post.likes', { n: post.likeCount })}
          </Txt>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={t('post.openComments')} onPress={onComments} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="comment" color={c.muted} />
          <Txt v="small" color="muted">
            {t('post.comments', { n: post.commentCount })}
          </Txt>
        </Pressable>
        {post.mine && onDelete && (
          <Pressable accessibilityRole="button" accessibilityLabel={t('post.delete')} onPress={() => setConfirm((v) => !v)} hitSlop={8} style={{ marginLeft: 'auto' }}>
            <Icon name="trash" color={c.muted} />
          </Pressable>
        )}
      </View>
      {confirm && onDelete && (
        <View style={{ paddingHorizontal: 14 }}>
          <Button label={t('post.deleteConfirm')} tone="dark" onPress={onDelete} style={{ paddingVertical: 9 }} />
        </View>
      )}
    </Card>
  );
}
