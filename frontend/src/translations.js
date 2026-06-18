/**
 * translations.js — Dictionnaires i18n (Arabe / Français)
 * Utilisé par tous les composants de l'application.
 */

const translations = {
  ar: {
    // ─── Welcome message ───
    welcome: `مرحباً! أنا مساعدك القانوني لشؤون التعمير بالمغرب 🏛️

أنا متخصص في **القانون 12-90** المتعلق بالتعمير بالمغرب.

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
    ocrDescription: "استخدم فقط عند تغيير ملف PDF للقانون 12-90.",
    ocrUploading: "⏳ جاري المعالجة...",
    ocrButton: "📎 تحميل PDF القانون 12-90",
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
    landingDescription: "حلل، صمم وافهم أراضيك بشكل أفضل بفضل الذكاء الاصطناعي. اكتشف القانون 12-90 ببساطة.",
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

Je suis expert en **Loi 12-90** relative à l'urbanisme au Maroc.

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
    ocrDescription: "Utilise uniquement quand le PDF de la loi 12-90 change.",
    ocrUploading: "⏳ OCR en cours...",
    ocrButton: "📎 Charger PDF loi 12-90",
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
    landingDescription: "Analysez, concevez et comprenez mieux vos territoires grâce à l'intelligence artificielle. Découvrez la loi 12-90 simplement.",
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
