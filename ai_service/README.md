# AgriSense AI Microservice

This microservice hosts your **3 Trained Machine Learning Models** + **4th Meta-Decision Fusion Engine**.

---

## 1. Quick Start

### Install Dependencies:
```bash
cd ai_service
pip install -r requirements.txt
```

### Run the Microservice (Port 8000):
```bash
uvicorn app:app --reload --port 8000
```
API Documentation: Open [http://localhost:8000/docs](http://localhost:8000/docs) in your browser.

---

## 2. Trained Model Placement

Place your trained model files in `ai_service/models/`:

1. **Leaf Disease Classifier (`MobileNetV3` / `EfficientNet-B0`):**
   - Save file: `ai_service/models/leaf_mobilenet_v3.h5` or `.onnx`
   - Endpoint: `POST /predict-disease`

2. **Price Forecaster (`Prophet` / `LightGBM`):**
   - Save file: `ai_service/models/price_prophet.pkl`
   - Endpoint: `POST /forecast-price`

3. **Environmental Risk Predictor (`XGBoost` / `Random Forest`):**
   - Save file: `ai_service/models/risk_xgboost.pkl`
   - Endpoint: `POST /predict-risk`

4. **Meta-Decision Fusion Layer (`4th Master Engine`):**
   - Implemented in `ai_service/app.py`
   - Endpoint: `POST /meta-advisory`
   - Cross-analyzes Model 1 + Model 2 + Model 3 outputs to generate holistic farmer advisory.
