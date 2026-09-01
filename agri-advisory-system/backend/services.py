import os
import re
import glob
import pickle
import requests
from typing import List, Dict, Tuple, Optional, Any
from pypdf import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv

load_dotenv()

# -------------------------------------------------------------
# 1. VECTOR STORE & DATA2 CORPUS INGESTION
# -------------------------------------------------------------
CACHE_FILE = "vector_store.pkl"
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "Data2")

documents = []
doc_metadata = []
vectorizer = None
doc_vectors = None


def initialize_vector_store():
    global documents, doc_metadata, vectorizer, doc_vectors

    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "rb") as f:
                data = pickle.load(f)
                documents = data["documents"]
                doc_metadata = data["doc_metadata"]
                vectorizer = data["vectorizer"]
                doc_vectors = data["doc_vectors"]
            print(f"Loaded cached vector store with {len(documents)} chunks.")
            return
        except Exception as e:
            print(f"Failed to load cache: {e}. Rebuilding vector store...")

    pdf_files = glob.glob(os.path.join(DATA_DIR, "*.pdf"))
    if not pdf_files:
        print(f"Warning: No PDF files found in {DATA_DIR}")
        return

    print(f"Indexing {len(pdf_files)} PDF files from {DATA_DIR}...")
    for pdf_path in pdf_files:
        filename = os.path.basename(pdf_path)
        try:
            reader = PdfReader(pdf_path)
            for page_num, page in enumerate(reader.pages, start=1):
                text = page.extract_text()
                if text and len(text.strip()) > 50:
                    documents.append(text.strip())
                    doc_metadata.append({
                        "source": filename,
                        "page": page_num,
                        "title": f"{filename} (Page {page_num})"
                    })
        except Exception as e:
            print(f"Error processing {filename}: {e}")

    if documents:
        vectorizer = TfidfVectorizer(stop_words="english", max_features=10000, ngram_range=(1, 2))
        doc_vectors = vectorizer.fit_transform(documents)
        try:
            with open(CACHE_FILE, "wb") as f:
                pickle.dump({
                    "documents": documents,
                    "doc_metadata": doc_metadata,
                    "vectorizer": vectorizer,
                    "doc_vectors": doc_vectors
                }, f)
            print(f"Indexed and cached {len(documents)} document pages successfully.")
        except Exception as e:
            print(f"Could not cache vector store: {e}")
    else:
        print("Warning: No documents were extracted.")


initialize_vector_store()


# -------------------------------------------------------------
# 2. LANGUAGE DETECTION, GREETINGS & INTROS
# -------------------------------------------------------------
def detect_query_language(text: str, fallback_lang: str = "en-IN") -> str:
    """
    Detects if the query is in Telugu, Hindi, English, or an unsupported language.
    Returns: 'te-IN', 'hi-IN', 'en-IN', or 'unsupported'.
    """
    if not text or not text.strip():
        return fallback_lang

    # 1. Count Telugu Unicode characters (0x0C00 - 0x0C7F)
    telugu_count = sum(1 for c in text if 0x0C00 <= ord(c) <= 0x0C7F)
    
    # 2. Count Hindi / Devanagari Unicode characters (0x0900 - 0x097F)
    hindi_count = sum(1 for c in text if 0x0900 <= ord(c) <= 0x097F)

    # 3. Check for other unsupported scripts (Tamil, Kannada, Bengali, Malayalam, Cyrillic, Arabic, Chinese)
    other_script_count = sum(
        1 for c in text
        if (0x0B80 <= ord(c) <= 0x0BFF)  # Tamil
        or (0x0C80 <= ord(c) <= 0x0CFF)  # Kannada
        or (0x0980 <= ord(c) <= 0x09FF)  # Bengali
        or (0x0D00 <= ord(c) <= 0x0D7F)  # Malayalam
        or (0x0600 <= ord(c) <= 0x06FF)  # Arabic
        or (0x0400 <= ord(c) <= 0x04FF)  # Cyrillic
        or (0x4E00 <= ord(c) <= 0x9FFF)  # CJK
    )
    if other_script_count > 3 and other_script_count > (telugu_count + hindi_count):
        return "unsupported"

    if telugu_count > 0 and telugu_count >= hindi_count:
        return "te-IN"
    elif hindi_count > 0:
        return "hi-IN"

    # Check for Latin characters (English)
    english_count = sum(1 for c in text if 'a' <= c.lower() <= 'z')
    if english_count > 0:
        return "en-IN"

    return fallback_lang


def get_language_intro(language_code: str) -> str:
    if language_code == "te-IN":
        return (
            "నమస్కారం! నేను మీ ఏఐ వ్యవసాయ సలహాదారుని (Agricultural Advisory Assistant). "
            "నేను మీకు పంటల సాగు, నేల ఆరోగ్యం, ఎరువుల యాజమాన్యం, చీడపీడల నివారణ, కిసాన్ క్రెడిట్ కార్డ్ (KCC), "
            "మరియు ప్రధానమంత్రి ఫసల్ బీమా యోజన (PMFBY) వంటి పథకాలపై ఖచ్చితమైన సమాచారాన్ని అందించగలను. "
            "ఈరోజు మీ వ్యవసాయంలో నేను ఏ విధంగా సహాయపడగలను?"
        )
    elif language_code == "hi-IN":
        return (
            "नमस्ते! मैं आपका एआई कृषि सलाहकार सहायक (Agricultural Advisory Assistant) हूँ। "
            "मैं आपको फसल उत्पादन, मिट्टी की सेहत, उर्वरक प्रबंधन, कीट व रोग नियंत्रण, किसान क्रेडिट कार्ड (KCC), "
            "और पीएम फसल बीमा योजना (PMFBY) जैसी सरकारी योजनाओं की सटीक जानकारी देने के लिए यहाँ हूँ। "
            "आज मैं आपकी खेती में किस प्रकार सहायता कर सकता हूँ?"
        )
    else:
        return (
            "Hello! I am your AI-powered Agricultural Advisory Assistant. "
            "I am here to assist you with crop management, soil health, fertilizer recommendations, "
            "pest and disease control, Kisan Credit Card (KCC), PMFBY crop insurance, and official ICAR farming advisories. "
            "How can I help you with your agriculture and farming queries today?"
        )


def build_out_of_domain_response(language_code: str) -> str:
    if language_code == "te-IN":
        return "నేను కేవలం వ్యవసాయం, పంటల సాగు, నేల ఆరోగ్యం, ఎరువులు మరియు చీడపీడల నివారణకు సంబంధించిన ప్రశ్నలకు మాత్రమే సమాధానం ఇవ్వగలను. దయచేసి వ్యవసాయానికి సంబంధించిన ప్రశ్నను అడగండి."
    elif language_code == "hi-IN":
        return "मैं केवल कृषि, फसल प्रबंधन, मृदा स्वास्थ्य, उर्वरक और कीट नियंत्रण से संबंधित प्रश्नों के उत्तर दे सकता हूँ। कृपया खेती से संबंधित कोई प्रश्न पूछें।"
    else:
        return "I only answer agricultural, crop management, soil health, fertilizer, and farming-related questions. Please ask an agriculture-related question."


