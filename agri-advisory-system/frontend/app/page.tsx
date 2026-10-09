'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sprout,
  Bot,
  Mic,
  TrendingUp,
  CloudSun,
  Languages,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Volume2,
  Send,
  Leaf,
  Droplets,
  Wind,
  Thermometer,
  Layers,
  MapPin,
  ExternalLink,
  Cpu
} from 'lucide-react';

// Static comprehensive multilingual content dictionaries
const I18N = {
  en: {
    navBrand: 'AgriAssist AI',
    navSubtitle: 'Agricultural Advisory System',
    navFeatures: 'Features',
    navDemo: 'Live Demo',
    navMandi: 'Mandi Rates',
    navWeather: 'Weather',
    navFaq: 'FAQ',
    signInNav: 'Sign In',
    signUpNav: 'Get Started',
    heroBadge: 'ICAR-Grounded • Multilingual RAG • Real-Time Mandi Feeds',
    heroTitlePrefix: 'Intelligent Advisory for',
    heroTitleHighlight: 'Every Indian Farmer',
    heroDescription:
      'Bridging agricultural science and field practice with conversational AI in English, हिंदी, and తెలుగు. Get real-time crop disease diagnosis, APMC mandi rates, voice assistance, and hyper-local weather alerts.',
    ctaPrimary: 'Launch Farmer Portal',
    ctaSecondary: 'Try Interactive Demo',
    statAccuracy: '98.4%',
    statAccuracyLabel: 'Advisory Accuracy',
    statMandis: '500+',
    statMandisLabel: 'APMC Mandis Tracked',
    statLanguages: '3 Native',
    statLanguagesLabel: 'Indian Languages',
    statCrops: '100+',
    statCropsLabel: 'Crop Diagnostic Guides',

    // Demo section
    demoBadge: 'Interactive RAG Advisor Preview',
    demoTitle: 'Experience Native Agricultural Intelligence',
    demoSubtitle: 'Select a query or ask your own question to see how our RAG engine synthesizes verified agronomy knowledge.',
    demoPlaceholder: 'Ask anything about crop pests, fertilizers, or mandi rates...',
    demoSend: 'Consult AI',
    demoVoiceButton: 'Voice Query',
    demoSourceLabel: 'Source Grounding',
    demoConfidenceLabel: 'Confidence Score',

    // Features
    featBadge: 'Core Architectural Capabilities',
    featTitle: 'Built for the Demands of Modern Agriculture',
    featSubtitle: 'End-to-end intelligence integrating generative AI with official agricultural datasets and sensor feeds.',
    feat1Title: 'Multilingual RAG Engine',
    feat1Desc: 'Zero hallucinations. Every response is retrieved from vetted ICAR guidelines, state agricultural university manuals, and scientific research.',
    feat2Title: 'Voice & Regional Dialect Support',
    feat2Desc: 'Designed for field conditions. Speak queries naturally using speech-to-text, and listen to synthesized audio playback in your language.',
    feat3Title: 'Live APMC Mandi Intelligence',
    feat3Desc: 'Real-time commodity wholesale pricing, historical volatility charts, and predictive selling windows across state markets.',
    feat4Title: 'Hyper-Local Weather Forecasts',
    feat4Desc: 'Coordinates-based micro-climate forecasts, 7-day rainfall probability, wind speed alerts, and pest outbreak weather correlation.',
    feat5Title: 'Nutrient & Soil Management',
    feat5Desc: 'Custom split-dose N-P-K fertilizer schedules, soil moisture monitoring, and organic IPM (Integrated Pest Management) alternatives.',
    feat6Title: 'Personalized Farmer Profile',
    feat6Desc: 'Save your specific crops, acreage, and village location to receive automatic seasonal advisories and harvest planning reminders.',

    // Showcase
    showcaseBadge: 'Real-Time Field Intelligence',
    showcaseTitle: 'Live Weather & Mandi Analytics Preview',
    showcaseSubtitle: 'Select your agricultural zone to inspect live meteorological metrics and regional wholesale rates.',

    // How it works
    howBadge: 'Simple Workflow',
    howTitle: 'How AgriAssist Works in the Field',
    howStep1Title: '1. Ask Your Way',
    howStep1Desc: 'Type or speak your query in English, Hindi, or Telugu via mobile or web.',
    howStep2Title: '2. RAG Semantic Match',
    howStep2Desc: 'Vector search retrieves authoritative agronomy literature matched to your crop and stage.',
    howStep3Title: '3. Actionable Advisory',
    howStep3Desc: 'Get precise chemical/organic dosages, current mandi price comparisons, and weather precautions.',

    // FAQ
    faqTitle: 'Frequently Asked Questions',
    faqSubtitle: 'Everything you need to know about AgriAssist AI and its data sources.',

    // CTA Bottom
    bottomCtaTitle: 'Ready to Transform Your Farming Decisions?',
    bottomCtaSubtitle: 'Join thousands of farmers making data-driven choices with verified agricultural intelligence.',
    bottomCtaButton: 'Create Free Farmer Account',

    // Footer
    footerDisclaimer: 'Disclaimer: AgriAssist advisories are generated using validated agricultural knowledge bases (ICAR & State Agricultural Universities). Always follow manufacturer pesticide label guidelines.',
    footerRights: 'All rights reserved.'
  },
  hi: {
    navBrand: 'कृषि-सहायक AI',
    navSubtitle: 'कृषि सलाहकार प्रणाली',
    navFeatures: 'विशेषताएं',
    navDemo: 'लाइव डेमो',
    navMandi: 'मंडी भाव',
    navWeather: 'मौसम',
    navFaq: 'प्रश्नोत्तरी',
    signInNav: 'साइन इन',
    signUpNav: 'शुरू करें',
    heroBadge: 'ICAR प्रमाणित • बहुभाषी RAG • लाइव मंडी दरें',
    heroTitlePrefix: 'हर भारतीय किसान के लिए',
    heroTitleHighlight: 'सटीक AI कृषि सलाह',
    heroDescription:
      'अंग्रेजी, हिंदी और तेलुगु में संवादात्मक AI के साथ आधुनिक कृषि विज्ञान और व्यावहारिक खेती का संगम। वास्तविक समय में फसल रोग निदान, APMC मंडी भाव और सटीक मौसम चेतावनी प्राप्त करें।',
    ctaPrimary: 'किसान पोर्टल शुरू करें',
    ctaSecondary: 'लाइव डेमो आजमाएं',
    statAccuracy: '98.4%',
    statAccuracyLabel: 'सलाह सटीकता',
    statMandis: '500+',
    statMandisLabel: 'मंडी बाजार शामिल',
    statLanguages: '3 प्रमुख',
    statLanguagesLabel: 'भारतीय भाषाएं',
    statCrops: '100+',
    statCropsLabel: 'फसल निदान गाइड',

    demoBadge: 'संवादात्मक RAG सलाहकार पूर्वावलोकन',
    demoTitle: 'मातृभाषा में डिजिटल कृषि अनुभव',
    demoSubtitle: 'नीचे दिए गए प्रश्न चुनें या स्वयं पूछें कि हमारा RAG इंजन किस प्रकार सटीक जानकारी प्रदान करता है।',
    demoPlaceholder: 'फसल कीट, उर्वरक या मंडी भाव के बारे में पूछें...',
    demoSend: 'सलाह लें',
    demoVoiceButton: 'आवाज से पूछें',
    demoSourceLabel: 'प्रमाणित स्रोत',
    demoConfidenceLabel: 'सटीकता स्कोर',

    featBadge: 'प्रमुख क्षमताएं',
    featTitle: 'आधुनिक भारतीय कृषि की आवश्यकताओं के अनुरूप',
    featSubtitle: 'आधिकारिक कृषि डेटा और मौसम पूर्वानुमान के साथ एकीकृत जनरेटिव AI।',
    feat1Title: 'बहुभाषी RAG इंजन',
    feat1Desc: 'बिना किसी भ्रामक जानकारी के। हर उत्तर ICAR दिशा-निर्देशों और कृषि विश्वविद्यालयों के प्रमाणित शोध पर आधारित है।',
    feat2Title: 'आवाज व क्षेत्रीय भाषा समर्थन',
    feat2Desc: 'खेत में काम करते हुए आसानी से माइक से प्रश्न बोलें और अपनी भाषा में ऑडियो उत्तर सुनें।',
    feat3Title: 'लाइव APMC मंडी भाव',
    feat3Desc: 'फसलों के दैनिक थोक भाव, मूल्य रुझान और सही समय पर बेचने की रणनीतिक जानकारी।',
    feat4Title: 'सटीक स्थानीय मौसम पूर्वानुमान',
    feat4Desc: 'स्थान आधारित तापमान, 7 दिनों की बारिश की संभावना और मौसम संबंधित कीट प्रकोप की पूर्व चेतावनी।',
    feat5Title: 'उर्वरक एवं मृदा प्रबंधन',
    feat5Desc: 'संतुलित N-P-K उर्वरक अनुसूची, जैविक कीटनाशक विकल्प और मिट्टी की उर्वरता बढ़ाने के उपाय।',
    feat6Title: 'व्यक्तिगत किसान प्रोफाइल',
    feat6Desc: 'अपनी फसलों और गांव को सहेजें ताकि आपको स्वचालित रूप से मौसमी सुझाव प्राप्त होते रहें।',

    showcaseBadge: 'लाइव क्षेत्रीय जानकारी',
    showcaseTitle: 'मौसम व मंडी भाव पूर्वावलोकन',
    showcaseSubtitle: 'मौसम मेट्रिक्स और थोक भाव देखने के लिए अपना कृषि क्षेत्र चुनें।',

    howBadge: 'सरल कार्यप्रणाली',
    howTitle: 'खेत में यह कैसे काम करता है?',
    howStep1Title: '1. प्रश्न पूछें',
    howStep1Desc: 'मोबाइल पर हिंदी, तेलुगु या अंग्रेजी में बोलकर या लिखकर सवाल करें।',
    howStep2Title: '2. वैज्ञानिक मिलान',
    howStep2Desc: 'वेक्टर सर्च तकनीक से ICAR के प्रमाणित वैज्ञानिक दस्तावेजों से समाधान खोजा जाता है।',
    howStep3Title: '3. सटीक मार्गदर्शन',
    howStep3Desc: 'दवा की सटीक मात्रा, निकटतम मंडी के भाव और मौसम संबंधित सावधानियां तुरंत पाएं।',

    faqTitle: 'अक्सर पूछे जाने वाले प्रश्न',
    faqSubtitle: 'कृषि-सहायक AI के बारे में महत्वपूर्ण सवालों के जवाब।',

    bottomCtaTitle: 'क्या आप अपनी खेती को स्मार्ट बनाने के लिए तैयार हैं?',
    bottomCtaSubtitle: 'प्रमाणित कृषि तकनीक के साथ हजारों किसान भाइयों से जुड़ें।',
    bottomCtaButton: 'निःशुल्क खाता बनाएं',

    footerDisclaimer: 'चेतावनी: सलाह ICAR वैज्ञानिक ज्ञानकोष पर आधारित है। कीटनाशक प्रयोग से पहले हमेशा लेबल निर्देश पढ़ें।',
    footerRights: 'सर्वाधिकार सुरक्षित।'
  },
  te: {
    navBrand: 'అగ్రి-అసిస్ట్ AI',
    navSubtitle: 'వ్యవసాయ సలహా వేదిక',
    navFeatures: 'ఫీచర్లు',
    navDemo: 'లైవ్ డెమో',
    navMandi: 'మార్కెట్ ధరలు',
    navWeather: 'వాతావరణం',
    navFaq: 'ప్రశ్నోత్తరాలు',
    signInNav: 'లాగిన్',
    signUpNav: 'ప్రారంభించండి',
    heroBadge: 'ICAR ప్రామాణికం • బహుభాషా RAG • లైవ్ మార్కెట్ రేట్లు',
    heroTitlePrefix: 'ప్రతి భారతీయ రైతు కోసం',
    heroTitleHighlight: 'తెలివైన AI వ్యవసాయ సలహా',
    heroDescription:
      'ఇంగ్లీష్, హిందీ మరియు తెలుగులో సంభాషణా AI ద్వారా శాస్త్రీయ వ్యవసాయ సలహాలు. నిజ సమయ పంట తెగుళ్ల నివారణ, APMC మార్కెట్ ధరలు, వాయిస్ అసిస్టెంట్ మరియు స్థానిక వాతావరణ హెచ్చరికలు పొందండి.',
    ctaPrimary: 'రైతు పోర్టల్ తెరవండి',
    ctaSecondary: 'డెమో ప్రయత్నించండి',
    statAccuracy: '98.4%',
    statAccuracyLabel: 'ఖచ్చితత్వ రేటు',
    statMandis: '500+',
    statMandisLabel: 'మార్కెట్ యార్డులు',
    statLanguages: '3 ప్రాంతీయ',
    statLanguagesLabel: 'భారతీయ భాషలు',
    statCrops: '100+',
    statCropsLabel: 'పంట నిర్ధారణ మార్గదర్శకాలు',

    demoBadge: 'ఇంటరాక్టివ్ RAG అడ్వైజర్ ప్రివ్యూ',
    demoTitle: 'మీ మాతృభాషలో ఆధునిక వ్యవసాయ జ్ఞానం',
    demoSubtitle: 'మా RAG ఇంజిన్ ఎలా పనిచేస్తుందో తెలుసుకోవడానికి క్రింది ప్రశ్నలను ఎంచుకోండి లేదా మీ ప్రశ్న అడగండి.',
    demoPlaceholder: 'పంట చీడపీడలు, ఎరువులు లేదా మార్కెట్ ధరల గురించి అడగండి...',
    demoSend: 'సలహా పొందండి',
    demoVoiceButton: 'వాయిస్ ద్వారా అడగండి',
    demoSourceLabel: 'ప్రామాణిక మూలం',
    demoConfidenceLabel: 'ఖచ్చితత్వ స్కోరు',

    featBadge: 'ప్రధాన సామర్థ్యాలు',
    featTitle: 'ఆధునిక వ్యవసాయ అవసరాల కోసం ప్రత్యేక రూపకల్పన',
    featSubtitle: 'అధికారిక వ్యవసాయ మార్గదర్శకాలు మరియు రియల్-టైమ్ సమాచారంతో పనిచేసే AI వ్యవస్థ.',
    feat1Title: 'బహుభాషా RAG ఇంజిన్',
    feat1Desc: 'ఏ తప్పుడు సమాచారం ఉండదు. ప్రతి సమాధానం ICAR మరియు వ్యవసాయ విశ్వవిద్యాలయాల ప్రామాణిక పత్రాల నుండి లభిస్తుంది.',
    feat2Title: 'వాయిస్ & ప్రాంతీయ భాషా మద్దతు',
    feat2Desc: 'పొలంలో ఉన్నప్పుడు వాయిస్ ద్వారా ప్రశ్నలు మాట్లాడండి మరియు మీ సొంత భాషలో ఆడియో సమాధానం వినండి.',
    feat3Title: 'లైవ్ మార్కెట్ యార్డ్ ధరలు',
    feat3Desc: 'వివిధ మార్కెట్లలో పంటల ప్రస్తుత హోల్‌సేల్ ధరలు మరియు లాభదాయక విక్రయ సూచనలు.',
    feat4Title: 'స్థానిక వాతావరణ సమాచారం',
    feat4Desc: 'మీ ప్రాంతపు 7 రోజుల వర్ష సూచన, గాలి వేగం మరియు వాతావరణ ఆధారిత తెగుళ్ల హెచ్చరికలు.',
    feat5Title: 'ఎరువులు & నేల యాజమాన్యం',
    feat5Desc: 'N-P-K ఎరువుల దశలవారీ వినియోగ పట్టిక మరియు సేంద్రీయ నివారణ మార్గాలు.',
    feat6Title: 'వ్యక్తిగత రైతు ప్రొఫైల్',
    feat6Desc: 'మీ పొలం, పంటల వివరాలు నమోదు చేసుకుని కాలానికి తగిన సూచనలు పొందండి.',

    showcaseBadge: 'క్షేత్రస్థాయి సమాచారం',
    showcaseTitle: 'వాతావరణం & మార్కెట్ ధరల ప్రివ్యూ',
    showcaseSubtitle: 'ప్రత్యక్ష వాతావరణం మరియు మార్కెట్ ధరల కోసం మీ ప్రాంతాన్ని ఎంచుకోండి.',

    howBadge: 'సులభమైన విధానం',
    howTitle: 'రైతులకు ఇది ఎలా ఉపయోగపడుతుంది?',
    howStep1Title: '1. మీ ప్రశ్న అడగండి',
    howStep1Desc: 'తెలుగు, హిందీ లేదా ఇంగ్లీషులో టైప్ చేయండి లేదా మాట్లాడండి.',
    howStep2Title: '2. శాస్త్రీయ శోధన',
    howStep2Desc: 'AI వ్యవస్థ ICAR అధికారిక పత్రాల నుండి సరైన పరిష్కారాన్ని గుర్తిస్తుంది.',
    howStep3Title: '3. ఆచరణాత్మక సలహా',
    howStep3Desc: 'సరైన మందు మోతాదు, మార్కెట్ రేట్లు మరియు వాతావరణ సూచనలు వెంటనే అందుతాయి.',

    faqTitle: 'తరచుగా అడిగే ప్రశ్నలు',
    faqSubtitle: 'అగ్రి-అసిస్ట్ AI గురించి ముఖ్యాంశాలు.',

    bottomCtaTitle: 'మీ వ్యవసాయాన్ని మరింత లాభదాయకంగా మార్చుకోవాలనుకుంటున్నారా?',
    bottomCtaSubtitle: 'శాస్త్రీయ వ్యవసాయ సలహాల కోసం వేలాది రైతులతో చేరండి.',
    bottomCtaButton: 'ఉచితంగా నమోదు చేసుకోండి',

    footerDisclaimer: 'గమనిక: సలహాలు ICAR శాస్త్రీయ మార్గదర్శకాల ఆధారంగా రూపొందించబడ్డాయి. పురుగుమందుల వాడకానికి ముందు లేబుల్ పరిశీలించండి.',
    footerRights: 'అన్ని హక్కులూ ప్రత్యేకించబడ్డాయి.'
  }
};

