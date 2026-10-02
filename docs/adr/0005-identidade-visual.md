# ADR-0005 · Identidade visual

**Status:** Aceita · **Data:** 2026-10

## Contexto
O visual antigo usava preto puro e ilustrações que o usuário não gostou. Pediu tons de café, ilustração premium em 2D, nada de imagem gerada por IA, e depois "mais realista" nas xícaras e canecas.

## Decisão
- **Paleta de café, nunca preto puro.** Modo claro "Crema" (fundo `#F6EEE1`, texto espresso `#2B1A12`) e modo escuro "Torra escura" (fundo `#1B120D`). **Ouro** (`#B8782E` claro, `#E0B25E` escuro) é a única cor forte e **só significa recompensa**: moedas, copo pronto, sequência, preço. Tokens em `src/theme/tokens.ts`.
- **Tipografia:** Young Serif para frases e momentos grandes, Figtree para a interface, DM Mono para números e rótulos (tabulares).
- **Ilustrações próprias em SVG** (`src/art/Art.tsx`): cafeteiras (V60, prensa, moka, Chemex), xícaras, canecas, copo de latte, xícaras estoicas e a moeda, com gradientes, brilho e sombra para parecerem reais. Sem imagens geradas por IA.
- **O tema segue o sistema**, com opção de forçar claro ou "Torra escura" em Ajustes.
- **Cinco abas:** Início, Guia (loja), Bem-estar, Aprender, Coleção.
- O design foi decidido primeiro em **protótipos HTML** (style board e nove telas) antes de virar código; eles foram a referência de implementação.
- Ícone e splash: xícara de porcelana sobre fundo espresso; splash claro e escuro.

## Alternativas descartadas
- **Ilustração em estilo de linha grossa e fundo chapado** (primeira versão do protótipo): rejeitada pelo usuário por parecer infantil.
- **Imagens geradas por IA:** rejeitadas explicitamente.
- **Acento azul do template do Expo:** fora da identidade; trocado.

## Consequências
- Cada ilustração é código; trocar o desenho exige mexer no SVG.
- Em SVG, os `id` dos gradientes precisam ser **únicos por instância** (prefixo por `useId`), senão a web mistura gradientes entre desenhos (regra no `CLAUDE.md`).
- Contraste e acessibilidade foram checados visualmente, não com ferramenta automática.
