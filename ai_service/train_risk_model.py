"""
train_risk_model.py — Train Agro-Climatic & Disease Future Risk Model (XGBoost)
Based on ICAR & IMD Agricultural Meteorological Epidemiology Guidelines.
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score, mean_squared_error, accuracy_score, classification_report
import xgboost as xgb
import joblib

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

MODEL_SAVE_PATH = os.path.join(MODELS_DIR, "risk_xgboost.joblib")
META_SAVE_PATH = os.path.join(MODELS_DIR, "risk_model_meta.json")


def generate_agronomic_dataset(n_samples=5000, random_seed=42):
    """
    Synthesizes a realistic agronomic risk dataset based on established
    meteorological and phytopathology criteria across Maharashtra & Indian agro-zones.
    """
    np.random.seed(random_seed)

    crops = ["Rice", "Cotton", "Soybean", "Wheat", "Sugarcane", "Maize", "Groundnut", "Vegetables"]
    stages = ["Seedling", "Tillering", "Panicle Initiation", "Flowering", "Grain Filling", "Maturity / Harvest"]

    data = []
    for _ in range(n_samples):
        crop = np.random.choice(crops)
        stage = np.random.choice(stages)
        temp = np.random.uniform(16.0, 42.0)
        humidity = np.random.uniform(30.0, 98.0)
        rainfall_7d = np.random.exponential(scale=35.0) # skewed towards typical rains with monsoon spikes
        rainfall_7d = min(rainfall_7d, 280.0)
        soil_moisture = np.random.uniform(15.0, 90.0)
        soil_ph = np.random.uniform(4.8, 8.5)
        consecutive_wet_days = int(np.clip(rainfall_7d / 15 + np.random.choice([0, 1, 2]), 0, 7))

        # --- Phytopathological & Climatic Risk Computation ---
        # 1. Disease Outbreak Score (0..100)
        # Fungal diseases (Blast, Sheath Blight, Rust, Downy Mildew) thrive in 80%+ humidity and 22-30C
        disease_factor = 0.0
        if humidity > 80:
            disease_factor += 40.0 * (humidity - 80) / 18.0
        if 22.0 <= temp <= 30.0:
            disease_factor += 25.0
        elif 18.0 <= temp < 22.0 or 30.0 < temp <= 34.0:
            disease_factor += 10.0
        if consecutive_wet_days >= 3:
            disease_factor += 20.0
        if stage in ["Tillering", "Flowering", "Panicle Initiation"]:
            disease_factor += 15.0
        disease_score = float(np.clip(disease_factor + np.random.normal(0, 4), 5, 100))

        # 2. Weather Stress Score (0..100)
        weather_factor = 0.0
        if rainfall_7d > 120.0 or soil_moisture > 75.0: # Waterlogging / Flood risk
            weather_factor += 45.0 + (rainfall_7d - 120.0) * 0.25
        elif rainfall_7d < 5.0 and soil_moisture < 25.0: # Moisture stress / drought
            weather_factor += 40.0 + (30.0 - soil_moisture) * 1.5
        if temp > 38.0: # Heat stress
            weather_factor += 25.0
        weather_score = float(np.clip(weather_factor + np.random.normal(0, 4), 5, 100))

        # 3. Pest Attack Index (0..100)
        pest_factor = 15.0
        if 24.0 <= temp <= 32.0 and humidity > 70.0:
            pest_factor += 40.0 # Stem borer, aphids, sucking pests peak
        if stage in ["Seedling", "Tillering"]:
            pest_factor += 25.0
        pest_score = float(np.clip(pest_factor + np.random.normal(0, 4), 5, 100))

        # 4. Composite Farm Risk Score (Weighted Agro-Met Index)
        overall_score = float(np.clip((disease_score * 0.45) + (weather_score * 0.35) + (pest_score * 0.20), 0, 100))

        # Risk Level Category
        if overall_score >= 72:
            risk_level = "Critical"
        elif overall_score >= 54:
            risk_level = "High"
        elif overall_score >= 32:
            risk_level = "Moderate"
        else:
            risk_level = "Low"

        data.append({
            "crop_type": crop,
            "crop_stage": stage,
            "temperature": round(temp, 1),
            "humidity": round(humidity, 1),
            "rainfall_7d": round(rainfall_7d, 1),
            "soil_moisture": round(soil_moisture, 1),
            "soil_ph": round(soil_ph, 2),
            "consecutive_wet_days": consecutive_wet_days,
            "disease_score": round(disease_score, 1),
            "weather_score": round(weather_score, 1),
            "pest_score": round(pest_score, 1),
            "overall_score": round(overall_score, 1),
            "risk_level": risk_level
        })

    return pd.DataFrame(data)


def train_model():
    print("Generating ICAR-aligned agricultural risk dataset...")
    df = generate_agronomic_dataset(n_samples=6000)

    feature_cols = [
        "crop_type", "crop_stage", "temperature", "humidity",
        "rainfall_7d", "soil_moisture", "soil_ph", "consecutive_wet_days"
    ]
    target_col = "overall_score"

    X = df[feature_cols]
    y = df[target_col]

    categorical_cols = ["crop_type", "crop_stage"]
    numeric_cols = ["temperature", "humidity", "rainfall_7d", "soil_moisture", "soil_ph", "consecutive_wet_days"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_cols),
            ("num", "passthrough", numeric_cols)
        ]
    )

    xgb_model = xgb.XGBRegressor(
        n_estimators=180,
        max_depth=5,
        learning_rate=0.07,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        objective="reg:squarederror"
    )

    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("regressor", xgb_model)
    ])

    print("Training XGBoost Agro-Risk Model Pipeline...")
    pipeline.fit(X_train, y_train)

    # Evaluation
    preds = pipeline.predict(X_test)
    r2 = r2_score(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))

    # Categorical classification accuracy evaluation
    def score_to_level(sc):
        if sc >= 72: return "Critical"
        if sc >= 54: return "High"
        if sc >= 32: return "Moderate"
        return "Low"

    true_levels = [score_to_level(val) for val in y_test]
    pred_levels = [score_to_level(val) for val in preds]
    acc = accuracy_score(true_levels, pred_levels)

    print(f"\nModel Performance:")
    print(f"  R² Score:             {r2 * 100:.2f}%")
    print(f"  RMSE:                 {rmse:.2f} points")
    print(f"  Risk Level Accuracy:  {acc * 100:.2f}%\n")

    # Save pipeline
    joblib.dump(pipeline, MODEL_SAVE_PATH)
    print(f"Saved model pipeline to: {MODEL_SAVE_PATH}")

    meta = {
        "model_name": "XGBoost Agro-Climatic Future Risk Engine",
        "model_version": "v1.0-XGBoost",
        "framework": "XGBoost + Scikit-Learn Pipeline",
        "features": feature_cols,
        "target": "overall_risk_score (0-100)",
        "r2_score": round(r2, 4),
        "rmse": round(rmse, 2),
        "accuracy": round(acc, 4),
        "trained_samples": len(df),
        "risk_thresholds": {
            "Critical": ">= 72",
            "High": "54 - 71",
            "Moderate": "32 - 53",
            "Low": "< 32"
        }
    }
    with open(META_SAVE_PATH, "w") as f:
        json.dump(meta, f, indent=2)

    print(f"Saved metadata to: {META_SAVE_PATH}")
    return pipeline


if __name__ == "__main__":
    train_model()
