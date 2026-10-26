import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight } from 'lucide-react';
import heroBg from '../assets/hero_bg.jpg';
import '../styles/LandingPage.css';

/* Each tool is shown as the question a farmer actually asks */
const QUESTIONS = [
  { view: 'cropHealth',
    qEn: 'Is my crop sick?', qMr: 'माझे पीक आजारी आहे का?',
    tEn: 'Crop Doctor', tMr: 'पीक डॉक्टर',
    dEn: 'Photograph a leaf. Get the disease name and which spray to use, in seconds.',
    dMr: 'पानाचा फोटो काढा. रोगाचे नाव आणि कोणती फवारणी करायची ते काही सेकंदात.' },
  { view: 'marketPrices',
    qEn: 'When should I sell?', qMr: 'मी कधी विकू?',
    tEn: 'Market Prices', tMr: 'बाजार भाव',
    dEn: "Today's mandi prices and a 15-day forecast, to help you pick the day to sell.",
    dMr: 'आजचे बाजार भाव आणि १५ दिवसांचा अंदाज, विक्रीचा योग्य दिवस ठरवण्यासाठी.' },
  { view: 'soilWeather',
    qEn: 'Will it rain before I spray?', qMr: 'फवारणीआधी पाऊस येईल का?',
    tEn: 'Weather & Soil', tMr: 'हवामान व माती',
    dEn: '5-day forecast and soil status, so you can plan watering and spraying.',
    dMr: '५ दिवसांचा हवामान अंदाज व मातीची स्थिती, म्हणजे पाणी देणे व फवारणीचे नियोजन करता येते.' },
  { view: 'riskAlerts',
    qEn: 'What should I watch for?', qMr: 'कशावर लक्ष ठेवू?',
    tEn: 'Risk Alerts', tMr: 'धोका इशारे',
    dEn: 'Early warnings for disease, pests and rain, before the crop is hurt.',
    dMr: 'पिकाचे नुकसान होण्याआधी रोग, कीड व पावसाचे इशारे.' },
  { view: 'voiceAccess',
    qEn: 'Can I just ask?', qMr: 'मी फक्त बोलून विचारू का?',
    tEn: 'Voice Help', tMr: 'आवाज मदत',
    dEn: 'Speak your question. No typing needed.',
    dMr: 'बोलून प्रश्न विचारा. टाईप करण्याची गरज नाही.' },
];

export const LandingPage = () => {
  const { setCurrentView, setIsAuthModalOpen, isAuthenticated, language } = useApp();
  const isMr = language === 'mr';
  const t = (en, mr) => (isMr ? mr : en);

  const go = (view) => {
    if (isAuthenticated) setCurrentView(view);
    else setIsAuthModalOpen(true);
  };
  const cta = isAuthenticated ? t('Open my dashboard', 'माझा डॅशबोर्ड उघडा') : t('Get started', 'सुरू करा');

  const STEPS = [
    { en: 'Sign in once', enD: 'Your field details are saved for next time.', mr: 'एकदा लॉगिन करा', mrD: 'तुमच्या शेताची माहिती पुढच्या वेळेसाठी जतन होते.' },
    { en: 'Pick a tool', enD: 'Check a leaf, see prices, read the weather or ask a question.', mr: 'साधन निवडा', mrD: 'पान तपासा, भाव पाहा, हवामान वाचा किंवा प्रश्न विचारा.' },
    { en: 'Follow the advice', enD: 'Clear answers: what to spray and when to sell.', mr: 'सल्ल्याप्रमाणे करा', mrD: 'स्पष्ट उत्तरे: कोणती फवारणी करायची आणि कधी विकायचे.' },
  ];

  return (
    <div className={`lp ${isAuthenticated ? 'lp-authed' : ''}`}>
      {/* Hero: one full screen under the top bar */}
      <section className="lp-hero">
        <img className="lp-hero-img" src={heroBg} alt="" />
        <div className="lp-hero-in">
          <h1>
            <span>{t('Spot it early.', 'लवकर ओळखा.')}</span>
            <span>{t('Spray it right.', 'अचूक फवारा.')}</span>
            <span className="lp-it">{t('Sell it well.', 'योग्य भाव मिळवा.')}</span>
          </h1>
          <p>
            {t('AgriSense looks at your leaf, your weather and the market, then tells you what to do next.',
               'AgriSense तुमचे पान, तुमचे हवामान आणि बाजार पाहून पुढे काय करायचे ते सांगते.')}
          </p>
          <div className="lp-hero-actions">
            <button type="button" className="lp-btn" onClick={() => go('dashboard')}>
              {cta}<ArrowRight size={20} />
            </button>
            <button type="button" className="lp-hero-link" onClick={() => setCurrentView('aboutProject')}>
              {t('About AgriSense', 'AgriSense बद्दल')}
            </button>
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="lp-wrap lp-q-sec">
        <h2>{t('Questions every farmer asks.', 'प्रत्येक शेतकऱ्याला पडणारे प्रश्न.')}</h2>
        <ul className="lp-qs">
          {QUESTIONS.map((q) => (
            <li key={q.view}>
              <button type="button" className="lp-q" onClick={() => go(q.view)}>
                <span className="lp-q-text">{isMr ? q.qMr : q.qEn}</span>
                <span className="lp-q-info">
                  <strong>{isMr ? q.tMr : q.tEn}</strong>
                  <span>{isMr ? q.dMr : q.dEn}</span>
                </span>
                <span className="lp-q-go">{t('Open', 'उघडा')}<ArrowRight size={18} /></span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section className="lp-how">
        <div className="lp-wrap">
          <h2>{t('How it works', 'कसे वापरावे')}</h2>
          <ol className="lp-steps">
            {STEPS.map((s, i) => (
              <li key={i}>
                <span className="lp-step-no">{i + 1}</span>
                <strong>{isMr ? s.mr : s.en}</strong>
                <p>{isMr ? s.mrD : s.enD}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing */}
      <section className="lp-wrap lp-close">
        <div className="lp-close-main">
          <h2>{t('Start protecting your harvest today.', 'आजच तुमच्या पिकाचे रक्षण सुरू करा.')}</h2>
          <button type="button" className="lp-btn" onClick={() => go('dashboard')}>
            {cta}<ArrowRight size={20} />
          </button>
        </div>
        <p className="lp-foot">AgriSense · {t('simple advice for every farmer', 'प्रत्येक शेतकऱ्यासाठी सोपा सल्ला')}</p>
      </section>
    </div>
  );
};

export default LandingPage;