import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { isAdminQuery, plansQuery, type SubscriptionPlan } from "@/lib/plan-queries";

export const Route = createFileRoute("/admin/plans")({
  head: () => ({
    meta: [
      { title: "Plan Settings — SafariConnect Kenya Admin" },
      {
        name: "description",
        content:
          "Configure SafariConnect Kenya subscription plans: pricing, lead limits, storage, CRM access, package limits, priority ranking, premium badge and featured listings.",
      },
      { property: "og:title", content: "Plan Settings — SafariConnect Kenya Admin" },
      {
        property: "og:description",
        content: "Configure operator subscription plans and entitlements.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AdminPlans,
});

type Draft = {
  name: string;
  description: string;
  price_kes: string;
  price_kes_annual: string;
  lead_limit_monthly: string;
  storage_mb: string;
  crm_access: boolean;
  reports_access: boolean;
  staff_accounts: string;
  package_limit: string;
  priority_rank: string;
  premium_badge: boolean;
  featured_listing: boolean;
  is_active: boolean;
};

const toDraft = (p: SubscriptionPlan): Draft => ({
  name: p.name,
  description: p.description ?? "",
  price_kes: String(p.price_kes),
  price_kes_annual: String(p.price_kes_annual),
  lead_limit_monthly: p.lead_limit_monthly == null ? "" : String(p.lead_limit_monthly),
  storage_mb: String(p.storage_mb),
  crm_access: p.crm_access,
  reports_access: p.reports_access,
  staff_accounts: String(p.staff_accounts),
  package_limit: p.package_limit == null ? "" : String(p.package_limit),
  priority_rank: String(p.priority_rank),
  premium_badge: p.premium_badge,
  featured_listing: p.featured_listing,
  is_active: p.is_active,
});

function AdminPlans() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const { data: isAdmin, isLoading: loadingRole } = useQuery({ ...isAdminQuery, enabled: !!user });
  const { data: plans, isLoading } = useQuery({ ...plansQuery, enabled: !!isAdmin });
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (plans) setDrafts(Object.fromEntries(plans.map((p) => [p.id, toDraft(p)])));
  }, [plans]);

  if (loading || (user && loadingRole)) {
    return <p className="mx-auto max-w-4xl px-5 py-16 text-muted-foreground">Loading…</p>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="mx-auto w-full max-w-md px-5 py-20 text-center">
        <h1 className="text-3xl font-semibold">Admins only</h1>
        <p className="mt-3 text-muted-foreground">
          Plan settings are restricted to SafariConnect administrators.
        </p>
        <Button asChild className="mt-6 rounded-xl">
          <Link to="/">Back to marketplace</Link>
        </Button>
      </div>
    );
  }

  const num = (v: string) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };
  const nullableNum = (v: string) => (v.trim() === "" ? null : num(v));

  const save = async (plan: SubscriptionPlan) => {
    const d = drafts[plan.id];
    if (!d) return;
    if (d.name.trim().length < 2) {
      toast.error("Plan name is required");
      return;
    }
    setSavingId(plan.id);
    try {
      await api.patch(`/api/plans/${plan.id}`, {
        name: d.name.trim().slice(0, 60),
        description: d.description.trim() ? d.description.trim().slice(0, 400) : null,
        priceKes: num(d.price_kes),
        priceKesAnnual: num(d.price_kes_annual),
        leadLimitMonthly: nullableNum(d.lead_limit_monthly),
        storageMb: num(d.storage_mb),
        crmAccess: d.crm_access,
        reportsAccess: d.reports_access,
        staffAccounts: num(d.staff_accounts),
        packageLimit: nullableNum(d.package_limit),
        priorityRank: num(d.priority_rank),
        premiumBadge: d.premium_badge,
        featuredListing: d.featured_listing,
        isActive: d.is_active,
      });
      toast.success(`${d.name} saved — operators see the new limits immediately.`);
      await qc.invalidateQueries({ queryKey: ["subscription-plans"] });
      await qc.invalidateQueries({ queryKey: ["company-plan"] });
      await qc.invalidateQueries({ queryKey: ["operator-directory"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the plan");
    } finally {
      setSavingId(null);
    }
  };

  const patch = (id: string, part: Partial<Draft>) =>
    setDrafts((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return { ...prev, [id]: { ...current, ...part } };
    });

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12">
      <p className="eyebrow text-primary">Administration</p>
      <h1 className="mt-2 text-4xl font-semibold">Plan settings</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Everything here is enforced in the operator portal: monthly lead limits, storage allowance,
        CRM and reports access, staff seats, package limits, marketplace priority ranking, the
        premium badge and featured listings. Leave a limit blank for unlimited.
      </p>

      {isLoading ? (
        <p className="mt-10 text-muted-foreground">Loading plans…</p>
      ) : (
        <div className="mt-10 space-y-6">
          {(plans ?? []).map((p) => {
            const d = drafts[p.id];
            if (!d) return null;
            return (
              <section key={p.id} className="rounded-2xl bg-card p-6 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="flex items-center gap-3 text-xl font-semibold">
                    {d.name || p.slug}
                    <Badge variant="secondary" className="font-mono text-xs">
                      {p.slug}
                    </Badge>
                    {!d.is_active && <Badge variant="outline">Hidden</Badge>}
                  </h2>
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Switch
                      checked={d.is_active}
                      onCheckedChange={(v) => patch(p.id, { is_active: v })}
                    />
                    Available to operators
                  </label>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <FieldText
                    id={`name-${p.id}`}
                    label="Plan name"
                    value={d.name}
                    onChange={(v) => patch(p.id, { name: v })}
                  />
                  <FieldText
                    id={`priority-${p.id}`}
                    label="Priority ranking (higher shows first)"
                    value={d.priority_rank}
                    onChange={(v) => patch(p.id, { priority_rank: v })}
                    numeric
                  />
                  <FieldText
                    id={`price-${p.id}`}
                    label="Monthly price (KES)"
                    value={d.price_kes}
                    onChange={(v) => patch(p.id, { price_kes: v })}
                    numeric
                  />
                  <FieldText
                    id={`price-y-${p.id}`}
                    label="Annual price (KES)"
                    value={d.price_kes_annual}
                    onChange={(v) => patch(p.id, { price_kes_annual: v })}
                    numeric
                  />
                  <FieldText
                    id={`leads-${p.id}`}
                    label="Lead limit per month (blank = unlimited)"
                    value={d.lead_limit_monthly}
                    onChange={(v) => patch(p.id, { lead_limit_monthly: v })}
                    numeric
                  />
                  <FieldText
                    id={`storage-${p.id}`}
                    label="Storage allowance (MB)"
                    value={d.storage_mb}
                    onChange={(v) => patch(p.id, { storage_mb: v })}
                    numeric
                  />
                  <FieldText
                    id={`staff-${p.id}`}
                    label="Staff accounts"
                    value={d.staff_accounts}
                    onChange={(v) => patch(p.id, { staff_accounts: v })}
                    numeric
                  />
                  <FieldText
                    id={`packages-${p.id}`}
                    label="Package limit (blank = unlimited)"
                    value={d.package_limit}
                    onChange={(v) => patch(p.id, { package_limit: v })}
                    numeric
                  />
                </div>

                <div className="mt-4 space-y-1.5">
                  <Label htmlFor={`desc-${p.id}`}>Description shown to operators</Label>
                  <Textarea
                    id={`desc-${p.id}`}
                    rows={2}
                    maxLength={400}
                    value={d.description}
                    onChange={(e) => patch(p.id, { description: e.target.value })}
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
                  <Toggle
                    label="CRM access"
                    checked={d.crm_access}
                    onChange={(v) => patch(p.id, { crm_access: v })}
                  />
                  <Toggle
                    label="Reports"
                    checked={d.reports_access}
                    onChange={(v) => patch(p.id, { reports_access: v })}
                  />
                  <Toggle
                    label="Premium badge"
                    checked={d.premium_badge}
                    onChange={(v) => patch(p.id, { premium_badge: v })}
                  />
                  <Toggle
                    label="Featured listing"
                    checked={d.featured_listing}
                    onChange={(v) => patch(p.id, { featured_listing: v })}
                  />
                </div>

                <Button
                  className="mt-6 rounded-xl"
                  disabled={savingId === p.id}
                  onClick={() => void save(p)}
                >
                  {savingId === p.id ? "Saving…" : "Save plan"}
                </Button>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FieldText({
  id,
  label,
  value,
  onChange,
  numeric,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  numeric?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        inputMode={numeric ? "numeric" : "text"}
        onChange={(e) => onChange(e.target.value)}
        maxLength={numeric ? 9 : 60}
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      <Switch checked={checked} onCheckedChange={onChange} />
      {label}
    </label>
  );
}