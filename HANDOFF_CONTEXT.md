# ☕ Flip & Brew - Project Context & Handoff

Este documento serve como um "Save State" (Estado de Salvamento) para transportar todo o contexto, arquitetura e histórico de execução deste projeto para outros chats ou times.

## 👤 Quem é o Usuário (Arquiteto Chefe)
**André Luis Teixeira**, Staff Engineer e Platform Engineer. 
Um especialista em arquiteturas de sistemas escaláveis, integração de plataformas e cultura DevOps. Sua visão não se limita a escrever código, mas a resolver problemas sistêmicos na sua origem. Exige infraestrutura de alta performance, latência zero (conceito Offline-first) e experiências de usuário de nível *Premium*.
- A sua filosofia de vida e lema inegociável de trabalho é: **"Every second counts"**.

## 🤖 Quem sou Eu (O Assistente IA)
Eu sou o **Antigravity**, uma inteligência artificial avançada e autônoma de codificação agentiva desenhada pela equipe do Google DeepMind. Neste projeto, atuo como o "Engenheiro Executor" e Programador Pareado do André. Minha função é absorver sua visão arquitetural de alto nível e transformá-la em linhas de código cirúrgicas, documentações executivas e setups de infraestrutura.
- Como regra e toque pessoal, sempre abro minhas linhas de raciocínio com a frase: *"Vamos analisar aqui:"*.

## 🚀 O Que Estamos Construindo
O projeto **Flip & Brew**, um aplicativo revolucionário de Bem-Estar Digital e Produtividade programado em **React Native (Expo)**. 
Ele subverte a ideia de um "timer pomodoro" comum para atuar como um verdadeiro **Quebra-mola Cognitivo**, gamificando a desconexão para combater a epidemia de dopamina rápida das redes sociais.

### A Mecânica e as Filosofias:
1. **Dinâmica:** O tempo focado e offline cultiva organicamente uma planta de café. Ao longo da jornada, a semente vira broto, árvore, e ao final, produz frutos que são torrados e extraídos em maquinários escolhidos pelo usuário (V60, Prensa Francesa).
2. **Os Pilares Filosóficos:**
   - **Estoicismo:** Treinar a abstenção voluntária do usuário.
   - **Antifragilidade (Nassim Taleb):** Provar que a dor de ficar longe do celular não é um castigo, mas a "torra" mental que fortalece o foco do indivíduo.
   - **Psicanálise:** Trazer a ação do deslize de tela compulsivo do instinto (inconsciente) para a decisão racional (consciente).

### O Hardware (Experiência Z Flip):
O aplicativo tem como alvo primário e "Premium" o ecossistema de smartphones dobráveis, com foco supremo no **Galaxy Z Flip 7**. O estalo físico de fechar o aparelho é o gatilho de início. O estado da planta será consumido ativamente através de um Widget Nativo na tela externa (*Cover Screen*), para que o usuário interaja sem perigo de distração.

---

## 🏁 O Histórico: O Que Já Fizemos Até Agora
Concluímos com maestria a Fase de Planejamento e a Fase 1 da Engenharia.

1. **Documentação Executiva (Pitch Deck):** Transformamos o conceito em um Pitch Deck interativo programado em HTML/CSS (`PitchDeck_FlipAndBrew.html`). Trata-se de uma *Single Page Application* que descreve todo o roteiro com uma animação simulada do Z Flip e da árvore do café mudando conforme a leitura.
2. **Estruturação de Tasks:** Criamos os documentos de arquitetura oficiais (`implementation_plan.md`) e nosso tracker (`task.md`).
3. **Execução de Código (Fase 1 Concluída):**
   - **Repositório:** Criamos o projeto React Native usando o framework Expo e o Expo Router.
   - **Motor de Estado e Dados:** Escrevemos a Store de dados (`src/store/useFocusStore.ts`) utilizando **Zustand**. Integramos a Store diretamente com a API C++ do **react-native-mmkv** (via JSI Bridge), alcançando persistência de dados em disco local na casa dos milissegundos (latência zero), preparando o terreno perfeitamente para as consultas nativas do Widget no OS Android.
   - **Roteamento:** Entramos na pasta `src/app` e configuramos o `_layout.tsx` e `app-tabs.tsx` usando o *Native Tabs*. Apagamos o lixo padrão e criamos o roteamento oficial:
     - `index.tsx` -> Home Screen (Planta e Cronômetro)
     - `stats.tsx` -> Bem-Estar (Dashboard de Tempo)
     - `guide.tsx` -> O Guia do Luizinho (Pílulas Estoicas e métodos de extração)

## 📍 O Estado Atual (Próximo Passo)
Estamos 100% prontos para iniciar a **Fase 2**.
A próxima instrução a ser dada é abrir a Tela Inicial (`index.tsx`) e começar a rascunhar o Design System em código: construir a *User Interface* (UI) principal com a demarcação para o Timer, os botões de ação e os espaços isométicos para a árvore e a cafeteira.
