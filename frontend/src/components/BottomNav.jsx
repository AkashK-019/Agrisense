import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, ScanLine, TrendingUp, CloudSun, LayoutGrid, X,
  Sprout, ShieldAlert, BookOpen, Mic, Settings, Info, ChevronRight
} from 'lucide-react';
import '../styles/BottomNav.css';

const TABS = [
  { id: 'dashboard',    icon: LayoutDashboard, en: 'Home',        mr: 'मुख्य' },
  { id: 'cropHealth',   icon: ScanLine,        en: 'Crop Doctor', mr: 'रोग निदान' },
  { id: 'marketPrices', icon: TrendingUp,      en: 'Prices',      mr: 'भाव' },
  { id: 'soilWeather',  icon: CloudSun,        en: 'Weather',     mr: 'हवामान' },
];

const MORE_ITEMS = [
  { id: 'myFarm',          icon: Sprout,      en: 'My Farm',               mr: 'माझे शेत' },
  { id: 'riskAlerts',      icon: ShieldAlert, en: 'Risk Alerts',           mr: 'धोका इशारे' },
  { id: 'advisory',        icon: BookOpen,    en: 'Crop Advisory',         mr: 'कृषी सल्ला' },
  { id: 'voiceAccess',     icon: Mic,         en: 'Voice Help',            mr: 'आवाज मदत' },
  { id: 'profileSettings', icon: Settings,    en: 'Profile & Farm Settings', mr: 'प्रोफाइल व शेत सेटिंग्ज' },
  { id: 'aboutProject',    icon: Info,        en: 'About AgriSense',       mr: 'AgriSense बद्दल' },
];

export const BottomNav = () => {
  const { currentView, setCurrentView, isAuthenticated, language, isMobileMenuOpen, setIsMobileMenuOpen } = useApp();
  if (!isAuthenticated) return null;

  const isMr = language === 'mr';
  const label = (x) => (isMr ? x.mr : x.en);
  const moreActive = isMobileMenuOpen || MORE_ITEMS.some(m => m.id === currentView);

  const go = (id) => { setIsMobileMenuOpen(false); setCurrentView(id); };

  return (
    <>
      {isMobileMenuOpen && (
        <>
          <div className="bn-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="bn-sheet" role="dialog" aria-label={isMr ? 'सर्व साधने' : 'All tools'}>
            <h2>{isMr ? 'सर्व साधने' : 'All tools'}</h2>
            <ul>
              {MORE_ITEMS.map(m => {
                const Icon = m.icon;
                const active = currentView === m.id;
                return (
                  <li key={m.id}>
                    <button type="button" className={`bn-row ${active ? 'active' : ''}`} onClick={() => go(m.id)}>
                      <span className="bn-row-icon"><Icon size={22} /></span>
                      <span className="bn-row-label">{label(m)}</span>
                      <ChevronRight size={20} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}

      <nav className="bn" aria-label={isMr ? 'मुख्य मेनू' : 'Main menu'}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = currentView === tab.id && !isMobileMenuOpen;
          return (
            <button key={tab.id} type="button" className={`bn-item ${active ? 'active' : ''}`}
              aria-current={active ? 'page' : undefined} onClick={() => go(tab.id)}>
              <Icon size={24} strokeWidth={active ? 2.3 : 1.8} />
              <span>{label(tab)}</span>
            </button>
          );
        })}
        <button type="button" className={`bn-item ${moreActive ? 'active' : ''}`}
          aria-expanded={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} strokeWidth={2.3} /> : <LayoutGrid size={24} strokeWidth={moreActive ? 2.3 : 1.8} />}
          <span>{isMr ? 'अजून' : 'More'}</span>
        </button>
      </nav>
    </>
  );
};

export default BottomNav;