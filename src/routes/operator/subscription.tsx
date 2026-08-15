import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Check, Minus, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { myCompanyQuery } from "@/lib/operator-queries";
import {
  companyPlanQuery,
  leadUsageQuery,
  leadsRemaining,
  plansQuery,
  type SubscriptionPlan,
} from "@/lib/plan-queries";

export const Route = createFileRoute("/operator/subscription")({
  head: () => ({
    meta: [
      { title: "Your Plan & Limits — SafariConnect Kenya Operators" },
      {
        name: "description",
        content:
          "See your SafariConnect Kenya operator plan: monthly lead allowance, storage, CRM and reports access, staff seats, package limits, marketplace ranking and badges.",
      },
      { property: "og:title", content: "Your Plan & Limits — SafariConnect Kenya Operators" },
      {
        property: "og:description",
        content: "Track your operator plan allowances and compare upgrade options.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/operator/subscription" },
    ],
    links: [{ rel: "canonical", href: "/operator/subscription" }],
  }),
  component: SubscriptionPage,
});

function SubscriptionPage() {
  const { user, loading } = useAuth();
  const { data: company, isLoading: loadingCompany } = useQuery({
    ...myCompanyQuery,
    enabled: !!user,
  });
  const { data: current } = useQuery({
    ...companyPlanQuery(company?.id),
    enabled: !!company,
  });
  const { data: used } = useQuery({
    ...leadUsageQuery(company?.id, current?.subscription?.current_period_start),
    enabled: !!company && !!current?.subscription,
  });
  const { data: plans } = useQuery(plansQuery);

  if (loading || loadingCompany) {
    return <p className="mx-auto max-w-4xl px-5 py-16 text-muted-foreground">Loading…</p>;
  }

  if (!user || !company) {
    return (
      <div className="mx-auto w-full max-w-md px-5 py-20 text-center">
        <h1 className="text-3xl font-semibold">Register your company</h1>
        <p className="mt-3 text-muted-foreground">
          Plans and lead allowances apply once your tour company is registered.
        </p>
        <Button asChild className="mt-6 rounded-xl">
          <Link to="/operator/profile">Register company</Link>
        </Button>
      </div>
    );
  }

  const plan = current?.plan ?? null;
  const leadsUsed = used ?? 0;
  const remaining = leadsRemaining(plan, leadsUsed);
  const limit = plan?.lead_limit_monthly ?? null;
  const pct = limit && limit > 0 ? Math.min(100, Math.round((leadsUsed / limit) * 100)) : 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12">
      <p className="eyebrow text-primary">Subscription</p>
      <h1 className="mt-2 text-4xl font-semibold">Your plan &amp; limits</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Limits are set by the SafariConnect team and enforced across your portal.
      </p>

      <section className="mt-8 rounded-2xl bg-card p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-3 text-2xl font-semibold">
            {plan?.name ?? "No plan assigned"}
            {plan?.premium_badge && (
              <Badge className="gap-1">
                <BadgeCheck className="size-3.5" /> Premium
              </Badge>
            )}
            {plan?.featured_listing && (
              <Badge variant="secondary" className="gap-1">
                <Star className="size-3.5" /> Featured
              </Badge>
            )}
          </h2>
          {current?.subscription && (
            <p className="text-sm text-muted-foreground">
              Current period {current.subscription.current_period_start} →{" "}
              {current.subscription.current_period_end}
            </p>
          )}
        </div>

        <div className="mt-6 max-w-md">
          <p className="text-sm font-medium">
            {limit == null
              ? `${leadsUsed} lead requests sent this period · unlimited`
              : `${leadsUsed} of ${limit} lead requests used this period`}
          </p>
          {limit != null && <Progress value={pct} className="mt-2" />}
          {remaining === 0 && (
            <p className="mt-2 text-sm font-medium text-destructive">
              You have used your monthly lead allowance. Upgrade to keep contacting travellers.
            </p>
          )}
        </div>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Entitlement label="Storage" value={plan ? `${plan.storage_mb} MB` : "—"} />
          <Entitlement label="Staff accounts" value={plan ? String(plan.staff_accounts) : "—"} />
          <Entitlement
            label="Packages"
            value={plan ? (plan.package_limit == null ? "Unlimited" : String(plan.package_limit)) : "—"}
          />
          <Entitlement label="CRM access" value={plan?.crm_access ? "Included" : "Not included"} />
          <Entitlement label="Reports" value={plan?.reports_access ? "Included" : "Not included"} />
          <Entitlement
            label="Marketplace ranking"
            value={plan ? `Priority ${plan.priority_rank}` : "—"}
          />
        </dl>
      </section>

      <h2 className="mt-14 text-2xl font-semibold">Available plans</h2>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {(plans ?? [])
          .filter((p) => p.is_active)
          .map((p) => (
            <PlanCard key={p.id} plan={p} current={p.id === plan?.id} />
          ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button asChild className="rounded-xl">
          <Link to="/operator/billing">Pay with M-Pesa or card</Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Upgrades activate automatically once payment confirms.
        </p>
      </div>
    </div>
  );
}

function Entitlement({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/60 p-4">
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold">{value}</dd>
    </div>
  );
}

function PlanCard({ plan, current }: { plan: SubscriptionPlan; current: boolean }) {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-semibold">{plan.name}</h3>
        {current ? <Badge>Current plan</Badge> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold">
        KES {plan.price_kes.toLocaleString()}
        <span className="text-sm font-normal text-muted-foreground"> / month</span>
      </p>
      {plan.description && (
        <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
      )}
      <ul className="mt-4 space-y-2 text-sm">
        <Line
          on
          text={
            plan.lead_limit_monthly == null
              ? "Unlimited leads per month"
              : `${plan.lead_limit_monthly} leads per month`
          }
        />
        <Line on text={`${plan.storage_mb} MB storage`} />
        <Line on text={`${plan.staff_accounts} staff account${plan.staff_accounts === 1 ? "" : "s"}`} />
        <Line
          on
          text={
            plan.package_limit == null
              ? "Unlimited packages"
              : `${plan.package_limit} tour packages`
          }
        />
        <Line on={plan.crm_access} text="CRM access" />
        <Line on={plan.reports_access} text="Reports" />
        <Line on={plan.premium_badge} text="Premium badge" />
        <Line on={plan.featured_listing} text="Featured listing" />
      </ul>
    </div>
  );
}

function Line({ on, text }: { on: boolean; text: string }) {
  return (
    <li className="flex items-center gap-2">
      {on ? (
        <Check className="size-4 text-primary" />
      ) : (
        <Minus className="size-4 text-muted-foreground" />
      )}
      <span className={on ? "" : "text-muted-foreground"}>{text}</span>
    </li>
  );
}
