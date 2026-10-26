/* Seed Script: */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const MarketPrice = require('../models/MarketPrice');
const Advisory = require('../models/Advisory');

const MARKET_PRICES = [
  {
    cropName: 'Paddy / Rice',
    variety: 'Wada Kolam',
    marketName: 'APMC Navi Mumbai (Vashi)',
    location: 'Turbhe, Navi Mumbai',
    price: 3850,
    previousPrice: 3720,
    unit: 'Quintal',
    source: 'MSAMB Maharashtra',
    trend: 'Up',
    recordedAt: new Date(),
    forecastPrice: 4100,
    forecastDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    forecastTrend: 'Upward',
    advisoryDecision: 'Hold / Wait',
    advisoryReason: 'Festive season demand likely to push prices up by 6-8% in the next 3 weeks.',
  },
  {
    cropName: 'Paddy / Rice',
    variety: 'Karjat-3',
    marketName: 'APMC Mangaon',
    location: 'Mangaon Mandi, Raigad',
    price: 2480,
    previousPrice: 2450,
    unit: 'Quintal',
    source: 'MSAMB Maharashtra',
    trend: 'Up',
    recordedAt: new Date(),
  },
  {
    cropName: 'Paddy / Rice',
    variety: 'Karjat-5',
    marketName: 'APMC Chiplun',
    location: 'Chiplun Market Yard, Ratnagiri',
    price: 2420,
    previousPrice: 2440,
    unit: 'Quintal',
    source: 'MSAMB Maharashtra',
    trend: 'Down',
    recordedAt: new Date(),
  },
  {
    cropName: 'Paddy / Rice',
    variety: 'Indrayani Fragrant',
    marketName: 'APMC Panvel',
    location: 'Panvel, Raigad',
    price: 3600,
    previousPrice: 3600,
    unit: 'Quintal',
    source: 'MSAMB Maharashtra',
    trend: 'Stable',
    recordedAt: new Date(),
  },
  {
    cropName: 'Paddy / Rice',
    variety: 'Jaya / Coarse Rice',
    marketName: 'APMC Khed',
    location: 'Khed Market Yard, Ratnagiri',
    price: 2280,
    previousPrice: 2250,
    unit: 'Quintal',
    source: 'MSAMB Maharashtra',
    trend: 'Up',
    recordedAt: new Date(),
  },
];

const ADVISORIES = [
  {
    category: 'Crop Management',
    title: 'Water Management for Panicle Initiation Stage',
    marathiTitle: 'लोंबी लागण्याच्या अवस्थेत पाण्याचे नियोजन',
    content:
      'At the panicle initiation stage (45-60 days post transplantation), maintain a steady water depth of 3 to 5 cm. Avoid complete drainage as water deficit during this phase leads to unfilled spikelets and chaffy grains.',
    marathiContent:
      'लोंबी निघण्याच्या संवेदनशील अवस्थेत खाचरात ३ ते ५ सेंमी पाणी कायम ठेवावे. या अवस्थेत पाण्याचा ताण पडल्यास दाणे पोचट राहतात.',
    cropStage: 'Panicle Initiation',
    actionItem: 'Maintain 4 cm water level; check field bunds for leakages.',
    marathiActionItem: 'खाचरात ४ सेमी पाणी पातळी ठेवा आणि बांधाची गळती थांबवा.',
    source: 'Dr. Balasaheb Sawant Konkan Krishi Vidyapeeth (DBSKKV), Dapoli',
    savedBy: [],
  },
  {
    category: 'Fertilizer Guidance',
    title: 'Third Split Application of Potassium & Nitrogen',
    marathiTitle: 'नत्र आणि पालाशचा तिसरा हप्ता देण्याबाबत मार्गदर्शन',
    content:
      'Apply remaining 25% Nitrogen (Urea) and 25% Potash (MOP) at panicle emergence. Potassium enhances straw strength and improves grain weight.',
    marathiContent:
      'लोंबी बाहेर पडताना उर्वरित २५% नत्र आणि २५% पालाश द्यावे. पालाशमुळे खोड मजबूत होते व दाण्यांना चकाकी येते.',
    cropStage: 'Panicle Initiation',
    actionItem: 'Top-dress 20 kg Urea + 10 kg Muriate of Potash per acre in morning.',
    marathiActionItem: 'प्रति एकरी २० किलो युरिया + १० किलो म्युरिएट ऑफ पोटॅश टाकावे.',
    source: 'Department of Agriculture, Govt. of Maharashtra',
    savedBy: [],
  },
  {
    category: 'Pest & Disease Prevention',
    title: 'Biological Control of Rice Brown Planthopper',
    marathiTitle: 'तपकिरी तुडतुड्यांचे (BPH) जैविक नियंत्रण',
    content:
      'Observe the base of rice hills near the water line. If 5-10 planthoppers per hill are spotted, create alleyways of 30 cm after every 2-3 meters to improve sunlight penetration and air movement.',
    marathiContent:
      'खाचरातील रोपांच्या बुंध्याशी तुडतुडे तपासा. दर ३ मीटरवर ३० सेमीची मोकळी वाट ठेवावी ज्यामुळे हवा व सूर्यप्रकाश मिळेल.',
    cropStage: 'Tillering / Panicle',
    actionItem: 'Make 30 cm inspection alleys; avoid excessive insecticide sprays that kill spiders.',
    marathiActionItem: 'शेतात मोकळ्या वाटा करा आणि मित्रकिटकांचे रक्षण करा.',
    source: 'Regional Agricultural Research Station, Karjat (Raigad)',
    savedBy: [],
  },
  {
    category: 'Rice Cultivation Practices',
    title: 'Pre-Harvest Rodent & Sheath Blight Sanitation',
    marathiTitle: 'उंदीर नियंत्रण व पर्णकोष करपा प्रतिबंधक उपाय',
    content:
      'Keep field bunds trimmed to 15 cm width to prevent rodent burrows. Ensure proper drainage before final grain maturity to accelerate uniform ripening.',
    marathiContent:
      'बांधावरील गवत काढून टाका जेणेकरून उंदरांचा प्रादुर्भाव होणार नाही. दाणे भरल्यावर हळूहळू पाणी कमी करा.',
    cropStage: 'Grain Filling / Ripening',
    actionItem: 'Trim bund grasses and place zinc phosphide baits with agricultural supervision.',
    marathiActionItem: 'बांध स्वच्छ ठेवा व उंदीर नियंत्रण व्यवस्था करा.',
    source: 'Konkan Krishi Advisory Bulletin',
    savedBy: [],
  },
];

async function autoSeed() {
  try {
    const priceCount = await MarketPrice.countDocuments();
    if (priceCount === 0) {
      await MarketPrice.insertMany(MARKET_PRICES);
      console.log(`🌱 Auto-seeded ${MARKET_PRICES.length} initial market price records`);
    }

    const advCount = await Advisory.countDocuments();
    if (advCount === 0) {
      await Advisory.insertMany(ADVISORIES);
      console.log(`🌱 Auto-seeded ${ADVISORIES.length} initial advisory bulletins`);
    }
  } catch (err) {
    console.error('⚠️ Auto-seed check notice:', err.message);
  }
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agrisense');
    console.log('✅ Connected to MongoDB');
    await autoSeed();
    console.log('\n🎉 Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = { autoSeed, MARKET_PRICES, ADVISORIES };
