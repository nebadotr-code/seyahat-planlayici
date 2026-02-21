import { NextRequest, NextResponse } from "next/server";
import { buildLeg } from "@/lib/directions";
import { generatePlan } from "@/lib/openai";
import { saveTrip, createId } from "@/lib/store";
import type { CityInput } from "@/lib/store";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title: string = (body.title ?? "").trim().slice(0, 80);
    if (!title) return NextResponse.json({ error: "Başlık boş olamaz." }, { status: 400 });

    const rawCities: CityInput[] = body.cities ?? [];
    if (rawCities.length < 2) return NextResponse.json({ error: "En az 2 şehir giriniz." }, { status: 400 });

    const cities: CityInput[] = rawCities.map(c => ({
      name: (c.name ?? "").trim(),
      nights: clamp(Number(c.nights) || 1, 1, 14),
    }));
    for (const c of cities) {
      if (!c.name) return NextResponse.json({ error: "Şehir adı boş olamaz." }, { status: 400 });
    }

    const mode = ["mixed","train","car","flight"].includes(body.mode) ? body.mode : "mixed";
    const pace = ["relaxed","medium","intense"].includes(body.pace) ? body.pace : "medium";

    const legs = await Promise.all(
      cities.slice(0, -1).map((c, i) => buildLeg(c.name, cities[i+1].name, mode))
    );

    const planMarkdown = await generatePlan({ title, cities, legs, mode, pace });

    const trip = { id: createId(), title, cities, mode, pace, legs, planMarkdown, createdAt: new Date().toISOString() };
    saveTrip(trip);

    return NextResponse.json({ id: trip.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Beklenmeyen hata.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}