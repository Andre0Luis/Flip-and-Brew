import React, { useState } from 'react';
import { Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Chip, Screen, Segmented, Txt } from '@/components/ui';
import { useApp } from '@/store/useApp';
import { useCalibrate } from '@/engine/useCalibrate';
import type { ThemeMode } from '@/store/types';
import { useTheme } from '@/theme/ThemeProvider';

const GOALS = [60, 90, 120, 180, 240];

function Row({ title, hint, value, onChange }: { title: string; hint: string; value: boolean; onChange: (v: boolean) => void }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt v="title" style={{ fontSize: 15 }}>
          {title}
        </Txt>
        <Txt v="small" color="muted">
          {hint}
        </Txt>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: c.accent, false: c.line }} accessibilityLabel={title} />
    </View>
  );
}

export default function Ajustes() {
  const router = useRouter();
  const { settings } = useApp();
  const set = useApp((s) => s.setSettings);
  const addCoins = useApp((s) => s.addCoins);
  const loadDemo = useApp((s) => s.loadDemo);
  const resetAll = useApp((s) => s.resetAll);
  const { run: calibrate, busy: calibrating, message: cal, available } = useCalibrate();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
        <Txt v="display">Ajustes</Txt>
        <Button label="Fechar" tone="quiet" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={{ paddingVertical: 8, paddingHorizontal: 16 }} />
      </View>

      <Card style={{ gap: 12 }}>
        <Txt v="title">Meta diária offline</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {GOALS.map((g) => (
            <Chip key={g} label={g >= 60 ? `${g / 60 === Math.floor(g / 60) ? g / 60 : (g / 60).toFixed(1).replace('.', ',')} h` : `${g} min`} on={settings.goalMin === g} onPress={() => set({ goalMin: g })} />
          ))}
        </View>
      </Card>

      <Card style={{ gap: 12 }}>
        <Txt v="title">Aparência</Txt>
        <Segmented<ThemeMode>
          value={settings.themeMode}
          onChange={(v) => set({ themeMode: v })}
          options={[
            { value: 'system', label: 'Sistema' },
            { value: 'light', label: 'Claro' },
            { value: 'dark', label: 'Torra escura' },
          ]}
        />
      </Card>

      <Card style={{ gap: 14 }}>
        <Row title="Iniciar ao virar o celular" hint="Na tela Início, virar o celular para baixo por 2 segundos começa um copo." value={settings.autoStart} onChange={(v) => set({ autoStart: v })} />
        <View style={{ gap: 8 }}>
          <Txt v="small" color="muted">
            Se virar o celular não inicia ou encerra o copo como esperado, calibre o sensor.
          </Txt>
          <Button label={calibrating ? 'Calibrando…' : 'Calibrar sensor'} tone="quiet" disabled={calibrating || !available} onPress={calibrate} />
          {!available && (
            <Txt v="small" color="muted">
              Este aparelho (ou o navegador) não expõe o acelerômetro.
            </Txt>
          )}
          {cal && (
            <Txt v="small" color="accent" accessibilityLiveRegion="polite">
              {cal}
            </Txt>
          )}
        </View>
      </Card>

      <Card style={{ gap: 14 }}>
        <Txt v="title">Ferramentas de teste</Txt>
        <Row title="Copos de 1 minuto" hint="Para testar o fluxo inteiro sem esperar. Vale para os próximos copos." value={settings.quickBrew} onChange={(v) => set({ quickBrew: v })} />
        <Button label="Carregar 4 semanas de dados de exemplo" tone="quiet" onPress={loadDemo} />
        <Button label="Ganhar 500 moedas" tone="quiet" onPress={() => addCoins(500)} />
        {confirmReset ? (
          <View style={{ gap: 8 }}>
            <Txt v="small" color="bad">
              Isso apaga copos, moedas e itens. Não dá para desfazer.
            </Txt>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button label="Apagar tudo" tone="dark" style={{ flex: 1 }} onPress={() => { resetAll(); setConfirmReset(false); }} />
              <Button label="Cancelar" tone="quiet" style={{ flex: 1 }} onPress={() => setConfirmReset(false)} />
            </View>
          </View>
        ) : (
          <Button label="Apagar todos os dados" tone="quiet" onPress={() => setConfirmReset(true)} />
        )}
      </Card>

      <Txt v="small" color="muted">
        Flip & Brew mede só o tempo que o app registra. Desbloqueios e tempo de tela do sistema ainda não entram nas contas.
      </Txt>
    </Screen>
  );
}
