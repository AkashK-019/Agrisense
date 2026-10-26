/**
 * riskAssessmentService.js
 * Agronomic Multi-Data Fusion & Dynamic Risk Engine
 * Runs 100% locally (Zero Gemini API quota consumed)
 * Combines: Soil (Touch feel or Sensor) + Stored Farm/Crop Data + Live 5-Day Weather Forecast
 */

class RiskAssessmentService {

  /**
   * Evaluates a specific farm & crop plot combining all available data (Soil + Crop + Weather + Leaf Image Scans)
   */
  evaluatePlot(farm, crop, soilReading, weatherData, farmAnalyses = []) {
    if (!farm) return null;

    const farmId = farm._id || farm.id || 'farm_default';
    const farmName = farm.farmName || 'Farm Plot';
    const cropName = crop?.cropName || farm.cropName || 'Paddy (भात)';
    const cropStage = crop?.cropStage || farm.cropStage || 'Vegetative';
    const area = farm.area ? `${farm.area} Acres` : '2.0 Acres';
    const soilType = farm.soilType || 'Loam';

    // 1. Weather factors
    const temp = weatherData?.temp || weatherData?.temperature || 28;
    const humidity = weatherData?.humidity || 75;
    const todayRain = weatherData?.rainfall || 0;
    const forecastRainNext48h = (weatherData?.forecast || []).slice(0, 2).reduce((sum, f) => sum + (f.rainfallMm || 0), 0);
    const hasUpcomingRain = forecastRainNext48h >= 10 || todayRain >= 15;

    // 2. Soil factors (Support both Sensor & Field Touch feel)
    let soilMoistureScore = 70; // 0-100 where 60-80 is ideal
    let isSoggy = false;
    let isDry = false;
    let lastWateredDays = 2;

    if (soilReading) {
      if (soilReading.soilFeel) {
        // Qualitative Touch Input
        if (soilReading.soilFeel === 'dry_powder') { soilMoistureScore = 25; isDry = true; }
        else if (soilReading.soilFeel === 'slightly_moist') { soilMoistureScore = 50; }
        else if (soilReading.soilFeel === 'moist_ideal') { soilMoistureScore = 75; }
        else if (soilReading.soilFeel === 'soggy_wet') { soilMoistureScore = 95; isSoggy = true; }
      } else if (typeof soilReading.moisture === 'number') {
        // Quantitative Sensor Input
        soilMoistureScore = soilReading.moisture;
        if (soilMoistureScore < 45) isDry = true;
        if (soilMoistureScore > 85) isSoggy = true;
      }

      if (soilReading.lastWatered === 'today') lastWateredDays = 0;
      else if (soilReading.lastWatered === '1_2_days') lastWateredDays = 1.5;
      else if (soilReading.lastWatered === '3_5_days') lastWateredDays = 4;
      else if (soilReading.lastWatered === 'more_5_days') lastWateredDays = 7;
      else if (soilReading.lastWatered === 'rainfed') lastWateredDays = 10;
    }

    // 3. Evaluate specific agronomic risks
    const risks = [];
    let riskScore = 15; // baseline low risk
    let detectedDiseaseName = null;

    // A. PRIORITY 1: Leaf Diagnoses from Crop Doctor Scans
    const activeScans = (farmAnalyses || []).filter(s => {
      if (!s?.diseaseName) return false;
      const d = s.diseaseName.toLowerCase();
      return !d.includes('healthy') && !d.includes('none') && s.severity !== 'None';
    });

    if (activeScans.length > 0) {
      // Find the most severe or latest scan
      const topScan = activeScans[0];
      detectedDiseaseName = topScan.diseaseName;
      const scanSev = topScan.severity || 'Moderate';
      const isHigh = /high|critical|severe/i.test(scanSev);
      riskScore += isHigh ? 50 : 35;

      const dName = topScan.diseaseName;
      let titleEn = `${dName} Active Infection Detected`;
      let titleMr = `${topScan.diseaseNameMr || dName} रोगाचा सक्रिय प्रादुर्भाव`;
      let descEn = `Crop Doctor confirmed ${dName} on leaves (${scanSev} severity). Action needed to prevent field spread.`;
      let descMr = `क्रॉप डॉक्टर तपासणीत पानावरील ${topScan.diseaseNameMr || dName} आढळला आहे (${scanSev === 'High' ? 'जास्त धोका' : 'मध्यम धोका'}).`;

      let remedyEn = topScan.chemicalControl || topScan.recommendation?.chemicalControl || 'Apply targeted curative fungicide as per CIB&RC guidelines and withhold excess urea.';
      let remedyMr = topScan.recommendation?.chemicalControl_mr || 'शिफारशीत बुरशीनाशकाची फवारणी करा व युरियाचा अतिवापर टाळा.';

      if (/sheath/i.test(dName)) {
        remedyEn = 'Apply Hexaconazole 5% EC @ 2ml/L or Validamycin 3% L @ 2.5ml/L targeting the plant base. Avoid dense nitrogen foliage.';
        remedyMr = 'हेक्साकोनाझोल ५% EC (२ मिली/लिटर) किंवा व्हॅलिडामायसिन ३% L (२.५ मिली/लिटर) खोडाजवळ फवारा. युरिया जास्त देऊ नका.';
      } else if (/bacterial|blight/i.test(dName)) {
        remedyEn = 'Spray Streptocycline @ 0.1g/L + Copper Oxychloride @ 2.5g/L. Drain standing water for 48h and suspend Nitrogen top-dressing.';
        remedyMr = 'स्ट्रेप्टोमायसिन (०.१ ग्रॅम/लिटर) + कॉपर ऑक्सिक्लोराईड (२.५ ग्रॅम/लिटर) एकत्र फवारा. २ दिवस खाचरातील पाणी काढून टाका.';
      } else if (/blast/i.test(dName)) {
        remedyEn = 'Spray Tricyclazole 75% WP @ 0.6g/L or Isoprothiolane 40% EC @ 1.5ml/L immediately. HALT all Nitrogen (Urea) top-dressing.';
        remedyMr = 'ट्रायसायक्लाझोल ७५% WP (०.६ ग्रॅम/लिटर) त्वरित फवारा. युरिया देणे त्वरित थांबवा.';
      } else if (/brown/i.test(dName)) {
        remedyEn = 'Spray Mancozeb 75% WP @ 2.5g/L. Apply MOP (Potash) to correct potassium deficiency in soil.';
        remedyMr = 'मँकोझेब ७५% WP (२.५ ग्रॅम/लिटर) फवारा. मातीतील पालाश कमतरता भरून काढण्यासाठी पोटॅश द्या.';
      } else if (/scald/i.test(dName)) {
        remedyEn = 'Spray Carbendazim 12% + Mancozeb 63% WP (Saaf) @ 2g/L or Tebuconazole 25.9% EC @ 1ml/L. Avoid high nitrogen levels.';
        remedyMr = 'साफ (कार्बेन्डाझिम + मँकोझेब) २ ग्रॅम/लिटर किंवा टेबुकोनाझोल १ मिली/लिटर फवारा. नत्राचा अतिवापर टाळा.';
      }

      risks.push({
        category: 'Crop Disease Risk',
        severity: isHigh ? 'High' : 'Moderate',
        titleEn,
        titleMr,
        descEn,
        descMr,
        remedyEn,
        remedyMr,
        diseaseName: dName
      });
    }

    // B. Weather & Microclimate Fungal Risk (Blast / Blight / Rot)
    const isHighFungalEnv = (humidity >= 80 && temp >= 22 && temp <= 32) || (isSoggy && humidity >= 70);
    if (isHighFungalEnv && activeScans.length === 0) {
      riskScore += 35;
      risks.push({
        category: 'Crop Disease Risk',
        severity: isSoggy ? 'High' : 'Moderate',
        titleEn: 'Fungal Blast & Sheath Blight Alert',
        titleMr: 'करपा व बुरशीजन्य रोगाची शक्यता',
        descEn: `High relative humidity (${humidity}%) and moist microclimate favor fungal spore germination.`,
        descMr: `हवेतील जास्त आर्द्रता (${humidity}%) व शेतातील ओल यामुळे करपा आणि तांबेरा रोगाचा प्रादुर्भाव वाढू शकतो.`,
        remedyEn: 'Spray Tricyclazole 75 WP @ 0.6g/L or Hexaconazole 5% EC @ 2ml/L during morning dry spells. Avoid excess urea.',
        remedyMr: 'ट्रायसायक्लाझोल ७५ WP (०.६ ग्रॅम/लिटर) फवारा. ढगाळ हवामानात युरियाचा जास्त वापर टाळा.'
      });
    }

    // C. Water Stress / Excessive Moisture Risk
    if (isSoggy && hasUpcomingRain) {
      riskScore += 40;
      risks.push({
        category: 'Water Stress / Waterlogging Risk',
        severity: 'High',
        titleEn: 'Waterlogging & Root Asphyxiation Warning',
        titleMr: 'पाणथळ स्थिती व मुळांना ऑक्सिजनची कमतरता',
        descEn: `Soil is saturated and upcoming rain (${forecastRainNext48h.toFixed(1)}mm) will cause prolonged flooding.`,
        descMr: `मातीत जास्त पाणी साचले असून पुढील ४८ तासांत आणखी पाऊस होण्याची शक्यता आहे.`,
        remedyEn: 'Create drainage furrows and open plot outlets immediately to let excess water drain away.',
        remedyMr: 'शेतातील बंधाऱ्याचे तोंड उघडून चर काढून साचलेले पाणी त्वरित बाहेर काढा.'
      });
    } else if (isDry && !hasUpcomingRain && lastWateredDays >= 4) {
      riskScore += 30;
      risks.push({
        category: 'Water Stress / Waterlogging Risk',
        severity: 'Moderate',
        titleEn: 'Moisture Stress at Critical Growth Stage',
        titleMr: 'पिकाला पाण्याची कमतरता (पाण्याचा ताण)',
        descEn: `Soil is dry, no heavy rain forecasted, and crop is in active growth stage.`,
        descMr: `मातीतील ओलावा कमी झाला आहे आणि पुढील काही दिवस पुरेसा पाऊस नाही.`,
        remedyEn: 'Provide light protective irrigation during early morning or late evening hours.',
        remedyMr: 'सकाळच्या किंवा संध्याकाळच्या वेळी हलके संरक्षक पाणी द्या.'
      });
    }

    // D. Pest Risk based on stage
    if (cropStage.toLowerCase().includes('tillering') || cropStage.toLowerCase().includes('panicle') || cropStage.toLowerCase().includes('flower')) {
      riskScore += 15;
      risks.push({
        category: 'Pest Infestation Risk',
        severity: 'Moderate',
        titleEn: 'Stem Borer & Sucking Pest Activity',
        titleMr: 'खोडकिडा व तुडतुडे प्रादुर्भाव दक्षता',
        descEn: `Vegetative and panicle stages are vulnerable to insect pest egg-laying.`,
        descMr: `फुटवे व लोंबी अवस्थेत खोडकिडा व पानांवरील किडींचा धोका संभवतो.`,
        remedyEn: 'Install 4-5 pheromone traps per acre and spray Neem oil (1500 ppm) @ 3ml/L preventively.',
        remedyMr: 'प्रति एकर ४-५ कामगंध सापळे लावा आणि निंबोळी अर्क (५%) किंवा ५ मिली निम तेल फवारा.'
      });
    }

    // Determine Plot Status & Color
    riskScore = Math.min(100, Math.max(10, riskScore));
    const status = riskScore >= 60 ? 'High' : riskScore >= 35 ? 'Moderate' : 'Low';
    const riskColor = riskScore >= 60 ? 'red' : riskScore >= 35 ? 'yellow' : 'green';

    const primaryRisk = risks[0] || {
      category: 'General Field Status',
      titleEn: 'Field Conditions Safe & Balanced',
      titleMr: 'शेत सुरक्षित व अनुकूल स्थितीत',
      descEn: 'Optimal soil moisture and favorable weather parameters.',
      descMr: 'मातीतील ओलावा आणि हवामान पिकाच्या वाढीसाठी अनुकूल आहे.',
      remedyEn: 'Continue routine field monitoring and scheduled nutrient applications.',
      remedyMr: 'नियमित आंतरमशागत व वेळेवर खत व्यवस्थापन चालू ठेवा.'
    };

    return {
      id: farmId,
      farmId,
      name: farmName,
      crop: cropName,
      stage: cropStage,
      variety: farm.variety || 'Karjat-3',
      district: farm.district || 'Ratnagiri',
      area,
      status,
      riskScore,
      riskColor,
      detectedDisease: detectedDiseaseName,
      activeRisk: primaryRisk.titleEn,
      activeRiskMr: primaryRisk.titleMr,
      remedy: primaryRisk.remedyEn,
      remedyMr: primaryRisk.remedyMr,
      risks
    };
  }

