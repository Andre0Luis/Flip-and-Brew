import React, { useCallback, useState } from 'react';
import { Pressable, Share, Switch, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button, Card, Field, Header, Screen, Segmented, Txt } from '@/components/ui';
import { PostCard } from '@/components/PostCard';
import { Icon } from '@/components/Icon';
import { PersonRow } from '@/components/PersonRow';
import { useI18n, type Key } from '@/i18n';
import { getBackend } from '@/lib/cloud';
import type { CommunityApi, Friend, FriendRequest, MyCommunityProfile, Person, PostCard as Post, Ranking } from '@/lib/cloud/apiClient';
import { minutesLabel } from '@/lib/format';
import { isoWeekOf, weekTotals } from '@/lib/week';
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
  const [tab, setTab] = useState<'feed' | 'friends' | 'ranking'>('feed');
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    // Avisos à parte: se falharem, o resto da comunidade continua.
    void api
      .notifications()
      .then((n) => setUnread(n.unread))
      .catch(() => {});
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
            <Pressable accessibilityRole="button" accessibilityLabel={t('community.notifA11y', { n: unread })} onPress={() => router.push('/avisos')} hitSlop={10} style={{ padding: 4 }}>
              <BellIcon unread={unread} />
            </Pressable>
          ) : undefined
        }
      />
      {/* O apelido fica embaixo do título: ao lado, um apelido longo quebrava o cabeçalho. */}
      {!!me?.handle && (
        <Txt v="small" color="muted" numberOfLines={1} style={{ marginTop: -8 }}>
          {`@${me.handle}`}
        </Txt>
      )}
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
          <Segmented<'feed' | 'friends' | 'ranking'>
            value={tab}
            onChange={setTab}
            options={[
              { value: 'feed', label: t('community.tabFeed') },
              { value: 'friends', label: t('community.tabFriends') },
              { value: 'ranking', label: t('community.tabRanking') },
            ]}
          />
          {tab === 'feed' && <FeedTab api={api} />}
          {tab === 'ranking' && <RankingTab api={api} onOpen={open} />}
          {tab === 'friends' && (
        <>
          <Card style={{ gap: 8 }}>
            <Txt v="title">{t('share.inviteTitle')}</Txt>
            <Txt v="small" color="muted">
              {t('share.inviteBody')}
            </Txt>
            <Button label={t('share.inviteCta')} tone="quiet" onPress={() => void Share.share({ message: t('share.invite', { handle: me.handle ?? '' }) }).catch(() => {})} />
          </Card>
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

function BellIcon({ unread }: { unread: number }) {
  const { c } = useTheme();
  return (
    <View>
      <Icon name="bell" color={c.fg} />
      {unread > 0 && (
        <View style={{ position: 'absolute', right: -6, top: -4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
          <Txt v="small" color="accentFg" style={{ fontSize: 10, lineHeight: 12 }}>
            {unread > 9 ? '9+' : String(unread)}
          </Txt>
        </View>
      )}
    </View>
  );
}

/** Meus posts e os dos amigos. Curtir é otimista: muda na hora e desfaz se o servidor recusar. */
function FeedTab({ api }: { api: CommunityApi }) {
  const { t } = useI18n();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const [error, setError] = useState<CommunityErrorKey | null>(null);

  const load = useCallback(async () => {
    try {
      const f = await api.feed();
      setPosts(f.posts);
      setNext(f.nextBefore);
      setError(null);
    } catch (e) {
      setError(communityErrorKey(e));
    }
  }, [api]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const more = async () => {
    if (!next) return;
    try {
      const f = await api.feed(next);
      setPosts((p) => [...(p ?? []), ...f.posts]);
      setNext(f.nextBefore);
    } catch (e) {
      setError(communityErrorKey(e));
    }
  };

  const toggleLike = async (post: Post) => {
    const flip = (p: Post): Post => (p.id === post.id ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likeCount + (p.likedByMe ? -1 : 1) } : p);
    setPosts((list) => list?.map(flip) ?? null);
    try {
      await (post.likedByMe ? api.unlike(post.id) : api.like(post.id));
    } catch (e) {
      setPosts((list) => list?.map(flip) ?? null);
      setError(communityErrorKey(e));
    }
  };

  const remove = async (post: Post) => {
    try {
      await api.deletePost(post.id);
      setPosts((list) => list?.filter((p) => p.id !== post.id) ?? null);
    } catch (e) {
      setError(communityErrorKey(e));
    }
  };

  return (
    <>
      <Button label={t('feed.new')} onPress={() => router.push('/post/novo')} />
      {error && (
        <Txt v="small" color="bad" accessibilityLiveRegion="polite">
          {t(`community.err.${error}` as Key)}
        </Txt>
      )}
      {posts === null ? (
        !error && (
          <Txt v="body" color="muted">
            {t('community.loading')}
          </Txt>
        )
      ) : posts.length === 0 ? (
        <Card>
          <Txt v="body" color="muted">
            {t('feed.empty')}
          </Txt>
        </Card>
      ) : (
        posts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            onLike={() => void toggleLike(p)}
            onComments={() => router.push({ pathname: '/post/[id]', params: { id: p.id, title: p.title, mine: p.mine ? '1' : '0' } })}
            onDelete={p.mine ? () => void remove(p) : undefined}
          />
        ))
      )}
      {!!next && <Button label={t('feed.more')} tone="quiet" onPress={() => void more()} />}
    </>
  );
}

/** Ranking da semana: manda os meus totais e mostra amigos ou o geral. */
function RankingTab({ api, onOpen }: { api: CommunityApi; onOpen: (p: Person) => void }) {
  const { c } = useTheme();
  const { t } = useI18n();
  const sessions = useApp((s) => s.sessions);
  const [scope, setScope] = useState<'friends' | 'global'>('friends');
  const [data, setData] = useState<Ranking | null>(null);
  const [global, setGlobal] = useState<boolean | null>(null);
  const [error, setError] = useState<CommunityErrorKey | null>(null);

  const load = useCallback(async () => {
    try {
      await api.putWeek(weekTotals(sessions, Date.now())).catch(() => {});
      const [r, g] = await Promise.all([api.rankings(scope, isoWeekOf(Date.now())), api.globalRanking()]);
      setData(r);
      setGlobal(g);
      setError(null);
    } catch (e) {
      setError(communityErrorKey(e));
    }
  }, [api, scope, sessions]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const toggleGlobal = async (on: boolean) => {
    setGlobal(on);
    try {
      await api.setGlobalRanking(on);
      if (scope === 'global') void load();
    } catch (e) {
      setGlobal(!on);
      setError(communityErrorKey(e));
    }
  };

  return (
    <>
      <Card style={{ gap: 10 }}>
        <Txt v="title">{t('ranking.title')}</Txt>
        <Txt v="small" color="muted">
          {t('ranking.hint')}
        </Txt>
        <Segmented<'friends' | 'global'>
          value={scope}
          onChange={setScope}
          options={[
            { value: 'friends', label: t('ranking.friends') },
            { value: 'global', label: t('ranking.global') },
          ]}
        />
      </Card>
      {error && (
        <Txt v="small" color="bad" accessibilityLiveRegion="polite">
          {t(`community.err.${error}` as Key)}
        </Txt>
      )}
      {data && (
        <Card style={{ gap: 2 }}>
          {data.entries.length === 0 ? (
            <Txt v="small" color="muted">
              {t('ranking.empty')}
            </Txt>
          ) : (
            data.entries.map((e) => (
              <View key={e.person.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: e.me ? c.soft : 'transparent', borderRadius: 12, paddingHorizontal: 8 }}>
                <Txt v="num" color={e.rank <= 3 ? 'accent' : 'muted'} style={{ width: 26, textAlign: 'center' }}>
                  {String(e.rank)}
                </Txt>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <PersonRow person={e.person} onPress={e.me ? undefined : () => onOpen(e.person)} />
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Txt v="body">{minutesLabel(e.offlineMinutes)}</Txt>
                  <Txt v="small" color="muted">
                    {t('ranking.cups', { n: e.cups })}
                  </Txt>
                </View>
              </View>
            ))
          )}
        </Card>
      )}
      {global !== null && (
        <Card style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Txt v="title" style={{ flex: 1, fontSize: 15 }}>
              {t('ranking.globalToggle')}
            </Txt>
            <Switch value={global} onValueChange={(v) => void toggleGlobal(v)} trackColor={{ true: c.accent, false: c.line }} thumbColor={c.surface} accessibilityLabel={t('ranking.globalToggle')} />
          </View>
          <Txt v="small" color="muted">
            {t('ranking.globalHint')}
          </Txt>
        </Card>
      )}
    </>
  );
}
