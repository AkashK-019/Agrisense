import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DETECTABLE_CONDITIONS, DISEASE_KNOWLEDGE_BASE, cropAnalysisService } from '../services/cropAnalysisService';
import {
  Camera, Image as ImageIcon, AlertTriangle, ShieldCheck, Leaf, ArrowLeft, X,
  ChevronRight, FlaskConical, Sprout, PhoneCall, Zap
} from 'lucide-react';
import '../styles/CropHealthPage.css';

const SEVERITY = {
  None:     { level: 0, color: '#16a34a', bg: '#e6f6ea', ink: '#14532d', en: 'Healthy',        mr: 'निरोगी' },
  Low:      { level: 1, color: '#2b7bb9', bg: '#e4effa', ink: '#1e3a5f', en: 'Low risk',       mr: 'कमी धोका' },
  Moderate: { level: 2, color: '#d97706', bg: '#fef3c7', ink: '#7c4a03', en: 'Moderate risk',  mr: 'मध्यम धोका' },
  High:     { level: 3, color: '#ea580c', bg: '#fde8d8', ink: '#7c2d12', en: 'High risk',      mr: 'जास्त धोका' },
  Critical: { level: 4, color: '#dc2626', bg: '#fde2e2', ink: '#7f1d1d', en: 'Critical',       mr: 'अतिशय धोका' },
};

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '';

