'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCropMarketDetails } from '@/services/cropApi';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import ChatInterface from './chat/ChatInterface';

interface User {
  id?: string | number;
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
}

interface HourlyPoint {
  time: string;
  temp: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Navigation views: 'overview' | 'weather' | 'market' | 'soil' | 'profile'
  const [activeView, setActiveView] = useState<'overview' | 'weather' | 'market' | 'soil' | 'profile'>('overview');
  
  // Full-page ChatInterface overlay state
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Mandi Financial chart timeframe: 'today' | 'yesterday' | 'week' | 'threeMonths'
  const [mandiTimeframe, setMandiTimeframe] = useState<'today' | 'yesterday' | 'week' | 'threeMonths'>('week');

  // Default English text dictionary for dashboard
  const defaultTexts = {
    welcome: "Welcome",
    signOut: "Sign Out",
    portalOverview: "Farmer Portal Overview",
    title: "AI-Based Agricultural Advisory System for Multilingual Farmer Query Assistance",
    subtitle: "Access live weather tracking, mandi market trends, crop intelligence, and our AI assistant instantly.",
    feat1Title: "Multilingual RAG Chat",
    feat1Desc: "Ask agricultural questions in English, Hindi, or Telugu and receive answers sourced from reference farming documents.",
    feat2Title: "Voice & Audio Support",
    feat2Desc: "Utilize speech-to-text microphone inputs to speak queries naturally, accompanied by audio transcriptions.",
    feat3Title: "Crop & Soil Intelligence",
    feat3Desc: "Access structured recommendations tailored to regional farming guidelines, fertilizer schedules, and seasonal tips.",
    feat4Title: "Mandi Market Prices",
    feat4Desc: "Check regional commodity pricing, top-selling crops, and historical price comparisons from past weeks and months.",
    feat5Title: "Weather Forecasting",
    feat5Desc: "Check local temperature, wind speed, humidity, and rainfall expectations with real-time forecasting data from Open-Meteo.",
    profileTitle: "Farmer Profile & Settings",
    backToOverview: "← Back to Overview",
    updateDetails: "Update Details",
    resetPassword: "Reset Password",
    updatePassword: "Update Password",
    weatherTitle: "Real-Time Weather Forecasting",
    weatherDesc: "Search your farm location or city to fetch live weather data via Open-Meteo API.",
    searchLocation: "Search Location",
    temperature: "Temperature",
    windSpeed: "Wind Speed",
    humidity: "Humidity",
    precipitation: "Precipitation",
    hourlyTrend: "Live Hourly Temperature Trend",
    interactiveMap: "Interactive Farm Map Visualizer",
    marketTitle: "Mandi Market Prices & Commodity Intelligence",
    marketDesc: "Check live marketplace commodity pricing and historical price trends via APMC feed.",
    getPriceTrends: "Get Price Trends",
    selectedCommodity: "Selected Commodity",
    todaysRate: "Today's Live Rate",
    nationalAvg: "National Average Range",
    stateRate: "State / Regional Rate",
    localAPMC: "Local APMC / Mandi Rate",
    historicalTrends: "Historical Price Trends (API Verified)",
    financialGraphTitle: "Financial Market Price Trends & Volatility Chart",
    timeframeToday: "Today (Intraday)",
    timeframeYesterday: "Yesterday",
    timeframeWeek: "Last Week (7 Days)",
    timeframe3Months: "Last 3 Months (12 Weeks)",
    periodHigh: "High",
    periodLow: "Low",
    priceTrend: "Price Trend",
    enterStatePlaceholder: "Enter state (e.g. Punjab)",
    enterLocalPlaceholder: "Enter local mandi / APMC (e.g. Ludhiana)",
    topSellingHeader: "🔥 Top Selling Crops in Regional Mandi Markets",
    soilTitle: "Crop & Soil Health Recommendations",
    fertilizerHeader: "Recommended Fertilizer Schedule",
    fertilizerDesc: "Apply urea in split doses corresponding to key vegetative growth stages to maximize nutrient absorption.",
    pestHeader: "Pest Management Alert",
    pestDesc: "Monitor crops closely for stem borer activity during high humidity conditions. Organic neem oil sprays recommended as preventive care.",
    chatButtonTooltip: "Chat with Agri-Assistant",
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

  // Profile update form states
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileMessage, setProfileMessage] = useState('');

