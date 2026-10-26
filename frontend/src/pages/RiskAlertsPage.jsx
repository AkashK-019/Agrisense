import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { riskAssessmentService } from '../services/riskAssessmentService';
import { weatherService } from '../services/weatherService';
import { decisionFusionService } from '../services/decisionFusionService';
import {
  AlertTriangle, ShieldAlert, Bug, CloudRain, Droplets, FlaskConical,
  ShieldCheck, Sprout, Plus, PhoneCall, Info, Zap, Activity, Leaf,
  ChevronRight, Calendar, CheckCircle2, ArrowRight
} from 'lucide-react';
import '../styles/RiskAlertsPage.css';

const CAT_META = {
  'Crop Disease Risk': { icon: ShieldAlert, en: 'Leaf Disease', mr: 'पानावरील रोग', color: 'red' },
  'Pest Infestation Risk': { icon: Bug, en: 'Pests & Insects', mr: 'कीड व किडे', color: 'amber' },
  'Weather & Monsoonal Risk': { icon: CloudRain, en: 'Weather & Rain', mr: 'हवामान व पाऊस', color: 'blue' },
  'Soil Nutrient / pH Risk': { icon: FlaskConical, en: 'Soil Health', mr: 'माती आरोग्य', color: 'emerald' },
  'Water Stress / Waterlogging Risk': { icon: Droplets, en: 'Water & Wetness', mr: 'पाणी व निचरा', color: 'cyan' },
};

const SEV_META = {
  high: { en: 'High Risk', mr: 'जास्त धोका', bg: '#fee2e2', border: '#ef4444', text: '#991b1b', rank: 0 },
  mod: { en: 'Moderate Risk', mr: 'मध्यम धोका', bg: '#fef3c7', border: '#f59e0b', text: '#92400e', rank: 1 },
  low: { en: 'Low / Safe', mr: 'कमी धोका', bg: '#dcfce7', border: '#22c55e', text: '#166534', rank: 2 },
};

const getSevKey = (s = '') => (/high|severe|critical/i.test(s) ? 'high' : /low/i.test(s) ? 'low' : 'mod');

