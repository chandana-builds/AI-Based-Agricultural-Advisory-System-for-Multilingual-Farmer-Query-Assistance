"use client";
import { useState } from "react";
import Link from "next/link";

export default function Navbar({ user, lang, setLang, darkMode, setDarkMode }: any) {
  return (
    <nav className="flex justify-between items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-lg font-bold text-green-700 dark:text-green-400">
          AI-Based-Agricultural-Advisory-System-for-Multilingual-Farmer-Query-Assistance
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <select 
          value={lang} 
          onChange={(e) => setLang(e.target.value)}
          className="p-2 border rounded-md dark:bg-gray-800 dark:text-white"
        >
          <option value="en">English</option>
          <option value="hi">हिंदी (Hindi)</option>
          <option value="te">తెలుగు (Telugu)</option>
        </select>
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
        {user ? (
          <Link href="/dashboard" className="px-4 py-2 bg-green-600 text-white rounded-md">Dashboard</Link>
        ) : (
          <Link href="/auth" className="px-4 py-2 bg-green-600 text-white rounded-md">Sign In / Sign Up</Link>
        )}
      </div>
    </nav>
  );
}