// src/lib/queries.ts
import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Destination = {
  id: string;
  slug: string;
  name: string;
  county: string;
  region: string;
  category: string;
  summary: string;
  description: string | null;
  best_season: string | null;
  activities: string[];
  highlights: string[];
  featured: boolean;
};

type ApiDestination = Omit<Destination, "best_season"> & { bestSeason: string | null };

function mapDestination(d: ApiDestination): Destination {
  const { bestSeason, ...rest } = d;
  return { ...rest, best_season: bestSeason };
}

export const destinationsQuery = queryOptions({
  queryKey: ["destinations"],
  queryFn: async (): Promise<Destination[]> => {
    const data = await api.get<ApiDestination[]>("/api/destinations");
    return data
      .map(mapDestination)
      .sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name));
  },
});

export const destinationQuery = (slug: string) =>
  queryOptions({
    queryKey: ["destination", slug],
    queryFn: async (): Promise<Destination | null> => {
      try {
        const data = await api.get<ApiDestination>(`/api/destinations/${slug}`);
        return mapDestination(data);
      } catch {
        return null;
      }
    },
  });

export type TripRequest = {
  id: string;
  destination_name: string;
  destination_slug: string | null;
  start_date: string | null;
  end_date: string | null;
  flexible_dates: boolean;
  adults: number;
  children: number;
  budget_usd: number | null;
  accommodation_type: string | null;
  transport_preference: string | null;
  luxury_level: string | null;
  activities: string[];
  notes: string | null;
  status: string;
  created_at: string;
};

type ApiTripRequest = {
  id: string;
  destinationName: string;
  destinationSlug: string | null;
  startDate: string | null;
  endDate: string | null;
  flexibleDates: boolean;
  adults: number;
  children: number;
  budgetUsd: number | null;
  accommodationType: string | null;
  transportPreference: string | null;
  luxuryLevel: string | null;
  activities: string[];
  notes: string | null;
  status: string;
  createdAt: string;
};

function mapTripRequest(t: ApiTripRequest): TripRequest {
  return {
    id: t.id,
    destination_name: t.destinationName,
    destination_slug: t.destinationSlug,
    start_date: t.startDate,
    end_date: t.endDate,
    flexible_dates: t.flexibleDates,
    adults: t.adults,
    children: t.children,
    budget_usd: t.budgetUsd,
    accommodation_type: t.accommodationType,
    transport_preference: t.transportPreference,
    luxury_level: t.luxuryLevel,
    activities: t.activities,
    notes: t.notes,
    status: t.status,
    created_at: t.createdAt,
  };
}

export const myTripsQuery = queryOptions({
  queryKey: ["my-trips"],
  queryFn: async (): Promise<TripRequest[]> => {
    const data = await api.get<ApiTripRequest[]>("/api/trip-requests/mine");
    return data.map(mapTripRequest);
  },
});