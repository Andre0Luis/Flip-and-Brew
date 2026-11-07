// Cria (ou atualiza) um usuário de teste no Firebase de verdade, com progresso farto: 50 mil moedas, todos os itens
// e 90 dias de histórico. Serve para testar login, restauração e Bem-estar sem jogar dezenas de copos.
//
//   npm run seed:test-user            usa o .env (chaves do Firebase, TEST_USER_EMAIL e TEST_USER_PASSWORD)
//   npm run seed:test-user:dry        não usa rede: só mostra o que seria enviado
//
// Rode contra um projeto Firebase de DESENVOLVIMENTO, nunca o de produção: a conta de teste tem senha conhecida.
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from '../src/lib/cloud/config';
import { buildSnapshot } from '../src/lib/cloud/snapshot';
import { makeTestData, TEST_EMAIL } from '../src/lib/testUser';

const dry = process.argv.includes('--dry');
const email = process.env.TEST_USER_EMAIL || TEST_EMAIL;
const password = process.env.TEST_USER_PASSWORD || '';

const now = Date.now();
const data = makeTestData(now);
const snapshot = buildSnapshot(
  { ...data, settings: { goalMin: 120, language: 'pt', themeMode: 'system', autoStart: true, notifyOnDone: false } },
  now,
);
const summary = `${snapshot.data.coins} moedas, ${snapshot.data.owned.length} itens, ${snapshot.data.sessions.length} sessões, ${(JSON.stringify(snapshot).length / 1024).toFixed(0)} KB`;

function fail(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

async function main() {
  if (dry) {
    console.log(`Simulação (sem rede). Seria enviado para ${email}: ${summary}.`);
    console.log(isFirebaseConfigured() ? 'Chaves do Firebase encontradas.' : 'Chaves do Firebase ainda não preenchidas no .env.');
    return;
  }
  if (!isFirebaseConfigured()) fail('Faltam as chaves EXPO_PUBLIC_FIREBASE_* no .env. Veja docs/MANUAL-CONFIGURACAO.md, passo 3.');
  if (password.length < 6) fail('Defina TEST_USER_PASSWORD no .env (mínimo de 6 caracteres). Exemplo: TEST_USER_PASSWORD=Teste@12345');

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  let uid: string;
  try {
    uid = (await signInWithEmailAndPassword(auth, email, password)).user.uid;
    console.log(`Usuário de teste já existia: ${email}`);
  } catch (e) {
    const code = (e as { code?: string }).code ?? '';
    if (!['auth/user-not-found', 'auth/invalid-credential', 'auth/invalid-login-credentials'].includes(code)) throw e;
    try {
      uid = (await createUserWithEmailAndPassword(auth, email, password)).user.uid;
      console.log(`Usuário de teste criado: ${email}`);
    } catch (e2) {
      if ((e2 as { code?: string }).code === 'auth/email-already-in-use') fail(`A conta ${email} já existe com outra senha. Use a senha certa em TEST_USER_PASSWORD ou apague a conta no console do Firebase.`);
      throw e2;
    }
  }
  await setDoc(doc(getFirestore(app), 'users', uid), snapshot);
  console.log(`Backup de teste gravado em users/${uid}: ${summary}.`);
  console.log(`\nPronto. Entre no app com ${email} e a senha do .env.`);
}

main()
  .then(() => process.exit(0))
  .catch((e: { code?: string; message?: string }) => {
    const hint =
      e.code === 'auth/operation-not-allowed' ? 'Ative o método E-mail/senha em Authentication.' :
      e.code === 'permission-denied' || /permission/i.test(e.message ?? '') ? 'Publique as regras do Firestore (firebase/firestore.rules).' :
      e.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.' || e.code === 'auth/invalid-api-key' ? 'A API key do .env não é válida.' :
      e.code === 'auth/network-request-failed' ? 'Sem conexão com a internet.' : '';
    fail(`${e.code ?? 'erro'}: ${e.message ?? e}${hint ? `\n  Dica: ${hint}` : ''}`);
  });
