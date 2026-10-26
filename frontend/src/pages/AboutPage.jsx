import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight } from 'lucide-react';
import heroBg from '../assets/hero_bg.jpg';
import '../styles/AboutPage.css';

const TOOLS = [
  { id: 'cropHealth',   en: 'Crop Doctor',    mr: 'पीक डॉक्टर',
    dEn: 'Take a photo of a leaf showing damage. The app finds the disease and tells you which spray to use.',
    dMr: 'नुकसान दिसणाऱ्या पानाचा फोटो काढा. ॲप रोग ओळखते आणि कोणती फवारणी करायची ते सांगते.' },
  { id: 'marketPrices', en: 'Market Prices',  mr: 'बाजार भाव',
    dEn: "See today's mandi prices. A 15-day forecast helps you decide when to sell.",
    dMr: 'आजचे बाजार भाव पाहा. १५ दिवसांचा अंदाज कधी विकायचे ते ठरवण्यास मदत करतो.' },
  { id: 'soilWeather',  en: 'Weather & Soil', mr: 'हवामान व माती',
    dEn: 'A 5-day forecast and your soil status, with advice on when to water and when to spray.',
    dMr: '५ दिवसांचा हवामान अंदाज व मातीची स्थिती, तसेच पाणी केव्हा द्यावे व फवारणी केव्हा करावी याचा सल्ला.' },
  { id: 'riskAlerts',   en: 'Risk Alerts',    mr: 'धोका इशारे',
    dEn: 'When humidity, warm nights or rain make disease likely, you get an early warning, so you can spray before the crop is affected.',
    dMr: 'आर्द्रता, उबदार रात्री किंवा पावसामुळे रोगाची शक्यता वाढली की आधीच इशारा मिळतो, म्हणजे पिकावर परिणाम होण्याआधी फवारणी करता येते.' },
  { id: 'voiceAccess',  en: 'Voice Help',     mr: 'आवाज मदत',
    dEn: 'Ask a farming question by speaking. Useful when your hands are dirty from fieldwork.',
    dMr: 'बोलून शेतीचा प्रश्न विचारा. शेतातील कामात हात मळलेले असताना उपयोगी.' },
];

export const AboutPage = () => {
  const { setCurrentView, setIsAuthModalOpen, isAuthenticated, language } = useApp();
  const isMr = language === 'mr';
  const t = (en, mr) => (isMr ? mr : en);

  const open = (id) => {
    if (isAuthenticated) setCurrentView(id);
    else setIsAuthModalOpen(true);
  };

  return (
    <div className="ab">
      <section className="ab-hero">
        <img className="ab-hero-img" src={heroBg} alt="" />
        <div className="ab-hero-in">
          <h1>{t('Made for the people who grow our food.', 'आपल्यासाठी अन्न पिकवणाऱ्यांसाठी.')}</h1>
          <p>
            {t('AgriSense helps farmers catch crop disease early, choose the right day to sell and plan around the weather.',
               'AgriSense शेतकऱ्यांना पिकावरील रोग लवकर ओळखण्यास, विक्रीसाठी योग्य दिवस निवडण्यास आणि हवामानानुसार नियोजन करण्यास मदत करते.')}
          </p>
        </div>
      </section>

      {/* Why */}
      <section className="ab-wrap ab-why">
        <p className="ab-lead">{t('By the time you see spots on the leaf, the disease is already spreading.', 'पानावर डाग दिसेपर्यंत रोग आधीच पसरू लागलेला असतो.')}</p>
        <div className="ab-why-text">
          <p>
            {t('Crop diseases spread fast in warm, wet weather. Prices change from market to market and from week to week. A wrong call on either can cost a farmer a season of work.',
               'उबदार, ओलसर हवामानात पिकावरील रोग वेगाने पसरतात. बाजार भाव प्रत्येक बाजारात आणि प्रत्येक आठवड्यात बदलतात. यापैकी कशातही चुकीचा निर्णय झाला तर एका हंगामाची मेहनत वाया जाऊ शकते.')}
          </p>
          <p>
            {t('Many farmers must decide when to spray, when to water and when to sell without clear information. AgriSense puts that information in one place, in plain language.',
               'अनेक शेतकऱ्यांना स्पष्ट माहितीशिवाय फवारणी केव्हा करायची, पाणी केव्हा द्यायचे आणि कधी विकायचे हे ठरवावे लागते. AgriSense ती माहिती एकाच ठिकाणी, सोप्या भाषेत देते.')}
          </p>
        </div>
      </section>

      {/* Who */}
      <section className="ab-who">
        <div className="ab-wrap ab-who-in">
          <div>
            <h2>{t('Who it is for', 'हे कोणासाठी आहे')}</h2>
            <p className="ab-districts">{t('Every farmer. Every field.', 'प्रत्येक शेतकरी. प्रत्येक शेत.')}</p>
          </div>
          <p className="ab-who-text">
            {t('If you grow a crop and want to protect it and sell it well, AgriSense is for you. It is easy to use even without any technology experience, and it runs on any smartphone with a camera and internet.',
               'तुम्ही कोणतेही पीक घेत असाल आणि त्याचे रक्षण करून चांगल्या भावात विकायचे असेल, तर AgriSense तुमच्यासाठी आहे. तंत्रज्ञानाचा अनुभव नसला तरी वापरणे सोपे आहे, आणि कॅमेरा व इंटरनेट असलेल्या कोणत्याही स्मार्टफोनवर चालते.')}
          </p>
        </div>
      </section>

      {/* Tools */}
      <section className="ab-wrap ab-tools">
        <h2>{t('What it does', 'हे काय करते')}</h2>
        <ul className="ab-rows">
          {TOOLS.map((m) => (
            <li key={m.id}>
              <button type="button" className="ab-row" onClick={() => open(m.id)}>
                <span className="ab-row-title">{isMr ? m.mr : m.en}</span>
                <span className="ab-row-desc">{isMr ? m.dMr : m.dEn}</span>
                <span className="ab-row-open">{t('Open', 'उघडा')}<ArrowRight size={18} /></span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Closing */}
      <section className="ab-wrap ab-close">
        <h2>{t('Ready to try it?', 'वापरून पाहायला तयार?')}</h2>
        <button type="button" className="ab-btn" onClick={() => open('dashboard')}>
          {isAuthenticated ? t('Go to dashboard', 'डॅशबोर्डवर जा') : t('Get started', 'सुरू करा')}<ArrowRight size={20} />
        </button>
      </section>
    </div>
  );
};

export default AboutPage;