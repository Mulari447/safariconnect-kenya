revoke all on function public.set_lead_traveller() from public, anon, authenticated;
revoke all on function public.validate_review() from public, anon, authenticated;
revoke all on function public.sync_review_helpful_count() from public, anon, authenticated;
revoke all on function public.update_updated_at_column() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.has_role(uuid, public.app_role) from anon;
revoke execute on function public.owns_company(uuid, uuid) from anon;
revoke execute on function public.has_accepted_lead(uuid, uuid) from anon;