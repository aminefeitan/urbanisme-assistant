import React, { useState, useRef, useEffect } from "react";
import translations from "../translations";

export default function SettingsPage({
  isLightMode,
  onToggleTheme,
  language,
  onLanguageChange,
  onBack,
}) {
  const [expandedSection, setExpandedSection] = useState(null);
  const t = translations[language] || translations.ar;
  const isRTL = language === "ar";

  const toggleSection = (section) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  // Accordion content wrapper with smooth height animation
  const AccordionContent = ({ isOpen, children }) => {
    const contentRef = useRef(null);
    const [maxHeight, setMaxHeight] = useState(0);

    useEffect(() => {
      if (isOpen && contentRef.current) {
        setMaxHeight(contentRef.current.scrollHeight);
      } else {
        setMaxHeight(0);
      }
    }, [isOpen]);

    return (
      <div
        style={{
          maxHeight: isOpen ? maxHeight + "px" : "0px",
          overflow: "hidden",
          transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div ref={contentRef}>{children}</div>
      </div>
    );
  };

  const ChevronIcon = ({ isOpen }) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "transform 0.3s ease",
        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

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

          {/* ── Privacy Policy ── */}
          <div className="bg-surface border border-appBorder rounded-2xl overflow-hidden transition-all duration-300 hover:border-accent2/30">
            <button
              className="w-full px-5 py-4 flex items-center gap-4 bg-transparent border-none cursor-pointer text-left"
              onClick={() => toggleSection("privacy")}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                <ShieldIcon />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[0.95rem] font-semibold text-appText m-0">{t.privacyPolicy}</h3>
              </div>
              <span className="text-muted shrink-0">
                <ChevronIcon isOpen={expandedSection === "privacy"} />
              </span>
            </button>
            <AccordionContent isOpen={expandedSection === "privacy"}>
              <div className="px-5 pb-5 pt-0">
                <div className="bg-surface2 rounded-xl p-4 sm:p-5">
                  <pre
                    className="text-[0.85rem] text-muted leading-relaxed whitespace-pre-wrap m-0 font-sans"
                    dir={isRTL ? "rtl" : "ltr"}
                  >
                    {t.privacyPolicyContent}
                  </pre>
                </div>
              </div>
            </AccordionContent>
          </div>

          {/* ── Terms of Use ── */}
          <div className="bg-surface border border-appBorder rounded-2xl overflow-hidden transition-all duration-300 hover:border-accent2/30">
            <button
              className="w-full px-5 py-4 flex items-center gap-4 bg-transparent border-none cursor-pointer text-left"
              onClick={() => toggleSection("terms")}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center text-violet-500 shrink-0">
                <FileTextIcon />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[0.95rem] font-semibold text-appText m-0">{t.termsOfUse}</h3>
              </div>
              <span className="text-muted shrink-0">
                <ChevronIcon isOpen={expandedSection === "terms"} />
              </span>
            </button>
            <AccordionContent isOpen={expandedSection === "terms"}>
              <div className="px-5 pb-5 pt-0">
                <div className="bg-surface2 rounded-xl p-4 sm:p-5">
                  <pre
                    className="text-[0.85rem] text-muted leading-relaxed whitespace-pre-wrap m-0 font-sans"
                    dir={isRTL ? "rtl" : "ltr"}
                  >
                    {t.termsOfUseContent}
                  </pre>
                </div>
              </div>
            </AccordionContent>
          </div>

          {/* ── About ── */}
          <div className="bg-surface border border-appBorder rounded-2xl overflow-hidden transition-all duration-300 hover:border-accent2/30">
            <button
              className="w-full px-5 py-4 flex items-center gap-4 bg-transparent border-none cursor-pointer text-left"
              onClick={() => toggleSection("about")}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center text-rose-500 shrink-0">
                <InfoIcon />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[0.95rem] font-semibold text-appText m-0">{t.about}</h3>
              </div>
              <span className="text-muted shrink-0">
                <ChevronIcon isOpen={expandedSection === "about"} />
              </span>
            </button>
            <AccordionContent isOpen={expandedSection === "about"}>
              <div className="px-5 pb-5 pt-0">
                <div className="bg-surface2 rounded-xl p-4 sm:p-5">
                  <pre
                    className="text-[0.85rem] text-muted leading-relaxed whitespace-pre-wrap m-0 font-sans"
                    dir={isRTL ? "rtl" : "ltr"}
                  >
                    {t.aboutContent}
                  </pre>
                </div>
              </div>
            </AccordionContent>
          </div>

          {/* Bottom spacing */}
          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}
