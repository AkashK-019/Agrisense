import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getToken, removeToken,
  authApi, farmsApi, cropsApi, soilApi,
  cropAnalysesApi, riskAlertsApi, advisoriesApi,
  marketPricesApi, notificationsApi,
} from '../services/api';
import { translations } from '../utils/translations';

const AppContext = createContext(null);

const VOICE_KEY = 'agrisense_voice_queries';

const VIEW_IDS = [
  'landing', 'dashboard', 'myFarm', 'cropHealth', 'soilWeather', 'riskAlerts',
  'advisory', 'marketPrices', 'voiceAccess', 'profileSettings', 'aboutProject',
];
const readHash = () => {
  const raw = window.location.hash.replace(/^#\/?/, '');
  if (!raw) return 'landing';
  return VIEW_IDS.includes(raw) ? raw : null;
};

export const AppProvider = ({ children }) => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [farmer, setFarmer] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // UI State
  const [currentView, setCurrentViewState] = useState(() => readHash() || 'landing');

  const setCurrentView = useCallback((view, options = {}) => {
    setCurrentViewState(view);
    if (VIEW_IDS.includes(view)) {
      const hash = `#/${view}`;
      if (window.location.hash !== hash) {
        window.history[options.replace ? 'replaceState' : 'pushState'](null, '', hash);
      }
    }
  }, []);

  // Browser Back
  useEffect(() => {
    const onPopState = () => {
      const view = readHash();
      if (view) setCurrentViewState(view);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Settings
  const [language, setLanguageState] = useState(() => localStorage.getItem('agrisense_language') || 'en');
  const [areaUnit, setAreaUnitState] = useState(() => localStorage.getItem('agrisense_area_unit') || 'acres');
  const [weightUnit, setWeightUnitState] = useState(() => localStorage.getItem('agrisense_weight_unit') || 'quintal');

  // Farm /
  const [allFarms, setAllFarms] = useState([]);
  const [activeFarmId, setActiveFarmIdState] = useState(() => localStorage.getItem('agrisense_active_farm_id') || null);
  const [soilReadings, setSoilReadings] = useState([]);
  const [weatherReadings, setWeatherReadings] = useState([]);
  const [cropAnalyses, setCropAnalyses] = useState([]);
  const [riskAlerts, setRiskAlerts] = useState([]);
  const [advisories, setAdvisories] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [allCrops, setAllCrops] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  const [voiceQueries, setVoiceQueries] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(VOICE_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(VOICE_KEY, JSON.stringify(voiceQueries));
    } catch {/* storage unavailable */}
  }, [voiceQueries]);

  // Toast
  const showToast = (message, type = 'success') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Settings Setters
  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('agrisense_language', lang);
  };
  const setAreaUnit = (unit) => {
    setAreaUnitState(unit);
    localStorage.setItem('agrisense_area_unit', unit);
  };
  const setWeightUnit = (unit) => {
    setWeightUnitState(unit);
    localStorage.setItem('agrisense_weight_unit', unit);
  };

  // Check Token
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthLoading(false);
      return;
    }
    authApi.me()
      .then(({ farmer: f }) => {
        setFarmer(f);
        setIsAuthenticated(true);
      })
      .catch(() => {
        removeToken();
      })
      .finally(() => setAuthLoading(false));
  }, []);

  // Load All
  const loadAllData = useCallback(async () => {
    if (!isAuthenticated) return;
    setDataLoading(true);
    try {
      const [farmsRes, advisoriesRes, marketRes, notifsRes] = await Promise.all([
        farmsApi.getAll(),
        advisoriesApi.getAll(),
        marketPricesApi.getAll(),
        notificationsApi.getAll(),
      ]);
      setAllFarms(farmsRes.farms || []);
      setAdvisories(advisoriesRes.advisories || []);
      setMarketPrices(marketRes.prices || []);
      setNotifications(notifsRes.notifications || []);
    } catch (err) {
      console.error('[loadAllData]', err);
    } finally {
      setDataLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Load Farm-Specific
  const loadFarmData = useCallback(async (farmId) => {
    if (!farmId || !isAuthenticated) return;
    try {
      const [cropsRes, soilRes, analysesRes, alertsRes] = await Promise.all([
        cropsApi.getAll(farmId),
        soilApi.getAll(farmId),
        cropAnalysesApi.getAll(farmId),
        riskAlertsApi.getAll(farmId),
      ]);
      setAllCrops(cropsRes.crops || []);
      setSoilReadings(soilRes.readings || []);
      setCropAnalyses(analysesRes.analyses || []);
      setRiskAlerts(alertsRes.alerts || []);
    } catch (err) {
      console.error('[loadFarmData]', err);
    }
  }, [isAuthenticated]);

  const activeFarm = allFarms.find((f) => (f._id === activeFarmId || f.id === activeFarmId)) || allFarms[0] || null;

  useEffect(() => {
    if (activeFarm?._id || activeFarm?.id) {
      loadFarmData(activeFarm._id || activeFarm.id);
    }
  }, [activeFarm?._id, activeFarm?.id, loadFarmData]);

  const setActiveFarmId = (id) => {
    setActiveFarmIdState(id);
    if (id) {
      localStorage.setItem('agrisense_active_farm_id', id);
    } else {
      localStorage.removeItem('agrisense_active_farm_id');
    }
  };

  // Auth Actions
  const loginSuccess = (farmerData) => {
    setFarmer(farmerData);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    setCurrentView('dashboard');
    showToast(`Welcome back, ${farmerData.name}!`);
  };

  const logout = () => {
    removeToken();
    setFarmer(null);
    setIsAuthenticated(false);
    setAllFarms([]);
    setAllCrops([]);
    setSoilReadings([]);
    setWeatherReadings([]);
    setCropAnalyses([]);
    setRiskAlerts([]);
    setAdvisories([]);
    setMarketPrices([]);
    setNotifications([]);
    setVoiceQueries([]);
    setActiveFarmIdState(null);
    localStorage.removeItem('agrisense_active_farm_id');
    setCurrentView('landing');
    showToast('Logged out successfully.', 'info');
  };

  // Farm Actions
  const addFarm = async (farmData) => {
    const { farm } = await farmsApi.create(farmData);
    setAllFarms((prev) => [farm, ...prev]);
    setActiveFarmId(farm._id);
    showToast(language === 'mr' ? 'नवीन शेत यशस्वीरित्या जोडले!' : 'New farm added successfully!');
    return farm;
  };

  const updateFarm = async (id, farmData) => {
    const { farm } = await farmsApi.update(id, farmData);
    setAllFarms((prev) => prev.map((f) => (f._id === id ? farm : f)));
    showToast(language === 'mr' ? 'शेताचा तपशील जतन केला!' : 'Farm details updated!');
    return farm;
  };

  const deleteFarm = async (id) => {
    try {
      await farmsApi.delete(id);
      const remaining = allFarms.filter((f) => f._id !== id && f.id !== id);
      setAllFarms(remaining);
      if (remaining.length > 0) {
        setActiveFarmId(remaining[0]._id || remaining[0].id);
      } else {
        setActiveFarmId(null);
        setSoilReadings([]);
        setCrops([]);
        setCropAnalyses([]);
      }
      showToast(language === 'mr' ? 'शेत हटवले गेले.' : 'Farm removed.');
      return true;
    } catch (err) {
      showToast(err.message || 'Could not delete farm.', 'warning');
      return false;
    }
  };

  // Soil Readings
  const addSoilReading = async (reading) => {
    const { reading: r } = await soilApi.create({ ...reading, farmId: reading.farmId || activeFarm?._id || activeFarm?.id || null });
    setSoilReadings((prev) => [r, ...prev]);
    showToast(language === 'mr' ? 'मातीची नोंद जतन केली.' : 'Soil reading logged.');
    return r;
  };

  // Crop Analyses
  const addCropAnalysis = async (analysis) => {
    const { analysis: a } = await cropAnalysesApi.create({ ...analysis, farmId: analysis.farmId || activeFarm?._id || activeFarm?.id || null });
    setCropAnalyses((prev) => [a, ...prev]);
    showToast(language === 'mr' ? 'पीक आरोग्य विश्लेषण पूर्ण झाले!' : 'Crop health scan archived!');
    return a;
  };

  // Risk Alerts
  const updateRiskStatus = async (id, status) => {
    const { alert } = await riskAlertsApi.updateStatus(id, status);
    setRiskAlerts((prev) => prev.map((a) => (a._id === id ? alert : a)));
    showToast(`Risk alert updated to ${status}.`);
  };

  // Advisories
  const toggleSaveAdvisory = async (id) => {
    const { saved } = await advisoriesApi.toggleSave(id);
    setAdvisories((prev) =>
      prev.map((a) => (a._id === id ? { ...a, saved } : a))
    );
  };

  // Notifications
  const markNotificationAsRead = async (id) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = async () => {
    await notificationsApi.clearAll();
    setNotifications([]);
    showToast(language === 'mr' ? 'सर्व सूचना साफ केल्या.' : 'All notifications cleared.');
  };

  // Voice Queries
  const addVoiceQuery = (query) => {
    const entry = { id: `vq_${Date.now()}`, ...query };
    setVoiceQueries((prev) => [entry, ...prev].slice(0, 50));
    return entry;
  };

  // Farmer Profile
  const updateFarmerProfile = async (data) => {
    const { farmer: f } = await authApi.updateProfile(data);
    setFarmer(f);
    if (data.language) setLanguage(data.language);
    if (data.areaUnit) setAreaUnit(data.areaUnit);
    if (data.weightUnit) setWeightUnit(data.weightUnit);
    showToast('Profile updated successfully!');
    return f;
  };

  // Derived Values
  const activeCrop = allCrops[0] || null;
  const t = translations[language] || translations.en;

  return (
    <AppContext.Provider
      value={{
        // Auth
        isAuthenticated,
        setIsAuthenticated,
        farmer,
        setFarmer,
        authLoading,
        loginSuccess,
        logout,

        // UI
        currentView,
        setCurrentView,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isMobileMenuOpen,
        setIsMobileMenuOpen,

        // Settings
        language,
        setLanguage,
        areaUnit,
        setAreaUnit,
        weightUnit,
        setWeightUnit,
        t,

        // Data
        dataLoading,
        farmer,
        activeFarm,
        allFarms,
        activeCrop,
        allCrops,
        soilReadings,
        weatherReadings,
        cropAnalyses,
        riskAlerts,
        advisories,
        marketPrices,
        notifications,
        voiceQueries,

        // Actions
        setActiveFarmId,
        loadAllData,
        loadFarmData,
        addFarm,
        updateFarm,
        deleteFarm,
        addSoilReading,
        addCropAnalysis,
        updateRiskStatus,
        toggleSaveAdvisory,
        markNotificationAsRead,
        clearAllNotifications,
        addVoiceQuery,
        updateFarmerProfile,

        // Toasts
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

export default AppContext;