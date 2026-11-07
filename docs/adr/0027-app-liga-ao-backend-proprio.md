# ADR-0027 · App liga ao backend próprio (API + Supabase Auth)

**Status:** Aceita (opcional por configuração) · **Data:** 2026-11 · **Complementa:** ADR-0024 (backend e comunidade)

## Contexto
O backend (`apps/api`) está no ar na Vercel e o app ainda falava só com o Firebase. O dono quer o app funcionando com o backend, sem tornar a conta obrigatória (isso é a fase final do ADR-0024).

## Decisão
- Nova implementação da interface `CloudBackend` (`apps/mobile/src/lib/cloud/apiBackend.ts`, tipo `'api'`): login e cadastro pelo **Supabase Auth** (`@supabase/auth-js`, só autenticação, sessão no MMKV) e backup pela **nossa API** (`POST /v1/me/bootstrap`, `GET/PUT /v1/me/snapshot`, `DELETE /v1/me`). O cliente HTTP (`apiClient.ts`) é função pura sobre `fetch`.
- `getBackend()` escolhe: servidor falso (dev) > **api** (se `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` existem) > Firebase > nenhum. Sem as variáveis nada muda; o app continua sem exigir conta.
- Um **teste de contrato** (`apps/api/src/mobile-contract.test.ts`) roda o `apiClient` do app contra a API de verdade, em memória. O `ci-api` também dispara quando `apiClient.ts` muda.
- **Excluir a conta** apaga primeiro o usuário no Supabase Auth (Admin API, `SUPABASE_SERVICE_ROLE_KEY`, só no servidor) e depois os dados. Se o Supabase falhar, a API responde 502 e nada é apagado, então a pessoa tenta de novo. Sem a chave configurada, só os dados são apagados.
- Todo import relativo da API termina em `.js`: a Vercel compila arquivo por arquivo e o Node ESM não completa extensão (erro real de produção, com teste de guarda em `vercel.test.ts`).

## Consequências
- Firebase e backend próprio coexistem até o corte final; contas de um não aparecem no outro.
- Limitações conhecidas: a tela de nova senha (`/nova-senha`) abre pelo link do e-mail de recuperação (`flipandbrew://nova-senha`, que precisa estar em Redirect URLs no Supabase) e nunca rodou em aparelho; o token da Apple não é revogado na exclusão; o provedor Google no Supabase precisa de "skip nonce check"; e-mail de confirmação depende do SMTP configurado no Supabase (Brevo).
- Nada disso foi testado em aparelho.
