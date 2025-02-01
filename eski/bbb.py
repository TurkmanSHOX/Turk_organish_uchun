import json

# O'zgartirish qoidalari
char_map = {
    "ö": "o'",
    "ğ": "g'",
}

def correct_text(text):
    """Harflarni almashtirish va birinchi harfni katta qilish."""
    for old, new in char_map.items():
        text = text.replace(old, new)
    return text.capitalize()

def correct_json(obj):
    """Faqat `:` belgidan keyin keladigan qiymatlarni to'g'irlaydi."""
    if isinstance(obj, dict):
        return {k: correct_text(v) if isinstance(v, str) else correct_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [correct_json(item) for item in obj]
    return obj

# JSON faylni o'qish
with open("translations.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Xatolarni to'g'rilash
corrected_data = correct_json(data)

# Yangi JSON faylga yozish
with open("output.json", "w", encoding="utf-8") as f:
    json.dump(corrected_data, f, ensure_ascii=False, indent=4)

print("✅ Imlo xatolari to'g'irlandi va 'output.json' fayliga saqlandi.")
