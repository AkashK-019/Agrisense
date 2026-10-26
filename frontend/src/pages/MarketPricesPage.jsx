import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search, X, TrendingUp, TrendingDown, MapPin, ChevronRight, ChevronDown,
  AlertTriangle, Minus, Plus, CheckCircle2, Star
} from 'lucide-react';
import { marketPriceService } from '../services/marketPriceService';
import '../styles/MarketPricesPage.css';

// Markets to query (crop + market names the backend understands). No prices are stored here.
const ALL_SERIES = [
  { id: 'paddy_armori',    cropId: 'paddy',  market: 'APMC Armori',       district: 'Gadchiroli' },
  { id: 'paddy_desaiganj', cropId: 'paddy',  market: 'Armori(Desaiganj)', district: 'Gadchiroli' },
  { id: 'paddy_gondp',     cropId: 'paddy',  market: 'APMC Gondpimpri',   district: 'Chandrapur' },
  { id: 'onion_manjri',    cropId: 'onion',  market: 'Pune(Manjri)',      district: 'Pune' },
  { id: 'onion_pimpri',    cropId: 'onion',  market: 'Pune(Pimpri)',      district: 'Pune' },
  { id: 'onion_moshi',     cropId: 'onion',  market: 'Pune(Moshi)',       district: 'Pune' },
  { id: 'potato_moshi',    cropId: 'potato', market: 'Pune(Moshi)',       district: 'Pune' },
  { id: 'potato_manjri',   cropId: 'potato', market: 'Pune(Manjri)',      district: 'Pune' },
  { id: 'potato_sb',       cropId: 'potato', market: 'Chattrapati Sambhajinagar', district: 'Sambhajinagar' },
  { id: 'tomato_panvel',   cropId: 'tomato', market: 'APMC Panvel',       district: 'Raigad' },
  { id: 'tomato_pimpri',   cropId: 'tomato', market: 'Pune(Pimpri)',      district: 'Pune' },
  { id: 'tomato_manjri',   cropId: 'tomato', market: 'Pune(Manjri)',      district: 'Pune' },
  { id: 'maize_karmala',   cropId: 'maize',  market: 'APMC Karmala',      district: 'Solapur' },
  { id: 'maize_jalana',    cropId: 'maize',  market: 'APMC Jalana',       district: 'Jalna' },
  { id: 'maize_bhusawal',  cropId: 'maize',  market: 'Yashika Agro Marketing, Tal Bhusawal, Jalgaon', district: 'Jalgaon' },
];

const CROPS = {
  paddy:  { en: 'Paddy',  mr: 'भात' },
  onion:  { en: 'Onion',  mr: 'कांदा' },
  potato: { en: 'Potato', mr: 'बटाटा' },
  tomato: { en: 'Tomato', mr: 'टोमॅटो' },
  maize:  { en: 'Maize',  mr: 'मका' },
};

const DISTRICTS = [...new Set(ALL_SERIES.map(s => s.district))].sort();
const money = (v) => Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