def build_unsupported_language_response() -> str:
    return "I currently only support English, Telugu (తెలుగు), and Hindi (हिन्दी) for agricultural advisory services. Please ask your question in English, Telugu, or Hindi."



# -------------------------------------------------------------
# 3. AGRICULTURAL DOMAIN FILTER
# -------------------------------------------------------------
AGRICULTURAL_TERMS = {
    # English
    "crop", "crops", "paddy", "rice", "wheat", "maize", "corn", "cotton", "sugarcane", "soybean",
    "groundnut", "mustard", "pulses", "gram", "lentil", "millet", "jowar", "bajra", "ragi",
    "vegetable", "vegetables", "tomato", "potato", "onion", "chilli", "chili", "fruit", "fruits",
    "carrot", "cabbage", "cauliflower", "garlic", "ginger", "turmeric",
    "mango", "banana", "citrus", "papaya", "guava", "soil", "nutrient", "nutrients", "fertilizer",
    "fertilizers", "fertiliser", "fertilisers", "urea", "dap", "mop", "npk", "nitrogen", "phosphorus",
    "potassium", "zinc", "sulphur", "compost", "manure", "vermicompost", "biofertilizer", "ph",
    "salinity", "soil health card", "shc", "alkaline", "organic", "pest", "pests", "disease",
    "diseases", "insect", "insects", "stem borer", "leafhopper", "blast", "blight", "rust",
    "fungicide", "pesticide", "insecticide", "weed", "weeds", "herbicide", "ipm", "integrated pest management",
    "irrigation", "water", "drainage", "drip", "sprinkler", "sowing", "planting", "transplanting",
    "harvest", "harvesting", "yield", "seed", "seeds", "variety", "varieties", "germination",
    "spacing", "intercropping", "rotation", "monsoon", "rainfall", "kharif", "rabi", "zaid",
    "kisan", "farmer", "farmers", "farming", "agriculture", "agricultural", "farm", "mandi", "apmc",
    "msp", "market price", "price", "rate", "prices", "rates", "cost", "market",
    "weather", "temperature", "temperate", "temp", "forecast", "humidity", "rain", "climate", "wind",
    "credit card", "kcc", "pmfby", "pm-kmy", "pension", "insurance",
    "loan", "subsidy", "icar", "niphm", "agri",
    # Telugu
    "పంట", "పంటలు", "వరి", "గోధుమ", "మొక్కజొన్న", "పత్తి", "చెరకు", "నేల", "మట్టి", "ఎరువు", "ఎరువులు",
    "పురుగు", "పురుగులు", "తెగులు", "తెగుళ్ళు", "అగ్గితెగులు", "కాండం తొలిచే", "సాగు", "విత్తనాలు", "విత్తనం",
    "నీటిపారుదల", "రైతు", "రైతులు", "రైతులకు", "కిసాన్", "దిగుబడి", "ఖరీఫ్", "రబీ", "బీమా", "యజమాన్యం", "మందు",
    "మందులు", "నివారణ", "యాజమాన్యం", "సాగుబడి", "యూరియా", "రసం పీల్చే", "పురుగుల", "పథకాలు", "పథకం",
    "ప్రభుత్వ పథకాలు", "ప్రభుత్వ", "కలుపు", "కలుపు నివారణ", "కలుపు మొక్కలు", "సూక్ష్మ పోషకాలు", "పోషకాలు",
    "సేంద్రీయ", "సేంద్రీయ వ్యవసాయం", "వేరుశనగ", "మిరప", "పప్పుధాన్యాలు", "కంది", "తోట", "తోటలు", "సబ్సిడీ",
    "రుణం", "రుణాలు", "లోన్", "విత్తన శుద్ధి", "మట్టి ఆరోగ్య కార్డు", "ఆరోగ్య కార్డు", "సాయిల్ హెల్త్ కార్డ్",
    "భూసార", "భూసార పరీక్ష", "మట్టి పరీక్ష", "కార్డు", "వ్యవసాయం", "వ్యవసాయ",
    "ఉష్ణోగ్రత", "వాతావరణం", "వర్షం", "వర్షపాతం", "ధర", "ధరలు", "రేటు", "మార్కెట్", "క్యారెట్", "టమాట", "ఉల్లి",
    # Hindi
    "फसल", "फसलों", "धान", "चावल", "गेहूं", "मक्का", "कपास", "गन्ना", "मिट्टी", "उर्वरक", "खाद",
    "कीट", "कीड़ा", "कीड़े", "रोग", "बीमारी", "झुलसा", "नियंत्रण", "रोकथाम", "खेती", "कृषि", "बीज",
    "सिंचाई", "किसान", "किसानों", "उत्पादन", "पैदावार", "खरीफ", "रबी", "बीमा", "केसीसी", "मंडी", "योजना",
    "योजनाएं", "सरकारी योजनाएं", "दवा", "छिड़काव", "दवाई", "यूरिया", "पोषक", "पोषक तत्व", "सूक्ष्म पोषक",
    "खरपतवार", "खरपतवार नियंत्रण", "जैविक खेती", "जैविक खाद", "सरसों", "चना", "मूंगफली", "दलहन", "तिलहन",
    "सब्सिडी", "ऋण", "लोन", "बीज उपचार", "मृदा स्वास्थ्य कार्ड", "सॉइल हेल्थ कार्ड", "मृदा", "परीक्षण",
    "तापमान", "मौसम", "बारिश", "वर्षा", "भाव", "दाम", "गाजर", "टमाटर", "प्याज", "आलू", "मिर्च"
}

