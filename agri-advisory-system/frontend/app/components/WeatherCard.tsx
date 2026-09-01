'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface HourlyPoint {
  time: string;
  temp: number;
}

interface WeatherCardProps {
  darkMode?: boolean;
}

export default function WeatherCard({ darkMode = false }: WeatherCardProps) {
  const [queryLocation, setQueryLocation] = useState('Warangal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Function to fetch live weather data for given coordinates and location name
  const fetchWeatherData = async (latitude: number, longitude: number, displayName: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetching current weather & hourly forecast from Open-Meteo free API
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&hourly=temperature_2m`
      );
      
      if (!res.ok) throw new Error('Failed to fetch weather data.');
      
      const data = await res.json();

      // Update current weather metrics
      setWeatherInfo({
        city: displayName,
        lat: latitude.toFixed(2),
        lon: longitude.toFixed(2),
        temp: `${Math.round(data.current.temperature_2m)}°C`,
        humidity: `${data.current.relative_humidity_2m}%`,
        wind: `${Math.round(data.current.wind_speed_10m)} km/h`,
        precipitation: `${data.current.precipitation || 0}%`
      });

      // Parse next 8 hours for the Recharts graph
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
      setError(err.message || 'Error loading live weather.');
    } finally {
      setLoading(false);
    }
  };

  // Search handler using OpenStreetMap Nominatim Geocoding API to convert city name to lat/lon
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = queryLocation.trim();
    if (!formatted) return;

    try {
      setLoading(true);
      setError(null);

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
      setError(err.message || 'Failed to resolve location.');
      setLoading(false);
    }
  };

  // Load default location (Warangal) automatically on component mount
  useEffect(() => {
    fetchWeatherData(18.00, 79.58, 'Warangal, India');
  }, []);

  return (
    <div className={`p-6 rounded-2xl shadow-md border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
      
      {/* Header & Location Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">📍 {weatherInfo.city}</h2>
          <p className="text-xs text-gray-400 mt-0.5">Latitude: {weatherInfo.lat} | Longitude: {weatherInfo.lon}</p>
        </div>
        <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full font-medium">
          {loading ? 'Fetching Live Data...' : 'Open-Meteo API Live'}
        </span>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-4">
        <input
          type="text"
          value={queryLocation}
          onChange={(e) => setQueryLocation(e.target.value)}
          placeholder="Search location or city (e.g. Warangal, Hanamkonda)..."
          className={`flex-1 p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}
        />
        <button 
          type="submit" 
          disabled={loading}
          className="px-5 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Quick Select Region Pills for Convenience */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-xs font-semibold text-gray-400 self-center mr-1">Quick Select:</span>
        <button type="button" onClick={() => { setQueryLocation('Warangal'); fetchWeatherData(17.9689, 79.5941, 'Warangal, India'); }} className="px-3 py-1 bg-green-50 dark:bg-gray-700 border border-green-200 dark:border-gray-600 rounded-lg text-xs font-medium hover:bg-green-600 hover:text-white transition">Warangal</button>
        <button type="button" onClick={() => { setQueryLocation('Hanamkonda'); fetchWeatherData(18.0000, 79.5500, 'Hanamkonda, India'); }} className="px-3 py-1 bg-green-50 dark:bg-gray-700 border border-green-200 dark:border-gray-600 rounded-lg text-xs font-medium hover:bg-green-600 hover:text-white transition">Hanamkonda</button>
        <button type="button" onClick={() => { setQueryLocation('Kazipet'); fetchWeatherData(17.9333, 79.5000, 'Kazipet, India'); }} className="px-3 py-1 bg-green-50 dark:bg-gray-700 border border-green-200 dark:border-gray-600 rounded-lg text-xs font-medium hover:bg-green-600 hover:text-white transition">Kazipet</button>
        <button type="button" onClick={() => { setQueryLocation('Jangaon'); fetchWeatherData(17.7297, 79.1764, 'Jangaon, India'); }} className="px-3 py-1 bg-green-50 dark:bg-gray-700 border border-green-200 dark:border-gray-600 rounded-lg text-xs font-medium hover:bg-green-600 hover:text-white transition">Jangaon</button>
      </div>

      {/* Weather Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-gray-200'}`}>
          <p className="text-xs text-gray-400">Temperature</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{weatherInfo.temp}</p>
        </div>
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-gray-200'}`}>
          <p className="text-xs text-gray-400">Wind Speed</p>
          <p className="text-2xl font-bold mt-1">{weatherInfo.wind}</p>
        </div>
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-gray-200'}`}>
          <p className="text-xs text-gray-400">Humidity</p>
          <p className="text-2xl font-bold mt-1">{weatherInfo.humidity}</p>
        </div>
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-gray-200'}`}>
          <p className="text-xs text-gray-400">Precipitation</p>
          <p className="text-2xl font-bold mt-1 text-blue-500">{weatherInfo.precipitation}</p>
        </div>
      </div>

      {/* Hourly Temperature Line Graph */}
      <div className="bg-slate-900 p-5 rounded-xl text-white mb-6 shadow-inner">
        <h3 className="text-sm font-semibold mb-4 text-slate-300">Live Hourly Temperature Trend</h3>
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
  );
}