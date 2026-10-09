'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Supported UI languages on the signup page
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'te', label: 'తెలుగు' },
];

// Static translations for the signup page labels
const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    backToHome: '← Back to Home',
    title: '🌾 Agri-Advisory',
    subtitle: 'Create your farmer account',
    firstName: 'First Name',
    lastName: 'Last Name',
    username: 'Username',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    passwordRequirements: 'Password Requirements:',
    req8Chars: 'At least 8 characters',
    reqUppercase: 'At least 1 capital letter (A-Z)',
    reqNumber: 'At least 1 number (0-9)',
    signUp: 'Sign Up',
    creatingAccount: 'Creating Account...',
    haveAccount: 'Already have an account?',
    signIn: 'Sign in',
    selectLanguage: 'Language',
    passwordError: 'Please fulfill all password requirements before signing up.',
  },
  hi: {
    backToHome: '← होम पर वापस',
    title: '🌾 कृषि-सलाहकार',
    subtitle: 'अपना किसान खाता बनाएं',
    firstName: 'पहला नाम',
    lastName: 'अंतिम नाम',
    username: 'उपयोगकर्ता नाम',
    emailLabel: 'ईमेल पता',
    passwordLabel: 'पासवर्ड',
    passwordRequirements: 'पासवर्ड आवश्यकताएँ:',
    req8Chars: 'कम से कम 8 अक्षर',
    reqUppercase: 'कम से कम 1 बड़ा अक्षर (A-Z)',
    reqNumber: 'कम से कम 1 अंक (0-9)',
    signUp: 'साइन अप करें',
    creatingAccount: 'खाता बन रहा है...',
    haveAccount: 'पहले से खाता है?',
    signIn: 'साइन इन करें',
    selectLanguage: 'भाषा',
    passwordError: 'साइन अप करने से पहले कृपया सभी पासवर्ड आवश्यकताएँ पूरी करें।',
  },
  te: {
    backToHome: '← హోమ్‌కు తిరిగి వెళ్ళు',
    title: '🌾 వ్యవసాయ-సలహా',
    subtitle: 'మీ రైతు ఖాతాను సృష్టించండి',
    firstName: 'మొదటి పేరు',
    lastName: 'చివరి పేరు',
    username: 'వినియోగదారు పేరు',
    emailLabel: 'ఇమెయిల్ చిరునామా',
    passwordLabel: 'పాస్‌వర్డ్',
    passwordRequirements: 'పాస్‌వర్డ్ అవసరాలు:',
    req8Chars: 'కనీసం 8 అక్షరాలు',
    reqUppercase: 'కనీసం 1 పెద్ద అక్షరం (A-Z)',
    reqNumber: 'కనీసం 1 సంఖ్య (0-9)',
    signUp: 'సైన్ అప్',
    creatingAccount: 'ఖాతా సృష్టిస్తోంది...',
    haveAccount: 'ఇప్పటికే ఖాతా ఉందా?',
    signIn: 'సైన్ ఇన్',
    selectLanguage: 'భాష',
    passwordError: 'సైన్ అప్ చేయడానికి ముందు దయచేసి అన్ని పాస్‌వర్డ్ అవసరాలను నెరవేర్చండి.',
  },
};

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Password validation checks
  const password = formData.password;
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError(
        language === 'hi'
          ? 'पासवर्ड में कम से कम 6 अक्षर होने चाहिए।'
          : language === 'te'
          ? 'పాస్‌వర్డ్‌లో కనీసం 6 అక్షరాలు ఉండాలి.'
          : 'Password must be at least 6 characters long.'
      );
      return;
    }

    setLoading(true);
    const rawBackend =
      process.env.NEXT_PUBLIC_API_URL ||
      'https://ai-based-agricultural-advisory-system-ouyx.onrender.com';
    const backendHost = rawBackend.replace(/\/+$/, '');

    try {
      const res = await fetch(`${backendHost}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.detail || 'Failed to create account');
      }

      // Persist chosen language so the dashboard can pick it up after login
      localStorage.setItem('preferredLanguage', language);

      // Redirect to the login page upon successful account creation
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Unable to connect to server. Please check your internet or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-green-100">

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

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.firstName}</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="Ramesh"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.lastName}</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="Patel"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.username}</label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="ramesh_patel"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.emailLabel}</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="farmer@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.passwordLabel}</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="••••••••"
            />

            {/* Live Password Validation Requirement Checklist */}
            <div className="mt-3 space-y-1.5 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
              <p className="font-semibold text-gray-700 mb-1">{t.passwordRequirements}</p>

              <div className={`flex items-center gap-2 transition-colors duration-200 ${hasMinLength ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[10px] ${hasMinLength ? 'bg-green-600 text-white shadow-sm shadow-green-200' : 'bg-gray-200 text-gray-500'}`}>
                  {hasMinLength ? '✓' : '•'}
                </span>
                {t.req8Chars}
              </div>

              <div className={`flex items-center gap-2 transition-colors duration-200 ${hasUppercase ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[10px] ${hasUppercase ? 'bg-green-600 text-white shadow-sm shadow-green-200' : 'bg-gray-200 text-gray-500'}`}>
                  {hasUppercase ? '✓' : '•'}
                </span>
                {t.reqUppercase}
              </div>

              <div className={`flex items-center gap-2 transition-colors duration-200 ${hasNumber ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[10px] ${hasNumber ? 'bg-green-600 text-white shadow-sm shadow-green-200' : 'bg-gray-200 text-gray-500'}`}>
                  {hasNumber ? '✓' : '•'}
                </span>
                {t.reqNumber}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition duration-200 disabled:opacity-50"
          >
            {loading ? t.creatingAccount : t.signUp}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {t.haveAccount}{' '}
          <Link href="/login" className="text-green-600 font-semibold hover:underline">
            {t.signIn}
          </Link>
        </p>
      </div>
    </div>
  );
}