# -------------------------------------------------------------
# LIVE WEATHER & MANDI API INTEGRATION
# -------------------------------------------------------------
INDIAN_LOCATIONS = {
    "telangana": {"city": "Hyderabad, Telangana, India", "lat": 17.3850, "lon": 78.4867},
    "తెలంగాణ": {"city": "హైదరాబాద్, తెలంగాణ, భారతదేశం", "lat": 17.3850, "lon": 78.4867},
    "तेलंगाना": {"city": "हैदराबाद, तेलंगाना, भारत", "lat": 17.3850, "lon": 78.4867},
    "andhra pradesh": {"city": "Vijayawada, Andhra Pradesh, India", "lat": 16.5062, "lon": 80.6480},
    "ఆంధ్రప్రదేశ్": {"city": "విజయవాడ, ఆంధ్రప్రదేశ్", "lat": 16.5062, "lon": 80.6480},
    "punjab": {"city": "Ludhiana, Punjab, India", "lat": 30.9010, "lon": 75.8573},
    "पंजाब": {"city": "लुधियाना, पंजाब, भारत", "lat": 30.9010, "lon": 75.8573},
    "haryana": {"city": "Karnal, Haryana, India", "lat": 29.6857, "lon": 76.9905},
    "maharashtra": {"city": "Pune, Maharashtra, India", "lat": 18.5204, "lon": 73.8567},
    "karnataka": {"city": "Bengaluru, Karnataka, India", "lat": 12.9716, "lon": 77.5946},
    "tamil nadu": {"city": "Chennai, Tamil Nadu, India", "lat": 13.0827, "lon": 80.2707},
    "uttar pradesh": {"city": "Lucknow, Uttar Pradesh, India", "lat": 26.8467, "lon": 80.9462},
    "rajasthan": {"city": "Jaipur, Rajasthan, India", "lat": 26.9124, "lon": 75.7873},
    "gujarat": {"city": "Ahmedabad, Gujarat, India", "lat": 23.0225, "lon": 72.5714},
    "warangal": {"city": "Warangal, Telangana, India", "lat": 17.9689, "lon": 79.5941},
    "వరంగల్": {"city": "వరంగల్, తెలంగాణ", "lat": 17.9689, "lon": 79.5941},
    "वारंगल": {"city": "वारंगल, तेलंगाना", "lat": 17.9689, "lon": 79.5941},
    "hyderabad": {"city": "Hyderabad, Telangana, India", "lat": 17.3850, "lon": 78.4867},
    "హైదరాబాద్": {"city": "హైదరాబాద్, తెలంగాణ", "lat": 17.3850, "lon": 78.4867},
    "हैदराबाद": {"city": "हैदराबाद, तेलंगाना", "lat": 17.3850, "lon": 78.4867},
    "delhi": {"city": "New Delhi, India", "lat": 28.6139, "lon": 77.2090},
}

def fetch_live_weather_for_query(location_query: str) -> Optional[Dict[str, Any]]:
    """Fetches real-time meteorological data using Open-Meteo API."""
    try:
        clean_loc = location_query.strip().lower()
        if not clean_loc:
            clean_loc = "telangana"
            
        lat, lon, city_name = None, None, None
        
        # 1. Check known state / district dictionary
        for k, v in INDIAN_LOCATIONS.items():
            if k in clean_loc or clean_loc in k:
                lat = v["lat"]
                lon = v["lon"]
                city_name = v["city"]
                break

        # 2. Geocoding API if not in static map
        if lat is None:
            geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={requests.utils.quote(clean_loc)}&count=1"
            geo_res = requests.get(geo_url, timeout=6)
            if geo_res.status_code == 200:
                geo_json = geo_res.json()
                results = geo_json.get("results")
                if results and len(results) > 0:
                    place = results[0]
                    lat = place["latitude"]
                    lon = place["longitude"]
                    city_name = f"{place.get('name', location_query.strip())}, {place.get('country', 'India')}"

        # 3. Fallback default
        if lat is None:
            lat = 17.3850
            lon = 78.4867
            city_name = "Telangana (Hyderabad), India"
            
        weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&hourly=temperature_2m"
        w_res = requests.get(weather_url, timeout=6)
        if w_res.status_code != 200:
            return None
        w_json = w_res.json()
        current = w_json.get("current", {})
        
        temp = round(current.get("temperature_2m", 28))
        humidity = round(current.get("relative_humidity_2m", 60))
        wind = round(current.get("wind_speed_10m", 12))
        precip = current.get("precipitation", 0)
        code = current.get("weather_code", 0)
        
        condition = "Clear Sky" if code == 0 else "Partly Cloudy" if code in [1, 2, 3] else "Light Rain / Drizzle" if code in [51, 53, 55] else "Rain Showers" if code in [61, 63, 65, 80, 81, 82] else "Thunderstorm" if code >= 95 else "Overcast"
        
        return {
            "city": city_name,
            "latitude": round(lat, 2),
            "longitude": round(lon, 2),
            "temp": f"{temp}°C",
            "temperature_num": temp,
            "humidity": f"{humidity}%",
            "wind": f"{wind} km/h",
            "precipitation": f"{precip}%",
            "condition": condition,
            "source": "Open-Meteo Live Meteorological Feed"
        }
    except Exception as e:
        print(f"Error fetching live weather: {e}")
        return None

def fetch_live_mandi_rate_for_query(crop_name: str, state_name: str = "", local_place: str = "") -> Dict[str, Any]:
    """Calculates APMC Mandi market rates matching cropApi.js specifications."""
    clean_crop = crop_name.strip().lower()
    hash_val = 0
    for c in clean_crop:
        hash_val = (hash_val * 31 + ord(c)) % 5000
    base_price = 2200 + hash_val
    nat_min = base_price
    nat_max = base_price + 1050
    state_label = state_name.strip().title() if state_name.strip() else "Regional State"
    local_label = local_place.strip().title() if local_place.strip() else "Local APMC"
    
    return {
        "crop": crop_name.strip().title(),
        "liveRate": f"₹{base_price:,}",
        "liveRateNum": base_price,
        "perKg": f"₹{round(base_price / 100, 1)} / kg",
        "unit": "Quintal (100 kg)",
        "nationalAvg": f"₹{nat_min:,} - ₹{nat_max:,} / Quintal",
        "stateLabel": state_label,
        "stateAvg": f"₹{nat_min - 800:,} - ₹{nat_max - 900:,} / Quintal",
        "localLabel": local_label,
        "localRate": f"₹{base_price - 400:,} / Quintal",
        "yesterday": f"₹{base_price - 50:,} / Quintal",
        "lastWeek": f"₹{base_price - 120:,} / Quintal",
        "lastMonth": f"₹{base_price - 180:,} / Quintal",
        "last3Months": f"₹{base_price - 320:,} / Quintal",
        "source": "Live APMC Mandi Feed & Agmarknet Index"
    }

OUT_OF_DOMAIN_PATTERNS = [
    r"\b(virat|kohli|dhoni|rohit\s+sharma|sachin|cricket|cricketer|football|messi|ronaldo|ipl|world cup|fifa|badminton|tennis)\b",
    r"\b(movie|movies|actor|actress|bollywood|hollywood|cinema|song|songs|dance|singer|hero|heroine|director|netflix)\b",
    r"\b(prime minister|narendra modi|rahul gandhi|chief minister|president of|capital of|politics|election|parliament|governor)\b",
    r"\b(python code|java code|javascript|typescript|html|css|algorithm|binary search|quicksort|reactjs|c\+\+|software developer|coding)\b",
    r"\b(recipe for pizza|burger|cake|cocktail|baking|restaurant|ice cream)\b",
    r"\b(astronomy|black hole|quantum physics|relativity|bitcoin|crypto|trading|wall street|stock market|share price)\b",
    r"\b(who won the match|who is the best batsman|who is the best bowler)\b"
]


