import React, { useState } from "react";
import translations from "../translations";
import { getPublicContent } from "../services/api";
import { Loader2 } from "lucide-react";

export default function SettingsPage({
  isLightMode,
  onToggleTheme,
  language,
  onLanguageChange,
  onBack,
}) {
  // null = main settings, "privacy" | "terms" | "about" = sub-page
  const [activePage, setActivePage] = useState(null);
  const [contentCache, setContentCache] = useState({});
  const [loadingContent, setLoadingContent] = useState(false);
  const t = translations[language] || translations.ar;
  const isRTL = language === "ar";

  const handleOpenPage = async (pageId) => {
    setActivePage(pageId);
    if (!contentCache[pageId]) {
      setLoadingContent(true);
      try {
        const keyMap = { privacy: "privacy_policy", terms: "terms", about: "about" };
        const data = await getPublicContent(keyMap[pageId]);
        setContentCache(prev => ({ ...prev, [pageId]: data }));
      } catch (err) {
        console.error("Failed to load content:", err);
      } finally {
        setLoadingContent(false);
      }
    }
  };

  const ProfessionalTextRenderer = ({ text, isRTL }) => {
    const blocks = text.split('\n\n');
    return (
      <div className={`text-[0.9rem] leading-relaxed text-muted ${isRTL ? 'text-right font-arabic' : 'text-left font-sans'}`}>
        {blocks.map((block, i) => {
          if (!block.trim()) return null;
          const lines = block.split('\n');
          const isHeading = /^(\d+\.|Principales fonctionnalités|Notre mission|Vision|مهمتنا|الرؤية|الميزات الرئيسية)/i.test(lines[0].trim());
                            
          if (isHeading) {
            return (
              <div key={i} className="mb-5 last:mb-0">
                <h4 className="text-[1rem] font-bold text-appText mb-2.5 mt-2 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-accent rounded-full inline-block"></span>
                  {lines[0]}
                </h4>
                <div className="pl-3 rtl:pr-3 rtl:pl-0">
                  {lines.slice(1).map((line, j) => (
                    <p key={j} className="mb-2 opacity-90 flex items-start gap-2.5 text-[0.88rem]">
                      {line.trim().startsWith('-') ? (
                        <>
                          <span className="text-accent2 mt-1.5 shrink-0 text-[0.7rem] opacity-70">●</span>
                          <span className="leading-relaxed">{line.trim().substring(1).trim()}</span>
                        </>
                      ) : (
                        <span className="leading-relaxed">{line}</span>
                      )}
                    </p>
                  ))}
                </div>
              </div>
            );
          }
          
          return (
            <p key={i} className={`mb-4 leading-relaxed opacity-90 text-[0.88rem] ${i === 0 && text.includes('Dernière mise à jour') ? 'text-[0.75rem] italic opacity-60' : ''}`}>
              {block}
            </p>
          );
        })}
      </div>
    );
  };

  const SunIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );

  const MoonIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );

  const BackIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points={isRTL ? "9 18 15 12 9 6" : "15 18 9 12 15 6"} />
    </svg>
  );

  const ArrowRightIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points={isRTL ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
    </svg>
  );

  const ShieldIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );

  const FileTextIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );

  const InfoIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );

  const PaletteIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );

  const LanguageIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );

  // ── Sub-page configuration ──
  const pageConfig = {
    privacy: {
      title: t.privacyPolicy,
      content: t.privacyPolicyContent,
      icon: <ShieldIcon />,
      gradient: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-500",
    },
    terms: {
      title: t.termsOfUse,
      content: t.termsOfUseContent,
      icon: <FileTextIcon />,
      gradient: "from-violet-500/20 to-purple-500/20",
      iconColor: "text-violet-500",
    },
    about: {
      title: t.about,
      content: t.aboutContent,
      icon: <InfoIcon />,
      gradient: "from-rose-500/20 to-pink-500/20",
      iconColor: "text-rose-500",
    },
  };

  // ── Sub-page view ──
  if (activePage && pageConfig[activePage]) {
    const config = pageConfig[activePage];
    return (
      <div
        className="flex-1 flex flex-col min-w-0 h-full bg-surface relative z-0"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Sub-page Header */}
        <div className="h-[72px] shrink-0 px-4 sm:px-6 flex items-center gap-3 border-b border-appBorder bg-surface/80 backdrop-blur-md sticky top-0 z-10">
          <button
            className="p-2 rounded-xl border-none bg-transparent text-muted hover:bg-surface2 hover:text-appText cursor-pointer transition-all duration-200"
            onClick={() => setActivePage(null)}
            title={isRTL ? "رجوع" : "Retour"}
          >
            <BackIcon />
          </button>
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center ${config.iconColor} shrink-0`}>
            {config.icon}
          </div>
          <h1 className="text-[1.1rem] sm:text-[1.15rem] font-bold text-appText m-0">
            {config.title}
          </h1>
        </div>

        {/* Sub-page Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scrollbar-thin scrollbar-thumb-muted">
          <div className="max-w-[640px] mx-auto">
            <div className="bg-surface2/50 border border-appBorder/50 rounded-2xl p-5 sm:p-8 shadow-sm min-h-[200px] flex flex-col">
              {loadingContent ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-accent2 opacity-50" />
                </div>
              ) : (
                <ProfessionalTextRenderer 
                  text={
                    (contentCache[activePage] && (isRTL ? contentCache[activePage].content_ar : contentCache[activePage].content_fr)) 
                      || config.content
                  } 
                  isRTL={isRTL} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main settings view ──
  return (
    <div
      className="flex-1 flex flex-col min-w-0 h-full bg-surface relative z-0"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="h-[72px] shrink-0 px-4 sm:px-6 flex items-center gap-3 border-b border-appBorder bg-surface/80 backdrop-blur-md sticky top-0 z-10">
        <button
          className="p-2 rounded-xl border-none bg-transparent text-muted hover:bg-surface2 hover:text-appText cursor-pointer transition-all duration-200"
          onClick={onBack}
          title={isRTL ? "رجوع" : "Retour"}
        >
          <BackIcon />
        </button>
        <h1 className="text-[1.1rem] sm:text-[1.15rem] font-bold text-appText m-0">
          {t.settings}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scrollbar-thin scrollbar-thumb-muted">
        <div className="max-w-[640px] mx-auto flex flex-col gap-4">

          {/* ── Theme Section ── */}
          <div className="bg-surface border border-appBorder rounded-2xl overflow-hidden transition-all duration-300 hover:border-accent2/30">
            <div className="px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <PaletteIcon />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[0.95rem] font-semibold text-appText m-0">{t.theme}</h3>
                <p className="text-[0.8rem] text-muted m-0 mt-0.5">
                  {isLightMode ? t.themeLight : t.themeDark}
                </p>
              </div>
              {/* Theme toggle switch */}
              <button
                onClick={onToggleTheme}
                className="relative w-[60px] h-[32px] rounded-full border-none cursor-pointer transition-all duration-300 flex items-center shrink-0 focus:outline-none focus:ring-2 focus:ring-accent2"
                style={{
                  background: isLightMode
                    ? "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)"
                    : "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                }}
              >
                <div
                  className="absolute w-[26px] h-[26px] rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300"
                  style={{
                    [isRTL ? "right" : "left"]: isLightMode ? "31px" : "3px",
                  }}
                >
                  <span className="text-[0.75rem]">
                    {isLightMode ? <SunIcon /> : <MoonIcon />}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* ── Language Section ── */}
          <div className="bg-surface border border-appBorder rounded-2xl overflow-hidden transition-all duration-300 hover:border-accent2/30">
            <div className="px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 flex items-center justify-center text-sky-500 shrink-0">
                <LanguageIcon />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[0.95rem] font-semibold text-appText m-0">{t.language}</h3>
                <p className="text-[0.8rem] text-muted m-0 mt-0.5">
                  {language === "ar" ? t.languageAr : t.languageFr}
                </p>
              </div>
              {/* Language toggle pills */}
              <div className="flex bg-surface2 rounded-xl p-1 gap-1 shrink-0">
                <button
                  onClick={() => onLanguageChange("ar")}
                  className={`px-3 py-1.5 rounded-lg text-[0.82rem] font-medium border-none cursor-pointer transition-all duration-200 ${
                    language === "ar"
                      ? "bg-accent2 text-white shadow-sm"
                      : "bg-transparent text-muted hover:text-appText"
                  }`}
                >
                  العربية
                </button>
                <button
                  onClick={() => onLanguageChange("fr")}
                  className={`px-3 py-1.5 rounded-lg text-[0.82rem] font-medium border-none cursor-pointer transition-all duration-200 ${
                    language === "fr"
                      ? "bg-accent2 text-white shadow-sm"
                      : "bg-transparent text-muted hover:text-appText"
                  }`}
                >
                  Français
                </button>
              </div>
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="h-px bg-appBorder my-2" />

          {/* ── Privacy Policy Button ── */}
          <div className="bg-surface border border-appBorder rounded-2xl overflow-hidden transition-all duration-300 hover:border-accent2/30">
            <button
              className="w-full px-5 py-4 flex items-center gap-4 bg-transparent border-none cursor-pointer text-left"
              onClick={() => handleOpenPage("privacy")}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                <ShieldIcon />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[0.95rem] font-semibold text-appText m-0">{t.privacyPolicy}</h3>
              </div>
              <span className="text-muted shrink-0 opacity-50">
                <ArrowRightIcon />
              </span>
            </button>
          </div>

          {/* ── Terms of Use Button ── */}
          <div className="bg-surface border border-appBorder rounded-2xl overflow-hidden transition-all duration-300 hover:border-accent2/30">
            <button
              className="w-full px-5 py-4 flex items-center gap-4 bg-transparent border-none cursor-pointer text-left"
              onClick={() => handleOpenPage("terms")}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center text-violet-500 shrink-0">
                <FileTextIcon />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[0.95rem] font-semibold text-appText m-0">{t.termsOfUse}</h3>
              </div>
              <span className="text-muted shrink-0 opacity-50">
                <ArrowRightIcon />
              </span>
            </button>
          </div>

          {/* ── About Button ── */}
          <div className="bg-surface border border-appBorder rounded-2xl overflow-hidden transition-all duration-300 hover:border-accent2/30">
            <button
              className="w-full px-5 py-4 flex items-center gap-4 bg-transparent border-none cursor-pointer text-left"
              onClick={() => handleOpenPage("about")}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center text-rose-500 shrink-0">
                <InfoIcon />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[0.95rem] font-semibold text-appText m-0">{t.about}</h3>
              </div>
              <span className="text-muted shrink-0 opacity-50">
                <ArrowRightIcon />
              </span>
            </button>
          </div>

          {/* Bottom spacing */}
          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}
