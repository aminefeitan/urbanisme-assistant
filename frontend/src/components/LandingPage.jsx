import React from 'react';
import './LandingPage.css';

export default function LandingPage({ onLogin, onRegister, onGuest }) {
  return (
    <div className="landing-container light-theme-forced">
      {/* Top navigation bar */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <img src="/logo_chatbot.png" alt="UrbanBot Logo" className="nav-logo-img" />
          <span className="nav-brand">UrbanBot</span>
        </div>
        <div className="landing-nav-actions">
          <button className="nav-btn nav-btn-outline" onClick={onLogin} id="landing-login-btn">
            Connexion
          </button>
          <button className="nav-btn nav-btn-primary" onClick={onRegister} id="landing-register-btn">
            S'inscrire
          </button>
        </div>
      </nav>

      <div className="landing-grid">
        <div className="landing-text-section">
          <div className="landing-logo-inline">
            <img src="/logo_chatbot.png" alt="UrbanBot Logo" className="landing-small-logo" />
            <span className="landing-brand">UrbanBot</span>
          </div>
          <h1 className="landing-title">
            Votre Assistant IA en <span className="highlight-text">Urbanisme</span>
          </h1>
          <p className="landing-subtitle">
            Analysez, concevez et comprenez mieux vos territoires grâce à l'intelligence artificielle. Découvrez la loi 12-90 simplement.
          </p>
          <button className="landing-start-btn" onClick={onGuest}>
            Commencez
            <svg className="landing-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
        
        <div className="landing-image-section">
          <div className="image-wrapper">
            <img src="/landing_illustration.png" alt="Illustration Urbanisme" className="landing-illustration" />
          </div>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
    </div>
  );
}
