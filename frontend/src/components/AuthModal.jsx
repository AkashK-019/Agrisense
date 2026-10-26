import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Phone, User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import logoImg from '../assets/Logo.jpg';
import { authApi, setToken } from '../services/api';
import '../styles/AuthModal.css';

export const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, loginSuccess, language } = useApp();
  const [mode, setMode] = useState('login'); 

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const resetForm = () => {
    setName('');
    setPhone('');
    setPin('');
    setError('');
    setShowPin(false);
  };

  const switchMode = (m) => {
    setMode(m);
    resetForm();
  };

  const handleClose = () => {
    setIsAuthModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError(language === 'mr' ? 'कृपया वैध १० अंकी मोबाईल नंबर टाका.' : 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (pin.length < 4) {
      setError(language === 'mr' ? 'पिन किमान ४ अंकांचा असावा.' : 'PIN must be at least 4 digits.');
      return;
    }
    if (mode === 'register' && name.trim().length < 2) {
      setError(language === 'mr' ? 'कृपया तुमचे पूर्ण नाव टाका.' : 'Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (mode === 'login') {
        response = await authApi.login({ phone, pin });
      } else {
        response = await authApi.register({ name: name.trim(), phone, pin, language });
      }
      setToken(response.token);
      loginSuccess(response.farmer);
    } catch (err) {
      setError(err.message || (language === 'mr' ? 'लॉगिन अयशस्वी. कृपया तपशील तपासा.' : 'Something went wrong. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={handleClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>

        {/* Header with */}
        <div className="auth-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="auth-brand-logo-wrap">
              <img src={logoImg} alt="AgriSense Logo" className="auth-brand-logo-img" />
            </div>
            <div>
              <h3 className="auth-title">
                {mode === 'login' 
                  ? (language === 'mr' ? 'AgriSense मध्ये लॉगिन करा' : 'Sign In to AgriSense') 
                  : (language === 'mr' ? 'नवीन शेतकरी नोंदणी' : 'Create Farmer Account')}
              </h3>
              <p className="auth-subtitle">
                {mode === 'login' 
                  ? (language === 'mr' ? 'मोबाईल नंबर आणि पिन टाका' : 'Enter your mobile number and PIN') 
                  : (language === 'mr' ? 'मोफत शेतकरी खाते तयार करा' : 'Register with your mobile number')}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="auth-close-btn" aria-label="Close">
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`auth-tab ${mode === 'login' ? 'auth-tab-active' : ''}`}
          >
            {language === 'mr' ? 'लॉगिन' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`auth-tab ${mode === 'register' ? 'auth-tab-active' : ''}`}
          >
            {language === 'mr' ? 'नोंदणी' : 'Register'}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Name (register */}
          {mode === 'register' && (
            <div className="auth-form-group">
              <label className="auth-label">{language === 'mr' ? 'पूर्ण नाव *' : 'Full Name *'}</label>
              <div className="auth-input-wrapper">
                <User className="auth-input-icon" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={language === 'mr' ? 'उदा. रमेश पाटील' : 'e.g. Ramesh Patil'}
                  className="auth-input"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Mobile Number */}
          <div className="auth-form-group">
            <label className="auth-label">{language === 'mr' ? 'मोबाईल नंबर *' : 'Mobile Number *'}</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-prefix">+91</span>
              <Phone className="auth-input-icon" style={{ left: '44px' }} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                placeholder="10-digit number"
                className="auth-input"
                style={{ paddingLeft: '72px' }}
                inputMode="numeric"
                autoFocus={mode === 'login'}
              />
            </div>
          </div>

          {/* PIN */}
          <div className="auth-form-group">
            <label className="auth-label">
              {mode === 'register' 
                ? (language === 'mr' ? '४-६ अंकी गुप्त पिन सेट करा *' : 'Set a PIN (4–6 digits) *') 
                : (language === 'mr' ? 'पिन (PIN) *' : 'Security PIN *')}
            </label>
            <div className="auth-input-wrapper">
              <Lock className="auth-input-icon" />
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                placeholder="••••"
                className="auth-input"
                inputMode="numeric"
              />
              <button
                type="button"
                onClick={() => setShowPin((p) => !p)}
                className="auth-eye-btn"
                tabIndex={-1}
                aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-error-box">
              <p style={{ margin: 0, fontSize: '13px', color: '#b91c1c' }}>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
            ) : null}
            <span>
              {loading
                ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
                : (mode === 'login' ? (language === 'mr' ? 'लॉगिन करा' : 'Sign In') : (language === 'mr' ? 'खाते तयार करा' : 'Create Account'))}
            </span>
          </button>

        </form>

      </div>
    </div>
  );
};

export default AuthModal;