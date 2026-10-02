# Registro de decisões (ADR)

Cada arquivo aqui explica **uma decisão** do Flip & Brew: o contexto, o que escolhemos, o que descartamos e o que isso custa. Serve para ninguém (nós, daqui a seis meses, ou outro desenvolvimento) refazer uma discussão que já foi resolvida.

**Regra de uso:** antes de mudar algo que está listado aqui, leia o ADR. Se a decisão mudar, **não apague o arquivo antigo**: escreva um novo e marque o antigo como "Substituída por ADR-XXXX".

Formato de cada ADR: Status · Data · Contexto · Decisão · Alternativas descartadas · Consequências.

## Índice

| # | Decisão | Status |
| --- | --- | --- |
| [0000](0000-contexto-e-historico.md) | Contexto e histórico do projeto | Informativo |
| [0001](0001-reiniciar-o-projeto.md) | Reiniciar o projeto do zero | Aceita |
| [0002](0002-mecanica-central-copo-em-tempo-real.md) | Mecânica central: um copo de café que enche enquanto a pessoa fica offline | Aceita |
| [0003](0003-contagem-por-horario-e-fim-do-copo.md) | Contar por horário e encerrar o copo ao pegar o celular | Aceita |
| [0004](0004-sensor-calibracao-e-motor-testavel.md) | Sensor de pose exige calibração; decisões do motor em funções puras | Aceita |
| [0005](0005-identidade-visual.md) | Identidade visual: café, ilustração própria, claro e torra escura | Aceita |
| [0006](0006-estoicismo-e-antifragilidade-como-produto.md) | Estoicismo e antifragilidade como parte do produto, não enfeite | Aceita |
| [0007](0007-bem-estar-e-uso-do-sistema.md) | Bem-estar mede o que o app registra; uso do sistema é opcional | Aceita |
| [0008](0008-stack-e-estado-local.md) | Stack: Expo, expo-router, Zustand com MMKV, SVG e React Compiler | Aceita |
| [0009](0009-offline-first-e-conta-opcional.md) | Offline-first: a conta é sempre opcional | Aceita |
| [0010](0010-contas-e-backup-com-firebase.md) | Contas, login com Google e backup com Firebase | Aceita |
| [0011](0011-moedas-compras-e-colecao.md) | Economia de moedas, compra com RevenueCat e itens | Aceita |
| [0012](0012-idiomas.md) | Idiomas: português padrão, inglês e espanhol | Aceita |
| [0013](0013-qualidade-testes-lint-e-ci.md) | Qualidade: regras puras, testes, lint e CI | Aceita |
| [0014](0014-privacidade-e-lojas.md) | Privacidade e publicação | Aceita |
| [0015](0015-decisoes-menores-de-produto.md) | Decisões menores de produto | Aceita |
| [0016](0016-fluxo-de-trabalho-e-prs.md) | Fluxo de trabalho: PRs, branches e a lição dos PRs empilhados | Aceita |
| [0017](0017-pendencias-e-riscos-conhecidos.md) | Pendências e riscos conhecidos (vivo, atualize sempre) | Aberto |

> **Nota de transição.** O ADR-0010 (contas e Firebase), partes do 0011, 0014 e 0015 (usuário de teste, página de exclusão, manual) descrevem o que chega com o **PR #7**. Se o #7 ainda não foi mergeado, esses arquivos de `docs/` e o código de contas ainda não estão no `main`.

## Documentos relacionados
- `README.md` (raiz): como rodar e a estrutura do código.
- `CLAUDE.md`: regras para quem edita o código.
- `docs/VALIDATION.md`: roteiro de teste no aparelho.
- `docs/RELEASE.md`: caminho de lançamento.
- Com o PR de contas e do usuário de teste: `docs/MANUAL-CONFIGURACAO.md` (contas, acessos e credenciais), `docs/FIREBASE.md` e `docs/ACCOUNT-DELETION.md`.
