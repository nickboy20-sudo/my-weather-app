"use client"; // Tells the computer this is an interactive page
import React, { useEffect, useState } from 'react';
import { Sunrise, Sunset, Droplets, Calendar } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Filler, Legend
} from 'chart.js';

// Setting up the Chart engine
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

export default function WeatherApp() {
  const [weather, setWeather] = useState(null);

  // This "Effect" runs as soon as the page opens
  useEffect(() => {
    // We are asking for New York coordinates (Lat 40.7, Long -74.0)
    // You can change these numbers for your city!
    fetch("https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.00&daily=sunrise,sunset,precipitation_sum&timezone=auto&forecast_days=10")
    .then(res => res.json())
    .then(data => setWeather(data));
  }, []);

  if (!weather) return <div className="p-10 text-white">Loading Weather...</div>;

  // This prepares the data for your Precipitation Graphic
  const chartData = {
    labels: weather.daily.time,
    datasets: [{
      label: 'Precipitation (mm)',
      data: weather.daily.precipitation_sum,
      fill: true,
      backgroundColor: 'rgba(56, 189, 248, 0.2)', // Light blue fill
      borderColor: '#38bdf8', // Bright blue line
      tension: 0.4, // This makes the line "curvy" and beautiful
    }]
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-10">
    <div className="max-w-4xl mx-auto space-y-6">

    {/* HEADER */}
    <header className="flex justify-between items-end">
    <div>
    <h1 className="text-4xl font-bold tracking-tight">Weather Dashboard</h1>
    <p className="text-slate-400">10-Day Rainfall & Sun Schedule</p>
    </div>
    <div className="text-right text-sm text-slate-500">2026 Edition</div>
    </header>

    {/* TOP CARDS: SUNRISE & SUNSET */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center gap-4">
    <div className="p-3 bg-orange-500/10 rounded-2xl"><Sunrise className="text-orange-500" /></div>
    <div>
    <p className="text-slate-400 text-xs uppercase tracking-wider">Sunrise</p>
    <p className="text-2xl font-semibold">{weather.daily.sunrise[0].split('T')[1]}</p>
    </div>
    </div>
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center gap-4">
    <div className="p-3 bg-purple-500/10 rounded-2xl"><Sunset className="text-purple-500" /></div>
    <div>
    <p className="text-slate-400 text-xs uppercase tracking-wider">Sunset</p>
    <p className="text-2xl font-semibold">{weather.daily.sunset[0].split('T')[1]}</p>
    </div>
    </div>
    </div>

    {/* THE GRAPHIC: PRECIPITATION */}
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
    <div className="flex items-center gap-2 mb-6">
    <Droplets className="text-blue-400 w-5 h-5" />
    <h2 className="text-lg font-medium">Precipitation Forecast (mm)</h2>
    </div>
    <div className="h-64">
    <Line data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false }}}} />
    </div>
    </div>

    {/* 10-DAY LIST */}
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
    <div className="p-4 border-b border-slate-800 flex items-center gap-2">
    <Calendar className="w-5 h-5 text-slate-400" />
    <h2 className="font-medium">10-Day Outlook</h2>
    </div>
    <div className="divide-y divide-slate-800">
    {weather.daily.time.map((date, i) => (
      <div key={date} className="flex justify-between p-4 items-center hover:bg-slate-800/30 transition">
      <span className="text-slate-300 font-medium">
      {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
      </span>
      <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm font-mono">
      {weather.daily.precipitation_sum[i]} mm
      </span>
      </div>
    ))}
    </div>
    </div>

    </div>
    </main>
  );
}
