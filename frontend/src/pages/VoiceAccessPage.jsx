import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { voiceService } from '../services/voiceService';
import {
  Mic, MicOff, Square, Send, Volume2, VolumeX,
  Sprout, ChevronRight, Tractor, Leaf, BarChart2,
  Droplets, Sun, Wind, X
} from 'lucide-react';
import '../styles/VoiceAccessPage.css';

// ─── Farm context builder ────────────────────────────────────────────────────
function buildFarmContext(allFarms, allCrops, soilReadings, farmer, query) {
  const q = (query || '').toLowerCase();

  // Try to match "farm 1", "farm 2", "my first farm", etc.
  const numMatch = q.match(/farm\s*(\d+)|(\d+)(?:st|nd|rd|th)?\s*farm/i);
  const numIndex = numMatch ? parseInt(numMatch[1] || numMatch[2]) - 1 : -1;

  let targetFarm = null;
  if (numIndex >= 0 && allFarms[numIndex]) {
    targetFarm = allFarms[numIndex];
  } else if (q.includes('my farm') || q.includes('माझे शेत') || q.includes('my field')) {
    targetFarm = allFarms[0] || null;
  } else {
    // Try to match by name
    targetFarm = allFarms.find(f => q.includes((f.farmName || f.name || '').toLowerCase())) || allFarms[0];
  }

  if (!targetFarm) return null;

  const farmCrops = allCrops.filter(c => c.farmId === targetFarm._id || c.farm === targetFarm._id);
  const farmSoil = soilReadings.filter(s => s.farmId === targetFarm._id || s.farm === targetFarm._id);
  const latestSoil = farmSoil.length ? farmSoil[farmSoil.length - 1] : null;

  return { farm: targetFarm, crops: farmCrops, soil: latestSoil };
}

// ─── Generate farm-aware answer ──────────────────────────────────────────────
function generateFarmAnswer(ctx, query, lang) {
  if (!ctx) return null;
  const { farm, crops, soil } = ctx;
  const q = query.toLowerCase();
  const name = farm.farmName || farm.name || 'Your Farm';
  const area = farm.totalArea ? `${farm.totalArea} ${farm.areaUnit || 'acres'}` : '';
  const loc = farm.location || farm.village || farm.district || '';
  const cropList = crops.map(c => c.variety || c.cropName || c.name).filter(Boolean).join(', ') || 'No crops recorded';

  const _t = (mr, en) => lang === 'mr' ? mr : en;

  // What can I grow
  if (q.includes('grow') || q.includes('पिकवू') || q.includes('पीक') || q.includes('what crop')) {
    const soilNote = soil ? ` Soil pH is ${soil.ph || 'N/A'} and N-P-K: ${soil.nitrogen || '?'}-${soil.phosphorus || '?'}-${soil.potassium || '?'}.` : '';
    return _t(
      `${name} मध्ये (${area}${loc ? ', ' + loc : ''}) भात, ऊस, कांदा, भाजीपाला यापैकी पिके घेता येतात.${soilNote ? ' माती pH: ' + (soil?.ph || 'N/A') + '.' : ''} सध्या नोंदवलेली पिके: ${cropList}.`,
      `${name} (${area}${loc ? ', ' + loc : ''}) can support paddy, sugarcane, onion, or vegetables based on your soil.${soilNote} Current recorded crops: ${cropList}.`
    );
  }

  // Check / tell about my farm
  if (q.includes('check') || q.includes('tell me') || q.includes('about') || q.includes('माझ्या') || q.includes('details') || q.includes('info')) {
    const soilNote = soil
      ? _t(`माती pH: ${soil.ph || 'N/A'}, नत्र: ${soil.nitrogen || 'N/A'}, स्फुरद: ${soil.phosphorus || 'N/A'}, पालाश: ${soil.potassium || 'N/A'}.`,
          `Soil pH: ${soil.ph || 'N/A'}, Nitrogen: ${soil.nitrogen || 'N/A'}, Phosphorus: ${soil.phosphorus || 'N/A'}, Potassium: ${soil.potassium || 'N/A'}.`)
      : _t('माती तपासणी नोंद नाही.', 'No soil test recorded yet.');
    return _t(
      `${name}: क्षेत्र ${area}${loc ? ', ' + loc : ''}. चालू पिके: ${cropList}. ${soilNote}`,
      `${name}: Area ${area}${loc ? ', ' + loc : ''}. Current crops: ${cropList}. ${soilNote}`
    );
  }

  // Soil health
  if (q.includes('soil') || q.includes('माती') || q.includes('ph') || q.includes('nitrogen')) {
    if (!soil) return _t(
      `${name} साठी अजून माती परीक्षण नोंद नाही. माती परीक्षण करणे महत्वाचे आहे.`,
      `No soil test recorded for ${name} yet. Please add a soil test from the Soil & Weather tab.`
    );
    return _t(
      `${name} ची माती: pH ${soil.ph || 'N/A'}, नत्र ${soil.nitrogen || 'N/A'} kg/ha, स्फुरद ${soil.phosphorus || 'N/A'} kg/ha, पालाश ${soil.potassium || 'N/A'} kg/ha.`,
      `${name} soil: pH ${soil.ph || 'N/A'}, Nitrogen ${soil.nitrogen || 'N/A'} kg/ha, Phosphorus ${soil.phosphorus || 'N/A'} kg/ha, Potassium ${soil.potassium || 'N/A'} kg/ha.`
    );
  }

  // Crops on farm
  if (q.includes('crop') || q.includes('पीक') || q.includes('plant')) {
    return _t(
      `${name} वर सध्या ${crops.length} पिक(े) नोंदवली आहेत: ${cropList}.`,
      `${name} currently has ${crops.length} crop(s) recorded: ${cropList}.`
    );
  }

  // Default farm summary
  return _t(
    `${name}: ${area}${loc ? ', ' + loc : ''}. पिके: ${cropList}.`,
    `${name}: ${area}${loc ? ', ' + loc : ''}. Crops: ${cropList}.`
  );
}

