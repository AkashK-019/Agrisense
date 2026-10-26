class VoiceService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
  }

  isSpeechRecognitionSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  isSpeechSynthesisSupported() {
    return 'speechSynthesis' in window;
  }

  startListening(language, onInterim, onFinal, onError, onEnd) {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      if (onError) onError('Speech Recognition is not supported on this browser. Please use the text input below.');
      return false;
    }

    try {
      if (this.recognition) {
        this.recognition.abort();
      }

      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      // Language locale
      if (language === 'mr') {
        this.recognition.lang = 'mr-IN';
      } else if (language === 'hi') {
        this.recognition.lang = 'hi-IN';
      } else {
        this.recognition.lang = 'en-IN';
      }

      let capturedFinal = '';

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          capturedFinal = finalTranscript;
          if (onFinal) onFinal(finalTranscript);
        } else if (interimTranscript) {
          if (onInterim) onInterim(interimTranscript);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        const errMsg = event.error === 'not-allowed'
          ? 'Microphone permission denied. Please allow microphone in browser URL bar.'
          : event.error === 'no-speech'
          ? 'No speech detected. Please try again.'
          : `Speech error: ${event.error}`;
        if (onError) onError(errMsg);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd(capturedFinal);
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e) {
      if (onError) onError(`Failed to start microphone: ${e.message}`);
      return false;
    }
  }

  async fetchAdvisorAnswer(query, language = 'mr', cropVariety = 'Paddy', cropStage = 'Tillering') {
    const API_BASE = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';
    try {
      const res = await fetch(`${API_BASE}/voice-advisor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          language,
          crop_context: cropVariety,
          stage_context: cropStage
        })
      });
      if (res.ok) {
        const data = await res.json();
        return { text: data.answer, source: data.source };
      }
    } catch (e) {
      console.warn('AI advisor fetch failed, using local response:', e);
    }
    return this.generateAgronomyAnswer(query, language, cropVariety, cropStage);
  }

  generateAgronomyAnswer(query, language = 'mr', cropVariety = 'Paddy', cropStage = 'Tillering') {
    const q = (query || '').toLowerCase();
    if (q.includes('करपा') || q.includes('blast') || q.includes('ब्लास्ट')) {
      return {
        text: language === 'mr'
          ? 'भातावरील करपा रोगासाठी ट्रायसायक्लॅझोल ७५% WP प्रति लिटर ०.६ ग्रॅम फवारणी करावी. नत्राचा अतिवापर टाळावा.'
          : 'For rice blast, spray Tricyclazole 75% WP @ 0.6g per litre of water. Avoid excess nitrogen.'
      };
    }
    if (q.includes('खत') || q.includes('युरिया') || q.includes('fertilizer') || q.includes('urea')) {
      return {
        text: language === 'mr'
          ? 'खताचा दुसरा डोस फुटवे फुटण्याच्या अवस्थेत (लागवडीनंतर २२-२५ दिवसांनी) द्यावा. प्रति एकर २५ किलो युरिया द्यावे.'
          : 'Apply 2nd fertilizer split at tillering stage (22-25 days after transplanting). Use 25 kg urea per acre.'
      };
    }
    if (q.includes('पाऊस') || q.includes('हवामान') || q.includes('rain') || q.includes('weather')) {
      return {
        text: language === 'mr'
          ? 'पुढील ३ दिवसांत हलक्या पावसाची शक्यता आहे. फवारणी करताना स्टिकर वापरावे.'
          : 'Light rain expected in next 3 days. Use sticker/spreader while spraying.'
      };
    }
    return {
      text: language === 'mr'
        ? `आपला प्रश्न '${query}' नोंदवला गेला आहे. पिकाची वेळोवेळी पाहणी करावी आणि योग्य निचरा ठेवावा.`
        : `Regarding '${query}', inspect the crop regularly and maintain good drainage.`
    };
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speakText(text, language = 'en', onEnd = () => {}, onError = () => {}) {
    if (!this.isSpeechSynthesisSupported()) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (language === 'mr') {
      utterance.lang = 'mr-IN';
    } else if (language === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = onEnd;
    utterance.onerror = onError;

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  }
}

export const voiceService = new VoiceService();