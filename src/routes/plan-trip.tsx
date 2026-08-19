import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Calendar, Users, DollarSign, MapPin, Sparkles, Compass, Car, Plane, Utensils, HeartHandshake } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/plan-trip")({
  head: () => ({
    meta: [
      { title: "Plan your Trip — SafariConnect Kenya" },
      {
        name: "description",
        content: "Submit your dream Kenya safari request and receive custom competitive quotes from verified local tour operators.",
      },
      { property: "og:title", content: "Plan a Trip — SafariConnect Kenya" },
      { property: "og:url", content: "/plan-trip" },
    ],
    links: [{ rel: "canonical", href: "/plan-trip" }],
  }),
  component: PlanTripPage,
});

const tripSchema = z.object({
  destinationName: z.string().min(2, { message: "Please specify a destination or region" }),
  startDate: z.string().min(1, { message: "Please select an estimated start date" }),
  endDate: z.string().min(1, { message: "Please select an estimated end date" }),
  flexibleDates: z.boolean(),
  adults: z.number().min(1, { message: "At least 1 adult is required" }),
  children: z.number().min(0, { message: "Please specify children count (or 0)" }),
  budget: z.number().positive({ message: "Please enter a valid budget amount" }),
  budgetCurrency: z.enum(["USD", "KES"]),
  luxuryLevel: z.string().min(1, { message: "Please select a safari style" }),
  accommodationType: z.string().min(1, { message: "Please select preferred accommodation" }),
  transportPreference: z.string().min(1, { message: "Please select a transport preference" }),
  nationality: z.string().min(1, { message: "Please select your residency status" }),
  arrivalAirport: z.string().min(1, { message: "Please enter your arrival airport" }),
  pickupLocation: z.string().min(1, { message: "Please enter your pickup location" }),
  dietaryRequirements: z.string().min(1, { message: "Please specify dietary requirements (e.g. None)" }),
  specialNeeds: z.string().min(1, { message: "Please specify special needs (e.g. None)" }),
  notes: z.string().min(5, { message: "Please provide a brief note or itinerary detail" }).max(1000),
});

function PlanTripPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Block operators from accessing this page
  const isOperator = user?.roles?.includes("operator") || user?.role === "operator";
  if (isOperator) {
    return (
      <div className="min-h-screen bg-background py-28 px-5 text-center">
        <div className="mx-auto max-w-md rounded-2xl bg-card p-8 shadow-soft">
          <h1 className="text-2xl font-bold tracking-tight">Access Restricted</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Tour operators cannot create traveller trip requests. Please use your operator dashboard to manage packages and quotes.
          </p>
          <Button onClick={() => navigate({ to: "/operator" })} className="mt-6 w-full rounded-xl py-3 font-semibold">
            Go to Operator Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split("T")[0];

  const [destinationName, setDestinationName] = useState("Maasai Mara");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flexibleDates, setFlexibleDates] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [budget, setBudget] = useState<string>("");
  const [budgetCurrency, setBudgetCurrency] = useState<"USD" | "KES">("USD");
  const [luxuryLevel, setLuxuryLevel] = useState("mid-range");
  const [accommodationType, setAccommodationType] = useState("lodge");
  const [transportPreference, setTransportPreference] = useState("4x4 Landcruiser");
  const [nationality, setNationality] = useState("Kenyan / Resident");
  const [arrivalAirport, setArrivalAirport] = useState("Jomo Kenyatta International Airport (NBO)");
  const [pickupLocation, setPickupLocation] = useState("Nairobi Hotel / Airport");
  const [dietaryRequirements, setDietaryRequirements] = useState("None");
  const [specialNeeds, setSpecialNeeds] = useState("None");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in or create a free traveller account to send a trip request");
      navigate({ to: "/auth", search: { mode: "signup" } });
      return;
    }

    if (startDate && startDate < minDateStr) {
      toast.error("Safaris must be booked starting from tomorrow onwards.");
      return;
    }

    const parsed = tripSchema.safeParse({
      destinationName: destinationName.trim(),
      startDate: startDate || "",
      endDate: endDate || "",
      flexibleDates,
      adults: Number(adults),
      children: Number(children),
      budget: budget ? Number(budget) : 0,
      budgetCurrency,
      luxuryLevel,
      accommodationType,
      transportPreference,
      nationality,
      arrivalAirport: arrivalAirport.trim(),
      pickupLocation: pickupLocation.trim(),
      dietaryRequirements: dietaryRequirements.trim(),
      specialNeeds: specialNeeds.trim(),
      notes: notes.trim(),
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please ensure all fields are correctly filled");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        ...parsed.data,
        budgetUsd: parsed.data.budgetCurrency === "KES" 
          ? Math.round(parsed.data.budget / 130) 
          : parsed.data.budget,
        activities: ["Game Drives", "Sightseeing"],
      };

      // Use the central api helper which automatically includes Authorization headers
      await api.post("/api/trip-requests", payload);

      toast.success("Trip request submitted successfully! Local operators can now send you quotes.");
      navigate({ to: "/my-trips" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-16 px-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Tailor-Made Safaris</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Plan Your Kenyan Adventure</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            All fields are required. Verified local tour operators will review your details to provide custom competitive quotes.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-card p-6 sm:p-10 shadow-sm border border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Destination */}
            <div className="space-y-2">
              <Label htmlFor="destination" className="flex items-center gap-2 text-foreground font-medium">
                <MapPin className="size-4 text-primary" /> Destination / National Park *
              </Label>
              <Input
                id="destination"
                value={destinationName}
                onChange={(e) => setDestinationName(e.target.value)}
                placeholder="e.g., Maasai Mara, Amboseli, Diani Beach"
                required
              />
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2 text-foreground font-medium">
                  <Calendar className="size-4 text-primary" /> Estimated Start Date *
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  min={minDateStr}
                  value={startDate}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setStartDate(newStart);
                    if (endDate && endDate < newStart) {
                      setEndDate(newStart);
                    }
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center gap-2 text-foreground font-medium">
                  <Calendar className="size-4 text-primary" /> Estimated End Date *
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  min={startDate || minDateStr}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Flexible Dates Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="flexibleDates"
                className="size-4 rounded border-input text-primary focus:ring-ring"
                checked={flexibleDates}
                onChange={(e) => setFlexibleDates(e.target.checked)}
              />
              <Label htmlFor="flexibleDates" className="text-sm font-normal text-muted-foreground cursor-pointer">
                My dates are flexible (+/- 3 days)
              </Label>
            </div>

            {/* Travelers Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adults" className="flex items-center gap-2 text-foreground font-medium">
                  <Users className="size-4 text-primary" /> Adults (12+ yrs) *
                </Label>
                <Input
                  id="adults"
                  type="number"
                  min={1}
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="children" className="flex items-center gap-2 text-foreground font-medium">
                  <Users className="size-4 text-primary" /> Children (0-11 yrs) *
                </Label>
                <Input
                  id="children"
                  type="number"
                  min={0}
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* Budget & Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="budget" className="flex items-center gap-2 text-foreground font-medium">
                  <DollarSign className="size-4 text-primary" /> Approximate Budget *
                </Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="e.g., 2500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-foreground font-medium">Currency *</Label>
                <select
                  id="currency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={budgetCurrency}
                  onChange={(e) => setBudgetCurrency(e.target.value as "USD" | "KES")}
                  required
                >
                  <option value="USD">USD ($)</option>
                  <option value="KES">KES (Ksh)</option>
                </select>
              </div>
            </div>

            {/* Safari Style & Accommodation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="luxury" className="flex items-center gap-2 text-foreground font-medium">
                  <Sparkles className="size-4 text-primary" /> Safari Style *
                </Label>
                <select
                  id="luxury"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={luxuryLevel}
                  onChange={(e) => setLuxuryLevel(e.target.value)}
                  required
                >
                  <option value="budget">Budget / Camping</option>
                  <option value="mid-range">Mid-Range Comfort</option>
                  <option value="luxury">Luxury Lodges & Tented Camps</option>
                  <option value="ultra-luxury">Ultra-Luxury Exclusive</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accommodation" className="flex items-center gap-2 text-foreground font-medium">
                  <Compass className="size-4 text-primary" /> Preferred Accommodation *
                </Label>
                <select
                  id="accommodation"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={accommodationType}
                  onChange={(e) => setAccommodationType(e.target.value)}
                  required
                >
                  <option value="lodge">Safari Lodges</option>
                  <option value="tented-camp">Luxury Tented Camps</option>
                  <option value="mix">Mix of Both</option>
                  <option value="hotel-resort">Beach Resorts / Hotels</option>
                </select>
              </div>
            </div>

            {/* Transport & Nationality */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transport" className="flex items-center gap-2 text-foreground font-medium">
                  <Car className="size-4 text-primary" /> Transport Preference *
                </Label>
                <select
                  id="transport"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={transportPreference}
                  onChange={(e) => setTransportPreference(e.target.value)}
                  required
                >
                  <option value="4x4 Landcruiser">4x4 Safari Landcruiser</option>
                  <option value="Safari Van">Safari Minivan (Tour Van)</option>
                  <option value="Fly-in Safari">Fly-In Safari (Flight)</option>
                  <option value="Self Drive">Self Drive</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality" className="flex items-center gap-2 text-foreground font-medium">
                  <HeartHandshake className="size-4 text-primary" /> Traveller Status / Residency *
                </Label>
                <select
                  id="nationality"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  required
                >
                  <option value="Kenyan / Resident">Kenyan Citizen / East African Resident</option>
                  <option value="Non-Resident">International Non-Resident</option>
                </select>
              </div>
            </div>

            {/* Airport & Pickup Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="airport" className="flex items-center gap-2 text-foreground font-medium">
                  <Plane className="size-4 text-primary" /> Arrival Airport *
                </Label>
                <Input
                  id="airport"
                  value={arrivalAirport}
                  onChange={(e) => setArrivalAirport(e.target.value)}
                  placeholder="e.g., Jomo Kenyatta (NBO)"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickup" className="flex items-center gap-2 text-foreground font-medium">
                  <MapPin className="size-4 text-primary" /> Pickup Location *
                </Label>
                <Input
                  id="pickup"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="e.g., Nairobi Hotel or Airport Terminal"
                  required
                />
              </div>
            </div>

            {/* Dietary & Special Needs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dietary" className="flex items-center gap-2 text-foreground font-medium">
                  <Utensils className="size-4 text-primary" /> Dietary Requirements *
                </Label>
                <Input
                  id="dietary"
                  value={dietaryRequirements}
                  onChange={(e) => setDietaryRequirements(e.target.value)}
                  placeholder="e.g., Vegetarian, Halal, None"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialNeeds" className="text-foreground font-medium">Special Needs / Mobility *</Label>
                <Input
                  id="specialNeeds"
                  value={specialNeeds}
                  onChange={(e) => setSpecialNeeds(e.target.value)}
                  placeholder="e.g., Wheelchair accessibility, None"
                  required
                />
              </div>
            </div>

            {/* Special Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-foreground font-medium">Additional Itinerary Notes *</Label>
              <textarea
                id="notes"
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Mention specific animals you want to see, parks to add, or special requests..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={1000}
                required
              />
            </div>

            <Button type="submit" className="w-full rounded-xl py-3 text-base font-semibold" disabled={busy}>
              {busy ? "Submitting Request..." : "Submit Trip Request for Quotes"}
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
}