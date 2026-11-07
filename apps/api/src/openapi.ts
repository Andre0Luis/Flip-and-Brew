import { z, type ZodType } from 'zod';
import {
  MAX_PENDING_REQUESTS,
  MIN_AGE,
  bootstrapSchema,
  coffeeLogSchema,
  coffeePrefsSchema,
  pingSchema,
  privacyPatchSchema,
  profilePatchSchema,
  snapshotPutSchema,
  userIdSchema,
} from '@flipandbrew/shared';

/** Versão do Swagger UI carregado da CDN. Fixa e com mais de duas semanas: a UI roda no navegador de quem abre /docs. */
export const SWAGGER_UI_VERSION = '5.33.3';

type Json = Record<string, unknown>;
type Auth = 'none' | 'user' | 'admin';
type Param = { name: string; description: string; schema?: Json; required?: boolean };
export type Op = {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  /** No estilo OpenAPI: /v1/me/coffees/{id} (o Hono usa :id; o teste converte e compara com as rotas reais). */
  path: string;
  tag: string;
  summary: string;
  description?: string;
  auth: Auth;
  body?: ZodType;
  query?: Param[];
  /** código HTTP → descrição e, se houver, o componente da resposta */
  responses: Record<number, { description: string; schema?: string }>;
};

// ---- Componentes de resposta (descrevem o que a API devolve; os corpos de entrada vêm dos esquemas Zod reais) ----
const str: Json = { type: 'string' };
const uuid: Json = { type: 'string', format: 'uuid' };
const dateTime: Json = { type: 'string', format: 'date-time' };
const maybe = (s: Json): Json => ({ ...s, type: [s.type, 'null'] });
const obj = (properties: Json, required: string[] = Object.keys(properties)): Json => ({ type: 'object', properties, required });
const person = { id: uuid, handle: maybe(str), displayName: maybe(str), avatarPath: maybe(str) };

const schemas: Record<string, Json> = {
  Error: obj({ error: obj({ code: str, message: str }, ['code', 'message']) }),
  OwnProfile: obj({
    id: uuid,
    email: str,
    handle: maybe(str),
    displayName: maybe(str),
    bio: maybe(str),
    country: maybe(str),
    birthDate: maybe(str),
    role: { type: 'string', enum: ['user', 'moderator', 'admin'] },
    welcomedAt: maybe(dateTime),
    createdAt: dateTime,
  }),
  CoffeePrefs: obj({ favoriteCoffees: { type: 'array', items: str }, methods: { type: 'array', items: str }, roast: maybe(str), flavors: { type: 'array', items: str } }),
  PrivacySettings: obj({ showInGlobalRanking: { type: 'boolean' }, showCoffeePrefs: { type: 'boolean' } }),
  Person: obj(person),
  PublicProfile: obj({
    profile: obj({ ...person, bio: maybe(str), country: maybe(str), joinedAt: dateTime }),
    relation: { type: 'string', enum: ['self', 'none', 'friends', 'request_sent', 'request_received'] },
    prefs: { oneOf: [{ $ref: '#/components/schemas/CoffeePrefs' }, { type: 'null' }] },
  }),
  Friendship: obj({ id: uuid, requesterId: uuid, addresseeId: uuid, status: { type: 'string', enum: ['pending', 'accepted'] }, createdAt: dateTime, respondedAt: maybe(dateTime) }),
  CoffeeLog: obj({ id: uuid, userId: uuid, at: dateTime, kind: str, method: maybe(str), sizeMl: maybe({ type: 'integer' }), note: maybe(str) }),
  Snapshot: obj({ v: { type: 'integer', enum: [1] }, updatedAt: { type: 'integer' }, data: { type: 'object', additionalProperties: true } }),
  Overview: obj({
    totalUsers: { type: 'integer' },
    activeNow: { type: 'integer', description: 'Vistos nos últimos 5 minutos.' },
    active24h: { type: 'integer' },
    active7d: { type: 'integer' },
    newLast7d: { type: 'integer' },
    signupsByDay: { type: 'array', items: obj({ day: str, n: { type: 'integer' } }) },
    at: { type: 'integer' },
  }),
  AdminUser: obj({ id: uuid, email: str, displayName: maybe(str), handle: maybe(str), role: str, createdAt: dateTime, lastSeenAt: maybe(dateTime), bannedAt: maybe(dateTime), activeNow: { type: 'boolean' } }),
};

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const wrap = (key: string, name: string, isArray = false): Json => obj({ [key]: isArray ? { type: 'array', items: ref(name) } : ref(name) });
// Respostas "embrulhadas" (ex.: { profile, created }) viram componentes próprios.
Object.assign(schemas, {
  BootstrapResult: obj({ profile: ref('OwnProfile'), created: { type: 'boolean' } }),
  MeResult: obj({ profile: ref('OwnProfile'), prefs: { oneOf: [ref('CoffeePrefs'), { type: 'null' }] }, privacy: { oneOf: [ref('PrivacySettings'), { type: 'null' }] } }),
  ProfileResult: wrap('profile', 'OwnProfile'),
  PrefsResult: wrap('prefs', 'CoffeePrefs'),
  PrivacyResult: wrap('privacy', 'PrivacySettings'),
  CoffeeResult: wrap('coffee', 'CoffeeLog'),
  CoffeeList: obj({ coffees: { type: 'array', items: ref('CoffeeLog') }, nextBefore: maybe({ type: 'integer' }) }),
  FriendshipResult: obj({ friendship: ref('Friendship'), accepted: { type: 'boolean' } }),
  RequestList: obj({ requests: { type: 'array', items: { allOf: [ref('Person'), obj({ requestId: uuid, createdAt: dateTime })] } } }),
  FriendList: obj({ friends: { type: 'array', items: { allOf: [ref('Person'), obj({ since: maybe(dateTime) })] } } }),
  BlockList: wrap('blocked', 'Person', true),
  UserList: wrap('users', 'Person', true),
  AdminUserList: obj({ users: { type: 'array', items: ref('AdminUser') }, nextBefore: maybe({ type: 'integer' }) }),
});

