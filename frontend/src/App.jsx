import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/ToastContainer';
import { AuthModal } from './components/AuthModal';
import { ErrorBoundary } from './components/ErrorBoundary';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyFarmPage } from './pages/MyFarmPage';
import { CropHealthPage } from './pages/CropHealthPage';
import { SoilWeatherPage } from './pages/SoilWeatherPage';
import { RiskAlertsPage } from './pages/RiskAlertsPage';
import { AdvisoryPage } from './pages/AdvisoryPage';
import { MarketPricesPage } from './pages/MarketPricesPage';
import { VoiceAccessPage } from './pages/VoiceAccessPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { AboutPage } from './pages/AboutPage';
import { MobileToolsModal } from './components/MobileToolsModal';
import { Sprout } from 'lucide-react';
import './styles/App.css';

const AppContent = () => {
  const { currentView, isAuthenticated, authLoading, setCurrentView, setIsAuthModalOpen } = useApp();

  const isProtectedView = currentView !== 'landing' && currentView !== 'aboutProject';
  const mustSignIn = !authLoading && !isAuthenticated && isProtectedView;

  useEffect(() => {
    if (mustSignIn) {
      setCurrentView('landing', { replace: true });
      setIsAuthModalOpen(true);
    }
  }, [mustSignIn, setCurrentView, setIsAuthModalOpen]);

  if (authLoading) {
    return (
      <div className="app-loading-screen">
        <div className="app-loading-logo">
          <Sprout size={28} color="#ffffff" />
        </div>
        <div className="app-loading-spinner" />
        <p className="app-loading-text">AgriSense</p>
        <style>{`@keyframes app-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (mustSignIn) return null;

  const renderCurrentView = () => {
    if (!isAuthenticated) {
      if (currentView === 'aboutProject') return <AboutPage />;
      return <LandingPage />;
    }
    switch (currentView) {
      case 'landing':         return <LandingPage />;
      case 'dashboard':       return <DashboardPage />;
      case 'myFarm':          return <MyFarmPage />;
      case 'cropHealth':      return <CropHealthPage />;
      case 'soilWeather':     return <SoilWeatherPage />;
      case 'riskAlerts':      return <RiskAlertsPage />;
      case 'advisory':        return <AdvisoryPage />;
      case 'marketPrices':    return <MarketPricesPage />;
      case 'voiceAccess':     return <VoiceAccessPage />;
      case 'profileSettings': return <ProfileSettingsPage />;
      case 'aboutProject':    return <AboutPage />;
      default:                return <DashboardPage />;
    }
  };

  const isLanding = currentView === 'landing' || currentView === 'aboutProject';

  return (
    <div className={`app-container ${currentView === 'landing' ? 'landing-mode-active' : ''}`}>
      {/* Top Navbar */}
      <Navbar isLandingMode={isLanding} />

      {/* Main Body */}
      <div className="app-main-layout">
        <main className={`app-content-container ${isLanding ? 'app-content-landing' : 'app-content-farmer'}`}>
          <ErrorBoundary key={currentView}>
            {renderCurrentView()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom */}
      <BottomNav />

      {/* Overlays & */}
      <MobileToolsModal />
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;