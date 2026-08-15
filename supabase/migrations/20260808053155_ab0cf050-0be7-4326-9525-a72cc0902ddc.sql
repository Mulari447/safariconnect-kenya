CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  price_kes numeric NOT NULL DEFAULT 0,
  price_kes_annual numeric NOT NULL DEFAULT 0,
  lead_limit_monthly integer,
  storage_mb integer NOT NULL DEFAULT 100,
  crm_access boolean NOT NULL DEFAULT false,
  reports_access boolean NOT NULL DEFAULT false,
  staff_accounts integer NOT NULL DEFAULT 1,
  package_limit integer,
  priority_rank integer NOT NULL DEFAULT 0,
  premium_badge boolean NOT NULL DEFAULT false,
  featured_listing boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.subscription_plans TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_plans TO authenticated;
GRANT ALL ON public.subscription_plans TO service_role;

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active plans are publicly viewable" ON public.subscription_plans
  FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins create plans" ON public.subscription_plans
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update plans" ON public.subscription_plans
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete plans" ON public.subscription_plans
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.subscription_plans
  (slug, name, description, price_kes, price_kes_annual, lead_limit_monthly, storage_mb, crm_access, reports_access, staff_accounts, package_limit, priority_rank, premium_badge, featured_listing, sort_order)
VALUES
  ('free', 'Free', 'Get started and test the marketplace.', 0, 0, 5, 100, false, false, 1, 3, 0, false, false, 1),
  ('basic', 'Basic', 'For small operators building a pipeline.', 2500, 25000, 30, 1024, true, false, 2, 10, 10, false, false, 2),
  ('professional', 'Professional', 'Full CRM, reports and a premium badge.', 7500, 75000, 150, 5120, true, true, 5, 40, 20, true, false, 3),
  ('enterprise', 'Enterprise', 'Unlimited leads, featured listings and priority ranking.', 20000, 200000, NULL, 51200, true, true, 25, NULL, 30, true, true, 4);

CREATE TABLE public.operator_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL UNIQUE REFERENCES public.operator_companies(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.operator_subscriptions TO authenticated;
GRANT ALL ON public.operator_subscriptions TO service_role;

ALTER TABLE public.operator_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view their subscription" ON public.operator_subscriptions
  FOR SELECT TO authenticated
  USING (public.owns_company(auth.uid(), company_id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins change subscriptions" ON public.operator_subscriptions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins create subscriptions" ON public.operator_subscriptions
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_operator_subscriptions_updated_at BEFORE UPDATE ON public.operator_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.assign_default_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE free_plan uuid;
BEGIN
  SELECT id INTO free_plan FROM public.subscription_plans WHERE slug = 'free';
  IF free_plan IS NOT NULL THEN
    INSERT INTO public.operator_subscriptions (company_id, plan_id)
    VALUES (NEW.id, free_plan)
    ON CONFLICT (company_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_default_subscription() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER operator_companies_default_subscription AFTER INSERT ON public.operator_companies
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_subscription();

INSERT INTO public.operator_subscriptions (company_id, plan_id)
SELECT oc.id, sp.id FROM public.operator_companies oc
CROSS JOIN public.subscription_plans sp WHERE sp.slug = 'free'
ON CONFLICT (company_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.company_plan(_company_id uuid)
RETURNS public.subscription_plans
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sp.* FROM public.operator_subscriptions os
  JOIN public.subscription_plans sp ON sp.id = os.plan_id
  WHERE os.company_id = _company_id AND os.status = 'active'
$$;