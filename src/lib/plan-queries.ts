// src/lib/plan-queries.ts
import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type SubscriptionPlan = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_kes: number;
  price_kes_annual: number;
  lead_limit_monthly: number | null;
  storage_mb: number;
  crm_access: boolean;
  reports_access: boolean;
  staff_accounts: number;
  package_limit: number | null;
  priority_rank: number;
  premium_badge: boolean;
  featured_listing: boolean;
  sort_order: number;
  is_active: boolean;
};

export type OperatorSubscription = {
  id: string;
  company_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
};

type ApiPlan = {
  id: string; slug: string; name: string; description: string | null;
  priceKes: number; priceKesAnnual: number; leadLimitMonthly: number | null;
  storageMb: number; crmAccess: boolean; reportsAccess: boolean; staffAccounts: number;
  packageLimit: number | null; priorityRank: number; premiumBadge: boolean;
  featuredListing: boolean; sortOrder: number; isActive: boolean;
};

function mapPlan(p: ApiPlan): SubscriptionPlan {
  return {
    id: p.id, slug: p.slug, name: p.name, description: p.description,
    price_kes: p.priceKes, price_kes_annual: p.priceKesAnnual,
    lead_limit_monthly: p.leadLimitMonthly, storage_mb: p.storageMb,
    crm_access: p.crmAccess, reports_access: p.reportsAccess,
    staff_accounts: p.staffAccounts, package_limit: p.packageLimit,
    priority_rank: p.priorityRank, premium_badge: p.premiumBadge,
    featured_listing: p.featuredListing, sort_order: p.sortOrder, is_active: p.isActive,
  };
}

export const plansQuery = queryOptions({
  queryKey: ["subscription-plans"],
  queryFn: async (): Promise<SubscriptionPlan[]> => {
    const data = await api.get<ApiPlan[]>("/api/plans");
    return data.map(mapPlan).sort((a, b) => a.sort_order - b.sort_order);
  },
});

export const isAdminQuery = queryOptions({
  queryKey: ["is-admin"],
  queryFn: async (): Promise<boolean> => {
    try {
      const me = await api.get<{ roles: string[] }>("/api/auth/me");
      return me.roles.includes("admin");
    } catch {
      return false;
    }
  },
});

export type CompanyPlan = {
  subscription: OperatorSubscription | null;
  plan: SubscriptionPlan | null;
};

type ApiCompanyWithSub = {
  subscription: {
    id: string; companyId: string; planId: string; status: string;
    currentPeriodStart: string; currentPeriodEnd: string;
    plan: ApiPlan;
  } | null;
};

export const companyPlanQuery = (companyId: string | undefined) =>
  queryOptions({
    queryKey: ["company-plan", companyId],
    queryFn: async (): Promise<CompanyPlan> => {
      if (!companyId) return { subscription: null, plan: null };
      try {
        const company = await api.get<ApiCompanyWithSub>("/api/operators/me");
        if (!company.subscription) return { subscription: null, plan: null };
        const { plan, ...sub } = company.subscription;
        return {
          subscription: {
            id: sub.id, company_id: sub.companyId, plan_id: sub.planId, status: sub.status,
            current_period_start: sub.currentPeriodStart, current_period_end: sub.currentPeriodEnd,
          },
          plan: mapPlan(plan),
        };
      } catch {
        return { subscription: null, plan: null };
      }
    },
  });

export const leadUsageQuery = (companyId: string | undefined, periodStart: string | undefined) =>
  queryOptions({
    queryKey: ["lead-usage", companyId, periodStart],
    queryFn: async (): Promise<number> => {
      if (!companyId || !periodStart) return 0;
      const leads = await api.get<Array<{ createdAt: string }>>("/api/leads/mine");
      const since = new Date(periodStart).getTime();
      return leads.filter((l) => new Date(l.createdAt).getTime() >= since).length;
    },
  });

export type DirectoryOperator = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  county: string | null;
  website: string | null;
  logo_url: string | null;
  premium_badge: boolean;
  featured_listing: boolean;
  priority_rank: number;
  plan_name: string;
};

type ApiDirectoryCompany = {
  id: string; name: string; slug: string; description: string | null; county: string | null;
  website: string | null; logoUrl: string | null; verified: boolean; createdAt: string;
  subscription: { plan: { name: string; premiumBadge: boolean; featuredListing: boolean; priorityRank: number } } | null;
};

export const operatorDirectoryQuery = queryOptions({
  queryKey: ["operator-directory"],
  queryFn: async (): Promise<DirectoryOperator[]> => {
    const data = await api.get<ApiDirectoryCompany[]>("/api/operators/directory");
    return data
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        county: c.county,
        website: c.website,
        logo_url: c.logoUrl,
        premium_badge: c.subscription?.plan.premiumBadge ?? false,
        featured_listing: c.subscription?.plan.featuredListing ?? false,
        priority_rank: c.subscription?.plan.priorityRank ?? 0,
        plan_name: c.subscription?.plan.name ?? "Free",
      }))
      .sort((a, b) => b.priority_rank - a.priority_rank || a.name.localeCompare(b.name));
  },
});

export function leadsRemaining(plan: SubscriptionPlan | null, used: number): number | null {
  if (!plan || plan.lead_limit_monthly == null) return null;
  return Math.max(0, plan.lead_limit_monthly - used);
}