const INITIAL_FARMER = {
  id: 'farmer_konkan_01',
  name: 'Suresh Anant Shinde (सुरेश अनंत शिंदे)',
  phone: '+91 98234 56789',
  email: 'suresh.shinde.agri@gmail.com',
  preferredLanguage: 'en',
  createdAt: '2026-06-15T08:00:00Z',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
};

const INITIAL_FARMS = [
  {
    id: 'farm_ratnagiri_01',
    farmerId: 'farmer_konkan_01',
    farmName: 'Shinde Rice Agro Farm - Chiplun',
    village: 'Khed-Chiplun Belt (खेड-चिपळूण)',
    district: 'Ratnagiri (रत्नागिरी)',
    state: 'Maharashtra',
    location: {
      lat: 17.5323,
      lng: 73.5186,
      addressText: 'Survey No. 42/3, Vashishti River Basin, Chiplun, Ratnagiri - 415605'
    },
    area: 4.5,
    soilType: 'Laterite (जांभा)',
    irrigationType: 'Rainfed (पावसावर आधारित)',
    notes: 'Lowland rice field with good organic matter, susceptible to monsoon waterlogging and blast during high humidity.'
  },
  {
    id: 'farm_raigad_02',
    farmerId: 'farmer_konkan_01',
    farmName: 'Mangaon Wada Kolam Plot',
    village: 'Nizampur (निजामपूर)',
    district: 'Raigad (रायगड)',
    state: 'Maharashtra',
    location: {
      lat: 18.2568,
      lng: 73.2872,
      addressText: 'Plot 18, Kal River Plains, Mangaon, Raigad - 402104'
    },
    area: 2.8,
    soilType: 'Coastal Alluvial (गाळाची मृदा)',
    irrigationType: 'Canal (कालवा)',
    notes: 'Rich alluvial soil with high moisture retention, cultivated with premium fragrant Wada Kolam.'
  }
];

const INITIAL_CROPS = [
  {
    id: 'crop_01',
    farmId: 'farm_ratnagiri_01',
    cropName: 'Rice (भात / धान)',
    variety: 'Karjat-3 (कर्जत-३)',
    sowingDate: '2026-06-20',
    expectedHarvestDate: '2026-10-25',
    cropStage: 'Panicle Initiation (लोंबी लागणे)',
    status: 'Active'
  },
  {
    id: 'crop_02',
    farmId: 'farm_raigad_02',
    cropName: 'Rice (भात / धान)',
    variety: 'Wada Kolam (वाडा कोलम)',
    sowingDate: '2026-07-02',
    expectedHarvestDate: '2026-11-10',
    cropStage: 'Tillering / Vegetative (फुटवे येणे)',
    status: 'Active'
  }
];

const INITIAL_SOIL_READINGS = [
  {
    id: 'soil_01',
    farmId: 'farm_ratnagiri_01',
    moisture: 78,
    pH: 5.8,
    nitrogen: 215,
    phosphorus: 18,
    potassium: 195,
    temperature: 26.4,
    source: 'IoT In-Field Sensor (Simulated)',
    recordedAt: '2026-09-17T18:00:00Z'
  },
  {
    id: 'soil_02',
    farmId: 'farm_ratnagiri_01',
    moisture: 72,
    pH: 5.9,
    nitrogen: 210,
    phosphorus: 19,
    potassium: 190,
    temperature: 27.1,
    source: 'Manual Entry',
    recordedAt: '2026-09-14T09:30:00Z'
  },
  {
    id: 'soil_03',
    farmId: 'farm_raigad_02',
    moisture: 68,
    pH: 6.4,
    nitrogen: 245,
    phosphorus: 24,
    potassium: 220,
    temperature: 28.0,
    source: 'Konkan Soil Lab',
    recordedAt: '2026-09-10T11:00:00Z'
  }
];

