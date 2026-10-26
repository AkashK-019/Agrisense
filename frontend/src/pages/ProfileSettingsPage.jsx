import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, Sliders, Bell, Download,
  LogOut, Loader2, RotateCcw, Shield, Check, Globe, MapPin, Layers
} from 'lucide-react';
import '../styles/ProfileSettingsPage.css';

export const ProfileSettingsPage = () => {
  const { 
    farmer, language, setLanguage, 
    areaUnit, setAreaUnit, weightUnit, setWeightUnit,
    updateFarmerProfile, logout, setCurrentView, 
    showToast, t,
    allFarms, allCrops, soilReadings, cropAnalyses, riskAlerts, notifications
  } = useApp();

  const [name, setName] = useState(farmer?.name || '');
  const [phone] = useState(farmer?.phone || '');
  const [village, setVillage] = useState(farmer?.village || 'Chiplun');
  const [district, setDistrict] = useState(farmer?.district || 'Ratnagiri');
  const [saving, setSaving] = useState(false);

  const [notifSms, setNotifSms] = useState(true);
  const [notifDisease, setNotifDisease] = useState(true);
  const [notifMandi, setNotifMandi] = useState(true);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateFarmerProfile({ name, village, district, language, areaUnit, weightUnit });
    } catch (err) {
      showToast(err.message || 'Failed to save profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    const archive = {
      exportedAt: new Date().toISOString(),
      farmer: farmer ? { name: farmer.name, phone: farmer.phone, village: farmer.village, district: farmer.district } : null,
      farms: allFarms,
      crops: allCrops,
      soilReadings,
      cropAnalyses,
      riskAlerts,
      notifications,
    };
    const blob = new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agrisense-farm-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast(language === 'mr' ? 'डेटा एक्सपोर्ट झाला.' : 'Farm telemetry data exported.');
  };

  const resetPreferences = () => {
    setLanguage('en');
    setAreaUnit('acres');
    setWeightUnit('quintal');
    showToast(language === 'mr' ? 'सेटिंग्ज मूळ स्थितीत आणल्या.' : 'Display preferences reset to defaults.', 'info');
  };

  return (
    <div className="profile-settings-wrapper">
      
      {/* Page Header */}
      <div className="ps-page-header">
        <div className="ps-header-left">
          <div className="ps-badge">
            <User size={14} className="text-emerald-700" />
            <span>Farmer Account & System Preferences</span>
          </div>
          <h1 className="ps-title">
            {t.profileSettings}
          </h1>
          <p className="ps-subtitle">
            {language === 'mr' 
              ? 'शेतकरी प्रोफाइल, भाषा (मराठी/हिंदी/इंग्रजी), मोजमाप युनिट्स आणि डेटा बॅकअप सेटिंग्ज.' 
              : language === 'hi'
                ? 'किसान प्रोफाइल, भाषा (हिंदी/मराठी/अंग्रेजी), मापन इकाइयां और डेटा बैकअप सेटिंग्स।'
                : 'Manage farmer credentials, trilingual display preferences, agricultural units, and JSON telemetry backup.'}
          </p>
        </div>

        <button onClick={logout} className="ps-btn-signout">
          <LogOut size={14} />
          <span>{t.signOut}</span>
        </button>
      </div>

      {/* Main Settings Form Grid */}
      <div className="ps-main-grid">
        
        {/* Left: Farmer Profile Form */}
        <div className="ps-card">
          <div className="ps-card-header">
            <div className="flex items-center gap-2">
              <User size={18} className="text-emerald-700" />
              <h2 className="text-sm font-extrabold text-slate-900">
                Farmer Identity & Location
              </h2>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Verified Farmer
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="ps-form">
            <div className="mb-3">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Farmer Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sandeep Patil"
                className="ps-input"
                required
              />
            </div>

            <div className="mb-3">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Registered Mobile Number</label>
              <input
                type="tel"
                value={phone}
                disabled
                className="ps-input disabled"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Phone number is locked to your account PIN authentication.</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Village (गाव)</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="e.g. Chiplun"
                  className="ps-input"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">District (जिल्हा)</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="ps-input"
                >
                  <option value="Ratnagiri">Ratnagiri (रत्नागिरी)</option>
                  <option value="Raigad">Raigad (रायगड)</option>
                  <option value="Sindhudurg">Sindhudurg (सिंधुदुर्ग)</option>
                  <option value="Thane">Thane (ठाणे)</option>
                  <option value="Palghar">Palghar (पालघर)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="ps-btn-save"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Right: Trilingual Language & Agricultural Units */}
        <div className="ps-card">
          <div className="ps-card-header">
            <div className="flex items-center gap-2">
              <Sliders size={18} className="text-emerald-700" />
              <h2 className="text-sm font-extrabold text-slate-900">
                Display Language & Units
              </h2>
            </div>
            <button onClick={resetPreferences} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>

          <div className="ps-form">
            
            {/* Language Selector */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Application Language (भाषा)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: 'mr', label: 'मराठी' },
                  { code: 'hi', label: 'हिंदी' },
                  { code: 'en', label: 'English' }
                ].map(l => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code)}
                    className={`ps-unit-pill ${language === l.code ? 'active' : ''}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Area Unit */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Farm Area Units
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: 'acres', label: 'Acres (एकर)' },
                  { code: 'gunthas', label: 'Gunthas (गुंठे)' },
                  { code: 'hectares', label: 'Hectares (हेक्टर)' }
                ].map(u => (
                  <button
                    key={u.code}
                    type="button"
                    onClick={() => setAreaUnit(u.code)}
                    className={`ps-unit-pill ${areaUnit === u.code ? 'active' : ''}`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight Unit */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Mandi Price Weight Units
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { code: 'quintal', label: 'Quintal (₹/qtl)' },
                  { code: 'kg', label: 'Kilogram (₹/kg)' }
                ].map(w => (
                  <button
                    key={w.code}
                    type="button"
                    onClick={() => setWeightUnit(w.code)}
                    className={`ps-unit-pill ${weightUnit === w.code ? 'active' : ''}`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Data Export Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Offline Telemetry Backup</span>
                <span className="text-[11px] text-slate-400">Export farm readings & scans as JSON</span>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                className="ps-btn-export"
              >
                <Download size={14} />
                <span>Export JSON</span>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default ProfileSettingsPage;