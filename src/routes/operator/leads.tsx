import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarRange, Send, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { myCompanyQuery, myLeadRequestsQuery, openLeadsQuery } from "@/lib/operator-queries";
import { companyPlanQuery, leadUsageQuery, leadsRemaining } from "@/lib/plan-queries";

export const Route = createFileRoute("/operator/leads")({
  head: () => ({
    meta: [
      { title: "Traveller Leads — SafariConnect Kenya Operators" },
      {
        name: "description",
        content:
          "Browse open trip requests from travellers planning Kenyan safaris and beach holidays, and send them a priced offer.",
      },
      { property: "og:title", content: "Traveller Leads — SafariConnect Kenya Operators" },
      {
        property: "og:description",
        content: "Browse open Kenyan trip requests and send a priced offer to travellers.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/operator/leads" },
    ],
    links: [{ rel: "canonical", href: "/operator/leads" }],
  }),
  component: LeadsPage,
});

function LeadsPage() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const { data: company, isLoading: loadingCompany } = useQuery({
    ...myCompanyQuery,
    enabled: !!user,
  });
  const { data: leads, isLoading } = useQuery({ ...openLeadsQuery, enabled: !!company });
  const { data: requests } = useQuery({
    ...myLeadRequestsQuery(company?.id),
    enabled: !!company,
  });
  const { data: current } = useQuery({
    ...companyPlanQuery(company?.id),
    enabled: !!company,
  });
  const { data: usedLeads } = useQuery({
    ...leadUsageQuery(company?.id, current?.subscription?.current_period_start),
    enabled: !!company && !!current?.subscription,
  });
  const [openId, setOpenId] = useState<string | null>(null);
  const [offerAmount, setOfferAmount] = useState("");
  const [packageDetails, setPackageDetails] = useState("");
  const [message, setMessage] = useState("");

  const plan = current?.plan ?? null;
  const remaining = leadsRemaining(plan, usedLeads ?? 0);
  const outOfLeads = remaining === 0;

  const request = useMutation({
    mutationFn: async (tripId: string) => {
      if (!company) throw new Error("Register your company first");
      if (outOfLeads)
        throw new Error(
          `Your ${plan?.name ?? "current"} plan allows ${plan?.lead_limit_monthly} lead requests this month.`,
        );
      const amount = Number(offerAmount);
      if (!amount || amount <= 0) throw new Error("Enter a valid offer amount in KES");
      if (!packageDetails.trim()) throw new Error("Describe what's included in your package");

      await api.post("/api/leads", {
        tripRequestId: tripId,
        offerAmountKes: amount,
        packageDetails: packageDetails.trim().slice(0, 2000),
        message: message.trim() ? message.trim().slice(0, 800) : undefined,
      });
    },
    onSuccess: () => {
      setOpenId(null);
      setOfferAmount("");
      setPackageDetails("");
      setMessage("");
      toast.success("Offer sent — the traveller can now compare it against others.");
      void qc.invalidateQueries({ queryKey: ["lead-requests"] });
      void qc.invalidateQueries({ queryKey: ["lead-usage"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not send your offer"),
  });

  if (!loading && !user) {
    return (
      <Empty
        title="Sign in to see traveller leads"
        body="Operators need an account to browse open trip requests."
      />
    );
  }

  if (loading || loadingCompany) {
    return <p className="mx-auto max-w-4xl px-5 py-16 text-muted-foreground">Loading…</p>;
  }

  if (!company) {
    return (
      <Empty
        title="Register your company first"
        body="Add your tour company details to unlock the lead marketplace."
        action={
          <Button asChild className="mt-6 rounded-xl">
            <Link to="/operator/profile">Register company</Link>
          </Button>
        }
      />
    );
  }

  if (company.status !== "approved") {
    return (
      <Empty
        title="Your application is under review"
        body="An administrator is verifying your company registration and TRA licence. You will be able to browse traveller leads once your company is approved."
        action={
          <Button asChild variant="outline" className="mt-6 rounded-xl">
            <Link to="/operator/profile">Review my application</Link>
          </Button>
        }
      />
    );
  }

  const byTrip = new Map((requests ?? []).map((r) => [r.trip_request_id, r]));

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-12">
      <p className="eyebrow text-primary">Lead marketplace</p>
      <h1 className="mt-2 text-4xl font-semibold">Open traveller requests</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Send a priced offer with what's included. Names, phone numbers and emails stay private
        until the traveller accepts.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-4 shadow-soft">
        <p className="text-sm">
          <span className="font-semibold">{plan?.name ?? "No plan"}</span>{" "}
          {plan?.lead_limit_monthly == null
            ? "· unlimited lead requests"
            : `· ${usedLeads ?? 0} of ${plan.lead_limit_monthly} lead requests used this month`}
          {outOfLeads && (
            <span className="ml-2 font-medium text-destructive">
              Monthly allowance reached — upgrade to contact more travellers.
            </span>
          )}
        </p>
        <Button asChild size="sm" variant="outline" className="rounded-full">
          <Link to="/operator/billing">View plan</Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="mt-10 text-muted-foreground">Loading leads…</p>
      ) : !leads || leads.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-card p-10 text-center shadow-soft">
          <p className="font-semibold">No open trip requests right now</p>
          <p className="mt-2 text-sm text-muted-foreground">
            New traveller requests appear here as soon as they are submitted.
          </p>
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {leads.map((l) => {
            const existing = byTrip.get(l.id);
            return (
              <li key={l.id} className="rounded-2xl bg-card p-6 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{l.destination_name}</h2>
                    <p className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <CalendarRange className="size-4" />
                        {l.start_date
                          ? `${l.start_date}${l.end_date ? ` → ${l.end_date}` : ""}`
                          : "Dates open"}
                        {l.flexible_dates ? " · flexible" : ""}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="size-4" />
                        {l.adults} adult{l.adults === 1 ? "" : "s"}
                        {l.children > 0 ? `, ${l.children} children` : ""}
                      </span>
                      {l.budget_usd != null && (
                        <span className="flex items-center gap-1.5">
                          <Wallet className="size-4" />${Number(l.budget_usd).toLocaleString()}
                        </span>
                      )}
                    </p>
                  </div>
                  {existing ? (
                    <div className="text-right">
                      <Badge variant={existing.status === "accepted" ? "default" : "secondary"} className="capitalize">
                        {existing.status === "pending" ? "Awaiting traveller" : existing.status}
                      </Badge>
                      {existing.status === "accepted" && existing.traveller_contact && (
                        <div className="mt-2 rounded-lg bg-secondary/60 p-2 text-xs">
                          {existing.traveller_contact.full_name && (
                            <p className="font-medium">{existing.traveller_contact.full_name}</p>
                          )}
                          {existing.traveller_contact.phone && <p>{existing.traveller_contact.phone}</p>}
                          {existing.traveller_contact.email && <p>{existing.traveller_contact.email}</p>}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="rounded-full"
                      disabled={outOfLeads}
                      title={outOfLeads ? "Monthly lead allowance reached" : undefined}
                      onClick={() => setOpenId(l.id)}
                    >
                      <Send className="size-4" /> Send offer
                    </Button>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {l.luxury_level && <Tag>{l.luxury_level}</Tag>}
                  {l.accommodation_type && <Tag>{l.accommodation_type}</Tag>}
                  {l.transport_preference && <Tag>{l.transport_preference}</Tag>}
                  {l.nationality && <Tag>{l.nationality} traveller</Tag>}
                  {l.arrival_airport && <Tag>Arrives {l.arrival_airport}</Tag>}
                  {l.activities.map((a) => (
                    <Tag key={a}>{a}</Tag>
                  ))}
                </div>

                {l.notes && <p className="mt-4 text-sm text-muted-foreground">{l.notes}</p>}

                {openId === l.id && (
                  <div className="mt-4 space-y-3 rounded-xl bg-secondary/60 p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor={`amount-${l.id}`}>Offer amount (KES, total)</Label>
                        <Input
                          id={`amount-${l.id}`}
                          type="number"
                          min={0}
                          value={offerAmount}
                          onChange={(e) => setOfferAmount(e.target.value)}
                          placeholder="165000"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`details-${l.id}`}>What's included</Label>
                      <Textarea
                        id={`details-${l.id}`}
                        value={packageDetails}
                        maxLength={2000}
                        rows={3}
                        onChange={(e) => setPackageDetails(e.target.value)}
                        placeholder="4-day Maasai Mara package. Includes transport, accommodation, meals and game drives."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`note-${l.id}`}>Personal note (optional)</Label>
                      <Textarea
                        id={`note-${l.id}`}
                        value={message}
                        maxLength={800}
                        rows={2}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Hi! ${company.name} runs small-group ${l.destination_name} trips. We'd love to host you.`}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="rounded-xl"
                        disabled={request.isPending}
                        onClick={() => request.mutate(l.id)}
                      >
                        Send offer
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setOpenId(null);
                          setOfferAmount("");
                          setPackageDetails("");
                          setMessage("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border px-3 py-1">{children}</span>
  );
}

function Empty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md px-5 py-20 text-center">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-3 text-muted-foreground">{body}</p>
      {action ?? (
        <Button asChild className="mt-6 rounded-xl">
          <Link to="/auth">Sign in</Link>
        </Button>
      )}
    </div>
  );
}