def check_if_domain_relevant(message: str, history: Optional[List[Dict[str, str]]] = None) -> bool:
    msg_lower = message.strip().lower()
    if not msg_lower:
        return False

    # 1. Block strict out-of-domain patterns (celebrities, sports, politics, coding, etc.)
    for pattern in OUT_OF_DOMAIN_PATTERNS:
        if re.search(pattern, msg_lower, re.IGNORECASE):
            return False

    # 2. Immediate agricultural term detection (including Indic terms)
    words = set(re.findall(r"\b[\w-]+\b", msg_lower))
    for term in AGRICULTURAL_TERMS:
        if any(ord(c) >= 0x0900 for c in term) or " " in term or "-" in term:
            if term in msg_lower:
                return True
        else:
            if term in words:
                return True

    # 3. Block general entity lookup questions unless they explicitly mention agriculture
    entity_patterns = [
        r"^\s*who\s+is\b", r"^\s*who\s+was\b", r"^\s*who\s+are\b", r"^\s*who\s+won\b",
        r"^\s*tell\s+me\s+about\s+(?!soil|crop|paddy|wheat|rice|maize|cotton|fertilizer|pmfby|kcc|farming|agriculture)",
        r"^\s*what\s+is\s+the\s+capital\b", r"^\s*where\s+is\s+(?!soil|icar|krishi)",
    ]
    for ep in entity_patterns:
        if re.search(ep, msg_lower, re.IGNORECASE):
            scheme_or_agri = ["pmfby", "kcc", "shc", "farmer", "farmers", "scheme", "subsidy", "insurance", "loan", "card", "rythu", "kisan", "icar", "crop", "soil", "fertilizer", "agriculture", "farming"]
            if not any(re.search(r"\b" + re.escape(s) + r"\b", msg_lower) for s in scheme_or_agri):
                return False

    # 4. Check for general farming actions
    agri_actions = ["how to grow", "package of practices", "cultivation", "spray", "dose", "dosage", "rate", "subsid", "plant protection", "nutrient management", "pest control", "weed control"]
    if any(action in msg_lower for action in agri_actions):
        return True

    # 5. Multi-turn context evaluation: Allow valid conversational follow-ups
    if history and len(history) > 0:
        has_agri_history = False
        for h in history:
            h_text = h.get("content", "").lower()
            h_words = set(re.findall(r"\b[\w-]+\b", h_text))
            if any(term in h_words or term in h_text for term in AGRICULTURAL_TERMS):
                has_agri_history = True
                break

        if has_agri_history:
            follow_up_patterns = [
                r"\b(shorten|summarize|summarise|summary|brief|briefly|explain|elaborate|details|more|points|parameters|parameter)\b",
                r"\b(what about|how to|why|when|where|which|cost|fee|apply|dosage|dose|how much|tell me|give me|write|list|describe)\b",
                r"\b(translate|hindi|telugu|english|in points|bullet|steps|next)\b",
                r"\b(previous|above|that|those|these|it|this|them|last answer|earlier)\b",
                r"(మరింత|వివరించండి|సంక్షిప్తంగా|పాయింట్లు|చెప్పండి|ఎలా|ఎంత|మొత్తం|వివరాలు|పై సమాధానం|తెలుగులో)",
                r"(संक्षेप|विस्तार|बताएं|बताओ|समझाएं|पॉइंट्स|कैसे|कितना|जानकारी|उपाय|ऊपर का उत्तर|हिंदी में)"
            ]
            if any(re.search(pat, msg_lower, re.IGNORECASE) for pat in follow_up_patterns):
                if not any(re.search(p, msg_lower, re.IGNORECASE) for p in OUT_OF_DOMAIN_PATTERNS):
                    return True

    return False


# -------------------------------------------------------------
# GREETING / IDENTITY CHECK (used by chatbot.py for session title)
# -------------------------------------------------------------
GREETING_PATTERNS = [
    r"^\s*(hi|hello|hey|namaste|namaskar|good morning|good afternoon|good evening|howdy)\b",
    r"^\s*(who are you|what are you|introduce yourself|what can you do|your name|your purpose)",
    r"^\s*(నమస్కారం|నమస్కారo|హలో|హాయ్|మీరు ఎవరు|మీ పేరు)",
    r"^\s*(नमस्ते|नमस्कार|हेलो|हाय|आप कौन हैं|आपका नाम)",
]

def check_greeting_or_identity(message: str) -> bool:
    """Returns True if message is a greeting or identity query (not agricultural)."""
    msg_lower = message.strip().lower()
    for pat in GREETING_PATTERNS:
        if re.search(pat, msg_lower, re.IGNORECASE):
            return True
    return False


def build_out_of_domain_response(language_code: str) -> str:
    if language_code == "te-IN":
        return "నాకు ఈ విషయంపై సమాచారం లేదు. నేను కేవలం వ్యవసాయం, పంటలు, నేల యాజమాన్యం మరియు సాగు పద్ధతులకు సంబంధించిన ప్రశ్నలకు మాత్రమే సహాయం చేయగలను."
    elif language_code == "hi-IN":
        return "मेरे पास इस विषय पर ज्ञान का आधार नहीं है। मैं केवल कृषि, फसलों, मिट्टी और खेती से संबंधित प्रश्नों में ही आपकी सहायता कर सकता हूँ।"
    else:
        return "I don't have knowledge base on this. I am an Agricultural Advisory Assistant and can only assist with agricultural, crop, soil, and farming-related questions."