// Preset Interactive Demo Scenarios
const DEMO_PRESETS: Record<string, { query: string; answer: string; source: string; confidence: string; audioText: string }[]> = {
  en: [
    {
      query: '🌾 How to control stem borer in paddy during tillering stage?',
      answer:
        'For yellow stem borer in paddy: At tillering stage, install pheromone traps @ 8 traps/acre. If "dead hearts" exceed 5%, spray Cartap Hydrochloride 50% SP @ 400g/acre or Chlorantraniliprole 18.5% SC @ 60ml in 200 liters of water. Avoid excess nitrogen fertilization.',
      source: 'ICAR-CRRI Rice Production Guide (Pest Chapter 4.2)',
      confidence: '98.2%',
      audioText: 'For yellow stem borer in paddy, spray Cartap Hydrochloride 50 SP at 400 grams per acre with 200 liters of water.'
    },
    {
      query: '🍅 Best fertilizer schedule for tomato during flowering & fruit set?',
      answer:
        'Apply 19:19:19 (NPK) @ 3g/L of water every 7 days via fertigation or foliar spray. Add Calcium Nitrate @ 2g/L + Boron 20% @ 1g/L to prevent blossom end rot and promote maximum fruit set.',
      source: 'IIHR Tomato Nutrient Management Protocol',
      confidence: '97.6%',
      audioText: 'Apply nineteen nineteen nineteen NPK at 3 grams per liter with Calcium Nitrate to prevent blossom end rot.'
    },
    {
      query: '📈 What is the live APMC rate for Cotton in Telangana markets?',
      answer:
        'Warangal APMC reports medium staple cotton trading at ₹7,150 – ₹7,420/quintal against the Central MSP of ₹7,121/quintal. Daily arrivals: 1,450 quintals. Outlook: Steady to firm due to export demand.',
      source: 'Agmarknet / e-NAM Live Mandi Stream',
      confidence: '99.1%',
      audioText: 'Warangal APMC cotton is trading between 7,150 and 7,420 rupees per quintal.'
    }
  ],
  hi: [
    {
      query: '🌾 धान में कल्ले फूटने के समय तना छेदक कीट की रोकथाम कैसे करें?',
      answer:
        'धान में तना छेदक (Stem Borer) नियंत्रण: जब मृत गोभ (डेड हार्ट) 5% से अधिक दिखे, तो कार्टाप हाइड्रोक्लोराइड 50% SP @ 400 ग्राम प्रति एकड़ या क्लोरेंट्रानिलीप्रोल 18.5% SC @ 60 मिली 200 लीटर पानी में घोलकर छिड़काव करें। फेरोमोन ट्रैप 8 प्रति एकड़ लगाएं।',
      source: 'ICAR-राष्ट्रीय चावल अनुसंधान संस्थान, कटक (प्रोटोकॉल 4.2)',
      confidence: '98.5%',
      audioText: 'धान में तना छेदक की रोकथाम हेतु कार्टाप हाइड्रोक्लोराइड 50 SP का 400 ग्राम प्रति एकड़ 200 लीटर पानी में छिड़काव करें।'
    },
    {
      query: '🍅 टमाटर में फूल और फल बनते समय कौन सी खाद देनी चाहिए?',
      answer:
        'फूल व फल बनते समय पानी में घुलनशील NPK 19:19:19 @ 3 ग्राम प्रति लीटर छिड़कें। फल फटने व सड़ने से बचाने के लिए कैल्शियम नाइट्रेट 2 ग्राम + बोरॉन (20%) 1 ग्राम प्रति लीटर पानी का छिड़काव 10 दिन के अंतराल पर करें।',
      source: 'भारतीय बागवानी अनुसंधान संस्थान (IIHR) पोषक तत्व संदर्शिका',
      confidence: '97.9%',
      audioText: 'टमाटर में फल बनते समय एनपीके 19 19 19 और कैल्शियम नाइट्रेट व बोरॉन का छिड़काव करें।'
    },
    {
      query: '📈 वर्तमान में कपास और गेहूं का मंडी भाव क्या चल रहा है?',
      answer:
        'मध्यम रेशा कपास का भाव ₹7,150 से ₹7,400 प्रति क्विंटल के बीच है (MSP ₹7,121)। गेहूं का औसत मंडी भाव ₹2,420 से ₹2,550 प्रति क्विंटल दर्ज किया गया है। आने वाले सप्ताह में मांग मजबूत रहने की संभावना है।',
      source: 'Agmarknet / e-NAM लाइव मंडी डेटा',
      confidence: '99.0%',
      audioText: 'कपास का भाव 7,150 से 7,400 रुपये प्रति क्विंटल तथा गेहूं 2,420 से 2,550 रुपये प्रति क्विंटल चल रहा है।'
    }
  ],
  te: [
    {
      query: '🌾 వరిలో పిలక దశలో కాండం తొలుచు పురుగు నివారణ ఎలా చేయాలి?',
    answer:
      'వరిలో కాండం తొలుచు పురుగు నివారణకు: ఎకరాకు 8 లింగాకర్షక బుట్టలు అమర్చండి. చనిపోయిన మొవ్వులు 5% దాటితే కార్టాప్ హైడ్రోక్లోరైడ్ 50% SP 400 గ్రాములు లేదా క్లోరాంట్రానిలిప్రోల్ 18.5% SC 60 మి.లీ 200 లీటర్ల నీటిలో కలిపి పిచికారీ చేయాలి.',
      source: 'ICAR-CRRI వరి సాగు పద్ధతుల సూచిక (చాప్టర్ 4.2)',
      confidence: '98.3%',
      audioText: 'వరిలో కాండం తొలుచు పురుగు నివారణకు కార్టాప్ హైడ్రోక్లోరైడ్ 400 గ్రాములు 200 లీటర్ల నీటిలో కలిపి పిచికారీ చేయండి.'
    },
    {
      query: '🍅 టమోటా పంటలో పూత, కాయ దశలో ఏ ఎరువులు వాడాలి?',
      answer:
        'పూత మరియు కాయ దశలో 19:19:19 (NPK) నీటిలో కరిగే ఎరువు లీటరు నీటికి 3 గ్రాముల చొప్పున పిచికారీ చేయాలి. కాయ కుళ్ళు నివారణకు కాల్షియం నైట్రేట్ 2 గ్రా. + బోరాన్ 1 గ్రా. లీటరు నీటికి కలిపి పిచికారీ చేయడం ఉత్తమం.',
      source: 'IIHR కూరగాయల పోషక యాజమాన్య సూచిక',
      confidence: '97.8%',
      audioText: 'టమోటాలో పూత దశలో 19 19 19 ఎరువు మరియు కాల్షియం నైట్రేట్ బోరాన్ పిచికారీ చేయండి.'
    },
    {
      query: '📈 తెలంగాణ మార్కెట్లలో పత్తి క్వింటాల్ ధర ఎంత ఉంది?',
      answer:
        'వరంగల్ APMC మార్కెట్లో పత్తి క్వింటాల్‌కు ₹7,150 నుండి ₹7,420 వరకు పలుకుతోంది (కేంద్ర MSP ₹7,121). నాణ్యమైన పొడవు పింజ పత్తికి మంచి డిమాండ్ ఉంది.',
      source: 'Agmarknet / e-NAM మార్కెట్ సమాచారం',
      confidence: '99.2%',
      audioText: 'వరంగల్ మార్కెట్ యార్డులో పత్తి ధర 7,150 నుండి 7,420 రూపాయల వరకు పలుకుతోంది.'
    }
  ]
};

