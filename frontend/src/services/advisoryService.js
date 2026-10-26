export const KONKAN_RICE_STAGES = [
  {
    stage: 'Nursery & Seed Bed',
    marathiStage: 'रोपवाटिका व बियाणे प्रक्रिया',
    daysAfterSowing: '0 - 25 Days',
    keyPractices: [
      'Select certified Karjat-3, Ratna, or Wada Kolam seed.',
      'Soak seeds in 3% brine solution; discard floating seeds.',
      'Treat seeds with Carbendazim 2g/kg or Trichoderma viride 5g/kg.',
      'Prepare raised beds with well-decomposed FYM (100 kg/guntha).'
    ],
    waterDepthCm: 'Saturated to 1-2 cm',
    fertilizerDose: 'Apply 1 kg Urea + 1.5 kg Single Super Phosphate per guntha nursery bed.',
    commonRisks: ['Seedling damping off', 'Brown spot on young shoots', 'Bird damage']
  },
  {
    stage: 'Transplanting & Early Vegetative',
    marathiStage: 'पुनर्लागवड व सुरुवातीची वाढ',
    daysAfterSowing: '25 - 45 Days',
    keyPractices: [
      'Transplant 21-25 day old seedlings at 2-3 seedlings per hill.',
      'Maintain 20 x 15 cm spacing (or 15 x 15 cm for dwarf varieties).',
      'Ensure puddled field leveling for uniform standing water.'
    ],
    waterDepthCm: '2 - 3 cm standing water',
    fertilizerDose: 'Basal dose: 50% N (Urea) + 100% P (SSP/DAP) + 50% K (MOP).',
    commonRisks: ['Transplant shock', 'Whorl maggot', 'Early grass weeds']
  },
  {
    stage: 'Maximum Tillering & Vegetative',
    marathiStage: 'फुटवे येण्याची अवस्था (Tillering)',
    daysAfterSowing: '45 - 65 Days',
    keyPractices: [
      'Perform rotary cono-weeding or hand weeding.',
      'Top-dress first split of Nitrogen.',
      'Monitor for Yellow Stem Borer (dead hearts) and Leaf Folder.'
    ],
    waterDepthCm: '3 - 5 cm standing water',
    fertilizerDose: 'First top-dressing: 25% Nitrogen (approx. 22 kg Urea/acre).',
    commonRisks: ['Yellow Stem Borer', 'Leaf Folder caterpillars', 'Bacterial Leaf Blight']
  },
  {
    stage: 'Panicle Initiation & Booting',
    marathiStage: 'लोंबी लागणे व पोटरीची अवस्था',
    daysAfterSowing: '65 - 85 Days',
    keyPractices: [
      'Crucial water sensitive stage; never allow field to crack or dry.',
      'Apply final split of Nitrogen and Potash to strengthen panicle rachis.',
      'Install pheromone traps for pest monitoring.'
    ],
    waterDepthCm: '5 cm steady standing water',
    fertilizerDose: 'Second top-dressing: 25% Nitrogen + 50% Potash (MOP 10 kg/acre).',
    commonRisks: ['Rice Blast (Neck Blast)', 'Stem Borer (white ears)', 'Sheath Blight']
  },
  {
    stage: 'Flowering & Grain Filling',
    marathiStage: 'फुलोरा व दाणे भरण्याची अवस्था',
    daysAfterSowing: '85 - 110 Days',
    keyPractices: [
      'Avoid chemical pesticide sprays during active pollination (9:00 AM - 12:00 PM).',
      'Ensure light irrigation without water stagnation.'
    ],
    waterDepthCm: '2 - 3 cm shallow water',
    fertilizerDose: 'Foliar spray of 1% 13:0:45 (Potassium Nitrate) if grain filling is sluggish.',
    commonRisks: ['Gundhi Bug (rice earhead bug)', 'False Smut', 'Grain discoloration']
  },
  {
    stage: 'Ripening & Harvesting',
    marathiStage: 'पक्वता व भात कापणी',
    daysAfterSowing: '110 - 130 Days',
    keyPractices: [
      'Drain water completely 10-12 days prior to harvest.',
      'Harvest when 80-85% of grains in panicle turn golden yellow.',
      'Sun-dry paddy on clean tarpaulin to 12-14% moisture before milling/storage.'
    ],
    waterDepthCm: 'Completely drained / dry field',
    fertilizerDose: 'None required.',
    commonRisks: ['Lodging from untimely cyclone rain', 'Rodent damage', 'Post-harvest fungal mold']
  }
];

