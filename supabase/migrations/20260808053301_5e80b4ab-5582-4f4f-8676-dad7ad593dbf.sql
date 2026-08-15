DROP VIEW public.operator_directory;

CREATE VIEW public.operator_directory WITH (security_invoker = on) AS
SELECT
  oc.id,
  oc.name,
  oc.slug,
  oc.description,
  oc.county,
  oc.website,
  oc.logo_url,
  oc.verified,
  oc.created_at,
  COALESCE(sp.premium_badge, false) AS premium_badge,
  COALESCE(sp.featured_listing, false) AS featured_listing,
  COALESCE(sp.priority_rank, 0) AS priority_rank,
  COALESCE(sp.name, 'Free') AS plan_name
FROM public.operator_companies oc
LEFT JOIN public.operator_subscriptions os
  ON os.company_id = oc.id AND os.status = 'active'
LEFT JOIN public.subscription_plans sp ON sp.id = os.plan_id
WHERE oc.verified = true;

GRANT SELECT ON public.operator_directory TO anon, authenticated;
GRANT ALL ON public.operator_directory TO service_role;

GRANT SELECT ON public.operator_subscriptions TO anon;

CREATE POLICY "Company plan assignment is publicly viewable" ON public.operator_subscriptions
  FOR SELECT USING (true);