import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Briefcase, Inbox, Lock, Mail, Phone, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  myCompanyQuery,
  myLeadRequestsQuery,
  openLeadsQuery,
  unlockedContactsQuery,
} from "@/lib/operator-queries";
import { companyPlanQuery, leadUsageQuery, leadsRemaining } from "@/lib/plan-queries";


export const Route = createFileRoute("/operator/")({
  head: () => ({
    meta: [
      { title: "Operator Dashboard — SafariConnect Kenya" },
      {
        name: "description",
        content:
          "Licensed Kenyan tour operators: manage your company profile, track traveller leads and contact travellers who accepted your request.",
      },
      { property: "og:title", content: "Operator Dashboard — SafariConnect Kenya" },
      {
        property: "og:description",
        content: "Manage your company profile and traveller leads on SafariConnect Kenya.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/operator" },
    ],
    links: [{ rel: "canonical", href: "/operator" }],
  }),
  component: OperatorDashboard,
});

function OperatorDashboard() {
  const { user, loading } = useAuth();
  const { data: company, isLoading } = useQuery({ ...myCompanyQuery, enabled: !!user });
  const { data: requests } = useQuery({
    ...myLeadRequestsQuery(company?.id),
    enabled: !!company,
  });
  const { data: leads } = useQuery({ ...openLeadsQuery, enabled: !!company });
  const { data: current } = useQuery({ ...companyPlanQuery(company?.id), enabled: !!company });
  const plan = current?.plan ?? null;
  const { data: usedLeads } = useQuery({
    ...leadUsageQuery(company?.id, current?.subscription?.current_period_start),
    enabled: !!company && !!current?.subscription,
  });
  const { data: contacts } = useQuery({
    ...unlockedContactsQuery,
    enabled: !!company && !!plan?.crm_access,
  });


  if (!loading && !user) {
    return (
      <Gate
        title="Operator sign in"
        body="Sign in with your company account to see traveller leads."
      />
    );
  }

  if (loading || isLoading) {
    return <p className="mx-auto max-w-4xl px-5 py-16 text-muted-foreground">Loading…</p>;
  }

  if (!company) {
    return (
      <Gate
        title="Register your tour company"
        body="Create your company profile to start receiving traveller leads from across Kenya."
        cta="profile"
      />
    );
  }

  const all = requests ?? [];
  const accepted = all.filter((r) => r.status === "accepted");
  const pending = all.filter((r) => r.status === "pending");
  const leadById = new Map((leads ?? []).map((l) => [l.id, l]));
  const contactById = new Map((contacts ?? []).map((c) => [c.id, c]));

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-primary">Operator dashboard</p>
          <h1 className="mt-2 flex flex-wrap items-center gap-3 text-4xl font-semibold">
            {company.name}
            {company.status === "approved" ? (
              <Badge className="gap-1">
                <BadgeCheck className="size-3.5" /> Approved
              </Badge>
            ) : company.status === "rejected" ? (
              <Badge variant="destructive">Not approved</Badge>
            ) : (
              <Badge variant="secondary">Pending admin approval</Badge>
            )}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/operator/profile">Company profile</Link>
          </Button>
          <Button asChild className="rounded-xl">
            <Link to="/operator/leads">Browse leads</Link>
          </Button>
        </div>
      </div>

      {company.status !== "approved" && (
        <div className="mt-6 rounded-2xl bg-secondary p-5">
          <p className="font-semibold">
            {company.status === "rejected"
              ? "Your application was not approved"
              : "Your application is awaiting admin approval"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {company.admin_note ??
              "An administrator is verifying your business registration, KRA PIN and TRA licence. Lead access unlocks once approved."}
          </p>
          <Button asChild variant="outline" className="mt-3 rounded-xl">
            <Link to="/operator/profile">Review my application</Link>
          </Button>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat icon={<Inbox className="size-4" />} label="Requests sent" value={all.length} />
        <Stat icon={<Users className="size-4" />} label="Awaiting traveller" value={pending.length} />
        <Stat
          icon={<Briefcase className="size-4" />}
          label="Accepted leads"
          value={accepted.length}
        />
      </div>

      <section className="mt-8 rounded-2xl bg-card p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Current plan
            </p>
            <h2 className="mt-1 flex flex-wrap items-center gap-2 text-xl font-semibold">
              {plan?.name ?? "No plan assigned"}
              {plan?.premium_badge && (
                <Badge className="gap-1">
                  <BadgeCheck className="size-3.5" /> Premium
                </Badge>
              )}
              {plan?.featured_listing && <Badge variant="secondary">Featured listing</Badge>}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/operator/subscription">Plan &amp; limits</Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link to="/operator/billing">Billing &amp; payments</Link>
            </Button>
          </div>
        </div>
        <div className="mt-4 max-w-md">
          <p className="text-sm text-muted-foreground">
            {plan?.lead_limit_monthly == null
              ? `${usedLeads ?? 0} lead requests sent this month · unlimited`
              : `${usedLeads ?? 0} of ${plan.lead_limit_monthly} monthly lead requests used`}
          </p>
          {plan?.lead_limit_monthly != null && plan.lead_limit_monthly > 0 && (
            <Progress
              className="mt-2"
              value={Math.min(100, Math.round(((usedLeads ?? 0) / plan.lead_limit_monthly) * 100))}
            />
          )}
          {leadsRemaining(plan, usedLeads ?? 0) === 0 && (
            <p className="mt-2 text-sm font-medium text-destructive">
              Monthly lead allowance reached — upgrade to keep contacting travellers.
            </p>
          )}
        </div>
      </section>

      <h2 className="mt-12 text-2xl font-semibold">Your contactable leads</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Contact details appear only after the traveller accepts your request.
      </p>

      {!plan?.crm_access ? (
        <div className="mt-6 rounded-2xl bg-card p-8 text-center shadow-soft">
          <Lock className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-3 font-semibold">CRM access is not included in {plan?.name ?? "your plan"}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Upgrade to store traveller contacts, phone numbers and WhatsApp links in your operator
            CRM.
          </p>
          <Button asChild className="mt-5 rounded-xl">
            <Link to="/operator/subscription">See plans</Link>
          </Button>
        </div>
      ) : accepted.length === 0 ? (

        <div className="mt-6 rounded-2xl bg-card p-8 text-center shadow-soft">
          <p className="font-semibold">No accepted leads yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse open trip requests and introduce your company — travellers who accept unlock
            their phone and email for you.
          </p>
          <Button asChild className="mt-5 rounded-xl">
            <Link to="/operator/leads">Browse open leads</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {accepted.map((r) => {
            const lead = leadById.get(r.trip_request_id);
            const contact = contactById.get(r.traveller_id);
            return (
              <li key={r.id} className="rounded-2xl bg-card p-6 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {lead?.destination_name ?? "Trip request"}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {contact?.full_name || "Traveller"}
                      {contact?.country ? ` · ${contact.country}` : ""}
                      {contact?.preferred_language ? ` · ${contact.preferred_language}` : ""}
                    </p>
                  </div>
                  <Badge>Accepted</Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  {contact?.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 font-medium"
                    >
                      <Phone className="size-4" /> {contact.phone}
                    </a>
                  )}
                  <a
                    href={`https://wa.me/${(contact?.phone ?? "").replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 font-medium"
                  >
                    <Mail className="size-4" /> WhatsApp
                  </a>
                </div>
                {lead?.notes && (
                  <p className="mt-4 text-sm text-muted-foreground">{lead.notes}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-soft">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function Gate({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: "profile";
}) {
  return (
    <div className="mx-auto w-full max-w-md px-5 py-20 text-center">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-3 text-muted-foreground">{body}</p>
      <Button asChild className="mt-6 rounded-xl">
        {cta === "profile" ? (
          <Link to="/operator/profile">Register company</Link>
        ) : (
          <Link to="/auth">Sign in</Link>
        )}
      </Button>
    </div>
  );
}

