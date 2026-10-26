import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sprout, Plus, Pencil, Trash2, MapPin, X, Droplets, ChevronDown,
  CheckCircle2, PhoneCall, AlertTriangle
} from 'lucide-react';
import '../styles/MyFarmPage.css';

/* Choice lists. Saved as "English (मराठी)" so other pages can read them. Nothing is preselected. */
const DISTRICTS = [
  { id: 'Ratnagiri',  mr: 'रत्नागिरी' },
  { id: 'Raigad',     mr: 'रायगड' },
  { id: 'Sindhudurg', mr: 'सिंधुदुर्ग' },
  { id: 'Thane',      mr: 'ठाणे' },
  { id: 'Palghar',    mr: 'पालघर' },
];
const VARIETIES = ['Karjat-3 (कर्जत-३)', 'Wada Kolam (वाडा कोलम)', 'Ratnagiri-24 (रत्नागिरी-२४)', 'Indrayani (इंद्रायणी)', 'Sonam (सोनम)'];
const STAGES = [
  'Nursery (रोपवाटिका)', 'Transplanting (लावणी)', 'Tillering (फुटवे येणे)',
  'Panicle initiation (दोंडे येणे)', 'Flowering (फुलोरा)', 'Grain filling (दाणे भरणे)', 'Harvest (कापणी)',
];
const SOIL_TYPES = ['Laterite (जांभा)', 'Clayey Loam (काळी चिकणमाती)', 'Coastal Alluvial (किनारपट्टी गाळ)', 'Red Sandy (तांबडी वाळूयुक्त)'];
const IRRIGATION = ['Rainfed (पावसावर आधारित)', 'Canal / River (कालवा / नदी)', 'Borewell / Well (विहीर / बोअरवेल)', 'Drip / Sprinkler (ठिबक)'];
const CROP = 'Rice (भात)'; // this app is for rice farmers

/* "Laterite (जांभा)" -> "Laterite" or "जांभा" */
const pick = (v, isMr) => {
  if (!v) return '';
  const m = String(v).match(/^(.*?)\s*\((.*)\)\s*$/);
  if (!m) return v;
  return isMr ? m[2] : m[1];
};
const fid = (f) => f?._id || f?.id;
const EMPTY_FARM = { farmName: '', village: '', district: '', area: '', soilType: '', irrigationType: '', variety: '', cropStage: '' };
const EMPTY_SOIL = { moisture: '', pH: '', nitrogen: '', phosphorus: '', potassium: '' };
const num = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));

function Select({ label, value, onChange, children, required }) {
  return (
    <label className="mf-field">
      <span>{label}{required && ' *'}</span>
      <div className="mf-select">
        <select value={value} onChange={onChange} required={required}>{children}</select>
        <ChevronDown size={20} />
      </div>
    </label>
  );
}