  // Weather feature states
  const [queryLocation, setQueryLocation] = useState('Warangal');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherInfo, setWeatherInfo] = useState({
    city: 'Warangal, India',
    lat: '18.00',
    lon: '79.58',
    temp: '--°C',
    humidity: '--%',
    wind: '-- km/h',
    precipitation: '--%'
  });
  const [hourlyData, setHourlyData] = useState<HourlyPoint[]>([]);

  // Market feature states
  const [searchCommodity, setSearchCommodity] = useState('carrot');
  const [searchState, setSearchState] = useState('');
  const [searchLocalPlace, setSearchLocalPlace] = useState('');
  const [cropData, setCropData] = useState<any>(null);
  const [loadingCrop, setLoadingCrop] = useState(false);

  // Top selling crops mock database fallback list
  const topSellingCrops = [
    { name: 'Paddy (Rice)', price: '₹2,300 / Quintal', trend: '+2.4%', demand: 'High' },
    { name: 'Wheat', price: '₹2,275 / Quintal', trend: '+1.1%', demand: 'Stable' },
    { name: 'Cotton', price: '₹7,150 / Quintal', trend: '+4.5%', demand: 'Very High' },
    { name: 'Maize (Corn)', price: '₹2,100 / Quintal', trend: '-0.5%', demand: 'Moderate' },
    { name: 'Soybean', price: '₹4,600 / Quintal', trend: '+3.2%', demand: 'High' },
    { name: 'Tomato', price: '₹2,500 / Quintal', trend: '+6.8%', demand: 'High' },
  ];

  // Password validation rules
  const hasMinLength = passwordData.newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordData.newPassword);
  const hasNumber = /[0-9]/.test(passwordData.newPassword);
  const passwordsMatch = passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword !== '';
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber && passwordsMatch;

  // Function to fetch live weather data
  const fetchWeatherData = async (latitude: number, longitude: number, displayName: string) => {
    try {
      setWeatherLoading(true);
      setWeatherError(null);

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&hourly=temperature_2m`
      );
      
      if (!res.ok) throw new Error('Failed to fetch weather data.');
      
      const data = await res.json();

      setWeatherInfo({
        city: displayName,
        lat: latitude.toFixed(2),
        lon: longitude.toFixed(2),
        temp: `${Math.round(data.current.temperature_2m)}°C`,
        humidity: `${data.current.relative_humidity_2m}%`,
        wind: `${Math.round(data.current.wind_speed_10m)} km/h`,
        precipitation: `${data.current.precipitation || 0}%`
      });

      const times: string[] = data.hourly.time;
      const temps: number[] = data.hourly.temperature_2m;
      
      const currentHourIndex = new Date().getHours();
      const formattedPoints: HourlyPoint[] = [];

      for (let i = 0; i < 8; i++) {
        const targetIndex = (currentHourIndex + i) % 24;
        const rawTimeStr = times[targetIndex]; 
        const hourNum = parseInt(rawTimeStr.split('T')[1].split(':')[0], 10);
        
        const formattedTime = hourNum === 0 
          ? '12 am' 
          : hourNum === 12 
          ? '12 pm' 
          : hourNum > 12 
          ? `${hourNum - 12} pm` 
          : `${hourNum} am`;

        formattedPoints.push({
          time: formattedTime,
          temp: Math.round(temps[targetIndex])
        });
      }

      setHourlyData(formattedPoints);
    } catch (err: any) {
      setWeatherError(err.message || 'Error loading live weather.');
    } finally {
      setWeatherLoading(false);
    }
  };

  // Search handler using OpenStreetMap Nominatim Geocoding API
  const handleWeatherSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = queryLocation.trim();
    if (!formatted) return;

    try {
      setWeatherLoading(true);
      setWeatherError(null);

      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formatted)}`
      );
      const geoData = await geoRes.json();

      if (!geoData || geoData.length === 0) {
        throw new Error('Location not found. Please try another city name.');
      }

      const lat = parseFloat(geoData[0].lat);
      const lon = parseFloat(geoData[0].lon);
      const displayName = geoData[0].display_name.split(',')[0] + ', India';

      await fetchWeatherData(lat, lon, displayName);
    } catch (err: any) {
      setWeatherError(err.message || 'Failed to resolve location.');
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setProfileData({
          firstName: parsed.firstName || '',
          lastName: parsed.lastName || '',
          username: parsed.username || '',
          email: parsed.email || '',
        });
      } else {
        const defaultUser = { id: 1, firstName: 'Farmer', username: 'user', email: 'user@example.com' };
        localStorage.setItem('user', JSON.stringify(defaultUser));
        setUser(defaultUser);
        setProfileData({
          firstName: 'Farmer',
          lastName: '',
          username: 'user',
          email: 'user@example.com',
        });
      }
    } catch (e) {
      const defaultUser = { id: 1, firstName: 'Farmer', username: 'user', email: 'user@example.com' };
      setUser(defaultUser);
    }
    fetchWeatherData(18.00, 79.58, 'Warangal, India');
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Handle backend sync for Profile Details
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage('');

    const userId = user?.id;
    if (!userId) {
      setProfileMessage('Error: User ID not found. Please log in again.');
      return;
    }

    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          username: profileData.username,
          email: profileData.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile in database.');
      }

      const updatedUser = { ...user, ...data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setProfileMessage('Profile details successfully updated in database!');
    } catch (err: any) {
      setProfileMessage(`Error: ${err.message}`);
    }
  };

  // Handle backend sync for Password Reset
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;
    setProfileMessage('');

    const userId = user?.id;
    if (!userId) {
      setProfileMessage('Error: User ID not found. Please log in again.');
      return;
    }

    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password in database.');
      }

      setProfileMessage('Password successfully updated and hashed in SQLite!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setProfileMessage(`Error: ${err.message}`);
    }
  };

  // Handle live crop search submission
  const handleCropSearch = async (e?: React.FormEvent, customCrop?: string) => {
    if (e) e.preventDefault();
    const commodityToFetch = customCrop || searchCommodity;
    if (!commodityToFetch.trim()) return;

    setLoadingCrop(true);
    setSearchCommodity(commodityToFetch);
    const data = await fetchCropMarketDetails(
      commodityToFetch,
      searchState,
      searchLocalPlace
    );
    setCropData(data);
    setLoadingCrop(false);
  };

  const displayName = user?.firstName || user?.username || 'Farmer';

  // If chat is toggled open, render the ChatInterface component full screen with correct props
  if (isChatOpen) {
    return (
      <div className="relative h-screen w-screen overflow-hidden">
        <button
          onClick={() => setIsChatOpen(false)}
          className="absolute top-3 left-3 z-30 bg-gray-900/80 hover:bg-black text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-md transition flex items-center gap-1.5 backdrop-blur-sm"
        >
          {t.backToOverview}
        </button>
        <ChatInterface lang={language} setLang={setLanguage} onBack={() => setIsChatOpen(false)} />
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-green-50 text-gray-900'} min-h-screen flex flex-col transition-colors duration-300 relative`}>
      
      {/* Dashboard Top Navbar */}
      <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'} sticky top-0 z-50 shadow-sm px-6 py-4 flex justify-between items-center border-b backdrop-blur-md bg-opacity-90`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('overview')}>
          <h1 className="text-xl font-bold text-green-600 flex items-center gap-2">
            🌾 Agri-Advisory <span className="text-sm font-normal text-gray-500 hidden sm:inline">| {t.welcome}, {displayName}</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
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

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg border text-sm font-semibold ${darkMode ? 'border-gray-600 bg-gray-700 text-yellow-400' : 'border-gray-300 bg-white text-gray-700'} shadow-sm transition`}
            title="Toggle Dark/Night Mode"
          >
            {darkMode ? '☀️ Light' : '🌙 Night'}
          </button>

          <button
            onClick={() => setActiveView('profile')}
            className={`p-2 rounded-full border text-base font-bold ${activeView === 'profile' ? 'bg-green-600 text-white border-green-600' : darkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300 bg-white text-gray-700'} shadow-sm transition hover:scale-105`}
            title="User Profile & Settings"
          >
            👤
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
          >
            {t.signOut}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-10 flex-1 w-full">
        
        {/* ================= VIEW 1: OVERVIEW & FEATURE CARDS ================= */}
        {activeView === 'overview' && (
          <>
            <div className="text-center max-w-4xl mx-auto mb-10">
              <span className={`inline-block ${darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'} text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-3`}>
                {t.portalOverview}
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">
                {t.title}
              </h2>
              <p className={`mt-3 text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
                {t.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div 
                onClick={() => setIsChatOpen(true)}
                className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:border-green-500' : 'bg-white border-green-100 hover:border-green-400'} p-6 rounded-2xl border shadow-sm cursor-pointer transition transform hover:-translate-y-1`}
              >
                <div className="text-3xl mb-3">💬</div>
                <h3 className="text-xl font-bold mb-2">{t.feat1Title}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t.feat1Desc}
                </p>
              </div>

              <div 
                onClick={() => setIsChatOpen(true)}
                className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:border-green-500' : 'bg-white border-green-100 hover:border-green-400'} p-6 rounded-2xl border shadow-sm cursor-pointer transition transform hover:-translate-y-1`}
              >
                <div className="text-3xl mb-3">🎙️</div>
                <h3 className="text-xl font-bold mb-2">{t.feat2Title}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t.feat2Desc}
                </p>
              </div>

              <div 
                onClick={() => setActiveView('soil')}
                className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:border-green-500' : 'bg-white border-green-100 hover:border-green-400'} p-6 rounded-2xl border shadow-sm cursor-pointer transition transform hover:-translate-y-1`}
              >
                <div className="text-3xl mb-3">🌱</div>
                <h3 className="text-xl font-bold mb-2">{t.feat3Title}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t.feat3Desc}
                </p>
              </div>

              <div 
                onClick={() => setActiveView('market')}
                className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:border-green-500' : 'bg-white border-green-100 hover:border-green-400'} p-6 rounded-2xl border shadow-sm cursor-pointer transition transform hover:-translate-y-1`}
              >
                <div className="text-3xl mb-3">📈</div>
                <h3 className="text-xl font-bold mb-2">{t.feat4Title}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t.feat4Desc}
                </p>
              </div>

              <div 
                onClick={() => setActiveView('weather')}
                className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:border-green-500' : 'bg-white border-green-100 hover:border-green-400'} p-6 rounded-2xl border shadow-sm cursor-pointer transition transform hover:-translate-y-1 md:col-span-2`}
              >
                <div className="text-3xl mb-3">🌦️</div>
                <h3 className="text-xl font-bold mb-2">{t.feat5Title}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t.feat5Desc}
                </p>
              </div>
            </div>
          </>
        )}

        {/* ================= VIEW 2: USER PROFILE & SETTINGS ================= */}
        {activeView === 'profile' && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'} rounded-2xl border shadow-sm p-8 max-w-2xl mx-auto`}>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">👤 {t.profileTitle}</h2>
              <button 
                onClick={() => setActiveView('overview')}
                className="text-sm text-green-600 font-semibold hover:underline"
              >
                {t.backToOverview}
              </button>
            </div>

            {profileMessage && (
              <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
                {profileMessage}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-4 mb-8">
              <h3 className="text-lg font-bold text-green-700">Update Personal Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gmail / Email Address</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold transition shadow-md"
              >
                {t.updateDetails}
              </button>
            </form>

            <form onSubmit={handlePasswordUpdate} className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-bold text-green-700">{t.resetPassword}</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border text-xs space-y-1 text-gray-600">
                <p className="font-semibold text-gray-700">Password Requirements:</p>
                <p className={hasMinLength ? 'text-green-600 font-semibold' : ''}>✓ At least 8 characters</p>
                <p className={hasUppercase ? 'text-green-600 font-semibold' : ''}>✓ At least 1 capital letter (A-Z)</p>
                <p className={hasNumber ? 'text-green-600 font-semibold' : ''}>✓ At least 1 number (0-9)</p>
                <p className={passwordsMatch && passwordData.newPassword ? 'text-green-600 font-semibold' : ''}>✓ Passwords match</p>
              </div>

              <button
                type="submit"
                disabled={!isPasswordValid}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold transition shadow-md disabled:opacity-50"
              >
                {t.updatePassword}
              </button>
            </form>
          </div>
        )}

        {/* ================= VIEW 3: WEATHER FORECASTING & MAPS ================= */}
        {activeView === 'weather' && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'} rounded-2xl border shadow-sm p-8`}>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">🌦️ {t.weatherTitle}</h2>
                <p className="text-xs text-gray-500 mt-1">{t.weatherDesc}</p>
              </div>
              <button 
                onClick={() => setActiveView('overview')}
                className="text-sm text-green-600 font-semibold hover:underline"
              >
                {t.backToOverview}
              </button>
            </div>

            <form onSubmit={handleWeatherSearch} className="flex gap-3 mb-6">
              <input
                type="text"
                required
                value={queryLocation}
                onChange={(e) => setQueryLocation(e.target.value)}
                placeholder="Enter city or location..."
                className={`flex-1 px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-green-500 font-medium`}
              />
              <button
                type="submit"
                disabled={weatherLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-md disabled:opacity-50"
              >
                {weatherLoading ? 'Searching...' : t.searchLocation}
              </button>
            </form>

            {weatherError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">
                {weatherError}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-gray-200'}`}>
                <p className="text-xs text-gray-400">{t.temperature}</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{weatherInfo.temp}</p>
              </div>
              <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-gray-200'}`}>
                <p className="text-xs text-gray-400">{t.windSpeed}</p>
                <p className="text-2xl font-bold mt-1">{weatherInfo.wind}</p>
              </div>
              <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-gray-200'}`}>
                <p className="text-xs text-gray-400">{t.humidity}</p>
                <p className="text-2xl font-bold mt-1">{weatherInfo.humidity}</p>
              </div>
              <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-gray-200'}`}>
                <p className="text-xs text-gray-400">{t.precipitation}</p>
                <p className="text-2xl font-bold mt-1 text-blue-500">{weatherInfo.precipitation}</p>
              </div>
            </div>

            <div className="bg-slate-900 p-5 rounded-xl text-white mb-6 shadow-inner">
              <h3 className="text-sm font-semibold mb-4 text-slate-300">{t.hourlyTrend}</h3>
              <div className="h-44 w-full">
                {hourlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hourlyData}>
                      <XAxis dataKey="time" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" domain={['dataMin - 2', 'dataMax + 2']} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                      <Line type="monotone" dataKey="temp" stroke="#facc15" strokeWidth={3} dot={{ fill: '#facc15', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                    Loading chart metrics...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 4: MANDI MARKET PRICES ================= */}
        {activeView === 'market' && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'} rounded-2xl border shadow-sm p-8`}>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">📈 {t.marketTitle}</h2>
                <p className="text-xs text-gray-500 mt-1">{t.marketDesc}</p>
              </div>
              <button 
                onClick={() => { setActiveView('overview'); setCropData(null); }}
                className="text-sm text-green-600 font-semibold hover:underline"
              >
                {t.backToOverview}
              </button>
            </div>

            <form onSubmit={handleCropSearch} className="space-y-3 mb-8">
              {/* Row 1: Crop Name */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchCommodity}
                  onChange={(e) => setSearchCommodity(e.target.value)}
                  placeholder="Enter any crop name (e.g. wheat, rice, cotton)..."
                  className={`flex-1 px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-green-500 font-medium`}
                />
              </div>
              {/* Row 2: State + Local Place */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchState}
                  onChange={(e) => setSearchState(e.target.value)}
                  placeholder={t.enterStatePlaceholder}
                  className={`flex-1 px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-green-400 font-medium`}
                />
                <input
                  type="text"
                  value={searchLocalPlace}
                  onChange={(e) => setSearchLocalPlace(e.target.value)}
                  placeholder={t.enterLocalPlaceholder}
                  className={`flex-1 px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-green-400 font-medium`}
                />
                <button
                  type="submit"
                  disabled={loadingCrop}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-md disabled:opacity-50 whitespace-nowrap"
                >
                  {loadingCrop ? 'Fetching Live Rates...' : t.getPriceTrends}
                </button>
              </div>
            </form>

            {cropData ? (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="p-5 bg-green-50 border border-green-200 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-xs text-green-700 font-semibold tracking-wide uppercase">{t.selectedCommodity}</p>
                    <h3 className="text-2xl font-black text-green-900">{cropData.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">Source: {cropData.verifiedSource}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">{t.todaysRate}</p>
                    <p className="text-3xl font-extrabold text-green-700">₹{cropData.liveRate?.toLocaleString()} <span className="text-sm font-normal text-slate-600">/ {cropData.unit}</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 border rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50'}`}>
                    <p className="text-xs text-slate-400 font-medium">{t.nationalAvg}</p>
                    <p className="text-lg font-bold mt-1">{cropData.nationalAvg}</p>
                  </div>
                  <div className={`p-4 border rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50'}`}>
                    <p className="text-xs text-slate-400 font-medium">
                      {cropData.stateLabel} {t.stateRate}
                    </p>
                    <p className="text-lg font-bold mt-1">{cropData.stateAvg}</p>
                  </div>
                  <div className={`p-4 border rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50'}`}>
                    <p className="text-xs text-slate-400 font-medium">
                      {cropData.localLabel} {t.localAPMC}
                    </p>
                    <p className="text-lg font-bold mt-1">{cropData.localRate} / Quintal</p>
                  </div>
                </div>

                {/* Financial Price Trend Interactive Chart */}
                <div className={`p-6 rounded-2xl border shadow-inner ${darkMode ? 'bg-slate-900 border-gray-700' : 'bg-slate-900 text-white'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📊</span>
                        <h3 className="font-bold text-base text-white">{t.financialGraphTitle}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Interactive price curve for <strong className="text-green-400">{cropData.name}</strong> ({cropData.unit})
                      </p>
                    </div>

                    {/* Timeframe selector tabs */}
                    <div className="flex flex-wrap bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-semibold self-start sm:self-auto gap-1">
                      {[
                        { id: 'today', label: t.timeframeToday },
                        { id: 'yesterday', label: t.timeframeYesterday },
                        { id: 'week', label: t.timeframeWeek },
                        { id: 'threeMonths', label: t.timeframe3Months },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setMandiTimeframe(tab.id as any)}
                          className={`px-3 py-1.5 rounded-lg transition ${
                            mandiTimeframe === tab.id
                              ? 'bg-green-600 text-white shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Period Stats Summary Bar */}
                  {(() => {
                    const activeTf = cropData.chartTimeframes?.[mandiTimeframe] || {
                      points: [],
                      change: '+1.8%',
                      high: cropData.liveRate,
                      low: cropData.liveRate - 100,
                    };
                    return (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                            <span className="text-[11px] text-slate-400 font-medium block">{t.periodHigh}</span>
                            <span className="text-base font-bold text-green-400">
                              ₹{activeTf.high?.toLocaleString()}
                            </span>
                          </div>
                          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                            <span className="text-[11px] text-slate-400 font-medium block">{t.periodLow}</span>
                            <span className="text-base font-bold text-amber-400">
                              ₹{activeTf.low?.toLocaleString()}
                            </span>
                          </div>
                          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                            <span className="text-[11px] text-slate-400 font-medium block">{t.priceTrend}</span>
                            <span className="text-base font-bold text-emerald-400 flex items-center gap-1">
                              ▲ {activeTf.change}
                            </span>
                          </div>
                          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                            <span className="text-[11px] text-slate-400 font-medium block">Market Status</span>
                            <span className="text-base font-bold text-blue-400">
                              🟢 Active Mandi
                            </span>
                          </div>
                        </div>

                        {/* Chart Area */}
                        <div className="h-64 w-full">
                          {activeTf.points && activeTf.points.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={activeTf.points}>
                                <defs>
                                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                                <YAxis
                                  stroke="#94a3b8"
                                  tick={{ fontSize: 11 }}
                                  domain={['dataMin - 50', 'dataMax + 50']}
                                  tickFormatter={(val) => `₹${val}`}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderColor: '#334155',
                                    borderRadius: '10px',
                                    color: '#fff',
                                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                                  }}
                                  formatter={(value: any, name: any, item: any) => [
                                    `₹${Number(value).toLocaleString()} / Quintal (${item?.payload?.volume || ''})`,
                                    'Mandi Rate',
                                  ]}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="price"
                                  stroke="#10b981"
                                  strokeWidth={3}
                                  fillOpacity={1}
                                  fill="url(#priceGradient)"
                                  dot={{ fill: '#10b981', r: 4 }}
                                  activeDot={{ r: 6, fill: '#34d399' }}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                              Loading financial chart...
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold">{t.historicalTrends}</h4>
                  {cropData.history?.map((item: any, idx: number) => (
                    <div key={idx} className={`p-4 border rounded-xl flex justify-between items-center shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`}>
                      <span className="text-sm font-semibold text-gray-400">{item.period}</span>
                      <span className="text-base font-bold">{item.price}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setCropData(null)}
                  className="text-sm text-green-600 font-semibold hover:underline"
                >
                  {t.backToOverview}
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold mb-4 text-green-700">{t.topSellingHeader}</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {topSellingCrops.map((c, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleCropSearch(undefined, c.name.split(' ')[0])}
                      className={`p-5 rounded-2xl border ${darkMode ? 'border-gray-700 bg-gray-700 hover:border-green-500' : 'border-gray-200 bg-white hover:border-green-400'} shadow-sm cursor-pointer transition transform hover:-translate-y-1 flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-lg">{c.name}</h4>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-semibold">{c.demand} Demand</span>
                        </div>
                        <p className="text-2xl font-extrabold text-green-600 mt-2">{c.price}</p>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t text-xs text-gray-500">
                        <span>Trend: <strong className="text-green-600">{c.trend}</strong></span>
                        <span className="text-green-600 font-semibold hover:underline">View History →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW 5: CROP & SOIL INTELLIGENCE ================= */}
        {activeView === 'soil' && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'} rounded-2xl border shadow-sm p-8`}>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">🌱 {t.soilTitle}</h2>
              <button 
                onClick={() => setActiveView('overview')}
                className="text-sm text-green-600 font-semibold hover:underline"
              >
                {t.backToOverview}
              </button>
            </div>
            <div className="space-y-4 text-sm leading-relaxed">
              <div className={`p-4 rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-green-100 bg-green-50'}`}>
                <h4 className="font-bold text-green-700 mb-1">{t.fertilizerHeader}</h4>
                <p>{t.fertilizerDesc}</p>
              </div>
              <div className={`p-4 rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-green-100 bg-green-50'}`}>
                <h4 className="font-bold text-green-700 mb-1">{t.pestHeader}</h4>
                <p>{t.pestDesc}</p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Fixed Floating Chatbot Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsChatOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition transform hover:scale-105 group"
          title={t.chatButtonTooltip}
        >
          <span className="text-2xl">🤖</span>
          <span className="absolute right-16 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-md pointer-events-none">
            {t.chatButtonTooltip}
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