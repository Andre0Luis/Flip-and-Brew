# ADR-0028 · Login obrigatório com o backend próprio

**Status:** Aceita · **Data:** 2026-11 · **Substitui em parte:** ADR-0009 (offline-first, conta sempre opcional) · **Complementa:** ADR-0024, ADR-0027

## Contexto
O ADR-0024 já registra a decisão do dono: login obrigatório, por causa da comunidade, dos amigos e do ranking. O app, porém, continuava com "a conta é sempre opcional" (ADR-0009 e uma regra no `CLAUDE.md`). Agora o app fala com o backend próprio (ADR-0027) e o dono pediu que, no fim, o usuário **precise criar uma conta para usar o app**.

## Decisão
- **Com o backend próprio ligado** (`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SUPABASE_URL` e a chave `anon` válida), o app abre assim: introdução, **tela de entrar ou criar conta** (`/entrar`), **primeiros passos** (`/primeiros-passos`, uma vez por aparelho) e, por fim, o app. Quem sai da conta ou a exclui volta à tela de entrar. A decisão é uma função pura (`src/lib/loginGate.ts`, com testes) usada no `_layout`.
- **Depois do primeiro login a sessão fica guardada**: o copo, as moedas e o motor continuam locais e funcionam sem internet. Só o que é comunitário precisa de rede.
- **Sem o backend próprio** (Firebase ou nenhum servidor), nada muda: o app abre direto e a conta continua opcional (ADR-0009 vale para esses builds). Assim a versão que já está nas lojas não é afetada; o portão só liga quando as variáveis do backend entram no ambiente de produção do EAS.
- A **política de privacidade** (`/privacidade`) e o **link de recuperação de senha** (`/nova-senha`) abrem sem login.
- **Primeiros passos** logo após o cadastro: pede a permissão de notificações (os lembretes diários, **frase do dia e check-in, vêm ligados por padrão**) e explica, passo a passo, como ligar o acesso ao uso do Android para ganhar **moedas pelo tempo bloqueado** (ADR-0023).
- **Confirmação de e-mail** fica desligada no Supabase por enquanto, para simplificar (decisão do dono). Ligar de novo, junto com o SMTP, antes de abrir para muita gente.

## Consequências
- **Mais atrito na primeira abertura.** As lojas exigem uma **conta de teste** para os revisores, e todo texto "funciona sem conta" (descrição das lojas, introdução, política de privacidade, Segurança dos dados) precisa mudar **antes** de ligar o backend em produção.
- **iPhone:** quem oferece login com o Google precisa oferecer também "Entrar com a Apple" (diretriz 4.8); a exclusão de conta dentro do app já existe (5.1.1(v)).
- A escolha entre os dados deste aparelho e os da nuvem (quando os dois existem) continua na tela de Conta; até resolvê-la o backup automático não liga.
- Lembretes ligados por padrão só valem em instalações novas (quem já tinha o app mantém o que estava salvo) e só tocam depois de a pessoa permitir as notificações.