const INVALID = { description: 'Entrada inválida (`invalid_input`, `invalid_json`, ...).', schema: 'Error' };
const NOT_FOUND = { description: 'Não encontrado (ou bloqueado, sem revelar que existe).', schema: 'Error' };
const idParam = (name: string, description: string): Param => ({ name, description, schema: uuid });

// ---- As rotas. O teste confere que esta lista e as rotas reais do Hono são exatamente as mesmas. ----
export const operations: Op[] = [
  { method: 'get', path: '/health', tag: 'Saúde', summary: 'A API está de pé', auth: 'none', responses: { 200: { description: '`{ ok: true }`' } } },

  { method: 'post', path: '/v1/me/bootstrap', tag: 'Conta', summary: 'Cria o perfil na primeira vez (idempotente)', auth: 'user', body: bootstrapSchema,
    description: `Depois do login, chame uma vez. Cria perfil, privacidade e preferências; envia o e-mail de boas-vindas (uma vez, no idioma pedido). **Admin** só vem de e-mail **verificado** que está em \`ADMIN_EMAILS\`.`,
    responses: { 200: { description: 'Perfil já existia.', schema: 'BootstrapResult' }, 201: { description: 'Perfil criado.', schema: 'BootstrapResult' }, 400: INVALID, 403: { description: 'Conta suspensa.', schema: 'Error' } } },
  { method: 'get', path: '/v1/me', tag: 'Conta', summary: 'Meu perfil, preferências e privacidade', auth: 'user', responses: { 200: { description: 'Ok.', schema: 'MeResult' }, 404: { description: 'Sem perfil: chame `/v1/me/bootstrap`.', schema: 'Error' } } },
  { method: 'patch', path: '/v1/me', tag: 'Conta', summary: 'Atualiza meu perfil', auth: 'user', body: profilePatchSchema,
    description: `Apelido único (3 a 20 letras minúsculas, números ou _). A data de nascimento só pode ser definida uma vez e exige ${MIN_AGE} anos ou mais. Campos desconhecidos (como \`role\`) são recusados.`,
    responses: { 200: { description: 'Perfil atualizado.', schema: 'ProfileResult' }, 400: { description: '`invalid_input`, `under_age`, `invalid_birth_date`, `birth_date_locked`.', schema: 'Error' }, 409: { description: '`handle_taken`.', schema: 'Error' } } },
  { method: 'patch', path: '/v1/me/prefs', tag: 'Conta', summary: 'Atualiza minhas preferências de café', auth: 'user', body: coffeePrefsSchema, responses: { 200: { description: 'Ok.', schema: 'PrefsResult' }, 400: INVALID } },
  { method: 'patch', path: '/v1/me/privacy', tag: 'Conta', summary: 'Atualiza minha privacidade', auth: 'user', body: privacyPatchSchema,
    description: 'O perfil é público e a comunidade é só entre amigos; só há estas duas escolhas.', responses: { 200: { description: 'Ok.', schema: 'PrivacyResult' }, 400: INVALID } },
  { method: 'post', path: '/v1/me/ping', tag: 'Conta', summary: 'Presença (alimenta "ativos agora")', auth: 'user', body: pingSchema, responses: { 204: { description: 'Registrado.' }, 400: INVALID } },
  { method: 'delete', path: '/v1/me', tag: 'Conta', summary: 'Exclui minha conta e tudo que depende dela', auth: 'user', responses: { 204: { description: 'Conta apagada (cascata).' } } },

  { method: 'get', path: '/v1/me/snapshot', tag: 'Backup', summary: 'Lê o backup do progresso', auth: 'user', responses: { 200: { description: 'Ok.', schema: 'Snapshot' }, 404: { description: '`no_snapshot`.', schema: 'Error' } } },
  { method: 'put', path: '/v1/me/snapshot', tag: 'Backup', summary: 'Grava o backup do progresso', auth: 'user', body: snapshotPutSchema,
    description: 'Recusa gravar um backup mais velho que o do servidor. Tamanho máximo do corpo: 1 MB.',
    responses: { 200: { description: 'Gravado.' }, 400: INVALID, 409: { description: '`stale_snapshot` (`currentUpdatedAt` no corpo).', schema: 'Error' }, 413: { description: 'Corpo grande demais.', schema: 'Error' } } },

  { method: 'post', path: '/v1/me/coffees', tag: 'Café', summary: 'Registra um café que bebi', auth: 'user', body: coffeeLogSchema,
    description: 'Máximo de 50 registros por dia. O horário não pode estar no futuro.', responses: { 201: { description: 'Registrado.', schema: 'CoffeeResult' }, 400: INVALID, 429: { description: 'Limite diário.', schema: 'Error' } } },
  { method: 'get', path: '/v1/me/coffees', tag: 'Café', summary: 'Lista meus cafés (mais recentes primeiro)', auth: 'user',
    query: [{ name: 'limit', description: '1 a 100 (padrão 50).', schema: { type: 'integer' } }, { name: 'before', description: 'Cursor: `nextBefore` da página anterior (ms).', schema: { type: 'integer' } }],
    responses: { 200: { description: 'Ok.', schema: 'CoffeeList' } } },
  { method: 'delete', path: '/v1/me/coffees/{id}', tag: 'Café', summary: 'Apaga um registro meu', auth: 'user', query: [idParam('id', 'Id do registro.')], responses: { 204: { description: 'Apagado.' }, 404: NOT_FOUND } },

  { method: 'post', path: '/v1/friend-requests', tag: 'Amigos', summary: 'Pede amizade', auth: 'user', body: userIdSchema,
    description: `Se a outra pessoa já tinha pedido, vira amizade na hora (\`accepted: true\`). Até ${MAX_PENDING_REQUESTS} pedidos sem resposta por pessoa.`,
    responses: { 200: { description: 'Aceito na hora (pedido de volta).', schema: 'FriendshipResult' }, 201: { description: 'Pedido enviado.', schema: 'FriendshipResult' }, 400: INVALID, 404: NOT_FOUND, 409: { description: '`already_friends` ou `already_requested`.', schema: 'Error' }, 429: { description: 'Muitos pedidos sem resposta.', schema: 'Error' } } },
  { method: 'get', path: '/v1/me/friend-requests', tag: 'Amigos', summary: 'Pedidos de amizade', auth: 'user',
    query: [{ name: 'direction', description: '`incoming` (padrão) ou `outgoing`.', schema: { type: 'string', enum: ['incoming', 'outgoing'] } }], responses: { 200: { description: 'Ok.', schema: 'RequestList' } } },
  { method: 'post', path: '/v1/friend-requests/{id}/accept', tag: 'Amigos', summary: 'Aceita um pedido (só quem recebeu)', auth: 'user', query: [idParam('id', 'Id do pedido.')], responses: { 200: { description: 'Amizade criada.', schema: 'FriendshipResult' }, 404: NOT_FOUND } },
  { method: 'delete', path: '/v1/friend-requests/{id}', tag: 'Amigos', summary: 'Recusa (quem recebeu) ou cancela (quem enviou) um pedido', auth: 'user', query: [idParam('id', 'Id do pedido.')], responses: { 204: { description: 'Apagado.' }, 404: NOT_FOUND } },
  { method: 'get', path: '/v1/me/friends', tag: 'Amigos', summary: 'Meus amigos', auth: 'user', responses: { 200: { description: 'Ok.', schema: 'FriendList' } } },
  { method: 'delete', path: '/v1/friends/{userId}', tag: 'Amigos', summary: 'Desfaz uma amizade', auth: 'user', query: [idParam('userId', 'Id do amigo.')], responses: { 204: { description: 'Desfeita.' }, 404: NOT_FOUND } },
  { method: 'post', path: '/v1/blocks', tag: 'Amigos', summary: 'Bloqueia uma pessoa', auth: 'user', body: userIdSchema,
    description: 'Desfaz a amizade e qualquer pedido; a pessoa some dos dois lados (busca, perfil, pedidos).', responses: { 204: { description: 'Bloqueada.' }, 400: INVALID, 404: NOT_FOUND } },
  { method: 'delete', path: '/v1/blocks/{userId}', tag: 'Amigos', summary: 'Desbloqueia', auth: 'user', query: [idParam('userId', 'Id da pessoa bloqueada.')], responses: { 204: { description: 'Desbloqueada.' }, 404: NOT_FOUND } },
  { method: 'get', path: '/v1/me/blocks', tag: 'Amigos', summary: 'Quem eu bloqueei', auth: 'user', responses: { 200: { description: 'Ok.', schema: 'BlockList' } } },

  { method: 'get', path: '/v1/users/search', tag: 'Pessoas', summary: 'Busca pelo começo do apelido', auth: 'user',
    query: [{ name: 'q', description: '2 a 20 caracteres (letras minúsculas, números ou _).', required: true, schema: str }], responses: { 200: { description: 'Até 20 pessoas.', schema: 'UserList' }, 400: INVALID } },
  { method: 'get', path: '/v1/users/{handle}', tag: 'Pessoas', summary: 'Perfil público', auth: 'user', query: [{ name: 'handle', description: 'Apelido.', schema: str }],
    description: 'Sem e-mail e sem data de nascimento. Os cafés preferidos só aparecem se a pessoa ativou.', responses: { 200: { description: 'Ok.', schema: 'PublicProfile' }, 400: INVALID, 404: NOT_FOUND } },

  { method: 'get', path: '/v1/admin/overview', tag: 'Admin', summary: 'Monitoramento: ativos agora e cadastros', auth: 'admin', responses: { 200: { description: 'Ok.', schema: 'Overview' } } },
  { method: 'get', path: '/v1/admin/users', tag: 'Admin', summary: 'Lista de usuários (registra a consulta na auditoria)', auth: 'admin',
    query: [{ name: 'limit', description: '1 a 100 (padrão 50).', schema: { type: 'integer' } }, { name: 'before', description: 'Cursor: `nextBefore` da página anterior (ms).', schema: { type: 'integer' } }],
    responses: { 200: { description: 'Ok.', schema: 'AdminUserList' } } },
];

