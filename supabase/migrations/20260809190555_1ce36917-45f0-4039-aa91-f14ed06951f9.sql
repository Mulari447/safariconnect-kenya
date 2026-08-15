REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.assign_default_subscription() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_lead_traveller() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_review_helpful_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_review() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.company_plan(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;