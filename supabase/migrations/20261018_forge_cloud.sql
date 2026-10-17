-- SHALVERO FORGE: authenticated, revisioned, tenant-isolated cloud documents.
-- Execute once in a dedicated Supabase project; keep role/service keys off GitHub Pages.
begin;

create table if not exists public.forge_workshops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null default 'המסגריה שלי',
  created_at timestamptz not null default now()
);

create table if not exists public.forge_memberships (
  workshop_id uuid not null references public.forge_workshops(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','editor','viewer')),
  created_at timestamptz not null default now(),
  primary key(workshop_id,user_id)
);
create index if not exists forge_members_user on public.forge_memberships(user_id,workshop_id);

create table if not exists public.forge_documents (
  workshop_id uuid not null references public.forge_workshops(id) on delete cascade,
  doc_key text not null check (doc_key in ('mp_projects','mp_inventory_v1','mp_settings_v1','mp_purchase_orders_v1')),
  payload jsonb not null,
  revision bigint not null default 1 check(revision>0),
  updated_at timestamptz not null default now(),
  updated_by uuid not null references auth.users(id),
  primary key (workshop_id, doc_key)
);

alter table public.forge_workshops enable row level security;
alter table public.forge_memberships enable row level security;
alter table public.forge_documents enable row level security;

revoke all on public.forge_workshops, public.forge_memberships, public.forge_documents from anon,authenticated;
grant select on public.forge_workshops,public.forge_memberships,public.forge_documents to authenticated;

create policy "owner or member reads own workshop"
  on public.forge_workshops for select to authenticated
  using (owner_id=(select auth.uid())
    or exists(select 1 from public.forge_memberships m where m.workshop_id=id and m.user_id=(select auth.uid())));

create policy "member reads own membership"
  on public.forge_memberships for select to authenticated
  using(user_id=(select auth.uid()));

create policy "member reads workshop documents"
  on public.forge_documents for select to authenticated
  using(exists(select 1 from public.forge_memberships m
               where m.workshop_id=forge_documents.workshop_id and m.user_id=(select auth.uid())));

-- One workshop per owner in the initial release.
-- No arbitrary membership or invitation API is exposed in V8.
create or replace function public.forge_bootstrap(p_name text default 'המסגריה שלי')
returns uuid language plpgsql security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
begin
  if v_user is null then raise exception 'login required' using errcode='42501'; end if;
  if coalesce((select raw_app_meta_data->>'provider' from auth.users where id=v_user),'')='anonymous'
    then raise exception 'permanent account required' using errcode='42501'; end if;

  insert into public.forge_workshops(owner_id,name)
    values (v_user,left(coalesce(nullif(trim(p_name),''),'המסגריה שלי'),100))
    on conflict(owner_id) do nothing;
  select id into v_id from public.forge_workshops where owner_id=v_user;

  insert into public.forge_memberships(workshop_id,user_id,role)
    values(v_id,v_user,'owner')
    on conflict(workshop_id,user_id) do nothing;
  return v_id;
end $$;

-- Atomic optimistic locking prevents old devices from silently replacing newer data.
create or replace function public.forge_save_document(
  p_workshop_id uuid,
  p_doc_key text,
  p_payload jsonb,
  p_expected_revision bigint default 0
)
returns jsonb language plpgsql security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_revision bigint;
begin
  if v_user is null then raise exception 'login required' using errcode='42501'; end if;
  if not exists(select 1 from public.forge_memberships m
        where m.workshop_id=p_workshop_id and m.user_id=v_user and m.role in ('owner','admin','editor')) then
    raise exception 'workshop write denied' using errcode='42501';
  end if;
  if p_doc_key is null or p_doc_key not in ('mp_projects','mp_inventory_v1','mp_settings_v1','mp_purchase_orders_v1') then
    raise exception 'unsupported document type' using errcode='22023';
  end if;
  if p_payload is null or pg_catalog.octet_length(p_payload::text)>2097152 then
    raise exception 'document too large or empty' using errcode='22023';
  end if;
  if (p_doc_key='mp_settings_v1' and jsonb_typeof(p_payload)<>'object')
     or (p_doc_key in ('mp_projects','mp_inventory_v1','mp_purchase_orders_v1') and jsonb_typeof(p_payload)<>'array') then
    raise exception 'invalid collection data type' using errcode='22023';
  end if;
  if p_expected_revision is null or p_expected_revision<0 then
    raise exception 'expected revision required' using errcode='22023';
  end if;
  if p_expected_revision=0 then
    insert into public.forge_documents(workshop_id,doc_key,payload,revision,updated_by)
    values(p_workshop_id,p_doc_key,p_payload,1,v_user)
    on conflict (workshop_id,doc_key) do nothing returning revision into v_revision;
  else
    update public.forge_documents
       set payload=p_payload,revision=revision+1,updated_at=now(),updated_by=v_user
     where workshop_id=p_workshop_id and doc_key=p_doc_key and revision=p_expected_revision
     returning revision into v_revision;
  end if;
  if v_revision is null then
    return pg_catalog.jsonb_build_object('status','conflict');
  end if;
  return pg_catalog.jsonb_build_object('status','ok','revision',v_revision);
end $$;

revoke all on function public.forge_bootstrap(text) from public,anon;
revoke all on function public.forge_save_document(uuid,text,jsonb,bigint) from public,anon;
grant execute on function public.forge_bootstrap(text) to authenticated;
grant execute on function public.forge_save_document(uuid,text,jsonb,bigint) to authenticated;
commit;
