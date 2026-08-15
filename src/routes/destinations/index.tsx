import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { DestinationCard } from "@/components/destination-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES, REGIONS } from "@/lib/destination-images";
import { destinationsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

type DestinationSearch = {
  q?: string | undefined;
  category?: string | undefined;
  region?: string | undefined;
};

export const Route = createFileRoute("/destinations/")({
  validateSearch: (search: Record<string, unknown>): DestinationSearch => ({
    q: typeof search["q"] === "string" && search["q"] ? search["q"] : undefined,
    category:
      typeof search["category"] === "string" && search["category"]
        ? search["category"]
        : undefined,
    region:
      typeof search["region"] === "string" && search["region"] ? search["region"] : undefined,
  }),

  loader: ({ context }) => context.queryClient.ensureQueryData(destinationsQuery),
  head: () => ({
    meta: [
      { title: "Kenyan Destinations — Parks, Beaches & Mountains | SafariConnect" },
      {
        name: "description",
        content:
          "Browse Kenya's national parks, beaches, lakes and mountains by county, region and travel style, then request quotes from local operators.",
      },
      { property: "og:title", content: "Kenyan Destinations | SafariConnect Kenya" },
      {
        property: "og:description",
        content: "Explore Kenya's parks, beaches, lakes and mountains by region and travel style.",
      },
      { property: "og:url", content: "/destinations" },
    ],
    links: [{ rel: "canonical", href: "/destinations" }],
  }),
  component: Destinations,
});

function Destinations() {
  const { data } = useSuspenseQuery(destinationsQuery);
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/destinations/" });

  const setSearch = (next: DestinationSearch) =>
    navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, ...next }) });




  const q = (search.q ?? "").toLowerCase();
  const results = data.filter((d) => {
    if (search.category && d.category !== search.category) return false;
    if (search.region && d.region !== search.region) return false;
    if (
      q &&
      !`${d.name} ${d.county} ${d.region} ${d.summary} ${d.activities.join(" ")}`
        .toLowerCase()
        .includes(q)
    )
      return false;
    return true;
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <p className="eyebrow text-primary">Kenya</p>
      <h1 className="mt-2 text-4xl font-semibold">Destinations</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        {data.length} parks, beaches, lakes, mountains and cities across Kenya's counties.
      </p>

      <div className="mt-8 flex items-center gap-2 rounded-2xl bg-card p-3 shadow-soft">
        <Search className="ml-1 size-4 text-muted-foreground" />
        <Input
          value={search.q ?? ""}
          onChange={(e) => setSearch({ q: e.target.value || undefined })}
          placeholder="Search by name, county or activity"
          aria-label="Search destinations"
          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="mt-6 space-y-3">
        <FilterRow
          label="Style"
          options={CATEGORIES as unknown as string[]}
          active={search.category}
          onSelect={(v) => setSearch({ category: v })}
        />
        <FilterRow
          label="Region"
          options={REGIONS as unknown as string[]}
          active={search.region}
          onSelect={(v) => setSearch({ region: v })}
        />
      </div>

      {results.length === 0 ? (
        <div className="mt-16 rounded-2xl bg-card p-10 text-center shadow-soft">
          <p className="font-semibold">No destinations match those filters.</p>
          <Button
            variant="ghost"
            className="mt-3"
            onClick={() => navigate({ search: {} })}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((d) => (
            <DestinationCard key={d.id} destination={d} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterRow({
  label,
  options,
  active,
  onSelect,
}: {
  label: string;
  options: string[];
  active: string | undefined;
  onSelect: (value?: string) => void;

}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-14 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onSelect(active === o ? undefined : o)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            active === o
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card hover:border-primary hover:text-primary",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
