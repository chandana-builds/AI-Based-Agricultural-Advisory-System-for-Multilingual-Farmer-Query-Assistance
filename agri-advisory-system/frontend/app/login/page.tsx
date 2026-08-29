'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }).catch(() => {
        // Catches network-level failures like ECONNREFUSED when backend is down
        throw new Error('Unable to connect to the server. Please ensure the backend is running.');
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.detail || 'Failed to login');
      }

      // Save user session in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      
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
        
        {/* Back to Home Button */}
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-semibold text-green-700 hover:text-green-900 mb-6 transition"
        >
          ← Back to Home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">🌾 Agri-Advisory</h1>
          <p className="text-gray-600 mt-2">Sign in to your farmer portal</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email or Username</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="farmer@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
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
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="text-green-600 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}