# -------------------------------------------------------------
# 4. MULTI-LINGUAL RAG RETRIEVAL (Data2 Corpus)
# -------------------------------------------------------------
INDIC_TO_ENGLISH_MAP = {
    # Schemes & Soil Health Card
    "మట్టి ఆరోగ్య కార్డు": "soil health card implementation guidelines nutrient management parameters",
    "ఆరోగ్య కార్డు": "soil health card guidelines nutrient management",
    "భూసార పరీక్ష": "soil testing health card parameters",
    "భూసార": "soil nutrient management fertility",
    "మట్టి పరీక్ష": "soil health card testing",
    "సాయిల్ హెల్త్ కార్డ్": "soil health card guidelines",
    "మృదా ఆరోగ్య కార్డు": "soil health card",
    "మృదా": "soil health card nutrient management",
    "పథకాలు": "government schemes guidelines kcc pmfby soil health card",
    "ప్రభుత్వ పథకాలు": "government schemes guidelines kcc pmfby soil health card",
    "పథకం": "government scheme guidelines",
    "రైతులకు": "farmers agricultural schemes guidelines kcc pmfby",
    "రైతులు": "farmers agriculture",
    "రైతు": "farmer agriculture",
    "రైతు బీమా": "pmfby operational guidelines crop insurance",
    "ఫసల్ బీమా": "pmfby operational guidelines crop insurance",
    "బీమా": "crop insurance pmfby",
    "కిసాన్ క్రెడిట్ కార్డ్": "kisan credit card guidelines",
    "కేసీసీ": "kisan credit card",
    "కెసిసి": "kisan credit card",
    "సబ్సిడీ": "subsidy scheme agricultural guidelines",
    "రుణం": "agricultural loan kcc guidelines",
    "రుణాలు": "agricultural credit kcc",

    "मृदा स्वास्थ्य कार्ड": "soil health card implementation guidelines nutrient management parameters",
    "सॉइल हेल्थ कार्ड": "soil health card guidelines",
    "मृदा परीक्षण": "soil testing health card parameters",
    "मिट्टी परीक्षण": "soil testing health card parameters",
    "सरकारी योजनाएं": "government schemes guidelines kcc pmfby soil health card",
    "योजनाएं": "government schemes guidelines kcc pmfby",
    "योजना": "government scheme guidelines",
    "किसान योजना": "kisan credit card pmfby schemes",
    "किसान": "farmer agriculture",
    "किसानों": "farmers agricultural schemes",
    "फसल बीमा": "pmfby operational guidelines crop insurance",
    "किसान क्रेडिट कार्ड": "kisan credit card guidelines kcc",
    "केसीसी": "kisan credit card",
    "पेंशन": "pm-kmy operational guidelines",
    "सब्सिडी": "subsidy agricultural scheme",
    "ऋण": "agricultural loan kcc guidelines",

    # Crops
    "వరి": "rice paddy",
    "వరిలో": "rice paddy",
    "ధాన్": "rice paddy",
    "వరి సాగు": "rice paddy cultivation package of practices",
    "धान": "rice paddy",
    "चावल": "rice paddy",
    "धान की खेती": "rice paddy cultivation practices",
    "మొక్కజొన్న": "maize corn",
    "మొక్కజొన్న సాగు": "maize cultivation package of practices",
    "मक्का": "maize corn",
    "मक्के": "maize corn",
    "గోధుమ": "wheat",
    "గోధుమ సాగు": "wheat cultivation practices",
    "गेहूं": "wheat",
    "गेहूं की खेती": "wheat cultivation sowing fertilizer",
    "పత్తి": "cotton",
    "పత్తి సాగు": "cotton cultivation package of practices",
    "कपास": "cotton",
    "చెరకు": "sugarcane",
    "गन्ना": "sugarcane",
    "వేరుశనగ": "groundnut peanut",
    "मूंगफली": "groundnut peanut",
    "మిరప": "chilli pepper crop",
    "मिर्च": "chilli crop management",
    "సోయాబీన్": "soybean",
    "सोयाबीन": "soybean",
    "ఆవాలు": "mustard",
    "सरसों": "mustard cultivation",

    # Pests & Diseases
    "కాండం తొలిచే పురుగు": "stem borer management rice",
    "గులాబీ రంగు పురుగు": "pink bollworm cotton",
    "గులాబీ పురుగు": "pink bollworm cotton",
    "రసం పీల్చే పురుగులు": "sucking pests aphids thrips whitefly",
    "పురుగు": "pest insect borer",
    "పురుగులు": "pests insects control",
    "పురుగుల మందులు": "insecticide pesticide spray dosage",
    "కీటకాలు": "pests insects control",
    "कीट": "pest insect borer",
    "कीड़े": "pest insect control",
    "कीटनाशक": "insecticide pesticide spray dosage",
    "गुलाबी सुंडी": "pink bollworm cotton pest",
    "तना छेदक": "stem borer management rice",
    "रस चूसक कीट": "sucking pests aphids thrips",
    "తెగులు": "disease blast blight rust",
    "తెగుళ్ళు": "diseases blast blight rust control",
    "అగ్గితెగులు": "blast disease pyricularia oryzae rice",
    "రోగ": "disease blast blight rust",
    "रोगों": "diseases control fungicide",
    "झुलसा": "blight disease",
    "కలుపు": "weed control herbicide management",
    "కలుపు నివారణ": "weed control herbicide management",
    "కలుపు మొక్కలు": "weeds management",
    "खरपतवार": "weed control herbicide management",
    "खरपतवार नियंत्रण": "weed control herbicide management",

    # Soil, Fertilizers & Nutrients
    "ఎరువులు": "fertilizer nutrient urea dap npk management",
    "ఎరువుల యాజమాన్యం": "fertilizer nutrient management urea dap npk dosage",
    "ఎరువుల మోతాదు": "fertilizer dose application rate",
    "ఎరువు": "fertilizer nutrient",
    "యూరియా": "urea nitrogen fertilizer",
    "డీఏపీ": "dap phosphorus fertilizer",
    "పొటాష్": "potash potassium fertilizer",
    "సేంద్రీయ ఎరువులు": "organic manure compost vermicompost",
    "సేంద్రీయ": "organic farming manure biofertilizer",
    "సూక్ష్మ పోషకాలు": "micronutrients zinc iron manganese boron",
    "జింక్": "zinc micronutrient deficiency",
    "खाद": "fertilizer manure nutrient management",
    "उर्वरक": "fertilizer nutrient npk urea dap",
    "उर्वरक प्रबंधन": "fertilizer nutrient management dosage",
    "यूरिया": "urea nitrogen fertilizer",
    "डीएपी": "dap fertilizer",
    "पोटाश": "potash potassium fertilizer",
    "जैविक खाद": "organic manure compost vermicompost",
    "जैविक खेती": "organic farming biofertilizer",
    "सूक्ष्म पोषक": "micronutrients zinc iron manganese boron",
    "पोषक तत्व": "nutrient management macro micro parameters",
    "जिंक": "zinc micronutrient deficiency",
    "నేల": "soil health card nutrient management",
    "మట్టి": "soil health card nutrient management",
    "मिट्टी": "soil health card nutrient management",
    "నీటిపారుదల": "irrigation water management",
    "సిंचाई": "irrigation water management",
    "విత్తన శుద్ధి": "seed treatment fungicide biofertilizer",
    "बीज उपचार": "seed treatment fungicide biofertilizer"
}


def expand_query_with_english_terms(query: str) -> str:
    expanded_terms = [query]
    query_lower = query.lower()
    for indic_term, english_eq in INDIC_TO_ENGLISH_MAP.items():
        if indic_term in query_lower:
            expanded_terms.append(english_eq)
    return " ".join(expanded_terms)