  /**
   * Evaluates all farms/plots for the logged-in farmer
   */
  evaluateAllPlots(farms, crops, soilReadings, weatherData, cropAnalyses = []) {
    if (!farms || farms.length === 0) return [];
    return farms.map(farm => {
      const farmId = farm._id || farm.id;
      const crop = (crops || []).find(c => (c.farmId === farmId)) || null;
      const soil = (soilReadings || []).find(s => (s.farmId === farmId)) || soilReadings?.[0] || null;
      const plotAnalyses = (cropAnalyses || []).filter(a => !a.farmId || a.farmId === farmId || a.farmId === 'general');
      return this.evaluatePlot(farm, crop, soil, weatherData, plotAnalyses);
    }).filter(Boolean);
  }

  /**
   * Smart Irrigation Decision Engine (100% Local Multi-Data Fusion)
   */
  computeIrrigationDecision(soilReading, weatherData, farm, crop) {
    const todayRain = weatherData?.rainfall || 0;
    const forecastList = weatherData?.forecast || [];
    const rainNext24h = forecastList[0]?.rainfallMm || todayRain;
    const rainNext48h = (forecastList[0]?.rainfallMm || 0) + (forecastList[1]?.rainfallMm || 0);
    const temp = weatherData?.temp || 28;
    const humidity = weatherData?.humidity || 70;

    let soilFeel = soilReading?.soilFeel || null;
    let moisture = typeof soilReading?.moisture === 'number' ? soilReading.moisture : null;
    let lastWatered = soilReading?.lastWatered || null;

    // Rule 1: Heavy rain upcoming in 24-48h -> ALWAYS HOLD IRRIGATION
    if (rainNext24h >= 10 || rainNext48h >= 18) {
      return {
        action: 'HOLD',
        badgeEn: '🛑 HOLD IRRIGATION',
        badgeMr: '🛑 पाणी देणे थांबवा',
        color: 'amber',
        titleEn: `Rain Expected Soon (${rainNext48h.toFixed(1)} mm in next 48h)`,
        titleMr: `पुढील ४८ तासांत पावसाची शक्यता (${rainNext48h.toFixed(1)} मिमी)`,
        reasonEn: `Forecasting ${rainNext48h.toFixed(1)} mm rainfall. Irrigating now will cause excess waterlogging, root suffocation, and fertilizer runoff.`,
        reasonMr: `पुढील २४ ते ४८ तासांत चांगल्या पावसाचा अंदाज आहे. आता पाणी दिल्यास शेतात पाणी साचून पिकाचे नुकसान होईल व दिलेले खत वाहून जाईल.`,
        guidanceEn: 'Save water and electricity. Ensure plot drainage gates are clear.',
        guidanceMr: 'पाणी व विजेची बचत करा. शेतातील पाण्याचा निचरा होण्यासाठी चर तपासा.'
      };
    }

    // Rule 2: Soil is already waterlogged / soggy -> DRAIN
    if (soilFeel === 'soggy_wet' || (moisture !== null && moisture >= 85)) {
      return {
        action: 'DRAIN',
        badgeEn: '🌊 DRAIN WATER',
        badgeMr: '🌊 पाण्याचा निचरा करा',
        color: 'red',
        titleEn: 'Excess Field Water / Saturated Soil',
        titleMr: 'शेतात अतिरिक्त पाणी साचले आहे',
        reasonEn: `Soil is saturated (${moisture ? moisture + '%' : 'Soggy mud'}). Prolonged standing water restricts root oxygen and invites sheath rot.`,
        reasonMr: `माती खूप पाणथळ झाली आहे. जास्त वेळ पाणी साचल्यास मुळांना हवा मिळत नाही आणि करपा/कुज रोग वाढतो.`,
        guidanceEn: 'Open drainage outlets to drain surface water. Postpone any fertilizer top-dressing.',
        guidanceMr: 'चर काढून पाणी बाहेर काढा. जमीन वाफसा होईपर्यंत खत देणे टाळा.'
      };
    }

    // Rule 3: Soil is dry & no rain -> IRRIGATE NOW
    if (soilFeel === 'dry_powder' || (moisture !== null && moisture < 45) || (lastWatered === 'more_5_days' && rainNext48h < 4)) {
      return {
        action: 'IRRIGATE_NOW',
        badgeEn: '💧 IRRIGATE TODAY',
        badgeMr: '💧 आज पाणी द्या',
        color: 'blue',
        titleEn: 'Soil Moisture Low & Evapotranspiration Active',
        titleMr: 'मातीतील ओलावा कमी झाला आहे',
        reasonEn: `Soil is dry and no significant rain is expected. Temperature is ${temp}°C. Plant needs moisture for nutrient uptake.`,
        reasonMr: `माती कोरडी झाली असून पुढील २ दिवस पाऊस नाही. तापमान ${temp}°C असल्यामुळे पिकाची पाण्याची गरज वाढली आहे.`,
        guidanceEn: 'Apply light irrigation during morning hours (6-9 AM) to minimize evaporation loss.',
        guidanceMr: 'बाष्पीभवन टाळण्यासाठी सकाळी ६ ते ९ दरम्यान हलके पाणी द्या.'
      };
    }

    // Rule 4: Soil slightly moist, high heat -> PLAN SOON
    if (soilFeel === 'slightly_moist' || (moisture !== null && moisture >= 45 && moisture < 60)) {
      return {
        action: 'IRRIGATE_SOON',
        badgeEn: '⏳ PLAN IN 1–2 DAYS',
        badgeMr: '⏳ १-२ दिवसांत नियोजन करा',
        color: 'cyan',
        titleEn: 'Moderate Soil Moisture Level',
        titleMr: 'मातीत मध्यम ओलावा उपलब्ध',
        reasonEn: `Current moisture is adequate for 24-48 hours. Monitor crop condition and prepare irrigation for day after tomorrow if no rain occurs.`,
        reasonMr: `सध्याचा ओलावा पुढील १-२ दिवस पुरेसा आहे. पाऊस न आल्यास परवा सकाळी पाणी द्यावे.`,
        guidanceEn: 'Keep drip/channels ready. Re-check topsoil feel tomorrow evening.',
        guidanceMr: 'उद्या संध्याकाळी पुन्हा मातीचा ओलावा तपासा.'
      };
    }

    // Rule 5: Optimal Moisture -> MAINTAIN
    return {
      action: 'OPTIMAL',
      badgeEn: '✅ OPTIMAL MOISTURE',
      badgeMr: '✅ ओलावा उत्तम आहे',
      color: 'emerald',
      titleEn: 'Ideal Field Moisture Condition',
      titleMr: 'शेतात योग्य ओलावा (वाफसा स्थिती)',
      reasonEn: `Soil moisture (${moisture ? moisture + '%' : 'Moist & pliable'}) is in the optimal 60–80% range for vegetative vigor.`,
      reasonMr: `मातीतील ओलावा पिकासाठी एकदम योग्य आहे. पिकाची मुळे उत्तम कार्य करत आहेत.`,
      guidanceEn: 'No irrigation needed today. Good time for pest scouting and weed removal.',
      guidanceMr: 'आज पाणी देण्याची गरज नाही. किडींचे निरीक्षण व आंतरमशागत करू शकता.'
    };
  }

  /**
   * Summary overview for Farm
   */
  evaluateFarmRisks(farmId, alerts, soil, weather) {
    const plot = this.evaluatePlot({ id: farmId }, null, soil, weather);
    if (!plot) {
      return {
        overallRiskLevel: 'Low',
        overallScore: 20,
        activeAlertsCount: 0,
        categoryBreakdown: []
      };
    }

    return {
      overallRiskLevel: plot.status,
      overallScore: plot.riskScore,
      activeAlertsCount: plot.risks.length,
      categoryBreakdown: plot.risks.map(r => ({
        category: r.category,
        score: plot.riskScore,
        level: r.severity,
        primaryRiskFactor: r.titleEn
      }))
    };
  }
}

export const riskAssessmentService = new RiskAssessmentService();