export const MyFarmPage = () => {
  const {
    allFarms, activeFarm, setActiveFarmId, addFarm, updateFarm, deleteFarm,
    activeCrop, farmer, language, areaUnit, soilReadings, addSoilReading
  } = useApp();

  const isMr = language === 'mr';
  const t = (en, mr) => (isMr ? mr : en);
  const unit = areaUnit === 'gunthas' ? t('gunthas', 'गुंठे') : t('acres', 'एकर');

  const [farmSheet, setFarmSheet] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [soilSheet, setSoilSheet] = useState(false);
  const [farmToDelete, setFarmToDelete] = useState(null);
  const [form, setForm] = useState(EMPTY_FARM);
  const [soilForm, setSoilForm] = useState(EMPTY_SOIL);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const openAdd = () => { setEditingFarm(null); setForm(EMPTY_FARM); setError(''); setFarmSheet(true); };

  // Auto-open Add Farm modal if navigated from "Add farm" button on Dashboard
  useEffect(() => {
    if (sessionStorage.getItem('agrisense_open_add_farm') === 'true') {
      sessionStorage.removeItem('agrisense_open_add_farm');
      openAdd();
    }
  }, []);
  const openEdit = (farm) => {
    setEditingFarm(farm);
    setForm({
      farmName: farm.farmName || '',
      village: farm.village || '',
      district: farm.district || '',
      area: farm.area ?? '',
      soilType: farm.soilType || '',
      irrigationType: farm.irrigationType || '',
      variety: farm.variety || '',
      cropStage: farm.cropStage || '',
    });
    setError('');
    setFarmSheet(true);
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submitFarm = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    const data = {
      farmName: form.farmName.trim(),
      village: form.village.trim(),
      district: form.district,
      area: Number(form.area),
      soilType: form.soilType || undefined,
      irrigationType: form.irrigationType || undefined,
      cropName: CROP,
      variety: form.variety || undefined,
      cropStage: form.cropStage || undefined,
    };
    try {
      if (editingFarm) await updateFarm(fid(editingFarm), data);
      else await addFarm({ farmerId: farmer?._id || farmer?.id, ...data });
      setFarmSheet(false);
    } catch (err) {
      setError(err?.message || t('Could not save. Please try again.', 'जतन करता आले नाही. पुन्हा प्रयत्न करा.'));
    } finally { setBusy(false); }
  };

  const openSoil = (farm) => {
    if (fid(farm) !== fid(activeFarm)) setActiveFarmId(fid(farm));
    setSoilForm(EMPTY_SOIL); setError(''); setSoilSheet(true);
  };
  const submitSoil = async (e) => {
    e.preventDefault();
    const farm = activeFarm;
    if (!farm) return;
    setBusy(true); setError('');
    try {
      await addSoilReading({
        farmId: fid(farm),
        moisture: Number(soilForm.moisture),
        pH: Number(soilForm.pH),
        nitrogen: num(soilForm.nitrogen),
        phosphorus: num(soilForm.phosphorus),
        potassium: num(soilForm.potassium),
        source: t('Farmer field entry', 'शेतकरी नोंद'),
        recordedAt: new Date().toISOString(),
      });
      setSoilSheet(false);
    } catch (err) {
      setError(err?.message || t('Could not save. Please try again.', 'जतन करता आले नाही. पुन्हा प्रयत्न करा.'));
    } finally { setBusy(false); }
  };

  const confirmDelete = async () => {
    if (!farmToDelete) return;
    setBusy(true); setError('');
    try { await deleteFarm(fid(farmToDelete)); setFarmToDelete(null); }
    catch (err) { setError(err?.message || t('Could not delete. Please try again.', 'हटवता आले नाही. पुन्हा प्रयत्न करा.')); }
    finally { setBusy(false); }
  };

  const total = allFarms.reduce((s, f) => s + (Number(f.area) || 0), 0);
  const totalText = Number.isInteger(total) ? total : total.toFixed(1);
  const latestSoil = soilReadings?.[0] || null;

  const rowsFor = (farm, isActive) => {
    const crop = isActive ? activeCrop : null;
    const variety = farm.variety || crop?.variety;
    const stage = farm.cropStage || crop?.cropStage;
    const rows = [];
    if (farm.area != null && farm.area !== '') rows.push([t('Area', 'क्षेत्रफळ'), `${farm.area} ${unit}`]);
    const cropText = [pick(farm.cropName || crop?.cropName, isMr), pick(variety, isMr)].filter(Boolean).join(' · ');
    if (cropText) rows.push([t('Crop', 'पीक'), cropText]);
    if (stage) rows.push([t('Growth stage', 'वाढीचा टप्पा'), pick(stage, isMr)]);
    if (farm.soilType) rows.push([t('Soil', 'माती'), pick(farm.soilType, isMr)]);
    if (farm.irrigationType) rows.push([t('Water', 'पाणी'), pick(farm.irrigationType, isMr)]);
    if (isActive && latestSoil?.moisture != null) {
      const d = latestSoil.recordedAt ? new Date(latestSoil.recordedAt).toLocaleDateString(isMr ? 'mr-IN' : 'en-IN', { day: 'numeric', month: 'short' }) : '';
      rows.push([t('Last soil reading', 'शेवटची माती नोंद'),
        `${d ? d + ' · ' : ''}${latestSoil.moisture}% ${t('moisture', 'ओलावा')}${latestSoil.pH != null ? `, pH ${latestSoil.pH}` : ''}`]);
    }
    return rows;
  };

  return (
    <div className="mf">
      <header className="mf-head">
        <div>
          <h1>{t('My Farm', 'माझे शेत')}</h1>
          <p>
            {allFarms.length > 0
              ? `${allFarms.length} ${allFarms.length === 1 ? t('field', 'शेत') : t('fields', 'शेते')} · ${totalText} ${unit} ${t('in total', 'एकूण')}`
              : t('Add your field to get advice for your own crop.', 'तुमच्या पिकासाठी सल्ला मिळवण्यासाठी शेत जोडा.')}
          </p>
        </div>
        {allFarms.length > 0 && (
          <button type="button" className="mf-add" onClick={openAdd}><Plus size={22} />{t('Add field', 'शेत जोडा')}</button>
        )}
      </header>

      {allFarms.length === 0 ? (
        <section className="mf-card mf-empty">
          <span className="mf-empty-icon"><Sprout size={36} /></span>
          <h2>{t('No field added yet', 'अजून शेत जोडलेले नाही')}</h2>
          <p>{t('Add your village, area and crop. Then weather, prices and crop advice will match your field.', 'तुमचे गाव, क्षेत्रफळ व पीक भरा. मग हवामान, भाव व पीक सल्ला तुमच्या शेताप्रमाणे मिळेल.')}</p>
          <button type="button" className="mf-btn" onClick={openAdd}><Plus size={22} />{t('Add your first field', 'पहिले शेत जोडा')}</button>
        </section>
      ) : (
        <ul className="mf-list">
          {allFarms.map((farm) => {
            const isActive = fid(farm) === fid(activeFarm);
            const rows = rowsFor(farm, isActive);
            return (
              <li key={fid(farm)}>
                <article className={`mf-card mf-farm ${isActive ? 'active' : ''}`}>
                  <div className="mf-farm-top">
                    <div className="mf-farm-title">
                      <h2>{farm.farmName}</h2>
                      <p><MapPin size={16} />{[farm.village, farm.district].filter(Boolean).join(', ')}</p>
                    </div>
                    {isActive ? (
                      <span className="mf-active"><CheckCircle2 size={18} />{t('Active', 'सक्रिय')}</span>
                    ) : (
                      <button type="button" className="mf-setactive" onClick={() => setActiveFarmId(fid(farm))}>{t('Make active', 'सक्रिय करा')}</button>
                    )}
                  </div>

                  {rows.length > 0 && (
                    <dl className="mf-rows">
                      {rows.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
                    </dl>
                  )}

                  <div className="mf-actions">
                    <button type="button" className="mf-btn" onClick={() => openSoil(farm)}><Droplets size={20} />{t('Add soil reading', 'माती नोंद करा')}</button>
                    <div className="mf-actions-2">
                      <button type="button" className="mf-btn-line" onClick={() => openEdit(farm)}><Pencil size={18} />{t('Edit', 'बदल करा')}</button>
                      <button type="button" className="mf-btn-line mf-danger" onClick={() => { setError(''); setFarmToDelete(farm); }}><Trash2 size={18} />{t('Delete', 'हटवा')}</button>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      <a href="tel:18001801551" className="mf-call">
        <span className="mf-call-icon"><PhoneCall size={24} /></span>
        <div>
          <span>{t('Need help adding your field? Free expert help', 'शेत जोडण्यात मदत हवी? मोफत तज्ज्ञ मदत')}</span>
          <strong>1800-180-1551</strong>
        </div>
      </a>

      {/* Add / edit field */}
      {farmSheet && (
        <div className="mf-overlay" onClick={() => setFarmSheet(false)}>
          <form className="mf-sheet" onClick={e => e.stopPropagation()} onSubmit={submitFarm}>
            <div className="mf-sheet-head">
              <h3>{editingFarm ? t('Edit field', 'शेताची माहिती बदला') : t('Add a new field', 'नवीन शेत जोडा')}</h3>
              <button type="button" className="mf-close" onClick={() => setFarmSheet(false)} aria-label={t('Close', 'बंद करा')}><X size={22} /></button>
            </div>

            <label className="mf-field">
              <span>{t('Field name', 'शेताचे नाव')} *</span>
              <input type="text" required value={form.farmName} onChange={set('farmName')} />
            </label>
            <label className="mf-field">
              <span>{t('Village', 'गाव')} *</span>
              <input type="text" required value={form.village} onChange={set('village')} />
            </label>
            <Select label={t('District', 'जिल्हा')} value={form.district} onChange={set('district')} required>
              <option value="" disabled>{t('Choose district', 'जिल्हा निवडा')}</option>
              {DISTRICTS.map(d => <option key={d.id} value={d.id}>{isMr ? d.mr : d.id}</option>)}
            </Select>
            <label className="mf-field">
              <span>{t('Area', 'क्षेत्रफळ')} ({unit}) *</span>
              <input type="number" inputMode="decimal" step="0.1" min="0.1" required value={form.area} onChange={set('area')} />
            </label>

            <p className="mf-sec">{t('Crop details (optional)', 'पिकाची माहिती (ऐच्छिक)')}</p>
            <Select label={t('Rice variety', 'भात वाण')} value={form.variety} onChange={set('variety')}>
              <option value="">{t('Not sure / skip', 'माहीत नाही / वगळा')}</option>
              {VARIETIES.map(v => <option key={v} value={v}>{pick(v, isMr)}</option>)}
            </Select>
            <Select label={t('Growth stage now', 'सध्याचा वाढीचा टप्पा')} value={form.cropStage} onChange={set('cropStage')}>
              <option value="">{t('Not sure / skip', 'माहीत नाही / वगळा')}</option>
              {STAGES.map(v => <option key={v} value={v}>{pick(v, isMr)}</option>)}
            </Select>
            <Select label={t('Soil type', 'मातीचा प्रकार')} value={form.soilType} onChange={set('soilType')}>
              <option value="">{t('Not sure / skip', 'माहीत नाही / वगळा')}</option>
              {SOIL_TYPES.map(v => <option key={v} value={v}>{pick(v, isMr)}</option>)}
            </Select>
            <Select label={t('Water source', 'पाण्याचा स्रोत')} value={form.irrigationType} onChange={set('irrigationType')}>
              <option value="">{t('Not sure / skip', 'माहीत नाही / वगळा')}</option>
              {IRRIGATION.map(v => <option key={v} value={v}>{pick(v, isMr)}</option>)}
            </Select>

            {error && <p className="mf-error" role="alert"><AlertTriangle size={18} />{error}</p>}
            <div className="mf-sheet-actions">
              <button type="button" className="mf-btn-cancel" onClick={() => setFarmSheet(false)}>{t('Cancel', 'रद्द करा')}</button>
              <button type="submit" className="mf-btn" disabled={busy}>{busy ? t('Saving…', 'जतन होत आहे…') : editingFarm ? t('Save changes', 'बदल जतन करा') : t('Add field', 'शेत जोडा')}</button>
            </div>
          </form>
        </div>
      )}

      {/* Add soil reading */}
      {soilSheet && (
        <div className="mf-overlay" onClick={() => setSoilSheet(false)}>
          <form className="mf-sheet" onClick={e => e.stopPropagation()} onSubmit={submitSoil}>
            <div className="mf-sheet-head">
              <h3>{t('Add soil reading', 'माती नोंद करा')}</h3>
              <button type="button" className="mf-close" onClick={() => setSoilSheet(false)} aria-label={t('Close', 'बंद करा')}><X size={22} /></button>
            </div>
            {activeFarm && <p className="mf-for"><MapPin size={16} />{activeFarm.farmName}</p>}
            <div className="mf-two">
              <label className="mf-field">
                <span>{t('Soil moisture (%)', 'ओलावा (%)')} *</span>
                <input type="number" inputMode="decimal" min="1" max="100" required value={soilForm.moisture} onChange={e => setSoilForm({ ...soilForm, moisture: e.target.value })} />
              </label>
              <label className="mf-field">
                <span>{t('Soil pH', 'मातीचा सामू (pH)')} *</span>
                <input type="number" inputMode="decimal" step="0.1" min="3" max="10" required value={soilForm.pH} onChange={e => setSoilForm({ ...soilForm, pH: e.target.value })} />
              </label>
            </div>
            <p className="mf-sec">{t('Optional (kg/ha), fill if you have a lab report', 'ऐच्छिक (kg/ha), लॅब रिपोर्ट असल्यास भरा')}</p>
            <div className="mf-three">
              <label className="mf-field"><span>{t('Nitrogen', 'नायट्रोजन')}</span>
                <input type="number" inputMode="decimal" min="0" value={soilForm.nitrogen} onChange={e => setSoilForm({ ...soilForm, nitrogen: e.target.value })} /></label>
              <label className="mf-field"><span>{t('Phosphorus', 'स्फुरद')}</span>
                <input type="number" inputMode="decimal" min="0" value={soilForm.phosphorus} onChange={e => setSoilForm({ ...soilForm, phosphorus: e.target.value })} /></label>
              <label className="mf-field"><span>{t('Potassium', 'पालाश')}</span>
                <input type="number" inputMode="decimal" min="0" value={soilForm.potassium} onChange={e => setSoilForm({ ...soilForm, potassium: e.target.value })} /></label>
            </div>
            {error && <p className="mf-error" role="alert"><AlertTriangle size={18} />{error}</p>}
            <div className="mf-sheet-actions">
              <button type="button" className="mf-btn-cancel" onClick={() => setSoilSheet(false)}>{t('Cancel', 'रद्द करा')}</button>
              <button type="submit" className="mf-btn" disabled={busy}>{busy ? t('Saving…', 'जतन होत आहे…') : t('Save', 'जतन करा')}</button>
            </div>
          </form>
        </div>
      )}

      {/* Delete */}
      {farmToDelete && (
        <div className="mf-overlay" onClick={() => setFarmToDelete(null)}>
          <div className="mf-sheet mf-sheet-del" onClick={e => e.stopPropagation()}>
            <span className="mf-del-icon"><Trash2 size={26} /></span>
            <h3>{t('Delete this field?', 'हे शेत हटवायचे?')}</h3>
            <p>{t(`"${farmToDelete.farmName}" will be removed for good, with its records.`, `"${farmToDelete.farmName}" व त्याच्या नोंदी कायमच्या हटवल्या जातील.`)}</p>
            {error && <p className="mf-error" role="alert"><AlertTriangle size={18} />{error}</p>}
            <div className="mf-sheet-actions">
              <button type="button" className="mf-btn-cancel" onClick={() => setFarmToDelete(null)}>{t('Keep it', 'ठेवा')}</button>
              <button type="button" className="mf-btn mf-btn-red" onClick={confirmDelete} disabled={busy}>{busy ? '…' : t('Yes, delete', 'होय, हटवा')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFarmPage;