create table public.phone_calls (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'fonio',
  external_id text not null,
  raw_payload jsonb not null,
  caller_phone text,
  caller_name text,
  call_started_at timestamptz,
  duration_seconds integer,
  recording_url text,
  transcript text,
  provider_summary text,
  summary text,
  intent text check (intent in ('rental_inquiry','offer_change','complaint_damage','callback','info','other')),
  priority text check (priority in ('sofort','heute','woche','info')),
  priority_reason text,
  ai_priority text,
  location text,
  customer_name text,
  company_name text,
  email text,
  mentioned_items jsonb not null default '[]'::jsonb,
  open_points jsonb not null default '[]'::jsonb,
  rental_start date,
  crm_customer_id uuid references public.crm_customers(id) on delete set null,
  rental_inquiry_id uuid references public.rental_inquiries(id) on delete set null,
  analysis_status text not null default 'pending' check (analysis_status in ('pending','done','failed')),
  analysis_error text,
  status text not null default 'open' check (status in ('open','in_progress','done')),
  assigned_to uuid,
  notes text,
  priority_overridden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, external_id)
);
grant select, update on public.phone_calls to authenticated;
grant all on public.phone_calls to service_role;
alter table public.phone_calls enable row level security;
create policy "Staff read calls" on public.phone_calls for select to authenticated using (public.is_staff_member(auth.uid()));
create policy "Staff update calls" on public.phone_calls for update to authenticated using (public.is_staff_member(auth.uid())) with check (public.is_staff_member(auth.uid()));
create trigger phone_calls_updated before update on public.phone_calls for each row execute function public.update_updated_at_column();
create index phone_calls_open_idx on public.phone_calls (status, priority, created_at desc);
alter publication supabase_realtime add table public.phone_calls;