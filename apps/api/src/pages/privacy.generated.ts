// GERADO por `npm run docs:privacy` (apps/mobile/scripts/gen-privacy.ts) a partir dos textos do app. Não edite à mão.
import type { Page, PageLang } from './content.js';

export const privacy: Record<PageLang, Page> = {
  "pt": {
    "title": "Privacidade",
    "sections": [
      {
        "title": "Seus dados ficam no aparelho",
        "body": [
          "O Flip & Brew funciona sem conta. Sem conta, copos, moedas, itens, humor, energia diária, o perfil que você preencher (nome, telefone, idade e gosto de café) e preferências ficam só no seu celular, sem servidor próprio nem ferramenta de análise. Os anúncios são a exceção; veja abaixo. Nas versões com cadastro obrigatório, a conta é necessária para usar o app; veja “Conta e backup”."
        ]
      },
      {
        "title": "Acesso ao uso e Tempo de Uso (opcional)",
        "body": [
          "Se você permitir, o app lê do Android quantas vezes o celular foi desbloqueado e por quanto tempo a tela ficou ligada. No iPhone, com a autorização do Tempo de Uso, o app recebe só uma estimativa do tempo de tela de cada dia, de 15 em 15 minutos, que uma extensão do próprio app grava no aparelho. Esses números ficam no aparelho e não mostram quais apps você usa. Com eles o app calcula, no próprio aparelho, as moedas pelo tempo com a tela bloqueada. Você pode revogar a permissão a qualquer momento nas configurações do Android ou, no iPhone, em Ajustes › Tempo de Uso."
        ]
      },
      {
        "title": "Sensor de movimento",
        "body": [
          "O acelerômetro serve só para saber se o celular está virado para baixo. As leituras não são guardadas nem enviadas."
        ]
      },
      {
        "title": "Notificações (opcional)",
        "body": [
          "Os avisos (copo pronto, frase do dia de manhã e lembrete do check-in) são notificações locais, criadas no próprio aparelho, sem passar por servidor. Cada um liga e desliga em Ajustes."
        ]
      },
      {
        "title": "Compras",
        "body": [
          "Quando a compra de moedas estiver ativa, o pagamento é processado pela loja de aplicativos e pelo RevenueCat. O app não vê dados de cartão. O RevenueCat recebe um identificador anônimo da instalação para registrar a compra."
        ]
      },
      {
        "title": "Apagar tudo",
        "body": [
          "Em Ajustes, “Apagar todos os dados” remove tudo o que o app guardou. Desinstalar o app também apaga tudo."
        ]
      },
      {
        "title": "Conta e backup",
        "body": [
          "Nas versões com conta própria, o cadastro é necessário para usar o app: você cria a conta com e-mail e senha ou entra com o Google ou a Apple. Guardamos o seu e-mail, o nome e o apelido que você escolher, e uma cópia do seu progresso (copos, moedas, itens, humor, energia diária, o perfil que você preencher (nome, telefone, idade e gosto de café) e preferências) para você recuperar em outro aparelho. Só você acessa essa cópia. O login com o Google ou com a Apple compartilha apenas o nome e o e-mail do perfil. Versões mais antigas guardavam essa cópia no Firebase, serviço do Google, e continuam assim até serem atualizadas."
        ]
      },
      {
        "title": "Excluir a conta",
        "body": [
          "Em Conta › Excluir conta, apagamos a sua conta, o backup, os posts, as fotos, os comentários, as curtidas, as amizades e os números do ranking. Também dá para pedir pela página de exclusão de conta do app, sem precisar abri-lo. Os dados do aparelho continuam até você apagá-los em Ajustes."
        ]
      },
      {
        "title": "Anúncios",
        "body": [
          "O app mostra um banner de anúncio no fim de algumas telas, fornecido pelo Google AdMob. Para exibi-lo, o AdMob pode usar o identificador de publicidade do aparelho e dados como o endereço IP e o modelo do aparelho. Pedimos anúncios sem personalização. Onde a lei exige, o app mostra um formulário de consentimento, que você pode refazer quando quiser. Quem comprar “Remover anúncios” ou assinar o Pro não vê o banner nem carrega o anúncio."
        ]
      },
      {
        "title": "Comunidade, fotos e ranking",
        "body": [
          "Na Comunidade você escolhe um apelido, adiciona amigos e publica posts com título, legenda e até 3 fotos. As fotos são reduzidas e compactadas no seu aparelho antes do envio e ficam num armazenamento privado: só você e os seus amigos as veem, por links que vencem em uma hora. Você pode apagar os seus posts e comentários quando quiser. O ranking da semana usa o seu tempo offline e o número de copos da semana; entre amigos ele aparece sempre, e no ranking geral só se você ligar essa opção. Você pode bloquear alguém, e quem você bloqueia deixa de ver o que você publica."
        ]
      },
      {
        "title": "Onde os dados ficam",
        "body": [
          "A conta, o backup e a comunidade usam a nossa API, hospedada na Vercel, e o Supabase (banco de dados, login e armazenamento das fotos). O e-mail de boas-vindas sai pelo Brevo. Não vendemos dados e não usamos ferramenta de análise. Para pedir ajuda ou tirar dúvidas, use a página de suporte do app."
        ]
      }
    ]
  },
  "en": {
    "title": "Privacy",
    "sections": [
      {
        "title": "Your data stays on the device",
        "body": [
          "Flip & Brew works without an account. Without one, cups, coins, items, mood, daily energy, the profile you fill in (name, phone, age and coffee taste) and preferences stay only on your phone, with no server of our own and no analytics tool. Ads are the exception; see below. In versions with mandatory sign-up, an account is required to use the app; see “Account and backup”."
        ]
      },
      {
        "title": "Usage access and Screen Time (optional)",
        "body": [
          "If you allow it, the app reads from Android how many times the phone was unlocked and how long the screen was on. On iPhone, with Screen Time access, the app only gets an estimate of each day's screen time, in 15-minute steps, which an extension of the app itself saves on the device. These numbers stay on the device and do not show which apps you use. The app uses them, on the device itself, to work out coins for the time the screen stayed locked. You can revoke the permission at any time in Android settings or, on iPhone, in Settings › Screen Time."
        ]
      },
      {
        "title": "Motion sensor",
        "body": [
          "The accelerometer is used only to know whether the phone is face down. Readings are not stored or sent anywhere."
        ]
      },
      {
        "title": "Notifications (optional)",
        "body": [
          "The notices (cup ready, quote of the day in the morning and check-in reminder) are local notifications created on the device itself, without going through a server. You turn each one on or off in Settings."
        ]
      },
      {
        "title": "Purchases",
        "body": [
          "When buying coins is active, payment is processed by the app store and RevenueCat. The app never sees card details. RevenueCat receives an anonymous installation identifier to record the purchase."
        ]
      },
      {
        "title": "Delete everything",
        "body": [
          "In Settings, “Delete all data” removes everything the app stored. Uninstalling the app also deletes everything."
        ]
      },
      {
        "title": "Account and backup",
        "body": [
          "In versions with our own account, signing up is required to use the app: you create an account with email and password or sign in with Google or Apple. We store your email, the name and handle you choose, and a copy of your progress (cups, coins, items, mood, daily energy, the profile you fill in (name, phone, age and coffee taste) and preferences) so you can restore it on another device. Only you can access that copy. Signing in with Google or Apple shares only the name and email of your profile. Older versions kept this copy on Firebase, a Google service, and keep doing so until they are updated."
        ]
      },
      {
        "title": "Deleting the account",
        "body": [
          "In Account › Delete account, we delete your account, backup, posts, photos, comments, likes, friendships and ranking numbers. You can also ask through the app’s account deletion page, without opening the app. Data on the device stays until you delete it in Settings."
        ]
      },
      {
        "title": "Ads",
        "body": [
          "The app shows an ad banner at the bottom of some screens, provided by Google AdMob. To show it, AdMob may use the device advertising ID and data such as the IP address and device model. We request non-personalized ads. Where the law requires it, the app shows a consent form, which you can redo at any time. If you buy “Remove ads” or subscribe to Pro, the banner is not shown and no ad is loaded."
        ]
      },
      {
        "title": "Community, photos and ranking",
        "body": [
          "In Community you choose a handle, add friends and publish posts with a title, caption and up to 3 photos. Photos are resized and compressed on your device before upload and are kept in private storage: only you and your friends see them, through links that expire after an hour. You can delete your posts and comments at any time. The weekly ranking uses your offline time and the number of cups for the week; among friends it always shows, and in the global ranking only if you turn that option on. You can block someone, and people you block can no longer see what you publish."
        ]
      },
      {
        "title": "Where the data lives",
        "body": [
          "The account, backup and community use our API, hosted on Vercel, and Supabase (database, sign-in and photo storage). The welcome email is sent through Brevo. We do not sell data and do not use analytics tools. For help or questions, use the app’s support page."
        ]
      }
    ]
  },
  "es": {
    "title": "Privacidad",
    "sections": [
      {
        "title": "Tus datos se quedan en el dispositivo",
        "body": [
          "Flip & Brew funciona sin cuenta. Sin ella, tazas, monedas, objetos, ánimo, energía diaria, el perfil que completes (nombre, teléfono, edad y gusto de café) y preferencias se quedan solo en tu móvil, sin servidor propio ni herramienta de analítica. Los anuncios son la excepción; mira abajo. En las versiones con registro obligatorio, la cuenta es necesaria para usar la app; consulta «Cuenta y copia de seguridad»."
        ]
      },
      {
        "title": "Acceso al uso y Tiempo de uso (opcional)",
        "body": [
          "Si lo permites, la app lee de Android cuántas veces se desbloqueó el móvil y cuánto tiempo estuvo encendida la pantalla. En el iPhone, con la autorización de Tiempo de uso, la app solo recibe una estimación del tiempo de pantalla de cada día, de 15 en 15 minutos, que una extensión de la propia app guarda en el dispositivo. Esos números se quedan en el dispositivo y no muestran qué apps usas. Con ellos la app calcula, en el propio dispositivo, las monedas por el tiempo con la pantalla bloqueada. Puedes revocar el permiso en cualquier momento en los ajustes de Android o, en el iPhone, en Ajustes › Tiempo de uso."
        ]
      },
      {
        "title": "Sensor de movimiento",
        "body": [
          "El acelerómetro sirve solo para saber si el móvil está boca abajo. Las lecturas no se guardan ni se envían."
        ]
      },
      {
        "title": "Notificaciones (opcional)",
        "body": [
          "Los avisos (taza lista, frase del día por la mañana y recordatorio del check-in) son notificaciones locales, creadas en el propio dispositivo, sin pasar por un servidor. Activas o desactivas cada uno en Ajustes."
        ]
      },
      {
        "title": "Compras",
        "body": [
          "Cuando la compra de monedas esté activa, el pago lo procesa la tienda de aplicaciones y RevenueCat. La app no ve datos de tarjeta. RevenueCat recibe un identificador anónimo de la instalación para registrar la compra."
        ]
      },
      {
        "title": "Borrar todo",
        "body": [
          "En Ajustes, “Borrar todos los datos” elimina todo lo que la app guardó. Desinstalar la app también lo borra todo."
        ]
      },
      {
        "title": "Cuenta y copia de seguridad",
        "body": [
          "En las versiones con cuenta propia, registrarse es necesario para usar la app: creas la cuenta con correo y contraseña o entras con Google o Apple. Guardamos tu correo, el nombre y el apodo que elijas, y una copia de tu progreso (vasos, monedas, objetos, ánimo, energía diaria, el perfil que completes (nombre, teléfono, edad y gusto de café) y preferencias) para que la recuperes en otro dispositivo. Solo tú accedes a esa copia. El acceso con Google o Apple comparte solo el nombre y el correo del perfil. Las versiones anteriores guardaban esa copia en Firebase, un servicio de Google, y siguen así hasta que se actualicen."
        ]
      },
      {
        "title": "Eliminar la cuenta",
        "body": [
          "En Cuenta › Eliminar cuenta, borramos tu cuenta, la copia de seguridad, las publicaciones, las fotos, los comentarios, los me gusta, las amistades y los números del ranking. También puedes pedirlo en la página de eliminación de cuenta de la app, sin abrirla. Los datos del dispositivo siguen hasta que los borres en Ajustes."
        ]
      },
      {
        "title": "Anuncios",
        "body": [
          "La app muestra un banner de anuncio al final de algunas pantallas, proporcionado por Google AdMob. Para mostrarlo, AdMob puede usar el identificador de publicidad del dispositivo y datos como la dirección IP y el modelo del dispositivo. Pedimos anuncios sin personalización. Donde la ley lo exige, la app muestra un formulario de consentimiento, que puedes rehacer cuando quieras. Quien compre “Quitar anuncios” o se suscriba al Pro no ve el banner ni se carga el anuncio."
        ]
      },
      {
        "title": "Comunidad, fotos y ranking",
        "body": [
          "En la Comunidad eliges un apodo, añades amigos y publicas entradas con título, descripción y hasta 3 fotos. Las fotos se reducen y comprimen en tu dispositivo antes de enviarlas y se guardan en un almacenamiento privado: solo tú y tus amigos las ven, mediante enlaces que caducan en una hora. Puedes borrar tus publicaciones y comentarios cuando quieras. El ranking semanal usa tu tiempo sin móvil y el número de vasos de la semana; entre amigos aparece siempre, y en el ranking general solo si activas esa opción. Puedes bloquear a alguien, y quien bloqueas deja de ver lo que publicas."
        ]
      },
      {
        "title": "Dónde están los datos",
        "body": [
          "La cuenta, la copia de seguridad y la comunidad usan nuestra API, alojada en Vercel, y Supabase (base de datos, acceso y almacenamiento de fotos). El correo de bienvenida se envía por Brevo. No vendemos datos ni usamos herramientas de analítica. Para pedir ayuda o resolver dudas, usa la página de soporte de la app."
        ]
      }
    ]
  }
};
