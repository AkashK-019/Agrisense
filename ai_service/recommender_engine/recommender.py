"""Fertilizer/pesticide recommender — rule filter + transparent weighted ranking.

Pure functions over kb/rules/*.json. No training, no LLM. Every item keeps its
source citation; no rule coverage -> abstain -> expert.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

KB_DIR = Path(__file__).resolve().parent / "rules"


@dataclass(frozen=True)
class Context:
    crop: str = "paddy"
    district: str | None = None
    season: str = "kharif"
    stage: str | None = None
    variety: str | None = None
    disease_label: str | None = None  # from /ml/disease or leaf scan
    soil_n: float | None = None  # kg/ha available N
    soil_p: float | None = None
    soil_k: float | None = None
    soil_ph: float | None = None
    rainfall_anomaly_pct: float | None = None  # IMD vs climatology


@dataclass
class Recommendation:
    kind: str  # "fertilizer" | "pesticide" | "weed" | "variety"
    item: str
    detail: dict
    score: float
    source: dict
    rationale: list[str] = field(default_factory=list)


def load_rules(path: Path | None = None) -> dict:
    """Load fert_pest rules + merge ipm.json ('ipm') and registry.json ('registry')."""
    target = path or (KB_DIR / "fert_pest.json")
    with open(target, encoding="utf-8") as f:
        rules = json.load(f)
    if path is None:
        for name, key in (("ipm.json", "ipm"), ("registry.json", "registry")):
            p = KB_DIR / name
            if p.exists():
                with open(p, encoding="utf-8") as f:
                    data = json.load(f)
                rules[key] = data.get("actions", []) if key == "ipm" else data
    return rules


def matches_zone(rule_zone: str | None, district: str | None) -> bool:
    if not rule_zone or rule_zone.lower() == "konkan":
        return True
    if not district:
        return True  # zone-agnostic when caller gives no district
    return district.lower() in rule_zone.lower() or "konkan" in rule_zone.lower()


def score_fertilizer(rule: dict, ctx: Context) -> Recommendation | None:
    """Score and dynamically adjust fertilizer dose against soil test + active disease fit."""
    if not matches_zone(rule.get("zone"), ctx.district):
        return None

    # Base recommendation from research rule
    base_n = float(rule.get("n_kg_ha") or 100)
    base_p = float(rule.get("p2o5_kg_ha") or rule.get("p_kg_ha") or 40)
    base_k = float(rule.get("k2o_kg_ha") or rule.get("k_kg_ha") or 40)

    score = 0.7
    why: list[str] = []

    adj_n = base_n
    adj_p = base_p
    adj_k = base_k

    # 1. Disease-Specific Nutrient Modulation
    d_label = (ctx.disease_label or "").lower()
    if any(k in d_label for k in ("bacterial", "blight", "kada karpa", "xanthomonas")):
        # High N accelerates bacterial slime; Potash strengthens plant cuticle
        adj_n = max(50.0, round(base_n * 0.70))  # -30% N
        adj_k = round(base_k * 1.35)             # +35% K
        score += 0.2
        why.append(f"Bacterial Leaf Blight: chemical Nitrogen lowered to {int(adj_n)} kg/ha to arrest watery lesions; Potash boosted to {int(adj_k)} kg/ha to reinforce cell walls.")
    elif any(k in d_label for k in ("blast", "pyricularia", "karpa")):
        # Blast thrives on high-succulence shoots
        adj_n = max(50.0, round(base_n * 0.65))  # -35% N
        adj_k = round(base_k * 1.35)             # +35% K
        score += 0.2
        why.append(f"Blast Risk: Nitrogen capped at {int(adj_n)} kg/ha to avoid soft succulent foliage; Potash increased to {int(adj_k)} kg/ha for fungal resistance.")
    elif any(k in d_label for k in ("sheath", "rhizoctonia")):
        # Sheath blight spreads across dense high-N canopy
        adj_n = max(55.0, round(base_n * 0.75))  # -25% N
        adj_k = round(base_k * 1.25)             # +25% K
        score += 0.15
        why.append(f"Sheath Blight: Nitrogen limited to {int(adj_n)} kg/ha; Potash increased to {int(adj_k)} kg/ha to strengthen lower culm.")
    elif any(k in d_label for k in ("brown", "spot", "helminthosporium", "bipolaris")):
        # Brown spot is a poverty disease of K & N depleted soils
        adj_n = 90.0
        adj_k = round(base_k * 1.40)             # +40% K
        score += 0.15
        why.append(f"Brown Spot: Brown spot indicates nutrient starvation. Applied balanced N{int(adj_n)}:P{int(adj_p)}:K{int(adj_k)} with MOP top-dressing.")
    else:
        why.append(f"Optimal baseline for {rule.get('zone', 'Konkan')} paddy agro-climatic zone.")

    # 2. Soil-Test Adjustments
    if ctx.soil_n is not None:
        if ctx.soil_n < 140:
            adj_n = round(adj_n + 15)
            why.append(f"Soil test Nitrogen low ({ctx.soil_n} kg/ha) -> supplemented +15 kg/ha N.")
        elif ctx.soil_n > 240:
            adj_n = max(45.0, round(adj_n - 20))
            why.append(f"Soil test Nitrogen already high ({ctx.soil_n} kg/ha) -> reduced chemical N by 20 kg/ha to prevent lodging.")

    if ctx.soil_p is not None:
        if ctx.soil_p < 20:
            adj_p = round(adj_p + 10)
            why.append(f"Soil test P low ({ctx.soil_p} kg/ha) -> added +10 kg/ha P2O5.")
        elif ctx.soil_p > 50:
            adj_p = max(20.0, round(adj_p - 10))
            why.append(f"Soil test P high ({ctx.soil_p} kg/ha) -> reduced P2O5.")

    if ctx.soil_k is not None:
        if ctx.soil_k < 140:
            adj_k = round(adj_k + 15)
            why.append(f"Soil test Potash low ({ctx.soil_k} kg/ha) -> added +15 kg/ha K2O.")

    if ctx.soil_ph is not None and ctx.soil_ph < 5.5:
        why.append(f"Soil pH is acidic ({ctx.soil_ph}) -> apply 500 kg/ha Agricultural Lime or 10 t/ha FYM.")

    # Clone detail dict and populate adjusted figures
    detail = dict(rule)
    detail["n_kg_ha"] = int(adj_n)
    detail["p_kg_ha"] = int(adj_p)
    detail["k_kg_ha"] = int(adj_k)
    detail["p2o5_kg_ha"] = int(adj_p)
    detail["k2o_kg_ha"] = int(adj_k)

    # Dynamic Split Schedule
    if "bacterial" in d_label or "blast" in d_label:
        detail["splits"] = f"Apply 50% N ({int(adj_n*0.5)} kg/ha) + 100% P & K as basal. Postpone mid-stage urea top-dressing until disease lesions subside."
        detail["splits_mr"] = f"५०% नत्र ({int(adj_n*0.5)} किलो) + १००% स्फुरद व पालाश लावणीवेळी द्यावे. रोगाचे डाग सुकेपर्यंत युरियाचा दुसरा हप्ता पुढे ढकला."
    else:
        detail["splits"] = f"Apply 40% N ({int(adj_n*0.4)} kg/ha) + 100% P & K at transplanting, 30% N ({int(adj_n*0.3)} kg/ha) at tillering, and 30% N ({int(adj_n*0.3)} kg/ha) at panicle initiation."
        detail["splits_mr"] = f"४०% नत्र ({int(adj_n*0.4)} किलो) + १००% स्फुरद व पालाश लावणीवेळी, ३०% नत्र फुटवे फुटताना, आणि ३०% नत्र पोटरीमध्ये द्यावे."

    detail["organic"] = "10 t/ha FYM or Compost + Dhaincha green manuring before transplanting"
    detail["organic_mr"] = "१० टन शेणखत किंवा कंपोस्ट + लावणीपूर्वी ढेंचा हिरवळीचे खत"

    item_label = f"N{int(adj_n)}:P{int(adj_p)}:K{int(adj_k)} kg/ha"

    return Recommendation("fertilizer", item=item_label, detail=detail,
                          score=round(min(score, 1.0), 3), source=_src(rule), rationale=why)


def score_pesticide(rule: dict, ctx: Context) -> Recommendation | None:
    """Match disease/pest target from /ml/disease against KB target strings.

    Strict matching: only DISTINCTIVE tokens count (stopwords like rice/leaf/paddy
    must never bridge Bacterial_Leaf_Blight -> 'leaf folder' insecticide).
    """
    target = (rule.get("target") or "").lower().replace("_", " ")
    if not ctx.disease_label:
        return None
    label_tokens = ctx.disease_label.lower().replace("_", " ").split()
    distinctive = [t for t in label_tokens if t not in STOPWORDS and len(t) > 2]
    if not distinctive:
        return None
    # ALL distinctive tokens must appear (Bacterial blight must not match
    # a sheath-blight-only rule via the shared word 'blight')
    if not all(t in target for t in distinctive):
        return None
    score, why = 0.7, [f"disease '{ctx.disease_label}' matches KB target"]
    if ctx.rainfall_anomaly_pct is not None and ctx.rainfall_anomaly_pct > 20:
        score += 0.1
        why.append("rainfall anomaly >20% -> disease pressure up, prioritize spray")
    return Recommendation("pesticide", item=rule["chemical"], detail=rule,
                          score=round(min(score, 1.0), 3), source=_src(rule), rationale=why)


# Generic words that must never drive a pesticide match
STOPWORDS = {"rice", "paddy", "leaf", "healthy", "the", "and", "of", "on", "in"}

RICE_FAMILY = {"rice", "paddy", "dhan", "dhaan"}


def score_ipm(rule: dict, ctx: Context) -> Recommendation | None:
    """Non-chemical IPM actions (ipm.json): crop-level or disease-matched.

    IPM runs FIRST in the payload — chemicals are only ever a fallback.
    """
    if ctx.crop.lower() not in RICE_FAMILY:
        return None
    target = (rule.get("target") or "").lower().replace("_", " ")
    if "rice (general)" in target:
        why = ["applies to all rice fields"]
    elif "weeds in rice" in target:
        why = ["crop-scoped weed management"]
    else:
        if not ctx.disease_label:
            return None
        distinctive = [t for t in ctx.disease_label.lower().replace("_", " ").split()
                       if t not in STOPWORDS and len(t) > 2]
        if not distinctive or not all(t in target for t in distinctive):
            return None
        why = [f"disease '{ctx.disease_label}' matches IPM target"]
    # disease-matched actions rank above generic crop-level actions
    score = 0.85 if why[0].startswith("disease") else 0.75
    return Recommendation("ipm", item=str(rule.get("action", ""))[:90], detail=rule,
                          score=score, source=_src(rule), rationale=why)


def score_weed(rule: dict, ctx: Context) -> Recommendation | None:
    """Weed rules are crop-scoped (no disease token needed)."""
    rule_crop = (rule.get("crop") or "").lower()
    if ctx.crop.lower() not in RICE_FAMILY:
        return None
    if not any(t in rule_crop for t in RICE_FAMILY):
        return None
    if ctx.stage in ("transplanting", "pre_sowing", "pre-emergence") and \
            rule.get("timing") and "pre" not in rule["timing"] and "DAS" not in rule["timing"]:
        return None  # stage filter kept conservative: only drop obvious mismatches
    score, why = 0.6, ["crop match: rice family"]
    return Recommendation("weed", item=_npk_label(rule), detail=rule,
                          score=round(min(score, 1.0), 3), source=_src(rule), rationale=why)


def _npk_label(rule: dict) -> str:
    if "n_kg_ha" in rule:
        p, k = rule.get("p2o5_kg_ha"), rule.get("k2o_kg_ha")
        if p is None and k is None:
            return f"N{rule['n_kg_ha']} kg/ha"
        return f"N{rule['n_kg_ha']}:P{p}:K{k}/ha"
    if rule.get("herbicide"):
        return f"weed: {rule['herbicide']}"
    if rule.get("chemical"):
        return rule["chemical"]
    if rule.get("notes"):
        return str(rule["notes"])[:60]
    return "rule"


def _src(rule: dict) -> dict:
    return {"pdf": rule.get("source_pdf"), "line": rule.get("line")}


def _rule_key(r: Recommendation) -> str | None:
    return r.detail.get("chemical") or r.detail.get("herbicide")


def gate_banned(recs: list[Recommendation], registry: dict,
                flags: list[dict]) -> list[Recommendation]:
    """HARD GATE: a CIB&RC-banned chemical must never reach the farmer.

    Matched-but-banned rules are removed from the result and surfaced as a
    safety flag (with citation) so the UI can explain WHY it was withheld.
    """
    kept = []
    for r in recs:
        entry = registry.get(_rule_key(r) or "")
        if entry and entry.get("status") == "banned":
            b = entry.get("banned") or {}
            flags.append({
                "item": _rule_key(r),
                "status": "banned",
                "reason": b.get("restriction_text") or entry.get("note") or "banned",
                "source": {"pdf": b.get("src"), "line": b.get("line")},
                "rule_source": r.source,
            })
        else:
            kept.append(r)
    return kept


def registry_summary(r: Recommendation, registry: dict, meta: dict | None) -> dict | None:
    """Compact CIB&RC status block attached to each pesticide/weed payload."""
    entry = registry.get(_rule_key(r) or "")
    if not entry:
        return None
    out = {
        "authority": "CIB&RC (DPPQS, Govt. of India)",
        "status": entry.get("status"),
        "formulation_match": entry.get("formulation_match"),
        "as_of": (meta or {}).get("as_of"),
        "rice_evidence": (entry.get("rice_evidence") or [])[:2],
    }
    if entry.get("restricted"):
        out["restriction_mentions_rice"] = entry.get("restriction_mentions_rice")
        out["restricted"] = [{"line": x.get("line"), "text": x.get("text")}
                             for x in entry["restricted"][:2]]
    if entry.get("note"):
        out["note"] = entry["note"]
    return out


def recommend(ctx: Context, rules: dict | None = None, top_k: int = 3,
              min_coverage: float = 0.5) -> dict:
    """Main entry: returns contract-shaped payload for POST /ml/recommend."""
    rules = rules or load_rules()
    registry = (rules.get("registry") or {}).get("entries") or {}
    reg_meta = (rules.get("registry") or {}).get("meta")

    ipm = [r for x in rules.get("ipm", []) if (r := score_ipm(x, ctx))]
    fert = [r for x in rules.get("fertilizer", []) if (r := score_fertilizer(x, ctx))]
    pest = [r for x in rules.get("pesticide", []) if (r := score_pesticide(x, ctx))]
    weed = [r for x in rules.get("weeds", []) if (r := score_weed(x, ctx))]

    safety_flags: list[dict] = []
    pest = gate_banned(pest, registry, safety_flags)
    weed = gate_banned(weed, registry, safety_flags)

    ipm.sort(key=lambda r: r.score, reverse=True)
    fert.sort(key=lambda r: r.score, reverse=True)
    pest.sort(key=lambda r: r.score, reverse=True)
    weed.sort(key=lambda r: r.score, reverse=True)
    covered = sum(1 for b in (fert, pest) if b) / 2  # coverage over requested facets
    abstain = not fert or covered < min_coverage

    def payloads(recs):
        out = []
        for r in recs[:top_k + 2]:
            p = _payload(r)
            if s := registry_summary(r, registry, reg_meta):
                p["registry"] = s
            out.append(p)
        return out

    return {
        # ipm FIRST: non-chemical actions precede any chemical in the contract
        "ipm": payloads(ipm),
        "ipm_note": "Non-chemical actions first; chemical treatment only when "
                    "scouting or economic threshold justifies (IPM).",
        "fertilizer": [_payload(r) for r in fert[:top_k]],
        "pesticide": payloads(pest)[:top_k],
        "weed": payloads(weed)[:top_k],
        "safety_flags": safety_flags,
        "abstain": abstain,
        "coverage": round(covered, 3),
        "needs_expert": bool(abstain or safety_flags
                             or (ctx.disease_label and not pest)),
        "rationale": [w for r in (fert + pest) for w in r.rationale][:6],
        "model_version": "kb-v3",
    }


def _payload(r: Recommendation) -> dict:
    return {"item": r.item, "score": r.score, "detail": r.detail,
            "source": r.source, "rationale": r.rationale}