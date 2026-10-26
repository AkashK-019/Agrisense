import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Camera, Image as ImageIcon, TrendingUp, CloudSun, BookOpen,
  Mic, PhoneCall, Sprout, Droplets, ChevronRight, Check,
  ShieldAlert, CloudRain, FlaskConical, TrendingDown, Minus, Wind,
  MapPin, Plus
} from 'lucide-react';
import heroBg from '../assets/scan.png';
import { marketPriceService } from '../services/marketPriceService';
import { weatherService } from '../services/weatherService';
import '../styles/DashboardPage.css';

const fid = (f) => f?._id || f?.id;

/* "Laterite (जांभा)" -> "Laterite" or "जांभा" */
const pick = (v, isMr) => {
  if (!v) return '';
  const m = String(v).match(/^(.*?)\s*\((.*)\)\s*$/);
  if (!m) return v;
  return isMr ? m[2] : m[1];
};

const TOOLS = [
  { view: 'marketPrices', icon: TrendingUp, tone: 'sand', en: 'Market prices', mr: 'बाजार भाव' },
  { view: 'soilWeather', icon: CloudSun, tone: 'sky', en: 'Weather & soil', mr: 'हवामान व माती' },
  { view: 'advisory', icon: BookOpen, tone: 'sage', en: 'Crop guide', mr: 'कृषी सल्ला' },
  { view: 'voiceAccess', icon: Mic, tone: 'lilac', en: 'Ask by voice', mr: 'बोलून विचारा' },
];

const RATE_CROPS = [
  { commodity: 'Paddy (Common)', en: 'Paddy', mr: 'भात' },
  { commodity: 'Soyabean', en: 'Soybean', mr: 'सोयाबीन' },
  { commodity: 'Onion', en: 'Onion', mr: 'कांदा' },
  { commodity: 'Cotton(lint)', en: 'Cotton', mr: 'कापूस' },
];

// Build smart tasks from real farm data
function buildTasks(riskAlerts, soilReadings, cropAnalyses, weather, language) {
  const isMr = language === 'mr';
  const tasks = [];

  // From active risk alerts
  const activeRisks = (riskAlerts || []).filter(r => r.status === 'Active');
  activeRisks.slice(0, 2).forEach((risk, i) => {
    const label = risk.cropName ? `${risk.cropName}: ` : '';
    tasks.push({
      id: `risk_${i}`,
      name: isMr
        ? `${label}${risk.recommendedAction || 'धोका तपासा'}`
        : `${label}${risk.recommendedAction || risk.alertType || 'Check risk alert'}`,
      source: 'risk',
    });
  });

  // From soil moisture
  const soil = soilReadings?.[0];
  if (soil) {
    if (soil.moisture < 40) {
      tasks.push({
        id: 'soil_water',
        name: isMr ? 'मातीतील ओलावा कमी आहे — शेताला पाणी द्या' : 'Low soil moisture — irrigate your field today',
        source: 'soil',
      });
    } else if (soil.moisture > 85) {
      tasks.push({
        id: 'soil_drain',
        name: isMr ? 'मातीत जास्त ओलावा — पाणी काढणे आवश्यक' : 'Excess moisture detected — check field drainage',
        source: 'soil',
      });
    }
    if (soil.pH < 5.5) {
      tasks.push({
        id: 'soil_ph',
        name: isMr ? 'माती आम्लयुक्त (pH कमी) — चुना टाका' : 'Soil too acidic (low pH) — apply lime',
        source: 'soil',
      });
    } else if (soil.pH > 8.0) {
      tasks.push({
        id: 'soil_ph',
        name: isMr ? 'माती अल्कली (pH जास्त) — जिप्सम द्या' : 'High soil pH — consider gypsum application',
        source: 'soil',
      });
    }
  } else {
    // No soil data yet
    tasks.push({
      id: 'soil_missing',
      name: isMr ? 'आजची माती नोंद करा (ओलावा व pH)' : 'Log today\'s soil reading (moisture & pH)',
      source: 'soil',
    });
  }

  // From latest crop scan
  const scan = cropAnalyses?.[0];
  if (scan && scan.diseaseName && !scan.diseaseName.toLowerCase().includes('healthy')) {
    tasks.push({
      id: 'scan_disease',
      name: isMr
        ? `${scan.diseaseName?.split('(')[0]?.trim()} आढळला — पाने तपासा`
        : `${scan.diseaseName?.split('(')[0]?.trim()} detected — inspect leaves`,
      source: 'scan',
    });
  } else if (!scan) {
    tasks.push({
      id: 'scan_missing',
      name: isMr ? 'पिकाचा फोटो काढून आरोग्य तपासा' : 'Scan your crop leaves for disease check',
      source: 'scan',
    });
  }

  // From weather forecast
  if (weather?.forecast?.[1]) {
    const tomorrow = weather.forecast[1];
    if (tomorrow.rainfallMm > 15) {
      tasks.push({
        id: 'wx_rain',
        name: isMr
          ? `उद्या जास्त पाऊस (${tomorrow.rainfallMm} मिमी) — आज फवारणी करा`
          : `Heavy rain tomorrow (${tomorrow.rainfallMm} mm) — spray today if needed`,
        source: 'weather',
      });
    }
  }

  return tasks.slice(0, 4);
}

