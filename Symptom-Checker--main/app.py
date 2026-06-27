from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import tempfile
import os
import re
import logging
import base64
import pickle
from gtts import gTTS
from deep_translator import GoogleTranslator
from collections import Counter
import wave
import json

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

MODEL_PATH = "disease_model.pkl"
DISEASE_DATA_PATH = "disease_data.pkl"

last_prediction_store = {}

# Disease translations - Added more allergy translations
DISEASE_TRANSLATIONS = {
    "mr": {
        "Migraine": "मायग्रेन", "Tension": "ताणामुळे डोकेदुखी",
        "Cluster": "क्लस्टर डोकेदुखी", "Sinus": "सायनस डोकेदुखी",
        "Cervicogenic": "मानेमुळे डोकेदुखी", "Cold": "सर्दी",
        "Cough": "खोकला", "Fever": "ताप",
        "Sore Throat": "घसा दुखणे", "Flu": "फ्लू",
        "Stomach Flu": "पोटाचा फ्लू",
        "Allergy": "एलर्जी",
        "Skin Allergy": "त्वचा एलर्जी",
        "Respiratory Allergy": "श्वसन एलर्जी",
        "Food Allergy": "अन्न एलर्जी",
        "Drug Allergy": "औषध एलर्जी",
        "Seasonal Allergy": "हंगामी एलर्जी",
        "Anemia": "अशक्तपणा", "Acidity": "आम्लपित्त",
        "Gas": "गॅस", "Constipation": "बद्धकोष्ठता",
        "Piles": "मुळव्या", "Periods": "मासिक पाळी",
        "Dehydration": "निर्जलीकरण", "Stress": "ताण",
        "Eye Infection": "डोळ्याचा संसर्ग"
    },
    "hi": {
        "Migraine": "माइग्रेन", "Tension": "तनाव सिरदर्द",
        "Cluster": "क्लस्टर सिरदर्द", "Sinus": "साइनस सिरदर्द",
        "Cervicogenic": "गर्दन से संबंधित सिरदर्द", "Cold": "सर्दी",
        "Cough": "खांसी", "Fever": "बुखार",
        "Sore Throat": "गले में खराश", "Flu": "फ्लू",
        "Stomach Flu": "पेट का फ्लू",
        "Allergy": "एलर्जी",
        "Skin Allergy": "त्वचा एलर्जी",
        "Respiratory Allergy": "श्वसन एलर्जी",
        "Food Allergy": "भोजन एलर्जी",
        "Drug Allergy": "दवा एलर्जी",
        "Seasonal Allergy": "मौसमी एलर्जी",
        "Anemia": "एनीमिया", "Acidity": "एसिडिटी",
        "Gas": "गैस", "Constipation": "कब्ज",
        "Piles": "बवासीर", "Periods": "मासिक धर्म",
        "Dehydration": "निर्जलीकरण", "Stress": "तनाव",
        "Eye Infection": "आँख का संक्रमण"
    }
}

def translate_disease(disease, target_lang):
    if target_lang == "en":
        return disease
    if target_lang in DISEASE_TRANSLATIONS and disease in DISEASE_TRANSLATIONS[target_lang]:
        return DISEASE_TRANSLATIONS[target_lang][disease]
    return translate_text(disease, target_lang)