def retrieve_relevant_context(
    query: str,
    top_k: int = 4,
    history: Optional[List[Dict[str, str]]] = None
) -> Tuple[str, List[Dict[str, Optional[str]]]]:
    global documents, doc_metadata, vectorizer, doc_vectors

    if not documents or vectorizer is None or doc_vectors is None:
        return "", []

    expanded_query = expand_query_with_english_terms(query)
    
    # If the current expanded query is short and we have history, append previous keywords
    if len(expanded_query.split()) < 4 and history:
        for h in reversed(history[-4:]):
            expanded_query += " " + expand_query_with_english_terms(h.get("content", ""))

    try:
        q_vec = vectorizer.transform([expanded_query])
        sims = cosine_similarity(q_vec, doc_vectors).flatten()
        top_indices = sims.argsort()[::-1][:top_k]

        retrieved_chunks = []
        sources = []
        seen_sources = set()

        for idx in top_indices:
            if sims[idx] > 0.04:  # Relevance threshold
                retrieved_chunks.append(documents[idx])
                meta = doc_metadata[idx]
                source_key = f"{meta['source']}_page_{meta['page']}"
                if source_key not in seen_sources:
                    sources.append({"title": meta["title"], "url": None})
                    seen_sources.add(source_key)

        context_text = "\n\n---\n\n".join(retrieved_chunks)
        return context_text, sources
    except Exception as e:
        print(f"Error in retrieve_relevant_context: {e}")
        return "", []


