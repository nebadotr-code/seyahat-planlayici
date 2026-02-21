import OpenAI from "openai";
import type { CityInput, Leg } from "./store";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export async function generatePlan(params: {
  title: string; cities: CityInput[]; legs: Leg[]; mode: string; pace: string;
}): Promise<string> {
  const { title, cities, legs, mode, pace } = params;
  const paceDesc = pace === "relaxed" ? "Sakin tempo" : pace === "intense" ? "Yoğun tempo" : "Orta tempo";
  const cityList = cities.map(c => `- ${c.name}: ${c.nights} gece`).join("\n");
  const legList = legs.map(l =>
    `${l.from} → ${l.to}:\n  A) ${l.optionA.label} — ${l.optionA.duration}\n  B) ${l.optionB.label} — ${l.optionB.duration}`
  ).join("\n");

  const prompt = `Sen deneyimli bir seyahat rehberisin. Türkçe seyahat planı hazırla.

Gezi: ${title}
Şehirler: ${cityList}
Ulaşım: ${mode} | Tempo: ${paceDesc}
Bacaklar: ${legList}

Şu başlıklarla Markdown yaz:

# 1. Rota Özeti
Kısa paragraf.

# 2. Şehirler Arası Ulaşım
Her bacak için A ve B seçeneği. Fiyat tahmini yapma.

# 3. Günlük Şehir Planları
Her şehir için ## ŞEHİR ADI (N Gece) başlığı.
Her gün için ### Gün X başlığı.
Her günde Sabah, Öğle, Akşam olsun.
ÖNEMLI: Her aktivitede mekan adını MUTLAKA çift yıldız ile bold yaz. Örnek:
- Sabah: **Sultanahmet Camii** ziyaret edin.
- Öğle: **Kapalıçarşı** alışveriş yapın.
- Akşam: **Galata Kulesi** manzara izleyin.

# 4. Pratik İpuçları
3-5 madde.`;

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0].message.content ?? "";
}