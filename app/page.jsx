"use client";
import React, { useEffect, useState } from 'react';
import { Sunrise, Sunset, Droplets, Calendar, Clock, Sun, Cloud, CloudRain, CloudLightning, Snowflake, MapPin, Search, Map as MapIcon } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Filler, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

// Componenta pentru Iconițe (Curățată de TypeScript)
const WeatherIcon = ({ code, className }) => {
  if (code === 0) return <Sun className={`${className} text-yellow-400`} />;
  if (code >= 1 && code <= 3) return <Cloud className={`${className} text-slate-400`} />;
  if (code >= 51 && code <= 67) return <CloudRain className={`${className} text-blue-400`} />;
  if (code >= 71 && code <= 77) return <Snowflake className={`${className} text-blue-200`} />;
  if (code >= 95) return <CloudLightning className={`${className} text-purple-400`} />;
  return <CloudRain className={`${className} text-blue-400`} />;
};

export default function WeatherApp() {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState({ name: "București", lat: 44.4323, lon: 26.1063 });
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current_weather=true&hourly=temperature_2m,weather_code&daily=weather_code,sunrise,sunset,precipitation_sum,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=10`);
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error("Eroare la preluarea datelor:", error);
      }
    };
    fetchWeather();
  }, [location]);

  useEffect(() => {
    if (search.length < 3) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${search}&count=5&language=ro&format=json`)
      .then(res => res.json())
      .then(data => setSuggestions(data.results || []));
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Verificare de siguranță pentru date
  if (!weather || !weather.daily) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-400 font-mono italic">
      Se încarcă prognoza pentru {location.name}...
      </div>
    );
  }

  const totalMm = weather.daily.precipitation_sum?.reduce((a, b) => a + b, 0).toFixed(1);

  const chartData = {
    labels: weather.daily.time || [],
    datasets: [{
      label: 'Precipitații (mm)',
      data: weather.daily.precipitation_sum || [],
      fill: true,
      backgroundColor: 'rgba(56, 189, 248, 0.1)',
      borderColor: '#38bdf8',
      tension: 0.4,
    }]
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-10 font-sans">
    <div className="max-w-4xl mx-auto space-y-6 pb-20">

    {/* HEADER: LOCATIE + STAREA ACTUALA */}
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
    <div className="space-y-4 w-full md:w-auto">
    <div className="flex items-center gap-2 text-blue-400">
    <MapPin className="w-6 h-6 animate-pulse" />
    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Prognoză {location.name}</h1>
    </div>

    <div className="relative">
    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 focus-within:border-blue-500 transition shadow-xl">
    <Search className="w-5 h-5 text-slate-500 mr-2" />
    <input
    type="text"
    placeholder="Caută alt oraș..."
    className="bg-transparent border-none outline-none w-full text-white"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    />
    </div>
    {suggestions.length > 0 && (
      <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden z-50 shadow-2xl">
      {suggestions.map((city) => (
        <button
        key={city.id}
        className="w-full text-left px-4 py-4 hover:bg-slate-800 border-b border-slate-800 last:border-none flex justify-between items-center"
        onClick={() => {
          setLocation({ name: city.name, lat: city.latitude, lon: city.longitude });
          setSearch("");
          setSuggestions([]);
        }}
        >
        <span className="font-bold text-white">{city.name}</span>
        <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 font-mono uppercase">{city.country}</span>
        </button>
      ))}
      </div>
    )}
    </div>
    </div>

    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 p-6 rounded-[2.5rem] flex items-center gap-6 shadow-2xl min-w-[220px]">
    <WeatherIcon code={weather.current_weather.weathercode} className="w-16 h-16" />
    <div>
    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Acum</p>
    <p className="text-5xl font-black text-white">{Math.round(weather.current_weather.temperature)}°</p>
    </div>
    </div>
    </header>

    {/* SUMAR PRECIPITAȚII ȘI SOARE */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="bg-blue-600/10 border border-blue-500/30 p-6 rounded-3xl flex flex-col justify-center items-center text-center">
    <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-1 leading-none">Total Precipitații (10z)</p>
    <p className="text-4xl font-black text-white leading-tight">{totalMm} <span className="text-sm font-normal text-blue-300">mm</span></p>
    </div>
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center gap-4">
    <Sunrise className="text-orange-500 w-6 h-6" />
    <div>
    <p className="text-slate-500 text-[10px] uppercase font-bold italic">Răsărit</p>
    <p className="text-xl font-semibold text-white">{weather.daily.sunrise[0].split('T')[1]}</p>
    </div>
    </div>
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center gap-4">
    <Sunset className="text-purple-500 w-6 h-6" />
    <div>
    <p className="text-slate-500 text-[10px] uppercase font-bold italic">Apus</p>
    <p className="text-xl font-semibold text-white">{weather.daily.sunset[0].split('T')[1]}</p>
    </div>
    </div>
    </div>

    {/* EVOLUȚIE PE ORE */}
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl overflow-hidden shadow-xl">
    <h2 className="text-xs font-bold mb-4 flex items-center gap-2 text-slate-400 uppercase tracking-widest"><Clock className="w-4 h-4" /> Evoluție 24 ore</h2>
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
    {weather.hourly.time.slice(0, 24).map((time, i) => (
      <div key={time} className="flex-shrink-0 bg-slate-800/30 p-4 rounded-2xl text-center min-w-[85px] border border-slate-700/50">
      <p className="text-slate-400 text-[10px] mb-2 font-mono italic">{new Date(time).getHours()}:00</p>
      <WeatherIcon code={weather.hourly.weather_code[i]} className="w-6 h-6 mx-auto mb-3" />
      <p className="text-xl font-bold text-white">{Math.round(weather.hourly.temperature_2m[i])}°</p>
      </div>
    ))}
    </div>
    </div>

    {/* LISTA 10 ZILE */}
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
    <div className="p-4 border-b border-slate-800 bg-slate-800/20">
    <h2 className="text-xs font-bold flex items-center gap-2 text-slate-400 uppercase tracking-widest"><Calendar className="w-4 h-4" /> Prognoză 10 zile</h2>
    </div>
    <div className="divide-y divide-slate-800">
    {weather.daily.time.map((date, i) => (
      <div key={date} className="flex justify-between p-4 items-center hover:bg-slate-800/40 transition-colors">
      <div className="flex items-center gap-4 min-w-[140px]">
      <WeatherIcon code={weather.daily.weather_code[i]} className="w-6 h-6" />
      <span className="text-slate-200 font-medium text-sm capitalize">
      {new Date(date).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric' })}
      </span>
      </div>
      <div className="flex items-center gap-4">
      <div className="text-right flex gap-3 mr-4 font-mono text-sm">
      <span className="text-white font-bold">{Math.round(weather.daily.temperature_2m_max[i])}°</span>
      <span className="text-slate-500">{Math.round(weather.daily.temperature_2m_min[i])}°</span>
      </div>
      <span className="text-blue-400 font-mono font-bold text-xs bg-blue-400/10 px-3 py-1 rounded-lg border border-blue-400/20 w-[65px] text-center">
      {weather.daily.precipitation_sum[i]} mm
      </span>
      </div>
      </div>
    ))}
    </div>
    </div>

    {/* RADAR */}
    <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
    <div className="p-4 border-b border-slate-800 flex items-center gap-2 bg-slate-800/20">
    <MapIcon className="w-4 h-4 text-blue-400" />
    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Harta Radar Live</h2>
    </div>
    <div className="h-[450px] w-full bg-slate-800">
    <iframe
    title="Windy Weather Radar"
    width="100%"
    height="100%"
    src={`https://embed.windy.com/embed2.html?lat=${location.lat}&lon=${location.lon}&zoom=6&level=surface&overlay=rain&product=ecmwf&menu=&message=true&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`}
    frameBorder="0"
    ></iframe>
    </div>
    </section>

    </div>
    </main>
  );
}