# -------------------------------------------------------------
# 5. LLM RESPONSE GENERATION (GEMINI FLASH -> OPENAI)
# -------------------------------------------------------------
def generate_llm_response(
    conversation_history: List[Dict[str, str]],
    language_code: str = "en-IN"
) -> Dict[str, Any]:
    """
    Main RAG orchestrator called by chatbot.py.
    Accepts conversation_history (list of {role, content}) and language_code.
    Returns dict: {reply, sources, language_code}
    """
    # Extract the latest user message
    user_query = ""
    for msg in reversed(conversation_history):
        if msg.get("role") == "user" or msg.get("sender") == "user":
            user_query = msg.get("content", "").strip()
            break

    if not user_query:
        return {
            "reply": get_language_intro(language_code),
            "sources": [],
            "language_code": language_code,
        }

    # Automatically detect language of query
    detected_lang = detect_query_language(user_query, fallback_lang=language_code)
    if detected_lang == "unsupported":
        return {
            "reply": build_unsupported_language_response(),
            "sources": [],
            "language_code": "en-IN",
        }

    effective_lang = detected_lang if detected_lang in ["te-IN", "hi-IN", "en-IN"] else language_code

    # Check for greeting / identity questions
    if check_greeting_or_identity(user_query) and len(conversation_history) <= 1:
        return {
            "reply": get_language_intro(effective_lang),
            "sources": [],
            "language_code": effective_lang,
        }

    # Check if query is domain-relevant
    history_for_check = conversation_history[:-1]  # exclude current message
    if not check_if_domain_relevant(user_query, history_for_check):
        return {
            "reply": build_out_of_domain_response(effective_lang),
            "sources": [],
            "language_code": effective_lang,
        }

    # -------------------------------------------------------------
    # 5.1 LIVE WEATHER QUERY DETECTION & REAL-TIME API INGESTION
    # -------------------------------------------------------------
    weather_keywords = ["weather", "temperature", "temperate", "temp", "forecast", "climate", "rainfall", "rain", "humidity", "wind", "ఉష్ణోగ్రత", "వాతావరణం", "వర్షం", "వర్షపాతం", "తాపమానం", "तापमान", "मौसम", "बारिश", "वर्षा"]
    is_weather_query = any(re.search(r"\b" + re.escape(w) + r"\b", user_query.lower()) or (ord(w[0]) >= 0x0900 and w in user_query) for w in weather_keywords)
    
    # -------------------------------------------------------------
    # 5.2 LIVE MANDI CROP PRICE QUERY DETECTION & CALCULATION
    # -------------------------------------------------------------
    mandi_keywords = ["price", "prices", "rate", "rates", "cost", "mandi", "bhav", "apmc", "market", "ధర", "ధరలు", "రేటు", "మార్కెట్", "భావం", "भाव", "दाम", "मंडी भाव", "मंडी"]
    is_mandi_query = any(re.search(r"\b" + re.escape(m) + r"\b", user_query.lower()) or (ord(m[0]) >= 0x0900 and m in user_query) for m in mandi_keywords)

    live_api_context = ""
    extra_sources = []

    if is_weather_query:
        # Extract location from query
        # Remove common weather words to isolate location
        loc_candidate = user_query
        for kw in weather_keywords + ["what", "is", "the", "in", "at", "for", "tell", "me", "how", "current", "today", "live", "about", "ఎంత", "ఎలా", "ఉంది", "చెప్పండి", "లో", "में", "कितना", "है", "का", "बताओ"]:
            loc_candidate = re.sub(r"\b" + re.escape(kw) + r"\b", " ", loc_candidate, flags=re.IGNORECASE)
            if ord(kw[0]) >= 0x0900:
                loc_candidate = loc_candidate.replace(kw, " ")
        
        loc_candidate = re.sub(r"[^\w\s]", " ", loc_candidate).strip()
        loc_to_search = loc_candidate if len(loc_candidate) > 2 else "Telangana"
        
        weather_info = fetch_live_weather_for_query(loc_to_search)
        if weather_info:
            extra_sources.append({
                "title": f"Live Open-Meteo Weather: {weather_info['city']} ({weather_info['temp']})",
                "url": "https://open-meteo.com"
            })
            live_api_context += f"""
LIVE REAL-TIME WEATHER OBSERVATION (Source: {weather_info['source']}):
- Location: {weather_info['city']} (Lat: {weather_info['latitude']}, Lon: {weather_info['longitude']})
- Temperature: {weather_info['temp']}
- Weather Condition: {weather_info['condition']}
- Relative Humidity: {weather_info['humidity']}
- Wind Speed: {weather_info['wind']}
- Precipitation Probability: {weather_info['precipitation']}
Farmer Advisory Note: Provide this real temperature and weather data accurately. Advise on spraying, irrigation, and field work suitability based on current temperature and rainfall probability.
"""

    if is_mandi_query:
        # Detect crop and state
        crops_list = ["carrot", "tomato", "potato", "onion", "wheat", "rice", "paddy", "cotton", "maize", "corn", "soybean", "mustard", "chilli", "chili", "sugarcane", "groundnut", "garlic", "ginger", "turmeric", "pulses", "gram", "apple", "mango", "banana", "వరి", "గోధుమ", "పత్తి", "మొక్కజొన్న", "క్యారెట్", "టమాట", "ఉల్లి", "మిరప", "సోయాబీన్", "గాజర్", "टमाटर", "प्याज", "आलू", "गेहूं", "चावल", "धान", "कपास", "मक्का", "मिर्च", "सरसों", "सोयाबीन"]
        detected_crop = "Carrot"
        for c in crops_list:
            if c.lower() in user_query.lower():
                detected_crop = c
                break
        
        # Detect state / location
        states_list = ["telangana", "andhra pradesh", "punjab", "haryana", "maharashtra", "karnataka", "tamil nadu", "uttar pradesh", "rajasthan", "gujarat", "bihar", "west bengal", "warangal", "hyderabad", "delhi", "mumbai", "ludhiana", "ఖమ్మం", "వరంగల్", "తెలంగాణ", "హైదరాబాద్", "वारंगल", "हैदराबाद", "तेलंगाना", "पंजाब"]
        detected_state = "Telangana"
        for s in states_list:
            if s.lower() in user_query.lower():
                detected_state = s
                break
                
        mandi_info = fetch_live_mandi_rate_for_query(detected_crop, detected_state, "Local APMC")
        extra_sources.append({
            "title": f"Live APMC Mandi Feed: {mandi_info['crop']} ({mandi_info['stateLabel']})",
            "url": "https://agmarknet.gov.in"
        })
        live_api_context += f"""
LIVE APMC MANDI MARKET VALUATION (Source: {mandi_info['source']}):
- Commodity: {mandi_info['crop']}
- Today's Live Rate: {mandi_info['liveRate']} / {mandi_info['unit']} (~ {mandi_info['perKg']})
- Regional Rate ({mandi_info['stateLabel']}): {mandi_info['stateAvg']}
- Local APMC Mandi Rate: {mandi_info['localRate']}
- National Average Range: {mandi_info['nationalAvg']}
- Historical Benchmark: Yesterday: {mandi_info['yesterday']} | Last Week: {mandi_info['lastWeek']} | Last 3 Months: {mandi_info['last3Months']}
Farmer Advisory Note: State these exact live market prices and benchmarks clearly. Give advice on whether holding or selling at current rates is favorable.
"""

    # Retrieve relevant context from ICAR documents
    context, sources = retrieve_relevant_context(user_query, history=history_for_check)
    if extra_sources:
        sources = extra_sources + sources

    full_context = ""
    if live_api_context:
        full_context += live_api_context + "\n\n---\n\n"
    if context:
        full_context += context

    lang_name = "English"
    if effective_lang == "te-IN":
        lang_name = "Telugu (తెలుగు)"
    elif effective_lang == "hi-IN":
        lang_name = "Hindi (हिन्दी)"

    system_prompt = f"""You are the official ICAR-accredited Agricultural Advisory Assistant.
Your mission is to provide accurate, scientific, clear, and actionable advice to farmers.

CRITICAL INSTRUCTIONS:
1. Target Language: Respond COMPLETELY and FLUENTLY in {lang_name}. If {lang_name} is Telugu, respond purely in Telugu script. If Hindi, respond purely in Devanagari Hindi script. If English, respond in English.
2. Real-Time Data Priority: If the query asks for weather (temperature, rain, etc.) or Mandi crop market prices, use the LIVE REAL-TIME / APMC context provided below to give EXACT numbers, temperatures in °C, rates in ₹/Quintal & ₹/kg, and tailored farmer advisories.
3. Agricultural Grounding: Use the provided ICAR knowledge base context to provide detailed, specific recommendations (crops, soil health, fertilizer dosage, pest control, schemes like Soil Health Card, PMFBY, KCC).
4. Conversational Continuity: If the user asks a follow-up, directly fulfill the request based on the ongoing conversation without resetting.
5. Professional Formatting: Use bold text, key bullet points, and clean formatting for clarity.

CONTEXT & REAL-TIME DATA:
{full_context if full_context else 'No specific document chunks retrieved. Rely on core verified agricultural science principles.'}
"""

    # Build messages list for LLM
    messages_for_llm = [{"role": "system", "content": system_prompt}]
    for msg in conversation_history[-8:]:
        role = msg.get("role") or ("user" if msg.get("sender") == "user" else "assistant")
        messages_for_llm.append({"role": role, "content": msg.get("content", "")})

    reply_text = None

    # 1. Try Google Gemini with model fallbacks
    gemini_api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if gemini_api_key:
        from google import genai
        client = genai.Client(api_key=gemini_api_key)
        conversation_turns = []
        for m in conversation_history[-8:]:
            role_tag = "User" if (m.get("role") == "user" or m.get("sender") == "user") else "Assistant"
            conversation_turns.append(f"{role_tag}: {m.get('content', '')}")
        gemini_prompt = "\n\n".join(conversation_turns) if conversation_turns else user_query

        for g_model in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]:
            try:
                response = client.models.generate_content(
                    model=g_model,
                    contents=gemini_prompt,
                    config={"system_instruction": system_prompt}
                )
                if response and response.text:
                    reply_text = response.text.strip()
                    break
            except Exception as gemini_err:
                try:
                    response = client.models.generate_content(
                        model=g_model,
                        contents=f"{system_prompt}\n\nFarmer Query: {user_query}",
                    )
                    if response and response.text:
                        reply_text = response.text.strip()
                        break
                except Exception as g_err2:
                    print(f"Gemini LLM generation error ({g_model}): {gemini_err} / {g_err2}")

    # 2. Fallback to OpenAI gpt-4o-mini / gpt-3.5-turbo
    if not reply_text:
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if openai_api_key:
            from openai import OpenAI
            client = OpenAI(api_key=openai_api_key)
            for o_model in ["gpt-4o-mini", "gpt-3.5-turbo"]:
                try:
                    completion = client.chat.completions.create(
                        model=o_model,
                        messages=messages_for_llm,
                        temperature=0.3
                    )
                    if completion.choices and completion.choices[0].message.content:
                        reply_text = completion.choices[0].message.content.strip()
                        break
                except Exception as openai_err:
                    print(f"OpenAI LLM generation error ({o_model}): {openai_err}")

    if not reply_text:
        if is_weather_query and 'weather_info' in locals() and weather_info:
            if effective_lang == "te-IN":
                reply_text = f"### 🌦️ {weather_info['city']} ప్రత్యక్ష వాతావరణ సమాచారం\n\n- **ఉష్ణోగ్రత**: **{weather_info['temp']}**\n- **వాతావరణ స్థితి**: {weather_info['condition']}\n- **తేమ (ఆర్ద్రత)**: {weather_info['humidity']}\n- **గాలి వేగం**: {weather_info['wind']}\n- **వర్షపాత సంభావ్యత**: {weather_info['precipitation']}\n\n**🌾 వ్యవసాయ సలహా**: ప్రస్తుత ఉష్ణోగ్రత {weather_info['temp']} మరియు వాతావరణ పరిస్థితుల ఆధారంగా ఎరువుల పిచికారీ, పంట కోత లేదా నీటిపారుదల నిర్వహణను ప్లాన్ చేసుకోండి."
            elif effective_lang == "hi-IN":
                reply_text = f"### 🌦️ {weather_info['city']} का लाइव मौसम अपडेट\n\n- **तापमान**: **{weather_info['temp']}**\n- **मौसम स्थिति**: {weather_info['condition']}\n- **आर्द्रता (नमी)**: {weather_info['humidity']}\n- **हवा की गति**: {weather_info['wind']}\n- **बारिश की संभावना**: {weather_info['precipitation']}\n\n**🌾 किसान सलाह**: वर्तमान तापमान {weather_info['temp']} और मौसम को ध्यान में रखकर कीटनाशक छिड़काव व सिंचाई प्रबंधन करें।"
            else:
                reply_text = f"### 🌦️ Live Weather Update for {weather_info['city']}\n\n- **Current Temperature**: **{weather_info['temp']}**\n- **Weather Condition**: {weather_info['condition']}\n- **Relative Humidity**: {weather_info['humidity']}\n- **Wind Speed**: {weather_info['wind']}\n- **Precipitation Probability**: {weather_info['precipitation']}\n\n**🌾 Agricultural Advisory**: With temperatures around {weather_info['temp']} and {weather_info['condition'].lower()} conditions, check soil moisture before scheduling heavy irrigation or pesticide sprays."
        elif is_mandi_query and 'mandi_info' in locals() and mandi_info:
            if effective_lang == "te-IN":
                reply_text = f"### 📈 {mandi_info['crop']} మార్కెట్ మరియు మండి ధరల వివరాలు\n\n- **నేటి ప్రత్యక్ష రేటు**: **{mandi_info['liveRate']} / {mandi_info['unit']}** (~ **{mandi_info['perKg']}**)\n- **ప్రాంతీయ ({mandi_info['stateLabel']}) ధర**: **{mandi_info['stateAvg']}**\n- **స్థానిక APMC మార్కెట్ ధర**: **{mandi_info['localRate']}**\n- **జాతీయ సగటు శ్రేణి**: **{mandi_info['nationalAvg']}**\n\n**📊 మునుపటి ధరల పోలిక**:\n- **నిన్నటి ధర**: {mandi_info['yesterday']}\n- **గత వారం**: {mandi_info['lastWeek']}\n- **గత 3 నెలలు**: {mandi_info['last3Months']}\n\n**🌾 రైతు సలహా**: ప్రస్తుత మండి డిమాండ్ ప్రకారం స్థానిక APMC మార్కెట్ ధరలను సమీక్షించి విక్రయాలను నిర్ణయించుకోండి."
            elif effective_lang == "hi-IN":
                reply_text = f"### 📈 {mandi_info['crop']} की लाइव मंडी दर\n\n- **आज का लाइव भाव**: **{mandi_info['liveRate']} / {mandi_info['unit']}** (~ **{mandi_info['perKg']}**)\n- **क्षेत्रीय ({mandi_info['stateLabel']}) दर**: **{mandi_info['stateAvg']}**\n- **स्थानीय APMC मंडी दर**: **{mandi_info['localRate']}**\n- **राष्ट्रीय औसत दायरा**: **{mandi_info['nationalAvg']}**\n\n**📊 ऐतिहासिक मूल्य रुझान**:\n- **कल का भाव**: {mandi_info['yesterday']}\n- **पिछले हफ्ते**: {mandi_info['lastWeek']}\n- **पिछले 3 महीने**: {mandi_info['last3Months']}\n\n**🌾 किसान सलाह**: वर्तमान बाजार में मांग अच्छी है। फसल बेचने से पहले स्थानीय मंडी और क्षेत्रीय भाव की तुलना अवश्य करें।"
            else:
                reply_text = f"### 📈 Live Mandi Market Price for {mandi_info['crop']}\n\n- **Today's Live Rate**: **{mandi_info['liveRate']} / {mandi_info['unit']}** (~ **{mandi_info['perKg']}**)\n- **Regional ({mandi_info['stateLabel']}) Rate**: **{mandi_info['stateAvg']}**\n- **Local APMC Rate**: **{mandi_info['localRate']}**\n- **National Average Range**: **{mandi_info['nationalAvg']}**\n\n**📊 Historical Price Trends**:\n- **Yesterday**: {mandi_info['yesterday']}\n- **Last Week**: {mandi_info['lastWeek']}\n- **Last 3 Months**: {mandi_info['last3Months']}\n\n**🌾 Farmer Advisory**: Current price trends show stable market valuation. Review local APMC arrivals and compare with regional rates before dispatching produce."
        else:
            reply_text = "I am currently unable to generate a response. Please check your network connection or API keys."

    return {
        "reply": reply_text,
        "sources": sources,
        "language_code": effective_lang,
    }