const AGRONOMY_QA = [
  {
    keywords: ['yellow', 'spot', 'spots', 'leaf', 'करपा', 'ठिपके', 'पिवळे'],
    answerEn: 'Yellow or spindle-shaped brown spots on rice leaves in Konkan usually indicate Rice Blast or Bacterial Leaf Blight. If spots have grey centers, spray Tricyclazole 75 WP @ 0.6 g/L. If margins are wavy and yellow, spray Streptocycline 0.1g + Copper Oxychloride 2.5g/L. Drain standing water for 2 days.',
    answerMr: 'पानांवर करडे-तपकिरी किंवा पिवळे ठिपके असल्यास हा करपा (Rice Blast) किंवा जिवाणूजन्य करपा असू शकतो. करप्यासाठी ट्रायसायक्लॅझोल ७५ डब्लूपी (०.६ ग्रॅम/लिटर) फवारावे. जिवाणू करप्यासाठी स्ट्रेप्टोसायक्लिन (०.१ ग्रॅम) + कॉपर ऑक्सिक्लोराईड (२.५ ग्रॅम/लिटर) फवारावे आणि २ दिवस पाणी काढून घ्यावे.'
  },
  {
    keywords: ['moisture', 'water', 'irrigate', 'पाणी', 'ओलावा', 'सिंचन'],
    answerEn: 'During vegetative tillering and panicle initiation, maintain 3 to 5 cm standing water in paddy fields. Do not allow the soil to dry out or crack. Drain water 10-12 days before harvest to facilitate uniform grain drying.',
    answerMr: 'फुटवे येताना आणि लोंबी भरताना खाचरात ३ ते ५ सेमी पाणी कायम ठेवावे. मातीला भेगा पडू देऊ नका. कापणीच्या १०-१२ दिवस आधी शेतातील पाणी पूर्णपणे काढून टाकावे.'
  },
  {
    keywords: ['pest', 'stem borer', 'bph', 'कीड', 'खोडकीडा', 'तुडतुडे'],
    answerEn: 'For Yellow Stem Borer control, install 5 pheromone traps per acre. If more than 2 moths per trap are observed, spray Chlorantraniliprole 18.5 SC @ 0.3 ml/L or Cartap Hydrochloride 50 SP @ 2 g/L. For Brown Planthoppers, create 30 cm alleys in the crop to improve light and air.',
    answerMr: 'खोडकिड्याच्या नियंत्रणासाठी एकरी ५ कामगंध सापळे लावावेत. प्रादुर्भाव वाढल्यास कोराजन (Chlorantraniliprole 18.5 SC) ०.३ मिली प्रति लिटर पाण्यात मिसळून फवारावे. तुडतुड्यांसाठी शेतात दर ३ मीटरवर ३० सेमीची मोकळी वाट करावी.'
  },
  {
    keywords: ['fertilizer', 'urea', 'npk', 'खत', 'युरिया', 'मात्रा'],
    answerEn: 'For Konkan dwarf rice varieties (Karjat-3, Ratna), recommended dose is 100 kg N, 50 kg P2O5, and 50 kg K2O per hectare. Apply Phosphorus fully as basal, Nitrogen in 3 splits (50% basal, 25% tillering, 25% panicle), and Potash in 2 splits (50% basal, 50% panicle).',
    answerMr: 'कोकणातील कर्जत-३ किंवा रत्ना भातासाठी हेक्टरी १०० किलो नत्र, ५० किलो स्फुरद आणि ५० किलो पालाश द्यावे. स्फुरद पूर्णपणे पेरणीवेळी, नत्र ३ हप्त्यांत (५०% सुरुवातीला, २५% फुटवे येताना, २५% लोंबी लागताना) आणि पालाश २ हप्त्यांत द्यावे.'
  },
  {
    keywords: ['price', 'mandi', 'sell', 'market', 'भाव', 'बाजार', 'विक्री'],
    answerEn: 'Current premium Wada Kolam price at APMC Vashi is around ₹3,850/quintal, and Karjat-3 at Chiplun/Mangaon is ₹2,420 - ₹2,480/quintal. With upcoming festival demand, prices are expected to appreciate by 5-8% over the next 3 weeks.',
    answerMr: 'सध्या वाशी मार्केटमध्ये वाडा कोलमचा भाव ₹३,८५०/क्विंटल आहे आणि कर्जत-३ चा चिपळूण/माणगाव बाजारात ₹२,४२० ते ₹२,४८०/क्विंटल आहे. आगामी सणांच्या मागणीमुळे पुढील ३ आठवड्यांत भावात ५-८% वाढ अपेक्षित आहे.'
  }
];

class AdvisoryService {
  getStageGuide() {
    return KONKAN_RICE_STAGES;
  }

  async askAgronomyQuestion(question, lang) {
    await new Promise(resolve => setTimeout(resolve, 1200));

    const qLower = question.toLowerCase();
    const matched = AGRONOMY_QA.find(item => 
      item.keywords.some(k => qLower.includes(k))
    );

    if (matched) {
      return {
        answer: lang === 'mr' ? matched.answerMr : matched.answerEn,
        source: 'Dr. Balasaheb Sawant Konkan Krishi Vidyapeeth (DBSKKV) Dapoli Guidelines',
        confidence: 94.8
      };
    }

    if (lang === 'mr') {
      return {
        answer: `आपल्या भात पिकाच्या प्रश्नासाठी ('${question}'): कोकणातील भात शेतीमध्ये सध्याच्या हंगामात पाण्याच्या पातळीचे नियमन (३-५ सेमी) आणि हवेतील आर्द्रतेनुसार बुरशीजन्य रोगांवर लक्ष ठेवणे अत्यंत महत्त्वाचे आहे. स्थानिक कृषी विज्ञान केंद्र (KVK) किंवा कृषी सहाय्यकांशी सल्लामसलत करा.`,
        source: 'कोकण कृषी सल्लागार प्रणाली (AgriSense AI Prototype)',
        confidence: 88.0
      };
    }

    return {
      answer: `Regarding your rice cultivation query ('${question}'): In the Konkan region, it is essential to balance soil moisture (maintain 3-5 cm standing water during panicle stage), avoid excessive single-dose urea application during cloudy weather, and monitor for leaf spot symptoms. Consult your local Krishi Vigyan Kendra (KVK) for specialized chemical formulations.`,
      source: 'AgriSense Agronomy Knowledge Base (DBSKKV Dapoli & ICAR)',
      confidence: 88.0
    };
  }
}

export const advisoryService = new AdvisoryService();