def load_all_data():
    all_records = []
    remedy_map = {}
    precaution_map = {}
   
    csv_files = ["headache_dataset_updated.csv"]
   
    for file in csv_files:
        try:
            if os.path.exists(file):
                df = pd.read_csv(file)
                for idx, row in df.iterrows():
                    disease = row.get('headache_type', 'Unknown')
                    if pd.isna(disease) or disease == 'Unknown':
                        continue
                   
                    symptoms = []
                    if pd.notna(row['pain_location']):
                        symptoms.append(str(row['pain_location']))
                    if pd.notna(row['pain_type']):
                        symptoms.append(str(row['pain_type']))
                    if pd.notna(row['pain_intensity']):
                        symptoms.append(str(row['pain_intensity']))
                    if pd.notna(row['nausea']) and row['nausea'] == 1:
                        symptoms.append("nausea")
                    if pd.notna(row['light_sensitivity']) and row['light_sensitivity'] == 1:
                        symptoms.append("light_sensitivity")
                    if pd.notna(row['eye_pain']) and row['eye_pain'] == 1:
                        symptoms.append("eye_pain")
                    if pd.notna(row['neck_pain']) and row['neck_pain'] == 1:
                        symptoms.append("neck_pain")
                    if pd.notna(row['stress']) and row['stress'] == 1:
                        symptoms.append("stress")
                   
                    symptoms_text = " ".join(symptoms) if symptoms else "unknown"
                   
                    remedy = row.get('Remedies', '')
                    precaution = row.get('Precautions', '')
                   
                    if remedy and pd.notna(remedy) and len(str(remedy)) > 3:
                        remedy_map[disease] = str(remedy)
                    if precaution and pd.notna(precaution) and len(str(precaution)) > 3:
                        precaution_map[disease] = str(precaution)
                   
                    all_records.append({
                        'disease': disease,
                        'symptoms': symptoms_text,
                        'remedies': remedy,
                        'precautions': precaution
                    })
        except Exception as e:
            pass
   
    # Add allergy-specific data if not present
    if "Allergy" not in remedy_map:
        remedy_map["Allergy"] = "Take antihistamines, avoid allergens, use cold compress, stay hydrated."
        precaution_map["Allergy"] = "Identify and avoid allergens, keep environment clean, carry emergency medication."
   
    if "Skin Allergy" not in remedy_map:
        remedy_map["Skin Allergy"] = "Apply calamine lotion, take antihistamines, use cold compress, avoid scratching."
        precaution_map["Skin Allergy"] = "Avoid known irritants, use hypoallergenic products, wear protective clothing."
   
    if "Respiratory Allergy" not in remedy_map:
        remedy_map["Respiratory Allergy"] = "Use antihistamines, nasal sprays, steam inhalation, avoid triggers."
        precaution_map["Respiratory Allergy"] = "Use air purifiers, wear masks, avoid dusty areas, keep windows closed."
   
    if "Food Allergy" not in remedy_map:
        remedy_map["Food Allergy"] = "Take antihistamines, drink plenty of water, avoid trigger foods."
        precaution_map["Food Allergy"] = "Read food labels carefully, carry epinephrine auto-injector, inform restaurants."
   
    if "Drug Allergy" not in remedy_map:
        remedy_map["Drug Allergy"] = "Stop medication immediately, take antihistamines, consult doctor."
        precaution_map["Drug Allergy"] = "Inform healthcare providers about allergies, wear medical alert bracelet."
   
    if "Seasonal Allergy" not in remedy_map:
        remedy_map["Seasonal Allergy"] = "Use antihistamines, nasal sprays, keep windows closed, shower after outdoor."
        precaution_map["Seasonal Allergy"] = "Check pollen forecasts, wear sunglasses, use air conditioning, change clothes."
   
    if not all_records:
        return None, {}, {}
   
    df = pd.DataFrame(all_records)
    df = df.drop_duplicates(subset=['disease', 'symptoms'])
    df = df[df['symptoms'].str.len() > 2]
    return df, remedy_map, precaution_map

def train_model():
    try:
        df, remedy_map, precaution_map = load_all_data()
        if df is None or len(df) < 5:
            return None, {}, {}, 0
       
        def build_features(row):
            text = str(row['symptoms'])
            if pd.notna(row['remedies']) and str(row['remedies']).strip():
                text += " " + str(row['remedies'])
            if pd.notna(row['precautions']) and str(row['precautions']).strip():
                text += " " + str(row['precautions'])
            return text
       
        df["combined"] = df.apply(build_features, axis=1)
        df = df[df["combined"].str.len() > 3]
       
        if len(df) < 5:
            return None, {}, {}, 0
       
        X = df["combined"]
        y = df["disease"]
       
        try:
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        except:
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
       
        pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(ngram_range=(1, 3), max_features=15000, min_df=2, max_df=0.85, sublinear_tf=True)),
            ("clf", LogisticRegression(C=1.5, max_iter=1000, random_state=42, class_weight='balanced', solver='liblinear', penalty='l2', multi_class='ovr'))
        ])
       
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)
        ml_accuracy = accuracy_score(y_test, y_pred)
       
        print("MODEL ACCURACY:", round(ml_accuracy * 100, 2), "%")
       
        with open(MODEL_PATH, 'wb') as f:
            pickle.dump(pipeline, f)
       
        disease_data = {
            'remedy_map': remedy_map,
            'precaution_map': precaution_map,
            'diseases': list(remedy_map.keys()),
            'accuracy': ml_accuracy,
            'total_records': len(df)
        }
        with open(DISEASE_DATA_PATH, 'wb') as f:
            pickle.dump(disease_data, f)
       
        return pipeline, remedy_map, precaution_map, ml_accuracy
       
    except Exception as e:
        return None, {}, {}, 0

# Load or train model
pipeline = None
remedy_map = {}
precaution_map = {}

if os.path.exists(MODEL_PATH) and os.path.exists(DISEASE_DATA_PATH):
    try:
        with open(MODEL_PATH, 'rb') as f:
            pipeline = pickle.load(f)
        with open(DISEASE_DATA_PATH, 'rb') as f:
            disease_data = pickle.load(f)
        remedy_map = disease_data.get('remedy_map', {})
        precaution_map = disease_data.get('precaution_map', {})
        ml_accuracy = disease_data.get('accuracy', 0)
        print("Model loaded. Accuracy:", round(ml_accuracy * 100, 2), "%")
    except:
        pipeline = None

if pipeline is None:
    pipeline, remedy_map, precaution_map, ml_accuracy = train_model()