// Live Mandi Ticker Feed
const MANDI_TICKER = [
  { crop: 'Wheat / गेहूं', price: '₹2,440', change: '+1.8%', state: 'Punjab' },
  { crop: 'Basmati Paddy / धान', price: '₹3,890', change: '+2.4%', state: 'Haryana' },
  { crop: 'Cotton / పత్తి', price: '₹7,280', change: '+0.9%', state: 'Telangana' },
  { crop: 'Soybean / सोयाबीन', price: '₹4,620', change: '+3.1%', state: 'Madhya Pradesh' },
  { crop: 'Red Chilli / మిరప', price: '₹18,500', change: '+4.5%', state: 'Andhra Pradesh' },
  { crop: 'Mustard / सरसों', price: '₹5,680', change: '+1.5%', state: 'Rajasthan' },
  { crop: 'Tomato / టమోటా', price: '₹2,150', change: '-1.2%', state: 'Maharashtra' },
  { crop: 'Maize / మక్కజొన్న', price: '₹2,120', change: '+0.7%', state: 'Karnataka' },
];

// Showcase agricultural zones
const SHOWCASE_ZONES = [
  {
    id: 'warangal',
    name: 'Warangal, Telangana',
    crops: 'Cotton, Paddy, Chilli',
    temp: '31°C',
    condition: 'Partly Cloudy',
    humidity: '68%',
    rainRisk: '15%',
    wind: '12 km/h',
    mandiCrop: 'Cotton (Medium Staple)',
    mandiPrice: '₹7,280 / Qtl',
    mandiTrend: 'Bullish (+2.1%)'
  },
  {
    id: 'ludhiana',
    name: 'Ludhiana, Punjab',
    crops: 'Wheat, Mustard, Rice',
    temp: '26°C',
    condition: 'Clear Sky',
    humidity: '52%',
    rainRisk: '0%',
    wind: '8 km/h',
    mandiCrop: 'Wheat (Sharbati)',
    mandiPrice: '₹2,480 / Qtl',
    mandiTrend: 'Steady (+0.8%)'
  },
  {
    id: 'nashik',
    name: 'Nashik, Maharashtra',
    crops: 'Onion, Grapes, Tomato',
    temp: '28°C',
    condition: 'Sunny',
    humidity: '58%',
    rainRisk: '5%',
    wind: '14 km/h',
    mandiCrop: 'Red Onion',
    mandiPrice: '₹1,950 / Qtl',
    mandiTrend: 'High Volatility (-3.2%)'
  },
  {
    id: 'guntur',
    name: 'Guntur, Andhra Pradesh',
    crops: 'Teja Chilli, Cotton, Tobacco',
    temp: '33°C',
    condition: 'Humid & Clear',
    humidity: '74%',
    rainRisk: '20%',
    wind: '16 km/h',
    mandiCrop: 'Guntur Teja Chilli',
    mandiPrice: '₹18,500 / Qtl',
    mandiTrend: 'Strong Demand (+4.5%)'
  }
];

