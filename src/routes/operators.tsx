import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Globe, MapPin, Star } from "lucide-react";
import { operatorDirectoryQuery, type DirectoryOperator } from "@/lib/plan-queries";

export const Route = createFileRoute("/operators")({
  head: () => ({
    meta: [
      { title: "Licensed Kenyan Tour Operators — SafariConnect Kenya" },
      {
        name: "description",
        content:
          "Browse verified, licensed Kenyan tour operators on SafariConnect Kenya. Featured and premium safari companies ranked by plan priority, with county and contact details.",
      },
      {
        property: "og:title",
        content: "Licensed Kenyan Tour Operators — SafariConnect Kenya",
      },
      {
        property: "og:description",
        content: "Verified Kenyan safari and beach tour operators, ready to quote your trip.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/operators" },
    ],
    links: [{ rel: "canonical", href: "/operators" }],
  }),
  component: OperatorsDirectory,
});

function OperatorsDirectory() {
  const { data, isLoading } = useQuery(operatorDirectoryQuery);
  const all = data ?? [];
  const featured = all.filter((o) => o.featured_listing);
  const rest = all.filter((o) => !o.featured_listing);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <p className="eyebrow text-primary">Directory</p>
      <h1 className="mt-2 text-4xl font-semibold">Licensed tour operators</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Verified Kenyan companies, ranked by their SafariConnect plan priority. Featured operators
        appear first.
      </p>

      {isLoading ? (
        <p className="mt-10 text-muted-foreground">Loading operators…</p>
      ) : all.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-card p-10 text-center shadow-soft">
          <p className="font-semibold">No verified operators listed yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Companies appear here once our team verifies their licence.
          </p>
        </div>
      ) : (
        <>
          {featured.length > 0 && (
            <section className="mt-10">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Featured operators
              </h2>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                {featured.map((o) => (
                  <OperatorCard key={o.id} operator={o} featured />
                ))}
              </div>
            </section>
          )}
          <section className="mt-10">
            {featured.length > 0 && (
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                All operators
              </h2>
            )}
            <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((o) => (
                <OperatorCard key={o.id} operator={o} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function OperatorCard({
  operator,
  featured,
}: {
  operator: DirectoryOperator;
  featured?: boolean;
}) {
  return (
    <article
      className={
        featured
          ? "rounded-2xl border-2 border-primary/40 bg-card p-6 shadow-soft"
          : "rounded-2xl bg-card p-6 shadow-soft"
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold">{operator.name}</h3>
        {operator.premium_badge && (
          <span className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
            <BadgeCheck className="size-3.5" /> Premium
          </span>
        )}
        {featured && (
          <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">
            <Star className="size-3.5" /> Featured
          </span>
        )}
      </div>
      {operator.county && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4" /> {operator.county}
        </p>
      )}
      {operator.description && (
        <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{operator.description}</p>
      )}
      {operator.website && (
        <a
          href={operator.website}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
        >
          <Globe className="size-4" /> Visit website
        </a>
      )}
    </article>
  );
}