# ===== ENHANCED DISEASE KEYWORDS - FIXED ALLERGY DETECTION =====
DISEASE_KEYWORDS = [
    # Flu - highest priority
    ("Flu", [
        "fever cold cough", "cold cough fever", "fever and cold", "cold and fever",
        "बुखार सर्दी खांसी", "ताप सर्दी खोकला"
    ]),
   
    # Tension - Now "headache" maps here
    ("Tension", [
        "headache", "tension", "both sides", "dull", "pressure", "stress",
        "ताण", "दोन्ही बाजू", "सिरदर्द"
    ]),
   
    # Migraine - more specific headache
    ("Migraine", [
        "migraine", "left side", "right side", "throbbing", "pulsating", "temples",
        "मायग्रेन", "धडधड", "एक बाजू"
    ]),
   
    # ===== ENHANCED ALLERGY DETECTION =====
    # General Allergy
    ("Allergy", [
        # English
        "allergy", "allergic", "allergies", "allergen", "allergic reaction",
       
        # Hindi/Marathi
        "एलर्जी", "एलर्जिक", "एलर्जी प्रतिक्रिया",
       
        # Skin allergy symptoms
        "skin allergy", "skin rash", "hives", "urticaria", "eczema", "dermatitis",
        "contact dermatitis", "itching", "itchy skin", "red skin", "skin irritation",
        "rashes", "bumps on skin", "blisters", "dry skin", "flaky skin",
       
        # Hindi/Marathi for skin
        "त्वचा एलर्जी", "पुरळ", "चकत्ते", "खुजली", "त्वचेवर लाल चकत्ते",
        "त्वचा खाजणे", "खाज सुटणे", "त्वचेवर पुरळ येणे", "लाल चकत्ते",
        "चामल", "खाज", "त्वचा", "खाज येणे",
       
        # Respiratory allergy symptoms
        "hay fever", "seasonal allergy", "pollen allergy", "dust allergy",
        "pet allergy", "mold allergy", "allergic rhinitis",
        "sneezing", "sneeze", "runny nose", "watery eyes", "itchy eyes",
        "nasal congestion", "stuffy nose", "wheezing", "breathing difficulty",
        "shortness of breath", "cough from allergy", "post nasal drip",
       
        # Hindi/Marathi for respiratory
        "शिंका येणे", "शिंका", "नाक वाहणे", "नाक बहना", "नाक बंद होणे",
        "डोळे खाजणे", "डोळ्यांना खाज", "पाणी येणे डोळ्यातून",
        "श्वास घेण्यास त्रास", "धाप लागणे", "छातीत घरघर",
        "मौसमी एलर्जी", "धूळ एलर्जी", "परागकण एलर्जी",
        "आँखों में खुजली", "छींक आना", "नाक बहना", "सांस लेने में कठिनाई",
       
        # Food allergy symptoms
        "food allergy", "food intolerance", "peanut allergy", "shellfish allergy",
        "lactose intolerance", "milk allergy", "egg allergy", "soy allergy",
        "wheat allergy", "fish allergy", "tree nut allergy",
       
        # Hindi/Marathi for food
        "खाद्य एलर्जी", "अन्न एलर्जी", "दूध एलर्जी", "अंडे से एलर्जी",
        "मूंगफली एलर्जी", "समुद्री भोजन एलर्जी",
        "खाने से एलर्जी", "खाने की चीज़ों से एलर्जी",
       
        # Drug allergy
        "drug allergy", "medicine allergy", "penicillin allergy", "antibiotic allergy",
        "दवा एलर्जी", "औषध एलर्जी", "दवाई से एलर्जी",
       
        # Environmental triggers
        "dust", "pollen", "mold", "spores", "pet dander", "animal hair",
        "धूळ", "परागकण", "फफूंद", "प्राण्यांचे केस",
        "धूल", "पराग", "साँचा", "जानवरों के बाल",
       
        # Common allergy symptoms phrases
        "allergy attack", "allergic reaction to", "suffering from allergy",
        "allergy symptoms", "seasonal allergies", "year-round allergies",
        "एलर्जीचा झटका", "एलर्जीची लक्षणे"
    ]),
   
    # Specific Allergy Types - More targeted
    ("Skin Allergy", [
        "skin allergy", "skin rash", "hives", "urticaria", "eczema",
        "contact dermatitis", "itching skin", "red rash", "skin bumps",
        "त्वचा एलर्जी", "त्वचा पुरळ", "खुजली", "चकत्ते"
    ]),
   
    ("Respiratory Allergy", [
        "hay fever", "allergic rhinitis", "sneezing", "runny nose",
        "watery eyes", "nasal allergy", "pollen allergy", "dust allergy",
        "श्वसन एलर्जी", "नाक एलर्जी", "शिंका आना", "नाक बहना"
    ]),
   
    ("Food Allergy", [
        "food allergy", "food reaction", "peanut allergy", "lactose intolerance",
        "milk allergy", "egg allergy", "खाद्य एलर्जी", "अन्न एलर्जी"
    ]),
   
    ("Drug Allergy", [
        "drug allergy", "medicine allergy", "penicillin allergy",
        "दवा एलर्जी", "औषध एलर्जी"
    ]),
   
    ("Seasonal Allergy", [
        "seasonal allergy", "hay fever", "spring allergy", "fall allergy",
        "मौसमी एलर्जी", "हंगामी एलर्जी"
    ]),
   
    # ===== OTHER DISEASES =====
    ("Periods", [
        "periods", "menstruation", "cramps", "period pain", "monthly", "cycle",
        "पाळी", "मासिक", "पीरियड्स", "मासिक धर्म"
    ]),
    ("Anemia", [
        "weakness", "fatigue", "tired", "dizziness", "pale", "low hb",
        "अशक्त", "थकवा", "कमजोरी"
    ]),
    ("Cluster", [
        "cluster", "eye pain", "red eye", "stabbing", "क्लस्टर"
    ]),
    ("Sinus", [
        "sinus", "forehead", "cheek", "सायनस", "कपाळ", "गाल"
    ]),
    ("Cervicogenic", [
        "cervicogenic", "neck pain", "stiff neck", "मान दुखणे", "गर्दन"
    ]),
    ("Cold", [
        "cold", "runny nose", "sneezing", "stuffy", "सर्दी", "नाक वाहणे", "शिंका"
    ]),
    ("Cough", [
        "cough", "chest congestion", "phlegm", "खोकला", "खांसी", "कफ"
    ]),
    ("Fever", [
        "fever", "temperature", "chills", "body ache", "ताप", "बुखार", "थंडी"
    ]),
    ("Sore Throat", [
        "sore throat", "throat pain", "घसा दुखणे", "गला खराब"
    ]),
    ("Gas", [
        "gas", "stomach pain", "bloating", "गॅस", "पोटदुखी", "गैस"
    ]),
    ("Acidity", [
        "acidity", "heartburn", "chest burning", "आम्लपित्त", "छातीत जळजळ", "एसिडिटी"
    ]),
    ("Constipation", [
        "constipation", "hard stool", "कब्ज", "बद्धकोष्ठता"
    ]),
    ("Piles", [
        "piles", "bleeding", "hemorrhoid", "मुळव्या", "रक्त", "बवासीर"
    ]),
    ("Stomach Flu", [
        "stomach flu", "diarrhea", "vomiting", "उलटी", "अतिसार", "पोटाचा फ्लू"
    ]),
    ("Dehydration", [
        "dehydration", "thirst", "dizziness", "निर्जलीकरण", "तहान", "चक्कर"
    ]),
    ("Stress", [
        "stress", "anxiety", "tension", "चिंता", "ताण"
    ]),
    ("Eye Infection", [
        "eye infection", "red eye", "eye pain", "डोळा लाल", "आँख दर्द"
    ])
]