const TAGS: Record<string, string> = {
  Saúde: 'Verificação de que a API está no ar.',
  Conta: 'Meu perfil, preferências, privacidade, presença e exclusão de conta.',
  Backup: 'Backup do progresso do app (substitui o Firestore).',
  Café: 'Registro de café de verdade.',
  Amigos: 'Amizade com aprovação e bloqueio. Não existe "seguir".',
  Pessoas: 'Busca e perfil público (visível para qualquer pessoa logada).',
  Admin: 'Monitoramento. Só `admin`; a role é conferida no banco a cada pedido.',
};

/** JSON Schema do Zod, limpo para o OpenAPI (sem `$schema` e sem os limites de inteiro seguro que o Zod acrescenta). */
export function toSchema(s: ZodType): Json {
  const clean = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(clean);
    if (v && typeof v === 'object') {
      return Object.fromEntries(
        Object.entries(v as Json)
          .filter(([k, x]) => !(k === '$schema' || ((k === 'minimum' || k === 'maximum') && Math.abs(x as number) === Number.MAX_SAFE_INTEGER)))
          .map(([k, x]) => [k, clean(x)]),
      );
    }
    return v;
  };
  return clean(z.toJSONSchema(s)) as Json;
}

/** Converte `/v1/me/coffees/{id}` no formato do Hono (`:id`), para comparar com `app.routes`. */
export const honoPath = (p: string) => p.replace(/\{(\w+)\}/g, ':$1');

