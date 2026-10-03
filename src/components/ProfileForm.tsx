import React, { useState } from 'react';
import { View } from 'react-native';
import { Chip, Field, Txt } from './ui';
import { ACIDITIES, AGE_MAX, AGE_MIN, BODIES, FLAVORS, GRINDS, METHODS, ROASTS, isPhoneValid, parseAge, toggleChoice, toggleFlavor } from '@/lib/profile';
import { useApp } from '@/store/useApp';
import { useI18n, type Key } from '@/i18n';

/** Escolha única: tocar de novo na opção marcada a limpa. */
function Choices({ label, options, value, prefix, onChange }: { label: string; options: readonly string[]; value?: string; prefix: string; onChange: (v: string | undefined) => void }) {
  const { t } = useI18n();
  return (
    <View style={{ gap: 8 }}>
      <Txt v="label" color="muted">
        {label}
      </Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((o) => (
          <Chip key={o} label={t(`${prefix}.${o}` as Key)} on={value === o} onPress={() => onChange(toggleChoice(value, o))} />
        ))}
      </View>
    </View>
  );
}

/**
 * Dados pessoais e preferências de café, todos opcionais. Salva sozinho a cada mudança.
 * Telefone e idade só são salvos quando válidos; enquanto estiverem errados, o campo mostra o aviso.
 */
export function ProfileForm() {
  const { t } = useI18n();
  const profile = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  // Rascunhos: o texto digitado pode estar inválido sem apagar o último valor salvo.
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [age, setAge] = useState(profile.age ? String(profile.age) : '');
  const phoneBad = !isPhoneValid(phone);
  const ageBad = parseAge(age) === null;

  return (
    <View style={{ gap: 18 }}>
      <View style={{ gap: 12 }}>
        <Txt v="title">{t('profile.about')}</Txt>
        <Field label={t('profile.name')} value={profile.name ?? ''} onChangeText={(v) => setProfile({ name: v })} autoCapitalize="words" autoComplete="name" textContentType="name" maxLength={60} />
        <Field
          label={t('profile.phone')}
          value={phone}
          onChangeText={(v) => {
            setPhone(v);
            if (isPhoneValid(v)) setProfile({ phone: v });
          }}
          error={phoneBad}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          maxLength={24}
        />
        <Txt v="small" color={phoneBad ? 'bad' : 'muted'} accessibilityLiveRegion="polite">
          {phoneBad ? t('profile.phoneInvalid') : t('profile.phoneHint')}
        </Txt>
        <Field
          label={t('profile.age')}
          value={age}
          onChangeText={(v) => {
            setAge(v);
            const n = parseAge(v);
            if (n !== null) setProfile({ age: n });
          }}
          error={ageBad}
          keyboardType="number-pad"
          maxLength={3}
        />
        {ageBad && (
          <Txt v="small" color="bad" accessibilityLiveRegion="polite">
            {t('profile.ageInvalid', { min: AGE_MIN, max: AGE_MAX })}
          </Txt>
        )}
      </View>

      <View style={{ gap: 14 }}>
        <Txt v="title">{t('profile.coffee')}</Txt>
        <Field label={t('profile.favorite')} value={profile.favorite ?? ''} onChangeText={(v) => setProfile({ favorite: v })} placeholder={t('profile.favoritePh')} autoCapitalize="sentences" autoCorrect maxLength={80} />
        <Choices label={t('profile.method')} options={METHODS} value={profile.method} prefix="method" onChange={(v) => setProfile({ method: v })} />
        <Choices label={t('profile.roast')} options={ROASTS} value={profile.roast} prefix="roast" onChange={(v) => setProfile({ roast: v })} />
        <Choices label={t('profile.grind')} options={GRINDS} value={profile.grind} prefix="grind" onChange={(v) => setProfile({ grind: v })} />
        <Choices label={t('profile.body')} options={BODIES} value={profile.body} prefix="body" onChange={(v) => setProfile({ body: v })} />
        <Choices label={t('profile.acidity')} options={ACIDITIES} value={profile.acidity} prefix="acidity" onChange={(v) => setProfile({ acidity: v })} />
        <View style={{ gap: 8 }}>
          <Txt v="label" color="muted">
            {t('profile.flavors')}
          </Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {FLAVORS.map((fl) => (
              <Chip key={fl} label={t(`flavor.${fl}` as Key)} on={!!profile.flavors?.includes(fl)} onPress={() => setProfile({ flavors: toggleFlavor(profile.flavors, fl) })} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
