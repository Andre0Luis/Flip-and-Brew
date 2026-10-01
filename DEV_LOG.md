# Diário de Desenvolvimento: Flip & Brew

Este documento registra os principais recursos implementados e os ajustes solicitados durante o desenvolvimento gamificado do app.

## [2026-06-19] - Estufa Realista e Plantio Procedural

### 🪟 Janela Dinâmica (Day/Night Cycle)
Criamos um sistema de janela de estufa (`WindowView.tsx`) atrás do vaso principal.
- Lê o horário real do dispositivo usando `new Date().getHours()`.
- O fundo transita as cores do céu perfeitamente:
  - **Amanhecer (5h - 8h):** Tons quentes (Laranja, Rosa, Amarelo).
  - **Dia (8h - 17h):** Azul celeste claro iluminado.
  - **Entardecer (17h - 19h):** Roxo profundo e sol se pondo.
  - **Noite (19h - 5h):** Céu estrelado, Lua e azul escuro profundo.

### 🌱 Pé de Café Procedural (20 Estágios)
Substituímos o desenho de crescimento simples por um motor vetorial realista que desenha o *Coffea arabica* de forma orgânica e em formato lanceolado.
- **20 Estágios de Evolução:** Cada estágio ocorre a cada **12 minutos** de foco.
- A planta cresce e ramifica de verdade, folhas por folhas.
- **Novas Fases Inclusas:**
  1. Fósforo/Semente (`seedling_emergence`)
  2. Folha orelha-de-onça (`cotyledon`)
  3. Formação do Arbusto denso
  4. Florada Branca (`flowering_full`)
  5. Frutos chumbinho e mudança de cor (`green` > `yellow` > `orange` > `red` > `harvestable`).
- **Colheita:** Uma colheita dura ~3h48m. Após a colheita, a planta sofre poda e volta ao estado adulto pré-florada (1h48m) para o próximo ciclo de frutos!

## [2026-06-19] - Ajustes de Interface
- **Layout Físico (Estufa):** Remodelamos o layout da Home (`index.tsx`) em formato de prateleiras. 
  - A planta e o vaso ficam na prateleira superior.
  - Na prateleira inferior de madeira maciça, alocamos a **Xícara de Café** e a **Cafeteira** selecionadas pelo usuário, ambas aumentadas em escala para maior destaque.
  - Usamos propriedades de gravidade (`justifyContent: center` e `marginBottom: -80`) para forçar que a cafeteira não cubra a área de contadores (Fechamentos/Timer) no rodapé da tela do Z Flip 7.
- **Interação:** O botão de "Ativar Foco / Quebrar Foco" foi removido. A própria ação de abrir e fechar o celular (via Background Tasks) agora lida com o estado natural do foco.

## [2026-06-19] - Mecânicas Botânicas (Sementes, Rega e Murchar)
- **Novas Espécies em SVG:** Implementamos arte procedural (completamente em código SVG nativo) para duas novas flores além do Café: **Girassol** (`SunflowerPlant.tsx`) e **Tulipa** (`TulipPlant.tsx`), cada um com 20 estágios de crescimento únicos que desabrocham gradualmente.
- **Rega vs Colheita:** As flores, ao atingirem o estágio adulto, não são colhidas como o café. Elas exigem que o usuário clique no botão para "Regar".
- **Sistema de Punição:** O uso excessivo do celular (abrir a tela do Z Flip 7 repetidamente) agora causa "dano" à planta, removendo "Health" (`health - 15`). Se a health chegar a 50%, a planta muda visualmente para o estágio `wilting` (murcha), exigindo rega. Se chegar a 0%, ela morre.

## [2026-06-19] - Expansão de Inventário (10 SVGs de cada)
- Refatoramos todo o sistema de exibição de Cafeteiras, Copos e Vasos. Abolimos as imagens estáticas em PNG que estavam com qualidade ruim.
- Desenhamos 100% em código SVG vetorial:
  - **10 Vasos:** Argila, Vidro, Cerâmica, Madeira, Concreto, Mármore, Cesto de Vime, Geométrico, Ouro e Neon.
  - **10 Cafeteiras:** V60, Prensa Francesa, Chemex, Moka, Espresso, Aeropress, Cold Drip, Sifão, Percolador e Clever Dripper.
  - **10 Xícaras:** Caneca Clássica, Xícara Espresso, Caneca Alta, Copo Latte de Vidro, Copo To-Go (Papel), Caneca Enamel (Acampamento), Demitasse (com Pires), Tumbler Térmico, Mason Jar e Finjan Turca.
- **Loja e Coleção:** Ambas as telas foram reescritas para renderizar em tempo real os SVG vetoriais coloridos perfeitamente, garantindo escalabilidade infinita e estética premium.

---
*Anotação contínua de features solicitadas e implementadas pela IA AntiGravity (Agentic Coding).*
