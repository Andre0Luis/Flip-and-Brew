import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button, Card, Field, Header, Screen, Txt } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { PersonRow } from '@/components/PersonRow';
import { useI18n, type Key } from '@/i18n';
import { getBackend } from '@/lib/cloud';
import type { CommunityApi, Friend, FriendRequest, MyCommunityProfile, Person } from '@/lib/cloud/apiClient';
import { accountName, communityErrorKey, isValidHandle, sanitizeHandle, searchTerm, suggestHandle, type CommunityErrorKey } from '@/lib/community';
import { useApp } from '@/store/useApp';
import { useAuth } from '@/store/useAuth';
import { useTheme } from '@/theme/ThemeProvider';

/** Comunidade: amigos com aprovação, busca por apelido e perfil público (ADR-0024). Sem o backend próprio, avisa que vem aí. */
export default function Comunidade() {
  const status = useAuth((s) => s.status);
  const api = getBackend()?.community;
  if (!api) return <ComingSoon />;
  if (status !== 'signedIn') return <SignInFirst />;
  return <CommunityHome api={api} />;
}

function ComingSoon() {
  const { c } = useTheme();
  const { t } = useI18n();
  return (
    <Screen ads>
      <Header title={t('community.title')} />
      <Card style={{ gap: 14, alignItems: 'center', paddingVertical: 28 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: c.soft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="people" size={30} color={c.accent} />
        </View>
        <Txt v="display" style={{ textAlign: 'center' }}>
          {t('community.soon')}
        </Txt>
        <Txt v="body" color="muted" style={{ textAlign: 'center', maxWidth: 340 }}>
          {t('community.body')}
        </Txt>
      </Card>
    </Screen>
  );
}

function SignInFirst() {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <Screen ads>
      <Header title={t('community.title')} />
      <Card style={{ gap: 12 }}>
        <Txt v="body" color="muted">
          {t('community.signIn')}
        </Txt>
        <Button label={t('community.signInCta')} onPress={() => router.push('/conta')} />
      </Card>
    </Screen>
  );
}

function CommunityHome({ api }: { api: CommunityApi }) {
  const { t } = useI18n();
  const router = useRouter();
  const profileName = useApp((s) => s.profile.name);
  const user = useAuth((s) => s.user);
  const name = accountName(profileName, user?.name);
  const [me, setMe] = useState<MyCommunityProfile | null>(null);
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [error, setError] = useState<CommunityErrorKey | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [m, inc, out, fr] = await Promise.all([api.me(), api.requests('incoming'), api.requests('outgoing'), api.friends()]);
      // O nome na comunidade acompanha o da conta: se mudou (ou nunca foi enviado), atualiza no servidor.
      setMe(m.handle && name && m.displayName !== name ? await api.updateMe({ displayName: name }) : m);
      setIncoming(inc);
      setOutgoing(out);
      setFriends(fr);
      setError(null);
    } catch (e) {
      setError(communityErrorKey(e));
    }
  }, [api, name]);

  // Recarrega ao voltar para a aba (por exemplo, depois de aceitar um pedido no perfil de alguém).
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      await load();
    } catch (e) {
      setError(communityErrorKey(e));
    } finally {
      setBusy(false);
    }
  };

  const open = (p: Person) => p.handle && router.push({ pathname: '/pessoa/[handle]', params: { handle: p.handle } });

  return (
    <Screen ads>
      <Header
        title={t('community.title')}
        right={
          me?.handle ? (
            <Txt v="label" color="muted">
              {`@${me.handle}`}
            </Txt>
          ) : undefined
        }
      />
      {error && (
        <Txt v="small" color="bad" accessibilityLiveRegion="polite">
          {t(`community.err.${error}` as Key)}
        </Txt>
      )}
      {me === null ? (
        !error && (
          <Txt v="body" color="muted">
            {t('community.loading')}
          </Txt>
        )
      ) : !me.handle ? (
        <HandleSetup api={api} name={name} email={user?.email ?? null} onDone={setMe} />
      ) : (
        <>
          <SearchCard api={api} onOpen={open} />

          {incoming.length > 0 && (
            <Card style={{ gap: 6 }}>
              <Txt v="title">{t('community.requestsTitle')}</Txt>
              {incoming.map((r) => (
                <PersonRow
                  key={r.requestId}
                  person={r}
                  onPress={() => open(r)}
                  right={
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <Button label={t('community.accept')} disabled={busy} onPress={() => void act(() => api.accept(r.requestId))} style={{ paddingVertical: 8, paddingHorizontal: 12 }} />
                      <Button label={t('community.decline')} tone="quiet" disabled={busy} onPress={() => void act(() => api.removeRequest(r.requestId))} style={{ paddingVertical: 8, paddingHorizontal: 12 }} />
                    </View>
                  }
                />
              ))}
            </Card>
          )}

          <Card style={{ gap: 6 }}>
            <Txt v="title">{t('community.friendsTitle')}</Txt>
            {friends.length ? (
              friends.map((f) => <PersonRow key={f.id} person={f} onPress={() => open(f)} />)
            ) : (
              <Txt v="small" color="muted">
                {t('community.friendsEmpty')}
              </Txt>
            )}
          </Card>

          {outgoing.length > 0 && (
            <Card style={{ gap: 6 }}>
              <Txt v="title">{t('community.sentTitle')}</Txt>
              {outgoing.map((r) => (
                <PersonRow
                  key={r.requestId}
                  person={r}
                  onPress={() => open(r)}
                  right={<Button label={t('community.cancel')} tone="quiet" disabled={busy} onPress={() => void act(() => api.removeRequest(r.requestId))} style={{ paddingVertical: 8, paddingHorizontal: 12 }} />}
                />
              ))}
            </Card>
          )}
        </>
      )}
    </Screen>
  );
}