const INITIAL_WEATHER_READINGS = [
  {
    id: 'weather_01',
    farmId: 'farm_ratnagiri_01',
    temperature: 28.5,
    humidity: 86,
    rainfall: 34.2,
    weatherCondition: 'Scattered Showers',
    windSpeedKmH: 14,
    source: 'Regional Agro-Met Advisory (IMD Pune)',
    recordedAt: '2026-09-17T18:00:00Z'
  },
  {
    id: 'weather_02',
    farmId: 'farm_raigad_02',
    temperature: 29.8,
    humidity: 82,
    rainfall: 18.0,
    weatherCondition: 'Humid & Overcast',
    windSpeedKmH: 11,
    source: 'Regional Agro-Met Advisory (IMD Pune)',
    recordedAt: '2026-09-17T18:00:00Z'
  }
];

const INITIAL_CROP_ANALYSES = [
  {
    id: 'analysis_01',
    farmerId: 'farmer_konkan_01',
    farmId: 'farm_ratnagiri_01',
    imageUrl: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&auto=format&fit=crop&q=80',
    diseaseName: 'Rice Blast (करपा)',
    marathiDiseaseName: 'भात पिकावरील करपा रोग (Rice Blast)',
    confidence: 94.6,
    severity: 'Moderate',
    symptoms: [
      'Spindle-shaped elliptical lesions on leaf blades with gray centers and reddish-brown borders.',
      'Lesions coalescing causing leaf desiccation during humid cloudy weather.',
      'Collar rot symptoms beginning at leaf junction.'
    ],
    recommendations: {
      curative: [
        'Apply Tricyclazole 75 WP @ 0.6 g per liter of water immediately upon initial lesion appearance.',
        'Alternative: Spray Isoprothiolane 40 EC @ 1.5 ml/L during morning dry breaks.'
      ],
      preventive: [
        'Avoid excessive split application of chemical Nitrogen fertilizers during overcast weather.',
        'Maintain 5 cm standing water in paddy fields; avoid prolonged flooding stress.',
        'Ensure proper field bund sanitation and weed clearing.'
      ],
      chemicalDosage: 'Tricyclazole 75% WP: 120g in 200L water per acre',
      organicControl: 'Foliar spray of 5% Neem Seed Kernel Extract (NSKE) or Pseudomonas fluorescens @ 2.5 kg/ha'
    },
    modelVersion: 'AgriSense-RiceCNN-v1.4 (ResNet50 Backbone - Prototype)',
    isSampleMock: true,
    createdAt: '2026-09-16T14:22:00Z'
  },
  {
    id: 'analysis_02',
    farmerId: 'farmer_konkan_01',
    farmId: 'farm_ratnagiri_01',
    imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&auto=format&fit=crop&q=80',
    diseaseName: 'Bacterial Leaf Blight (जिवाणूजन्य करपा)',
    marathiDiseaseName: 'जिवाणूजन्य पानावरील करपा (Bacterial Leaf Blight)',
    confidence: 91.2,
    severity: 'Low',
    symptoms: [
      'Water-soaked to yellowish-white wavy stripes starting from leaf tips and margins.',
      'Milky bacterial ooze drops visible on young lesions in morning dew.'
    ],
    recommendations: {
      curative: [
        'Spray Streptocycline @ 0.1 g + Copper Oxychloride 50 WP @ 2.5 g per liter of water.',
        'Drain excess water from the plot for 2-3 days to curb bacterial spread.'
      ],
      preventive: [
        'Avoid high urea top-dressing during cloudy weather.',
        'Apply Potash (MOP) to enhance leaf sheath resistance.'
      ],
      chemicalDosage: 'Streptocycline 20g + COC 500g in 200L water per acre',
      organicControl: 'Spray fresh cow dung filtrate (20%) or Panchagavya (3%)'
    },
    modelVersion: 'AgriSense-RiceCNN-v1.4 (ResNet50 Backbone - Prototype)',
    isSampleMock: true,
    createdAt: '2026-09-10T09:45:00Z'
  }
];

const INITIAL_RISK_ALERTS = [
  {
    id: 'risk_01',
    farmId: 'farm_ratnagiri_01',
    category: 'Crop Disease Risk',
    severity: 'Moderate',
    title: 'High Humidity & Fog Trigger for Rice Blast',
    marathiTitle: 'जास्त आर्द्रता व धुक्यामुळे करपा रोगाचा धोका',
    description: 'Current 86% relative humidity and 28°C temperatures create optimal fungal spore germination conditions for Pyricularia oryzae in the Chiplun valley.',
    marathiDescription: 'सध्याची ८६% हवेतील आर्द्रता व २८ अंश तापमान करपा बुरशीच्या प्रसारासाठी अनुकूल आहे.',
    source: 'AgriSense ML Risk Engine & DBSKKV Dapoli Advisory',
    possibleCauses: [
      'Continuous overcast monsoon sky with intermittent drizzle.',
      'Dense vegetative canopy with limited air circulation.',
      'Slightly acidic lateritic soil (pH 5.8).'
    ],
    recommendedAction: 'Inspect bottom leaves for diamond-shaped spots. Keep Tricyclazole 75 WP ready for spray during rain breaks.',
    marathiRecommendedAction: 'पानांच्या खालील भागावर ठिपके आहेत का ते तपासा. पावसाच्या उघडीपीत ट्रायसायक्लॅझोल ७५ डब्लूपी फवारणीसाठी तयार ठेवा.',
    createdAt: '2026-09-17T06:00:00Z',
    status: 'Active'
  },
  {
    id: 'risk_02',
    farmId: 'farm_ratnagiri_01',
    category: 'Weather & Monsoonal Risk',
    severity: 'Low',
    title: 'Heavy Rainfall Warning for Konkan Coast',
    marathiTitle: 'कोकण किनारपट्टीवर मध्यम ते मुसळधार पावसाचा इशारा',
    description: 'IMD regional advisory indicates 35-50mm rainfall over the next 48 hours with gusty coastal winds.',
    marathiDescription: 'पुढील ४८ तासांत ३५-५० मिमी पाऊस आणि किनारपट्टीवर सोसाट्याचा वारा वाहण्याची शक्यता.',
    source: 'IMD Mumbai / Regional Meteorological Centre',
    possibleCauses: ['Low pressure trough developing over east-central Arabian Sea off Konkan coast.'],
    recommendedAction: 'Clear field drainage channels to prevent prolonged submergence of active tillers.',
    marathiRecommendedAction: 'शेतातील अतिरिक्त पाण्याचा निचरा करण्यासाठी चर मोकळे करा.',
    createdAt: '2026-09-16T12:00:00Z',
    status: 'Active'
  },
  {
    id: 'risk_03',
    farmId: 'farm_ratnagiri_01',
    category: 'Pest Infestation Risk',
    severity: 'Moderate',
    title: 'Yellow Stem Borer (खोडकीडा) Risk at Panicle Stage',
    marathiTitle: 'लोंबी लागण्याच्या अवस्थेत खोडकिड्याचा धोका',
    description: 'Pheromone trap captures in neighboring Ratnagiri talukas exceed Economic Threshold Level (ETL) of 2 moths/trap/day.',
    marathiDescription: 'शेजारच्या भागात कामगंध सापळ्यात खोडकिड्याचे पतंग आर्थिक नुकसान पातळीपेक्षा जास्त आढळले आहेत.',
    source: 'Konkan Agro Pest Surveillance Unit',
    possibleCauses: ['Late monsoon warm humid spells stimulating larval hatch in leaf sheaths.'],
    recommendedAction: 'Install 5 Pheromone traps per acre with Scirpophaga incertulas lures. Release Trichogramma japonicum egg parasitoids.',
    marathiRecommendedAction: 'प्रति एकरी ५ कामगंध सापळे लावा. ट्रायकोकार्डचा वापर करा.',
    createdAt: '2026-09-15T15:30:00Z',
    status: 'Active'
  },
  {
    id: 'risk_04',
    farmId: 'farm_ratnagiri_01',
    category: 'Soil Nutrient / pH Risk',
    severity: 'Low',
    title: 'Nitrogen Leaching Post Heavy Showers',
    marathiTitle: 'मुसळधार पावसामुळे नत्राचा निचरा होण्याचा धोका',
    description: 'Recent 120mm cumulative precipitation over 4 days has lowered available topsoil Nitrogen to 215 kg/ha.',
    marathiDescription: 'गेल्या ४ दिवसांतील मुसळधार पावसामुळे मातीतील उपलब्ध नत्राचे प्रमाण घटले आहे.',
    source: 'Simulated Soil Sensor Telemetry',
    possibleCauses: ['Porous laterite soil leaching soluble nitrates.'],
    recommendedAction: 'Apply light split dose of Neem-coated Urea mixed with organic compost once standing water stabilizes at 3-5 cm.',
    marathiRecommendedAction: 'निमकोटेड युरियाचा हलका हप्ता शेतातील पाणी कमी झाल्यावर द्या.',
    createdAt: '2026-09-14T08:00:00Z',
    status: 'Acknowledged'
  }
];

const INITIAL_ADVISORIES = [
  {
    id: 'adv_01',
    farmId: 'farm_ratnagiri_01',
    category: 'Crop Management',
    title: 'Water Management for Panicle Initiation Stage',
    marathiTitle: 'भात पिकामध्ये लोंबी लागण्याच्या अवस्थेत पाण्याचे नियोजन',
    content: 'At the panicle initiation stage (45-60 days post transplantation), maintain a steady water depth of 3 to 5 cm. Avoid complete drainage as water deficit during this phase leads to unfilled spikelets and chaffy grains.',
    marathiContent: 'लोंबी निघण्याच्या संवेदनशील अवस्थेत खाचरात ३ ते ५ सेंमी पाणी कायम ठेवावे. या अवस्थेत पाण्याचा ताण पडल्यास दाणे पोचट राहतात.',
    cropStage: 'Panicle Initiation (लोंबी लागणे)',
    actionItem: 'Maintain 4 cm water level; check field bunds for leakages.',
    marathiActionItem: 'खाचरात ४ सेमी पाणी पातळी ठेवा आणि बांधाची गळती थांबवा.',
    source: 'Dr. Balasaheb Sawant Konkan Krishi Vidyapeeth (DBSKKV), Dapoli',
    createdAt: '2026-09-17T07:00:00Z',
    saved: true
  },
  {
    id: 'adv_02',
    farmId: 'farm_ratnagiri_01',
    category: 'Fertilizer Guidance',
    title: 'Third Split Application of Potassium & Nitrogen',
    marathiTitle: 'नत्र आणि पालाशचा तिसरा हप्ता देण्याबाबत मार्गदर्शन',
    content: 'Apply remaining 25% Nitrogen (Urea) and 25% Potash (MOP) at panicle emergence. Potassium enhances straw strength against coastal winds and improves grain luster and weight.',
    marathiContent: 'लोंबी बाहेर पडताना उर्वरित २५% नत्र आणि २५% पालाश द्यावे. पालाशमुळे खोड मजबूत होते व दाण्यांना चकाकी येते.',
    cropStage: 'Panicle Initiation (लोंबी लागणे)',
    actionItem: 'Top-dress 20 kg Urea + 10 kg Muriate of Potash per acre in morning.',
    marathiActionItem: 'प्रति एकरी २० किलो युरिया + १० किलो म्युरिएट ऑफ पोटॅश टाकावे.',
    source: 'Department of Agriculture, Govt. of Maharashtra',
    createdAt: '2026-09-15T11:00:00Z',
    saved: false
  },
  {
    id: 'adv_03',
    farmId: 'farm_ratnagiri_01',
    category: 'Pest & Disease Prevention',
    title: 'Biological Control of Rice Brown Planthopper (तुडतुडे)',
    marathiTitle: 'तपकिरी तुडतुड्यांचे (BPH) जैविक व एकात्मिक नियंत्रण',
    content: 'Observe the base of rice hills near the water line. If 5-10 planthoppers per hill are spotted, create alleyways of 30 cm after every 2-3 meters (passing rays) to improve sunlight penetration and air movement.',
    marathiContent: 'खाचरातील रोपांच्या बुंध्याशी तुडतुडे तपासा. दर ३ मीटरवर ३० सेमीची मोकळी वाट ठेवावी ज्यामुळे हवा व सूर्यप्रकाश मिळेल.',
    cropStage: 'Tillering / Panicle',
    actionItem: 'Make 30 cm inspection alleys; avoid excessive insecticide sprays that kill friendly spiders.',
    marathiActionItem: 'शेतात मोकळ्या वाटा करा आणि मित्रकिटकांचे रक्षण करा.',
    source: 'Regional Agricultural Research Station, Karjat (Raigad)',
    createdAt: '2026-09-12T09:00:00Z',
    saved: true
  },
  {
    id: 'adv_04',
    farmId: 'farm_ratnagiri_01',
    category: 'Rice Cultivation Practices',
    title: 'Pre-Harvest Rodent & Sheath Blight Sanitation',
    marathiTitle: 'उंदीर नियंत्रण व पर्णकोष करपा प्रतिबंधक उपाय',
    content: 'Keep field bunds trimmed to 15 cm width to prevent rodent burrows. Ensure proper drainage before final grain maturity to accelerate uniform ripening.',
    marathiContent: 'बांधावरील गवत काढून टाका जेणेकरून उंदरांचा प्रादुर्भाव होणार नाही. दाणे भरल्यावर हळूहळू पाणी कमी करा.',
    cropStage: 'Grain Filling / Ripening',
    actionItem: 'Trim bund grasses and place zinc phosphide baits with agricultural supervision.',
    marathiActionItem: 'बांध स्वच्छ ठेवा व उंदीर नियंत्रण व्यवस्था करा.',
    source: 'Konkan Krishi Advisory Bulletin',
    createdAt: '2026-09-08T14:00:00Z',
    saved: false
  }
];

const INITIAL_MARKET_PRICES = [
  {
    id: 'mkt_01',
    cropName: 'Paddy / Rice (धान / भात)',
    variety: 'Wada Kolam (वाडा कोलम)',
    marketName: 'APMC Navi Mumbai (Vashi)',
    location: 'Turbhe, Navi Mumbai - Thane/Konkan',
    price: 3850,
    previousPrice: 3720,
    unit: 'Quintal',
    source: 'MSAMB (Maharashtra State Agricultural Marketing Board) - Demo Source',
    recordedAt: '2026-09-17T11:30:00Z',
    trend: 'Up'
  },
  {
    id: 'mkt_02',
    cropName: 'Paddy / Rice (धान / भात)',
    variety: 'Karjat-3 / Ratna (कर्जत-३)',
    marketName: 'APMC Mangaon',
    location: 'Mangaon Mandi, Raigad',
    price: 2480,
    previousPrice: 2450,
    unit: 'Quintal',
    source: 'Sample APMC Mandi Feed',
    recordedAt: '2026-09-17T11:00:00Z',
    trend: 'Up'
  },
  {
    id: 'mkt_03',
    cropName: 'Paddy / Rice (धान / भात)',
    variety: 'Karjat-5 (कर्जत-५)',
    marketName: 'APMC Chiplun',
    location: 'Chiplun Market Yard, Ratnagiri',
    price: 2420,
    previousPrice: 2440,
    unit: 'Quintal',
    source: 'Sample APMC Mandi Feed',
    recordedAt: '2026-09-17T10:30:00Z',
    trend: 'Down'
  },
  {
    id: 'mkt_04',
    cropName: 'Paddy / Rice (धान / भात)',
    variety: 'Indrayani Fragrant (इंद्रायणी)',
    marketName: 'APMC Panvel',
    location: 'Panvel, Raigad',
    price: 3600,
    previousPrice: 3600,
    unit: 'Quintal',
    source: 'MSAMB (Maharashtra State Agricultural Marketing Board) - Demo Source',
    recordedAt: '2026-09-17T09:45:00Z',
    trend: 'Stable'
  },
  {
    id: 'mkt_05',
    cropName: 'Paddy / Rice (धान / भात)',
    variety: 'Jaya / Coarse Rice (जया भात)',
    marketName: 'APMC Khed',
    location: 'Khed Market Yard, Ratnagiri',
    price: 2280,
    previousPrice: 2250,
    unit: 'Quintal',
    source: 'Sample APMC Mandi Feed',
    recordedAt: '2026-09-17T09:00:00Z',
    trend: 'Up'
  }
];

const INITIAL_PRICE_FORECASTS = [
  {
    id: 'fc_01',
    cropName: 'Paddy / Rice',
    variety: 'Wada Kolam (वाडा कोलम)',
    marketName: 'APMC Navi Mumbai (Vashi)',
    forecastDate: '2026-10-15',
    predictedPrice: 4120,
    lowerBound: 3950,
    upperBound: 4280,
    modelVersion: 'AgriSense-PriceLSTM-v1.2 (Time Series Prototype)',
    trend: 'Upward',
    advisoryDecision: 'Hold / Wait',
    advisoryReason: 'Festive season demand (Diwali) and reduced early supply from Konkan will push prices up by 7-10% over the next 3 weeks.',
    createdAt: '2026-09-17T06:00:00Z'
  },
  {
    id: 'fc_02',
    cropName: 'Paddy / Rice',
    variety: 'Karjat-3 (कर्जत-३)',
    marketName: 'APMC Chiplun',
    forecastDate: '2026-10-10',
    predictedPrice: 2560,
    lowerBound: 2480,
    upperBound: 2650,
    modelVersion: 'AgriSense-PriceLSTM-v1.2 (Time Series Prototype)',
    trend: 'Upward',
    advisoryDecision: 'Gradual Selling',
    advisoryReason: 'Local mill procurement will begin in October. Stagger harvest sales to capture incremental price gains.',
    createdAt: '2026-09-17T06:00:00Z'
  }
];

const INITIAL_VOICE_QUERIES = [
  {
    id: 'vq_01',
    farmerId: 'farmer_konkan_01',
    language: 'mr',
    question: 'माझ्या भाताच्या पानांवर लालसर करडे ठिपके आले आहेत, काय करावे?',
    answer: 'हे भातावरील करपा (Rice Blast) रोगाचे लक्षण असू शकते. तातडीने ट्रायसायक्लॅझोल ७५ डब्लूपी ०.६ ग्रॅम प्रति लिटर पाण्यात मिसळून फवारणी करा. युरियाचा अतिरिक्त वापर टाळा.',
    createdAt: '2026-09-16T17:15:00Z'
  },
  {
    id: 'vq_02',
    farmerId: 'farmer_konkan_01',
    language: 'en',
    question: 'What is the current mandi price for Wada Kolam rice in Vashi APMC?',
    answer: 'The current wholesale price for premium Wada Kolam at APMC Navi Mumbai (Vashi) is ₹3,850 per quintal, with an upward forecast over the next 15 days.',
    createdAt: '2026-09-15T10:40:00Z'
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_01',
    title: 'Rice Blast Alert (Chiplun)',
    message: 'High humidity conditions detected. Check leaf diagnostic tool for preventive spray guidelines.',
    type: 'alert',
    timestamp: '2 hours ago',
    read: false
  },
  {
    id: 'notif_02',
    title: 'Rainfall Advisory Updated',
    message: 'Regional Agro-Met bulletin predicts 35-50mm rainfall over Ratnagiri & Raigad.',
    type: 'info',
    timestamp: '5 hours ago',
    read: false
  },
  {
    id: 'notif_03',
    title: 'Wada Kolam Price Jump',
    message: 'APMC Vashi rate surged by ₹130/quintal today reaching ₹3,850/qtl.',
    type: 'success',
    timestamp: '1 day ago',
    read: true
  }
];

// LocalStorage Keys
const STORAGE_KEYS = {
  FARMER: 'agrisense_farmer',
  FARMS: 'agrisense_farms',
  CROPS: 'agrisense_crops',
  SOIL_READINGS: 'agrisense_soil_readings',
  WEATHER_READINGS: 'agrisense_weather_readings',
  CROP_ANALYSES: 'agrisense_crop_analyses',
  RISK_ALERTS: 'agrisense_risk_alerts',
  ADVISORIES: 'agrisense_advisories',
  MARKET_PRICES: 'agrisense_market_prices',
  PRICE_FORECASTS: 'agrisense_price_forecasts',
  VOICE_QUERIES: 'agrisense_voice_queries',
  NOTIFICATIONS: 'agrisense_notifications',
  ACTIVE_FARM_ID: 'agrisense_active_farm_id',
  LANGUAGE: 'agrisense_language',
  AREA_UNIT: 'agrisense_area_unit',
  WEIGHT_UNIT: 'agrisense_weight_unit',
};

