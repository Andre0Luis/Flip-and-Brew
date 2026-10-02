# ADR-0000 · Contexto e histórico do projeto

**Status:** Informativo · **Data:** 2026-10-02

## O que é o Flip & Brew
App de **bem-estar digital** em React Native (Expo SDK 56), para Android primeiro. A pessoa deixa o celular **virado para baixo**; uma **xícara de café enche em tempo real** enquanto ela fica offline. O tempo offline vira **moedas**, que compram **cafeteiras e xícaras** para uma prateleira. Estoicismo e antifragilidade (Taleb) são parte da mensagem do produto.

Autor e dono do produto: André Luis. Repositório: `Andre0Luis/Flip-and-Brew`. Pacote Android: `com.andre0luis.FlipAndBrew`.

## Como chegamos aqui
1. **Primeira versão (commit `f056731`).** Mecânica de "plantar um cafeeiro" que crescia com o tempo offline, contador de aberturas e fechamentos do Z Flip 7 (módulo nativo `flip-sensor`) e widget de tela externa. Tudo no histórico do git.
2. **Mudança de aparelho.** O usuário passou a usar um Galaxy S26 Ultra, então o widget e o contador de flip perderam o sentido.
3. **Reinício.** Decidimos reconstruir do zero (ADR-0001), com mecânica nova (ADR-0002) e visual novo (ADR-0005).
4. **Design antes do código.** Fizemos um *style board* e depois nove telas em alta fidelidade, como páginas HTML. Isso fixou paleta, tipografia, ilustrações, tom e a navegação em cinco abas.
5. **Construção do app.** Núcleo (copo, moedas, loja, coleção), Bem-estar, Aprender, idiomas, uso do sistema, introdução, notificação opcional, contas e backup, usuário de teste.
6. **Qualidade e lançamento.** Testes, lint, CI, privacidade, fichas da loja, roteiro de validação e manual de configuração.

## Estado atual
Todo o código que não depende de aparelho, conta ou chave está feito. Falta **validar no celular** e **cadastrar contas e chaves** (ADR-0017).

## Princípios que guiaram as decisões
- **A pessoa nunca é punida por falhar.** Falha vira dado (ADR-0006).
- **Offline-first.** Nada obriga conta, internet ou servidor (ADR-0009).
- **O app tem poucas telas de propósito**: ele existe para o celular ser deixado de lado, não para prender.
- **Honestidade sobre o que não foi verificado.** O que nunca rodou em aparelho está registrado como risco, não como pronto (ADR-0017).
- **Lógica em funções puras com teste**, telas só montam (ADR-0013).