export const CropHealthPage = () => {
  const { allFarms, activeFarm, setActiveFarmId, farmer, cropAnalyses, addCropAnalysis, language, setCurrentView } = useApp();
  const isMr = language === 'mr';
  const t = (en, mr) => (isMr ? mr : en);

  const [phase, setPhase] = useState('upload');
  const [selectedImage, setSelectedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [selectedFarmId, setSelectedFarmId] = useState(
    activeFarm?._id || activeFarm?.id || (allFarms[0]?._id || allFarms[0]?.id) || 'general'
  );

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    if (activeFarm?._id || activeFarm?.id) setSelectedFarmId(activeFarm._id || activeFarm.id);
  }, [activeFarm]);

  const targetFarm = allFarms.find(f => (f._id === selectedFarmId || f.id === selectedFarmId)) || activeFarm || {};

  const activeResult = viewItem || result;
  const sev = SEVERITY[activeResult?.severity] || SEVERITY.Moderate;
  const confPct = Math.min(100, Math.max(0, activeResult?.confidence || 0));
  const isHealthy = activeResult?.diseaseName === 'Healthy';
  const hasPastScans = Array.isArray(cropAnalyses) && cropAnalyses.length > 0;
  const showResult = (phase === 'result' || viewItem) && activeResult;

  const processImage = useCallback(async (file) => {
    if (!file?.type?.startsWith('image/')) {
      setErrorMsg({ title: isMr ? 'फोटो चुकीचा आहे' : 'Photo problem', text: isMr ? 'कृपया वैध फोटो फाईल निवडा (JPG, PNG, WEBP).' : 'Please choose a photo (JPG, PNG, WEBP).' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg({ title: isMr ? 'फोटो खूप मोठा आहे' : 'Photo too big', text: isMr ? 'कमाल १० MB चा फोटो वापरा.' : 'Please use a photo under 10 MB.' });
      return;
    }
    setErrorMsg(null); setResult(null); setViewItem(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result;
      if (!dataUrl) return;
      setSelectedImage(dataUrl);
      setPhase('analyzing');

      let prog = 0;
      const tick = setInterval(() => {
        prog = Math.min(prog + Math.random() * 14, 88);
        setProgress(Math.round(prog));
      }, 200);

      try {
        const farmContext = {
          farmId: targetFarm._id || targetFarm.id || null,
          farmName: targetFarm.farmName || '',
          cropName: targetFarm.cropName || '',
          variety: targetFarm.variety || '',
          cropStage: targetFarm.cropStage || '',
          district: targetFarm.district || '',
        };
        const analysisResult = await cropAnalysisService.analyzeCropImage(
          dataUrl,
          farmer?._id || farmer?.id || 'guest',
          targetFarm?._id || targetFarm?.id || null,
          farmContext
        );
        if (analysisResult?._isDemo) throw new Error('Model endpoint is not configured (VITE_CROP_MODEL_ENDPOINT)');
        clearInterval(tick);
        setProgress(100);
        try {
          const { imageUrl: _img, allPredictions: _p, ...meta } = analysisResult;
          await addCropAnalysis({ ...meta, imageUrl: '' });
        } catch {/* non-fatal */}
        setResult(analysisResult);
        setPhase('result');
      } catch (err) {
        clearInterval(tick);
        setProgress(0);
        setPhase('upload');
        setErrorMsg({
          title: isMr ? 'API त्रुटी' : 'API error',
          text: isMr ? 'रोग तपासणी मॉडेल सध्या जोडलेले नाही. कृपया नंतर पुन्हा प्रयत्न करा.' : 'The disease model is not connected right now. Please try again later.',
          detail: err?.message || '',
        });
      }
    };
    reader.readAsDataURL(file);
  }, [farmer, targetFarm, addCropAnalysis, isMr]);

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) processImage(f); };
  const onFileChange = (e) => { const f = e.target.files?.[0]; if (f) processImage(f); e.target.value = ''; };
  const reset = () => {
    setPhase('upload'); setSelectedImage(null);
    setResult(null); setViewItem(null); setErrorMsg(null); setProgress(0);
  };
  const openScan = (it) => { setViewItem(it); setPhase('result'); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const stepLabel =
    progress < 30 ? t('Looking at the leaf…', 'पान पाहत आहे…')
    : progress < 65 ? t('Finding the disease…', 'रोग शोधत आहे…')
    : t('Preparing your advice…', 'सल्ला तयार करत आहे…');

  const conds = DETECTABLE_CONDITIONS || [];
  const sevStyle = { '--sev': sev.color, '--sev-bg': sev.bg, '--sev-ink': sev.ink };
  const rec = activeResult?.recommendations || {};
  const hasRemedy = !isHealthy && (rec.chemicalDosage || rec.organicControl);
  const topFive = [...(activeResult?.allPredictions || [])]
    .filter(p => typeof p?.score === 'number')
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
  const quick = isHealthy
    ? t('No disease found on this leaf. Check your plants again after a few days.', 'या पानावर रोग आढळला नाही. काही दिवसांनी पुन्हा तपासा.')
    : sev.level >= 3
      ? t('Start the treatment below as soon as possible and check the other plants.', 'खालील उपचार लवकरात लवकर सुरू करा आणि इतर झाडेही तपासा.')
      : t('Start the treatment below and check the other plants.', 'खालील उपचार सुरू करा आणि इतर झाडेही तपासा.');
  const STEPS = [
    { en: 'Take a clear photo', enD: 'One leaf, in daylight, close up. No shadow.', mr: 'स्पष्ट फोटो काढा', mrD: 'एकच पान, दिवसाच्या प्रकाशात, जवळून. सावली नको.' },
    { en: 'Wait a few seconds', enD: 'We check the leaf for diseases.', mr: 'काही सेकंद थांबा', mrD: 'पानाची रोगांसाठी तपासणी होते.' },
    { en: 'Follow the advice', enD: 'See which spray to use.', mr: 'सल्ल्याप्रमाणे करा', mrD: 'कोणती फवारणी करायची ते पाहा.' },
  ];

  const HistoryRow = ({ item, onPick }) => {
    const s = SEVERITY[item.severity] || SEVERITY.Moderate;
    return (
      <button type="button" className="cd-list-row" onClick={() => onPick(item)} style={{ '--sev': s.color }}>
        <span className="cd-thumb">{item.imageUrl ? <img src={item.imageUrl} alt="" /> : <Leaf size={22} />}</span>
        <span className="cd-list-text">
          <strong>{item.diseaseName}</strong>
          <span><i className="cd-dot" />{isMr ? s.mr : s.en} · {formatDate(item.createdAt)}</span>
        </span>
        <ChevronRight size={20} />
      </button>
    );
  };

  return (
    <div className="cd">
      <input type="file" ref={fileInputRef} accept="image/*" hidden onChange={onFileChange} />
      <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" hidden onChange={onFileChange} />

      <header className="cd-head">
        <h1>{t('Crop Doctor', 'पीक डॉक्टर')}</h1>
        <p>{t('Take a photo of the leaf. See the disease and which spray to use.', 'पानाचा फोटो काढा. रोग आणि कोणती फवारणी करायची ते पाहा.')}</p>
      </header>

      {phase === 'upload' && !viewItem && (
        <div className="cd-plot">
          <Sprout size={22} />
          <label htmlFor="cd-plot-select">{t('Field', 'शेत')}</label>
          {allFarms.length > 0 ? (
            <select
              id="cd-plot-select"
              value={selectedFarmId}
              onChange={(e) => {
                setSelectedFarmId(e.target.value);
                const f = allFarms.find(farm => (farm._id === e.target.value || farm.id === e.target.value));
                if (f) setActiveFarmId(f._id || f.id);
              }}
            >
              {allFarms.map((farm) => (
                <option key={farm._id || farm.id} value={farm._id || farm.id}>
                  {farm.farmName}{farm.cropName ? ` · ${farm.cropName}` : ''}
                </option>
              ))}
            </select>
          ) : (
            <>
              <strong>{t('No field added yet', 'अजून शेत जोडलेले नाही')}</strong>
              <button type="button" className="cd-link" onClick={() => setCurrentView('myFarm')}>{t('Add field', 'शेत जोडा')}</button>
            </>
          )}
        </div>
      )}

      <div className="cd-grid">
        {/* LEFT: photo + prediction details */}
        <div className="cd-left">
          {errorMsg && (
            <div className="cd-error" role="alert">
              <AlertTriangle size={24} />
              <div>
                <strong>{errorMsg.title}</strong>
                <p>{errorMsg.text}</p>
                {errorMsg.detail && <small>{errorMsg.detail}</small>}
              </div>
            </div>
          )}

          {phase === 'upload' && !viewItem && (
            <section
              className={`cd-card cd-drop ${dragOver ? 'is-over' : ''}`}
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
            >
              <span className="cd-drop-icon"><Leaf size={34} /></span>
              <h2>{t('Upload leaf photo', 'पानाचा फोटो द्या')}</h2>
              <p>{t('Take a photo or drop one here. JPG, PNG, WEBP, up to 10 MB.', 'फोटो काढा किंवा येथे टाका. JPG, PNG, WEBP, कमाल १० MB.')}</p>
              <div className="cd-drop-actions">
                <button type="button" className="cd-btn cd-btn-primary" onClick={() => cameraInputRef.current?.click()}>
                  <Camera size={22} /><span>{t('Take photo', 'फोटो काढा')}</span>
                </button>
                <button type="button" className="cd-btn cd-btn-outline" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon size={20} /><span>{t('Choose from gallery', 'गॅलरीतून निवडा')}</span>
                </button>
              </div>
            </section>
          )}

          {phase === 'analyzing' && (
            <section className="cd-card cd-pic-card">
              <div className="cd-pic">
                {selectedImage && <img src={selectedImage} alt="" />}
                <div className="cd-pic-dim" />
                <div className="cd-laser" />
                <div className="cd-pic-say"><span className="cd-spin" />{t('Analyzing leaf…', 'पान तपासत आहे…')}</div>
              </div>
            </section>
          )}

          {showResult && (
            <>
              <section className="cd-card cd-pic-card">
                <div className="cd-pic">
                  {(activeResult.imageUrl || selectedImage)
                    ? <img src={activeResult.imageUrl || selectedImage} alt="" />
                    : <div className="cd-no-img"><Leaf size={40} /><span>{t('Saved check', 'जतन केलेली तपासणी')}</span></div>}
                  <span className="cd-done"><i />{t('Analysis complete', 'तपासणी पूर्ण')}</span>
                </div>
                <div className="cd-pic-foot">
                  <button type="button" className="cd-btn cd-btn-outline" onClick={reset}>
                    <ArrowLeft size={20} /><span>{t('New scan', 'नवी तपासणी')}</span>
                  </button>
                </div>
              </section>

              {topFive.length > 1 && (
                <section className="cd-card cd-topfive-card">
                  <h3 className="cd-h3">{t('Top 5 predictions', 'पहिल्या ५ शक्यता')}</h3>
                  <div className="cd-pred-list">
                    {topFive.map((p, i) => (
                      <div key={i} className="cd-pred">
                        <div className="cd-pred-row"><span>{p.condition}</span><strong>{p.score.toFixed(1)}%</strong></div>
                        <div className="cd-bar"><i style={{ width: `${Math.min(100, Math.max(2, p.score))}%`, opacity: i === 0 ? 1 : 0.4 }} /></div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </>
          )}
        </div>

        {/* RIGHT: guidance / result */}
        <div className="cd-right">
          {phase === 'upload' && !viewItem && (
            <>
              <section className="cd-card cd-how-card">
                <span className="cd-kicker">{t('How it works', 'कसे काम करते')}</span>
                <ol className="cd-how">
                  {STEPS.map((st, i) => (
                    <li key={i}>
                      <span className="cd-how-no">{i + 1}</span>
                      <div><strong>{isMr ? st.mr : st.en}</strong><p>{isMr ? st.mrD : st.enD}</p></div>
                    </li>
                  ))}
                </ol>
              </section>

              {conds.length > 0 && (
                <section className="cd-card cd-chips-card">
                  <span className="cd-kicker">{conds.length} {t('detectable conditions', 'ओळखता येणारे रोग')}</span>
                  <ul className="cd-chips">
                    {conds.map(c => {
                      const kb = DISEASE_KNOWLEDGE_BASE[c] || {};
                      const label = isMr && kb.marathiDiseaseName ? kb.marathiDiseaseName.split('(')[0].trim() : c;
                      return <li key={c} title={c}>{label}</li>;
                    })}
                  </ul>
                </section>
              )}
            </>
          )}

          {phase === 'analyzing' && (
            <section className="cd-card cd-wait">
              <span className="cd-spin cd-spin-lg" />
              <h3>{t('Processing image', 'फोटो तपासत आहे')}</h3>
              <p>{stepLabel}</p>
              <div className="cd-bar"><i style={{ width: `${progress}%` }} /></div>
              <strong>{progress}%</strong>
            </section>
          )}

          {showResult && (
            <>
              <section className="cd-card cd-result" style={sevStyle}>
                <i className="cd-accent" />
                <div className="cd-res-head">
                  <span className="cd-res-icon">{isHealthy ? <ShieldCheck size={28} /> : <AlertTriangle size={28} />}</span>
                  <div className="cd-res-title">
                    <span className="cd-kicker">{t('Detected condition', 'आढळलेला रोग')}</span>
                    <h2>{isMr && activeResult.marathiDiseaseName ? activeResult.marathiDiseaseName : activeResult.diseaseName}</h2>
                    {activeResult.marathiDiseaseName && (
                      <span className="cd-alt">{isMr ? activeResult.diseaseName : activeResult.marathiDiseaseName}</span>
                    )}
                    <span className="cd-badge">{isMr ? sev.mr : sev.en}</span>
                  </div>
                </div>

                <div className="cd-conf">
                  <div className="cd-conf-row"><span>{t('Confidence score', 'खात्रीची पातळी')}</span><strong>{confPct.toFixed(1)}%</strong></div>
                  <div className="cd-bar cd-bar-sev"><i style={{ width: `${confPct}%` }} /></div>
                  <div className="cd-scale"><span>0%</span><span>50%</span><span>100%</span></div>
                </div>

                <div className="cd-quick">
                  <span className="cd-kicker"><Zap size={15} />{t('Quick action', 'तात्काळ उपाय')}</span>
                  <p>{quick}</p>
                </div>
              </section>

              {hasRemedy && (
                <section className="cd-card cd-rx-card">
                  <h3 className="cd-h3">{t('Treatment plan', 'उपचार योजना')}</h3>
                  <div className="cd-rx">
                    {rec.chemicalDosage && (
                      <div className="cd-rx-item cd-rx-chem">
                        <FlaskConical size={24} />
                        <div><span>{t('Spray (chemical)', 'फवारणी (औषध)')}</span><p>{rec.chemicalDosage}</p></div>
                      </div>
                    )}
                    {rec.organicControl && (
                      <div className="cd-rx-item cd-rx-org">
                        <Sprout size={24} />
                        <div><span>{t('Natural option', 'सेंद्रिय उपाय')}</span><p>{rec.organicControl}</p></div>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>

      {showResult && (activeResult.whatItIs || activeResult.symptoms?.length > 0) && (
        <section className="cd-card cd-about">
          <h3 className="cd-h3">{t('About this disease', 'या रोगाबद्दल')}</h3>
          <div className="cd-about-cols">
            {activeResult.whatItIs && (
              <div>
                <span className="cd-kicker">{t('What it is', 'हा रोग काय आहे')}</span>
                <p>{activeResult.whatItIs}</p>
              </div>
            )}
            {activeResult.symptoms?.length > 0 && (
              <div>
                <span className="cd-kicker">{t('Signs on the leaf', 'पानावरील लक्षणे')}</span>
                <ul>{activeResult.symptoms.map((x, i) => <li key={i}>{x}</li>)}</ul>
              </div>
            )}
          </div>
        </section>
      )}

      {hasPastScans && (
        <section className="cd-card cd-history">
          <div className="cd-row-head">
            <h3 className="cd-h3">{t('Earlier checks', 'मागील तपासण्या')}</h3>
            {cropAnalyses.length > 4 && (
              <button type="button" className="cd-link" onClick={() => setShowAllHistory(true)}>{t('See all', 'सर्व पाहा')}</button>
            )}
          </div>
          <ul className="cd-list">
            {cropAnalyses.slice(0, 4).map((item, i) => (
              <li key={item._id || item.id || i}><HistoryRow item={item} onPick={openScan} /></li>
            ))}
          </ul>
        </section>
      )}

      <a href="tel:18001801551" className="cd-call">
        <span className="cd-call-icon"><PhoneCall size={24} /></span>
        <div>
          <span>{t('Not sure? Talk to an expert, free', 'खात्री नाही? तज्ज्ञांशी बोला, मोफत')}</span>
          <strong>1800-180-1551</strong>
        </div>
      </a>

      {showAllHistory && (
        <div className="cd-overlay" onClick={() => setShowAllHistory(false)}>
          <div className="cd-sheet" onClick={e => e.stopPropagation()}>
            <div className="cd-row-head">
              <h3 className="cd-h3">{t('All checks', 'सर्व तपासण्या')} ({cropAnalyses.length})</h3>
              <button type="button" className="cd-close" onClick={() => setShowAllHistory(false)} aria-label={t('Close', 'बंद करा')}><X size={22} /></button>
            </div>
            <ul className="cd-list cd-sheet-list">
              {cropAnalyses.map((item, i) => (
                <li key={item._id || item.id || i}>
                  <HistoryRow item={item} onPick={(it) => { openScan(it); setShowAllHistory(false); }} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropHealthPage;