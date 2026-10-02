# ADR-0015 · Decisões menores de produto

**Status:** Aceita · **Data:** 2026-10

Decisões pequenas que valem registro, para ninguém "consertar" sem saber o motivo.

| Decisão | Motivo |
| --- | --- |
| **Introdução de 4 passos** na primeira abertura (ideia, moedas, antifragilidade, calibração), com escolha de idioma no primeiro. Quem já usava o app pula. Dá para rever em Ajustes. | Explicar a ideia sem tutorial longo; a calibração é necessária (ADR-0004). |
| **Aviso de copo pronto é opcional, silencioso e vem desligado.** | Notificar tira a pessoa do offline (ADR-0003). Quem quiser, liga. |
| **Ferramentas de teste escondidas** (copos de 1 minuto, dados de exemplo, usuário de teste, moedas): aparecem em desenvolvimento ou com **7 toques na versão**. | Não expor "dinheiro grátis" a quem usa o app, mas permitir validar em qualquer build. |
| **Usuário de teste:** 50 mil moedas, todos os itens, 90 dias de histórico; conta `teste@flipandbrew.app` no servidor falso; `npm run seed:test-user` no Firebase de desenvolvimento. | Testar loja, coleção, Bem-estar e restauração sem jogar dezenas de copos. |
| **Sem widget.** | O widget era do Z Flip (ADR-0001). Se voltar, será um novo ADR. |
| **Voltar do Android** não sai do copo; no resultado equivale a "Concluir". | Evitar perder o resultado sem querer. |
| **Tela de erro global** (`ErrorBoundary`) em vez de tela branca. | Os dados estão salvos; a pessoa pode tentar de novo. |
| **Carrossel de frases com altura uniforme.** | Evitar um vazio visual embaixo da frase mais curta. |
| **Voltar às abas com `router.dismissTo('/')`**, nunca `replace('/')`. | `replace('/')` empilha uma segunda cópia das abas. |
| **Gatilhos de interrupção e humor** são perguntados no resultado; fechar o seletor do Google não mostra erro. | Dados para o Bem-estar sem atrito. |
| **Cartão de calibração no Início** abaixo do botão principal. | Não empurrar a ação principal para fora da tela. |
| **Teste na web usa servidor estático em modo SPA** (`serve -s`). | Recarregar rotas internas devolve 404 sem isso. |
