import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Shovel, ScanLine, CloudSun,
  AlertTriangle, BookOpen, TrendingUp, Mic, Settings,
  Info, X, LogOut, Globe, Check, ChevronRight, LogIn
} from 'lucide-react';
import '../styles/MobileToolsModal.css';

export const MobileToolsModal = () => {
  const {
    isMobileMenuOpen, setIsMobileMenuOpen,
    currentView, setCurrentView,
    isAuthenticated, language, setLanguage,
    farmer, activeFarm, logout, setIsAuthModalOpen
  } = useApp();

  if (!isMobileMenuOpen) return null;

  const handleNavigate = (viewId) => {
    setCurrentView(viewId);
    setIsMobileMenuOpen(false);
  };

  const farmerInitial = farmer?.name ? farmer.name.charAt(0).toUpperCase() : 'A';

  const TOOLS = [
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      labelEn: 'Farm Dashboard',
      labelMr: 'मुख्य डॅशबोर्ड',
      tagEn: 'Daily Overview',
      tagMr: 'दैनिक विहंगावलोकन',
      color: '#059669',
      bg: '#ecfdf5'
    },
    {
      id: 'cropHealth',
      icon: ScanLine,
      labelEn: 'Crop Disease Check',
      labelMr: 'पीक रोग निदान',
      tagEn: 'Leaf Photo Doctor',
      tagMr: 'पानावरील रोग तपासणी',
      color: '#059669',
      bg: '#ecfdf5'
    },
    {
      id: 'marketPrices',
      icon: TrendingUp,
      labelEn: 'Market Prices',
      labelMr: 'बाजार भाव',
      tagEn: 'APMC price forecast',
      tagMr: 'APMC भाव अंदाज',
      color: '#d97706',
      bg: '#fffbeb'
    },
    {
      id: 'soilWeather',
      icon: CloudSun,
      labelEn: 'Soil & Weather IoT',
      labelMr: 'माती व हवामान IoT',
      tagEn: 'Field Sensors',
      tagMr: 'शेत सेन्सर्स डेटा',
      color: '#0284c7',
      bg: '#f0f9ff'
    },
    {
      id: 'riskAlerts',
      icon: AlertTriangle,
      labelEn: 'Disease & Weather Risks',
      labelMr: 'हवामान व रोग जोखीम',
      tagEn: 'Early Warnings',
      tagMr: 'पूर्वसूचना इशारे',
      color: '#dc2626',
      bg: '#fef2f2'
    },
    {
      id: 'voiceAccess',
      icon: Mic,
      labelEn: 'Voice Assistant',
      labelMr: 'व्हॉइस सहाय्यक',
      tagEn: 'Marathi & Hindi Voice',
      tagMr: 'मराठी व्हॉइस मदत',
      color: '#7c3aed',
      bg: '#f5f3ff'
    },
    {
      id: 'myFarm',
      icon: Shovel,
      labelEn: 'My Farm & Plots',
      labelMr: 'माझे शेत व पिके',
      tagEn: 'Plot Management',
      tagMr: 'शेत व पिके तपशील',
      color: '#0d9488',
      bg: '#f0fdfa'
    },
    {
      id: 'advisory',
      icon: BookOpen,
      labelEn: 'Crop Advisory Guide',
      labelMr: 'कृषी मार्गदर्शक',
      tagEn: 'Package of Practices',
      tagMr: 'कृषी सल्ला व वेळापत्रक',
      color: '#4f46e5',
      bg: '#eef2ff'
    }
  ];

  return (
    <div className="mobile-modal-overlay" onClick={() => setIsMobileMenuOpen(false)}>
      <div className="mobile-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Top Handle */}
        <div className="mobile-modal-handle-area">
          <div className="mobile-modal-handle" />
        </div>

        {/* Modal Header */}
        <div className="mobile-modal-header">
          <div className="mobile-modal-header-info">
            <h3 className="mobile-modal-title">
              {language === 'mr' ? 'AgriSense साधने' : 'AgriSense Hub'}
            </h3>
            <span className="mobile-modal-subtitle">
              {language === 'mr' ? 'जलद नेव्हिगेशन व कृषी सेवा' : 'Quick Navigation & Services'}
            </span>
          </div>
          <button
            type="button"
            className="mobile-modal-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="mobile-modal-content">
          {/* User Profile */}
          {isAuthenticated ? (
            <div
              className="mobile-user-card"
              onClick={() => handleNavigate('profileSettings')}
              role="button"
              tabIndex={0}
            >
              <div className="mobile-user-avatar">{farmerInitial}</div>
              <div className="mobile-user-info">
                <div className="mobile-user-name-row">
                  <span className="mobile-user-name">{farmer?.name || 'Farmer'}</span>
                  <span className="mobile-user-status-pill">Active</span>
                </div>
                <span className="mobile-user-meta">
                  {activeFarm ? `${activeFarm.farmName} · ${activeFarm.village || ''}` : `+91 ${farmer?.phone || '9876543210'}`}
                </span>
              </div>
              <ChevronRight size={18} className="mobile-user-chevron" />
            </div>
          ) : (
            <div className="mobile-guest-card">
              <div className="mobile-guest-text">
                <span className="mobile-guest-title">
                  {language === 'mr' ? 'AgriSense वर आपले स्वागत आहे' : 'Welcome to AgriSense'}
                </span>
                <span className="mobile-guest-subtitle">
                  {language === 'mr' ? 'सर्व AI वैशिष्ट्यांचा वापर करण्यासाठी लॉगिन करा' : 'Sign in to access AI diagnosis & farm alerts'}
                </span>
              </div>
              <button
                type="button"
                className="mobile-guest-signin-btn"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsAuthModalOpen(true);
                }}
              >
                <LogIn size={15} />
                <span>{language === 'mr' ? 'लॉगिन करा' : 'Sign In'}</span>
              </button>
            </div>
          )}

          {/* Section: Platform */}
          <div className="mobile-section-block">
            <span className="mobile-section-label">
              {language === 'mr' ? 'कृषी व AI टूल्स' : 'Farm Tools & AI Intelligence'}
            </span>

            <div className="mobile-tools-grid">
              {TOOLS.map((tool) => {
                const Icon = tool.icon;
                const isActive = currentView === tool.id;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    className={`mobile-tool-card ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavigate(tool.id)}
                  >
                    <div className="mobile-tool-card-top">
                      <div
                        className="mobile-tool-icon-wrap"
                        style={{ background: tool.bg, color: tool.color }}
                      >
                        <Icon size={19} strokeWidth={2} />
                      </div>
                    </div>
                    <div className="mobile-tool-card-body">
                      <span className="mobile-tool-title">
                        {language === 'mr' ? tool.labelMr : tool.labelEn}
                      </span>
                      <span className="mobile-tool-tag">
                        {language === 'mr' ? tool.tagMr : tool.tagEn}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Preferences */}
          <div className="mobile-section-block">
            <span className="mobile-section-label">
              {language === 'mr' ? 'खाते व माहिती' : 'Preferences & Info'}
            </span>

            <div className="mobile-nav-links-list">
              <button
                type="button"
                className={`mobile-nav-link-item ${currentView === 'profileSettings' ? 'active' : ''}`}
                onClick={() => handleNavigate('profileSettings')}
              >
                <div className="mobile-nav-link-left">
                  <div className="mobile-nav-icon-box">
                    <Settings size={16} />
                  </div>
                  <span className="mobile-nav-link-text">
                    {language === 'mr' ? 'प्रोफाइल व शेत व्यवस्थापन' : 'Profile & Farm Settings'}
                  </span>
                </div>
                <ChevronRight size={16} className="mobile-nav-link-arrow" />
              </button>

              <button
                type="button"
                className={`mobile-nav-link-item ${currentView === 'aboutProject' ? 'active' : ''}`}
                onClick={() => handleNavigate('aboutProject')}
              >
                <div className="mobile-nav-link-left">
                  <div className="mobile-nav-icon-box">
                    <Info size={16} />
                  </div>
                  <span className="mobile-nav-link-text">
                    {language === 'mr' ? 'प्रकल्प माहिती (About Project)' : 'About AgriSense Platform'}
                  </span>
                </div>
                <ChevronRight size={16} className="mobile-nav-link-arrow" />
              </button>
            </div>
          </div>

          {/* Section: Language */}
          <div className="mobile-lang-container">
            <div className="mobile-lang-header">
              <Globe size={14} className="mobile-lang-icon" />
              <span>{language === 'mr' ? 'अ‍ॅप भाषा निवडा' : 'Display Language'}</span>
            </div>
            <div className="mobile-lang-tabs">
              <button
                type="button"
                className={`mobile-lang-tab ${language === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
              >
                <span>English</span>
                {language === 'en' && <Check size={14} className="mobile-lang-check" />}
              </button>
              <button
                type="button"
                className={`mobile-lang-tab ${language === 'mr' ? 'active' : ''}`}
                onClick={() => setLanguage('mr')}
              >
                <span>मराठी</span>
                {language === 'mr' && <Check size={14} className="mobile-lang-check" />}
              </button>
            </div>
          </div>

          {/* Sign Out */}
          {isAuthenticated && (
            <button
              type="button"
              className="mobile-signout-btn"
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
            >
              <LogOut size={16} />
              <span>{language === 'mr' ? 'खात्यातून लॉगआउट करा' : 'Sign Out of Account'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileToolsModal;