/** Só o apelido: o nome vem da conta. A sugestão sai do nome ou, sem nome, do começo do e-mail. */
function HandleSetup({ api, name, email, onDone }: { api: CommunityApi; name?: string; email: string | null; onDone: (m: MyCommunityProfile) => void }) {
  const { t } = useI18n();
  const [handle, setHandle] = useState(() => suggestHandle(name) || suggestHandle(email?.split('@')[0]));
  const [error, setError] = useState<CommunityErrorKey | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!isValidHandle(handle)) return setError('handleInvalid');
    setBusy(true);
    setError(null);
    try {
      onDone(await api.updateMe({ handle, ...(name ? { displayName: name } : {}) }));
    } catch (e) {
      setError(communityErrorKey(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card style={{ gap: 12 }}>
      <Txt v="title">{t('community.setupTitle')}</Txt>
      <Txt v="small" color="muted">
        {t('community.setupBody')}
      </Txt>
      {!!name && (
        <Txt v="small" color="muted">
          {t('community.nameFrom', { name })}
        </Txt>
      )}
      <Field label={t('community.handle')} value={handle} onChangeText={(v) => setHandle(sanitizeHandle(v))} autoCapitalize="none" autoCorrect={false} maxLength={20} returnKeyType="done" onSubmitEditing={() => void save()} />
      <Txt v="small" color="muted">
        {t('community.handleHint')}
      </Txt>
      {error && (
        <Txt v="small" color="bad" accessibilityLiveRegion="polite">
          {t(`community.err.${error}` as Key)}
        </Txt>
      )}
      <Button label={t('community.setupSave')} disabled={busy} onPress={() => void save()} />
    </Card>
  );
}

function SearchCard({ api, onOpen }: { api: CommunityApi; onOpen: (p: Person) => void }) {
  const { t } = useI18n();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Person[] | null>(null);
  const [hint, setHint] = useState<Key | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    const term = searchTerm(q);
    if (!term) return setHint('community.searchShort');
    setHint(null);
    setBusy(true);
    try {
      setResults(await api.search(term));
    } catch (e) {
      setHint(`community.err.${communityErrorKey(e)}` as Key);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card style={{ gap: 10 }}>
      <Txt v="title">{t('community.searchTitle')}</Txt>
      <Field label={t('community.searchLabel')} value={q} onChangeText={setQ} autoCapitalize="none" autoCorrect={false} returnKeyType="search" onSubmitEditing={() => void run()} />
      <Button label={t('community.searchCta')} tone="quiet" disabled={busy} onPress={() => void run()} />
      {hint && (
        <Txt v="small" color="muted">
          {t(hint)}
        </Txt>
      )}
      {results &&
        (results.length ? (
          results.map((p) => <PersonRow key={p.id} person={p} onPress={() => onOpen(p)} />)
        ) : (
          <Txt v="small" color="muted">
            {t('community.searchEmpty')}
          </Txt>
        ))}
    </Card>
  );
}
