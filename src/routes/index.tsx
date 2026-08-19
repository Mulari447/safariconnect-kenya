import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Search, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useState, useEffect } from "react";
import hero from "@/assets/hero-savannah.jpg";
import { DestinationCard } from "@/components/destination-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/destination-images";
import { destinationsQuery } from "@/lib/queries";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(destinationsQuery),
  head: () => ({
    meta: [
      { title: "SafariConnect Kenya" },
      {
        name: "description",
        content:
          "Tell us your trip once and licensed Kenyan tour operators send you quotes. Maasai Mara, Amboseli, Diani, Mount Kenya and more. Free for travellers.",
      },
      {
        property: "og:title",
        content: "SafariConnect Kenya",
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
  
  const { user, loading } = useAuth();

  // --- ROLE PROTECTION: Redirect Operators & Admins ---
  useEffect(() => {
    if (!loading && user) {
      const userRole = user.roles?.[0]?.role || user.role;
      
      // If they are an operator, send them to the operator portal
      if (userRole === "operator") {
        navigate({ to: "/operator" });
      } 
      // If they are a super admin, send them to the admin portal
      else if (userRole === "admin") {
        navigate({ to: "/admin" });
      }
    }
  }, [user, loading, navigate]);

  const featured = destinations.filter((d) => d.featured).slice(0, 6);

  return (
    <div className="w-full bg-[#e6e9ef] min-h-screen">
      {/* HERO (Keeps original photo design as neumorphism doesn't work over images) */}
      <section className="relative isolate overflow-hidden bg-slate-900">
        <img
          src={hero}
          alt="Elephant herd crossing the Kenyan savannah at sunset"
          width={1920}
          height={1088}
          className="absolute inset-0 -z-10 size-full object-cover opacity-80"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#e6e9ef] via-black/40 to-black/60" />

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
            className="mt-10 flex w-full max-w-2xl flex-col gap-3 rounded-3xl bg-white/10 p-3 shadow-2xl backdrop-blur-xl sm:flex-row border border-white/20"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({
                to: "/destinations",
                search: { q: query || undefined },
              });
            }}
          >
            <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white/80 px-4">
              <Search className="size-5 text-slate-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Maasai Mara, Diani, Amboseli..."
                aria-label="Search destinations"
                className="border-0 bg-transparent px-0 text-base text-slate-800 shadow-none focus-visible:ring-0 placeholder:text-slate-500"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="rounded-2xl px-7 font-bold shadow-lg"
            >
              Explore Destinations
            </Button>
          </form>
        </div>
      </section>

      {/* CATEGORY PILLS - NEUMORPHIC */}
      <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              to="/destinations"
              search={{ category: c }}
              className="rounded-full bg-[#e6e9ef] shadow-[6px_6px_12px_#c5c8cc,-6px_-6px_12px_#ffffff] px-6 py-3 text-sm font-bold text-slate-600 transition-all hover:shadow-[inset_4px_4px_8px_#c5c8cc,inset_-4px_-4px_8px_#ffffff] hover:text-primary active:scale-95"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED DESTINATIONS */}
      <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-primary font-bold uppercase tracking-widest text-xs">Featured Destinations</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-800">
              Where travellers are going
            </h2>
            <p className="mt-2 text-slate-500 font-medium">
              Handpicked destinations loved by travellers across Kenya.
            </p>
          </div>

          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary transition-all hover:gap-3"
          >
            View all {destinations.length} destinations
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((d) => (
            <div key={d.id} className="rounded-3xl bg-[#e6e9ef] p-4 shadow-[12px_12px_24px_#c5c8cc,-12px_-12px_24px_#ffffff]">
              <DestinationCard destination={d} />
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS - NEUMORPHIC CARDS */}
      <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-6 lg:px-8">
        <div className="text-center sm:text-left">
          <p className="eyebrow text-primary font-bold uppercase tracking-widest text-xs">How it works</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-800">
            Three simple steps to your perfect itinerary
          </h2>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
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
              className="group rounded-[2rem] bg-[#e6e9ef] shadow-[12px_12px_24px_#c5c8cc,-12px_-12px_24px_#ffffff] p-8 transition-all hover:shadow-[6px_6px_12px_#c5c8cc,-6px_-6px_12px_#ffffff]"
            >
              {/* Pressed/Inset Icon Container */}
              <span className="flex size-16 items-center justify-center rounded-2xl bg-[#e6e9ef] shadow-[inset_4px_4px_8px_#c5c8cc,inset_-4px_-4px_8px_#ffffff] text-primary transition-transform group-hover:scale-110">
                <step.icon className="size-7" />
              </span>

              <h3 className="mt-8 text-xl font-bold text-slate-800">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-500 font-medium">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA - NEUMORPHIC EXTRUDED BANNER */}
      <section className="mx-auto w-full max-w-7xl px-5 pb-24 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2.5rem] bg-[#e6e9ef] shadow-[12px_12px_24px_#c5c8cc,-12px_-12px_24px_#ffffff] px-8 py-14 border border-white/40">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
                Ready to plan your Kenyan adventure?
              </h2>

              <p className="mt-4 text-lg text-slate-500 font-medium">
                Submit one trip request and let trusted Kenyan tour operators compete with
                their best offers—completely free for travellers.
              </p>
            </div>

            <Button
              asChild
              size="lg"
              className="rounded-2xl px-8 py-6 text-base font-bold shadow-[6px_6px_12px_#c5c8cc,-6px_-6px_12px_#ffffff] transition-all hover:shadow-[4px_4px_8px_#c5c8cc,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)]"
            >
              <Link to="/plan-trip">Start a Trip Request</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}