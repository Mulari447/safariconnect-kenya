import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, CalendarRange, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { myTripsQuery } from "@/lib/queries";
import { incomingLeadRequestsQuery, myRolesQuery } from "@/lib/operator-queries";
import { isAdminQuery } from "@/lib/plan-queries";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/my-trips")({
  head: () => ({
    meta: [
      { title: "My Trip Requests — SafariConnect Kenya" },
      {
        name: "description",
        content:
          "Track your Kenya trip requests and the quotations Kenyan tour operators send back to you.",
      },
      { property: "og:title", content: "My Trip Requests — SafariConnect Kenya" },
      {
        property: "og:description",
        content: "Track your Kenya trip requests and incoming operator quotations.",
      },
      { property: "og:url", content: "/my-trips" },
    ],
    links: [{ rel: "canonical", href: "/my-trips" }],
  }),
  component: MyTrips,
});

function MyTrips() {
  const { user, loading } = useAuth();
  const { data: isAdmin } = useQuery({ ...isAdminQuery, enabled: !!user });
  const { data: roles } = useQuery({ ...myRolesQuery, enabled: !!user });
  const isOperator = !!roles?.includes("operator");
  const { data: trips, isLoading } = useQuery({
    ...myTripsQuery,
    enabled: !!user && !isAdmin && !isOperator,
  });
  const qc = useQueryClient();
  const { data: incoming } = useQuery({
    ...incomingLeadRequestsQuery,
    enabled: !!user && !isAdmin && !isOperator,
  });

  const decide = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "declined" }) => {
      await api.patch(`/api/leads/${id}`, { status });
    },
    onSuccess: (_d, v) => {
      toast.success(
        v.status === "accepted"
          ? "Contact details shared with the operator."
          : "Offer declined.",
      );
      void qc.invalidateQueries({ queryKey: ["incoming-lead-requests"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update the request"),
  });

  const pendingRequests = (incoming ?? []).filter((r) => r.status === "pending");

  if (!loading && !user) {
    return (
      <div className="mx-auto w-full max-w-md px-5 py-20 text-center">
        <h1 className="text-3xl font-semibold">Sign in to see your requests</h1>
        <p className="mt-3 text-muted-foreground">
          Your trip requests and operator quotes live in your free traveller account.
        </p>
        <Button asChild className="mt-6 rounded-xl">
          <Link to="/auth">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="mx-auto w-full max-w-md px-5 py-20 text-center">
        <h1 className="text-3xl font-semibold">Admin account</h1>
        <p className="mt-3 text-muted-foreground">
          Traveller trip requests aren&apos;t part of the admin workspace. Manage operator approvals
          and plan settings instead.
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
          Trip requests are for traveller accounts. As an operator, browse open leads and send
          offers from your dashboard instead.
        </p>
        <Button asChild className="mt-6 rounded-xl">
          <Link to="/operator/leads">Browse leads</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-primary">Traveller dashboard</p>
          <h1 className="mt-2 text-4xl font-semibold">My trip requests</h1>
        </div>
        <Button asChild className="rounded-xl">
          <Link to="/plan-trip">New request</Link>
        </Button>
      </div>

      {pendingRequests.length > 0 && (
        <section className="mt-8 rounded-2xl bg-card p-6 shadow-soft">
          <h2 className="text-xl font-semibold">Offers from tour operators</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Compare offers, then accept one to share your phone and email with that company only.
          </p>
          <ul className="mt-5 space-y-4">
            {pendingRequests.map((r) => (
              <li key={r.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 font-semibold">
                    {r.operator_companies?.name ?? "Tour operator"}
                    {r.operator_companies?.verified && (
                      <Badge className="gap-1">
                        <BadgeCheck className="size-3.5" /> Verified
                      </Badge>
                    )}
                  </p>
                  {r.offer_amount_kes != null && (
                    <p className="text-lg font-semibold text-primary">
                      KES {Number(r.offer_amount_kes).toLocaleString()}
                    </p>
                  )}
                </div>

                {r.package_details && (
                  <p className="mt-2 text-sm">{r.package_details}</p>
                )}
                {r.message && (
                  <p className="mt-2 text-sm text-muted-foreground italic">"{r.message}"</p>
                )}

                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    className="rounded-xl"
                    disabled={decide.isPending}
                    onClick={() => decide.mutate({ id: r.id, status: "accepted" })}
                  >
                    Accept offer
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={decide.isPending}
                    onClick={() => decide.mutate({ id: r.id, status: "declined" })}
                  >
                    Decline
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {loading || isLoading ? (
        <p className="mt-10 text-muted-foreground">Loading your requests…</p>
      ) : !trips || trips.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-card p-10 text-center shadow-soft">
          <h2 className="text-lg font-semibold">No requests yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Send your first request and Kenyan operators will start replying with quotations.
          </p>
          <Button asChild className="mt-5 rounded-xl">
            <Link to="/plan-trip">Plan a trip</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {trips.map((t) => (
            <li key={t.id} className="rounded-2xl bg-card p-6 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{t.destination_name}</h2>
                  <p className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarRange className="size-4" />
                      {t.start_date
                        ? `${t.start_date}${t.end_date ? ` → ${t.end_date}` : ""}`
                        : "Dates open"}
                      {t.flexible_dates ? " · flexible" : ""}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="size-4" />
                      {t.adults} adult{t.adults === 1 ? "" : "s"}
                      {t.children > 0 ? `, ${t.children} children` : ""}
                    </span>
                    {t.luxury_level && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-4" />
                        {t.luxury_level}
                      </span>
                    )}
                  </p>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {t.status === "open" ? "Awaiting quotes" : t.status}
                </Badge>
              </div>

              {t.activities.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {t.activities.map((a) => (
                    <span
                      key={a}
                      className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}

              {t.notes && <p className="mt-4 text-sm text-muted-foreground">{t.notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}