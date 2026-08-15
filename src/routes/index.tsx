import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Search, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useState } from "react";
import hero from "@/assets/hero-savannah.jpg";
import { DestinationCard } from "@/components/destination-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/destination-images";
import { destinationsQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(destinationsQuery),
  head: () => ({
    meta: [
      { title: "SafariConnect Kenya — Compare Safari Quotes from Kenyan Operators" },
      {
        name: "description",
        content:
          "Tell us your trip once and licensed Kenyan tour operators send you quotes. Maasai Mara, Amboseli, Diani, Mount Kenya and more. Free for travellers.",
      },
      {
        property: "og:title",
        content: "SafariConnect Kenya — Compare Safari Quotes from Kenyan Operators",
      },
      {
        property: "og:description",
        content:
          "Tell us your trip once and licensed Kenyan tour operators send you quotes. Maasai Mara, Amboseli, Diani, Mount Kenya and more. Free for travellers.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const { data: destinations } = useSuspenseQuery(destinationsQuery);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const featured = destinations.filter((d) => d.featured).slice(0, 6);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img
          src={hero}
          alt="Elephant herd crossing the Kenyan savannah at sunset"
          width={1920}
          height={1088}
          className="absolute inset-0 -z-10 size-full object-cover"
        />

        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,oklch(0.18_0.03_220_/_88%),oklch(0.22_0.04_212_/_65%),oklch(0.28_0.03_190_/_45%))]" />

        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        <div className="mx-auto w-full max-w-7xl px-5 py-28 sm:px-6 sm:py-36 lg:px-8 lg:py-44">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[oklch(0.83_0.108_88)] backdrop-blur-md">
            
            The Smarter Way to Explore Kenya
          </p>

          <h1 className="font-display mt-6 max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Discover &amp; Book Your{" "}
            <span className="text-[oklch(0.83_0.108_88)]">Perfect Holiday</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base font-medium leading-7 text-white/90 sm:text-lg sm:leading-8">
            Find the perfect tour package for family trips, honeymoons, and adventures
            with licensed Kenyan tour operators.
          </p>

          <form
            className="mt-10 flex w-full max-w-2xl flex-col gap-3 rounded-3xl border border-white/15 bg-white/95 p-3 shadow-2xl backdrop-blur-xl sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({
                to: "/destinations",
                search: { q: query || undefined },
              });
            }}
          >
            <div className="flex flex-1 items-center gap-3 rounded-2xl px-3">
              <Search className="size-5 text-muted-foreground" />

              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Maasai Mara, Diani, Amboseli..."
                aria-label="Search destinations"
                className="border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="rounded-2xl px-7 font-semibold shadow-lg"
            >
              Explore Destinations
            </Button>
          </form>

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/90">
            {["Maasai Mara", "Diani Beach", "Amboseli", "Mount Kenya"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  navigate({
                    to: "/destinations",
                    search: { q: item },
                  })
                }
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md transition-all hover:bg-white/20"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORY PILLS */}
      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              to="/destinations"
              search={{ category: c }}
              className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED DESTINATIONS */}
      <section className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-primary">Featured Destinations</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Where travellers are going
            </h2>
            <p className="mt-2 text-muted-foreground">
              Handpicked destinations loved by travellers across Kenya.
            </p>
          </div>

          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all hover:gap-3"
          >
            View all {destinations.length} destinations
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((d) => (
            <DestinationCard key={d.id} destination={d} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
        <p className="eyebrow text-primary">How it works</p>

        <h2 className="mt-2 text-3xl font-bold tracking-tight">
          Three simple steps to your perfect itinerary
        </h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "Describe your trip",
              body: "Dates, group size, budget and travel style. One quick request—no endless phone calls.",
            },
            {
              icon: Users,
              title: "Receive multiple quotes",
              body: "Verified Kenyan tour operators prepare personalised itineraries tailored to your request.",
            },
            {
              icon: ShieldCheck,
              title: "Compare & book",
              body: "Compare prices, lodges and safari vehicles side by side before choosing your favourite offer.",
            },
          ].map((step) => (
            <div
              key={step.title}
              className="group rounded-3xl border border-border bg-card p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <step.icon className="size-6" />
              </span>

              <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-primary to-primary/80 px-8 py-12 text-primary-foreground shadow-xl">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <h2 className="text-3xl font-black tracking-tight">
                Ready to plan your Kenyan adventure?
              </h2>

              <p className="mt-3 text-primary-foreground/85">
                Submit one trip request and let trusted Kenyan tour operators compete with
                their best offers—completely free for travellers.
              </p>
            </div>

            <Button
              asChild
              size="lg"
              variant="secondary"
              className="rounded-2xl px-7 font-semibold"
            >
              <Link to="/plan-trip">Start a Trip Request</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}