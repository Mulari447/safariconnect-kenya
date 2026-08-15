import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { destinationsQuery } from "@/lib/queries";
import { isAdminQuery } from "@/lib/plan-queries";
import { myRolesQuery } from "@/lib/operator-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type PlanSearch = { destination?: string | undefined };

export const Route = createFileRoute("/plan-trip")({
  validateSearch: (search: Record<string, unknown>): PlanSearch => ({
    destination:
      typeof search["destination"] === "string" && search["destination"]
        ? search["destination"]
        : undefined,
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(destinationsQuery),
  head: () => ({
    meta: [
      { title: "Plan Your Kenya Trip — Get Operator Quotes | SafariConnect" },
      {
        name: "description",
        content:
          "Describe your Kenya trip once — dates, party, budget and style — and licensed Kenyan tour operators send you tailored quotations.",
      },
      { property: "og:title", content: "Plan Your Kenya Trip | SafariConnect Kenya" },
      {
        property: "og:description",
        content: "One trip request, tailored quotes from licensed Kenyan tour operators.",
      },
      { property: "og:url", content: "/plan-trip" },
    ],
    links: [{ rel: "canonical", href: "/plan-trip" }],
  }),
  component: PlanTrip,
});

const ACTIVITIES = [
  "Game drives",
  "Hot air ballooning",
  "Beach",
  "Diving & snorkelling",
  "Trekking",
  "Bird watching",
  "Cultural visits",
  "Photography",
  "Camping",
  "Honeymoon",
];

const schema = z.object({
  destinationName: z.string().trim().min(2, "Choose a destination").max(120),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  adults: z.number().int().min(1, "At least one adult").max(40),
  children: z.number().int().min(0).max(40),
  budget: z.number().min(0).max(1000000).optional(),
  nationality: z.string().trim().max(80).optional(),
  arrivalAirport: z.string().trim().max(80).optional(),
  pickupLocation: z.string().trim().max(120).optional(),
  dietary: z.string().trim().max(500).optional(),
  specialNeeds: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(2000).optional(),
});

function PlanTrip() {
  const { destination } = Route.useSearch();
  const { data: destinations } = useSuspenseQuery(destinationsQuery);
  const { user, loading } = useAuth();
  const { data: isAdmin } = useQuery({ ...isAdminQuery, enabled: !!user });
  const { data: roles } = useQuery({ ...myRolesQuery, enabled: !!user });
  const isOperator = !!roles?.includes("operator");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const preset = destinations.find((d) => d.slug === destination);
  const [destinationSlug, setDestinationSlug] = useState(preset?.slug ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flexible, setFlexible] = useState(false);
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");
  const [budget, setBudget] = useState("");
  const [accommodation, setAccommodation] = useState("Lodge");
  const [transport, setTransport] = useState("4x4 safari vehicle");
  const [luxury, setLuxury] = useState("Mid-range");
  const [activities, setActivities] = useState<string[]>([]);
  const [nationality, setNationality] = useState("");
  const [arrivalAirport, setArrivalAirport] = useState("Nairobi (NBO)");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dietary, setDietary] = useState("");
  const [specialNeeds, setSpecialNeeds] = useState("");
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const chosen = destinations.find((d) => d.slug === destinationSlug);
      const parsed = schema.safeParse({
        destinationName: chosen?.name ?? "",
        startDate,
        endDate,
        adults: Number(adults),
        children: Number(children),
        budget: budget ? Number(budget) : undefined,
        nationality,
        arrivalAirport,
        pickupLocation,
        dietary,
        specialNeeds,
        notes,
      });
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the form");
      const v = parsed.data;

      await api.post("/api/trip-requests", {
        destinationSlug: chosen!.slug,
        destinationName: v.destinationName,
        startDate: v.startDate || undefined,
        endDate: v.endDate || undefined,
        flexibleDates: flexible,
        adults: v.adults,
        children: v.children,
        budgetUsd: v.budget ?? undefined,
        accommodationType: accommodation,
        transportPreference: transport,
        luxuryLevel: luxury,
        activities,
        nationality: v.nationality || undefined,
        arrivalAirport: v.arrivalAirport || undefined,
        pickupLocation: v.pickupLocation || undefined,
        dietaryRequirements: v.dietary || undefined,
        specialNeeds: v.specialNeeds || undefined,
        notes: v.notes || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-trips"] });
      toast.success("Trip request sent to Kenyan operators.");
      navigate({ to: "/my-trips" });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save"),
  });

  if (isAdmin) {
    return (
      <div className="mx-auto w-full max-w-md px-5 py-20 text-center">
        <h1 className="text-3xl font-semibold">Admin account</h1>
        <p className="mt-3 text-muted-foreground">
          Planning trips is for traveller accounts. Your workspace covers operator approvals and
          plan settings.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild className="rounded-xl">
            <Link to="/admin/operators">Approvals</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/admin/plans">Plan settings</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isOperator) {
    return (
      <div className="mx-auto w-full max-w-md px-5 py-20 text-center">
        <h1 className="text-3xl font-semibold">Operator account</h1>
        <p className="mt-3 text-muted-foreground">
          Planning trips is for traveller accounts. As an operator, you receive and respond to
          traveller requests from your dashboard instead.
        </p>
        <Button asChild className="mt-6 rounded-xl">
          <Link to="/operator">Operator dashboard</Link>
        </Button>
      </div>
    );
  }

  if (!loading && !user) {
    return (
      <div className="mx-auto w-full max-w-md px-5 py-20 text-center">
        <h1 className="text-3xl font-semibold">Sign in to send a request</h1>
        <p className="mt-3 text-muted-foreground">
          A free traveller account keeps your requests and incoming quotes together.
        </p>
        <Button asChild className="mt-6 rounded-xl">
          <Link to="/auth" search={{ mode: "signup" }}>
            Create a free account
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12">
      <p className="eyebrow text-primary">Trip request</p>
      <h1 className="mt-2 text-4xl font-semibold">Tell us about your trip</h1>
      <p className="mt-3 text-muted-foreground">
        Operators use these details to build a real quotation. Everything except the destination is
        optional.
      </p>

      <form
        className="mt-10 space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <section className="rounded-2xl bg-card p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Where and when</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Destination</Label>
              <Select value={destinationSlug} onValueChange={setDestinationSlug}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a destination" />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map((d) => (
                    <SelectItem key={d.slug} value={d.slug}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="start">Arrival</Label>
              <Input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end">Departure</Label>
              <Input
                id="end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <Switch id="flex" checked={flexible} onCheckedChange={setFlexible} />
              <Label htmlFor="flex" className="font-normal text-muted-foreground">
                My dates are flexible
              </Label>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-card p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Travellers and budget</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="adults">Adults</Label>
              <Input
                id="adults"
                type="number"
                min={1}
                max={40}
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="children">Children</Label>
              <Input
                id="children"
                type="number"
                min={0}
                max={40}
                value={children}
                onChange={(e) => setChildren(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget">Budget per person (USD)</Label>
              <Input
                id="budget"
                type="number"
                min={0}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="1500"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-card p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Style of trip</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Accommodation</Label>
              <Select value={accommodation} onValueChange={setAccommodation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Camping", "Tented camp", "Lodge", "Hotel", "Villa", "Luxury camp"].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Transport</Label>
              <Select value={transport} onValueChange={setTransport}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "4x4 safari vehicle",
                    "Safari minivan",
                    "Private car",
                    "Domestic flights",
                    "Self-drive",
                  ].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Luxury level</Label>
              <Select value={luxury} onValueChange={setLuxury}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Budget", "Mid-range", "Premium", "Luxury"].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Label className="mt-6 block">Activities</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {ACTIVITIES.map((a) => {
              const on = activities.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() =>
                    setActivities((prev) =>
                      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
                    )
                  }
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary hover:text-primary",
                  )}
                >
                  {a}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-card p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Logistics and notes</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="German"
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="airport">Arrival airport</Label>
              <Input
                id="airport"
                value={arrivalAirport}
                onChange={(e) => setArrivalAirport(e.target.value)}
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="pickup">Pickup location</Label>
              <Input
                id="pickup"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Hotel in Nairobi, JKIA, Wilson Airport…"
                maxLength={120}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dietary">Dietary requirements</Label>
              <Textarea
                id="dietary"
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                maxLength={500}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="needs">Accessibility / special needs</Label>
              <Textarea
                id="needs"
                value={specialNeeds}
                onChange={(e) => setSpecialNeeds(e.target.value)}
                maxLength={500}
                rows={3}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="notes">Anything else operators should know</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={2000}
                rows={4}
                placeholder="We'd love a balloon ride, and prefer lodges with a pool."
              />
            </div>
          </div>
        </section>

        <Button
          type="submit"
          size="lg"
          className="w-full rounded-xl"
          disabled={mutation.isPending || !destinationSlug}
        >
          {mutation.isPending ? "Sending…" : "Send trip request"}
        </Button>
      </form>
    </div>
  );
}