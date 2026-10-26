/**
 * weatherService.js  ─  OpenWeatherMap Live Weather
 * Fixes: per-district cache, GPS detection, city search
 */

const OW_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '';
const BASE   = 'https://api.openweathermap.org/data/2.5';
const GEO    = 'https://api.openweathermap.org/geo/1.0';
const CACHE_MS = 20 * 60 * 1000; // 20-min cache per location

// ── Maharashtra district coords ─────────────────────────────────────────────
const DISTRICT_COORDS = {
  Ratnagiri:  { lat: 16.9944, lon: 73.3000 },
  Raigad:     { lat: 18.5158, lon: 73.1800 },
  Sindhudurg: { lat: 16.3500, lon: 73.6100 },
  Thane:      { lat: 19.2183, lon: 72.9781 },
  Nashik:     { lat: 19.9975, lon: 73.7898 },
  Pune:       { lat: 18.5204, lon: 73.8567 },
  Kolhapur:   { lat: 16.7050, lon: 74.2433 },
  Satara:     { lat: 17.6805, lon: 74.0183 },
  Mumbai:     { lat: 19.0760, lon: 72.8777 },
  Ahmednagar: { lat: 19.0948, lon: 74.7480 },
  Amravati:   { lat: 20.9320, lon: 77.7523 },
  Aurangabad: { lat: 19.8762, lon: 75.3433 },
  Nagpur:     { lat: 21.1458, lon: 79.0882 },
  Solapur:    { lat: 17.6868, lon: 75.9093 },
  Jalgaon:    { lat: 21.0077, lon: 75.5626 },
};