export default function Home() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi' | 'te'>('en');
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  // Interactive Demo State
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [activeDemoResult, setActiveDemoResult] = useState(DEMO_PRESETS.en[0]);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Showcase Zone State
  const [selectedZone, setSelectedZone] = useState(SHOWCASE_ZONES[0]);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const t = I18N[language] || I18N.en;

  // Check login session & preferred language
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUserLoggedIn(true);
      }
      const preferred = localStorage.getItem('preferredLanguage') as 'en' | 'hi' | 'te';
      if (preferred && (preferred === 'en' || preferred === 'hi' || preferred === 'te')) {
        setLanguage(preferred);
      }
    } catch {
      // Ignore localStorage access issues
    }
  }, []);

  // Update demo preset when language changes
  useEffect(() => {
    const list = DEMO_PRESETS[language] || DEMO_PRESETS.en;
    setActiveDemoResult(list[activePresetIndex] || list[0]);
  }, [language, activePresetIndex]);

  const handleSelectPreset = (idx: number) => {
    setActivePresetIndex(idx);
    const list = DEMO_PRESETS[language] || DEMO_PRESETS.en;
    setActiveDemoResult(list[idx]);
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    setIsQuerying(true);
    setTimeout(() => {
      setIsQuerying(false);
      // Simulate intelligent RAG matching for custom query
      setActiveDemoResult({
        query: customInput,
        answer:
          language === 'hi'
            ? `आपके प्रश्न "${customInput}" के लिए ICAR कृषि संदर्शिका के अनुसार: खेत की समय पर जुताई करें, संतुलित मात्रा में NPK उर्वरक दें और मिट्टी में पर्याप्त नमी बनाए रखें। स्थानीय कृषि विज्ञान केंद्र (KVK) से संपर्क करें।`
            : language === 'te'
            ? `మీ ప్రశ్న "${customInput}" కు ICAR వ్యవసాయ పద్ధతుల ప్రకారం: తగిన మోతాదులో సమతుల్య NPK ఎరువులు వేయండి, అవసరమైనంత తేమను కాపాడండి మరియు స్థానిక రైతు భరోసా కేంద్రాన్ని సంప్రదించండి.`
            : `For query "${customInput}", based on verified ICAR agronomy guidelines: Implement timely tillage, apply balanced split N-P-K nutrient doses according to soil health card, and maintain optimum field moisture.`,
        source: 'ICAR Package of Practices 2024 (RAG Vector Match)',
        confidence: '96.8%',
        audioText: `Here is the agricultural advisory for your query: maintain balanced soil nutrition and follow recommended pest prevention guidelines.`
      });
      setCustomInput('');
    }, 600);
  };

  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device/browser.');
      return;
    }

    if (audioPlaying) {
      window.speechSynthesis.cancel();
      setAudioPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setAudioPlaying(false);
    utterance.onerror = () => setAudioPlaying(false);

    setAudioPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleLanguageChange = (newLang: 'en' | 'hi' | 'te') => {
    setLanguage(newLang);
    try {
      localStorage.setItem('preferredLanguage', newLang);
    } catch {
      // ignore
    }
  };

  return (
    <div className={`${darkMode ? 'bg-gray-950 text-slate-100' : 'bg-slate-50 text-slate-900'} min-h-screen flex flex-col transition-colors duration-300 font-sans`}>
      {/* Top Banner: APMC Live Commodity Ticker */}
      <div className={`${darkMode ? 'bg-emerald-950/80 border-emerald-900/50' : 'bg-emerald-900 text-white border-emerald-800'} border-b py-2 text-xs overflow-hidden`}>
        <div className="flex items-center gap-2 max-w-7xl mx-auto px-4">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            APMC Live Ticker
          </span>
          <div className="overflow-hidden flex-1 relative">
            <div className="animate-marquee whitespace-nowrap flex gap-8 items-center text-slate-200">
              {MANDI_TICKER.concat(MANDI_TICKER).map((item, i) => (
                <div key={i} className="inline-flex items-center gap-2">
                  <span className="font-semibold text-white">{item.crop}</span>
                  <span className="text-emerald-300 font-mono font-bold">{item.price}</span>
                  <span className={`text-[11px] font-semibold ${item.change.startsWith('+') ? 'text-emerald-400' : 'text-amber-300'}`}>
                    {item.change}
                  </span>
                  <span className="text-emerald-200/60 text-[10px]">({item.state})</span>
                  <span className="text-slate-600 mx-2">•</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${darkMode ? 'bg-gray-900/90 border-gray-800/80' : 'bg-white/90 border-slate-200/80'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                  {t.navBrand}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60">
                  AI v2.4
                </span>
              </div>
              <p className={`text-[11px] font-medium hidden sm:block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {t.navSubtitle}
              </p>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold">
            <a href="#features" className={`hover:text-emerald-600 transition ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {t.navFeatures}
            </a>
            <a href="#demo" className={`hover:text-emerald-600 transition ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {t.navDemo}
            </a>
            <a href="#showcase" className={`hover:text-emerald-600 transition ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {t.navMandi}
            </a>
            <a href="#showcase" className={`hover:text-emerald-600 transition ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {t.navWeather}
            </a>
            <a href="#how-it-works" className={`hover:text-emerald-600 transition ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Workflow
            </a>
            <a href="#faq" className={`hover:text-emerald-600 transition ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {t.navFaq}
            </a>
          </nav>

          {/* Right Controls: Language Selector, Dark Mode, Auth CTAs */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative flex items-center">
              <Languages className={`w-4 h-4 absolute left-2.5 pointer-events-none ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
              <select
                aria-label="Select Interface Language"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'hi' | 'te')}
                className={`pl-8 pr-3 py-1.5 rounded-xl text-xs font-bold border transition focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-slate-200'
                    : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="te">తెలుగు (Telugu)</option>
              </select>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition ${
                darkMode
                  ? 'border-gray-800 bg-gray-800 text-amber-300 hover:bg-gray-700'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth Buttons */}
            {userLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition transform hover:-translate-y-0.5"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs border transition ${
                    darkMode
                      ? 'border-gray-700 text-slate-200 hover:bg-gray-800'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {t.signInNav}
                </Link>
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition transform hover:-translate-y-0.5 flex items-center gap-1.5"
                >
                  <span>{t.signUpNav}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-emerald-500/15 to-teal-400/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>{t.heroBadge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-slate-900 dark:text-white">
              {t.heroTitlePrefix}{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600 bg-clip-text text-transparent">
                {t.heroTitleHighlight}
              </span>
            </h1>

            {/* Subtitle */}
            <p className={`mt-6 text-base sm:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto font-normal ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {t.heroDescription}
            </p>

            {/* Call to Actions */}
            <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
              <Link
                href={userLoggedIn ? '/dashboard' : '/signup'}
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-7 py-3.5 rounded-2xl font-bold text-base shadow-xl shadow-emerald-600/25 transition transform hover:-translate-y-0.5"
              >
                <span>{userLoggedIn ? 'Go to Farmer Dashboard' : t.ctaPrimary}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#demo"
                className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-base border transition ${
                  darkMode
                    ? 'border-gray-700 bg-gray-900/80 text-slate-200 hover:bg-gray-800'
                    : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100 shadow-sm'
                }`}
              >
                <Bot className="w-5 h-5 text-emerald-600" />
                <span>{t.ctaSecondary}</span>
              </a>
            </div>

            {/* Key Statistics Strip */}
            <div className={`mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-3xl border shadow-sm ${
              darkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-white/80 border-slate-200/80'
            }`}>
              <div className="p-3 text-center border-r border-slate-200/30 dark:border-gray-800/60">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {t.statAccuracy}
                </div>
                <div className={`text-xs font-semibold mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t.statAccuracyLabel}
                </div>
              </div>
              <div className="p-3 text-center md:border-r border-slate-200/30 dark:border-gray-800/60">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {t.statMandis}
                </div>
                <div className={`text-xs font-semibold mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t.statMandisLabel}
                </div>
              </div>
              <div className="p-3 text-center border-r border-slate-200/30 dark:border-gray-800/60">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {t.statLanguages}
                </div>
                <div className={`text-xs font-semibold mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t.statLanguagesLabel}
                </div>
              </div>
              <div className="p-3 text-center">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {t.statCrops}
                </div>
                <div className={`text-xs font-semibold mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t.statCropsLabel}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive RAG Advisor Demo Section */}
      <section id="demo" className={`py-16 sm:py-20 border-y ${darkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-emerald-50/50 border-emerald-100'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 rounded-full">
              {t.demoBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mt-3">
              {t.demoTitle}
            </h2>
            <p className={`mt-2 text-sm sm:text-base ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {t.demoSubtitle}
            </p>
          </div>

          {/* Interactive Container */}
          <div className={`rounded-3xl border shadow-xl overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}>
            {/* Top Bar with Language Indicator */}
            <div className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4 ${darkMode ? 'bg-gray-800/60 border-gray-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold flex items-center gap-2">
                    <span>AgriAssist RAG Engine</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      Online
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Grounded with ICAR & State Agricultural Universities Datasets
                  </div>
                </div>
              </div>

              {/* Sample Preset Queries to Click */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 mr-1">Quick Scenarios:</span>
                {(DEMO_PRESETS[language] || DEMO_PRESETS.en).map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(idx)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                      activePresetIndex === idx
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : darkMode
                        ? 'bg-gray-800 text-slate-300 hover:bg-gray-700'
                        : 'bg-slate-200/70 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Scenario #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Query & Response Preview Panel */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Farmer's Query Box */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <span className="text-lg">👨‍🌾</span>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-400 mb-1">Farmer Query ({language.toUpperCase()})</div>
                  <div className={`p-4 rounded-2xl font-medium text-sm sm:text-base border ${
                    darkMode ? 'bg-gray-800/80 border-gray-700 text-slate-100' : 'bg-slate-100 border-slate-200 text-slate-900'
                  }`}>
                    {activeDemoResult.query}
                  </div>
                </div>
              </div>

              {/* AI Advisory Response Box */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Agronomic Recommendation</span>
                    </div>
                    {/* Read Aloud Button */}
                    <button
                      onClick={() => handleSpeak(activeDemoResult.audioText || activeDemoResult.answer)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition ${
                        audioPlaying
                          ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                          : darkMode
                          ? 'bg-gray-800 border-gray-700 text-slate-300 hover:bg-gray-700'
                          : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{audioPlaying ? 'Speaking...' : 'Listen Audio'}</span>
                    </button>
                  </div>

                  {/* Advisory Text */}
                  <div className={`p-5 rounded-2xl leading-relaxed text-sm sm:text-base border ${
                    darkMode ? 'bg-emerald-950/20 border-emerald-900/60 text-slate-200' : 'bg-emerald-50 border-emerald-200/80 text-slate-800'
                  }`}>
                    {isQuerying ? (
                      <div className="flex items-center gap-3 py-3 text-emerald-600 dark:text-emerald-400">
                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Retrieving ICAR document chunks and synthesizing answer...</span>
                      </div>
                    ) : (
                      activeDemoResult.answer
                    )}
                  </div>

                  {/* Metadata Indicators: Source Grounding & Confidence */}
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border ${
                      darkMode ? 'bg-gray-800/80 border-gray-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}>
                      <span className="font-semibold text-slate-400">{t.demoSourceLabel}:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeDemoResult.source}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border ${
                      darkMode ? 'bg-gray-800/80 border-gray-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}>
                      <span className="font-semibold text-slate-400">{t.demoConfidenceLabel}:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{activeDemoResult.confidence}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Try Custom Query Input Form */}
              <form onSubmit={handleDemoSubmit} className="pt-4 border-t border-slate-200/60 dark:border-gray-800 flex gap-2">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder={t.demoPlaceholder}
                  className={`flex-1 px-4 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                    darkMode
                      ? 'bg-gray-800/90 border-gray-700 text-white placeholder-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-sm'
                  }`}
                />
                <button
                  type="submit"
                  disabled={isQuerying}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-md transition"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.demoSend}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Capabilities (Features Section) */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 rounded-full">
              {t.featBadge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-3">
              {t.featTitle}
            </h2>
            <p className={`mt-3 text-base ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {t.featSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className={`p-8 rounded-3xl border transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
              darkMode ? 'bg-gray-900/60 border-gray-800 hover:border-emerald-500/50' : 'bg-white border-slate-200/80 hover:border-emerald-400 shadow-sm'
            }`}>
              <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
                <Cpu className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t.feat1Title}</h3>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {t.feat1Desc}
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`p-8 rounded-3xl border transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
              darkMode ? 'bg-gray-900/60 border-gray-800 hover:border-emerald-500/50' : 'bg-white border-slate-200/80 hover:border-emerald-400 shadow-sm'
            }`}>
              <div className="w-13 h-13 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-6">
                <Mic className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t.feat2Title}</h3>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {t.feat2Desc}
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`p-8 rounded-3xl border transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
              darkMode ? 'bg-gray-900/60 border-gray-800 hover:border-emerald-500/50' : 'bg-white border-slate-200/80 hover:border-emerald-400 shadow-sm'
            }`}>
              <div className="w-13 h-13 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t.feat3Title}</h3>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {t.feat3Desc}
              </p>
            </div>

            {/* Feature 4 */}
            <div className={`p-8 rounded-3xl border transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
              darkMode ? 'bg-gray-900/60 border-gray-800 hover:border-emerald-500/50' : 'bg-white border-slate-200/80 hover:border-emerald-400 shadow-sm'
            }`}>
              <div className="w-13 h-13 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-6">
                <CloudSun className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t.feat4Title}</h3>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {t.feat4Desc}
              </p>
            </div>

            {/* Feature 5 */}
            <div className={`p-8 rounded-3xl border transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
              darkMode ? 'bg-gray-900/60 border-gray-800 hover:border-emerald-500/50' : 'bg-white border-slate-200/80 hover:border-emerald-400 shadow-sm'
            }`}>
              <div className="w-13 h-13 rounded-2xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center mb-6">
                <Leaf className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t.feat5Title}</h3>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {t.feat5Desc}
              </p>
            </div>

            {/* Feature 6 */}
            <div className={`p-8 rounded-3xl border transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
              darkMode ? 'bg-gray-900/60 border-gray-800 hover:border-emerald-500/50' : 'bg-white border-slate-200/80 hover:border-emerald-400 shadow-sm'
            }`}>
              <div className="w-13 h-13 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t.feat6Title}</h3>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {t.feat6Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Field Intelligence Showcase (Weather + Mandi Explorer) */}
      <section id="showcase" className={`py-16 sm:py-24 border-y ${darkMode ? 'bg-gray-900/30 border-gray-800' : 'bg-slate-100/60 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 rounded-full">
              {t.showcaseBadge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-3">
              {t.showcaseTitle}
            </h2>
            <p className={`mt-2 text-sm sm:text-base ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {t.showcaseSubtitle}
            </p>

            {/* Zone Selector Buttons */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {SHOWCASE_ZONES.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold border transition ${
                    selectedZone.id === zone.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : darkMode
                      ? 'bg-gray-800 border-gray-700 text-slate-300 hover:bg-gray-700'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 inline mr-1" />
                  {zone.name}
                </button>
              ))}
            </div>
          </div>

          {/* Side-by-Side Live Cards: Weather & Mandi */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Live Weather Card */}
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-lg relative overflow-hidden ${
              darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-bold text-sky-500 uppercase tracking-wider block">Live Meteorological Feed</span>
                  <h3 className="text-xl font-bold mt-1">{selectedZone.name}</h3>
                  <span className="text-xs text-slate-400">Major Crops: {selectedZone.crops}</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <CloudSun className="w-7 h-7" />
                </div>
              </div>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-5xl font-black font-mono text-slate-900 dark:text-white">{selectedZone.temp}</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                  {selectedZone.condition}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200/50 dark:border-gray-800">
                <div className="text-center p-3 rounded-2xl bg-slate-50 dark:bg-gray-800/50">
                  <Droplets className="w-4 h-4 mx-auto text-sky-500 mb-1" />
                  <span className="text-[11px] text-slate-400 block">Humidity</span>
                  <span className="font-bold text-sm">{selectedZone.humidity}</span>
                </div>
                <div className="text-center p-3 rounded-2xl bg-slate-50 dark:bg-gray-800/50">
                  <CloudSun className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                  <span className="text-[11px] text-slate-400 block">Rain Risk</span>
                  <span className="font-bold text-sm">{selectedZone.rainRisk}</span>
                </div>
                <div className="text-center p-3 rounded-2xl bg-slate-50 dark:bg-gray-800/50">
                  <Wind className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
                  <span className="text-[11px] text-slate-400 block">Wind Speed</span>
                  <span className="font-bold text-sm">{selectedZone.wind}</span>
                </div>
              </div>
            </div>

            {/* Live APMC Mandi Card */}
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-lg relative overflow-hidden ${
              darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">APMC Wholesale Mandi Feed</span>
                  <h3 className="text-xl font-bold mt-1">{selectedZone.mandiCrop}</h3>
                  <span className="text-xs text-slate-400">Market Yard: {selectedZone.name}</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <BarChart3 className="w-7 h-7" />
                </div>
              </div>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-4xl font-black font-mono text-emerald-600 dark:text-emerald-400">{selectedZone.mandiPrice}</span>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full">
                  {selectedZone.mandiTrend}
                </span>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-200/50 dark:border-gray-800 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Central Government MSP:</span>
                  <span className="font-bold">₹7,121 / Qtl</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Arrivals Today:</span>
                  <span className="font-bold">1,820 Quintals</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Recommended Selling Timing:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Hold 3-5 days for peak rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Farmer Journey Workflow */}
      <section id="how-it-works" className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 rounded-full">
              {t.howBadge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-3">
              {t.howTitle}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className={`p-8 rounded-3xl border relative ${
              darkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-white border-slate-200'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-mono font-black text-lg flex items-center justify-center mb-6 shadow-md">
                01
              </div>
              <h3 className="text-xl font-bold mb-2">{t.howStep1Title}</h3>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {t.howStep1Desc}
              </p>
            </div>

            <div className={`p-8 rounded-3xl border relative ${
              darkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-white border-slate-200'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-mono font-black text-lg flex items-center justify-center mb-6 shadow-md">
                02
              </div>
              <h3 className="text-xl font-bold mb-2">{t.howStep2Title}</h3>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {t.howStep2Desc}
              </p>
            </div>

            <div className={`p-8 rounded-3xl border relative ${
              darkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-white border-slate-200'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-green-600 text-white font-mono font-black text-lg flex items-center justify-center mb-6 shadow-md">
                03
              </div>
              <h3 className="text-xl font-bold mb-2">{t.howStep3Title}</h3>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {t.howStep3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className={`py-16 sm:py-24 border-t ${darkMode ? 'bg-gray-900/40 border-gray-800' : 'bg-slate-50/80 border-slate-200'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-black">{t.faqTitle}</h2>
            <p className={`mt-2 text-sm sm:text-base ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {t.faqSubtitle}
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: language === 'hi' ? 'क्या कृषि-सहायक पूरी तरह निःशुल्क है?' : language === 'te' ? 'అగ్రి-అసిస్ట్ సేవలు రైతులకు ఉచితమేనా?' : 'Is AgriAssist AI free to use for farmers?',
                a: language === 'hi' ? 'हां, यह मंच सभी भारतीय किसानों, छात्रों और विस्तार कार्यकर्ताओं के लिए पूर्णतः निःशुल्क उपलब्ध है।' : language === 'te' ? 'అవును, దేశవ్యాప్తంగా ఉన్న రైతులు, వ్యవసాయ విద్యార్థులందరికీ ఈ సేవలు పూర్తిగా ఉచితం.' : 'Yes, AgriAssist is completely free for all Indian farmers, extension workers, and agricultural researchers.'
              },
              {
                q: language === 'hi' ? 'कृषि सलाह किस डेटा पर आधारित होती है?' : language === 'te' ? 'ఈ సలహాలు ఏ డేటా ఆధారంగా అందించబడతాయి?' : 'Where does the agricultural knowledge originate from?',
                a: language === 'hi' ? 'हमारी RAG प्रणाली भारतीय कृषि अनुसंधान परिषद (ICAR) और राज्य कृषि विश्वविद्यालयों (SAUs) के पैकेज ऑफ प्रैक्टिसेज और सत्यापित शोध पत्रिकाओं से ज्ञान प्राप्त करती है।' : language === 'te' ? 'మా RAG వ్యవస్థ భారత వ్యవసాయ పరిశోధనా మండలి (ICAR) మరియు వ్యవసాయ విశ్వవిద్యాలయాల అధికారిక పరిశోధనల ఆధారంగా పనిచేస్తుంది.' : 'Our RAG vector store indexes vetted ICAR package of practices, state agricultural university manuals, and scientific plant pathology guidelines.'
              },
              {
                q: language === 'hi' ? 'मंडी भाव कितनी बार अपडेट होते हैं?' : language === 'te' ? 'మార్కెట్ ధరలు ఎంత సమయానికి అప్‌డేట్ అవుతాయి?' : 'How frequently are Mandi market rates updated?',
                a: language === 'hi' ? 'APMC मंडियों के भाव Agmarknet और e-NAM पोर्टल के माध्यम से दिन भर में वास्तविक समय पर अपडेट किए जाते हैं।' : language === 'te' ? 'APMC మార్కెట్ యార్డుల ధరలు Agmarknet మరియు e-NAM నుండి రోజూ నిజ సమయంలో నవీకరించబడతాయి.' : 'Commodity rates are fetched in real-time from open APMC and e-NAM marketplace feeds with daily wholesale closing reports.'
              },
              {
                q: language === 'hi' ? 'क्या मैं बोलकर अपनी भाषा में पूछ सकता हूँ?' : language === 'te' ? 'నేను నా గొంతుతో తెలుగులో మాట్లాడి సమాధానం పొందవచ్చా?' : 'Can I speak queries using voice on mobile devices?',
                a: language === 'hi' ? 'जी हां, हमारे वॉइस मॉड्यूल में स्पीच-टू-टेक्स्ट और ऑडियो प्लेबैक दोनों शामिल हैं जिससे आप खेत में काम करते हुए भी सीधे बोलकर जानकारी पा सकते हैं।' : language === 'te' ? 'ఖచ్చితంగా, మా వాయిస్ మాడ్యూల్ ద్వారా మీరు తెలుగులో మాట్లాడవచ్చు మరియు సమాధానాన్ని ఆడియో రూపంలో వినవచ్చు.' : 'Yes! Built-in speech-to-text and speech synthesis enable full hands-free operation directly from the mobile browser in the field.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border transition overflow-hidden ${
                  darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm sm:text-base flex justify-between items-center gap-4"
                >
                  <span>{item.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className={`px-5 pb-5 text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* High-Impact Bottom Call to Action Banner */}
      <section className="py-16 sm:py-20 relative overflow-hidden bg-gradient-to-br from-emerald-800 via-green-900 to-teal-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.25),transparent_50%)] pointer-events-none"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {t.bottomCtaTitle}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto">
            {t.bottomCtaSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="bg-white text-emerald-900 hover:bg-emerald-50 px-8 py-3.5 rounded-2xl font-bold text-base shadow-2xl transition transform hover:-translate-y-0.5 inline-flex items-center gap-2"
            >
              <span>{t.bottomCtaButton}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="border border-white/40 hover:bg-white/10 text-white px-8 py-3.5 rounded-2xl font-bold text-base transition"
            >
              {t.signInNav}
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Chat Trigger */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => router.push(userLoggedIn ? '/dashboard' : '/login')}
          className="bg-gradient-to-tr from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition transform hover:scale-110 group"
          title="Consult Agri-Assistant"
        >
          <Bot className="w-6 h-6" />
          <span className="absolute right-16 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-lg pointer-events-none">
            {userLoggedIn ? 'Open AI Advisor' : 'Sign In to Consult AI'}
          </span>
        </button>
      </div>

      {/* Professional Footer */}
      <footer className={`border-t text-xs py-12 transition-colors ${darkMode ? 'bg-gray-950 border-gray-900 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Sprout className="w-4 h-4" />
                </div>
                <span className="font-black text-base text-slate-900 dark:text-white">AgriAssist AI</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                AI-Based Agricultural Advisory System for Multilingual Farmer Query Assistance.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-3">Core Modules</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="hover:text-emerald-500 transition">Multilingual RAG Chat</Link></li>
                <li><Link href="/login" className="hover:text-emerald-500 transition">APMC Mandi Analytics</Link></li>
                <li><Link href="/login" className="hover:text-emerald-500 transition">Open-Meteo Weather</Link></li>
                <li><Link href="/login" className="hover:text-emerald-500 transition">Fertilizer & Soil Guide</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-3">Gov & Agritech Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="https://icar.org.in" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition inline-flex items-center gap-1">
                    ICAR India <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="https://enam.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition inline-flex items-center gap-1">
                    e-NAM Mandi <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="https://agmarknet.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition inline-flex items-center gap-1">
                    Agmarknet <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="https://mausam.imd.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition inline-flex items-center gap-1">
                    IMD Mausam <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-3">Access & Portal</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="hover:text-emerald-500 transition">Farmer Login</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-500 transition">Register Account</Link></li>
                <li><Link href="/dashboard" className="hover:text-emerald-500 transition">Direct Dashboard</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200/50 dark:border-gray-800 text-center space-y-2">
            <p className="text-[11px] text-slate-400">
              {t.footerDisclaimer}
            </p>
            <p className="text-slate-400 text-xs">
              © {new Date().getFullYear()} AI-Based Agricultural Advisory System. {t.footerRights}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}