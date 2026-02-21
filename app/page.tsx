"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CityRow { name: string; nights: number; }
const DEFAULT_CITIES = [
  { name: "İstanbul", nights: 3 },
  { name: "Atina", nights: 2 },
  { name: "Roma", nights: 3 },
];

export default function HomePage() {
  const router = useRouter();
  const [title, setTitle] = useState("Akdeniz Turu 2025");
  const [cities, setCities] = useState<CityRow[]>(DEFAULT_CITIES);
  const [mode, setMode] = useState("mixed");
  const [pace, setPace] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addCity = () => setCities(p => [...p, { name: "", nights: 2 }]);
  const removeCity = (i: number) => setCities(p => p.filter((_, idx) => idx !== i));
  const updateCity = (i: number, f: keyof CityRow, v: string | number) =>
    setCities(p => p.map((c, idx) => idx === i ? { ...c, [f]: v } : c));

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, cities, mode, pace }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Hata oluştu."); return; }
      router.push(`/trip/${data.id}`);
    } catch { setError("Sunucuya ulaşılamadı."); }
    finally { setLoading(false); }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-indigo-700 mb-2">🗺️ Seyahat Planlayıcı</h1>
        <p className="text-gray-700 text-sm">Şehirleri gir, AI destekli planını al.</p>
      </div>
      <div className="bg-white rounded-2xl shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">Gezi Başlığı</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={title} onChange={e => setTitle(e.target.value)} maxLength={80}
            placeholder="Örn: Balkan Turu 2025" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Şehirler (sırasıyla)</label>
          <div className="space-y-2">
            {cities.map((city, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-sm text-gray-600 w-5">{i+1}.</span>
                <input
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Şehir adı" value={city.name}
                  onChange={e => updateCity(i, "name", e.target.value)} />
                <input type="number" min={1} max={14}
                  className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={city.nights} onChange={e => updateCity(i, "nights", parseInt(e.target.value)||1)} />
                <span className="text-sm text-gray-600">gece</span>
                {cities.length > 2 && (
                  <button onClick={() => removeCity(i)} className="text-red-400 hover:text-red-600 text-xl font-bold">×</button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addCity} className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-semibold">+ Şehir Ekle</button>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Ulaşım Tercihi</label>
          <div className="flex gap-2 flex-wrap">
            {[["mixed","🔀 Karma"],["train","🚆 Tren"],["car","🚗 Araç"],["flight","✈️ Uçuş"]].map(([v,l]) => (
              <button key={v} onClick={() => setMode(v)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition ${mode===v?"bg-indigo-600 text-white border-indigo-600":"bg-white text-gray-700 border-gray-300 hover:border-indigo-400"}`}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Tempo</label>
          <div className="flex gap-2">
            {[["relaxed","🛋️ Sakin"],["medium","⚖️ Orta"],["intense","⚡ Yoğun"]].map(([v,l]) => (
              <button key={v} onClick={() => setPace(v)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition ${pace===v?"bg-indigo-600 text-white border-indigo-600":"bg-white text-gray-700 border-gray-300 hover:border-indigo-400"}`}>{l}</button>
            ))}
          </div>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm font-medium">⚠️ {error}</div>}
        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 rounded-xl text-sm">
          {loading ? "⏳ Plan hazırlanıyor... (30-60 sn)" : "🚀 Planı Oluştur"}
        </button>
      </div>
    </main>
  );
}