// ─── Suggested prompts ───────────────────────────────────────────────────────
const SUGGESTIONS = {
  mr: [
    'माझ्या शेत १ बद्दल सांगा',
    'माझ्या शेतात काय पिकवू शकतो?',
    'भाताच्या करपा रोगावर उपाय?',
    'खताचा दुसरा डोस कधी द्यावा?',
    'सध्या भाताचा बाजारभाव काय आहे?',
  ],
  en: [
    'Tell me about my farm 1',
    'What crops can I grow in my farm?',
    'What spray for rice blast disease?',
    'When to apply second urea dose?',
    'What is current paddy market price?',
  ]
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const VoiceAccessPage = () => {
  const {
    language, setLanguage,
    allFarms, allCrops, soilReadings,
    activeFarm, activeCrop,
    farmer,
    addVoiceQuery,
  } = useApp();

  const isMr = language === 'mr';
  const _t = (mr, en) => isMr ? mr : en;

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: isMr
        ? `नमस्कार! मी AgriSense AI सल्लागार आहे. तुमच्या शेती, पिकांबद्दल किंवा बाजारभावाबद्दल कोणताही प्रश्न विचारा.`
        : `Hello! I'm your AgriSense AI Farm Advisor. Ask me anything about your farm, crops, diseases, or market prices.`,
      timestamp: Date.now()
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [speakingMsgId, setSpeakingMsgId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Update welcome msg on language change
  useEffect(() => {
    setMessages(prev => prev.map(m =>
      m.id === 'welcome'
        ? { ...m, text: isMr
            ? 'नमस्कार! मी AgriSense AI सल्लागार आहे. तुमच्या शेती, पिकांबद्दल किंवा बाजारभावाबद्दल कोणताही प्रश्न विचारा.'
            : "Hello! I'm your AgriSense AI Farm Advisor. Ask me anything about your farm, crops, diseases, or market prices."
          }
        : m
    ));
  }, [language]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed || isProcessing) return;

    const userMsg = { id: `u${Date.now()}`, role: 'user', text: trimmed, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setInterimText('');
    setIsProcessing(true);
    setErrorMsg('');

    try {
      // 1. Check if it's a farm-related query
      const farmCtx = buildFarmContext(allFarms, allCrops, soilReadings, farmer, trimmed);
      const farmAnswer = farmCtx ? generateFarmAnswer(farmCtx, trimmed, language) : null;

      let answerText, source;

      if (farmAnswer) {
        answerText = farmAnswer;
        source = _t('शेत माहिती (AgriSense DB)', 'Farm Data (AgriSense DB)');
      } else {
        // 2. Call AI service
        const result = await voiceService.fetchAdvisorAnswer(
          trimmed,
          language,
          activeCrop?.variety || activeFarm?.primaryCrop || 'Paddy',
          activeCrop?.cropStage || 'Tillering'
        );
        answerText = result.text;
        source = result.source;
      }

      const aiMsg = {
        id: `a${Date.now()}`,
        role: 'assistant',
        text: answerText,
        source,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMsg]);
      addVoiceQuery({ queryText: trimmed, answerText, source, timestamp: new Date().toISOString() });

      // Auto-speak the response
      speakMessage(aiMsg.id, answerText);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `err${Date.now()}`,
        role: 'assistant',
        text: _t('माफ करा, उत्तर मिळवण्यात अडचण आली. पुन्हा प्रयत्न करा.', 'Sorry, I had trouble getting a response. Please try again.'),
        timestamp: Date.now(),
        isError: true
      }]);
    } finally {
      setIsProcessing(false);
    }
  }, [allFarms, allCrops, soilReadings, farmer, language, activeCrop, activeFarm, isProcessing]);

  const speakMessage = (id, text) => {
    voiceService.stopSpeaking();
    setSpeakingMsgId(id);
    setIsSpeaking(true);
    voiceService.speakText(text, language,
      () => { setIsSpeaking(false); setSpeakingMsgId(null); },
      () => { setIsSpeaking(false); setSpeakingMsgId(null); }
    );
  };

  const stopSpeaking = () => {
    voiceService.stopSpeaking();
    setIsSpeaking(false);
    setSpeakingMsgId(null);
  };

  const toggleMic = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      setInterimText('');
      return;
    }
    if (!voiceService.isSpeechRecognitionSupported()) {
      setErrorMsg(_t('या ब्राउझरमध्ये माईक समर्थन नाही. खाली टाइप करा.', 'Speech not supported in this browser. Please type below.'));
      return;
    }
    // Stop speaking before listening
    stopSpeaking();
    setErrorMsg('');
    setIsListening(true);
    setInterimText(_t('ऐकत आहे...', 'Listening...'));

    voiceService.startListening(
      language,
      (interim) => setInterimText(interim),
      (final) => {
        setIsListening(false);
        setInterimText('');
        if (final.trim()) sendMessage(final);
      },
      (err) => {
        setIsListening(false);
        setInterimText('');
        setErrorMsg(err);
      },
      () => setIsListening(false)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const suggestions = SUGGESTIONS[isMr ? 'mr' : 'en'];

  return (
    <div className="va-root">
      {/* ── Header ── */}
      <div className="va-header">
        <div className="va-header-left">
          <div className="va-avatar">
            <Sprout size={18} />
          </div>
          <div>
            <div className="va-header-name">AgriSense AI</div>
            <div className="va-header-status">
              <span className="va-status-dot" />
              {_t('सल्लागार ऑनलाइन', 'Farm Advisor Online')}
            </div>
          </div>
        </div>

      </div>

      {/* ── Farm Context Strip ── */}
      {allFarms.length > 0 && (
        <div className="va-context-strip">
          <Tractor size={13} />
          <span>
            {allFarms.length} {_t('शेते', 'farms')} &nbsp;·&nbsp;
            {allCrops.length} {_t('पिके', 'crops')} &nbsp;·&nbsp;
            {_t('"माझे शेत १ बद्दल सांगा" असे विचारा', 'Try: "Tell me about farm 1"')}
          </span>
        </div>
      )}

      {/* ── Messages ── */}
      <div className="va-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`va-msg-row ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="va-msg-avatar"><Sprout size={14} /></div>
            )}
            <div className={`va-bubble ${msg.role} ${msg.isError ? 'error' : ''}`}>
              <p>{msg.text}</p>
              {msg.role === 'assistant' && msg.source && (
                <div className="va-bubble-meta">{msg.source}</div>
              )}
              {msg.role === 'assistant' && !msg.isError && (
                <button
                  className="va-speak-btn"
                  onClick={() => speakingMsgId === msg.id ? stopSpeaking() : speakMessage(msg.id, msg.text)}
                  title={speakingMsgId === msg.id ? 'Stop' : 'Listen'}
                >
                  {speakingMsgId === msg.id
                    ? <><Square size={10} /> {_t('थांबवा', 'Stop')}</>
                    : <><Volume2 size={10} /> {_t('ऐका', 'Listen')}</>
                  }
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="va-msg-row assistant">
            <div className="va-msg-avatar"><Sprout size={14} /></div>
            <div className="va-bubble assistant">
              <div className="va-typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggestions (only when no conversation yet) ── */}
      {messages.length <= 1 && (
        <div className="va-suggestions">
          {suggestions.map((s, i) => (
            <button key={i} className="va-suggestion-chip" onClick={() => sendMessage(s)}>
              <Leaf size={11} />
              <span>{s}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {errorMsg && (
        <div className="va-error">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg('')}><X size={13} /></button>
        </div>
      )}

      {/* ── Interim text ── */}
      {interimText && (
        <div className="va-interim">
          <div className="va-interim-dot" />
          <span>{interimText}</span>
        </div>
      )}

      {/* ── Input Bar ── */}
      <div className="va-input-bar">
        <form className="va-input-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className="va-input"
            type="text"
            placeholder={_t('प्रश्न विचारा...', 'Ask a question...')}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            disabled={isProcessing}
          />
          <button
            type="submit"
            className="va-send-btn"
            disabled={!inputText.trim() || isProcessing}
          >
            <Send size={16} />
          </button>
        </form>

        {/* Mic Button */}
        <button
          className={`va-mic-btn ${isListening ? 'listening' : ''}`}
          onClick={toggleMic}
          title={isListening ? _t('थांबवा', 'Stop listening') : _t('बोला', 'Speak')}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          {isListening && <span className="va-mic-ring" />}
        </button>

        {/* Stop Speaking */}
        {isSpeaking && (
          <button className="va-stop-btn" onClick={stopSpeaking} title="Stop speaking">
            <Square size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceAccessPage;