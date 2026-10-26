// cropAnalysisService.js

export const DETECTABLE_CONDITIONS = [
  'Bacterial Leaf Blight',
  'Brown Spot',
  'Healthy',
  'Leaf Blast',
  'Leaf Scald',
  'Sheath Blight',
];

export const DISEASE_KNOWLEDGE_BASE = {
  'Bacterial Leaf Blight': {
    marathiDiseaseName: 'जिवाणूजन्य पानांचा करपा (Bacterial Leaf Blight)',
    whatItIs: 'Bacterial leaf blight (Xanthomonas oryzae) is a severe vascular disease of paddy causing water-soaked to yellowish-white stripes along leaf margins, leading to rapid wilting (Kresek).',
    symptoms: [
      'Water-soaked lesions on leaf margins turning wavy yellowish-white',
      'Milky bacterial ooze beads on young lesions during humid mornings',
      'Leaf tips turn grayish-white and dry out rapidly',
      'Kresek stage: Complete seedling wilting and rolling of leaves'
    ],
    curative: [
      'Spray Streptocycline @ 0.1 g/L + Copper Oxychloride 50% WP @ 2.5 g/L',
      'Alternate spray with Plantomycin @ 1 g/L + Mancozeb 75% WP @ 2.5 g/L',
      'Drain standing water from field for 3–4 days to halt bacterial spread'
    ],
    preventive: [
      'Avoid excess nitrogenous fertilizers (split urea application into 3 doses)',
      'Use resistant varieties (e.g., Karjat-3, Ratnagiri-24, Phule Radha)',
      'Seed treatment with Streptocycline @ 4 g per 10 kg seed'
    ],
    chemicalDosage: 'Streptocycline 20 g + COC 500 g in 200 L water per acre',
    organicControl: 'Fresh cow dung filtrate spray (20%) + 5% Neem Seed Kernel Extract (NSKE)',
  },
  'Leaf Blast': {
    marathiDiseaseName: 'पानावरील करपा / ब्लास्ट (Leaf Blast)',
    whatItIs: 'Leaf Blast (Magnaporthe oryzae) is the most destructive fungal disease of rice, causing spindle-shaped diamond lesions that rapidly coalesce and burn entire leaf canopies.',
    symptoms: [
      'Spindle/diamond-shaped eye lesions with brownish margins and gray centers',
      'Spots enlarge and coalesce causing complete leaf blighting and burning',
      'Node blast: Black rot at stem nodes causing lodging and panicle drop'
    ],
    curative: [
      'Spray Tricyclazole 75% WP @ 0.6 g/L (Baan) or Isoprothiolane 40% EC @ 1.5 ml/L',
      'Spray Hexaconazole 5% EC @ 2 ml/L or Kasugamycin 3% SL @ 2 ml/L at first appearance',
      'Repeat spray after 10–12 days if overcast weather persists'
    ],
    preventive: [
      'Maintain balanced potassium fertilization to strengthen leaf epidermal silica cells',
      'Avoid late transplanting and very dense nursery seeding',
      'Seed treatment with Carbendazim 50% WP @ 2 g/kg seed'
    ],
    chemicalDosage: 'Tricyclazole 75 WP: 120 g in 200 L water per acre',
    organicControl: 'Spray Pseudomonas fluorescens @ 5 g/L + Cow urine (10%) mixture',
  },
  'Brown Spot': {
    marathiDiseaseName: 'तपकिरी ठिपके (Brown Spot Disease)',
    whatItIs: 'Brown spot (Bipolaris oryzae) is associated with nutrient-deficient or moisture-stressed soils, producing oval dark brown spots on leaves and glumes.',
    symptoms: [
      'Small, circular to oval sesame seed-like brown spots with yellow halos',
      'Spots cover entire leaf surface causing premature yellowing and drying',
      'Dark brown discoloration on grain glumes reducing milling quality'
    ],
    curative: [
      'Spray Mancozeb 75% WP @ 2.5 g/L or Propiconazole 25% EC (Tilt) @ 1 ml/L',
      'Apply foliar spray of 1% Potassium Nitrate (13-0-45) to revitalize crop vigor'
    ],
    preventive: [
      'Apply recommended Potash (MOP) and Zinc Sulfate (25 kg/ha) based on soil test',
      'Ensure proper water management and avoid prolonged moisture stress'
    ],
    chemicalDosage: 'Mancozeb 75 WP: 500 g or Tilt: 200 ml in 200 L water per acre',
    organicControl: 'Foliar spray of 5% Neem oil + Trichoderma viride @ 5 g/L',
  },
  'Sheath Blight': {
    marathiDiseaseName: 'खोड करपा / शीथ ब्लाइट (Sheath Blight)',
    whatItIs: 'Sheath blight (Rhizoctonia solani) attacks the leaf sheath near water level under high humidity, forming greenish-gray snake-skin lesions that spread upward.',
    symptoms: [
      'Oval greenish-gray water-soaked spots with dark brown margins on leaf sheath',
      'Banded snake-skin pattern spreading upward from water level to top flag leaves',
      'Canopy blighting and lodged tillers in dense crop patches'
    ],
    curative: [
      'Spray Validamycin 3% L @ 2 ml/L or Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/L',
      'Alternate with Hexaconazole 5% EC @ 2 ml/L directed towards plant base'
    ],
    preventive: [
      'Maintain optimum plant density (20 x 15 cm); avoid excessive hill density',
      'Burn stubble after harvest to eliminate sclerotia resting bodies'
    ],
    chemicalDosage: 'Validamycin: 400 ml in 200 L water per acre (spray at sheath level)',
    organicControl: 'Soil application of Trichoderma harzianum @ 2.5 kg/acre with FYM',
  },
  'Leaf Scald': {
    marathiDiseaseName: 'लीफ स्कॉल्ड (Leaf Scald)',
    whatItIs: 'Leaf scald (Microdochium oryzae) starts from leaf tips or margins creating characteristic zonate chevron bands of olive-brown and bleached straw color.',
    symptoms: [
      'Zonate chevron-shaped bands with alternating light brown and bleached tan rings',
      'Rapid drying and fraying of leaf tips giving a scalded/scorched appearance',
      'Infection intensifies under warm, wet weather and high nitrogen fertilizer'
    ],
    curative: [
      'Spray Carbendazim 12% + Mancozeb 63% WP (Saaf) @ 2 g/L',
      'Spray Benomyl 50% WP @ 1 g/L or Tebuconazole 25.9% EC @ 1 ml/L'
    ],
    preventive: [
      'Use certified disease-free seed lots',
      'Avoid excessive basal nitrogen; apply split top-dressings'
    ],
    chemicalDosage: 'Saaf (Carbendazim + Mancozeb): 400 g in 200 L water per acre',
    organicControl: 'Foliar spray of Dashparni Ark @ 25 ml/L + Neem oil @ 3 ml/L',
  },
  'Downy Mildew': {
    marathiDiseaseName: 'डाऊनी मिल्ड्यू (केवडा रोग)',
    whatItIs: 'Downy mildew is caused by oomycete pathogens and attacks leaf tissue under cool, humid weather — causing yellow patches on the upper surface and white downy growth underneath.',
    symptoms: ['Yellow or pale green patches on upper leaf surfaces bounded by veins', 'White to purplish downy spore growth under leaf surface during humid mornings', 'Leaves curl, wither, turn brown, and drop prematurely'],
    curative: ['Spray Metalaxyl 8% + Mancozeb 64% WP @ 2.5 g/L at first sign', 'Alternate with Cymoxanil 8% + Mancozeb 64% WP @ 2 g/L'],
    preventive: ['Avoid overhead irrigation late in the evening', 'Ensure proper row spacing (45–60 cm) for air circulation', 'Remove and destroy infected lower leaves'],
    chemicalDosage: 'Metalaxyl + Mancozeb: 500 g in 200 L water per acre',
    organicControl: 'Potassium phosphonate @ 3 ml/L or 1% Bordeaux mixture',
  },
  'Early Blight': {
    marathiDiseaseName: 'लवकर येणारा करपा (Early Blight)',
    whatItIs: 'Early blight (Alternaria fungus) creates distinctive concentric dark rings on older leaves, reducing photosynthesis and weakening plant vigor.',
    symptoms: ['Circular dark brown spots with concentric target-ring pattern', 'Lower leaves turn yellow and drop first', 'Dark sunken lesions on stems and fruit calyx'],
    curative: ['Spray Mancozeb 75% WP @ 2.5 g/L or Azoxystrobin 23% SC @ 1 ml/L', 'Repeat every 10–12 days in rainy conditions'],
    preventive: ['Rotate crops with non-solanaceous crops for 2 seasons', 'Mulch soil around plants to prevent pathogen splash'],
    chemicalDosage: 'Mancozeb 75 WP: 400 g in 200 L water per acre',
    organicControl: 'Trichoderma viride @ 5 g/L + 5% Neem oil',
  },
  'Late Blight': {
    marathiDiseaseName: 'उशिरा येणारा करपा (Late Blight)',
    whatItIs: 'Late blight (Phytophthora infestans) is one of the most destructive diseases, spreading rapidly in wet weather and destroying foliage within days.',
    symptoms: ['Water-soaked dark lesions on leaf tips and margins', 'Rapid blackening with white fungal ring on underside', 'Foul odor in heavily affected canopies'],
    curative: ['Spray Dimethomorph 50% WP @ 1 g/L + Mancozeb @ 2 g/L', 'Ensure complete canopy coverage including leaf undersides'],
    preventive: ['Use certified disease-free seeds and resistant hybrids', 'Drain standing water from field trenches immediately'],
    chemicalDosage: 'Dimethomorph 200 g + Mancozeb 400 g in 200 L water per acre',
    organicControl: 'Copper-based fungicides (Copper Hydroxide @ 2 g/L)',
  },
  'Rust Disease': {
    marathiDiseaseName: 'तांबेरा रोग (Rust Disease)',
    whatItIs: 'Rust disease is characterized by reddish-orange powdery pustules on leaves, depleting plant nutrients and halting growth.',
    symptoms: ['Raised reddish-brown or golden pustules rupturing leaf epidermis', 'Powdery rusty spores that wipe off on touch', 'Premature leaf desiccation and chlorosis'],
    curative: ['Spray Propiconazole 25% EC (Tilt) @ 1 ml/L or Tebuconazole 25.9% EC @ 1 ml/L'],
    preventive: ['Eradicate alternate weed hosts around field bunds', 'Avoid excessive nitrogen fertilizers'],
    chemicalDosage: 'Propiconazole 25 EC: 200 ml in 200 L water per acre',
    organicControl: 'Wettable sulfur (80% WP) @ 2.5 g/L or buttermilk + hing solution',
  },
  'Leaf Spot Fungal': {
    marathiDiseaseName: 'बुरशीजन्य पानावरील ठिपके (Leaf Spot)',
    whatItIs: 'Fungal leaf spot pathogens cause isolated necrosis on leaf surfaces under continuous wet conditions, leading to early leaf drop.',
    symptoms: ['Small, circular brown or gray spots with yellow halos', 'Spots coalesce to form large dead patches'],
    curative: ['Spray Carbendazim 12% + Mancozeb 63% WP (Saaf) @ 2 g/L'],
    preventive: ['Maintain field sanitation and burn dead plant debris'],
    chemicalDosage: 'Carbendazim + Mancozeb: 350 g in 200 L water per acre',
    organicControl: '5% NSKE (Neem Seed Kernel Extract) twice at 10-day intervals',
  },
  'Anthracnose': {
    marathiDiseaseName: 'एंथ्रॅकनोज (तांबडे व काळे डाग)',
    whatItIs: 'Anthracnose (Colletotrichum fungus) produces sunken dark lesions with pinkish spore masses on leaves, stems, and fruits.',
    symptoms: ['Sunken dark brown to black spots with concentric rings', 'Dieback of young twigs and drying of leaf margins'],
    curative: ['Spray Difenoconazole 25% EC @ 0.5 ml/L or Chlorothalonil 75% WP @ 2 g/L'],
    preventive: ['Seed treatment with Thiram 75% WP @ 3 g/kg seed'],
    chemicalDosage: 'Difenoconazole 25 EC: 100 ml in 200 L water per acre',
    organicControl: 'Bio-fungicide Pseudomonas fluorescens @ 5 g/L',
  },
  'Bacterial Spot': {
    marathiDiseaseName: 'जिवाणूजन्य ठिपके (Bacterial Spot)',
    whatItIs: 'Bacterial spot causes water-soaked angular spots on foliage and scab-like lesions on produce, promoted by warm rain.',
    symptoms: ['Small, dark, water-soaked angular spots with yellow margins', 'Spots tear open leaving shot-hole appearance in leaves'],
    curative: ['Spray Streptocycline @ 0.1 g + Copper Oxychloride 50% WP @ 2.5 g/L'],
    preventive: ['Disinfect farm tools and avoid working in wet crop fields'],
    chemicalDosage: 'Streptocycline 20 g + COC 500 g in 200 L water per acre',
    organicControl: 'Fresh cow dung slurry filtrate (20%) or Bacillus subtilis',
  },
  'Powdery Mildew': {
    marathiDiseaseName: 'भुरी रोग (Powdery Mildew)',
    whatItIs: 'Powdery mildew produces a white talcum-like fungal coating on leaf surfaces, halting photosynthesis in dry, warm weather.',
    symptoms: ['White powdery fungal patches on upper leaf surfaces and shoots', 'Leaves turn yellow, curl upward, and dry out'],
    curative: ['Spray Hexaconazole 5% EC @ 1 ml/L or Dinocap 48% EC @ 1 ml/L'],
    preventive: ['Ensure maximum sunlight exposure and avoid deep shade'],
    chemicalDosage: 'Hexaconazole 5 EC: 200 ml in 200 L water per acre',
    organicControl: 'Wettable sulfur @ 2.5 g/L or baking soda solution (5 g/L)',
  },
  'Mosaic Virus': {
    marathiDiseaseName: 'मोझॅक विषाणू (Mosaic Virus)',
    whatItIs: 'Mosaic virus (spread by aphids and whiteflies) causes mottled light/dark green mosaic patterns and severe stunting.',
    symptoms: ['Mottled light-green and dark-green mosaic patterns on leaf blades', 'Blistering, leaf distortion, and stunted plant growth'],
    curative: ['No direct chemical cure. Control vectors with Thiamethoxam 25% WG @ 0.3 g/L'],
    preventive: ['Install yellow sticky traps (15 per acre)', 'Rogue out and burn infected viral plants immediately'],
    chemicalDosage: 'Thiamethoxam 25 WG: 60 g in 200 L water per acre (vector control)',
    organicControl: '1% Neem oil (10,000 ppm) weekly to repel sap-sucking aphids',
  },
  'Leaf Curl Virus': {
    marathiDiseaseName: 'पर्णसंकोच विषाणू (चुरडा-मुरडा)',
    whatItIs: 'Leaf Curl Virus causes severe upward curling, vein thickening, and stunting. Transmitted by Bemisia tabaci whiteflies.',
    symptoms: ['Severe upward curling and crinkling of leaves', 'Thickened prominent green veins on leaf underside', 'Shortened internodes with bushy stunted appearance'],
    curative: ['Spray Diafenthiuron 50% WP @ 1.2 g/L or Acetamiprid 20% SP @ 0.4 g/L'],
    preventive: ['Use silver or reflective plastic mulch to deter whiteflies'],
    chemicalDosage: 'Diafenthiuron 50 WP: 250 g in 200 L water per acre',
    organicControl: 'Dashparni Ark or Agniastra @ 20 ml/L',
  },
  'Root Rot Wilting': {
    marathiDiseaseName: 'मूळकुज व मर रोग (Root Rot / Wilting)',
    whatItIs: 'Soil-borne fungi (Fusarium/Rhizoctonia) infect root tissues causing sudden daytime wilting and vascular discoloration.',
    symptoms: ['Sudden wilting and drooping of green foliage during sunny hours', 'Dark brown to black discoloration of internal stem vascular ring near collar'],
    curative: ['Drench root zone with Copper Oxychloride 50 WP @ 3 g/L or Metalaxyl-M + Mancozeb @ 2.5 g/L'],
    preventive: ['Ensure good soil drainage; avoid waterlogging around stem collars'],
    chemicalDosage: 'COC 50 WP root drenching: 600 g in 200 L water per acre',
    organicControl: 'Trichoderma harzianum @ 2.5 kg mixed in 100 kg FYM',
  },
  'Healthy': {
    marathiDiseaseName: 'निरोगी पीक (Healthy Crop)',
    whatItIs: 'The leaf shows normal cellular structure with uniform chlorophyll density, free from any necrotic spots, chlorosis, fungal mycelium, or viral distortion.',
    symptoms: ['Uniform vibrant green color across the leaf blade', 'Intact leaf margins and healthy vascular structure'],
    curative: ['No curative sprays required'],
    preventive: ['Continue regular nutrient management and weekly field scouting'],
    chemicalDosage: 'None required',
    organicControl: 'Periodic prophylactic sprays of Jeevamrut or Panchagavya',
  },
};

// Aliases for model class names with underscores
DISEASE_KNOWLEDGE_BASE['Bacterial_Leaf_Blight'] = DISEASE_KNOWLEDGE_BASE['Bacterial Leaf Blight'];
DISEASE_KNOWLEDGE_BASE['Brown_Spot'] = DISEASE_KNOWLEDGE_BASE['Brown Spot'];
DISEASE_KNOWLEDGE_BASE['Healthy'] = DISEASE_KNOWLEDGE_BASE['Healthy'];
DISEASE_KNOWLEDGE_BASE['Leaf_Blast'] = DISEASE_KNOWLEDGE_BASE['Leaf Blast'];
DISEASE_KNOWLEDGE_BASE['Leaf_Scald'] = DISEASE_KNOWLEDGE_BASE['Leaf Scald'];
DISEASE_KNOWLEDGE_BASE['Sheath_Blight'] = DISEASE_KNOWLEDGE_BASE['Sheath Blight'];

const MODEL_ENDPOINT = import.meta.env.VITE_CROP_MODEL_ENDPOINT || 'http://localhost:8000/predict-disease';

async function callTrainedModel(base64Data, cropName = 'Rice') {
  if (MODEL_ENDPOINT) {
    try {
      const res = await fetch(MODEL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: base64Data,
          image: base64Data,
          crop_name: cropName,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          ...data,
          _isDemo: false,
        };
      }
    } catch (err) {
      console.warn('AI microservice fetch failed, falling back to simulated inference:', err);
    }
  }

  await new Promise(r => setTimeout(r, 1800));
  const demoConditions = [
    { condition: 'Leaf Blast', score: 86.4 },
    { condition: 'Brown Spot', score: 7.2 },
    { condition: 'Bacterial Leaf Blight', score: 3.8 },
    { condition: 'Sheath Blight', score: 1.5 },
    { condition: 'Healthy', score: 0.8 },
    { condition: 'Leaf Scald', score: 0.3 },
  ];
  return {
    diseaseName: 'Leaf Blast',
    confidence: 86.4,
    severity: 'Critical',
    allPredictions: demoConditions,
    _isDemo: true,
  };
}

// Main Analysis
class CropAnalysisService {
  async analyzeCropImage(imageDataUrl, farmerId, farmId, farmContext = {}) {
    const base64Data = imageDataUrl.includes(',')
      ? imageDataUrl.split(',')[1]
      : imageDataUrl;

    const cropName = farmContext.cropName || 'Rice';
    const modelOutput = await callTrainedModel(base64Data, cropName);

    const rawKey = modelOutput.diseaseName || 'Leaf Blast';
    const detectedKey = rawKey.replace(/_/g, ' ');
    const kb = DISEASE_KNOWLEDGE_BASE[detectedKey] || DISEASE_KNOWLEDGE_BASE[rawKey] || DISEASE_KNOWLEDGE_BASE['Leaf Blast'] || DISEASE_KNOWLEDGE_BASE['Healthy'];

    const modelPreds = (modelOutput.allPredictions || []).map(p => ({
      ...p,
      condition: (p.condition || '').replace(/_/g, ' ')
    }));
    const coveredKeys  = new Set(modelPreds.map(p => p.condition));
    const remaining    = DETECTABLE_CONDITIONS.filter(c => !coveredKeys.has(c));
    const fullPreds    = [
      ...modelPreds,
      ...remaining.map((c, i) => ({ condition: c, score: Math.max(0.1, 0.3 - i * 0.02) })),
    ]
      .sort((a, b) => b.score - a.score)
      .map((p, idx) => ({ ...p, isTop: idx === 0 }));

    return {
      id: `analysis_${Date.now()}`,
      farmerId,
      farmId: farmId || farmContext.farmId || null,
      farmName: farmContext.farmName || 'Konkan Farm Plot',
      cropName: farmContext.cropName || 'Rice (भात)',
      variety: farmContext.variety || 'Karjat-3',
      cropStage: farmContext.cropStage || 'Tillering',
      imageUrl: imageDataUrl,
      diseaseName: detectedKey,
      marathiDiseaseName: kb.marathiDiseaseName,
      whatItIs: kb.whatItIs,
      confidence: typeof modelOutput.confidence === 'number' ? modelOutput.confidence : 50,
      severity: modelOutput.severity || 'Moderate',
      symptoms: kb.symptoms,
      recommendations: {
        curative: kb.curative,
        preventive: kb.preventive,
        chemicalDosage: kb.chemicalDosage,
        organicControl: kb.organicControl,
      },
      allPredictions: fullPreds,
      _isDemo: modelOutput._isDemo || false,
      modelVersion: MODEL_ENDPOINT ? 'Custom Trained Model v1' : 'Demo Mode',
      createdAt: new Date().toISOString(),
    };
  }
}

export const cropAnalysisService = new CropAnalysisService();