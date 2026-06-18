import React from 'react';
import translations from '../translations';

export default function LandingPage({ onLogin, onRegister, onGuest, language = "ar", onLanguageChange }) {
  const t = translations[language] || translations.ar;
  const isRTL = language === "ar";

  return (
    <div className="flex items-center justify-center min-h-screen pt-[80px] bg-appBg text-appText relative overflow-hidden font-sans" dir={isRTL ? "rtl" : "ltr"}>
      {/* Top navigation bar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 sm:px-10 py-3 sm:py-4 bg-surface/85 backdrop-blur-md border-b border-appBorder">
        <div className="hidden sm:flex items-center gap-2.5">
          <img src="/logo_chatbot.png" alt="UrbanBot Logo" className="w-9 h-9 object-contain" />
          <span className="text-lg font-bold text-appText">UrbanBot</span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Language toggle */}
          <button
            className="px-3 py-2 rounded-full text-[0.85rem] font-medium transition-all duration-300 border-[1.5px] border-appBorder text-muted hover:border-accent2 hover:text-accent2 hover:bg-accent2/5"
            onClick={() => onLanguageChange && onLanguageChange(language === "ar" ? "fr" : "ar")}
            title={t.language}
          >
            {language === "ar" ? "FR" : "عربي"}
          </button>
          <button className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[0.85rem] sm:text-[0.95rem] font-semibold transition-all duration-300 border-[1.5px] border-appBorder text-appText hover:border-accent2 hover:text-accent2 hover:bg-accent2/5" onClick={onLogin} id="landing-login-btn">
            {t.landingLogin}
          </button>
          <button className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[0.85rem] sm:text-[0.95rem] font-semibold transition-all duration-300 bg-accent2 text-white shadow-sm hover:scale-[1.02] hover:-translate-y-px" onClick={onRegister} id="landing-register-btn">
            {t.landingRegister}
          </button>
        </div>
      </nav>

      <div className={`grid grid-cols-1 md:grid-cols-2 max-w-[1200px] w-[90%] mx-auto gap-[15px] md:gap-[60px] items-center relative z-10 px-[15px] md:px-0 text-center ${isRTL ? "md:text-right" : "md:text-left"}`}>
        <div className={`animate-[${isRTL ? "slideInRight" : "slideInLeft"}_0.8s_ease-out_forwards]`}>
          <div className={`flex items-center ${isRTL ? "justify-center md:justify-end" : "justify-center md:justify-start"} gap-3 mb-2.5 md:mb-[30px]`}>
            <img src="/logo_chatbot.png" alt="UrbanBot Logo" className="w-8 h-8 md:w-12 md:h-12 object-contain" />
            <span className="text-[1.2rem] md:text-[1.4rem] font-bold text-appText">UrbanBot</span>
          </div>
          <h1 className="text-[1.8rem] md:text-[3.5rem] font-extrabold text-appText mb-2.5 md:mb-5 leading-[1.15] tracking-tight">
            {t.landingTitle} <span className="text-accent2 relative inline-block after:content-[''] after:absolute after:bottom-1 after:left-0 after:w-full after:h-3 after:bg-accent2/20 after:-z-10 after:rounded">{t.landingTitleHighlight}</span>
          </h1>
          <p className={`text-[0.95rem] md:text-[1.2rem] text-muted mx-auto ${isRTL ? "md:mr-0 md:ml-auto" : "md:mx-0"} mb-[15px] md:mb-10 leading-relaxed max-w-[90%] md:max-w-[480px]`}>
            {t.landingDescription}
          </p>
          <button className={`inline-flex items-center justify-center gap-3 bg-accent2 text-white border-none py-3 px-6 md:py-4 md:px-9 rounded-full text-[1rem] md:text-[1.15rem] font-semibold cursor-pointer transition-all duration-300 shadow-sm hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-accent2/90 active:translate-y-px group ${isRTL ? "flex-row-reverse" : ""}`} onClick={onGuest}>
            {t.landingStart}
            <svg className={`w-[22px] h-[22px] transition-transform duration-300 ${isRTL ? "rotate-180 group-hover:-translate-x-[5px]" : "group-hover:translate-x-[5px]"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
        
        <div className={`relative animate-[${isRTL ? "slideInLeft" : "slideInRight"}_0.8s_ease-out_forwards]`}>
          <div className="relative z-[2]">
            <img src="/landing_illustration.png" alt="Illustration Urbanisme" className="w-full h-auto max-h-[40vh] md:max-h-none object-contain md:object-cover block" />
          </div>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute rounded-full blur-[80px] z-[1] opacity-60 animate-[spinBlobs_20s_linear_infinite] -top-[20%] -right-[10%] w-[50vw] h-[50vw] bg-accent2/20"></div>
      <div className="absolute rounded-full blur-[80px] z-[1] opacity-60 animate-[spinBlobs_25s_linear_infinite_reverse] -bottom-[20%] -left-[10%] w-[45vw] h-[45vw] bg-accent/20"></div>
    </div>
  );
}
