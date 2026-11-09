import React, { useState } from 'react';
import { Modal, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Txt } from '@/components/ui';
import { useI18n, type Key } from '@/i18n';
import { TUTORIAL_STEPS, type TutorialPlace } from '@/lib/tutorial';
import { useApp } from '@/store/useApp';
import { useTheme } from '@/theme/ThemeProvider';

/** Balões passo a passo no Início, na primeira vez: perfil e moedas, cafeteira, começar o copo e as abas. */
export function Tutorial() {
  const { c, r, isDark } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const done = useApp((s) => s.setTutorialDone);
  const [i, setI] = useState(0);
  const step = TUTORIAL_STEPS[i];
  const last = i === TUTORIAL_STEPS.length - 1;

  // Onde o balão fica (e para onde a seta aponta), conforme a parte da tela que o passo explica.
  const pos: Record<TutorialPlace, object> = {
    top: { top: insets.top + 64 },
    middle: { top: '30%' },
    bottom: { bottom: insets.bottom + 150 },
    tabs: { bottom: insets.bottom + 72 },
    center: { top: '35%' },
  };
  const arrow = step.place === 'top' ? 'up' : step.place === 'bottom' || step.place === 'tabs' ? 'down' : null;
  const tri = (dir: 'up' | 'down') => ({
    alignSelf: 'center' as const,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    ...(dir === 'up' ? { borderBottomWidth: 12, borderBottomColor: c.surface } : { borderTopWidth: 12, borderTopColor: c.surface }),
  });

  return (
    <Modal transparent animationType="fade" visible onRequestClose={() => i > 0 && setI(i - 1)} statusBarTranslucent>
      <View style={{ flex: 1 }}>
        <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: isDark ? c.bg : c.fg, opacity: isDark ? 0.7 : 0.45 }} />
        <View style={{ position: 'absolute', left: 20, right: 20, ...pos[step.place] }}>
          {arrow === 'up' && <View style={tri('up')} />}
          <Card style={{ gap: 10, borderRadius: r.lg }}>
            <Txt v="label" color="muted">
              {t('tutorial.step', { a: i + 1, b: TUTORIAL_STEPS.length })}
            </Txt>
            <Txt v="title">{t(`tutorial.${step.id}.title` as Key)}</Txt>
            <Txt v="body" color="muted">
              {t(`tutorial.${step.id}.body` as Key)}
            </Txt>
            <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
              <Button label={last ? t('tutorial.finish') : t('tutorial.next')} onPress={() => (last ? done(true) : setI(i + 1))} style={{ paddingVertical: 8, paddingHorizontal: 18 }} />
            </View>
          </Card>
          {arrow === 'down' && <View style={tri('down')} />}
        </View>
      </View>
    </Modal>
  );
}
