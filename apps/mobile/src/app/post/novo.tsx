import React, { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/Icon';
import { Button, Field, Screen, Txt } from '@/components/ui';
import { useI18n, type Key } from '@/i18n';
import { getBackend } from '@/lib/cloud';
import { communityErrorKey } from '@/lib/community';
import { preparePhoto, uploadPhoto } from '@/lib/postPhotos';
import { useTheme } from '@/theme/ThemeProvider';

const MAX_PHOTOS = 3;
type Photo = { uri: string; width: number; height: number };

/** Novo post: até 3 fotos (reduzidas e compactadas no aparelho antes do envio), título e legenda. */
export default function NovoPost() {
  const { c, r } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const api = getBackend()?.community;
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<Key | null>(null);
  const [error, setError] = useState<Key | null>(null);

  const add = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: MAX_PHOTOS - photos.length, quality: 1 });
    if (res.canceled) return;
    setPhotos((p) => [...p, ...res.assets.map((a) => ({ uri: a.uri, width: a.width, height: a.height }))].slice(0, MAX_PHOTOS));
  };

  const publish = async () => {
    if (!api) return;
    if (!title.trim()) return setError('post.err.title');
    setBusy(true);
    setError(null);
    try {
      setStep('post.step.photos');
      const files = await Promise.all(photos.map(preparePhoto));
      const slots = files.length ? await api.uploadSlots(files.length) : [];
      setStep('post.step.upload');
      await Promise.all(slots.map((s, i) => uploadPhoto(s.url, files[i])));
      setStep('post.step.publish');
      await api.createPost({ title: title.trim(), ...(caption.trim() ? { caption: caption.trim() } : {}), images: slots.map((s) => s.path) });
      router.back();
    } catch (e) {
      const code = (e as { code?: string })?.code;
      setError(code === 'storage_unavailable' ? 'post.err.storage' : code === 'upload_failed' ? 'post.err.upload' : (`community.err.${communityErrorKey(e)}` as Key));
    } finally {
      setBusy(false);
      setStep(null);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
        <Txt v="display">{t('post.newTitle')}</Txt>
        <Button label={t('post.cancel')} tone="quiet" disabled={busy} onPress={() => router.back()} style={{ paddingVertical: 8, paddingHorizontal: 16 }} />
      </View>

      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        {photos.map((p, i) => (
          <View key={p.uri} style={{ width: 96, height: 96, borderRadius: r.md, overflow: 'hidden', backgroundColor: c.soft }}>
            <Image source={{ uri: p.uri }} style={{ width: 96, height: 96 }} resizeMode="cover" />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('post.removePhoto')}
              disabled={busy}
              onPress={() => setPhotos((list) => list.filter((_, j) => j !== i))}
              hitSlop={6}
              style={{ position: 'absolute', right: 4, top: 4, backgroundColor: c.surface, borderRadius: 999, padding: 3 }}
            >
              <Icon name="close" size={16} color={c.fg} />
            </Pressable>
          </View>
        ))}
      </View>
      {photos.length < MAX_PHOTOS && <Button label={t('post.addPhotos', { n: photos.length, max: MAX_PHOTOS })} tone="quiet" disabled={busy} onPress={() => void add()} />}
      <Txt v="small" color="muted">
        {t('post.photosHint')}
      </Txt>

      <Field label={t('post.titleLabel')} value={title} onChangeText={setTitle} maxLength={80} />
      <Field label={t('post.captionLabel')} value={caption} onChangeText={setCaption} maxLength={500} multiline style={{ minHeight: 96, textAlignVertical: 'top' }} />

      {step && (
        <Txt v="small" color="muted" accessibilityLiveRegion="polite">
          {t(step)}
        </Txt>
      )}
      {error && (
        <Txt v="small" color="bad" accessibilityLiveRegion="polite">
          {t(error)}
        </Txt>
      )}
      <Button label={t('post.publish')} disabled={busy} onPress={() => void publish()} />
    </Screen>
  );
}
