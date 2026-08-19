import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarRange, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewsSection } from "@/components/reviews-section";

import { destinationImage } from "@/lib/destination-images";
import { destinationQuery } from "@/lib/queries";

export const Route = createFileRoute("/destinations/$slug")({
  loader: async ({ context, params }) => {
    const destination = await context.queryClient.ensureQueryData(destinationQuery(params.slug));
    if (!destination) throw notFound();
    return destination;
  },
  head: ({ params, loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Destination"} Safari Guide | SafariConnect Kenya` },
      { name: "description", content: loaderData?.summary ?? "Kenyan destination guide and custom holiday packages." },
      { property: "og:title", content: `${loaderData?.name ?? "Destination"} Safari Guide | SafariConnect Kenya` },
      { property: "og:description", content: loaderData?.summary ?? "Kenyan destination guide and custom holiday packages." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `/destinations/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/destinations/${params.slug}` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TouristDestination",
          name: loaderData?.name,
          description: loaderData?.summary,
          address: {
            "@type": "PostalAddress",
            addressRegion: loaderData?.county,
            addressCountry: "KE",
          },
        }),
      },
    ],
  }),
  component: DestinationPage,
});

function DestinationPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(destinationQuery(slug));
  if (!data) return null;

  return (
    <article>
      <div className="relative isolate">
        <img
          src={destinationImage(data.slug)}
          alt={data.name}
          width={1024}
          height={768}
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[oklch(0.245_0.045_212_/_65%)]" />
        <div className="mx-auto w-full max-w-6xl px-5 py-24">
          <p className="eyebrow text-[oklch(0.83_0.108_88)]">{data.category}</p>
          <h1 className="mt-3 text-4xl font-semibold text-[oklch(0.97_0.012_190)] sm:text-5xl">
            {data.name}
          </h1>
          <p className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[oklch(0.9_0.02_190)]">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" /> {data.county} County · {data.region}
            </span>
            {data.best_season && (
              <span className="flex items-center gap-1.5">
                <CalendarRange className="size-4" /> Best: {data.best_season}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <p className="text-lg text-foreground">{data.summary}</p>
          {data.description && (
            <p className="mt-4 text-muted-foreground">{data.description}</p>
          )}

          <h2 className="mt-10 text-xl font-semibold">Highlights</h2>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            {data.highlights.map((h) => (
              <li key={h} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                {h}
              </li>
            ))}
          </ul>

          <h2 className="mt-10 text-xl font-semibold">Things to do</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.activities.map((a) => (
              <span
                key={a}
                className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm"
              >
                {a}
              </span>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-2xl bg-card p-6 shadow-soft lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Get quotes for {data.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Send one request and licensed Kenyan operators reply with tailored quotations.
          </p>
          <Button asChild className="mt-5 w-full rounded-xl">
            <Link to="/plan-trip" search={{ destination: data.slug }}>
              Request quotes
            </Link>
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Free for travellers · no obligation
          </p>
        </aside>
      </div>

      <ReviewsSection slug={data.slug} name={data.name} />
    </article>
  );
}