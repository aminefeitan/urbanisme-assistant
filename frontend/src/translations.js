/**
 * translations.js — Dictionnaires i18n (Arabe / Français)
 * Utilisé par tous les composants de l'application.
 */

const translations = {
  ar: {
    // ─── Welcome message ───
    welcome: `مرحباً! أنا مساعدك القانوني لشؤون التعمير بالمغرب 🏛️

أنا متخصص في **القانونين 12-90 و 25-90** المتعلقين بالتعمير والتجزئات العقارية بالمغرب.

**كيفاش نقدر نعاونك؟**
- تحليل شكايتك ديال التعمير
- شرح المقتضيات القانونية
- اقتراح المسار الإداري الصحيح

اكتب شكايتك أو سؤالك بالدارجة أو الفرنسية 👇`,

    // ─── Suggestions ───
    suggestions: [
      "عندي مشكل ديال البناء بلا رخصة",
      "كيفاش نطلب رخصة البناء؟",
      "الجار ديالي بنى على الحد",
      "المنطقة ديالي قابلة للبناء؟",
    ],

    // ─── Input bar ───
    inputPlaceholder: "اكتب استفسارك المتعلق بالتعمير...",
    listening: "جاري الاستماع...",
    transcribing: "جاري التحويل...",
    stopRecording: "إيقاف التسجيل",
    speak: "تحدث",
    transcriptionError: "خطأ في التحويل الصوتي.",
    micError: "تعذر الوصول إلى الميكروفون.",

    // ─── Sidebar ───
    newConversation: "محادثة جديدة",
    history: "💬 السجل",
    noConversations: "لا توجد محادثات",
    pinned: "المثبتة",
    recent: "الأخيرة",
    conversations: "💬 المحادثات",
    unpin: "إلغاء التثبيت",
    pin: "تثبيت",
    delete: "حذف",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    ocrTitle: "📤 OCR — تحديث القانون",
    ocrDescription: "استخدم فقط عند تغيير ملف PDF للقانونين 12-90 أو 25-90.",
    ocrUploading: "⏳ جاري المعالجة...",
    ocrButton: "📎 تحميل PDF (12-90 / 25-90)",
    assistantUrbanisme: "مساعد التعمير",
    refresh: "تحديث",

    // ─── Profile menu ───
    profile: "الملف الشخصي",
    theme: "المظهر",
    themeLight: "فاتح",
    themeDark: "داكن",
    language: "اللغة",
    languageAr: "العربية",
    languageFr: "Français",
    settings: "الإعدادات",
    privacyPolicy: "سياسة الخصوصية",
    termsOfUse: "شروط الاستخدام",
    about: "حول",
    privacyPolicyContent: `(آخر تحديث : يونيو 2026)

1. مقدمة
يحترم مساعد التعمير خصوصية مستخدميه ويلتزم بحماية المعلومات الشخصية التي يتم جمعها عند استخدام المنصة.

2. البيانات التي تم جمعها
قد نقوم بجمع المعلومات التالية:
- عنوان البريد الإلكتروني (عند إنشاء حساب).
- معلومات المصادقة.
- الرسائل المرسلة إلى المساعد.
- البيانات التقنية (عنوان IP، المتصفح، نظام التشغيل).
- سجلات الاستخدام وإحصاءات الأداء.

3. استخدام البيانات
يتم استخدام البيانات التي تم جمعها من أجل:
- تقديم وتحسين الخدمات المقترحة.
- ضمان أمن المنصة.
- تخصيص تجربة المستخدم.
- الرد على طلبات الدعم.
- إنتاج إحصائيات استخدام مجهولة.

4. الاحتفاظ بالبيانات
يتم الاحتفاظ بالبيانات فقط للمدة اللازمة لتقديم الخدمات أو وفقًا للالتزامات القانونية المعمول بها.

5. مشاركة البيانات
مساعد التعمير لا يبيع أو يؤجر البيانات الشخصية للمستخدمين.
قد يتم مشاركة البيانات فقط:
- مع مقدمي الخدمات الفنيين اللازمين لتشغيل الخدمة.
- في حالة الالتزام القانوني.
- بموافقة صريحة من المستخدم.

6. الأمان
نحن ننفذ تدابير فنية وتنظيمية معقولة لحماية البيانات من الوصول غير المصرح به أو الفقدان أو التغيير أو الإفشاء.

7. حقوق المستخدمين
يمكن للمستخدمين:
- الوصول إلى بياناتهم.
- تصحيح معلوماتهم.
- طلب حذف حسابهم.
- طلب حذف بياناتهم الشخصية.

8. الاتصال
لأي سؤال يتعلق بحماية البيانات:
البريد الإلكتروني: contact@urbanisme-assistant.com`,
    termsOfUseContent: `(آخر تحديث : يونيو 2026)

1. قبول الشروط
باستخدام مساعد التعمير، فإنك توافق على شروط الاستخدام هذه.

2. الغرض من الخدمة
يقدم مساعد التعمير خدمة مساعدة رقمية تهدف إلى تسهيل التحليل الإقليمي، التصميم الحضري، وتفسير البيانات المكانية.

3. مسؤوليات المستخدم
يلتزم المستخدم بما يلي:
- تقديم معلومات دقيقة.
- استخدام المنصة وفقًا للقوانين المعمول بها.
- عدم محاولة تعطيل أو الإضرار بعمل الخدمة.
- احترام حقوق الملكية الفكرية.

4. تحديد المسؤولية
يتم تقديم المعلومات والتوصيات الناتجة عن الذكاء الاصطناعي كإرشاد فقط.
لا يضمن مساعد التعمير الدقة المطلقة للنتائج ولا يمكن تحميله مسؤولية القرارات المتخذة بناءً على المعلومات المقدمة.
يظل المستخدمون مسؤولون عن التحقق من التحليلات والتوصيات قبل أي استخدام مهني أو قرار إداري.

5. توفر الخدمة
نحن نسعى جاهدين لضمان توفر الخدمة ولكن لا نضمن وصولاً غير منقطع أو خاليًا من الأخطاء.

6. الملكية الفكرية
جميع عناصر المنصة، بما في ذلك الكود، الواجهات، الشعارات، النصوص، والمحتويات، محمية بموجب قوانين الملكية الفكرية المعمول بها.

7. الإنهاء
نحتفظ بالحق في تعليق أو حذف الوصول إلى الحساب في حالة انتهاك هذه الشروط.

8. تعديل الشروط
يمكن تحديث هذه الشروط في أي وقت. سيتم إبلاغ المستخدمين بالتعديلات الهامة.

9. القانون المعمول به
تخضع هذه الشروط للقوانين المعمول بها في بلد تشغيل الخدمة.`,
    aboutContent: `مساعد التعمير

مساعد التعمير هو منصة ذكية للمساعدة في التحليل الإقليمي، التصميم الحضري، والنمذجة المكانية.

تستخدم التطبيقة الذكاء الاصطناعي لدعم المخططين الحضريين، المطورين، السلطات المحلية، مكاتب الدراسات، الباحثين، والطلاب في أعمال التحليل والتخطيط الحضري.

الميزات الرئيسية:
- تحليل البيانات الإقليمية والحضرية.
- المساعدة في التصميم والتخطيط الحضري.
- نمذجة وتفسير المعلومات المكانية.
- إنشاء مؤشرات وتوصيات.
- استشارة تفاعلية عبر مساعد محادثة ذكي.

مهمتنا:
تسهيل الوصول إلى المعلومات الإقليمية وتحسين صنع القرار بفضل الأدوات الرقمية المبتكرة التي تجمع بين الذكاء الاصطناعي والخبرة في التخطيط الحضري.

الرؤية:
المساهمة في تخطيط إقليمي أكثر فعالية، واستدامة، وقائم على تحليل البيانات لدعم التنمية المتناغمة للأقاليم.`,
    logout: "تسجيل الخروج",
    logoutConfirmTitle: "هل أنت متأكد من تسجيل الخروج؟",
    logoutConfirmText: "تسجيل الخروج من مساعد التعمير بحساب",
    logoutConfirmButton: "تسجيل الخروج",
    cancel: "إلغاء",
    user: "مستخدم",

    // ─── Profile edit modal ───
    editProfile: "تعديل الملف الشخصي",
    firstName: "الاسم",
    lastName: "النسب",
    profileHelp: "ملفك الشخصي يساعد الآخرين على التعرف عليك في المحادثات.",
    save: "حفظ",
    changePhoto: "تغيير الصورة",

    // ─── Header ───
    headerTitle: "مساعد التعمير",
    loginButton: "تسجيل الدخول",
    menu: "القائمة",

    // ─── Landing page ───
    landingTitle: "مساعدك الذكي في",
    landingTitleHighlight: "التعمير",
    landingDescription: "حلل، صمم وافهم أراضيك بشكل أفضل بفضل الذكاء الاصطناعي. اكتشف قوانين التعمير 12-90 و 25-90 ببساطة.",
    landingStart: "ابدأ الآن",
    landingLogin: "تسجيل الدخول",
    landingRegister: "إنشاء حساب",

    // ─── Auth page ───
    authLogin: "تسجيل الدخول",
    authRegister: "إنشاء حساب",
    authLoginSubtitle: "ادخل إلى مساعدك القانوني",
    authRegisterSubtitle: "سجّل حسابك للبدء",
    authLoginTab: "تسجيل الدخول",
    authRegisterTab: "إنشاء حساب",
    authFirstName: "الاسم",
    authLastName: "النسب",
    authEmail: "البريد الإلكتروني",
    authPassword: "كلمة المرور",
    authConfirmPassword: "تأكيد",
    authFirstNamePlaceholder: "اسمك",
    authLastNamePlaceholder: "نسبك",
    authEmailPlaceholder: "بريدك الإلكتروني",
    authPasswordPlaceholder: "كلمة المرور",
    authConfirmPlaceholder: "أكد كلمة المرور",
    authLoginButton: "تسجيل الدخول",
    authRegisterButton: "إنشاء حساب",
    authLoggingIn: "جاري تسجيل الدخول...",
    authRegistering: "جاري التسجيل...",
    authNewUser: "جديد على المنصة؟",
    authCreateAccount: "إنشاء حساب",
    authHaveAccount: "لديك حساب بالفعل؟",
    authSignIn: "تسجيل الدخول",
    authBack: "الرئيسية",
    authPasswordMismatch: "كلمتا المرور غير متطابقتين.",
    authPasswordTooShort: "كلمة المرور يجب أن تكون 6 أحرف على الأقل.",

    // ─── OTP page ───
    otpTitle: "التحقق من البريد الإلكتروني",
    otpSubtitle: "تم إرسال رمز من 6 أرقام إلى",
    otpBack: "رجوع",
    otpVerifying: "جاري التحقق...",
    otpValidate: "تأكيد الرمز",
    otpResendIn: "إعادة الإرسال بعد",
    otpResend: "إعادة إرسال الرمز",
  },

  fr: {
    // ─── Welcome message ───
    welcome: `Bonjour ! Je suis votre assistant juridique spécialisé en urbanisme au Maroc 🏛️

Je suis expert en **Lois 12-90 et 25-90** relatives à l'urbanisme et lotissements au Maroc.

**Comment puis-je vous aider ?**
- Analyser votre réclamation d'urbanisme
- Expliquer les dispositions légales
- Proposer la démarche administrative appropriée

Décrivez votre question ou réclamation ci-dessous 👇`,

    // ─── Suggestions ───
    suggestions: [
      "J'ai un problème de construction sans permis",
      "Comment obtenir un permis de construire ?",
      "Mon voisin a construit sur la limite",
      "Ma zone est-elle constructible ?",
    ],

    // ─── Input bar ───
    inputPlaceholder: "Décrivez votre question d'urbanisme...",
    listening: "Écoute en cours...",
    transcribing: "Transcription...",
    stopRecording: "Arrêter l'enregistrement",
    speak: "Parler",
    transcriptionError: "Erreur de transcription vocale.",
    micError: "Impossible d'accéder au microphone.",

    // ─── Sidebar ───
    newConversation: "Nouvelle conversation",
    history: "💬 Historique",
    noConversations: "Aucune conversation",
    pinned: "Épinglées",
    recent: "Récentes",
    conversations: "💬 Conversations",
    unpin: "Désépingler",
    pin: "Épingler",
    delete: "Supprimer",
    openMenu: "Ouvrir le menu",
    closeMenu: "Réduire le menu",
    ocrTitle: "📤 OCR — Mise à jour loi",
    ocrDescription: "Utilise uniquement quand le PDF des lois 12-90 ou 25-90 change.",
    ocrUploading: "⏳ OCR en cours...",
    ocrButton: "📎 Charger PDF (12-90 / 25-90)",
    assistantUrbanisme: "Assistant Urbanisme",
    refresh: "Actualiser",

    // ─── Profile menu ───
    profile: "Profil",
    theme: "Thème",
    themeLight: "Clair",
    themeDark: "Sombre",
    language: "Langue",
    languageAr: "العربية",
    languageFr: "Français",
    settings: "Paramètres",
    privacyPolicy: "Politique de Confidentialité",
    termsOfUse: "Conditions d'Utilisation",
    about: "À propos",
    privacyPolicyContent: `(Dernière mise à jour : Juin 2026)

1. Introduction
Urbanisme Assistant respecte la confidentialité de ses utilisateurs et s'engage à protéger les informations personnelles collectées lors de l'utilisation de la plateforme.

2. Données collectées
Nous pouvons collecter les informations suivantes :
- Adresse email (lors de la création d'un compte).
- Informations d'authentification.
- Messages envoyés à l'assistant.
- Données techniques (adresse IP, navigateur, système d'exploitation).
- Journaux d'utilisation et statistiques de performance.

3. Utilisation des données
Les données collectées sont utilisées pour :
- Fournir et améliorer les services proposés.
- Assurer la sécurité de la plateforme.
- Personnaliser l'expérience utilisateur.
- Répondre aux demandes de support.
- Produire des statistiques anonymisées d'utilisation.

4. Conservation des données
Les données sont conservées uniquement pendant la durée nécessaire à la fourniture des services ou conformément aux obligations légales applicables.

5. Partage des données
Urbanisme Assistant ne vend ni ne loue les données personnelles des utilisateurs.
Les données peuvent être partagées uniquement :
- Avec des prestataires techniques nécessaires au fonctionnement du service.
- En cas d'obligation légale.
- Avec le consentement explicite de l'utilisateur.

6. Sécurité
Nous mettons en œuvre des mesures techniques et organisationnelles raisonnables afin de protéger les données contre tout accès non autorisé, perte, altération ou divulgation.

7. Droits des utilisateurs
Les utilisateurs peuvent :
- Accéder à leurs données.
- Corriger leurs informations.
- Demander la suppression de leur compte.
- Demander la suppression de leurs données personnelles.

8. Contact
Pour toute question relative à la protection des données :
Email : contact@urbanisme-assistant.com`,
    termsOfUseContent: `(Dernière mise à jour : Juin 2026)

1. Acceptation des conditions
En utilisant Urbanisme Assistant, vous acceptez les présentes Conditions d'Utilisation.

2. Objet du service
Urbanisme Assistant fournit un service d'assistance numérique destiné à faciliter l'analyse territoriale, la conception urbaine et l'interprétation de données spatiales.

3. Responsabilités de l'utilisateur
L'utilisateur s'engage à :
- Fournir des informations exactes.
- Utiliser la plateforme conformément aux lois en vigueur.
- Ne pas tenter de perturber ou compromettre le fonctionnement du service.
- Respecter les droits de propriété intellectuelle.

4. Limitation de responsabilité
Les informations et recommandations générées par l'intelligence artificielle sont fournies à titre indicatif.
Urbanisme Assistant ne garantit pas l'exactitude absolue des résultats et ne saurait être tenu responsable des décisions prises sur la base des informations fournies.
Les utilisateurs demeurent responsables de la validation des analyses et recommandations avant toute utilisation professionnelle ou décision administrative.

5. Disponibilité du service
Nous nous efforçons d'assurer la disponibilité du service mais ne garantissons pas un accès ininterrompu ou exempt d'erreurs.

6. Propriété intellectuelle
Tous les éléments de la plateforme, y compris le code, les interfaces, les logos, les textes et les contenus, sont protégés par les lois applicables sur la propriété intellectuelle.

7. Résiliation
Nous nous réservons le droit de suspendre ou supprimer l'accès à un compte en cas de violation des présentes conditions.

8. Modification des conditions
Ces conditions peuvent être mises à jour à tout moment. Les utilisateurs seront informés des modifications importantes.

9. Droit applicable
Les présentes conditions sont régies par les lois applicables dans le pays d'exploitation du service.`,
    aboutContent: `Urbanisme Assistant

Urbanisme Assistant est une plateforme intelligente d'aide à l'analyse territoriale, à la conception urbaine et à la modélisation spatiale.

L'application utilise l'intelligence artificielle pour accompagner les urbanistes, aménageurs, collectivités territoriales, bureaux d'études, chercheurs et étudiants dans leurs travaux d'analyse et de planification urbaine.

Principales fonctionnalités
- Analyse de données territoriales et urbaines.
- Assistance à la conception et à la planification urbaine.
- Modélisation et interprétation des informations spatiales.
- Génération d'indicateurs et de recommandations.
- Consultation interactive via un assistant conversationnel intelligent.

Notre mission
Faciliter l'accès à l'information territoriale et améliorer la prise de décision grâce à des outils numériques innovants combinant intelligence artificielle et expertise en urbanisme.

Vision
Contribuer à une planification territoriale plus efficace, durable et fondée sur l'analyse des données afin d'accompagner le développement harmonieux des territoires.`,
    logout: "Déconnexion",
    logoutConfirmTitle: "Êtes-vous sûr de vouloir vous déconnecter ?",
    logoutConfirmText: "Se déconnecter d'Assistant Urbanisme en tant que",
    logoutConfirmButton: "Se déconnecter",
    cancel: "Annuler",
    user: "Utilisateur",

    // ─── Profile edit modal ───
    editProfile: "Modifier le profil",
    firstName: "Prénom",
    lastName: "Nom",
    profileHelp: "Votre profil aide les gens à vous reconnaître dans les conversations.",
    save: "Enregistrer",
    changePhoto: "Changer la photo",

    // ─── Header ───
    headerTitle: "Assistant Urbanisme",
    loginButton: "Se connecter",
    menu: "Menu",

    // ─── Landing page ───
    landingTitle: "Votre Assistant IA en",
    landingTitleHighlight: "Urbanisme",
    landingDescription: "Analysez, concevez et comprenez mieux vos territoires grâce à l'intelligence artificielle. Découvrez les lois 12-90 et 25-90 simplement.",
    landingStart: "Commencez",
    landingLogin: "Connexion",
    landingRegister: "S'inscrire",

    // ─── Auth page ───
    authLogin: "Connexion",
    authRegister: "Créer un compte",
    authLoginSubtitle: "Accédez à votre assistant juridique",
    authRegisterSubtitle: "Inscrivez-vous pour commencer",
    authLoginTab: "Connexion",
    authRegisterTab: "Inscription",
    authFirstName: "Prénom",
    authLastName: "Nom",
    authEmail: "Adresse Email",
    authPassword: "Mot de passe",
    authConfirmPassword: "Confirmer",
    authFirstNamePlaceholder: "Votre prénom",
    authLastNamePlaceholder: "Votre nom",
    authEmailPlaceholder: "Votre adresse e-mail",
    authPasswordPlaceholder: "Votre mot de passe",
    authConfirmPlaceholder: "Confirmez",
    authLoginButton: "Se connecter",
    authRegisterButton: "S'inscrire",
    authLoggingIn: "Connexion...",
    authRegistering: "Inscription...",
    authNewUser: "Nouveau sur la plateforme ?",
    authCreateAccount: "Créer un compte",
    authHaveAccount: "Vous avez déjà un compte ?",
    authSignIn: "Se connecter",
    authBack: "Accueil",
    authPasswordMismatch: "Les mots de passe ne correspondent pas.",
    authPasswordTooShort: "Le mot de passe doit contenir au moins 6 caractères.",

    // ─── OTP page ───
    otpTitle: "Vérification Email",
    otpSubtitle: "Un code à 6 chiffres a été envoyé à",
    otpBack: "Retour",
    otpVerifying: "Vérification...",
    otpValidate: "Valider le code",
    otpResendIn: "Renvoyer le code dans",
    otpResend: "Renvoyer le code",
  },
};

export default translations;
