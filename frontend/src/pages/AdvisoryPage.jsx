import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { advisoryService, KONKAN_RICE_STAGES } from '../services/advisoryService';
import {
  Bookmark, Send, BookmarkCheck, Search, BookOpen,
  HelpCircle, ChevronRight, Wheat, MessageSquare, Clock,
  User, X, Filter, Sparkles, CheckCircle2, Droplets,
  Sprout, AlertTriangle, ShieldCheck, PhoneCall, Calendar
} from 'lucide-react';
import '../styles/AdvisoryPage.css';

const CATEGORIES = [
  'all',
  'Crop Management',
  'Irrigation Guidance',
  'Fertilizer Guidance',
  'Pest & Disease Prevention',
  'Rice Cultivation Practices',
];

const CAT_LABELS = {
  'all':                        { en: 'All Practices',    mr: 'सर्व पद्धती' },
  'Crop Management':            { en: 'Crop Care',        mr: 'पीक निगा' },
  'Irrigation Guidance':        { en: 'Water & Drainage', mr: 'पाणी व्यवस्थापन' },
  'Fertilizer Guidance':        { en: 'Fertilizer Doses', mr: 'खत मात्रा' },
  'Pest & Disease Prevention':  { en: 'Pest & Diseases',  mr: 'कीड व रोग' },
  'Rice Cultivation Practices': { en: 'Rice Varieties',   mr: 'भात लागवड' },
};

