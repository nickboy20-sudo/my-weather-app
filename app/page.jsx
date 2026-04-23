"use client";
import React, { useEffect, useState } from 'react';
import { Sunrise, Sunset, Droplets, Calendar, Clock, Sun, Cloud, CloudRain, CloudLightning, Snowflake, MapPin } from 'lucide-react';
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
    const [location] = useState({ name: "București", lat: 44.4323, lon: 26.1063 });

    useEffect(() => {
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current_weather=true&hourly=temperature_2m,weather_code&daily=weather_code,sunrise,sunset,precipitation_sum,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=10`)
        .then(res => res.json())
        .then(data => setWeather(data));
    }, [location]);

    if (!weather) return <div className="min-h-screen bg-slate-950 text-blue-400 p-10 font-black italic">SE ÎNCARCĂ...</div>;

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
            pointRadius: 5,
            pointBackgroundColor: '#38bdf8',
        }]
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white p-4 md:p-10 font-sans">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">

        {/* TITLU */}
        <div className="flex items-center gap-3">
        <MapPin className="text-blue-500 w-8 h-8 animate-bounce" />
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">PROGNOZĂ BUCUREȘTI</h1>
        </div>

        {/* CARD TEMP CURENTĂ - FORȚAT FULL WIDTH */}
        <div className="w-full bg-slate-900 border-2 border-slate-800 p-8 rounded-[2rem] flex items-center justify-center gap-10 shadow-2xl">
        <WeatherIcon code={weather.current_weather.weathercode} className="w-20 h-20" />
        <div className="text-center">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">ACUM</p>
        <p className="text-7xl font-black">{Math.round(weather.current_weather.temperature)}°</p>
        </div>
        </div>

        {/* CARD PRECIPITAȚII TOTAL */}
        <div className="w-full bg-blue-600/10 border-2 border-blue-500/20 p-8 rounded-[2rem] text-center">
        <p className="text-blue-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">PRECIPITAȚII (10 ZILE)</p>
        <p className="text-6xl font-black tracking-tighter">{totalMm} <span className="text-xl font-light text-blue-300/50 italic uppercase">mm</span></p>
        </div>

        {/* GRAFIC PRECIPITAȚII - REPARAT PENTRU MOBIL */}
        <div className="w-full bg-slate-900 border-2 border-slate-800 p-6 rounded-[2rem] shadow-xl overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
        <Droplets className="w-5 h-5 text-blue-500" />
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Grafic Precipitații</h2>
        </div>
        <div className="h-64 w-full">
        <Line
        data={chartData}
        options={{
            maintainAspectRatio: false,
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#475569', font: { weight: 'bold' } }, grid: { display: false } },
                y: { ticks: { color: '#475569' }, grid: { color: '#1e293b' } }
            }
        }}
        />
        </div>
        </div>

        {/* RASARIT / APUS */}
        <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 border-2 border-slate-800 p-6 rounded-[2rem] text-center shadow-lg">
        <Sunrise className="text-orange-500 w-8 h-8 mx-auto mb-2" />
        <p className="text-slate-500 text-[10px] font-bold">RĂSĂRIT</p>
        <p className="text-2xl font-black uppercase tracking-tighter">{weather.daily.sunrise[0].split('T')[1]}</p>
        </div>
        <div className="bg-slate-900 border-2 border-slate-800 p-6 rounded-[2rem] text-center shadow-lg">
        <Sunset className="text-purple-500 w-8 h-8 mx-auto mb-2" />
        <p className="text-slate-500 text-[10px] font-bold">APUS</p>
        <p className="text-2xl font-black uppercase tracking-tighter">{weather.daily.sunset[0].split('T')[1]}</p>
        </div>
        </div>

        {/* PROGNOZA ZILNICĂ */}
        <div className="bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b-2 border-slate-800 bg-slate-800/30 font-black italic text-sm text-slate-400 uppercase tracking-widest">
        Următoarele 10 zile
        </div>
        <div className="divide-y-2 divide-slate-800">
        {weather.daily.time.map((date, i) => (
            <div key={date} className="flex justify-between p-6 items-center hover:bg-slate-800/20 transition-colors">
            <div className="flex items-center gap-4">
            <WeatherIcon code={weather.daily.weather_code[i]} className="w-8 h-8" />
            <span className="font-bold text-lg capitalize">{new Date(date).toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex gap-6 items-center">
            <div className="text-right">
            <span className="text-white font-black text-xl">{Math.round(weather.daily.temperature_2m_max[i])}°</span>
            <span className="text-slate-600 font-bold ml-2">{Math.round(weather.daily.temperature_2m_min[i])}°</span>
            </div>
            <span className="text-blue-500 font-black text-xs bg-blue-500/10 px-4 py-2 rounded-xl border-2 border-blue-500/10 min-w-[75px] text-center">
            {weather.daily.precipitation_sum[i]} mm
            </span>
            </div>
            </div>
        ))}
        </div>
        </div>

        </div>
        </main>
    );
}