/* Small line chart. `fluid` stretches to the card width. */
function Trend({ points, uid, fluid = false, w = 120, h = 40 }) {
  if (!points || points.length < 2) return <span className="mp-nochart">—</span>;
  const vals = points.map(p => p.price);
  const mn = Math.min(...vals), mx = Math.max(...vals), rng = mx - mn || 1, pad = 4;
  const xy = vals.map((v, i) => [pad + (i / (vals.length - 1)) * (w - pad * 2), pad + (1 - (v - mn) / rng) * (h - pad * 2)]);
  const line = xy.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const up = vals[vals.length - 1] >= vals[0];
  const color = up ? '#16a34a' : '#dc2626';
  const [lx, ly] = xy[xy.length - 1];
  const gid = `mpg-${uid}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={fluid ? '100%' : w} height={fluid ? undefined : h}
      preserveAspectRatio={fluid ? 'none' : 'xMidYMid meet'} className={fluid ? 'mp-trend-fluid' : 'mp-trend'} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${line} ${w - pad},${h - pad} ${pad},${h - pad}`} fill={`url(#${gid})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {!fluid && <circle cx={lx} cy={ly} r="3" fill={color} />}
    </svg>
  );
}

function Change({ value, suffix }) {
  const v = Number(value || 0);
  const up = v >= 0;
  return (
    <span className={`mp-chg ${up ? 'up' : 'down'}`}>
      {up ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
      {up ? '+' : ''}{v}%{suffix ? ` ${suffix}` : ''}
    </span>
  );
}

/* Detail sheet: forecast, advice, calculator */
function DetailSheet({ series, data, loading, onClose, t, isMr }) {
  const [qty, setQty] = useState('');
  const crop = CROPS[series.cropId];

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [onClose]);

  let body;
  if (loading && !data) {
    body = <div className="mp-sheet-msg"><span className="mp-spin" />{t('Loading forecast…', 'अंदाज लोड होत आहे…')}</div>;
  } else if (!data) {
    body = <div className="mp-sheet-msg"><AlertTriangle size={22} />{t('Forecast is not available for this market right now.', 'या बाजारासाठी अंदाज सध्या उपलब्ध नाही.')}</div>;
  } else {
    const d = data.decision || {};
    const today = data.observed_price;
    const f7 = data.forecast_7d;
    const f15 = data.forecast_15d || data.forecast_7d || today;
    const c7 = data.forecast_7d_change_pct || 0;
    const c15 = data.forecast_15d_change_pct || (today ? Math.round(((f15 - today) / today) * 1000) / 10 : 0);
    const storageKnown = d.storage_cost_deducted != null;
    const storage15 = storageKnown ? Math.round(d.storage_cost_deducted * 0.5) : null;
    const gross15 = Math.round(f15 - today);
    const net15 = storageKnown ? gross15 - storage15 : null;
    const verdict = !storageKnown ? 'info' : net15 > 0 ? 'hold' : 'sell';
    const n = Number(qty) || 0;
    const vals = (data.history_points || []).map(p => p.price);
    const low = vals.length ? Math.min(...vals) : null;
    const high = vals.length ? Math.max(...vals) : null;

    body = (
      <>
        <div className={`mp-advice ${verdict}`}>
          <strong>
            {verdict === 'hold' ? t('Hold your stock', 'माल साठवून ठेवा')
              : verdict === 'sell' ? t('Sell now', 'आता विका')
              : gross15 > 0 ? t('Price may rise', 'भाव वाढू शकतो') : t('Price may not rise', 'भाव वाढण्याची शक्यता कमी')}
          </strong>
          <p>
            {verdict === 'hold'
              ? t(`Price may rise by ₹${gross15} per quintal (${c15 >= 0 ? '+' : ''}${c15}%) in 15 days. After ₹${storage15} storage cost, you gain about ₹${net15} per quintal.`,
                  `१५ दिवसांत भाव ₹${gross15}/क्विंटल (${c15 >= 0 ? '+' : ''}${c15}%) वाढण्याची शक्यता आहे. साठवणूक खर्च ₹${storage15}/क्विंटल वजा जाता सुमारे ₹${net15}/क्विंटल फायदा होईल.`)
              : verdict === 'sell'
              ? t(`Price may change by ${c15}% in 15 days. After ₹${storage15} storage cost there is no gain from waiting, so sell at today's rate.`,
                  `१५ दिवसांत भाव ${c15}% बदलू शकतो. साठवणूक खर्च ₹${storage15}/क्विंटल वजा जाता थांबण्याचा फायदा नाही, म्हणून आजच्या दरात विका.`)
              : t(`15-day forecast: ${c15 >= 0 ? '+' : ''}${c15}% (₹${gross15} per quintal). Storage cost is not available for this market, so we cannot say if waiting is worth it.`,
                  `१५ दिवसांचा अंदाज: ${c15 >= 0 ? '+' : ''}${c15}% (₹${gross15}/क्विंटल). या बाजारासाठी साठवणूक खर्च उपलब्ध नाही, म्हणून थांबणे फायद्याचे आहे का ते सांगता येत नाही.`)}
          </p>
        </div>

        <ul className="mp-rows">
          <li>
            <div><span>{t('Today', 'आज')}</span><small>₹{money(data.observed_min_price)} – ₹{money(data.observed_max_price)}</small></div>
            <strong>₹{money(today)}</strong>
          </li>
          <li>
            <div><span>{t('In 7 days', '७ दिवसांनी')}</span><Change value={c7} /></div>
            <strong>₹{money(f7)}</strong>
          </li>
          <li>
            <div><span>{t('In 15 days', '१५ दिवसांनी')}</span><Change value={c15} /></div>
            <strong>₹{money(f15)}</strong>
          </li>
        </ul>

        {vals.length > 1 && (
          <section className="mp-chart">
            <h4>{t('Last 30 days', 'मागील ३० दिवस')}</h4>
            <Trend points={data.history_points} uid={`d-${series.id}`} fluid w={300} h={110} />
            <div className="mp-chart-foot"><span>{t('Low', 'कमी')} ₹{money(low)}</span><span>{t('High', 'जास्त')} ₹{money(high)}</span></div>
          </section>
        )}

        <section className="mp-calc">
          <h4>{t('How much will you earn?', 'तुम्हाला किती नफा होईल?')}</h4>
          <label htmlFor="mp-qty">{t('Your crop quantity (quintal)', 'तुमचा माल (क्विंटल)')}</label>
          <div className="mp-stepper">
            <button type="button" onClick={() => setQty(String(Math.max(0, n - 5)))} aria-label="-5"><Minus size={22} /></button>
            <input id="mp-qty" type="number" inputMode="numeric" min="0" max="500" placeholder="0" value={qty}
              onChange={e => setQty(e.target.value === '' ? '' : String(Math.min(500, Math.max(0, Math.floor(Number(e.target.value) || 0)))))} />
            <button type="button" onClick={() => setQty(String(Math.min(500, n + 5)))} aria-label="+5"><Plus size={22} /></button>
          </div>
          <dl className="mp-calc-rows">
            <div><dt>{t('Price change in 15 days', '१५ दिवसांतील भाव बदल')}</dt><dd className={gross15 >= 0 ? 'pos' : 'neg'}>₹{money(gross15 * n)}</dd></div>
            {storageKnown && (
              <>
                <div><dt>{t('Storage cost for 15 days', '१५ दिवसांचा साठवणूक खर्च')}</dt><dd className="neg">– ₹{money(storage15 * n)}</dd></div>
                <div className="total"><dt>{t('Net extra profit', 'निव्वळ अतिरिक्त नफा')}</dt><dd className={net15 >= 0 ? 'pos' : 'neg'}>₹{money(net15 * n)}</dd></div>
              </>
            )}
          </dl>
          {!storageKnown && <p className="mp-note">{t('Storage cost is not available for this market, so net profit cannot be calculated.', 'या बाजारासाठी साठवणूक खर्च उपलब्ध नाही, म्हणून निव्वळ नफा काढता येत नाही.')}</p>}
        </section>

        <p className="mp-src"><CheckCircle2 size={16} />{t('Forecasts are estimates, not a guarantee. Check the final rate at your market before selling.', 'अंदाज हे केवळ अंदाज आहेत, खात्री नाही. विक्रीपूर्वी बाजारात अंतिम दर तपासा.')}</p>
      </>
    );
  }

  return (
    <div className="mp-overlay" onClick={onClose}>
      <div className="mp-sheet" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <div className="mp-sheet-head">
          <div>
            <h3>{isMr ? crop.mr : crop.en}</h3>
            <p><MapPin size={15} />{data?.market || series.market} · {data?.district || series.district}</p>
          </div>
          <button type="button" className="mp-close" onClick={onClose} aria-label={t('Close', 'बंद करा')}><X size={22} /></button>
        </div>
        {body}
      </div>
    </div>
  );
}