def check_keyword_match(text):
    """
    Enhanced keyword matching with allergy detection
    """
    text_lower = text.lower()
   
    # Check for flu first (highest priority)
    if "fever" in text_lower and "cold" in text_lower and "cough" in text_lower:
        return "Flu", 0.95
    if "बुखार" in text_lower and "सर्दी" in text_lower and "खांसी" in text_lower:
        return "Flu", 0.95
    if "ताप" in text_lower and "सर्दी" in text_lower and "खोकला" in text_lower:
        return "Flu", 0.95
   
    # Enhanced allergy detection
    allergy_indicators = [
        "allergy", "allergic", "allergies", "allergen", "एलर्जी", "एलर्जिक",
        "itching", "itchy", "खाज", "खुजली", "खाजणे",
        "rash", "hives", "urticaria", "चकत्ते", "पुरळ",
        "sneezing", "sneeze", "शिंका", "छींक",
        "runny nose", "नाक वाहणे", "नाक बहना",
        "watery eyes", "itchy eyes", "डोळे खाजणे", "आँखों में खुजली"
    ]
   
    # Count allergy indicators
    allergy_score = 0
    for indicator in allergy_indicators:
        if indicator in text_lower:
            allergy_score += 0.3
   
    # Check for specific allergy types
    allergy_types = {
        "skin": ["skin", "rash", "hives", "eczema", "dermatitis", "खाज", "चकत्ते", "त्वचा"],
        "respiratory": ["sneezing", "runny nose", "cough", "wheezing", "शिंका", "नाक", "सांस"],
        "food": ["food", "meal", "eat", "diet", "खाद्य", "अन्न", "खाना"],
        "drug": ["drug", "medicine", "pill", "antibiotic", "दवा", "औषध"],
        "seasonal": ["season", "spring", "fall", "pollen", "मौसम", "हंगाम", "पराग"]
    }
   
    for allergy_type, keywords in allergy_types.items():
        if any(kw in text_lower for kw in keywords):
            allergy_score += 0.15
   
    # Check for allergy triggers
    triggers = ["dust", "pollen", "mold", "pet", "animal", "food", "peanut", "shellfish",
                "milk", "egg", "penicillin", "धूळ", "पराग", "प्राणी", "खाद्य"]
    if any(trigger in text_lower for trigger in triggers):
        allergy_score += 0.2
   
    # If high allergy score, return allergy
    if allergy_score >= 0.4:
        # Determine specific allergy type
        if "skin" in text_lower or "रैश" in text_lower or "खाज" in text_lower:
            return "Skin Allergy", min(0.95, allergy_score)
        elif any(word in text_lower for word in ["sneezing", "runny nose", "शिंका", "नाक"]):
            return "Respiratory Allergy", min(0.95, allergy_score)
        elif any(word in text_lower for word in ["food", "eat", "खाद्य", "खाना"]):
            return "Food Allergy", min(0.95, allergy_score)
        elif any(word in text_lower for word in ["drug", "medicine", "दवा", "औषध"]):
            return "Drug Allergy", min(0.95, allergy_score)
        elif any(word in text_lower for word in ["season", "spring", "pollen", "मौसम", "पराग"]):
            return "Seasonal Allergy", min(0.95, allergy_score)
        else:
            return "Allergy", min(0.95, allergy_score)
   
    # Check other diseases
    for disease, keywords in DISEASE_KEYWORDS:
        # Skip allergy entries as we already checked them
        if disease in ["Allergy", "Skin Allergy", "Respiratory Allergy", "Food Allergy", "Drug Allergy", "Seasonal Allergy"]:
            continue
       
        for keyword in keywords:
            if keyword in text_lower:
                return disease, 0.85
   
    return None, 0