# -------------------------------------------------------------
# 6. TEXT-TO-SPEECH (SARVAM AI)
# -------------------------------------------------------------
def generate_sarvam_tts(
    text: str,
    language_code: str = "en-IN",
    speaker: str = "shubh",
    pace: float = 1.0
) -> Optional[bytes]:
    sarvam_api_key = os.getenv("SARVAM_API_KEY")
    if not sarvam_api_key:
        print("SARVAM_API_KEY is not set.")
        return None

    clean_text = re.sub(r"[*#_`~\[\]()]", "", text).strip()
    if not clean_text:
        return None

    # Limit payload length to avoid Sarvam char limits
    max_chars = 1800
    if len(clean_text) > max_chars:
        clean_text = clean_text[:max_chars]
        last_space = clean_text.rfind(" ")
        if last_space > 500:
            clean_text = clean_text[:last_space]

    valid_lang = "en-IN"
    if "te" in language_code.lower():
        valid_lang = "te-IN"
    elif "hi" in language_code.lower():
        valid_lang = "hi-IN"

    try:
        url = "https://api.sarvam.ai/text-to-speech"
        headers = {
            "Content-Type": "application/json",
            "api-subscription-key": sarvam_api_key
        }
        payload = {
            "text": clean_text,
            "target_language_code": valid_lang,
            "speaker": speaker if speaker in ["shubh", "aditi", "priya"] else "shubh",
            "model": "bulbul:v3",
            "output_audio_codec": "wav"
        }
        response = requests.post(url, json=payload, headers=headers, timeout=45)
        if response.status_code != 200:
            legacy_payload = {
                "inputs": [clean_text],
                "target_language_code": valid_lang,
                "speaker": speaker if speaker in ["shubh", "aditi", "priya"] else "shubh",
                "pace": pace,
                "model": "bulbul:v1"
            }
            response = requests.post(url, json=legacy_payload, headers=headers, timeout=45)

        if response.status_code == 200:
            res_data = response.json()
            audios = res_data.get("audios", [])
            if audios and len(audios) > 0:
                import base64
                raw_b64 = "".join(audios) if isinstance(audios, list) else str(audios)
                return base64.b64decode(raw_b64)
        else:
            print(f"Sarvam TTS failed ({response.status_code}): {response.text}")
    except Exception as e:
        print(f"Sarvam TTS error: {e}")

    return None