export const AdvisoryPage = () => {
  const { advisories, toggleSaveAdvisory, language } = useApp();
  const isMr = language === 'mr';

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery]           = useState('');
  const [selectedStageIndex, setSelectedStageIndex] = useState(2);

  const [qaInput, setQaInput]   = useState('');
  const [qaHistory, setQaHistory] = useState([
    {
      q: isMr ? 'भाताच्या पानांवर पिवळे व करडे ठिपके आल्यास काय करावे?' : 'What should I do if my rice leaves show yellow or brown spindle spots?',
      a: isMr
        ? 'पानांवर करडे-तपकिरी ठिपके असल्यास हा करपा (Rice Blast) असू शकतो. ट्रायसायक्लॅझोल ७५ डब्लूपी (०.६ ग्रॅम/लिटर) फवारावे आणि खाचरात ३-५ सेमी पाणी ठेवावे.'
        : 'Yellow or spindle-shaped spots with grey centers in Konkan usually indicate Rice Blast (Magnaporthe oryzae). Spray Tricyclazole 75 WP @ 0.6 g/L of water at the first sign of lesions and maintain 3–5 cm shallow standing water.',
      source: 'Dr. BSKKV Dapoli',
      timestamp: isMr ? 'काल' : 'Yesterday',
    },
  ]);
  const [isAsking, setIsAsking] = useState(false);

  const activeStage = KONKAN_RICE_STAGES[selectedStageIndex] || KONKAN_RICE_STAGES[0];

  const filteredAdvisories = advisories.filter(a => {
    if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.title?.toLowerCase().includes(q) ||
        a.marathiTitle?.toLowerCase().includes(q) ||
        a.content?.toLowerCase().includes(q) ||
        a.marathiContent?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!qaInput.trim() || isAsking) return;
    const query = qaInput;
    setQaInput('');
    setIsAsking(true);
    try {
      const res = await advisoryService.askAgronomyQuestion(query, language);
      setQaHistory(prev => [{
        q: query,
        a: res.answer,
        source: res.source,
        timestamp: isMr ? 'आत्ताच' : 'Just now'
      }, ...prev]);
    } catch (err) {
      console.error('QA error:', err);
    } finally {
      setIsAsking(false);
    }
  };

  const sampleQuestions = [
    isMr ? 'पानांवर पिवळे ठिपके आल्यास काय करावे?' : 'What if my rice leaves show yellow spots?',
    isMr ? 'खोडकिड्याचे नियंत्रण कसे करावे?'     : 'How to control stem borer in paddy?',
    isMr ? 'लोंबी लागताना युरिया किती द्यावा?'    : 'Fertilizer dose for panicle stage?',
  ];

  const displayTitle = (adv) =>
    isMr && adv.marathiTitle ? adv.marathiTitle : adv.title;
  const displayContent = (adv) =>
    isMr && adv.marathiContent ? adv.marathiContent : adv.content;

  return (
    <div className="adv-root">

      {/* Page Header */}
      <header className="adv-page-header">
        <div className="adv-header-left">
          <div className="adv-ph-icon">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="adv-page-title">
              {isMr ? 'कृषी सल्लागार व पीक निगा' : 'Crop Advisory & Field Guide'}
            </h1>
            <p className="adv-page-subtitle">
              {isMr
                ? 'डॉ. बाळासाहेब सावंत कोकण कृषी विद्यापीठ (BSKKV) प्रमाणित शिफारशी'
                : 'Verified agronomic guidance & crop lifecycle practices for Konkan farming'}
            </p>
          </div>
        </div>

        <div className="adv-header-meta">
          <span className="adv-badge-verified">
            <ShieldCheck size={14} />
            {isMr ? 'कृषी तज्ञ प्रमाणित' : 'Agronomy Verified'}
          </span>
          <span className="adv-badge-count">
            <Wheat size={14} />
            {advisories.length} {isMr ? 'मार्गदर्शिका' : 'Guides'}
          </span>
        </div>
      </header>

      {/* Plantix-Style Crop */}
      <section className="adv-stages-section">
        <div className="adv-stages-header">
          <h2>{isMr ? 'भात पीक वाढीच्या टप्प्यानुसार निगा' : 'Crop Growth Stages & Care'}</h2>
          <span className="adv-stages-hint">
            {isMr ? 'टप्पा निवडून खत व पाणी व्यवस्थापन पाहा 👇' : 'Select a stage to view water, fertilizer & pest advice 👇'}
          </span>
        </div>

        <div className="adv-stage-pills-row">
          {KONKAN_RICE_STAGES.map((stg, idx) => {
            const isSelected = selectedStageIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                className={`adv-stage-pill ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedStageIndex(idx)}
              >
                <span className="adv-sp-num">{idx + 1}</span>
                <div className="adv-sp-info">
                  <span className="adv-sp-name">{isMr ? stg.marathiStage.split(' ')[0] : stg.stage.split(' ')[0]}</span>
                  <span className="adv-sp-days">{stg.daysAfterSowing}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage */}
        <div className="adv-stage-detail-card">
          <div className="adv-sdc-top">
            <div className="adv-sdc-title-box">
              <span className="adv-sdc-step-badge">Stage {selectedStageIndex + 1} of 6</span>
              <h3 className="adv-sdc-title">
                {isMr ? activeStage.marathiStage : activeStage.stage}
              </h3>
              <span className="adv-sdc-duration">⏱️ {activeStage.daysAfterSowing}</span>
            </div>
          </div>

          <div className="adv-sdc-grid">
            {/* Key Practices */}
            <div className="adv-sdc-box practices">
              <h4>
                <CheckCircle2 size={16} />
                <span>{isMr ? 'महत्त्वाच्या कृषी कृती' : 'Recommended Practices'}</span>
              </h4>
              <ul>
                {activeStage.keyPractices.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            {/* Water & */}
            <div className="adv-sdc-right-col">
              <div className="adv-sdc-box water">
                <h4>
                  <Droplets size={16} />
                  <span>{isMr ? 'पाणी व्यवस्थापन' : 'Water Level Management'}</span>
                </h4>
                <p className="adv-sdc-highlight">{activeStage.waterDepthCm}</p>
              </div>

              <div className="adv-sdc-box fertilizer">
                <h4>
                  <Sprout size={16} />
                  <span>{isMr ? 'खत मात्रा (Fertilizer)' : 'Fertilizer Application'}</span>
                </h4>
                <p>{activeStage.fertilizerDose}</p>
              </div>

              {activeStage.commonRisks?.length > 0 && (
                <div className="adv-sdc-box risks">
                  <h4>
                    <AlertTriangle size={15} />
                    <span>{isMr ? 'संभाव्य कीड व धोके' : 'Key Risks to Monitor'}</span>
                  </h4>
                  <div className="adv-risk-pills">
                    {activeStage.commonRisks.map((r, i) => (
                      <span key={i} className="adv-risk-pill">{r}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Ask Agronomist */}
      <section className="adv-qa-card">
        <div className="adv-qa-head">
          <div className="adv-qa-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="adv-qa-title">
              {isMr ? 'कृषी तज्ज्ञांना विचारा (Instant Agronomist AI)' : 'Ask Crop Agronomist AI'}
            </h2>
            <p className="adv-qa-subtitle">
              {isMr
                ? 'कोणतीही समस्या किंवा रोगाबद्दल विचारा — विद्यापीठाच्या मार्गदर्शिकेतून उत्तर मिळवा'
                : 'Ask any farming query — Get instant solutions from verified agronomy database'}
            </p>
          </div>
        </div>

        <form onSubmit={handleAskQuestion} className="adv-qa-form">
          <div className="adv-qa-input-wrap">
            <MessageSquare size={16} className="adv-qa-input-icon" />
            <input
              type="text"
              value={qaInput}
              onChange={e => setQaInput(e.target.value)}
              placeholder={
                isMr
                  ? 'उदा. भातावरील करपा रोगाचा उपाय काय?'
                  : 'e.g. How to control stem borer organically in rice?'
              }
              className="adv-qa-input"
            />
          </div>
          <button
            type="submit"
            disabled={isAsking || !qaInput.trim()}
            className="adv-qa-btn"
          >
            {isAsking ? <div className="adv-spinner" /> : <Send size={15} />}
            <span>{isAsking ? (isMr ? 'शोधत आहे…' : 'Searching…') : (isMr ? 'सल्ला मिळवा' : 'Ask Query')}</span>
          </button>
        </form>

        {/* Sample Prompt */}
        <div className="adv-chips-row">
          <span className="adv-chips-label">{isMr ? 'उदाहरणे:' : 'Try asking:'}</span>
          {sampleQuestions.map((q, i) => (
            <button
              key={i}
              type="button"
              className="adv-chip"
              onClick={() => setQaInput(q)}
            >
              <ChevronRight size={12} />
              {q}
            </button>
          ))}
        </div>

        {/* Q&A History */}
        {qaHistory.length > 0 && (
          <div className="adv-qa-history">
            {qaHistory.map((item, i) => (
              <div key={i} className="adv-qa-item">
                <div className="adv-qa-q">
                  <span className="adv-qa-q-label">Q</span>
                  <p className="adv-qa-q-text">{item.q}</p>
                </div>
                <div className="adv-qa-a">
                  <div className="adv-qa-a-icon">
                    <BookOpen size={13} />
                  </div>
                  <div className="adv-qa-a-body">
                    <p className="adv-qa-a-text">{item.a}</p>
                    <div className="adv-qa-meta">
                      <span><User size={11} /> {item.source}</span>
                      <span><Clock size={11} /> {item.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Verified Agronomy */}
      <section className="adv-guides-section">
        <div className="adv-guides-header">
          <div className="adv-gh-left">
            <h2>{isMr ? 'सर्व कृषी मार्गदर्शिका' : 'All Farming Guides & Practices'}</h2>
            <span className="adv-gh-count">
              {filteredAdvisories.length} {isMr ? 'लेख उपलब्ध' : 'guides available'}
            </span>
          </div>

          <div className="adv-search-box">
            <Search size={15} className="adv-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isMr ? 'रोग, खते किंवा कीटक शोधा...' : 'Search guides, pests, fertilizers...'}
              className="adv-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="adv-search-clear"
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="adv-cat-pills-row">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`adv-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
            >
              {isMr ? (CAT_LABELS[cat]?.mr || cat) : (CAT_LABELS[cat]?.en || cat)}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="adv-grid">
          {filteredAdvisories.length === 0 ? (
            <div className="adv-empty">
              <div className="adv-empty-icon"><Search size={28} /></div>
              <p className="adv-empty-title">{isMr ? 'कोणतेही मार्गदर्शन सापडले नाही' : 'No guides found'}</p>
              <p className="adv-empty-desc">{isMr ? 'कृपया वेगळा शब्द शोधून पहा' : 'Try searching for another keyword or clear filters'}</p>
              <button
                type="button"
                className="adv-empty-reset"
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              >
                {isMr ? 'फिल्टर हटवा' : 'Clear Filters'}
              </button>
            </div>
          ) : (
            filteredAdvisories.map(adv => (
              <article key={adv._id || adv.id} className="adv-card">
                <div className="adv-card-top">
                  <span className="adv-card-stage">{adv.stage || 'General'}</span>
                  <button
                    type="button"
                    onClick={() => toggleSaveAdvisory(adv._id || adv.id)}
                    className={`adv-card-save ${adv.saved ? 'saved' : ''}`}
                    title={adv.saved ? 'Saved' : 'Save advisory'}
                  >
                    {adv.saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  </button>
                </div>

                <div className="adv-card-body">
                  <span className="adv-card-category">{adv.category}</span>
                  <h3 className="adv-card-title">{displayTitle(adv)}</h3>
                  <p className="adv-card-desc">{displayContent(adv)}</p>
                </div>

                <div className="adv-card-footer">
                  <span className="adv-card-author">
                    <span className="adv-author-dot" />
                    {adv.author || 'Dr. BSKKV Agronomy'}
                  </span>
                  <span className="adv-card-verified">✓ {isMr ? 'प्रमाणित' : 'Verified'}</span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Helpline Support */}
      <footer className="adv-helpline-strip">
        <div className="adv-helpline-left">
          <span className="adv-helpline-emoji">🌾</span>
          <div>
            <h4 className="adv-helpline-title">
              {isMr ? 'पिकावरील समस्येसाठी थेट कृषी तज्ज्ञांशी बोला' : 'Talk directly to Kisan Call Centre Agricultural Experts'}
            </h4>
            <p className="adv-helpline-sub">
              {isMr
                ? 'टोल-फ्री शेतकरी हेल्पलाइन · सकाळी ६ ते रात्री १०'
                : 'Toll-free Kisan Call Centre · 6:00 AM – 10:00 PM daily'}
            </p>
          </div>
        </div>

        <a href="tel:18001801551" className="adv-helpline-btn">
          <PhoneCall size={14} />
          <span>1800-180-1551</span>
        </a>
      </footer>

    </div>
  );
};

export default AdvisoryPage;