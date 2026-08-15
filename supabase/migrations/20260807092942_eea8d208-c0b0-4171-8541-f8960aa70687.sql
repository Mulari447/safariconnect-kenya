create policy "Users can self-assign the operator role" on public.user_roles
  for insert to authenticated with check (auth.uid() = user_id and role = 'operator');
grant insert, delete on public.user_roles to authenticated;
create policy "Users can drop their own operator role" on public.user_roles
  for delete to authenticated using (auth.uid() = user_id and role = 'operator');