// Weather icon component
function WeatherIcon({ icon, size = 34 }) {
  if (icon === 'rain' || icon === 'cloud-rain') return <CloudRain size={size} />;
  if (icon === 'sun' || icon === 'cloud-sun') return <CloudSun size={size} />;
  if (icon === 'wind') return <Wind size={size} />;
  return <CloudSun size={size} />;
}

export const DashboardPage = () => {
  const {
    farmer, activeFarm, activeCrop, allFarms, setActiveFarmId, soilReadings, cropAnalyses, riskAlerts,
    setCurrentView, language, areaUnit,
  } = useApp();

  const isMr = language === 'mr';
  const t = (en, mr) => (isMr ? mr : en);

  const handleAddFarmClick = (e) => {
    e.stopPropagation();
    sessionStorage.setItem('agrisense_open_add_farm', 'true');
    setCurrentView('myFarm');
  };

  const farmsList = allFarms && allFarms.length > 0 ? allFarms : (activeFarm ? [activeFarm] : []);
  const totalArea = farmsList.reduce((acc, f) => acc + (Number(f.area) || 0), 0);
  const totalAreaText = Number.isInteger(totalArea) ? totalArea : totalArea.toFixed(1);

  // Live market rates
  const [liveRates, setLiveRates] = useState([]);
  const [ratesLoading, setRatesLoading] = useState(true);
  const ratesFetchedRef = useRef(false);

  // Live weather
  const [weather, setWeather] = useState(null);
  const [wxLoading, setWxLoading] = useState(true);
  const wxFetchedRef = useRef(false);

  // Task done-state (per-session only, resets on reload — these are real tasks not persistent todos)
  const [done, setDone] = useState({});

  // Fetch weather
  useEffect(() => {
    if (wxFetchedRef.current) return;
    wxFetchedRef.current = true;
    const load = async () => {
      setWxLoading(true);
      try {
        const district = activeFarm?.district || activeFarm?.village || 'Ratnagiri';
        const data = await weatherService.fetchByDistrict(district);
        setWeather(data);
      } catch {
        setWeather(null);
      }
      setWxLoading(false);
    };
    load();
  }, [activeFarm]);

  // Fetch market rates
  useEffect(() => {
    if (ratesFetchedRef.current) return;
    ratesFetchedRef.current = true;
    const load = async () => {
      setRatesLoading(true);
      const results = await Promise.all(
        RATE_CROPS.map(async (c) => {
          const data = await marketPriceService.getLiveForecast(c.commodity);
          if (!data) return null;
          const today = data.today_price ?? data.observed_price ?? null;
          const forecast7 = data.forecast_7d ?? null;
          const market = data.mandi_name || data.market || '';
          const change = (today && forecast7) ? Math.round(forecast7 - today) : null;
          return { en: c.en, mr: c.mr, price: today ? Math.round(today) : null, change, market };
        })
      );
      setLiveRates(results.filter(Boolean));
      setRatesLoading(false);
    };
    load();
  }, []);

  const latestSoil = soilReadings?.[0] || null;
  const latestScan = cropAnalyses?.[0] || null;
  const activeRisks = (riskAlerts || []).filter(r => r.status === 'Active');

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t('Good morning', 'शुभ प्रभात')
      : hour < 17 ? t('Good afternoon', 'शुभ दुपार')
        : t('Good evening', 'शुभ संध्याकाळ');
  const firstName = farmer?.name?.split(' ')[0] || t('Farmer', 'शेतकरी');
  const unit = areaUnit === 'gunthas' ? 'गुंठे' : t('acres', 'एकर');

  // Smart tasks from real data
  const tasks = buildTasks(riskAlerts, soilReadings, cropAnalyses, weather, language);

  return (
    <div className="ds">
      {/* Greeting */}
      <header className="ds-greet">
        <h1>{greeting}, {firstName}</h1>
        {(activeFarm?.village || activeFarm?.district || activeFarm?.area) ? (
          <p>
            {[activeFarm?.village || activeFarm?.district, activeFarm?.area ? `${activeFarm.area} ${unit}` : null].filter(Boolean).join(' · ')}
          </p>
        ) : null}
      </header>

      {/* Main action */}
      <section className="ds-hero" style={{ '--hero-img': `url(${heroBg})` }}>
        <h2>{t('Is your crop sick?', 'पीक आजारी वाटतंय?')}</h2>
        <p>{t('Take a photo of the leaf. We tell you the spray.', 'पानाचा फोटो काढा. औषध आम्ही सांगू.')}</p>
        <div className="ds-hero-actions">
          <button type="button" className="ds-btn-main" onClick={() => setCurrentView('cropHealth')}>
            <Camera size={22} />
            <span>{t('Take photo', 'फोटो काढा')}</span>
          </button>
          <button type="button" className="ds-btn-glass" onClick={() => setCurrentView('cropHealth')}
            aria-label={t('Choose from gallery', 'गॅलरीतून निवडा')}>
            <ImageIcon size={22} />
          </button>
        </div>
      </section>

      {(activeRisks.length > 0 || latestScan) && (<div className="ds-notices">
        {activeRisks.length > 0 && (
          <button type="button" className="ds-alert" onClick={() => setCurrentView('riskAlerts')}>
            <ShieldAlert size={28} />
            <div>
              <strong>{t('Disease risk on your farm', 'तुमच्या शेतात रोगाचा धोका')}</strong>
              <span>{activeRisks.length > 1
                ? t(`${activeRisks.length} active alerts`, `${activeRisks.length} सक्रिय इशारे`)
                : t('Tap to see what to do', 'काय करावे ते पाहा')
              }</span>
            </div>
            <ChevronRight size={22} />
          </button>
        )}

        {latestScan && (
          <button type="button" className="ds-row-card" onClick={() => setCurrentView('cropHealth')}>
            <div className="ds-row-text">
              <span className="ds-muted">{t('Last leaf check', 'शेवटची पान तपासणी')}</span>
              <strong>{latestScan.diseaseName?.split('(')[0]?.trim() || t('Healthy crop', 'पीक निरोगी')}</strong>
            </div>
            <ChevronRight size={22} />
          </button>
        )}
      </div>)}

      {/* Farm overview + List of Farms */}
      <section className="ds-weather ds-farm-card">
        {/* Farm Header */}
        <div className="ds-farm-head">
          <button
            type="button"
            className="ds-farm-head-title"
            onClick={() => setCurrentView('myFarm')}
            title={t('View all farms', 'सर्व शेते पाहा')}
          >
            <Sprout size={24} />
            <div>
              <strong>{t('My Farms', 'माझी शेते')}</strong>
              <span>
                {farmsList.length > 0
                  ? `${farmsList.length} ${farmsList.length === 1 ? t('farm', 'शेत') : t('farms', 'शेते')}${totalArea > 0 ? ` · ${totalAreaText} ${unit}` : ''}`
                  : t('No farms added yet', 'अजून शेत जोडलेले नाही')}
              </span>
            </div>
          </button>
          <button
            type="button"
            className="ds-farm-head-add"
            onClick={handleAddFarmClick}
            aria-label={t('Add farm', 'शेत जोडा')}
          >
            <Plus size={16} />
            <span>{t('Add farm', 'शेत जोडा')}</span>
          </button>
        </div>

        {/* List of Farms */}
        <div className="ds-farm-list">
          {farmsList.length === 0 ? (
            <div className="ds-farm-empty" onClick={handleAddFarmClick}>
              <span>{t('+ Register your first farm & crop to get tailored advice', '+ वैयक्तिक सल्ल्यासाठी पहिले शेत व पीक जोडा')}</span>
            </div>
          ) : (
            farmsList.map((farm) => {
              const isActive = fid(farm) === fid(activeFarm);
              const varietyName = pick(farm.variety || (isActive ? activeCrop?.variety : null), isMr);
              const stageName = pick(farm.cropStage || (isActive ? activeCrop?.cropStage : null), isMr);
              const subMeta = [
                farm.village || farm.district,
                varietyName,
                stageName
              ].filter(Boolean).join(' · ');

              return (
                <div
                  key={fid(farm)}
                  className={`ds-farm-row ${isActive ? 'is-active' : ''}`}
                  onClick={() => setActiveFarmId(fid(farm))}
                >
                  <div className="ds-farm-row-info">
                    <span className="ds-farm-name">{farm.farmName}</span>
                    {subMeta && <span className="ds-farm-meta">{subMeta}</span>}
                  </div>
                  {farm.area && (
                    <span className="ds-farm-area">
                      {farm.area} {unit}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom panel: Active farm details & management */}
        <div className="ds-field">
          <div className="ds-field-stat">
            <MapPin size={20} />
            <strong>{activeFarm?.area ? `${activeFarm.area} ${unit}` : '—'}</strong>
            <span>{t('Active area', 'सक्रिय क्षेत्र')}</span>
          </div>
          <div className="ds-field-stat">
            <Sprout size={20} />
            <strong>{pick(activeFarm?.cropStage || activeCrop?.stage, isMr) || (activeFarm ? t('Rice', 'भात') : '—')}</strong>
            <span>{t('Crop stage', 'पीक अवस्था')}</span>
          </div>
          <button type="button" className="ds-field-add" onClick={() => setCurrentView('myFarm')}>
            {t('Manage all →', 'सर्व शेते →')}
          </button>
        </div>
      </section>

      {/* Tools */}
      <section className="ds-tools-sec">
        <h2 className="ds-h2">{t('Your tools', 'तुमची साधने')}</h2>
        <div className="ds-tools">
          {TOOLS.map(({ view, icon: Icon, tone, en, mr }) => (
            <button key={view} type="button" className={`ds-tool ds-tone-${tone}`} onClick={() => setCurrentView(view)}>
              <Icon size={34} strokeWidth={1.8} />
              <span>{t(en, mr)}</span>
            </button>
          ))}
          <button type="button" className="ds-tool ds-tone-green ds-tool-wide" onClick={() => setCurrentView('myFarm')}>
            <Sprout size={34} strokeWidth={1.8} />
            <span>{t('My farm and plots', 'माझे शेत व पिके')}</span>
          </button>
        </div>
      </section>

      {/* Today's work — DYNAMIC from real data */}
      <section className="ds-tasks-sec">
        <div className="ds-h2-row">
          <h2 className="ds-h2">{t("Today's work", 'आजची कामे')}</h2>
          {activeRisks.length > 0 && (
            <button type="button" className="ds-link" onClick={() => setCurrentView('riskAlerts')}>
              {t('See alerts', 'इशारे पाहा')}
            </button>
          )}
        </div>
        <ul className="ds-tasks">
          {tasks.map(task => (
            <li key={task.id}>
              <button
                type="button"
                className={`ds-task ${done[task.id] ? 'is-done' : ''}`}
                onClick={() => setDone(d => ({ ...d, [task.id]: !d[task.id] }))}
                aria-pressed={!!done[task.id]}
              >
                <span className="ds-check">{done[task.id] && <Check size={18} strokeWidth={3} />}</span>
                <span>{task.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Prices */}
      <section className="ds-rates-sec">
        <div className="ds-h2-row">
          <h2 className="ds-h2">{t("Today's rates", 'आजचे भाव')}</h2>
          <button type="button" className="ds-link" onClick={() => setCurrentView('marketPrices')}>
            {t('See all', 'सर्व पाहा')}
          </button>
        </div>
        <ul className="ds-rates">
          {ratesLoading
            ? RATE_CROPS.map(c => (
              <li key={c.en}>
                <div className="ds-rate ds-rate-loading">
                  <span className="ds-rate-name">{t(c.en, c.mr)}</span>
                  <span className="ds-rate-skeleton" />
                </div>
              </li>
            ))
            : liveRates.length > 0
              ? liveRates.map(m => (
                <li key={m.en}>
                  <button type="button" className="ds-rate" onClick={() => setCurrentView('marketPrices')}>
                    <span className="ds-rate-name">{t(m.en, m.mr)}</span>
                    <div className="ds-rate-right">
                      <div className="ds-rate-price-row">
                        {m.price
                          ? <span className="ds-rate-price">₹{m.price.toLocaleString('en-IN')}</span>
                          : <span className="ds-rate-price ds-muted">—</span>}
                        <span className="ds-rate-unit">{t('/ qtl', '/ क्विंटल')}</span>
                      </div>
                      {m.market && <span className="ds-rate-market">{m.market}</span>}
                      {m.change !== null && (
                        <span className={`ds-rate-change ${m.change > 0 ? 'up' : m.change < 0 ? 'down' : 'flat'}`}>
                          {m.change > 0 ? <TrendingUp size={12} strokeWidth={2.5} /> : m.change < 0 ? <TrendingDown size={12} strokeWidth={2.5} /> : <Minus size={12} strokeWidth={2.5} />}
                          <span className="ds-rate-change-val">{m.change > 0 ? '+' : m.change < 0 ? '−' : ''}₹{Math.abs(m.change)}</span>
                          <span className="ds-rate-change-label">· {t('7d', '७दि')}</span>
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))
              : RATE_CROPS.map(c => (
                <li key={c.en}>
                  <button type="button" className="ds-rate" onClick={() => setCurrentView('marketPrices')}>
                    <span className="ds-rate-name">{t(c.en, c.mr)}</span>
                    <span className="ds-rate-price ds-muted">—</span>
                  </button>
                </li>
              ))
          }
        </ul>
      </section>

      {/* Helpline */}
      <a href="tel:18001801551" className="ds-call">
        <PhoneCall size={26} />
        <div>
          <strong>{t('Talk to an expert, free', 'तज्ज्ञांशी बोला, मोफत')}</strong>
          <span>1800-180-1551</span>
        </div>
      </a>
    </div>
  );
};

export default DashboardPage;