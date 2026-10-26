import base64
import io
import json
import os
import numpy as np
from PIL import Image

try:
    import tensorflow as tf
except ImportError:
    tf = None

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
TFLITE_PATH = os.path.join(MODELS_DIR, "agrisense_b0.tflite")
CLASS_NAMES_PATH = os.path.join(MODELS_DIR, "class_names.json")

NAME_CLEANUP = {
    "Bacterial_Leaf_Blight": "Bacterial Leaf Blight",
    "Brown_Spot": "Brown Spot",
    "Healthy": "Healthy",
    "Leaf_Blast": "Leaf Blast",
    "Leaf_Scald": "Leaf Scald",
    "Sheath_Blight": "Sheath Blight"
}

SEVERITY_MAPPING = {
    "Healthy": "None",
    "Bacterial Leaf Blight": "High",
    "Leaf Blast": "Critical",
    "Sheath Blight": "High",
    "Brown Spot": "Moderate",
    "Leaf Scald": "Moderate"
}

_interpreter = None
_input_details = None
_output_details = None
_classes = None

def load_disease_model():
    global _interpreter, _input_details, _output_details, _classes
    if _interpreter is not None:
        return _interpreter, _input_details, _output_details, _classes

    if tf is None or not os.path.exists(TFLITE_PATH):
        return None, None, None, None

    try:
        _interpreter = tf.lite.Interpreter(model_path=TFLITE_PATH)
        _interpreter.allocate_tensors()
        _input_details = _interpreter.get_input_details()
        _output_details = _interpreter.get_output_details()

        if os.path.exists(CLASS_NAMES_PATH):
            with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                _classes = data.get("classes", [])
        else:
            _classes = [
                "Bacterial_Leaf_Blight",
                "Brown_Spot",
                "Healthy",
                "Leaf_Blast",
                "Leaf_Scald",
                "Sheath_Blight"
            ]
        return _interpreter, _input_details, _output_details, _classes
    except Exception as e:
        print(f"[DiseaseEngine] Failed to load model: {e}")
        return None, None, None, None


def predict_disease_from_base64(image_data_str: str, crop_name: str = "Rice") -> dict:
    """
    Decodes base64 image, resizes to 256x256 (Lanczos, range 0..255 float32),
    and executes EfficientNet-B0 / AgriSense-B0 model.
    """
    interpreter, input_details, output_details, classes = load_disease_model()

    if interpreter is None:
        # Fallback if model binary is missing
        return {
            "diseaseName": "Leaf Blast",
            "confidence": 88.5,
            "severity": "High",
            "allPredictions": [
                {"condition": "Leaf Blast", "score": 88.5},
                {"condition": "Brown Spot", "score": 6.2},
                {"condition": "Bacterial Leaf Blight", "score": 3.1},
                {"condition": "Healthy", "score": 1.2},
                {"condition": "Sheath Blight", "score": 0.6},
                {"condition": "Leaf Scald", "score": 0.4},
            ],
            "model_version": "AgriSense-B0 (Mock Fallback)"
        }

    # 1. Clean base64 string
    if "," in image_data_str:
        image_data_str = image_data_str.split(",", 1)[1]

    image_bytes = base64.b64decode(image_data_str)
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # 2. Resize to exactly 256x256 using Lanczos filter as specified in bundle instructions
    resized_img = image.resize((256, 256), Image.Resampling.LANCZOS)

    # 3. Convert to float32 numpy array in range 0..255 (DO NOT divide by 255)
    input_array = np.array(resized_img, dtype=np.float32)
    input_tensor = np.expand_dims(input_array, axis=0) # shape: (1, 256, 256, 3)

    # 4. Set input and invoke
    interpreter.set_tensor(input_details[0]['index'], input_tensor)
    interpreter.invoke()

    # 5. Read output probabilities
    raw_preds = interpreter.get_tensor(output_details[0]['index'])[0]

    # Convert to standard Python float list
    predictions_list = []
    for i, raw_prob in enumerate(raw_preds):
        raw_name = classes[i] if i < len(classes) else f"Class_{i}"
        clean_name = NAME_CLEANUP.get(raw_name, raw_name.replace("_", " "))
        score_pct = round(float(raw_prob) * 100, 2)
        predictions_list.append({
            "condition": clean_name,
            "score": score_pct
        })

    # Sort descending by score
    predictions_list.sort(key=lambda x: x["score"], reverse=True)

    top_pred = predictions_list[0]
    top_disease = top_pred["condition"]
    top_confidence = top_pred["score"]

    # Assign severity
    if top_disease == "Healthy":
        severity = "None"
    elif top_confidence < 50.0:
        severity = "Moderate"
    else:
        severity = SEVERITY_MAPPING.get(top_disease, "High")

    return {
        "diseaseName": top_disease,
        "confidence": top_confidence,
        "severity": severity,
        "allPredictions": predictions_list,
        "model_version": "AgriSense-B0 (EfficientNet-B0 TFLite)"
    }
