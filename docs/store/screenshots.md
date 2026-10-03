# Capturas de tela das lojas

As capturas são geradas a partir da versão web do app, com dados de teste (`loadTestUser`), nos tamanhos exigidos.
É uma **simulação**: a web não mostra a barra de status do celular. Para capturas 100% reais, use um aparelho.

## Como gerar
```bash
npx expo export -p web --output-dir dist-web
npm run store:screenshots -- --dist dist-web --out store-assets/screenshots
# opcional: tablets de 7 e 10 polegadas do Google Play
npm run store:screenshots -- --dist dist-web --tablets
```
Precisa do Google Chrome instalado (`--chrome <caminho>` se estiver em outro lugar). A pasta `store-assets/` não vai para o git.

## O que sai
Cinco telas por idioma (pt, en, es): início, copo enchendo, bem-estar, coleção e loja.

| Pasta | Tamanho | Loja |
| --- | --- | --- |
| `ios-6.9pol-1320x2868` | 1320 × 2868 | App Store, iPhone 6,9" (obrigatório) |
| `ios-6.5pol-1284x2778` | 1284 × 2778 | App Store, iPhone 6,5" |
| `android-celular-1080x2160` | 1080 × 2160 | Google Play, celular |
| `android-tablet-7pol-1200x1920` | 1200 × 1920 | Google Play, tablet 7" (com `--tablets`) |
| `android-tablet-10pol-1600x2560` | 1600 × 2560 | Google Play, tablet 10" (com `--tablets`) |

Outros arquivos: ícone de 512 px e gráfico de recursos de 1024 × 500 já estão em `assets/brand/`.
O app não declara suporte a iPad, então a App Store não exige capturas de iPad.
