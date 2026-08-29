// agri-advisory-system/frontend/services/api.ts

export async function fetchWeatherAPI(location: string) {
  const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`);
  const geoData = await geoRes.json();

  if (!geoData.results || geoData.results.length === 0) {
    throw new Error('Location not found.');
  }

  const { latitude, longitude, name, country } = geoData.results[0];
  const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
  const weatherJson = await weatherRes.json();

  return {
    cityName: `${name}, ${country}`,
    lat: latitude.toFixed(2),
    lon: longitude.toFixed(2),
    temp: weatherJson.current_weather.temperature,
    windspeed: weatherJson.current_weather.windspeed,
  };
}