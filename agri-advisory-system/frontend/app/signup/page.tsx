'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

  // Password validation checks
  const password = formData.password;
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Please fulfill all password requirements before signing up.');
      return;
    }

    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

    try {
      const res = await fetch(`${apiUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      }).catch(() => {
        // Catches network-level connection drops (ERR_CONNECTION_REFUSED)
        throw new Error('Unable to connect to the server. Please ensure the backend is running.');
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.detail || 'Failed to create account');
      }

      // Redirect to the login page upon successful account creation
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-green-100">
        
        {/* Back to Home Button */}
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-semibold text-green-700 hover:text-green-900 mb-6 transition"
        >
          ← Back to Home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">🌾 Agri-Advisory</h1>
          <p className="text-gray-600 mt-2">Create your farmer account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
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
              <p className="font-semibold text-gray-700 mb-1">Password Requirements:</p>
              
              <div className={`flex items-center gap-2 transition-colors duration-200 ${hasMinLength ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[10px] ${hasMinLength ? 'bg-green-600 text-white shadow-sm shadow-green-200' : 'bg-gray-200 text-gray-500'}`}>
                  {hasMinLength ? '✓' : '•'}
                </span>
                At least 8 characters
              </div>

              <div className={`flex items-center gap-2 transition-colors duration-200 ${hasUppercase ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[10px] ${hasUppercase ? 'bg-green-600 text-white shadow-sm shadow-green-200' : 'bg-gray-200 text-gray-500'}`}>
                  {hasUppercase ? '✓' : '•'}
                </span>
                At least 1 capital letter (A-Z)
              </div>

              <div className={`flex items-center gap-2 transition-colors duration-200 ${hasNumber ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[10px] ${hasNumber ? 'bg-green-600 text-white shadow-sm shadow-green-200' : 'bg-gray-200 text-gray-500'}`}>
                  {hasNumber ? '✓' : '•'}
                </span>
                At least 1 number (0-9)
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid}
            className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-green-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}