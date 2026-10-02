# Lançamento

O que o código já resolve está em `npm run check` (typecheck, lint e testes) e no CI (`.github/workflows/ci.yml`).
O que falta depende de contas, chaves e aparelho. **O passo a passo completo, com cada conta e credencial, está em `docs/MANUAL-CONFIGURACAO.md`.**


1. **Validar no aparelho:** siga `docs/VALIDATION.md`.
2. **Contas e backup (opcional):** siga `docs/FIREBASE.md` (projeto Firebase, logins, SHA-1 do Google, regras do Firestore) e preencha o `.env`. Publique também a página de exclusão de conta (`docs/ACCOUNT-DELETION.md`).
3. **Compra de moedas (opcional):**
   - Criar o app no RevenueCat e os produtos no Play Console, com identificadores terminando no número de moedas (`coins_100`, `coins_500`).
   - Cadastrar `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` como variável de ambiente do EAS (veja `.env.example`).
4. **Assinatura e build:** `eas build --platform android --profile production` (gera um `.aab`, com `versionCode` automático).
5. **Política de privacidade:** hospedar `docs/PRIVACY.pt.md` (por exemplo no GitHub Pages) e informar a URL no Play Console. Regerar com `npm run docs:privacy` se os textos mudarem.
6. **Ficha da loja:** textos prontos em `docs/store/` (pt, en, es). Faltam capturas de tela do aparelho, o ícone de 512×512 (`assets/images/icon.png` reduzido) e a imagem de destaque.
7. **Segurança dos dados e permissões:** rascunho em `docs/store/data-safety.md`. O acesso ao uso (`PACKAGE_USAGE_STATS`) é permissão sensível e pede justificativa.
8. **Faixa de teste interno** antes da produção.
