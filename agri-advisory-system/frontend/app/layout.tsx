import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgriAssist AI — Multilingual Agricultural Advisory & Farmer Support System",
  description:
    "AI-powered multilingual farmer advisory platform providing verified ICAR crop intelligence, live APMC mandi prices, voice query assistance, and hyper-local weather alerts in English, हिन्दी, and తెలుగు.",
  keywords: [
    "Agriculture AI",
    "Farmer Advisory",
    "Multilingual Farmer Query",
    "Mandi Rates",
    "APMC Commodity Prices",
    "ICAR Guidelines",
    "Crop Pest Diagnosis",
    "Weather Advisory"
  ],
  authors: [{ name: "AI Agri Advisory System" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
