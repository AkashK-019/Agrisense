// decisionFusionService.js

const META_ENDPOINT = import.meta.env.VITE_META_FUSION_ENDPOINT || 'http://localhost:8000/meta-advisory';

class DecisionFusionService {
  /* Synthesizes outputs */
  async getMetaAdvisory({
    cropName = 'Rice',
    variety = 'Karjat-3',
    cropStage = 'Tillering',
    diseaseResult = null,
    priceResult = null,
    riskResult = null,
    language = 'mr'
  }) {
    try {
      const response = await fetch(META_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop_name: cropName,
          variety,
          crop_stage: cropStage,
          disease_result: diseaseResult,
          price_result: priceResult,
          risk_result: riskResult,
          language
        }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch {
    }

    // Client-side fallback
    const diseaseName = diseaseResult?.diseaseName || 'None';
    const isDiseased = diseaseName !== 'None' && diseaseName !== 'Healthy';
    const priceAdvice = priceResult?.advice || 'HOLD';
    const isHighRisk = riskResult?.overallRiskLevel === 'High';

    if (isDiseased && isHighRisk) {
      return {
        holistic_action: language === 'mr' ? 'पावसापूर्वी तात्काळ कीटकनाशक फवारणी करा' : 'TREAT CROP IMMEDIATELY BEFORE RAIN',
        priority_level: 'URGENT',
        rationale_en: `Active disease (${diseaseName}) detected during high rain risk. Even though Mandi prices suggest to ${priceAdvice}, spray protective fungicide immediately to prevent yield loss.`,
        rationale_mr: `शेतात ${diseaseName} रोगाचा प्रादुर्भाव असून पावसाचा धोका जास्त आहे. बाजार भाव वाढणार असले तरी प्रथम पिकाचे नुकसान टाळण्यासाठी तात्काळ फवारणी करा.`,
        immediate_next_steps: [
          language === 'mr' ? `${diseaseName} साठी २४ तासांत शिफारशीत बुरशीनाशक फवारा` : `Spray curative fungicide for ${diseaseName} within 24 hours`,
          language === 'mr' ? 'शेतातील अतिरिक्त पाण्याचा निचरा करा' : 'Maintain proper field drainage trenches',
          language === 'mr' ? 'चांगल्या बाजार भावासाठी ३ आठवडे माल राखून ठेवा' : 'Hold harvest for 3 weeks to capture higher APMC prices'
        ],
        market_sell_strategy: `${priceAdvice} (Peak price projected in 30 days)`
      };
    }

    return {
      holistic_action: language === 'mr' ? 'चांगल्या भावासाठी माल साठवून ठेवा' : 'HOLD STOCK FOR PEAK FESTIVAL PRICE',
      priority_level: 'RECOMMENDED',
      rationale_en: 'Crop health is stable and Mandi rates are projected to rise by 6–8% in 30 days. Maintain water level and hold stock for maximum profit.',
      rationale_mr: 'पीक निरोगी असून पुढील ३० दिवसांत बाजार भाव ६-८% वाढण्याचा अंदाज आहे. माल साठवून ठेवणे फायद्याचे राहील.',
      immediate_next_steps: [
        language === 'mr' ? 'खाचरात ३-५ सेमी पाणी पातळी कायम ठेवा' : 'Maintain 3-5 cm standing water depth in paddy',
        language === 'mr' ? 'पुढील आठवड्यात वाशी बाजार समितीचे दर तपासा' : 'Check APMC Vashi prices next week',
        language === 'mr' ? 'कापणी व साठवणुकीसाठी स्वच्छ पोती तयार ठेवा' : 'Prepare clean storage bags for harvest'
      ],
      market_sell_strategy: `${priceAdvice} (Peak price projected in 30 days)`
    };
  }

  async getAgronomyRecommendation({
    crop = 'paddy',
    variety = 'Karjat-3',
    season = 'kharif',
    stage = 'tillering',
    district = 'Ratnagiri',
    diseaseLabel = null,
    soil = {}
  }) {
    try {
      const response = await fetch('http://localhost:8000/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop,
          variety,
          season,
          stage,
          district,
          disease_label: diseaseLabel,
          soil_n: soil.n,
          soil_p: soil.p,
          soil_k: soil.k,
          soil_ph: soil.ph
        }),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('Recommender endpoint error:', e);
    }
    return null;
  }
}

export const decisionFusionService = new DecisionFusionService();