import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin } from "lucide-react";
import { destinationImage } from "@/lib/destination-images";
import type { Destination } from "@/lib/queries";

export function DestinationCard({
  destination,
}: {
  destination: Destination;
}) {
  return (
    <Link
      to="/destinations/$slug"
      params={{ slug: destination.slug }}
      className="group block overflow-hidden rounded-3xl border border-border/50 bg-card shadow-sm outline-none transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-xl focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={destinationImage(destination.slug)}
          alt={destination.name}
          loading="lazy"
          width={1024}
          height={768}
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Image overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-80" />

        {/* Category */}
        <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-white shadow-sm backdrop-blur-md">
          {destination.category}
        </span>

        {/* Explore button */}
        <span className="absolute bottom-4 right-4 flex size-10 translate-y-2 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white opacity-0 shadow-lg backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="size-5" />
        </span>

        {/* Destination name over image */}
        <div className="absolute bottom-4 left-4 right-16">
          <h3 className="font-display text-xl font-bold tracking-tight text-white drop-shadow-md sm:text-2xl">
            {destination.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <MapPin className="size-3.5 text-primary" />
          <span>
            {destination.county} County
          </span>
          <span className="text-border">•</span>
          <span>{destination.region}</span>
        </div>

        {/* Summary */}
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {destination.summary}
        </p>

        {/* Bottom action */}
        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
          <span className="text-xs font-semibold text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
            Explore destination
          </span>

          <span className="flex items-center gap-1 text-xs font-semibold text-primary">
            Discover
            <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}