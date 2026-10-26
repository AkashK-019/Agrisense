const API_BASE = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

class MarketPriceService {
  async getLiveForecast(commodity = 'Paddy (Common)', mandi = null) {
    try {
      const res = await fetch(`${API_BASE}/forecast-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity,
          mandi_name: mandi
        })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Return null on failure
    }
    return null;
  }

  async getMarketForecast(commodity = 'Paddy (Common)', mandi = null) {
    return this.getLiveForecast(commodity, mandi);
  }

  async getAvailableMandis(commodity = 'Paddy (Common)') {
    try {
      const res = await fetch(`${API_BASE}/available-mandis?commodity=${encodeURIComponent(commodity)}`);
      if (res.ok) {
        const data = await res.json();
        return data.mandis || [];
      }
    } catch {
      // Fallback
    }
    return [];
  }

  async getMarketComparisons(commodity = 'Paddy (Common)') {
    try {
      const res = await fetch(`${API_BASE}/market-comparison?commodity=${encodeURIComponent(commodity)}`);
      if (res.ok) {
        const data = await res.json();
        return data.markets || [];
      }
    } catch {
      // Fallback
    }
    return [];
  }

  getNeutralFarmerGuidance(observedPrice, forecastPrice, isMr = false) {
    if (!observedPrice || !forecastPrice) {
      return {
        title: isMr ? 'थेट बाजार दर संदर्भ' : 'Market Reference',
        text: isMr
          ? 'सध्याच्या खरेदी विक्रीसाठी आजचा नोंदवलेला बाजार दर प्राथमिक संदर्भ म्हणून वापरावा.'
          : "Use today's reported mandi price as the primary reference for immediate sales decisions."
      };
    }

    const diff = forecastPrice - observedPrice;
    const diffPct = +((diff / observedPrice) * 100).toFixed(1);

    if (diffPct > 2.5) {
      return {
        title: isMr ? 'दर वाढीचा कल' : 'Higher Forecast Outlook',
        text: isMr
          ? `७ दिवसांचा AI अंदाज आजच्या दरापेक्षा अंदाजे +${diffPct}% वाढ दर्शवत आहे. विक्री पुढे ढकलण्यापूर्वी स्थानिक खरेदीदाराचे आजचे भाव, साठवणूक खर्च व घट यांचा विचार करावा.`
          : `Forecast indicates a possible increase of approximately +${diffPct}% over the next 7 days. Consider checking local buying offers, storage cost, and moisture quality before delaying sale.`,
        diffPct
      };
    } else if (diffPct < -2.5) {
      return {
        title: isMr ? 'दर घसरणीचा कल' : 'Lower Forecast Outlook',
        text: isMr
          ? `७ दिवसांचा AI अंदाज आजच्या दरापेक्षा अंदाजे ${diffPct}% घट दर्शवत आहे. आज मिळणारा भाव आणि वाहतूक खर्चाची तुलना करून विक्रीचा निर्णय घ्यावा.`
          : `Forecast indicates a possible decrease of approximately ${diffPct}% over the next 7 days. Compare today's local buyer offer with storage and transport costs.`,
        diffPct
      };
    } else {
      return {
        title: isMr ? 'दर स्थिर राहण्याचा कल' : 'Stable Price Outlook',
        text: isMr
          ? '७ दिवसांचा अंदाज स्थिर आहे. विक्रीचा निर्णय आज उपलब्ध खरेदीदार, रोख गरज आणि साठवणूक सोयीवर आधारित असावा.'
          : "Forecast is broadly stable. Selling decisions should depend on today's buyer offer and storage availability.",
        diffPct
      };
    }
  }
}

export const marketPriceService = new MarketPriceService();