def translate_to_english(text):
    if re.match(r'^[a-zA-Z0-9\s\.\,\?\']+$', text):
        return text
    try:
        translator = GoogleTranslator(source='auto', target='en')
        return translator.translate(text)
    except:
        return text

def translate_text(text, target_lang):
    if target_lang == "en" or not text or len(str(text).strip()) < 2:
        return text
    try:
        translator = GoogleTranslator(source='en', target=target_lang)
        return translator.translate(str(text))
    except:
        return text

def is_gibberish(text):
    text_clean = text.lower().strip()
    text_clean = re.sub(r'[^a-zA-Z\u0900-\u097F]', '', text_clean)
   
    if len(text_clean) == 0:
        return True
   
    meaningful_words = [
        "hi", "hello", "hey", "thanks", "thank", "bye", "goodbye", "ok", "okay",
        "नमस्कार", "नमस्ते", "धन्यवाद", "शुक्रिया", "ठीक", "निरोप", "अलविदा"
    ]
    for word in meaningful_words:
        if word in text_clean.lower():
            return False
   
    symptom_words = [
        "pain", "ache", "head", "neck", "eye", "stomach", "gas", "fever",
        "cold", "cough", "throat", "nausea", "vomit", "diarrhea", "constipation",
        "bleeding", "piles", "period", "cramp", "allergy", "rash", "weak",
        "tired", "fatigue", "dizzy", "thirst", "stress", "anxiety",
        "itching", "migraine", "sinus", "tension", "flu", "sneeze",
        "सर्दी", "खोकला", "ताप", "बुखार", "डोके", "पोट", "गॅस", "पाळी",
        "खाज", "अशक्त", "थकवा", "शिंका", "एलर्जी"
    ]
    for word in symptom_words:
        if word in text_clean.lower():
            return False
   
    if len(text_clean) > 3:
        char_counts = {}
        for c in text_clean:
            char_counts[c] = char_counts.get(c, 0) + 1
        max_count = max(char_counts.values()) if char_counts else 0
        if max_count / len(text_clean) > 0.7:
            return True
   
    keyboard_patterns = ["asdf", "qwerty", "zxcv", "hjk", "jkl", "dfgh", "wert"]
    for pattern in keyboard_patterns:
        if pattern in text_clean.lower():
            return True
   
    vowels = "aeiou"
    if len(text_clean) > 3:
        vowel_count = sum(1 for c in text_clean.lower() if c in vowels)
        if vowel_count == 0:
            return True
   
    if len(text_clean) > 5:
        alpha_count = sum(1 for c in text_clean if c.isalpha())
        if alpha_count > 0:
            consonant_ratio = sum(1 for c in text_clean.lower() if c.isalpha() and c not in vowels) / alpha_count
            if consonant_ratio > 0.8:
                return True
   
    return False

