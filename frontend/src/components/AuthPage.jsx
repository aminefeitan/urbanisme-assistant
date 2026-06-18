import React, { useState, useEffect } from 'react';
import { registerUser, loginUser, verifyEmail, sendOtp } from '../services/api';
import translations from '../translations';

export default function AuthPage({ initialMode = 'login', onLoginSuccess, onBack, language = "ar", onLanguageChange }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [step, setStep] = useState(1); // 1: form, 2: OTP verification (register only)

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const t = translations[language] || translations.ar;
  const isRTL = language === "ar";

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Reset errors when switching modes
  useEffect(() => {
    setError('');
    setStep(1);
    setOtp(['', '', '', '', '', '']);
  }, [mode]);

  // --- Handlers ---

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t.authPasswordMismatch);
      return;
    }
    if (password.length < 6) {
      setError(t.authPasswordTooShort);
      return;
    }

    setLoading(true);
    setError('');
    try {
      await registerUser(firstName, lastName, email, password);
      setStep(2);
      setTimer(60);
    } catch (err) {
      setError(err.message || t.authPasswordMismatch);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await loginUser(email, password);
      localStorage.setItem('authToken', data.token);
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return;

    setLoading(true);
    setError('');
    try {
      const data = await verifyEmail(email, code);
      localStorage.setItem('authToken', data.token);
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message || 'Code invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await sendOtp(email);
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setError(err.message || "Erreur lors du renvoi du code.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  // --- Render ---

  // Step 2: OTP Verification (after registration)
  if (step === 2) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-appBg p-4 font-sans overflow-hidden z-[1000] scrollbar-none" dir={isRTL ? "rtl" : "ltr"}>
        {/* Decorative background elements */}
        <div className="absolute rounded-full blur-[80px] z-0 opacity-60 animate-[spinBlobs_20s_linear_infinite] -top-[20%] -right-[10%] w-[50vw] h-[50vw] bg-accent2/20"></div>
        <div className="absolute rounded-full blur-[80px] z-0 opacity-60 animate-[spinBlobs_25s_linear_infinite_reverse] -bottom-[20%] -left-[10%] w-[45vw] h-[45vw] bg-accent/20"></div>
        
        <div className="bg-surface p-6 sm:p-8 rounded-[20px] shadow-lg w-full max-w-[420px] relative animate-[cardSlideUp_0.5s_ease-out] z-[2]">
          <button className="inline-flex items-center gap-1 bg-transparent border-none text-muted cursor-pointer text-[0.9rem] font-medium p-0 mb-6 transition-colors hover:text-accent2" onClick={() => setStep(1)} type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isRTL ? "rotate(180deg)" : undefined }}>
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            {t.otpBack}
          </button>

          <div className="text-center mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <h2 className="text-appText m-0 mb-1 text-[1.3rem] font-bold">{t.otpTitle}</h2>
            <p className="text-muted text-[0.92rem] m-0 leading-relaxed">{t.otpSubtitle}<br /><strong className="text-appText">{email}</strong></p>
          </div>

          {error && <div className="bg-red-500/10 text-red-500 px-4 py-3 rounded-lg mb-5 text-[0.88rem] text-center border border-red-500/20 animate-[shakeError_0.4s_ease]">{error}</div>}

          <form onSubmit={handleVerifyEmail} className="flex flex-col">
            <div className="flex gap-2 justify-center mb-6" dir="ltr">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-[44px] h-[52px] sm:w-[52px] sm:h-[60px] text-center text-[1.5rem] font-bold border-2 border-appBorder rounded-xl bg-surface2 text-appText transition-all focus:outline-none focus:border-accent2 focus:bg-surface"
                  required
                  autoFocus={i === 0}
                />
              ))}
            </div>
            <button
              type="submit"
              className="w-full p-3 bg-accent2 text-white border-none rounded-[10px] text-[1rem] font-semibold cursor-pointer transition-all mt-2 shadow-sm hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading || otp.join('').length < 6}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2"><span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin"></span> {t.otpVerifying}</span>
              ) : (
                t.otpValidate
              )}
            </button>
            <div className="text-center mt-5 text-[0.88rem] text-muted">
              {timer > 0 ? (
                <span>{t.otpResendIn} <strong className="text-appText">{timer}s</strong></span>
              ) : (
                <button type="button" className="bg-transparent border-none text-accent2 font-semibold p-0 text-[0.88rem] cursor-pointer transition-colors hover:text-accent hover:underline" onClick={handleResendOtp} disabled={loading}>
                  {t.otpResend}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-appBg p-4 font-sans overflow-hidden z-[1000] scrollbar-none" dir={isRTL ? "rtl" : "ltr"}>
      {/* Decorative background elements */}
      <div className="absolute rounded-full blur-[80px] z-0 opacity-60 animate-[spinBlobs_20s_linear_infinite] -top-[20%] -right-[10%] w-[50vw] h-[50vw] bg-accent2/20"></div>
      <div className="absolute rounded-full blur-[80px] z-0 opacity-60 animate-[spinBlobs_25s_linear_infinite_reverse] -bottom-[20%] -left-[10%] w-[45vw] h-[45vw] bg-accent/20"></div>

      <div className="bg-surface p-5 sm:p-6 rounded-[16px] sm:rounded-[20px] shadow-lg w-full max-w-[480px] relative animate-[cardSlideUp_0.5s_ease-out] z-[2]">
        <div className="flex items-center justify-between mb-6">
          {onBack && (
            <button className="inline-flex items-center gap-1 bg-transparent border-none text-muted cursor-pointer text-[0.9rem] font-medium p-0 transition-colors hover:text-accent2" onClick={onBack} type="button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isRTL ? "rotate(180deg)" : undefined }}>
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              {t.authBack}
            </button>
          )}
          {/* Language toggle */}
          <button
            className="px-3 py-1.5 rounded-full text-[0.8rem] font-medium transition-all duration-300 border border-appBorder text-muted hover:border-accent2 hover:text-accent2"
            onClick={() => onLanguageChange && onLanguageChange(language === "ar" ? "fr" : "ar")}
          >
            {language === "ar" ? "FR" : "عربي"}
          </button>
        </div>

        <div className="text-center mb-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${mode === 'login' ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600' : 'bg-gradient-to-br from-green-100 to-green-200 text-green-600'}`}>
            {mode === 'login' ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            )}
          </div>
          <h2 className="text-appText m-0 mb-1 text-[1.3rem] font-bold">{mode === 'login' ? t.authLogin : t.authRegister}</h2>
          <p className="text-muted text-[0.92rem] m-0 leading-relaxed">{mode === 'login' ? t.authLoginSubtitle : t.authRegisterSubtitle}</p>
        </div>

        {/* Mode toggle tabs */}
        <div className="flex gap-0 mb-3 bg-surface2 rounded-xl p-1">
          <button
            className={`flex-1 py-2 px-4 border-none rounded-[10px] text-[0.92rem] font-semibold cursor-pointer transition-all bg-transparent text-muted hover:text-appText ${mode === 'login' ? 'bg-surface text-appText shadow-sm hover:text-appText' : ''}`}
            onClick={() => setMode('login')}
            type="button"
          >
            {t.authLoginTab}
          </button>
          <button
            className={`flex-1 py-2 px-4 border-none rounded-[10px] text-[0.92rem] font-semibold cursor-pointer transition-all bg-transparent text-muted hover:text-appText ${mode === 'register' ? 'bg-surface text-appText shadow-sm hover:text-appText' : ''}`}
            onClick={() => setMode('register')}
            type="button"
          >
            {t.authRegisterTab}
          </button>
        </div>

        {error && <div className="bg-red-500/10 text-red-500 px-4 py-3 rounded-lg mb-5 text-[0.88rem] text-center border border-red-500/20 animate-[shakeError_0.4s_ease]">{error}</div>}

        {mode === 'register' ? (
          <form onSubmit={handleRegister} className="flex flex-col gap-0" id="register-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-3">
              <div className="mb-2.5">
                <label htmlFor="firstName" className="block mb-1 text-appText font-semibold text-[0.85rem]">{t.authFirstName}</label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t.authFirstNamePlaceholder}
                  required
                  className="w-full py-2 px-3 border-[1.5px] border-appBorder rounded-[10px] text-[0.95rem] bg-surface2 text-appText placeholder-muted transition-all focus:outline-none focus:border-accent2 focus:bg-surface box-border"
                />
              </div>
              <div className="mb-2.5">
                <label htmlFor="lastName" className="block mb-1 text-appText font-semibold text-[0.85rem]">{t.authLastName}</label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t.authLastNamePlaceholder}
                  required
                  className="w-full py-2 px-3 border-[1.5px] border-appBorder rounded-[10px] text-[0.95rem] bg-surface2 text-appText placeholder-muted transition-all focus:outline-none focus:border-accent2 focus:bg-surface box-border"
                />
              </div>
            </div>
            <div className="mb-2.5">
              <label htmlFor="reg-email" className="block mb-1 text-appText font-semibold text-[0.85rem]">{t.authEmail}</label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.authEmailPlaceholder}
                required
                dir={isRTL ? "rtl" : "ltr"}
                className="w-full py-2 px-3 border-[1.5px] border-appBorder rounded-[10px] text-[0.95rem] bg-surface2 text-appText placeholder-muted transition-all focus:outline-none focus:border-accent2 focus:bg-surface box-border"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-3">
              <div className="mb-2.5">
                <label htmlFor="reg-password" className="block mb-1 text-appText font-semibold text-[0.85rem]">{t.authPassword}</label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.authPasswordPlaceholder}
                    required
                    minLength={6}
                    dir={isRTL ? "rtl" : "ltr"}
                    className={`w-full py-2 px-3 ${isRTL ? "pl-[44px]" : "pr-[44px]"} border-[1.5px] border-appBorder rounded-[10px] text-[0.95rem] bg-surface2 text-appText placeholder-muted transition-all focus:outline-none focus:border-accent2 focus:bg-surface box-border`}
                  />
                  <button
                    type="button"
                    className={`absolute ${isRTL ? "left-2.5" : "right-2.5"} top-1/2 -translate-y-1/2 bg-transparent border-none text-slate-400 p-1 flex items-center justify-center cursor-pointer hover:text-slate-600 dark:hover:text-slate-500 transition-colors`}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="mb-2.5">
                <label htmlFor="reg-confirm-password" className="block mb-1 text-appText font-semibold text-[0.85rem]">{t.authConfirmPassword}</label>
                <div className="relative">
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.authConfirmPlaceholder}
                    required
                    minLength={6}
                    dir={isRTL ? "rtl" : "ltr"}
                    className={`w-full py-2 px-3 ${isRTL ? "pl-[44px]" : "pr-[44px]"} border-[1.5px] border-appBorder rounded-[10px] text-[0.95rem] bg-surface2 text-appText placeholder-muted transition-all focus:outline-none focus:border-accent2 focus:bg-surface box-border`}
                  />
                  <button
                    type="button"
                    className={`absolute ${isRTL ? "left-2.5" : "right-2.5"} top-1/2 -translate-y-1/2 bg-transparent border-none text-slate-400 p-1 flex items-center justify-center cursor-pointer hover:text-slate-600 dark:hover:text-slate-500 transition-colors`}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <button type="submit" className="w-full p-2.5 bg-accent2 text-white border-none rounded-[10px] text-[1rem] font-semibold cursor-pointer transition-all mt-1 shadow-sm hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none" disabled={loading || !firstName || !lastName || !email || !password || !confirmPassword}>
              {loading ? (
                <span className="inline-flex items-center gap-2"><span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin"></span> {t.authRegistering}</span>
              ) : (
                t.authRegisterButton
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-0" id="login-form">
            <div className="mb-2.5">
              <label htmlFor="login-email" className="block mb-1 text-appText font-semibold text-[0.85rem]">{t.authEmail}</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.authEmailPlaceholder}
                required
                dir={isRTL ? "rtl" : "ltr"}
                className="w-full py-2 px-3 border-[1.5px] border-appBorder rounded-[10px] text-[0.95rem] bg-surface2 text-appText placeholder-muted transition-all focus:outline-none focus:border-accent2 focus:bg-surface box-border"
              />
            </div>
            <div className="mb-2.5">
              <label htmlFor="login-password" className="block mb-1 text-appText font-semibold text-[0.85rem]">{t.authPassword}</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.authPasswordPlaceholder}
                  required
                  dir={isRTL ? "rtl" : "ltr"}
                  className={`w-full py-2 px-3 ${isRTL ? "pl-[44px]" : "pr-[44px]"} border-[1.5px] border-appBorder rounded-[10px] text-[0.95rem] bg-surface2 text-appText placeholder-muted transition-all focus:outline-none focus:border-accent2 focus:bg-surface box-border`}
                />
                <button
                  type="button"
                  className={`absolute ${isRTL ? "left-2.5" : "right-2.5"} top-1/2 -translate-y-1/2 bg-transparent border-none text-slate-400 p-1 flex items-center justify-center cursor-pointer hover:text-slate-600 dark:hover:text-slate-500 transition-colors`}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" className="w-full p-2.5 bg-accent2 text-white border-none rounded-[10px] text-[1rem] font-semibold cursor-pointer transition-all mt-1 shadow-sm hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none" disabled={loading || !email || !password}>
              {loading ? (
                <span className="inline-flex items-center gap-2"><span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin"></span> {t.authLoggingIn}</span>
              ) : (
                t.authLoginButton
              )}
            </button>
          </form>
        )}

        <div className="text-center mt-3 pt-3 border-t border-appBorder">
          {mode === 'login' ? (
            <p className="text-muted text-[0.85rem] m-0">{t.authNewUser} <button type="button" className="bg-transparent border-none text-accent2 font-semibold cursor-pointer text-[0.85rem] p-0 transition-colors hover:text-accent hover:underline" onClick={switchMode}>{t.authCreateAccount}</button></p>
          ) : (
            <p className="text-muted text-[0.85rem] m-0">{t.authHaveAccount} <button type="button" className="bg-transparent border-none text-accent2 font-semibold cursor-pointer text-[0.85rem] p-0 transition-colors hover:text-accent hover:underline" onClick={switchMode}>{t.authSignIn}</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