export function MarketPricesPage() {
  const { language } = useApp();
  const isMr = language === 'mr';
  const t = (en, mr) => (isMr ? mr : en);

  const [filterCrop, setFilterCrop] = useState('all');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [dataMap, setDataMap] = useState({});
  const [loadingIds, setLoadingIds] = useState(new Set());
  const [initialDone, setInitialDone] = useState(false);

  const filtered = useMemo(() => ALL_SERIES.filter(s => {
    if (filterCrop !== 'all' && s.cropId !== filterCrop) return false;
    if (filterDistrict !== 'all' && s.district !== filterDistrict) return false;
    if (filterSearch) {
      const q = filterSearch.toLowerCase();
      const c = CROPS[s.cropId];
      if (![s.market, s.district, c.en, c.mr].some(x => x.toLowerCase().includes(q))) return false;
    }
    return true;
  }), [filterCrop, filterDistrict, filterSearch]);

  // Highest price first; markets without a price go last
  const sorted = useMemo(
    () => [...filtered].sort((a, b) => (dataMap[b.id]?.observed_price || 0) - (dataMap[a.id]?.observed_price || 0)),
    [filtered, dataMap]
  );
  const best = sorted.find(s => dataMap[s.id]?.observed_price);

  // Load all series once
  useEffect(() => {
    let cancelled = false;
    const toLoad = ALL_SERIES.filter(s => !dataMap[s.id]);
    if (!toLoad.length) { setInitialDone(true); return; }
    setLoadingIds(new Set(toLoad.map(s => s.id)));
    Promise.allSettled(
      toLoad.map(s => marketPriceService.getMarketForecast(s.cropId, s.market)
        .then(res => ({ id: s.id, data: res }))
        .catch(() => ({ id: s.id, data: null })))
    ).then(results => {
      if (cancelled) return;
      const patch = {};
      results.forEach(r => { if (r.status === 'fulfilled') patch[r.value.id] = r.value.data; });
      setDataMap(prev => ({ ...prev, ...patch }));
      setLoadingIds(new Set());
      setInitialDone(true);
    });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line

  const selectSeries = useCallback((id) => {
    setSelectedId(id);
    if (!dataMap[id]) {
      const s = ALL_SERIES.find(x => x.id === id);
      if (!s) return;
      setLoadingIds(prev => new Set([...prev, id]));
      marketPriceService.getMarketForecast(s.cropId, s.market)
        .then(res => {
          setDataMap(prev => ({ ...prev, [id]: res }));
          setLoadingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
        })
        .catch(() => setLoadingIds(prev => { const n = new Set(prev); n.delete(id); return n; }));
    }
  }, [dataMap]);

  const closeSheet = useCallback(() => setSelectedId(null), []);
  const hasFilter = filterCrop !== 'all' || filterDistrict !== 'all' || filterSearch;
  const clearFilters = () => { setFilterCrop('all'); setFilterDistrict('all'); setFilterSearch(''); };
  const noData = initialDone && !ALL_SERIES.some(s => dataMap[s.id]);
  const selected = ALL_SERIES.find(s => s.id === selectedId);

  return (
    <div className="mp">
      <header className="mp-head">
        <h1>{t('Market Prices', 'बाजार भाव')}</h1>
        <p>{t("Today's price, 15-day forecast and sell-or-wait advice.", 'आजचा भाव, १५ दिवसांचा अंदाज आणि विक्रीचा सल्ला.')}</p>
      </header>

      {/* Crop tabs */}
      <div className="mp-tabs" role="tablist" aria-label={t('Crop', 'शेतमाल')}>
        {['all', ...Object.keys(CROPS)].map(k => (
          <button key={k} type="button" role="tab" aria-selected={filterCrop === k}
            className={`mp-tab ${filterCrop === k ? 'active' : ''}`} onClick={() => setFilterCrop(k)}>
            {k === 'all' ? t('All', 'सर्व') : (isMr ? CROPS[k].mr : CROPS[k].en)}
          </button>
        ))}
      </div>

      {/* Search + district */}
      <div className="mp-filters">
        <div className="mp-search">
          <Search size={20} />
          <input type="search" value={filterSearch} onChange={e => setFilterSearch(e.target.value)}
            placeholder={t('Search market or crop', 'बाजार किंवा शेतमाल शोधा')} aria-label={t('Search', 'शोधा')} />
          {filterSearch && <button type="button" onClick={() => setFilterSearch('')} aria-label={t('Clear', 'साफ करा')}><X size={18} /></button>}
        </div>
        <div className="mp-select">
          <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} aria-label={t('District', 'जिल्हा')}>
            <option value="all">{t('All districts', 'सर्व जिल्हे')}</option>
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown size={20} />
        </div>
      </div>

      {noData && (
        <div className="mp-error" role="alert">
          <AlertTriangle size={24} />
          <div>
            <strong>{t('API error', 'API त्रुटी')}</strong>
            <p>{t('Market prices could not be loaded right now. Please try again later.', 'बाजार भाव सध्या लोड होऊ शकले नाहीत. कृपया नंतर पुन्हा प्रयत्न करा.')}</p>
          </div>
        </div>
      )}

      {/* Best price today */}
      {best && (
        <button type="button" className="mp-best" onClick={() => selectSeries(best.id)}>
          <span className="mp-best-label"><Star size={16} />{t('Best price today', 'आजचा सर्वोत्तम भाव')}</span>
          <strong className="mp-best-price">₹{money(dataMap[best.id].observed_price)}<small>{t('per quintal', 'प्रति क्विंटल')}</small></strong>
          <span className="mp-best-where">{isMr ? CROPS[best.cropId].mr : CROPS[best.cropId].en} · {best.market}, {best.district}</span>
        </button>
      )}

      <div className="mp-count">
        {filtered.length} {t('markets', 'बाजार')}
        {hasFilter && <button type="button" className="mp-link" onClick={clearFilters}>{t('Clear filters', 'फिल्टर काढा')}</button>}
      </div>

      {filtered.length === 0 ? (
        <div className="mp-empty"><AlertTriangle size={28} /><p>{t('No markets found. Try changing the filters.', 'बाजार सापडले नाहीत. फिल्टर बदला.')}</p></div>
      ) : (
        <ul className="mp-list">
          {sorted.map(series => {
            const d = dataMap[series.id];
            const isLoading = loadingIds.has(series.id) && !d;
            const crop = CROPS[series.cropId];
            return (
              <li key={series.id}>
                <button type="button" className="mp-card" onClick={() => selectSeries(series.id)}>
                  <div className="mp-card-top">
                    <div className="mp-card-name">
                      <strong>{series.market}</strong>
                      <span><MapPin size={15} />{series.district}</span>
                    </div>
                    <div className="mp-card-price">
                      {isLoading ? <i className="mp-skel" /> : d ? (
                        <>
                          <strong>₹{money(d.observed_price)}</strong>
                          <span>{isMr ? crop.mr : crop.en} · {t('per quintal', 'क्विंटल')}</span>
                        </>
                      ) : (
                        <>
                          <strong className="mp-na">—</strong>
                          <span>{t('Price not available', 'भाव उपलब्ध नाही')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="mp-card-bottom">
                    {isLoading ? <i className="mp-skel mp-skel-wide" /> : d ? (
                      <>
                        <Trend points={d.history_points} uid={series.id} />
                        <Change value={d.forecast_30d_change_pct} suffix={t('in 30 days', '३० दिवसांत')} />
                      </>
                    ) : <span className="mp-muted">{t('Tap to try again', 'पुन्हा पाहण्यासाठी दाबा')}</span>}
                    <ChevronRight size={20} className="mp-go" />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mp-foot">{t('Prices are in ₹ per quintal. Check the final price at your nearby market before selling.', 'भाव ₹/क्विंटल मध्ये आहेत. विक्रीपूर्वी जवळच्या बाजारात अंतिम भाव तपासा.')}</p>

      {selected && (
        <DetailSheet
          key={selected.id}
          series={selected}
          data={dataMap[selected.id]}
          loading={loadingIds.has(selected.id)}
          onClose={closeSheet}
          t={t}
          isMr={isMr}
        />
      )}
    </div>
  );
}

export default MarketPricesPage;