'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Supported UI languages on the login page
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'te', label: 'తెలుగు' },
];

// Static translations for the login page labels
const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    backToHome: '← Back to Home',
    title: '🌾 Agri-Advisory',
    subtitle: 'Sign in to your farmer portal',
    emailLabel: 'Email or Username',
    emailPlaceholder: 'farmer@example.com',
    passwordLabel: 'Password',
    signIn: 'Sign In',
    signingIn: 'Logging in...',
    noAccount: "Don't have an account?",
    signUp: 'Sign up',
    selectLanguage: 'Language',
  },
  hi: {
    backToHome: '← होम पर वापस',
    title: '🌾 कृषि-सलाहकार',
    subtitle: 'अपने किसान पोर्टल में साइन इन करें',
    emailLabel: 'ईमेल या उपयोगकर्ता नाम',
    emailPlaceholder: 'farmer@example.com',
    passwordLabel: 'पासवर्ड',
    signIn: 'साइन इन करें',
    signingIn: 'लॉग इन हो रहा है...',
    noAccount: 'खाता नहीं है?',
    signUp: 'साइन अप करें',
    selectLanguage: 'भाषा',
  },
  te: {
    backToHome: '← హోమ్‌కు తిరిగి వెళ్ళు',
    title: '🌾 వ్యవసాయ-సలహా',
    subtitle: 'మీ రైతు పోర్టల్‌లో సైన్ ఇన్ చేయండి',
    emailLabel: 'ఇమెయిల్ లేదా వినియోగదారు పేరు',
    emailPlaceholder: 'farmer@example.com',
    passwordLabel: 'పాస్‌వర్డ్',
    signIn: 'సైన్ ఇన్',
    signingIn: 'లాగిన్ అవుతోంది...',
    noAccount: 'ఖాతా లేదా?',
    signUp: 'సైన్ అప్',
    selectLanguage: 'భాష',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const backendHost =
      process.env.NEXT_PUBLIC_API_URL ||
      'https://ai-based-agricultural-advisory-system-ouyx.onrender.com';

    try {
      let res: Response;
      try {
        res = await fetch(`${backendHost}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
      } catch {
        res = await fetch(`/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.detail || 'Failed to login');
      }

      // Save user session in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      // Persist chosen language so the dashboard can pick it up
      localStorage.setItem('preferredLanguage', language);

      // Redirect to dashboard or home page
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4 relative">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-green-100 relative">

        {/* Top row: Back to Home + Language Selector */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-semibold text-green-700 hover:text-green-900 transition"
          >
            {t.backToHome}
          </Link>

          {/* Language Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">🌐 {t.selectLanguage}:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2 py-1 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">{t.title}</h1>
          <p className="text-gray-600 mt-2">{t.subtitle}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.emailLabel}</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder={t.emailPlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.passwordLabel}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition duration-200 disabled:opacity-50"
          >
            {loading ? t.signingIn : t.signIn}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {t.noAccount}{' '}
          <Link href="/signup" className="text-green-600 font-semibold hover:underline">
            {t.signUp}
          </Link>
        </p>
      </div>
    </div>
  );
}