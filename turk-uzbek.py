import json
import os
import re
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# 📂 JSON faylning to‘liq yo‘lini olish
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(BASE_DIR, "output.json")

# 📜 JSON fayldan tarjimalarni yuklash
def load_translations():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

# 🌍 Bosh sahifa
@app.route("/")
def home():
    return render_template("index.html")

# 📜 Turkcha so‘zlarni olish (Frontend uchun)
@app.route("/sentences", methods=["GET"])
def get_sentences():
    translations = load_translations()  # JSON-dagi tarjimalar
    return jsonify(list(translations.keys()))  # JSON-dagi barcha turkcha so‘zlarni qaytaradi

# ✅ Foydalanuvchi aytgan tarjimani tekshirish
@app.route("/check", methods=["POST"])
def check_translation():
    data = request.get_json()
    original = data.get("original", "").strip()  # Turkcha so'z
    spoken = data.get("spoken", "").strip()  # Foydalanuvchi aytgan javob

    # Tarjimalarni yuklash
    translations = load_translations()

    # To'g'ri tarjimani olish
    correct_translation = translations.get(original, "")

    # Javoblarni tozalash va solishtirish
    def clean_text(text):
        # Belgilarni olib tashlash va kichik harflarga aylantirish
        text = re.sub(r'[^\w\s]', '', text)  # Nuqta, vergul kabi belgilarni olib tashlash
        text = re.sub(r'\s+', '', text)      # Bo'shliqlarni olib tashlash
        return text.lower()

    correct_translation_cleaned = clean_text(correct_translation)
    spoken_cleaned = clean_text(spoken)

    if spoken_cleaned in correct_translation_cleaned:
        return jsonify({"result": "✅ To‘g‘ri!"})
    else:
        return jsonify({"result": f"❌ Noto‘g‘ri. To‘g‘ri javob: {correct_translation}"})
if __name__ == "__main__":
    app.run(debug=True)
