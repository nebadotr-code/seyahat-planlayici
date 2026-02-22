import { Redis } from "@upstash/redis";
import { randomUUID } from "crypto";

export interface CityInput { name: string; nights: number; }
export interface LegOption { label: string; duration: string; distance: string; note: string; }
export interface Leg { from: string; to: string; optionA: LegOption; optionB: LegOption; }
export interface Trip {
  id: string; title: string; cities: CityInput[]; mode: string; pace: string;
  legs: Leg[]; planMarkdown: string; createdAt: string;
}

function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

export function createId(): string {
  return randomUUID().replace(/-/g, "").slice(0, 12);
}

export async function getTrip(id: string): Promise<Trip | null> {
  try {
    const trip = await getRedis().get<Trip>(`trip:${id}`);
    return trip ?? null;
  } catch { return null; }
}

export async function saveTrip(trip: Trip): Promise<void> {
  await getRedis().set(`trip:${trip.id}`, trip);
}