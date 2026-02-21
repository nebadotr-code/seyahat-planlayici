"use client";
import ReactMarkdown from "react-markdown";
import type { Trip } from "@/lib/store";
import { useState, useEffect } from "react";
import type { Components } from "react-markdown";

async function fetchWikiImage(placeName: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(placeName)}`
    );
    const data = await res.json();
    return data?.thumbnail?.source ?? null;
  } catch { return null; }
}

function PlaceImage({ name }: { name: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    // Kısa metinleri atla (yemek, genel tavsiye vs.)
    if (name.length < 4 || name.length > 60) { setTried(true); return; }
    fetchWikiImage(name).then(s => { setSrc(s); setTried(true); });
  }, [name]);

  if (!tried || !src) return null;

  return (
    <div className="my-3 rounded-xl overflow-hidden shadow-md">
      <img src={src} alt={name} className="w-full h-52 object-cover" />
      <div className="bg-gray-800 text-white text-xs px-3 py-1.5 font-medium">📸 {name}</div>
    </div>
  );
}

const components: Components = {
  strong({ children }) {
    const text = String(children);
    return (
      <>
        <strong className="text-gray-900 font-bold">{children}</strong>
        <PlaceImage name={text} />
      </>
    );
  },
  h1({ children }) { return <h1 className="text-indigo-800 text-xl font-bold mt-6 mb-3">{children}</h1>; },
  h2({ children }) { return <h2 className="text-indigo-700 text-lg font-bold mt-5 mb-2">{children}</h2>; },
  h3({ children }) { return <h3 className="text-indigo-600 text-base font-semibold mt-4 mb-1">{children}</h3>; },
  p({ children }) { return <p className="text-gray-900 mb-2 leading-relaxed">{children}</p>; },
  li({ children }) { return <li className="text-gray-900 mb-2 leading-relaxed">{children}</li>; },
};

export default function TripClient({ trip }: { trip: Trip }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => { setUrl(window.location.href); }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const paceLabel: Record<string,string> = { relaxed:"🛋️ Sakin", medium:"⚖️ Orta", intense:"⚡ Yoğun" };
  const modeLabel: Record<string,string> = { mixed:"🔀 Karma", train:"🚆 Tren", car:"🚗 Araç", flight:"✈️ Uçuş" };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <a href="/" className="text-sm text-indigo-500 hover:underline">← Yeni plan oluştur</a>
        <h1 className="text-2xl font-bold mt-2 text-indigo-800">{trip.title}</h1>
        <div className="flex gap-3 mt-1 text-sm text-gray-600 flex-wrap">
          <span>{modeLabel[trip.mode]}</span><span>·</span>
          <span>{paceLabel[trip.pace]}</span><span>·</span>
          <span>{trip.cities.map(c => c.name).join(" → ")}</span>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-8">
        <span className="text-sm text-indigo-700 flex-1 truncate">{url}</span>
        <button onClick={copyLink} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 whitespace-nowrap">
          {copied ? "✓ Kopyalandı" : "🔗 Linki Kopyala"}
        </button>
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Şehirler Arası Ulaşım</h2>
        <div className="space-y-4">
          {trip.legs.map((leg, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border p-4">
              <div className="font-semibold text-indigo-700 mb-3 text-base">{leg.from} → {leg.to}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[leg.optionA, leg.optionB].map((opt, j) => (
                  <div key={j} className={`rounded-lg p-3 text-sm ${j===0?"bg-indigo-50 border border-indigo-200":"bg-gray-50 border border-gray-200"}`}>
                    <div className="font-semibold mb-1 text-gray-900">{j===0?"✅ Önerilen":"🔄 Alternatif"}: {opt.label}</div>
                    <div className="text-gray-800">⏱ {opt.duration} · 📍 {opt.distance}</div>
                    <div className="text-gray-600 mt-1 text-xs">{opt.note}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Gün Gün Gezi Planı</h2>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <ReactMarkdown components={components}>{trip.planMarkdown}</ReactMarkdown>
        </div>
      </section>

      <p className="text-center text-xs text-gray-500 mt-8">
        Bu plan yapay zeka tarafından oluşturulmuştur. Bilet fiyatları için resmi kaynakları kontrol edin.
      </p>
    </main>
  );
}