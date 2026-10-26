import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell, Globe, ChevronDown, LogOut, Settings, Info, User,
  Sprout, BookOpen, Mic
} from 'lucide-react';
import logoImg from '../assets/Logo.jpg';
import '../styles/Navbar.css';

/* Desktop top bar: 5 main links + "More" menu */
const MAIN_LINKS = [
  { id: 'dashboard',    en: 'Dashboard',      mr: 'डॅशबोर्ड' },
  { id: 'cropHealth',   en: 'Crop Doctor',    mr: 'रोग निदान' },
  { id: 'marketPrices', en: 'Market Prices',  mr: 'बाजार भाव' },
  { id: 'soilWeather',  en: 'Weather & Soil', mr: 'हवामान व माती' },
  { id: 'riskAlerts',   en: 'Risk Alerts',    mr: 'धोका इशारे' },
];
const MORE_LINKS = [
  { id: 'myFarm',      en: 'My Farm',    mr: 'माझे शेत',   icon: Sprout },
  { id: 'advisory',    en: 'Advisory',   mr: 'कृषी सल्ला', icon: BookOpen },
  { id: 'voiceAccess', en: 'Voice Help', mr: 'आवाज मदत',   icon: Mic },
];

export const Navbar = ({ isLandingMode = false }) => {
  const {
    language, setLanguage, farmer,
    notifications, markNotificationAsRead, clearAllNotifications,
    currentView, setCurrentView, isAuthenticated, setIsAuthModalOpen, logout
  } = useApp();

  const isMr = language === 'mr';
  const t = (en, mr) => (isMr ? mr : en);
  const [open, setOpen] = useState(null); // 'notif' | 'profile' | 'more' | null

  useEffect(() => {
    const onDown = (e) => { if (!e.target.closest('[data-nb-pop]')) setOpen(null); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(null); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, []);

  const go = (id) => { setOpen(null); setCurrentView(id); };
  const toggle = (name) => setOpen(o => (o === name ? null : name));

  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;
  const initial = farmer?.name ? farmer.name.charAt(0).toUpperCase() : null;
  const guestMode = isLandingMode || !isAuthenticated;
  const moreActive = MORE_LINKS.some(l => l.id === currentView);
  const homeId = isAuthenticated ? 'dashboard' : 'landing';
  const isHomeActive = isAuthenticated ? (currentView === 'dashboard' || currentView === 'landing') : currentView === 'landing';

  return (
    <header className="nb">
      <div className="nb-in">
        <button type="button" className="nb-brand" onClick={() => go(homeId)} aria-label="AgriSense">
          <span className="nb-logo"><img src={logoImg} alt="" /></span>
          <span className="nb-name">AgriSense</span>
        </button>

        {guestMode ? (
          <nav className="nb-links nb-links-guest" aria-label="Main">
            <button type="button" className={`nb-link nb-hide-sm ${isHomeActive ? 'active' : ''}`} aria-current={isHomeActive ? 'page' : undefined} onClick={() => go('landing')}>
              {t('Home', 'मुख्य')}
            </button>
            <button type="button" className={`nb-link ${currentView === 'aboutProject' ? 'active' : ''}`} aria-current={currentView === 'aboutProject' ? 'page' : undefined} onClick={() => go('aboutProject')}>
              {t('About', 'माहिती')}
            </button>
          </nav>
        ) : (
          <nav className="nb-links nb-links-app" aria-label="Main">
            {MAIN_LINKS.map(l => (
              <button key={l.id} type="button" className={`nb-link ${currentView === l.id ? 'active' : ''}`}
                aria-current={currentView === l.id ? 'page' : undefined} onClick={() => go(l.id)}>
                {isMr ? l.mr : l.en}
              </button>
            ))}
            <div className="nb-pop-wrap nb-more" data-nb-pop>
              <button type="button" className={`nb-link ${moreActive ? 'active' : ''}`} aria-expanded={open === 'more'} onClick={() => toggle('more')}>
                {t('More', 'अजून')}<ChevronDown size={16} className={open === 'more' ? 'flip' : ''} />
              </button>
              {open === 'more' && (
                <div className="nb-pop nb-pop-menu">
                  {MORE_LINKS.map(l => {
                    const Icon = l.icon;
                    return (
                      <button key={l.id} type="button" className={`nb-item ${currentView === l.id ? 'active' : ''}`} onClick={() => go(l.id)}>
                        <Icon size={20} /><span>{isMr ? l.mr : l.en}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        )}

        <div className="nb-right">
          {/* Language: segmented on larger screens, one button on phones */}
          <div className="nb-lang" role="group" aria-label="Language">
            <button type="button" className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>EN</button>
            <button type="button" className={language === 'mr' ? 'active' : ''} onClick={() => setLanguage('mr')}>मराठी</button>
          </div>
          <button type="button" className="nb-lang-one" onClick={() => setLanguage(isMr ? 'en' : 'mr')} aria-label="Change language">
            <Globe size={16} /><span>{isMr ? 'EN' : 'मराठी'}</span>
          </button>

          {isAuthenticated && (
            <>
              <div className="nb-pop-wrap" data-nb-pop>
                <button type="button" className="nb-icon-btn" onClick={() => toggle('notif')} aria-label={t('Notifications', 'सूचना')} aria-expanded={open === 'notif'}>
                  <Bell size={20} />
                  {unreadCount > 0 && <span className="nb-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </button>
                {open === 'notif' && (
                  <div className="nb-pop nb-pop-notif">
                    <div className="nb-pop-head">
                      <strong>{t('Notifications', 'सूचना')}</strong>
                      {notifications?.length > 0 && (
                        <button type="button" className="nb-text-btn" onClick={clearAllNotifications}>{t('Clear all', 'सर्व साफ करा')}</button>
                      )}
                    </div>
                    <div className="nb-notif-list">
                      {!notifications || notifications.length === 0 ? (
                        <p className="nb-empty">{t('No new notifications', 'कोणत्याही नवीन सूचना नाहीत')}</p>
                      ) : (
                        notifications.slice(0, 5).map(n => (
                          <button key={n._id} type="button" className={`nb-notif ${n.read ? '' : 'unread'}`} onClick={() => markNotificationAsRead(n._id)}>
                            <strong>{n.title}</strong>
                            <span>{n.message}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="nb-pop-wrap" data-nb-pop>
                <button type="button" className="nb-avatar" onClick={() => toggle('profile')} aria-label={t('Profile', 'प्रोफाइल')} aria-expanded={open === 'profile'}>
                  {initial || <User size={20} />}
                </button>
                {open === 'profile' && (
                  <div className="nb-pop nb-pop-menu nb-pop-profile">
                    <div className="nb-who">
                      <span className="nb-avatar nb-avatar-sm">{initial || <User size={18} />}</span>
                      <div>
                        <strong>{farmer?.name || t('Farmer', 'शेतकरी')}</strong>
                        {farmer?.phone && <span>+91 {farmer.phone}</span>}
                      </div>
                    </div>
                    <button type="button" className="nb-item" onClick={() => go('profileSettings')}>
                      <Settings size={20} /><span>{t('Profile & farm settings', 'प्रोफाइल व शेत सेटिंग्ज')}</span>
                    </button>
                    <button type="button" className="nb-item" onClick={() => go('aboutProject')}>
                      <Info size={20} /><span>{t('About AgriSense', 'AgriSense बद्दल')}</span>
                    </button>
                    <button type="button" className="nb-item nb-item-out" onClick={() => { setOpen(null); logout(); }}>
                      <LogOut size={20} /><span>{t('Sign out', 'लॉगआउट करा')}</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;