class DatabaseService {
  getItem(key, defaultVal) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving to localStorage [${key}]:`, e);
    }
  }

  // Initialization
  initializeDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.FARMER)) {
      this.setItem(STORAGE_KEYS.FARMER, INITIAL_FARMER);
    }
    if (!localStorage.getItem(STORAGE_KEYS.FARMS)) {
      this.setItem(STORAGE_KEYS.FARMS, INITIAL_FARMS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CROPS)) {
      this.setItem(STORAGE_KEYS.CROPS, INITIAL_CROPS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SOIL_READINGS)) {
      this.setItem(STORAGE_KEYS.SOIL_READINGS, INITIAL_SOIL_READINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.WEATHER_READINGS)) {
      this.setItem(STORAGE_KEYS.WEATHER_READINGS, INITIAL_WEATHER_READINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CROP_ANALYSES)) {
      this.setItem(STORAGE_KEYS.CROP_ANALYSES, INITIAL_CROP_ANALYSES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.RISK_ALERTS)) {
      this.setItem(STORAGE_KEYS.RISK_ALERTS, INITIAL_RISK_ALERTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADVISORIES)) {
      this.setItem(STORAGE_KEYS.ADVISORIES, INITIAL_ADVISORIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MARKET_PRICES)) {
      this.setItem(STORAGE_KEYS.MARKET_PRICES, INITIAL_MARKET_PRICES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRICE_FORECASTS)) {
      this.setItem(STORAGE_KEYS.PRICE_FORECASTS, INITIAL_PRICE_FORECASTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.VOICE_QUERIES)) {
      this.setItem(STORAGE_KEYS.VOICE_QUERIES, INITIAL_VOICE_QUERIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_FARM_ID)) {
      this.setItem(STORAGE_KEYS.ACTIVE_FARM_ID, INITIAL_FARMS[0].id);
    }
  }

  // Farmer CRUD
  getFarmer() {
    return this.getItem(STORAGE_KEYS.FARMER, INITIAL_FARMER);
  }

  updateFarmer(farmer) {
    const current = this.getFarmer();
    const updated = { ...current, ...farmer };
    this.setItem(STORAGE_KEYS.FARMER, updated);
    return updated;
  }

  // Farm CRUD
  getFarms() {
    return this.getItem(STORAGE_KEYS.FARMS, INITIAL_FARMS);
  }

  getFarmById(id) {
    return this.getFarms().find(f => f.id === id);
  }

  addFarm(farmData) {
    const farms = this.getFarms();
    const newFarm = {
      ...farmData,
      id: `farm_${Date.now()}`
    };
    farms.push(newFarm);
    this.setItem(STORAGE_KEYS.FARMS, farms);
    return newFarm;
  }

  updateFarm(id, farmData) {
    const farms = this.getFarms();
    const index = farms.findIndex(f => f.id === id);
    if (index !== -1) {
      farms[index] = { ...farms[index], ...farmData };
      this.setItem(STORAGE_KEYS.FARMS, farms);
      return farms[index];
    }
    return undefined;
  }

  deleteFarm(id) {
    const farms = this.getFarms();
    const filtered = farms.filter(f => f.id !== id && f._id !== id);
    this.setItem(STORAGE_KEYS.FARMS, filtered);
    return true;
  }

  getActiveFarmId() {
    return this.getItem(STORAGE_KEYS.ACTIVE_FARM_ID, INITIAL_FARMS[0].id);
  }

  setActiveFarmId(id) {
    this.setItem(STORAGE_KEYS.ACTIVE_FARM_ID, id);
  }

  // Crop CRUD
  getCrops(farmId) {
    const crops = this.getItem(STORAGE_KEYS.CROPS, INITIAL_CROPS);
    return farmId ? crops.filter(c => c.farmId === farmId) : crops;
  }

  addCrop(cropData) {
    const crops = this.getItem(STORAGE_KEYS.CROPS, INITIAL_CROPS);
    const newCrop = {
      ...cropData,
      id: `crop_${Date.now()}`
    };
    crops.push(newCrop);
    this.setItem(STORAGE_KEYS.CROPS, crops);
    return newCrop;
  }

  updateCrop(id, cropData) {
    const crops = this.getItem(STORAGE_KEYS.CROPS, INITIAL_CROPS);
    const index = crops.findIndex(c => c.id === id);
    if (index !== -1) {
      crops[index] = { ...crops[index], ...cropData };
      this.setItem(STORAGE_KEYS.CROPS, crops);
      return crops[index];
    }
    return undefined;
  }

  // Soil Readings
  getSoilReadings(farmId) {
    const readings = this.getItem(STORAGE_KEYS.SOIL_READINGS, INITIAL_SOIL_READINGS);
    return farmId ? readings.filter(r => r.farmId === farmId) : readings;
  }

  addSoilReading(reading) {
    const readings = this.getSoilReadings();
    const newReading = {
      ...reading,
      id: `soil_${Date.now()}`
    };
    readings.unshift(newReading);
    this.setItem(STORAGE_KEYS.SOIL_READINGS, readings);
    return newReading;
  }

  // Weather Readings
  getWeatherReadings(farmId) {
    const readings = this.getItem(STORAGE_KEYS.WEATHER_READINGS, INITIAL_WEATHER_READINGS);
    return farmId ? readings.filter(r => r.farmId === farmId) : readings;
  }

  // Crop Analyses
  getCropAnalyses(farmId) {
    const analyses = this.getItem(STORAGE_KEYS.CROP_ANALYSES, INITIAL_CROP_ANALYSES);
    return farmId ? analyses.filter(a => a.farmId === farmId) : analyses;
  }

  addCropAnalysis(analysis) {
    const analyses = this.getCropAnalyses();
    const newAnalysis = {
      ...analysis,
      id: `analysis_${Date.now()}`
    };
    analyses.unshift(newAnalysis);
    this.setItem(STORAGE_KEYS.CROP_ANALYSES, analyses);
    return newAnalysis;
  }

  // Risk Alerts
  getRiskAlerts(farmId) {
    const alerts = this.getItem(STORAGE_KEYS.RISK_ALERTS, INITIAL_RISK_ALERTS);
    return farmId ? alerts.filter(a => a.farmId === farmId) : alerts;
  }

  updateRiskStatus(id, status) {
    const alerts = this.getRiskAlerts();
    const index = alerts.findIndex(a => a.id === id);
    if (index !== -1) {
      alerts[index].status = status;
      this.setItem(STORAGE_KEYS.RISK_ALERTS, alerts);
    }
  }

  // Advisories
  getAdvisories() {
    return this.getItem(STORAGE_KEYS.ADVISORIES, INITIAL_ADVISORIES);
  }

  toggleSaveAdvisory(id) {
    const advisories = this.getAdvisories();
    const item = advisories.find(a => a.id === id);
    if (item) {
      item.saved = !item.saved;
      this.setItem(STORAGE_KEYS.ADVISORIES, advisories);
    }
  }

  // Market Prices
  getMarketPrices() {
    return this.getItem(STORAGE_KEYS.MARKET_PRICES, INITIAL_MARKET_PRICES);
  }

  getPriceForecasts() {
    return this.getItem(STORAGE_KEYS.PRICE_FORECASTS, INITIAL_PRICE_FORECASTS);
  }

  // Voice Queries
  getVoiceQueries() {
    return this.getItem(STORAGE_KEYS.VOICE_QUERIES, INITIAL_VOICE_QUERIES);
  }

  addVoiceQuery(query) {
    const queries = this.getVoiceQueries();
    const newQuery = {
      ...query,
      id: `vq_${Date.now()}`
    };
    queries.unshift(newQuery);
    this.setItem(STORAGE_KEYS.VOICE_QUERIES, queries);
    return newQuery;
  }

  // Notifications
  getNotifications() {
    return this.getItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  markNotificationAsRead(id) {
    const notifs = this.getNotifications();
    const item = notifs.find(n => n.id === id);
    if (item) {
      item.read = true;
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  }

  clearAllNotifications() {
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, []);
  }

  resetDatabase() {
    localStorage.clear();
    this.initializeDefaults();
  }

  // Export full
  exportData() {
    const allData = {
      farmer: this.getFarmer(),
      farms: this.getFarms(),
      crops: this.getCrops(),
      soilReadings: this.getSoilReadings(),
      weatherReadings: this.getWeatherReadings(),
      cropAnalyses: this.getCropAnalyses(),
      riskAlerts: this.getRiskAlerts(),
      advisories: this.getAdvisories(),
      marketPrices: this.getMarketPrices(),
      priceForecasts: this.getPriceForecasts(),
      voiceQueries: this.getVoiceQueries(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(allData, null, 2);
  }
}

export const db = new DatabaseService();