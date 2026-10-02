# ADR-0009 · Offline-first: a conta é sempre opcional

**Status:** Aceita · **Data:** 2026-10

## Contexto
Um app cuja ideia é largar o celular não deve exigir cadastro, internet nem servidor para funcionar. O usuário depois pediu cadastro, login e exclusão de conta (ADR-0010).

## Decisão
- **Tudo funciona sem conta e sem internet.** Copo, moedas, loja, coleção, Bem-estar e Aprender usam só o armazenamento local.
- A conta serve para **backup e troca de aparelho**, nada mais. Não há recurso social nem anúncio.
- **Sem servidor configurado, a Conta nem aparece** em Ajustes.
- **Nenhuma análise, rastreamento ou publicidade.**
- A introdução não pede login.

## Alternativas descartadas
- **Login obrigatório na primeira abertura:** aumenta a desistência e contradiz o produto.
- **Sincronização em tempo real entre aparelhos:** complexidade de conflito sem necessidade.

## Consequências
- Toda funcionalidade nova deve funcionar offline primeiro; a nuvem é um complemento.
- Quem nunca criar conta nunca terá dados fora do celular.
- Perder o aparelho sem backup perde o progresso, e isso é aceito.
