# ADR-0010 · Contas, login com Google e backup com Firebase

**Status:** Aceita · **Data:** 2026-10

## Contexto
O usuário pediu cadastro, login com Google e exclusão de conta, e que o que dependesse de credenciais externas ficasse **pré-pronto**, com as chaves entrando depois pelo `.env`. A Google Play exige exclusão de conta dentro do app e por URL.

## Decisão
- **Firebase** com **Authentication** (e-mail/senha e Google) e **Firestore** para o backup. Escolhido porque a **exclusão de conta funciona do próprio app** (reautentica e apaga) e o login com Google se resolve só com variáveis de ambiente.
- **SDK web do Firebase** (carregado sob demanda), sem `google-services.json`. O login Google usa `@react-native-google-signin/google-signin` para obter o token e `signInWithCredential`.
- **Interface `CloudBackend`** (`src/lib/cloud/types.ts`) com duas implementações: **Firebase** e um **servidor falso** só para desenvolvimento (`EXPO_PUBLIC_AUTH_MODE=mock`, só com `__DEV__`, nunca fala com a internet).
- **O que vai para a nuvem:** um documento `users/{uid}` com progresso (moedas, itens, equipados, sessões, práticas, artigos lidos) e preferências de meta, idioma, tema, início automático e notificação. **Não vão:** calibração do sensor, ferramentas de teste, copo em andamento, e os números de uso do sistema. Limite de **1500 sessões** (documento menor que 1 MB). O snapshot não leva campos `undefined`, que o Firestore rejeita.
- **Sincronização:** backup **automático** cerca de 8 s depois de uma mudança relevante, mais "Fazer backup agora" e "Restaurar da nuvem". No **primeiro login**: aparelho vazio → restaura; nuvem vazia → envia; **dados diferentes dos dois lados → pergunta qual manter**. **Nunca sobrescreve sozinho** dados dos dois lados.
- **Excluir conta:** reautentica (senha ou Google), apaga o documento, depois a conta. Os **dados do aparelho continuam** até a pessoa apagá-los em Ajustes.
- **Regras do Firestore** (`firebase/firestore.rules`): cada pessoa só lê, grava e apaga `users/{o próprio uid}`; o resto é negado.
- **Configuração por variáveis `EXPO_PUBLIC_*`** no `.env` (e no EAS), lidas por extenso em `src/lib/cloud/config.ts`.
- Recomendação: **dois projetos Firebase**, desenvolvimento e produção. O usuário de teste (`teste@flipandbrew.app`) só vale no de desenvolvimento.

## Alternativas descartadas
- **Supabase:** bom, mas a exclusão de conta pelo cliente exige uma função de servidor.
- **Backend próprio:** custo de manutenção sem necessidade para um backup.
- **`@react-native-firebase`:** exige arquivos e configuração nativa por ambiente; o SDK web resolve com variáveis.
- **Sincronização automática por mesclagem:** risco de corromper moedas; preferimos perguntar.
- **Firebase obrigatório:** viola o ADR-0009.

## Consequências
- O `apiKey` do Firebase **não é segredo**; quem protege os dados são as regras. Mesmo assim vale restringir a chave por pacote e SHA-1.
- **Cada chave de assinatura precisa do seu SHA-1** cadastrado no cliente OAuth Android (debug, EAS, Play), senão o login Google dá `DEVELOPER_ERROR`.
- **O Metro guarda os valores do `.env` em cache**: ao mudar, use `npx expo start --clear`. Já nos enganou uma vez.
- Se duas contas entrarem no mesmo aparelho, os dados locais da primeira podem ser enviados à segunda quando ela não tem backup. É um comportamento conhecido (ADR-0017).
- **App Check** ainda não está ligado.
- Tudo foi testado contra o servidor falso; **nada falou com o Firebase real** ainda.
