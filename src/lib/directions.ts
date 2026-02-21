import type { Leg, LegOption } from "./store";

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY ?? "";
const BASE = "https://maps.googleapis.com/maps/api/directions/json";

type TravelMode = "driving" | "transit";

async function fetchDirections(origin: string, destination: string, mode: TravelMode) {
  try {
    const url = new URL(BASE);
    url.searchParams.set("origin", origin);
    url.searchParams.set("destination", destination);
    url.searchParams.set("mode", mode);
    url.searchParams.set("key", GOOGLE_API_KEY);
    url.searchParams.set("language", "tr");
    const res = await fetch(url.toString());
    const json = await res.json();
    if (json.status !== "OK" || !json.routes?.length) return null;
    const leg = json.routes[0].legs[0];
    return { duration: leg.duration?.text ?? "Bilinmiyor", distance: leg.distance?.text ?? "Bilinmiyor" };
  } catch { return null; }
}

export async function buildLeg(from: string, to: string, mode: string): Promise<Leg> {
  // Uçuş modu
  if (mode === "flight") {
    const driving = await fetchDirections(from, to, "driving");
    const optionA: LegOption = {
      label: "✈️ Uçuş",
      duration: "Havayolu şirketine göre değişir",
      distance: driving?.distance ?? "—",
      note: `${from} → ${to} arası uçuş önerilir. Bilet için Skyscanner veya Google Flights'ı kontrol edin.`,
    };
    const optionB: LegOption = {
      label: "🚗 Araç ile",
      duration: driving?.duration ?? "Veri alınamadı",
      distance: driving?.distance ?? "—",
      note: `Alternatif olarak araç ile ${driving?.duration ?? "?"} sürer.`,
    };
    return { from, to, optionA, optionB };
  }

  // Karma / Tren modu
  const [transitData, drivingData] = await Promise.all([
    fetchDirections(from, to, "transit"),
    fetchDirections(from, to, "driving"),
  ]);

  const optionA: LegOption = {
    label: mode === "car" ? "🚗 Araç ile" : "🚆 Toplu Taşıma / Tren",
    duration: (mode === "car" ? drivingData : transitData)?.duration ?? "Veri alınamadı",
    distance: (mode === "car" ? drivingData : transitData)?.distance ?? "—",
    note: transitData
      ? `${from} → ${to} arası ${mode === "car" ? "araç" : "toplu taşıma"} ile önerilen güzergah.`
      : `${from} → ${to} arası uluslararası güzergah — tren/otobüs bileti için resmi siteleri kontrol edin.`,
  };

  const optionB: LegOption = {
    label: mode === "car" ? "🚆 Toplu Taşıma" : "🚗 Araç ile",
    duration: (mode === "car" ? transitData : drivingData)?.duration ?? "Veri alınamadı",
    distance: (mode === "car" ? transitData : drivingData)?.distance ?? "—",
    note: `Alternatif olarak ${mode === "car" ? "toplu taşıma" : "araç"} tercih edilebilir.`,
  };

  return { from, to, optionA, optionB };
}