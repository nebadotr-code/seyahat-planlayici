import { getTrip } from "@/lib/store";
import { notFound } from "next/navigation";
import TripClient from "./TripClient";

export default async function TripPage({ params }: { params: { id: string } }) {
  const trip = getTrip(params.id);
  if (!trip) notFound();
  return <TripClient trip={trip} />;
}