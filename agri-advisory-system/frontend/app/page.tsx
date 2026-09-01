'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);

  // Default English text dictionary
  const defaultTexts = {
    brand: "🌾 Agri-Advisory",
    signInNav: "Sign In",
    signUpNav: "Sign Up",
    badge: "Agricultural Advisory Platform",
    title: "AI-Based-Agricultural-Advisory-System-for-Multilingual-Farmer-Query-Assistance",
    description: "Providing farmers with structured guidance on soil health, fertilizers, crop management, mandi market rates, and weather updates in English, Hindi, and Telugu.",
    getStarted: "Get Started Free",
    signInBtn: "Sign In",
    feat1Title: "Multilingual RAG Chat",
    feat1Desc: "Ask agricultural questions in English, Hindi, or Telugu and receive answers sourced from reference farming documents.",
    feat2Title: "Voice & Audio Support",
    feat2Desc: "Utilize speech-to-text microphone inputs to speak queries naturally, accompanied by text-to-speech playback.",
    feat3Title: "Crop & Soil Intelligence",
    feat3Desc: "Access structured recommendations tailored to regional farming guidelines, fertilizer schedules, and seasonal tips.",
    feat4Title: "Mandi Market Prices",
    feat4Desc: "Check regional agricultural commodity and marketplace pricing updates to make informed selling decisions.",
    feat5Title: "Weather Forecasting",
    feat5Desc: "Stay updated with local weather forecasts, rainfall expectations, and advisory alerts for your specific farming region.",
    chatTooltip: "Sign in to chat with Agri-Assistant",
    chatTooltipHover: "Sign in to chat",
    footerText: `© ${new Date().getFullYear()} AI-Based Agricultural Advisory System. All rights reserved.`
  };

  const [t, setT] = useState(defaultTexts);

  // Handle dynamic translation when language changes
  useEffect(() => {
    if (language === 'en') {
      setT(defaultTexts);
      return;
    }

    const fetchTranslations = async () => {
      setIsTranslating(true);
      try {
        const keys = Object.keys(defaultTexts) as (keyof typeof defaultTexts)[];
        const values = keys.map((k) => defaultTexts[k]);

        const res = await fetch('/api/translate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ texts: values, targetLanguage: language }),
});

        const data = await res.json();
        if (res.ok && data.translatedTexts) {
          const newT: any = {};
          keys.forEach((key, index) => {
            newT[key] = data.translatedTexts[index] || defaultTexts[key];
          });
          setT(newT);
        }
      } catch (err) {
        console.error('Translation error:', err);
      } finally {
        setIsTranslating(false);
      }
    };

    fetchTranslations();
  }, [language]);

  const handleFeatureClick = () => {
    router.push('/signup');
  };

  const handleChatbotClick = () => {
    router.push('/login');
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-green-50 text-gray-900'} min-h-screen flex flex-col justify-between transition-colors duration-300 relative`}>
      
      {/* Sticky Top Navbar - Full Width Edge-to-Edge */}
      <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'} sticky top-0 z-50 shadow-sm px-6 py-4 flex justify-between items-center w-full border-b backdrop-blur-md bg-opacity-90`}>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-green-600 flex items-center gap-2">{t.brand}</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Translation Dropdown */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isTranslating}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'} focus:outline-none disabled:opacity-50`}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="te">తెలుగు</option>
          </select>

          {isTranslating && <span className="text-xs text-green-600 font-semibold animate-pulse">Translating...</span>}

          {/* Dark/Night Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg border text-sm font-semibold ${darkMode ? 'border-gray-600 bg-gray-700 text-yellow-400' : 'border-gray-300 bg-white text-gray-700'} shadow-sm transition`}
            title="Toggle Dark/Night Mode"
          >
            {darkMode ? '☀️ Light' : '🌙 Night'}
          </button>

          <Link href="/login" className="text-green-600 font-semibold hover:underline px-2">
            {t.signInNav}
          </Link>
          <Link href="/signup" className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition shadow-sm">
            {t.signUpNav}
          </Link>
        </div>
      </nav>

      {/* Full-Length Hero Section (Edge-to-Edge like Dashboard) */}
      <section className={`w-full py-16 px-4 md:px-8 border-b ${darkMode ? 'bg-gradient-to-b from-gray-800/80 to-gray-900 border-gray-800' : 'bg-gradient-to-b from-green-100/70 via-green-50/50 to-transparent border-green-100'}`}>
        <div className="max-w-5xl mx-auto text-center">
          <span className={`inline-block ${darkMode ? 'bg-green-900/80 text-green-300 border border-green-700' : 'bg-green-100 text-green-800 border border-green-200'} text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider mb-5 shadow-sm`}>
            {t.badge}
          </span>
          <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
            {t.title}
          </h2>
          <p className={`mt-6 text-lg md:text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto leading-relaxed`}>
            {t.description}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="bg-green-600 text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg transform hover:-translate-y-0.5"
            >
              {t.getStarted}
            </Link>
            <Link
              href="/login"
              className={`border ${darkMode ? 'border-green-500 text-green-400 hover:bg-gray-800' : 'border-green-600 text-green-700 hover:bg-green-50'} px-8 py-3.5 rounded-xl font-bold text-lg transition shadow-sm`}
            >
              {t.signInBtn}
            </Link>
          </div>

          {/* Quick highlights indicator strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto pt-8 border-t border-green-500/20 text-left">
            <div className={`p-3.5 rounded-xl ${darkMode ? 'bg-gray-800/60' : 'bg-white/80'} border border-green-500/20 shadow-sm`}>
              <span className="text-xs text-gray-400 block">Languages</span>
              <span className="text-sm font-bold text-green-600">English, हिन्दी, తెలుగు</span>
            </div>
            <div className={`p-3.5 rounded-xl ${darkMode ? 'bg-gray-800/60' : 'bg-white/80'} border border-green-500/20 shadow-sm`}>
              <span className="text-xs text-gray-400 block">AI Intelligence</span>
              <span className="text-sm font-bold text-green-600">ICAR RAG & Voice</span>
            </div>
            <div className={`p-3.5 rounded-xl ${darkMode ? 'bg-gray-800/60' : 'bg-white/80'} border border-green-500/20 shadow-sm`}>
              <span className="text-xs text-gray-400 block">Mandi Prices</span>
              <span className="text-sm font-bold text-green-600">Live APMC & Trends</span>
            </div>
            <div className={`p-3.5 rounded-xl ${darkMode ? 'bg-gray-800/60' : 'bg-white/80'} border border-green-500/20 shadow-sm`}>
              <span className="text-xs text-gray-400 block">Weather Forecast</span>
              <span className="text-sm font-bold text-green-600">Live Open-Meteo API</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Grid Container */}
      <main className="max-w-6xl mx-auto px-4 py-12 flex-1 w-full">

        {/* Website Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          
          <div 
            onClick={handleFeatureClick}
            className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:border-green-500' : 'bg-white border-green-100 hover:border-green-400'} p-6 rounded-2xl border shadow-sm cursor-pointer transition transform hover:-translate-y-1`}
          >
            <div className="text-3xl mb-3">💬</div>
            <h3 className="text-xl font-bold mb-2">{t.feat1Title}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.feat1Desc}
            </p>
          </div>

          <div 
            onClick={handleFeatureClick}
            className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:border-green-500' : 'bg-white border-green-100 hover:border-green-400'} p-6 rounded-2xl border shadow-sm cursor-pointer transition transform hover:-translate-y-1`}
          >
            <div className="text-3xl mb-3">🎙️</div>
            <h3 className="text-xl font-bold mb-2">{t.feat2Title}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.feat2Desc}
            </p>
          </div>

          <div 
            onClick={handleFeatureClick}
            className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:border-green-500' : 'bg-white border-green-100 hover:border-green-400'} p-6 rounded-2xl border shadow-sm cursor-pointer transition transform hover:-translate-y-1`}
          >
            <div className="text-3xl mb-3">🌱</div>
            <h3 className="text-xl font-bold mb-2">{t.feat3Title}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.feat3Desc}
            </p>
          </div>

          <div 
            onClick={handleFeatureClick}
            className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:border-green-500' : 'bg-white border-green-100 hover:border-green-400'} p-6 rounded-2xl border shadow-sm cursor-pointer transition transform hover:-translate-y-1`}
          >
            <div className="text-3xl mb-3">📈</div>
            <h3 className="text-xl font-bold mb-2">{t.feat4Title}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.feat4Desc}
            </p>
          </div>

          <div 
            onClick={handleFeatureClick}
            className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:border-green-500' : 'bg-white border-green-100 hover:border-green-400'} p-6 rounded-2xl border shadow-sm cursor-pointer transition transform hover:-translate-y-1 md:col-span-2`}
          >
            <div className="text-3xl mb-3">🌦️</div>
            <h3 className="text-xl font-bold mb-2">{t.feat5Title}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.feat5Desc}
            </p>
          </div>

        </div>
      </main>

      {/* Fixed Floating Chatbot Icon (Requires Login to Open) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleChatbotClick}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition transform hover:scale-105 group"
          title={t.chatTooltip}
        >
          <span className="text-2xl">🤖</span>
          <span className="absolute right-16 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-md pointer-events-none">
            {t.chatTooltipHover}
          </span>
        </button>
      </div>

      {/* Footer */}
      <footer className={`text-center py-6 text-xs ${darkMode ? 'text-gray-500 border-gray-800' : 'text-gray-400 border-gray-200'} border-t mt-12`}>
        {t.footerText}
      </footer>
    </div>
  );
}