export const RiskAlertsPage = () => {
  const {
    allFarms, allCrops, activeFarm, soilReadings, cropAnalyses, riskAlerts, language, setCurrentView
  } = useApp();

  const isMr = language === 'mr';
  const t = (en, mr) => (isMr ? mr : en);

  const [liveWeather, setLiveWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [selectedPlotId, setSelectedPlotId] = useState(null);
  const [fertilizerRec, setFertilizerRec] = useState(null);
  const [fertLoading, setFertLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('alerts'); // 'alerts' | 'fertilizer'

  // Load weather for active district
  useEffect(() => {
    const district = activeFarm?.district;
    if (!district) {
      setLiveWeather(null);
      return;
    }
    let cancelled = false;
    setWeatherLoading(true);
    weatherService.fetchByDistrict(district)
      .then(w => { if (!cancelled) setLiveWeather(w); })
      .catch(() => { if (!cancelled) setLiveWeather(null); })
      .finally(() => { if (!cancelled) setWeatherLoading(false); });
    return () => { cancelled = true; };
  }, [activeFarm]);

  // Combine Soil + Crop + Weather + Leaf Scans from Crop Doctor
  const plots = useMemo(() => {
    const farms = allFarms?.length ? allFarms : (activeFarm ? [activeFarm] : []);
    try {
      return riskAssessmentService.evaluateAllPlots(farms, allCrops, soilReadings, liveWeather, cropAnalyses) || [];
    } catch {
      return [];
    }
  }, [allFarms, activeFarm, allCrops, soilReadings, liveWeather, cropAnalyses]);

  useEffect(() => {
    if (plots.length > 0 && !plots.find(p => p.id === selectedPlotId)) {
      setSelectedPlotId(plots[0].id);
    }
  }, [plots, selectedPlotId]);

  const activePlot = plots.find(p => p.id === selectedPlotId) || plots[0] || null;

  // Fetch Model C2 Risk-Adjusted Fertilizer Plan
  useEffect(() => {
    if (!activePlot) {
      setFertilizerRec(null);
      return;
    }
    const farmSoil = (soilReadings || []).find(s => s.farmId === activePlot.id) || soilReadings?.[0] || {};
    let cancelled = false;
    setFertLoading(true);

    const activeDisease = activePlot.detectedDisease ||
      (activePlot.risks?.find(r => r.category === 'Crop Disease Risk')?.diseaseName) || null;

    decisionFusionService.getAgronomyRecommendation({
      crop: activePlot.crop || 'paddy',
      variety: activePlot.variety || activeFarm?.variety || 'Karjat-3',
      stage: (activePlot.stage || activeFarm?.cropStage || 'tillering').toLowerCase(),
      district: activePlot.district || activeFarm?.district || 'Ratnagiri',
      diseaseLabel: activeDisease,
      soil: {
        n: farmSoil.nitrogen,
        p: farmSoil.phosphorus,
        k: farmSoil.potassium,
        ph: farmSoil.pH
      }
    })
      .then(data => { if (!cancelled) setFertilizerRec(data); })
      .catch(() => { if (!cancelled) setFertilizerRec(null); })
      .finally(() => { if (!cancelled) setFertLoading(false); });

    return () => { cancelled = true; };
  }, [activePlot, activeFarm, soilReadings]);

  // Consolidate all alerts for the selected plot
  const plotAlerts = useMemo(() => {
    if (!activePlot) return [];
    const list = (activePlot.risks || []).map(r => ({
      ...r,
      farmName: activePlot.name,
      title: isMr ? r.titleMr : r.titleEn,
      description: isMr ? r.descMr : r.descEn,
      action: isMr ? r.remedyMr : r.remedyEn,
    }));
    return list.sort((a, b) => SEV_META[getSevKey(a.severity)].rank - SEV_META[getSevKey(b.severity)].rank);
  }, [activePlot, isMr]);

  const hasHighRisk = activePlot?.status === 'High';
  const hasModRisk = activePlot?.status === 'Moderate';
  const isFieldSafe = !hasHighRisk && !hasModRisk;

  return (
    <div className="ra-page">
      {/* 1. Header Section */}
      <div className="ra-topbar">
        <div className="ra-topbar-info">
          <h1>{t('Farm Risk & Action Center', 'शेतातील धोका व उपाय केंद्र')}</h1>
          <p>{t('Daily threat alerts and tailored nutrition plans for your field', 'तुमच्या शेतासाठी रोजचे धोके, प्रतिबंधात्मक उपाय व खत नियोजन')}</p>
        </div>
      </div>

      {plots.length === 0 ? (
        <div className="ra-empty-box">
          <Sprout size={48} className="ra-empty-icon" />
          <h2>{t('No Farm Plots Found', 'कोणतेही शेत जोडलेले नाही')}</h2>
          <p>{t('Please add your farm plot in "My Farm" to activate disease, weather, and fertilizer risk monitoring.', 'रोग, हवामान व खत नियोजनाचे इशारे मिळवण्यासाठी "माझे शेत" मध्ये तुमचे शेत जोडा.')}</p>
          <button type="button" className="ra-action-btn" onClick={() => setCurrentView('myFarm')}>
            <Plus size={18} /> {t('Add Your Farm', 'शेत जोडा')}
          </button>
        </div>
      ) : (
        <>
          {/* 2. Farm Selector Pills (if multiple farms) */}
          {plots.length > 1 && (
            <div className="ra-plot-pills-bar">
              <span className="ra-pills-label">{t('Select Field:', 'शेत निवडा:')}</span>
              <div className="ra-plot-pills">
                {plots.map(p => {
                  const sKey = getSevKey(p.status);
                  const isSelected = p.id === activePlot?.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={`ra-plot-pill ${isSelected ? 'selected' : ''} ${sKey}`}
                      onClick={() => setSelectedPlotId(p.id)}
                    >
                      <span className="ra-pill-dot" />
                      <strong>{p.name}</strong>
                      <small>({p.crop})</small>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Hero Status Banner */}
          <div className={`ra-hero-banner ${hasHighRisk ? 'danger' : hasModRisk ? 'warning' : 'safe'}`}>
            <div className="ra-hero-left">
              <div className="ra-hero-icon-wrap">
                {isFieldSafe ? <ShieldCheck size={36} /> : <AlertTriangle size={36} />}
              </div>
              <div className="ra-hero-text">
                <div className="ra-hero-badge-row">
                  <span className="ra-status-badge">
                    {hasHighRisk
                      ? t('🚨 High Risk Attention Required', '🚨 जास्त धोका - तात्काळ लक्ष द्या')
                      : hasModRisk
                        ? t('⚠️ Moderate Risk Detected', '⚠️ मध्यम धोका आढळला आहे')
                        : t('✅ Field Conditions Safe & Normal', '✅ शेत सुरक्षित व उत्तम स्थितीत')}
                  </span>
                  <span className="ra-field-name-tag">🌾 {activePlot?.name} · {activePlot?.crop}</span>
                </div>
                <h2>
                  {activePlot?.detectedDisease
                    ? t(`Active Disease: ${activePlot.detectedDisease}`, `सक्रिय रोग: ${activePlot.detectedDisease}`)
                    : isMr ? activePlot?.activeRiskMr : activePlot?.activeRisk}
                </h2>
                <p>
                  {activePlot?.detectedDisease
                    ? t('Confirmed by recent Crop Doctor leaf scan. Immediate preventive action recommended below.', 'क्रॉप डॉक्टर तपासणीत हा रोग आढळला आहे. खालील तात्काळ उपाय करा.')
                    : isFieldSafe
                      ? t('Weather, soil moisture, and leaf health are favorable. Follow scheduled nutrient applications.', 'हवामान, माती व पीक आरोग्य अनुकूल आहे. नियमित खत वेळापत्रक चालू ठेवा.')
                      : t('Potential stress detected from microclimate or soil balance. Follow the advice below.', 'हवामान अथवा मातीतील बदलांमुळे धोका संभवतो. खालील सल्ला तपासा.')}
                </p>
              </div>
            </div>
          </div>

          {/* 4. Section Navigation Tabs */}
          <div className="ra-section-nav">
            <button
              type="button"
              className={`ra-nav-tab ${activeTab === 'alerts' ? 'active' : ''}`}
              onClick={() => setActiveTab('alerts')}
            >
              <ShieldAlert size={18} />
              <span>{t('Active Threats & What to Do', 'धोका इशारे व उपाय')}</span>
              {plotAlerts.length > 0 && <span className="ra-nav-count">{plotAlerts.length}</span>}
            </button>
            <button
              type="button"
              className={`ra-nav-tab ${activeTab === 'fertilizer' ? 'active' : ''}`}
              onClick={() => setActiveTab('fertilizer')}
            >
              <FlaskConical size={18} />
              <span>{t('Field Nutrition & Fertilizer Plan', 'खत व पोषण नियोजन')}</span>
              <span className="ra-nav-tag">{t('Model C2', 'मॉडेल C2')}</span>
            </button>
          </div>

          {/* 5. TAB 1: Threats & Action Cards */}
          {activeTab === 'alerts' && (
            <div className="ra-cards-list">
              {plotAlerts.length === 0 ? (
                <div className="ra-clean-card safe-state">
                  <CheckCircle2 size={40} className="ra-check-green" />
                  <h3>{t('All Clear! No Active Risks for this Field', 'सर्व काही ठीक आहे! कोणताही धोका नाही')}</h3>
                  <p>{t('Your crop leaves, soil parameters, and local weather are in healthy harmony.', 'तुमची पाने, माती आणि हवामान पिकासाठी पूर्णपणे अनुकूल आहेत.')}</p>
                </div>
              ) : (
                plotAlerts.map((alert, idx) => {
                  const sev = getSevKey(alert.severity);
                  const meta = CAT_META[alert.category] || { icon: ShieldAlert, en: 'Threat', mr: 'धोका', color: 'amber' };
                  const CatIcon = meta.icon;

                  return (
                    <div key={idx} className={`ra-alert-card sev-${sev}`}>
                      <div className="ra-alert-card-head">
                        <div className="ra-cat-pill">
                          <CatIcon size={16} />
                          <span>{isMr ? meta.mr : meta.en}</span>
                        </div>
                        <span className={`ra-sev-badge ${sev}`}>
                          {isMr ? SEV_META[sev].mr : SEV_META[sev].en}
                        </span>
                      </div>

                      <div className="ra-alert-title-row">
                        <h3>{alert.title}</h3>
                      </div>

                      {alert.description && (
                        <p className="ra-alert-desc">{alert.description}</p>
                      )}

                      {alert.action && (
                        <div className="ra-solution-box">
                          <div className="ra-solution-head">
                            <Zap size={16} />
                            <strong>{t('Recommended Solution / What To Do Today:', 'आज करावयाचा खात्रीशीर उपाय:')}</strong>
                          </div>
                          <p>{alert.action}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 6. TAB 2: Field Nutrition & Fertilizer Plan (Model C2) */}
          {activeTab === 'fertilizer' && (
            <div className="ra-fert-section">
              {/* Header Box */}
              <div className="ra-fert-hero-card">
                <div className="ra-fert-hero-top">
                  <div>
                    <span className="ra-kicker-pill">
                      <FlaskConical size={14} /> {t('Model C2 Agronomy Recommender', 'मॉडेल C2 खत शिफारस')}
                    </span>
                    <h2>{t('Customized Fertilizer & Nutrient Plan', 'तुमच्या शेतानुसार खतांचे हप्ते व मात्रा')}</h2>
                    <p>
                      {activePlot?.detectedDisease
                        ? t(`⚠️ Doses specifically adjusted to suppress ${activePlot.detectedDisease}.`, `⚠️ ${activePlot.detectedDisease} रोगाचा प्रादुर्भाव रोखण्यासाठी खतांच्या मात्रेत बदल केले आहेत.`)
                        : t('Optimal N-P-K doses and split timings based on field stage and soil test.', 'पिकाचा टप्पा व मातीनुसार प्रमाणित खतांचे वेळापत्रक.')}
                    </p>
                  </div>
                  <span className="ra-plot-badge">🌾 {activePlot?.name} ({activePlot?.variety || 'Karjat-3'})</span>
                </div>

                {fertLoading ? (
                  <div className="ra-loading-state">
                    <span className="ra-spinner" />
                    <p>{t('Calculating optimal nutrient balance…', 'पिकासाठी योग्य खतांचे प्रमाण काढत आहे…')}</p>
                  </div>
                ) : fertilizerRec?.fertilizer?.length > 0 ? (
                  <div className="ra-fert-content">
                    {/* Primary NPK Dose Grid */}
                    <div className="ra-npk-board">
                      <div className="ra-npk-board-head">
                        <span className="ra-total-dose-lbl">{t('Total Target Dose per Hectare', 'प्रति हेक्टरी एकूण खत प्रमाण')}</span>
                        <strong className="ra-total-dose-val">{fertilizerRec.fertilizer[0].item}</strong>
                      </div>

                      {fertilizerRec.fertilizer[0].detail && (
                        <div className="ra-npk-three-grid">
                          <div className="ra-npk-card n">
                            <span className="ra-npk-tag">N · {t('Nitrogen', 'नायट्रोजन')}</span>
                            <div className="ra-npk-num">
                              {fertilizerRec.fertilizer[0].detail.n_kg_ha || 100}
                              <small>kg/ha</small>
                            </div>
                            <span className="ra-npk-sub">{t('Vegetative Growth', 'फुटवे व वाढ')}</span>
                          </div>

                          <div className="ra-npk-card p">
                            <span className="ra-npk-tag">P · {t('Phosphorus', 'स्फुरद')}</span>
                            <div className="ra-npk-num">
                              {fertilizerRec.fertilizer[0].detail.p_kg_ha || 40}
                              <small>kg/ha</small>
                            </div>
                            <span className="ra-npk-sub">{t('Root Strength', 'मुळांची वाढ')}</span>
                          </div>

                          <div className="ra-npk-card k">
                            <span className="ra-npk-tag">K · {t('Potassium', 'पालाश')}</span>
                            <div className="ra-npk-num">
                              {fertilizerRec.fertilizer[0].detail.k_kg_ha || 40}
                              <small>kg/ha</small>
                            </div>
                            <span className="ra-npk-sub">{t('Disease Immunity', 'रोगप्रतिकारशक्ती')}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Split Schedule Card */}
                    {fertilizerRec.fertilizer[0].detail?.splits && (
                      <div className="ra-detail-box">
                        <div className="ra-detail-icon"><Activity size={20} /></div>
                        <div>
                          <strong>{t('Application Timing & Split Doses (वेळापत्रक):', 'खतांचे हप्ते व देण्याची वेळ (वेळापत्रक):')}</strong>
                          <p>{isMr && fertilizerRec.fertilizer[0].detail.splits_mr ? fertilizerRec.fertilizer[0].detail.splits_mr : fertilizerRec.fertilizer[0].detail.splits}</p>
                        </div>
                      </div>
                    )}

                    {/* Disease/Risk Precaution Box */}
                    {fertilizerRec.fertilizer[0].rationale?.length > 0 && (
                      <div className="ra-detail-box warning">
                        <div className="ra-detail-icon warn"><Zap size={20} /></div>
                        <div>
                          <strong>{t('Disease & Safety Precaution (महत्त्वाची सूचना):', 'रोग व खत सुरक्षा सूचना (महत्त्वाची सूचना):')}</strong>
                          <p>{fertilizerRec.fertilizer[0].rationale.join(' · ')}</p>
                        </div>
                      </div>
                    )}

                    {/* Organic Supplement Box */}
                    {fertilizerRec.fertilizer[0].detail?.organic && (
                      <div className="ra-detail-box organic">
                        <div className="ra-detail-icon org"><Sprout size={20} /></div>
                        <div>
                          <strong>{t('Organic Soil Conditioner:', 'सेंद्रिय खत व माती आरोग्य:')}</strong>
                          <p>{isMr && fertilizerRec.fertilizer[0].detail.organic_mr ? fertilizerRec.fertilizer[0].detail.organic_mr : fertilizerRec.fertilizer[0].detail.organic}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="ra-detail-box">
                    <div className="ra-detail-icon"><Sprout size={20} /></div>
                    <div>
                      <strong>{t('Standard Basal & Split Schedule:', 'प्रमाणित खत वेळापत्रक:')}</strong>
                      <p>{t('Apply 40% Nitrogen + 100% P & K at transplanting. Apply remaining Nitrogen in two splits at tillering and panicle initiation. Avoid excess urea during disease outbreaks.', '४०% नत्र + १००% स्फुरद व पालाश लावणीवेळी द्यावे. उर्वरित नत्र फुटवे फुटताना व पोटरीमध्ये विभागून द्यावे.')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 7. Kisan Support Helpline */}
          <a href="tel:18001801551" className="ra-kisan-banner">
            <div className="ra-kisan-icon">
              <PhoneCall size={24} />
            </div>
            <div className="ra-kisan-text">
              <span>{t('Need help with spray dosage or fertilizer? Call Free Kisan Helpline', 'फवारणी अथवा खतांबद्दल शंका आहे? मोफत किसान हेल्पलाइनवर संपर्क करा')}</span>
              <strong>1800-180-1551 (Toll Free)</strong>
            </div>
            <ChevronRight size={22} className="ra-kisan-arrow" />
          </a>
        </>
      )}
    </div>
  );
};

export default RiskAlertsPage;