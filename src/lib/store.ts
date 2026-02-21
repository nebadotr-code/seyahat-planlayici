import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const DATA_FILE = path.join(process.cwd(), "data", "trips.json");

export interface CityInput { name: string; nights: number; }
export interface LegOption { label: string; duration: string; distance: string; note: string; }
export interface Leg { from: string; to: string; optionA: LegOption; optionB: LegOption; }
export interface Trip {
  id: string; title: string; cities: CityInput[]; mode: string; pace: string;
  legs: Leg[]; planMarkdown: string; createdAt: string;
}

function readAll(): Trip[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, "[]", "utf-8");
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as Trip[];
  } catch { return []; }
}

function writeAll(trips: Trip[]) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(trips, null, 2), "utf-8");
}

export function getTrip(id: string): Trip | null {
  return readAll().find(t => t.id === id) ?? null;
}
export function saveTrip(trip: Trip): void {
  const trips = readAll(); trips.push(trip); writeAll(trips);
}
export function createId(): string {
  return randomUUID().replace(/-/g, "").slice(0, 12);
}