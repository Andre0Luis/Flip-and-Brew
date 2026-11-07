# ADR-0022 · Lembretes diários: frase da manhã e check-in

**Status:** Aceita · **Data:** 2026-11 · **Substitui em parte:** ADR-0018 (alternativa descartada "notificação diária de lembrete do check-in") e ADR-0007 (check-in "não gera notificação")

## Contexto
O app evitava notificar para não tirar a pessoa do offline (ADR-0003, ADR-0015). O dono quer duas notificações por dia: uma de manhã com a frase do dia e a pergunta de como a pessoa se sente, e outra, em outro momento, lembrando do check-in.

## Decisão
- **Duas notificações locais, independentes**, cada uma com chave própria em Ajustes (`settings.dailyMorning`, `settings.dailyCheckin`) e hora própria (`morningHour`, `checkinHour`):
  - **Manhã** (padrão 08:00, de 05 a 11): título "Bom dia. Como você está se sentindo hoje?" e a **frase do dia** no corpo, a mesma de `quoteOfDay`.
  - **Check-in** (padrão 20:00, de 12 a 22): "Você já fez o check-in de hoje?". **Se o check-in de hoje já foi feito, o aviso de hoje não é agendado**, então não incomoda quem já respondeu.
- **Silenciosas** como as demais: canal Android próprio, sem som e sem vibração, sem heads-up. Tocar abre o Início (`router.dismissTo('/')`), onde está o cartão do check-in.
- **Como agendar:** como cada manhã tem uma frase diferente, não dá para usar gatilho diário repetido. O app agenda **14 dias à frente**, um aviso por dia (`planReminders`, função pura em `src/lib/reminders.ts`, com testes), e **reagenda** ao mudar os ajustes ou o idioma, ao fazer o check-in e sempre que o app volta ao primeiro plano (`src/engine/Reminders.tsx`). Quem passa mais de 14 dias sem abrir o app deixa de receber até abrir de novo.
- **Padrão:** desligados. Na introdução, ao **permitir os avisos**, o app liga também os dois lembretes (o texto da introdução diz isso). Quem já usa o app liga em Ajustes.
- **Só no aparelho:** nada vai para a nuvem (as horas e as chaves não entram em `snapshot.ts`), porque a permissão de notificação é do aparelho. Sem permissão, nada é agendado.
- Privacidade: a seção "Notificações" da política e das telas passou a listar os três avisos (3 idiomas).

## Alternativas descartadas
- **Gatilho `DAILY` repetido:** simples e não expira, mas a frase seria sempre a mesma.
- **Notificação com som ou heads-up:** foge do tom do app.
- **Ligar os lembretes para todo mundo sem pedir:** o Android e o iPhone exigem a permissão, e o princípio do app é a pessoa decidir.

## Consequências
- O app agora puxa a pessoa de volta duas vezes por dia, se ela quiser. É a primeira vez; a regra de "sem notificação" só vale para o copo (opcional) e para quem desligar os lembretes.
- Validar em aparelho: horários, canal silencioso, toque abrindo o Início, reagendamento ao reabrir e após reiniciar o celular (ADR-0017).