RESPONSES = {
    "mr": {
        "greeting": "नमस्कार. कृपया तुमच्या लक्षणांचे वर्णन करा.",
        "welcome": "स्वागत आहे. कृपया तुमच्या लक्षणांचे वर्णन करा.",
        "thank_you": "तुमचे स्वागत आहे. निरोगी रहा.",
        "bye": "निरोप. काळजी घ्या.",
        "ok": "ठीक आहे. आणखी मदत हवी असल्यास विचारा.",
        "more_details": "कृपया आपल्या लक्षणांबद्दल अधिक माहिती द्या.",
        "would_you_like": "उपाय आणि खबरदारी हवी आहे का? (होय/नाही)",
        "you_may_have": "तुम्हाला {disease} असू शकते.",
        "invalid_input": "चुकीचा इनपुट. कृपया योग्य लक्षणे प्रविष्ट करा. उदा. मला सर्दी आहे."
    },
    "hi": {
        "greeting": "नमस्ते। कृपया अपने लक्षणों का वर्णन करें।",
        "welcome": "स्वागत है। कृपया अपने लक्षणों का वर्णन करें।",
        "thank_you": "आपका स्वागत है। स्वस्थ रहें।",
        "bye": "अलविदा। अपना ख्याल रखें।",
        "ok": "ठीक है। यदि और सहायता चाहिए तो पूछें।",
        "more_details": "कृपया अपने लक्षणों के बारे में अधिक जानकारी दें।",
        "would_you_like": "क्या आप उपचार और सावधानियाँ जानना चाहेंगे? (हाँ/नहीं)",
        "you_may_have": "आपको {disease} हो सकता है।",
        "invalid_input": "गलत इनपुट। कृपया सही लक्षण दर्ज करें। उदा. मुझे सर्दी है।"
    },
    "en": {
        "greeting": "Hello. Please describe your symptoms.",
        "welcome": "Welcome. Please describe your symptoms.",
        "thank_you": "You're welcome. Stay healthy.",
        "bye": "Goodbye. Take care.",
        "ok": "Alright. Let me know if you need anything else.",
        "more_details": "Please provide more details about your symptoms.",
        "would_you_like": "Would you like remedies and precautions? (yes/no)",
        "you_may_have": "You may have: {disease}",
        "invalid_input": "Wrong input. Please enter valid symptoms. Eg. I have cold."
    }
}

def get_response(key, lang="en", disease=""):
    if lang in RESPONSES and key in RESPONSES[lang]:
        response = RESPONSES[lang][key]
        if "{disease}" in response:
            return response.replace("{disease}", disease)
        return response
    return RESPONSES["en"].get(key, key)

def detect_keyword(text):
    text_clean = text.lower().strip()
    text_clean = re.sub(r'[^\w\s\u0900-\u097F]', '', text_clean)
   
    if any(w in text_clean for w in ["thank", "thanks", "धन्यवाद", "शुक्रिया"]):
        return "thank_you"
    if any(w in text_clean for w in ["bye", "goodbye", "निरोप", "अलविदा"]):
        return "bye"
    if any(w in text_clean for w in ["ok", "okay", "ठीक"]):
        return "ok"
    if any(w in text_clean for w in ["hi", "hello", "hey", "नमस्कार", "नमस्ते"]):
        return "greeting"
    if any(w in text_clean for w in ["yes", "yeah", "yep", "होय", "हो", "हाँ"]):
        return "yes"
    if any(w in text_clean for w in ["no", "nope", "नाही", "नहीं"]):
        return "no"
   
    symptom_words = [
        "pain", "ache", "head", "neck", "eye", "stomach", "gas", "fever",
        "cold", "cough", "throat", "nausea", "vomit", "diarrhea", "constipation",
        "bleeding", "piles", "period", "cramp", "allergy", "rash", "weak",
        "tired", "fatigue", "dizzy", "thirst", "stress", "anxiety",
        "खाज", "सर्दी", "खोकला", "ताप", "बुखार", "पोट", "गॅस", "कब्ज",
        "मल", "रक्त", "अशक्त", "थकवा", "डोके", "मान", "सर्वे", "त्वचा",
        "एलर्जी", "शिंका", "नाक", "चकत्ते", "खुजली"
    ]
   
    for word in symptom_words:
        if word in text_clean:
            return "symptom"
   
    if len(text_clean) > 2:
        return "symptom"
   
    return "unknown"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        text = data.get("symptoms", "").strip()
        lang = data.get("language", "en")
        is_remedy = data.get("is_remedy_response", False)
       
        if is_gibberish(text):
            return jsonify({
                "message": get_response("invalid_input", lang),
                "is_general": True
            })
       
        keyword = detect_keyword(text)
       
        if keyword == "thank_you":
            return jsonify({"message": get_response("thank_you", lang), "is_general": True})
        if keyword == "bye":
            return jsonify({"message": get_response("bye", lang), "is_general": True})
        if keyword == "greeting":
            return jsonify({"message": get_response("welcome", lang), "is_general": True})
        if keyword == "ok":
            return jsonify({"message": get_response("ok", lang), "is_general": True})
       
        if is_remedy:
            if keyword in ["yes", "ok"]:
                return jsonify({"message": "remedy_request", "is_general": True})
            elif keyword == "no":
                return jsonify({"message": get_response("ok", lang), "is_general": True})
            else:
                pass
       
        if keyword != "symptom":
            return jsonify({"message": get_response("more_details", lang), "is_general": True})
       
        # Check for allergy first with enhanced detection
        disease, confidence = check_keyword_match(text)
       
        if disease is None:
            english_text = translate_to_english(text)
           
            if pipeline is not None:
                probs = pipeline.predict_proba([english_text])[0]
                pred = pipeline.classes_[probs.argmax()]
                confidence = float(max(probs))
                disease = pred
       
        if disease is None:
            return jsonify({"message": get_response("more_details", lang), "is_general": True})
       
        # Get remedies and precautions - check for allergy types
        remedy = remedy_map.get(disease, "Rest and stay hydrated. Drink plenty of fluids.")
        precaution = precaution_map.get(disease, "Monitor symptoms. Stay hydrated.")
       
        last_prediction_store['disease'] = disease
        last_prediction_store['remedy'] = remedy
        last_prediction_store['precaution'] = precaution
       
        pred_display = translate_disease(disease, lang)
        remedy_trans = translate_text(remedy, lang)
        precaution_trans = translate_text(precaution, lang)
        condition_label = translate_text("Condition", lang)
        would_you_like = get_response("would_you_like", lang)
        you_may_have = get_response("you_may_have", lang, pred_display)
       
        return jsonify({
            "prediction": pred_display,
            "condition_label": condition_label,
            "remedy": remedy_trans,
            "precaution": precaution_trans,
            "would_you_like": would_you_like,
            "you_may_have": you_may_have,
            "confidence": round(confidence * 100, 1),
            "is_general": False,
            "needs_remedy": True,
            "language": lang
        })
       
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}", "is_general": True})