export function buildOpenApi(): Json {
  const paths: Record<string, Record<string, Json>> = {};
  for (const op of operations) {
    const pathParams = (op.path.match(/\{(\w+)\}/g) ?? []).map((m) => m.slice(1, -1));
    const parameters = (op.query ?? []).map((p) => ({ name: p.name, in: pathParams.includes(p.name) ? 'path' : 'query', required: p.required ?? pathParams.includes(p.name), description: p.description, schema: p.schema ?? str }));
    const responses: Json = {};
    for (const [code, r] of Object.entries(op.responses)) {
      responses[code] = r.schema ? { description: r.description, content: { 'application/json': { schema: ref(r.schema) } } } : { description: r.description };
    }
    if (op.auth !== 'none') {
      responses['401'] = { description: 'Sem token ou token inválido.', content: { 'application/json': { schema: ref('Error') } } };
      responses['404'] ??= { description: 'Sem perfil: chame `/v1/me/bootstrap` antes.', content: { 'application/json': { schema: ref('Error') } } };
      responses['429'] ??= { description: 'Muitos pedidos.', content: { 'application/json': { schema: ref('Error') } } };
    }
    if (op.auth === 'admin') responses['403'] = { description: 'Sem permissão (só admin) ou conta suspensa.', content: { 'application/json': { schema: ref('Error') } } };
    (paths[op.path] ??= {})[op.method] = {
      tags: [op.tag],
      summary: op.summary,
      ...(op.description ? { description: op.description } : {}),
      operationId: `${op.method}_${op.path.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '')}`,
      ...(op.auth !== 'none' ? { security: [{ bearerAuth: [] }] } : {}),
      ...(parameters.length ? { parameters } : {}),
      ...(op.body ? { requestBody: { required: true, content: { 'application/json': { schema: toSchema(op.body) } } } } : {}),
      responses,
    };
  }
  return {
    openapi: '3.1.0',
    info: {
      title: 'Flip & Brew API',
      version: '0.1.0',
      description: 'Backend do Flip & Brew.\n\nPara testar aqui: clique em **Authorize** e cole um token (sem o prefixo `Bearer`). Em desenvolvimento, gere um com `npm run dev:token -- seu@email.com`. Em produção o token é o do Supabase Auth.',
    },
    servers: [{ url: '/' }],
    tags: Object.entries(TAGS).map(([name, description]) => ({ name, description })),
    paths,
    components: { schemas, securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
  };
}
