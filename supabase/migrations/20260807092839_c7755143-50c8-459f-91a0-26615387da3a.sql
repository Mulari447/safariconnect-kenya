-- ROLES
create type public.app_role as enum ('admin', 'operator', 'customer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
revoke all on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;

create policy "Users can view their own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

-- OPERATOR COMPANIES
create table public.operator_companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  county text,
  phone text,
  email text,
  website text,
  license_number text,
  logo_url text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.operator_companies to anon;
grant select, insert, update, delete on public.operator_companies to authenticated;
grant all on public.operator_companies to service_role;
alter table public.operator_companies enable row level security;

create policy "Verified companies are publicly viewable" on public.operator_companies
  for select using (verified = true);
create policy "Owners can view their own company" on public.operator_companies
  for select to authenticated using (auth.uid() = owner_id or public.has_role(auth.uid(), 'admin'));
create policy "Owners can create their company" on public.operator_companies
  for insert to authenticated with check (auth.uid() = owner_id);
create policy "Owners can update their company" on public.operator_companies
  for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "Admins can update any company" on public.operator_companies
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));

create trigger update_operator_companies_updated_at before update on public.operator_companies
  for each row execute function public.update_updated_at_column();

-- LEAD REQUESTS
create table public.lead_requests (
  id uuid primary key default gen_random_uuid(),
  trip_request_id uuid not null references public.trip_requests(id) on delete cascade,
  company_id uuid not null references public.operator_companies(id) on delete cascade,
  traveller_id uuid not null references auth.users(id) on delete cascade,
  message text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_request_id, company_id)
);
grant select, insert, update on public.lead_requests to authenticated;
grant all on public.lead_requests to service_role;
alter table public.lead_requests enable row level security;

create or replace function public.owns_company(_user_id uuid, _company_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.operator_companies where id = _company_id and owner_id = _user_id)
$$;
revoke all on function public.owns_company(uuid, uuid) from public, anon;
grant execute on function public.owns_company(uuid, uuid) to authenticated, service_role;

create policy "Operators view their own lead requests" on public.lead_requests
  for select to authenticated using (public.owns_company(auth.uid(), company_id));
create policy "Travellers view requests on their trips" on public.lead_requests
  for select to authenticated using (auth.uid() = traveller_id);
create policy "Operators create lead requests" on public.lead_requests
  for insert to authenticated with check (public.owns_company(auth.uid(), company_id));
create policy "Travellers decide on lead requests" on public.lead_requests
  for update to authenticated using (auth.uid() = traveller_id) with check (auth.uid() = traveller_id);

create trigger update_lead_requests_updated_at before update on public.lead_requests
  for each row execute function public.update_updated_at_column();

create or replace function public.set_lead_traveller()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select user_id into new.traveller_id from public.trip_requests where id = new.trip_request_id;
  if new.traveller_id is null then raise exception 'Trip request not found'; end if;
  new.status := 'pending';
  return new;
end;
$$;
create trigger lead_requests_set_traveller before insert on public.lead_requests
  for each row execute function public.set_lead_traveller();

-- Operators can browse open trip requests (leads)
create policy "Operators can browse open leads" on public.trip_requests
  for select to authenticated using (public.has_role(auth.uid(), 'operator') and status = 'open');

-- Operators can see traveller contact details only after acceptance
create or replace function public.has_accepted_lead(_operator_user_id uuid, _traveller_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.lead_requests lr
    join public.operator_companies oc on oc.id = lr.company_id
    where lr.traveller_id = _traveller_id
      and oc.owner_id = _operator_user_id
      and lr.status = 'accepted'
  )
$$;
revoke all on function public.has_accepted_lead(uuid, uuid) from public, anon;
grant execute on function public.has_accepted_lead(uuid, uuid) to authenticated, service_role;

create policy "Operators view contacts of accepted leads" on public.profiles
  for select to authenticated using (public.has_accepted_lead(auth.uid(), id));

-- REVIEWS
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  destination_slug text,
  company_id uuid references public.operator_companies(id) on delete set null,
  rating integer not null,
  title text,
  body text not null,
  photos text[] not null default '{}',
  author_name text,
  verified_traveler boolean not null default false,
  helpful_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.reviews to anon;
grant select, insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;

create policy "Reviews are publicly viewable" on public.reviews for select using (true);
create policy "Users write their own reviews" on public.reviews
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update their own reviews" on public.reviews
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete their own reviews" on public.reviews
  for delete to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create trigger update_reviews_updated_at before update on public.reviews
  for each row execute function public.update_updated_at_column();

create or replace function public.validate_review()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.rating < 1 or new.rating > 5 then raise exception 'Rating must be between 1 and 5'; end if;
  if array_length(new.photos, 1) > 6 then raise exception 'Up to 6 photos per review'; end if;
  new.verified_traveler := exists (
    select 1 from public.trip_requests tr
    where tr.user_id = new.user_id
      and (new.destination_slug is null or tr.destination_slug = new.destination_slug)
  );
  if new.author_name is null then
    select full_name into new.author_name from public.profiles where id = new.user_id;
  end if;
  return new;
end;
$$;
create trigger reviews_validate before insert or update on public.reviews
  for each row execute function public.validate_review();

-- HELPFUL VOTES
create table public.review_votes (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (review_id, user_id)
);
grant select, insert, delete on public.review_votes to authenticated;
grant all on public.review_votes to service_role;
alter table public.review_votes enable row level security;

create policy "Signed in users see votes" on public.review_votes for select to authenticated using (true);
create policy "Users cast their own votes" on public.review_votes
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users remove their own votes" on public.review_votes
  for delete to authenticated using (auth.uid() = user_id);

create or replace function public.sync_review_helpful_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.reviews r
     set helpful_count = (select count(*) from public.review_votes v where v.review_id = r.id)
   where r.id = coalesce(new.review_id, old.review_id);
  return null;
end;
$$;
create trigger review_votes_sync after insert or delete on public.review_votes
  for each row execute function public.sync_review_helpful_count();

-- ABUSE REPORTS
create table public.review_reports (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (review_id, reporter_id)
);
grant select, insert on public.review_reports to authenticated;
grant all on public.review_reports to service_role;
alter table public.review_reports enable row level security;

create policy "Reporters and admins view reports" on public.review_reports
  for select to authenticated using (auth.uid() = reporter_id or public.has_role(auth.uid(), 'admin'));
create policy "Users file their own reports" on public.review_reports
  for insert to authenticated with check (auth.uid() = reporter_id);
create policy "Admins resolve reports" on public.review_reports
  for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create trigger update_review_reports_updated_at before update on public.review_reports
  for each row execute function public.update_updated_at_column();