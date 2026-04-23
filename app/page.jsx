"use client";
import React, { useEffect, useState } from 'react';
import { Sunrise, Sunset, Droplets, Calendar, Clock, Sun, Cloud, CloudRain, CloudLightning, Snowflake, MapPin, Search, Map as MapIcon } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Filler, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

const WeatherIcon = ({ code, className }) => {
  if (code === 0) return <Sun className={className + " text-yellow-400"} />;
  if (code >= 1 && code <= 3) return <Cloud className={className + " text-slate-400"} />;
  if (code >= 51 && code <= 67) return <CloudRain className={className + " text-blue-400"} />;
  if (code >= 71 && code <= 77) return <Snowflake className={className + " text-blue-200"} />;
  if (code >= 95) return <CloudLightning className={className + " text-purple-400"} />;
  return <CloudRain className={className + " text-blue-400"} />;
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
        console.error("Eroare:", error);
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

  if (!weather || !weather.daily) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-400 font-mono italic">Se încarcă...</div>;
  }

  const totalMm = weather.daily.precipitation_sum.reduce((a, b) => a + b, 0).toFixed(1);

  const chartData = {
    labels: weather.daily.time.map(d => new Date(d).toLocaleDateString('ro-RO', { weekday: 'short' })),
    datasets: [{
      label: 'Precipitații (mm)',
      data: weather.daily.precipitation_sum,
      fill: true,
      backgroundColor: 'rgba(56, 189, 248, 0.1)',
      borderColor: '#38bdf8',
      tension: 0.4,
      pointBackgroundColor: '#38bdf8',
    }]
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-10 font-sans">
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-20">

    {/* TITLU SI CAUTARE */}
    <div className="space-y-4">
    <div className="flex items-center gap-2 text-blue-400">
    <MapPin className="w-6 h-6 animate-pulse" />
    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Prognoză {location.name}</h1>
    </div>
    <div className="relative">
    <input
    type="text"
    placeholder="Caută alt oraș..."
    className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 w-full text-white focus:border-blue-500 outline-none shadow-lg"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    />
    {suggestions.length > 0 && (
      <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl z-50 shadow-2xl">
      {suggestions.map((city) => (
        <button
        key={city.id}
        className="w-full text-left px-4 py-4 hover:bg-slate-800 text-white border-b border-slate-800 last:border-none flex justify-between"
        onClick={() => {
          setLocation({ name: city.name, lat: city.latitude, lon: city.longitude });
          setSearch("");
          setSuggestions([]);
        }}
        >
        <span className="font-bold">{city.name}</span>
        <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 uppercase">{city.country}</span>
        </button>
      ))}
      </div>
    )}
    </div>
    </div>

    {/* CARD TEMPERATURA CURENTA - ACUM E SEPARAT CA SA FIE FULL PE MOBIL */}
    <div className="w-full bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center justify-center gap-8 shadow-xl">
    <WeatherIcon code={weather.current_weather.weathercode} className="w-20 h-20" />
    <div>
    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Acum</p>
    <p className="text-6xl font-black text-white">{Math.round(weather.current_weather.temperature)}°</p>
    </div>
    </div>

    {/* CARD PRECIPITATII TOTAL */}
    <div className="bg-blue-600/10 border border-blue-500/30 p-8 rounded-3xl text-center">
    <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-1">Precipitații Total (10 zile)</p>
    <p className="text-5xl font-black text-white">{totalMm} <span className="text-lg font-normal text-blue-300">mm</span></p>
    </div>

    {/* GRAFIC PRECIPITATII - REPARAT PENTRU MOBIL */}
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
    <div className="flex items-center gap-2 mb-6">
    <Droplets className="w-4 h-4 text-blue-400" />
    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Grafic Precipitații (mm)</h2>
    </div>
    <div className="h-64 w-full">
    <Line
    data={chartData}
    options={{
      maintainAspectRatio: false,
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } }
      }
    }}
    />
    </div>
    </div>

    {/* RASARIT SI APUS */}
    <div className="grid grid-cols-2 gap-4">
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl text-center">
    <Sunrise className="text-orange-500 w-6 h-6 mx-auto mb-2" />
    <p className="text-slate-500 text-[10px] uppercase font-bold">Răsărit</p>
    <p className="text-lg font-black text-white">{weather.daily.sunrise[0].split('T')[1]}</p>
    </div>
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl text-center">
    <Sunset className="text-purple-500 w-6 h-6 mx-auto mb-2" />
    <p className="text-slate-500 text-[10px] uppercase font-bold">Apus</p>
    <p className="text-lg font-black text-white">{weather.daily.sunset[0].split('T')[1]}</p>
    </div>
    </div>

    {/* LISTA 10 ZILE */}
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
    <div className="p-4 border-b border-slate-800 bg-slate-800/20 text-xs font-bold text-slate-400 uppercase tracking-widest">Prognoză 10 zile</div>
    <div className="divide-y divide-slate-800">
    {weather.daily.time.map((date, i) => (
      <div key={date} className="flex justify-between p-4 items-center">
      <div className="flex items-center gap-3">
      <WeatherIcon code={weather.daily.weather_code[i]} className="w-6 h-6" />
      <span className="text-slate-200 text-sm capitalize">{new Date(date).toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric' })}</span>
      </div>
      <div className="flex gap-3 items-center">
      <span className="text-white font-bold">{Math.round(weather.daily.temperature_2m_max[i])}°</span>
      <span className="text-blue-400 text-[10px] bg-blue-400/10 px-2 py-1 rounded border border-blue-400/20">{weather.daily.precipitation_sum[i]} mm</span>
      </div>
      </div>
    ))}
    </div>
    </div>
    </div>
    </main>
  );
}
