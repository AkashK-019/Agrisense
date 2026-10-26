import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { weatherService } from '../services/weatherService';
import { riskAssessmentService } from '../services/riskAssessmentService';
import {
  Plus, Sun, CloudSun, CloudRain, Cloud, Droplets, Wind, Thermometer,
  Sprout, FlaskConical, Activity, MapPin, Navigation, Search, X,
  AlertTriangle, Zap, PhoneCall, ChevronDown, RotateCw
} from 'lucide-react';
import '../styles/SoilWeatherPage.css';

/* Districts the weather service can look up (names are sent to the service as-is) */
const DISTRICTS = [
  { id: 'Ratnagiri', mr: 'रत्नागिरी' },
  { id: 'Raigad',    mr: 'रायगड' },
  { id: 'Thane',     mr: 'ठाणे' },
  { id: 'Nashik',    mr: 'नाशिक' },
  { id: 'Kolhapur',  mr: 'कोल्हापूर' },
  { id: 'Pune',      mr: 'पुणे' },
];
const matchDistrict = (text = '') => DISTRICTS.find(d => text.includes(d.id))?.id || '';

const SOIL_FEEL = {
  dry_powder:     { en: 'Dry and powdery. It does not form a ball.',        mr: 'कोरडी व भुसभुशीत. गोळा बनत नाही.', moisture: 25 },
  slightly_moist: { en: 'Slightly moist. The ball crumbles easily.',        mr: 'किंचित ओलसर. गोळा लगेच फुटतो.',   moisture: 52 },
  moist_ideal:    { en: 'Moist and soft. It forms a ball that holds.',      mr: 'योग्य ओलसर. मऊ गोळा बनतो (वाफसा).', moisture: 74 },
  soggy_wet:      { en: 'Soggy and muddy. Water seeps out.',                mr: 'पाणथळ व चिखलयुक्त. पाणी पाझरते.',  moisture: 92 },
};
const CROP_LOOK = {
  healthy:        { en: 'Green and fresh leaves',               mr: 'हिरवीगार व टवटवीत पाने' },
  slight_wilt:    { en: 'Leaves droop in the afternoon sun',     mr: 'दुपारच्या उन्हात पाने कोमेजतात' },
  severe_curling: { en: 'Leaves are curled and dry',             mr: 'पाने आकसलेली व सुकलेली' },
  yellowing:      { en: 'Leaves turn yellow (too much water)',   mr: 'पाने पिवळी पडतात (जास्त पाणी)' },
};
const LAST_WATERED = {
  today:       { en: 'Today',                 mr: 'आज' },
  '1_2_days':  { en: '1–2 days ago',          mr: '१-२ दिवसांपूर्वी' },
  '3_5_days':  { en: '3–5 days ago',          mr: '३-५ दिवसांपूर्वी' },
  more_5_days: { en: 'More than 5 days ago',  mr: '५ दिवसांपेक्षा जास्त' },
  rainfed:     { en: 'Rainfed, no watering',  mr: 'फक्त पावसावर' },
};

const show = (v, unit = '') => (v === null || v === undefined || v === '' ? '—' : `${v}${unit}`);

function WeatherIcon({ name, size = 28 }) {
  if (name === 'cloud-rain' || name === 'rain') return <CloudRain size={size} className="sw-ico-rain" />;
  if (name === 'cloud-sun') return <CloudSun size={size} className="sw-ico-sun" />;
  if (name === 'sun') return <Sun size={size} className="sw-ico-sun" />;
  return <Cloud size={size} className="sw-ico-cloud" />;
}

function Metric({ icon: Icon, name, value, unit, status, tone, percent, hint }) {
  return (
    <div className="sw-metric">
      <div className="sw-metric-top">
        <span className="sw-metric-name"><Icon size={20} />{name}</span>
        {status && <strong className={`sw-status ${tone}`}>{status}</strong>}
      </div>
      <div className="sw-metric-val">{value}{unit && <small>{unit}</small>}</div>
      {percent !== undefined && (
        <div className="sw-bar"><i className={tone} style={{ width: `${Math.max(2, Math.min(100, percent))}%` }} /></div>
      )}
      {hint && <p className="sw-metric-hint">{hint}</p>}
    </div>
  );
}

