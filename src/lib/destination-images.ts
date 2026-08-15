import maasaiMara from "@/assets/dest-maasai-mara.jpg";
import amboseli from "@/assets/dest-amboseli.jpg";
import diani from "@/assets/dest-diani.jpg";
import mountKenya from "@/assets/forest-from-kakamega1.jpg";
import naivasha from "@/assets/dest-naivasha.jpg";
import lamu from "@/assets/dest-lamu.jpg";
import nairobiPark from "@/assets/dest-nairobi-park.jpg";
import savannah from "@/assets/hero-savannah.jpg";

const bySlug: Record<string, string> = {
  "maasai-mara": maasaiMara,
  amboseli: amboseli,
  "diani-beach": diani,
  "mount-kenya": mountKenya,
  "lake-naivasha": naivasha,
  "hells-gate": naivasha,
  "lake-nakuru": naivasha,
  lamu: lamu,
  watamu: diani,
  malindi: diani,
  mombasa: lamu,
  "nairobi-national-park": nairobiPark,
  nairobi: nairobiPark,
  "nanyuki-laikipia": mountKenya,
  aberdare: mountKenya,
  "marsabit": mountKenya,
  "kakamega-forest": mountKenya,
  "saiwa-swamp": naivasha,
  kisumu: naivasha,
  "lake-turkana": naivasha,
};

export function destinationImage(slug: string): string {
  return bySlug[slug] ?? savannah;
}

export const CATEGORIES = [
  "Safari",
  "Beach",
  "Mountain",
  "Cultural",
  "Lakes",
  "Adventure",
  "Nature",
  "City",
] as const;

export const REGIONS = [
  "Rift Valley",
  "Coast",
  "Central",
  "Northern",
  "Western",
  "Eastern",
  "Nairobi",
] as const;
