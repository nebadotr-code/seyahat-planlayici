"use client";
import ReactMarkdown from "react-markdown";
import type { Trip } from "@/lib/store";
import { useState } from "react";

export default function TripClient({ trip }: { trip: Trip }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const paceLabel: Record<string,string> = { relaxed:"🛋️ Sakin", medium:"⚖️ Orta", intense:"⚡ Yoğun" };
  const modeLabel: Record<string,string> = { mixed:"🔀 Karma", train:"🚆 Tren", car:"🚗 Araç", flight:"✈️ Uçuş" };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <a href="/" className="text-sm text-indigo-500 hover:underline">← Yeni plan oluştur</a>
        <h1 className="text-2xl font-bold mt-2 text-indigo-800">{trip.title}</h1>
        <div className="flex gap-3 mt-1 text-sm text-gray-500">
          <span>{modeLabel[trip.mode]}</span><span>·</span>
          <span>{paceLabel[trip.pace]}</span><span>·</span>
          <span>{trip.cities.map(c => c.name).join(" → ")}</span>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-8">
        <span className="text-sm text-indigo-700 flex-1 truncate">{typeof window !== "undefined" ? window.location.href : ""}</span>
        <button onClick={copyLink}
          className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 whitespace-nowrap">
          {copied ? "✓ Kopyalandı" : "🔗 Linki Kopyala"}
        </button>
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Şehirler Arası Ulaşım</h2>
        <div className="space-y-4">
          {trip.legs.map((leg, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border p-4">
              <div className="font-medium text-indigo-700 mb-3">{leg.from} → {leg.to}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[leg.optionA, leg.optionB].map((opt, j) => (
                  <div key={j} className={`rounded-lg p-3 text-sm ${j===0?"bg-indigo-50 border border-indigo-200":"bg-gray-50 border"}`}>
                    <div className="font-semibold mb-1">{j===0?"✅ Önerilen":"🔄 Alternatif"}: {opt.label}</div>
                    <div className="text-gray-600">⏱ {opt.duration} · 📍 {opt.distance}</div>
                    <div className="text-gray-500 mt-1 text-xs">{opt.note}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Gün Gün Gezi Planı</h2>
        <div className="bg-white rounded-xl shadow-sm border p-6 prose prose-indigo max-w-none">
          <ReactMarkdown>{trip.planMarkdown}</ReactMarkdown>
        </div>
      </section>

      <p className="text-center text-xs text-gray-400 mt-8">
        Bu plan yapay zeka tarafından oluşturulmuştur. Bilet fiyatları için resmi kaynakları kontrol edin.
      </p>
    </main>
  );
}