// ── Day / month helpers ──────────────────────────────────────────────────────
const DAYS_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAYS_MR = ['रविवार','सोमवार','मंगळवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'];
const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtDate(ts) {
  const d = new Date(ts * 1000);
  return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2,'0')}`;
}

// ── Icon mapper ──────────────────────────────────────────────────────────────
function owIcon(code) {
  const pfx = (code || '01').slice(0, 2);
  return { '01':'sun','02':'cloud-sun','03':'cloud','04':'cloud',
           '09':'rain','10':'cloud-rain','11':'thunder','50':'mist' }[pfx] || 'cloud';
}

// ── Agri advisory ────────────────────────────────────────────────────────────
function agriTip(cond, rain, hum) {
  const c = (cond || '').toLowerCase();
  if (rain > 50)              return 'Heavy rain — ensure field drainage. Delay all sprays.';
  if (rain > 20)              return 'Moderate rain — avoid fertilizer. Inspect bunds.';
  if (c.includes('thunder'))  return 'Thunderstorm alert — secure equipment, stay indoors.';
  if (c.includes('rain') || c.includes('drizzle')) return 'Light rain — use sticker/spreader before any spray.';
  if (c.includes('mist') || c.includes('fog')) return 'Foggy morning — inspect for early blight / downy mildew.';
  if (c.includes('cloud'))    return hum > 80
    ? 'Cloudy + high humidity — blast & borer risk. Consider preventive spray.'
    : 'Overcast — good for pest scouting and field monitoring.';
  if (c.includes('clear') || c.includes('sun')) return hum > 80
    ? 'Sunny but humid — high fungal risk. Spray preventively by 9 am.'
    : 'Clear day — ideal for pesticide/foliar fertilizer application.';
  return 'Normal conditions — continue routine agronomic monitoring.';
}

// ── Parse 5-day/3-hr OW forecast ────────────────────────────────────────────
function parseForecast(list) {
  const byDay = {};
  list.forEach(item => {
    const d = new Date(item.dt * 1000);
    d.setHours(0,0,0,0);
    const k = d.toDateString();
    if (!byDay[k]) byDay[k] = { date: d, items: [] };
    byDay[k].items.push(item);
  });

  return Object.values(byDay).slice(0,5).map(({ date, items }) => {
    const temps  = items.map(i => i.main.temp);
    const humids = items.map(i => i.main.humidity);
    const rains  = items.map(i => (i.rain?.['3h'] || 0));
    const mid    = items[Math.floor(items.length / 2)] || items[0];
    const cond   = mid.weather[0]?.description || 'Clear';
    const rain   = Math.round(rains.reduce((a,b) => a+b, 0) * 10) / 10;
    const hum    = Math.round(humids.reduce((a,b) => a+b, 0) / humids.length);
    return {
      day:         DAYS_EN[date.getDay()],
      marathiDay:  DAYS_MR[date.getDay()],
      date:        fmtDate(Math.floor(date.getTime() / 1000)),
      tempMax:     Math.round(Math.max(...temps)),
      tempMin:     Math.round(Math.min(...temps)),
      humidity:    hum,
      rainfallMm:  rain,
      condition:   cond.charAt(0).toUpperCase() + cond.slice(1),
      icon:        owIcon(mid.weather[0]?.icon),
      agriAdvisory: agriTip(cond, rain, hum),
    };
  });
}

// ── Fetch with timeout helper ────────────────────────────────────────────────
async function fetchTimeout(url, ms = 8000) {
  const ctrl = new AbortController();
  const id   = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(id);
    return r;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

// ── Per-location cache ───────────────────────────────────────────────────────
const _cache = {};           // key → { data, ts }

function getCached(key) {
  const c = _cache[key];
  return c && Date.now() - c.ts < CACHE_MS ? c.data : null;
}
function setCache(key, data) {
  _cache[key] = { data, ts: Date.now() };
}

// ── Core fetch by lat/lon ────────────────────────────────────────────────────
async function fetchByLatLon(lat, lon, locationName) {
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const hit = getCached(cacheKey);
  if (hit) return hit;

  if (!OW_KEY || OW_KEY === 'your_openweather_api_key_here') {
    const data = buildFallback(locationName, lat, lon);
    setCache(cacheKey, data);
    return data;
  }

  try {
    // Current weather
    const curRes  = await fetchTimeout(`${BASE}/weather?lat=${lat}&lon=${lon}&appid=${OW_KEY}&units=metric`);
    // 5-day forecast
    const foreRes = await fetchTimeout(`${BASE}/forecast?lat=${lat}&lon=${lon}&appid=${OW_KEY}&units=metric&cnt=40`);

    if (!curRes.ok || !foreRes.ok) {
      const errText = await curRes.text().catch(() => curRes.status);
      console.warn('OW API error:', errText);
      throw new Error(`API ${curRes.status}`);
    }

    const cur  = await curRes.json();
    const fore = await foreRes.json();
    const forecast = parseForecast(fore.list);

    const data = {
      locationName: locationName || cur.name,
      apiCityName:  cur.name,
      lat, lon,
      temp:         Math.round(cur.main.temp),
      feelsLike:    Math.round(cur.main.feels_like),
      humidity:     cur.main.humidity,
      rainfall:     forecast[0]?.rainfallMm || 0,
      condition:    cur.weather[0]?.description?.charAt(0).toUpperCase()
                    + cur.weather[0]?.description?.slice(1) || 'Clear',
      icon:         owIcon(cur.weather[0]?.icon),
      windSpeed:    Math.round((cur.wind?.speed || 0) * 3.6),
      forecast,
      isLive:       true,
      source:       'OpenWeatherMap Live',
    };

    setCache(cacheKey, data);
    return data;
  } catch (err) {
    console.warn('OW fetch failed:', err.message);
    const data = buildFallback(locationName, lat, lon);
    setCache(cacheKey, data);
    return data;
  }
}

// ── Fallback with REAL dates but distinct per-district temps ─────────────────
const DISTRICT_CLIMATE = {
  Ratnagiri:  [31, 24, 80, 12],
  Raigad:     [32, 25, 78, 15],
  Sindhudurg: [30, 24, 82, 10],
  Thane:      [33, 26, 74, 18],
  Nashik:     [29, 19, 62, 14],   // Nashik is cooler / drier
  Pune:       [30, 21, 65, 13],
  Kolhapur:   [31, 22, 70, 16],
  Satara:     [28, 20, 68, 12],
  Mumbai:     [33, 27, 78, 20],
  Ahmednagar: [32, 20, 58, 14],
  Amravati:   [34, 22, 55, 16],
  Aurangabad: [33, 21, 52, 15],
  Nagpur:     [35, 23, 50, 18],
  Solapur:    [34, 22, 55, 16],
  Jalgaon:    [36, 24, 48, 17],
};

const FALLBACK_PATTERNS = [
  { cond:'Partly Cloudy',  icon:'cloud-sun', rainMult:0.4 },
  { cond:'Clear Sky',      icon:'sun',       rainMult:0   },
  { cond:'Scattered Showers',icon:'cloud-rain',rainMult:2  },
  { cond:'Cloudy',         icon:'cloud',     rainMult:0.8 },
  { cond:'Light Rain',     icon:'rain',      rainMult:1.5 },
];

function buildFallback(locationName, lat, lon) {
  const climKey = Object.keys(DISTRICT_CLIMATE).find(k =>
    locationName?.toLowerCase().includes(k.toLowerCase())
  ) || 'Ratnagiri';
  const [maxT, minT, hum, wind] = DISTRICT_CLIMATE[climKey] || DISTRICT_CLIMATE.Ratnagiri;

  const today = new Date();
  const forecast = Array.from({ length: 5 }, (_, i) => {
    const d   = new Date(today); d.setDate(today.getDate() + i);
    const pat = FALLBACK_PATTERNS[i % FALLBACK_PATTERNS.length];
    const rain = Math.round(pat.rainMult * (maxT - minT) * 0.6 * 10) / 10;
    return {
      day:          DAYS_EN[d.getDay()],
      marathiDay:   DAYS_MR[d.getDay()],
      date:         fmtDate(Math.floor(d.getTime() / 1000)),
      tempMax:      maxT + (i === 0 ? 0 : i === 1 ? 1 : i === 2 ? -2 : i === 3 ? -1 : 0),
      tempMin:      minT,
      humidity:     hum + (i % 2 === 0 ? 0 : 3),
      rainfallMm:   rain,
      condition:    pat.cond,
      icon:         pat.icon,
      agriAdvisory: agriTip(pat.cond, rain, hum),
    };
  });

  return {
    locationName: locationName || climKey,
    apiCityName:  locationName || climKey,
    lat, lon,
    temp:     forecast[0].tempMax,
    feelsLike:forecast[0].tempMax - 2,
    humidity: hum,
    rainfall: forecast[0].rainfallMm,
    condition:forecast[0].condition,
    icon:     forecast[0].icon,
    windSpeed:wind,
    forecast,
    isLive:  false,
    source:  'Estimated — add valid OpenWeather API key for live data',
  };
}

// ── Public API ───────────────────────────────────────────────────────────────
export const weatherService = {

  /** Fetch by district name */
  async fetchByDistrict(district = 'Ratnagiri') {
    const key = Object.keys(DISTRICT_COORDS).find(k =>
      district.toLowerCase().includes(k.toLowerCase())
    ) || 'Ratnagiri';
    const { lat, lon } = DISTRICT_COORDS[key];
    return fetchByLatLon(lat, lon, key);
  },

  /** Fetch by GPS coordinates */
  async fetchByCoords(lat, lon) {
    return fetchByLatLon(lat, lon, null);
  },

  /** Search any city name (uses OW Geocoding API) */
  async searchCity(cityName) {
    if (!OW_KEY || OW_KEY === 'your_openweather_api_key_here') {
      return this.fetchByDistrict(cityName);
    }
    try {
      const res  = await fetchTimeout(`${GEO}/direct?q=${encodeURIComponent(cityName)},IN&limit=5&appid=${OW_KEY}`);
      if (!res.ok) throw new Error('Geocoding failed');
      const results = await res.json();
      if (!results.length) throw new Error('City not found');
      const { lat, lon, name, state } = results[0];
      const label = state ? `${name}, ${state}` : name;
      return fetchByLatLon(lat, lon, label);
    } catch (err) {
      console.warn('City search failed:', err.message);
      return this.fetchByDistrict(cityName);
    }
  },

  /** Get user's GPS location + fetch weather */
  async fetchCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const data = await fetchByLatLon(coords.latitude, coords.longitude, 'Your Location');
            resolve(data);
          } catch (e) { reject(e); }
        },
        (err) => reject(new Error(err.message)),
        { timeout: 10000, maximumAge: 300000 }
      );
    });
  },

  /** Legacy sync method */
  getWeatherForDistrict(district) {
    const key = Object.keys(DISTRICT_COORDS).find(k =>
      (district || '').toLowerCase().includes(k.toLowerCase())
    ) || 'Ratnagiri';
    const cacheKey = Object.values(DISTRICT_COORDS[key] || DISTRICT_COORDS.Ratnagiri)
      .map(v => v.toFixed(2)).join(',');
    return getCached(cacheKey) || buildFallback(key, DISTRICT_COORDS[key].lat, DISTRICT_COORDS[key].lon);
  },

  DISTRICT_LIST: Object.keys(DISTRICT_COORDS),
};

export const KONKAN_DISTRICT_WEATHER = {}; // legacy compat