@app.route("/remedy", methods=["POST"])
def get_remedy():
    try:
        data = request.get_json()
        h_type = data.get("type", "")
        lang = data.get("language", "en")
       
        original = h_type
        for disease in remedy_map.keys():
            if disease.lower() in h_type.lower() or h_type.lower() in disease.lower():
                original = disease
                break
       
        remedy = remedy_map.get(original, "Rest and stay hydrated.")
        precaution = precaution_map.get(original, "Monitor symptoms.")
       
        last_prediction_store['disease'] = original
        last_prediction_store['remedy'] = remedy
        last_prediction_store['precaution'] = precaution
       
        pred_display = translate_disease(original, lang)
       
        if lang != "en":
            condition_label = translate_text("Condition", lang)
            remedy_label = translate_text("Remedy", lang)
            precaution_label = translate_text("Precautions", lang)
            doctor_label = translate_text("Doctor Advice", lang)
            remedy = translate_text(remedy, lang)
            precaution = translate_text(precaution, lang)
            doctor_advice = translate_text("Consult a doctor if symptoms persist.", lang)
        else:
            condition_label = "Condition"
            remedy_label = "Remedy"
            precaution_label = "Precautions"
            doctor_label = "Doctor Advice"
            doctor_advice = "Consult a doctor if symptoms persist."
       
        return jsonify({
            "condition_label": condition_label,
            "remedy_label": remedy_label,
            "precaution_label": precaution_label,
            "doctor_label": doctor_label,
            "remedy": remedy,
            "precaution": precaution,
            "doctor_advice": doctor_advice,
            "prediction": pred_display
        })
   
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/translate-all", methods=["POST"])
def translate_all():
    try:
        data = request.get_json()
        texts = data.get("texts", [])
        target_lang = data.get("language", "en")
       
        if target_lang == "en" or not texts:
            return jsonify({"translated_texts": texts})
       
        translated_texts = []
        for text in texts:
            if text and len(text.strip()) > 1:
                translated = translate_text(text, target_lang)
                translated_texts.append(translated)
            else:
                translated_texts.append(text)
       
        return jsonify({"translated_texts": translated_texts})
       
    except Exception as e:
        return jsonify({"error": str(e), "translated_texts": []}), 500

@app.route("/switch-language", methods=["POST"])
def switch_language():
    try:
        data = request.get_json()
        lang = data.get("language", "en")
       
        disease = last_prediction_store.get('disease')
        remedy = last_prediction_store.get('remedy', '')
        precaution = last_prediction_store.get('precaution', '')
       
        if not disease:
            return jsonify({"message": get_response("welcome", lang), "is_general": True})
       
        pred_display = translate_disease(disease, lang)
        remedy_trans = translate_text(remedy, lang)
        precaution_trans = translate_text(precaution, lang)
        condition_label = translate_text("Condition", lang)
        would_you_like = get_response("would_you_like", lang)
        you_may_have = get_response("you_may_have", lang, pred_display)
       
        return jsonify({
            "prediction": pred_display,
            "condition_label": condition_label,
            "remedy": remedy_trans,
            "precaution": precaution_trans,
            "would_you_like": would_you_like,
            "you_may_have": you_may_have,
            "is_general": False,
            "needs_remedy": True,
            "language": lang
        })
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}", "is_general": True})

@app.route("/speak", methods=["POST"])
def speak_text():
    try:
        data = request.get_json()
        text = data.get("text", "")
        lang = data.get("language", "en")
       
        if not text:
            return jsonify({"error": "No text"}), 400
       
        text = re.sub(r'[^\w\s\u0900-\u097F]', ' ', text)
        lang_map = {"mr": "mr", "hi": "hi", "en": "en"}
        tts_lang = lang_map.get(lang, "en")
       
        tts = gTTS(text=text, lang=tts_lang, slow=False)
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
        tts.save(temp_file.name)
        temp_file.close()
       
        with open(temp_file.name, "rb") as f:
            audio_data = base64.b64encode(f.read()).decode('utf-8')
       
        os.unlink(temp_file.name)
        return jsonify({"audio": audio_data})
       
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===== IMPROVED SPEECH-TO-TEXT WITH MULTIPLE FALLBACKS =====
try:
    import whisper
    from werkzeug.utils import secure_filename
    WHISPER_AVAILABLE = True
    whisper_model = whisper.load_model("tiny")
    print("✅ Whisper loaded successfully")