export const SoilWeatherPage = () => {
  const { activeFarm, activeCrop, soilReadings, addSoilReading, language, setCurrentView } = useApp();
  const isMr = language === 'mr';
  const t = (en, mr) => (isMr ? mr : en);

  const [selectedDistrict, setSelectedDistrict] = useState(() => matchDistrict(activeFarm?.district));
  const [locationMode, setLocationMode] = useState('district'); // 'district' | 'custom'
  const [reloadKey, setReloadKey] = useState(0);
  const [dayIndex, setDayIndex] = useState(0);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [mode, setMode] = useState('touch');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [touchForm, setTouchForm] = useState({ lastWatered: '', soilFeel: '', cropVisual: '' });
  const [sensorForm, setSensorForm] = useState({ moisture: '', pH: '', nitrogen: '', phosphorus: '', potassium: '' });

  // Pick the farm's district once the farm has loaded
  useEffect(() => {
    if (!selectedDistrict && locationMode === 'district') {
      const m = matchDistrict(activeFarm?.district);
      if (m) setSelectedDistrict(m);
    }
  }, [activeFarm]); // eslint-disable-line

  // Load live weather for the chosen district
  useEffect(() => {
    if (locationMode !== 'district' || !selectedDistrict) return;
    let cancelled = false;
    setWeatherLoading(true);
    setWeatherError('');
    weatherService.fetchByDistrict(selectedDistrict)
      .then(data => { if (!cancelled) { setWeatherData(data); setWeatherLoading(false); } })
      .catch(err => { if (!cancelled) { setWeatherData(null); setWeatherError(err?.message || 'Request failed'); setWeatherLoading(false); } });
    return () => { cancelled = true; };
  }, [selectedDistrict, locationMode, reloadKey]);

  const handleGPS = () => {
    setGpsLoading(true); setWeatherError('');
    weatherService.fetchCurrentLocation()
      .then(data => { setWeatherData(data); setLocationMode('custom'); setDayIndex(0); })
      .catch(err => setWeatherError(err?.message || t('Location permission denied.', 'स्थान वापरण्याची परवानगी नाकारली.')))
      .finally(() => setGpsLoading(false));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (!q) return;
    setSearchLoading(true); setWeatherError('');
    try {
      const d = await weatherService.searchCity(q);
      setWeatherData(d); setLocationMode('custom'); setDayIndex(0); setSearchInput('');
    } catch (err) {
      setWeatherError(err?.message || t('City not found.', 'शहर सापडले नाही.'));
    } finally { setSearchLoading(false); }
  };

  const latestSoil = soilReadings?.[0] || null;
  const day = weatherData?.forecast?.[dayIndex] || weatherData?.forecast?.[0] || null;

  let irrigation = null;
  if (latestSoil || weatherData) {
    try { irrigation = riskAssessmentService.computeIrrigationDecision(latestSoil, weatherData, activeFarm, activeCrop); }
    catch { irrigation = null; }
  }

  const openSheet = () => { setSaveError(''); setSheetOpen(true); };
  const touchReady = touchForm.lastWatered && touchForm.soilFeel && touchForm.cropVisual;
  const num = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!activeFarm) return;
    setSaving(true); setSaveError('');
    const farmId = activeFarm._id || activeFarm.id;
    try {
      if (mode === 'touch') {
        await addSoilReading({
          farmId,
          entryType: 'touch_observation',
          lastWatered: touchForm.lastWatered,
          soilFeel: touchForm.soilFeel,
          cropVisual: touchForm.cropVisual,
          moisture: SOIL_FEEL[touchForm.soilFeel].moisture, // rough estimate from how the soil feels
          moistureEstimated: true,
          source: t('Farmer touch and feel check', 'शेतकरी प्रत्यक्ष निरीक्षण'),
          recordedAt: new Date().toISOString(),
        });
        setTouchForm({ lastWatered: '', soilFeel: '', cropVisual: '' });
      } else {
        await addSoilReading({
          farmId,
          entryType: 'sensor_lab',
          moisture: Number(sensorForm.moisture),
          pH: Number(sensorForm.pH),
          nitrogen: num(sensorForm.nitrogen),
          phosphorus: num(sensorForm.phosphorus),
          potassium: num(sensorForm.potassium),
          source: t('Lab test or sensor', 'माती लॅब / सेन्सर'),
          recordedAt: new Date().toISOString(),
        });
        setSensorForm({ moisture: '', pH: '', nitrogen: '', phosphorus: '', potassium: '' });
      }
      setSheetOpen(false);
    } catch (err) {
      setSaveError(err?.message || t('Could not save. Please try again.', 'जतन करता आले नाही. पुन्हा प्रयत्न करा.'));
    } finally { setSaving(false); }
  };

  /* Soil metric statuses, computed from the saved values only */
  const m = latestSoil?.moisture;
  const moistTone = m < 60 ? 'amber' : m > 85 ? 'blue' : 'green';
  const moistStatus = m < 60 ? t('Low', 'कमी') : m > 85 ? t('Too wet', 'जास्त ओलावा') : t('Good', 'योग्य');
  const ph = latestSoil?.pH;
  const phTone = ph < 5.5 || ph > 7 ? 'amber' : 'green';
  const phStatus = ph < 5.5 ? t('Acidic', 'आम्लधर्मी') : ph > 7 ? t('Alkaline', 'अल्कधर्मी') : t('Good', 'योग्य');
  const n = latestSoil?.nitrogen;
  const hasPK = latestSoil && (latestSoil.phosphorus != null || latestSoil.potassium != null);
  const soilDate = latestSoil?.recordedAt
    ? new Date(latestSoil.recordedAt).toLocaleDateString(isMr ? 'mr-IN' : 'en-IN', { day: 'numeric', month: 'short' })
    : '';

  return (
    <div className="sw">
      <header className="sw-head">
        <h1>{t('Weather & Soil', 'हवामान व माती')}</h1>
        <p>{t('5-day forecast, soil status and irrigation advice.', '५ दिवसांचा हवामान अंदाज, मातीची स्थिती व पाणी सल्ला.')}</p>
      </header>

      {/* Location */}
      <section className="sw-card sw-loc">
        <div className="sw-loc-row">
          <div className="sw-select">
            <MapPin size={20} />
            <select
              value={locationMode === 'district' ? selectedDistrict : ''}
              onChange={(e) => { setLocationMode('district'); setSelectedDistrict(e.target.value); setDayIndex(0); }}
              aria-label={t('District', 'जिल्हा')}
            >
              <option value="" disabled>{locationMode === 'custom' ? t('Custom location', 'निवडलेले ठिकाण') : t('Choose district', 'जिल्हा निवडा')}</option>
              {DISTRICTS.map(d => <option key={d.id} value={d.id}>{isMr ? d.mr : d.id}</option>)}
            </select>
            <ChevronDown size={20} className="sw-select-arrow" />
          </div>
          <button type="button" className="sw-gps" onClick={handleGPS} disabled={gpsLoading} aria-label={t('Use my location', 'माझे स्थान वापरा')}>
            <Navigation size={22} />
          </button>
        </div>
        <form className="sw-search" onSubmit={handleSearch}>
          <Search size={20} />
          <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
            placeholder={t('Search a village or city', 'गाव किंवा शहर शोधा')} aria-label={t('Search', 'शोधा')} />
          <button type="submit" disabled={searchLoading || !searchInput.trim()}>{searchLoading ? '…' : t('Go', 'शोधा')}</button>
        </form>
      </section>

      {weatherError && (
        <div className="sw-error" role="alert">
          <AlertTriangle size={24} />
          <div>
            <strong>{t('API error', 'API त्रुटी')}</strong>
            <p>{t('Weather could not be loaded right now.', 'हवामान सध्या लोड होऊ शकले नाही.')}</p>
            <small>{weatherError}</small>
            {locationMode === 'district' && selectedDistrict && (
              <button type="button" className="sw-retry" onClick={() => setReloadKey(k => k + 1)}><RotateCw size={16} />{t('Try again', 'पुन्हा प्रयत्न करा')}</button>
            )}
          </div>
        </div>
      )}

      {/* Current weather */}
      {weatherLoading ? (
        <section className="sw-weather sw-loading"><span className="sw-spin" />{t('Loading weather…', 'हवामान लोड होत आहे…')}</section>
      ) : weatherData ? (
        <>
          <section className="sw-weather">
            <div className="sw-w-top">
              <div>
                <strong className="sw-temp">{show(weatherData.temp, '°C')}</strong>
                <span className="sw-cond">{weatherData.condition}</span>
              </div>
              <WeatherIcon name={weatherData.icon || day?.icon} size={52} />
            </div>
            <p className="sw-w-place">
              <MapPin size={16} />{weatherData.apiCityName || weatherData.locationName}
              <span>{weatherData.isLive ? t('Live data', 'थेट डेटा') : t('Estimated, not live', 'अंदाजे, थेट नाही')}</span>
            </p>
            <div className="sw-vitals">
              <div><Droplets size={20} /><span>{t('Humidity', 'आर्द्रता')}</span><strong>{show(weatherData.humidity, '%')}</strong></div>
              <div><CloudRain size={20} /><span>{t('Rain', 'पाऊस')}</span><strong>{show(weatherData.rainfall, ' mm')}</strong></div>
              <div><Wind size={20} /><span>{t('Wind', 'वारा')}</span><strong>{show(weatherData.windSpeed, ' km/h')}</strong></div>
              <div><Thermometer size={20} /><span>{t('Feels like', 'जाणवते')}</span><strong>{show(weatherData.feelsLike, '°C')}</strong></div>
            </div>
          </section>

          {weatherData.forecast?.length > 0 && (
            <section className="sw-forecast">
              <h2 className="sw-h2">{t('Next 5 days', 'पुढील ५ दिवस')}</h2>
              <ul className="sw-days">
                {weatherData.forecast.map((f, i) => (
                  <li key={i}>
                    <button type="button" className={`sw-day ${dayIndex === i ? 'active' : ''}`} onClick={() => setDayIndex(i)} aria-pressed={dayIndex === i}>
                      <span className="sw-day-name">{i === 0 ? t('Today', 'आज') : (isMr ? f.marathiDay : f.day)}</span>
                      <span className="sw-day-date">{f.date}</span>
                      <WeatherIcon name={f.icon} size={28} />
                      <strong>{show(f.tempMax, '°')}<small> / {show(f.tempMin, '°')}</small></strong>
                      <span className="sw-day-rain"><Droplets size={14} />{show(f.rainfallMm, ' mm')}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {day?.agriAdvisory && (
                <div className="sw-advisory">
                  <span className="sw-kicker"><Zap size={15} />{dayIndex === 0 ? t("Today's farm advice", 'आजचा शेती सल्ला') : t('Farm advice for this day', 'या दिवसाचा शेती सल्ला')}</span>
                  <p>{day.agriAdvisory}</p>
                </div>
              )}
            </section>
          )}
        </>
      ) : !weatherError && (
        <section className="sw-card sw-prompt">
          <CloudSun size={36} />
          <h2>{t('Choose your location', 'तुमचे ठिकाण निवडा')}</h2>
          <p>{t('Select a district, search your village or use your phone location to see the weather.', 'हवामान पाहण्यासाठी जिल्हा निवडा, गाव शोधा किंवा फोनचे स्थान वापरा.')}</p>
        </section>
      )}

      {/* Irrigation decision */}
      {irrigation && (irrigation.titleEn || irrigation.reasonEn) && (
        <section className={`sw-decision sw-dec-${irrigation.color || 'green'}`}>
          <span className="sw-kicker"><Droplets size={16} />{t('Irrigation decision', 'सिंचन निर्णय')}</span>
          <h2>{isMr ? irrigation.badgeMr : irrigation.badgeEn}</h2>
          <strong>{isMr ? irrigation.titleMr : irrigation.titleEn}</strong>
          <p>{isMr ? irrigation.reasonMr : irrigation.reasonEn}</p>
          {(isMr ? irrigation.guidanceMr : irrigation.guidanceEn) && (
            <p className="sw-dec-do"><b>{t('What to do:', 'काय करावे:')}</b> {isMr ? irrigation.guidanceMr : irrigation.guidanceEn}</p>
          )}
          <small>{t('Based on your soil reading, the 5-day forecast and your crop stage.', 'तुमची माती नोंद, ५ दिवसांचा अंदाज व पिकाची अवस्था यावर आधारित.')}</small>
        </section>
      )}

      {/* Soil */}
      <section className="sw-soil">
        <div className="sw-soil-head">
          <div>
            <h2 className="sw-h2">{t('Your soil', 'तुमची माती')}</h2>
            <p className="sw-sub">
              {latestSoil
                ? `${t('Last reading', 'शेवटची नोंद')}: ${soilDate}${latestSoil.source ? ` · ${latestSoil.source}` : ''}`
                : t('No soil reading yet', 'अजून माती नोंद नाही')}
            </p>
          </div>
          {latestSoil && (
            <button type="button" className="sw-add" onClick={openSheet}><Plus size={20} />{t('Add reading', 'नोंद करा')}</button>
          )}
        </div>

        {!latestSoil ? (
          <div className="sw-card sw-empty">
            <Sprout size={36} />
            <h3>{t('Add your first soil reading', 'पहिली माती नोंद करा')}</h3>
            <p>{t('Check the soil by hand or enter a lab or sensor result to get exact irrigation advice.', 'हाताने माती तपासा किंवा लॅब / सेन्सर निकाल भरा आणि अचूक पाणी सल्ला मिळवा.')}</p>
            <button type="button" className="sw-btn" onClick={openSheet}><Plus size={22} />{t('Add soil reading', 'माती नोंद करा')}</button>
          </div>
        ) : (
          <div className="sw-metrics">
            {m != null && (
              <Metric icon={Droplets} name={t('Soil moisture', 'मातीतील ओलावा')} value={m} unit="%" status={moistStatus} tone={moistTone} percent={m}
                hint={latestSoil.moistureEstimated
                  ? t('Estimated from how the soil felt. Good range: 60–85%.', 'मातीच्या स्पर्शावरून अंदाजे. योग्य पातळी: ६०–८५%.')
                  : t('Good range: 60–85%.', 'योग्य पातळी: ६०–८५%.')} />
            )}
            {ph != null && (
              <Metric icon={FlaskConical} name={t('Soil pH', 'मातीचा सामू (pH)')} value={ph} status={phStatus} tone={phTone} percent={(ph / 14) * 100}
                hint={t('Ideal range for field crops: 5.5–7.0.', 'शेती पिकांसाठी आदर्श: ५.५–७.०.')} />
            )}
            {n != null && (
              <Metric icon={Sprout} name={t('Nitrogen (N)', 'नायट्रोजन (N)')} value={n} unit=" kg/ha"
                status={n >= 150 ? t('Enough', 'पुरेसे') : t('Low', 'कमी')} tone={n >= 150 ? 'green' : 'amber'} percent={(n / 300) * 100}
                hint={t('150 kg/ha or more is recommended for tillering.', 'फुटवे वाढीसाठी १५० kg/ha किंवा जास्त हवे.')} />
            )}
            {hasPK && (
              <Metric icon={Activity} name={t('Phosphorus and potassium', 'स्फुरद व पालाश')}
                value={[latestSoil.phosphorus != null ? `P ${latestSoil.phosphorus}` : null, latestSoil.potassium != null ? `K ${latestSoil.potassium}` : null].filter(Boolean).join('  ·  ')}
                unit=" kg/ha" />
            )}
            {(latestSoil.lastWatered || latestSoil.cropVisual) && (
              <div className="sw-metric sw-notes">
                <span className="sw-metric-name"><Sprout size={20} />{t('Field notes', 'शेतातील नोंदी')}</span>
                {latestSoil.lastWatered && <p><b>{t('Last watered', 'शेवटचे पाणी')}:</b> {isMr ? LAST_WATERED[latestSoil.lastWatered]?.mr : LAST_WATERED[latestSoil.lastWatered]?.en}</p>}
                {latestSoil.soilFeel && SOIL_FEEL[latestSoil.soilFeel] && <p><b>{t('Soil feel', 'मातीचा स्पर्श')}:</b> {isMr ? SOIL_FEEL[latestSoil.soilFeel].mr : SOIL_FEEL[latestSoil.soilFeel].en}</p>}
                {latestSoil.cropVisual && CROP_LOOK[latestSoil.cropVisual] && <p><b>{t('Crop looks', 'पीक कसे दिसते')}:</b> {isMr ? CROP_LOOK[latestSoil.cropVisual].mr : CROP_LOOK[latestSoil.cropVisual].en}</p>}
              </div>
            )}
          </div>
        )}
      </section>

      <a href="tel:18001801551" className="sw-call">
        <span className="sw-call-icon"><PhoneCall size={24} /></span>
        <div>
          <span>{t('Need advice on weather or soil? Free expert help', 'हवामान किंवा मातीबद्दल सल्ला हवा? मोफत तज्ज्ञ मदत')}</span>
          <strong>1800-180-1551</strong>
        </div>
      </a>

      {/* Add soil reading sheet */}
      {sheetOpen && (
        <div className="sw-overlay" onClick={() => setSheetOpen(false)}>
          <form className="sw-sheet" onClick={e => e.stopPropagation()} onSubmit={handleSave}>
            <div className="sw-sheet-head">
              <h3>{t('Add soil reading', 'माती नोंद करा')}</h3>
              <button type="button" className="sw-close" onClick={() => setSheetOpen(false)} aria-label={t('Close', 'बंद करा')}><X size={22} /></button>
            </div>

            {!activeFarm ? (
              <div className="sw-sheet-note">
                <p>{t('Add your field first, then you can save soil readings.', 'आधी तुमचे शेत जोडा, मग माती नोंद करता येईल.')}</p>
                <button type="button" className="sw-btn" onClick={() => { setSheetOpen(false); setCurrentView('myFarm'); }}>{t('Add field', 'शेत जोडा')}</button>
              </div>
            ) : (
              <>
                <div className="sw-tabs" role="tablist">
                  <button type="button" role="tab" aria-selected={mode === 'touch'} className={mode === 'touch' ? 'active' : ''} onClick={() => setMode('touch')}>{t('Check by hand', 'हाताने तपासा')}</button>
                  <button type="button" role="tab" aria-selected={mode === 'sensor'} className={mode === 'sensor' ? 'active' : ''} onClick={() => setMode('sensor')}>{t('Lab or sensor', 'लॅब / सेन्सर')}</button>
                </div>

                {mode === 'touch' ? (
                  <div className="sw-form">
                    <label className="sw-field">
                      <span>{t('When did you last water this field?', 'शेताला शेवटचे पाणी कधी दिले?')}</span>
                      <div className="sw-input-wrap">
                        <select value={touchForm.lastWatered} onChange={e => setTouchForm({ ...touchForm, lastWatered: e.target.value })} required>
                          <option value="" disabled>{t('Choose', 'निवडा')}</option>
                          {Object.entries(LAST_WATERED).map(([k, v]) => <option key={k} value={k}>{isMr ? v.mr : v.en}</option>)}
                        </select>
                        <ChevronDown size={20} />
                      </div>
                    </label>

                    <fieldset className="sw-field">
                      <legend>{t('How does the topsoil feel in your hand?', 'हातात घेतल्यावर माती कशी जाणवते?')}</legend>
                      {Object.entries(SOIL_FEEL).map(([k, v]) => (
                        <label key={k} className={`sw-radio ${touchForm.soilFeel === k ? 'on' : ''}`}>
                          <input type="radio" name="soilFeel" value={k} checked={touchForm.soilFeel === k} onChange={() => setTouchForm({ ...touchForm, soilFeel: k })} />
                          <span>{isMr ? v.mr : v.en}</span>
                        </label>
                      ))}
                    </fieldset>

                    <fieldset className="sw-field">
                      <legend>{t('How do the crop leaves look?', 'पिकाची पाने कशी दिसतात?')}</legend>
                      {Object.entries(CROP_LOOK).map(([k, v]) => (
                        <label key={k} className={`sw-radio ${touchForm.cropVisual === k ? 'on' : ''}`}>
                          <input type="radio" name="cropVisual" value={k} checked={touchForm.cropVisual === k} onChange={() => setTouchForm({ ...touchForm, cropVisual: k })} />
                          <span>{isMr ? v.mr : v.en}</span>
                        </label>
                      ))}
                    </fieldset>
                  </div>
                ) : (
                  <div className="sw-form">
                    <div className="sw-two">
                      <label className="sw-field">
                        <span>{t('Soil moisture (%)', 'ओलावा (%)')} *</span>
                        <input type="number" inputMode="decimal" min="1" max="100" required value={sensorForm.moisture} onChange={e => setSensorForm({ ...sensorForm, moisture: e.target.value })} />
                      </label>
                      <label className="sw-field">
                        <span>{t('Soil pH', 'मातीचा सामू (pH)')} *</span>
                        <input type="number" inputMode="decimal" step="0.1" min="3" max="10" required value={sensorForm.pH} onChange={e => setSensorForm({ ...sensorForm, pH: e.target.value })} />
                      </label>
                    </div>
                    <p className="sw-opt">{t('Optional (kg/ha), fill if you have a lab report', 'ऐच्छिक (kg/ha), लॅब रिपोर्ट असल्यास भरा')}</p>
                    <div className="sw-three">
                      <label className="sw-field"><span>{t('Nitrogen', 'नायट्रोजन')}</span>
                        <input type="number" inputMode="decimal" min="0" value={sensorForm.nitrogen} onChange={e => setSensorForm({ ...sensorForm, nitrogen: e.target.value })} /></label>
                      <label className="sw-field"><span>{t('Phosphorus', 'स्फुरद')}</span>
                        <input type="number" inputMode="decimal" min="0" value={sensorForm.phosphorus} onChange={e => setSensorForm({ ...sensorForm, phosphorus: e.target.value })} /></label>
                      <label className="sw-field"><span>{t('Potassium', 'पालाश')}</span>
                        <input type="number" inputMode="decimal" min="0" value={sensorForm.potassium} onChange={e => setSensorForm({ ...sensorForm, potassium: e.target.value })} /></label>
                    </div>
                  </div>
                )}

                {saveError && <p className="sw-save-error" role="alert">{saveError}</p>}

                <div className="sw-sheet-actions">
                  <button type="button" className="sw-btn-cancel" onClick={() => setSheetOpen(false)}>{t('Cancel', 'रद्द करा')}</button>
                  <button type="submit" className="sw-btn" disabled={saving || (mode === 'touch' && !touchReady)}>
                    {saving ? t('Saving…', 'जतन होत आहे…') : t('Save', 'जतन करा')}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default SoilWeatherPage;