except Exception as e:
    WHISPER_AVAILABLE = False
    print(f"⚠️ Whisper not available: {e}")

# Try to load Vosk as fallback
try:
    import vosk
    import wave
    VOSK_AVAILABLE = True
    print("✅ Vosk available")
except:
    VOSK_AVAILABLE = False
    print("⚠️ Vosk not available")

@app.route("/transcribe", methods=["POST"])
def transcribe():
    """
    Enhanced transcription with multiple fallback options
    """
    try:
        if "audio" not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
       
        file = request.files["audio"]
        lang = request.form.get("language", "en")
       
        # Save audio file temporarily
        path = os.path.join(tempfile.gettempdir(), secure_filename(file.filename))
        file.save(path)
       
        # Try Whisper first
        if WHISPER_AVAILABLE:
            try:
                whisper_lang = {"mr": "mr", "hi": "hi", "en": "en"}.get(lang, "en")
                result = whisper_model.transcribe(path, language=whisper_lang, fp16=False)
                transcript = result["text"].strip()
               
                if transcript and len(transcript) > 1:
                    os.remove(path)
                    return jsonify({
                        "transcript": transcript,
                        "method": "whisper"
                    })
            except Exception as e:
                print(f"Whisper transcription failed: {e}")
       
        # Fallback: Try to extract text using alternative methods
        try:
            # Read the audio file and try simple processing
            import speech_recognition as sr
            recognizer = sr.Recognizer()
           
            with sr.AudioFile(path) as source:
                audio_data = recognizer.record(source)
               
            # Try Google Speech Recognition (requires internet)
            try:
                transcript = recognizer.recognize_google(audio_data, language=lang)
                os.remove(path)
                return jsonify({
                    "transcript": transcript,
                    "method": "google_speech"
                })
            except:
                pass
               
            # Try Sphinx (offline, but less accurate)
            try:
                transcript = recognizer.recognize_sphinx(audio_data)
                os.remove(path)
                return jsonify({
                    "transcript": transcript,
                    "method": "sphinx"
                })
            except:
                pass
               
        except ImportError:
            pass
        except Exception as e:
            print(f"Fallback transcription failed: {e}")
       
        # Clean up
        if os.path.exists(path):
            os.remove(path)
       
        # If all methods fail
        return jsonify({
            "error": "Speech recognition failed. Please type your symptoms.",
            "transcript": "",
            "method": "none"
        }), 200
       
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===== ADD NEW ENDPOINT FOR VOICE INPUT WITH BETTER ERROR HANDLING =====
@app.route("/voice-input", methods=["POST"])
def voice_input():
    """
    Alternative endpoint for voice input with better error handling
    """
    try:
        if "audio" not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
       
        file = request.files["audio"]
        lang = request.form.get("language", "en")
       
        # Save audio
        path = os.path.join(tempfile.gettempdir(), "voice_input_" + file.filename)
        file.save(path)
       
        transcript = ""
        method_used = "none"
       
        # Try Whisper
        if WHISPER_AVAILABLE:
            try:
                whisper_lang = {"mr": "mr", "hi": "hi", "en": "en"}.get(lang, "en")
                result = whisper_model.transcribe(path, language=whisper_lang, fp16=False)
                transcript = result["text"].strip()
                method_used = "whisper"
            except Exception as e:
                print(f"Whisper error: {e}")
       
        # If Whisper failed or returned empty, try Google
        if not transcript or len(transcript) < 2:
            try:
                import speech_recognition as sr
                recognizer = sr.Recognizer()
                with sr.AudioFile(path) as source:
                    audio_data = recognizer.record(source)
                transcript = recognizer.recognize_google(audio_data, language=lang)
                method_used = "google_speech"
            except Exception as e:
                print(f"Google speech error: {e}")
       
        # Clean up
        if os.path.exists(path):
            os.remove(path)
       
        if transcript and len(transcript) > 1:
            return jsonify({
                "success": True,
                "transcript": transcript,
                "method": method_used,
                "language": lang
            })
        else:
            return jsonify({
                "success": False,
                "error": "Could not transcribe audio. Please try typing your symptoms.",
                "transcript": "",
                "method": "none"
            }), 200
           
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/")
def home():
    return jsonify({
        "status": "running",
        "endpoints": {
            "/predict": "POST - Predict disease from symptoms",
            "/remedy": "POST - Get remedy for disease",
            "/speak": "POST - Text to speech",
            "/transcribe": "POST - Speech to text (with fallbacks)",
            "/voice-input": "POST - Alternative voice input endpoint"
        }
    })

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5001)