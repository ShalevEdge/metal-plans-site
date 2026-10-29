-- ONLY on an empty disposable Postgres database, never on Supabase Production.
\set ON_ERROR_STOP 1
do $$ begin
 if current_database() <> 'forge_security_test_20261028' then raise exception 'requires isolated forge test database'; end if;
end $$;
create schema auth;
create table auth.users(id uuid primary key,raw_app_meta_data jsonb not null default '{}',is_anonymous boolean not null default false);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
do $$ begin
 if not exists(select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
 if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
end $$;
grant usage on schema public,auth to anon,authenticated;
\i supabase/migrations/20261018_forge_cloud.sql
-- The managed platform's event-trigger helper is not reproduced by this fixture.
-- Verify this repo's explicit revoke against a no-op signature only.
create function public.rls_auto_enable() returns event_trigger language plpgsql as $$begin return; end$$;
\i supabase/migrations/20261018_forge_security_hardening.sql
insert into auth.users(id) values
 ('aaaaaaaa-0000-0000-0000-000000000001'),('bbbbbbbb-0000-0000-0000-000000000002'),
 ('cccccccc-0000-0000-0000-000000000003'),('dddddddd-0000-0000-0000-000000000004');
create table public.security_fixture(k text primary key,v uuid);
grant select,insert on public.security_fixture to authenticated;
set role authenticated;
set request.jwt.claim.sub='aaaaaaaa-0000-0000-0000-000000000001';
insert into public.security_fixture select 'a',public.forge_bootstrap('synthetic A');
select public.forge_save_document((select v from public.security_fixture where k='a'),'mp_projects','[]',0);
set request.jwt.claim.sub='bbbbbbbb-0000-0000-0000-000000000002';
insert into public.security_fixture select 'b',public.forge_bootstrap('synthetic B');
do $$ declare result jsonb; begin
 if (select count(*) from public.forge_workshops)<>1 then raise exception 'FAIL: foreign workshop visible'; end if;
 if exists(select 1 from public.forge_documents) then raise exception 'FAIL: foreign documents visible'; end if;
 begin
  perform public.forge_save_document((select v from public.security_fixture where k='a'),'mp_projects','[]',1);
  raise exception 'FAIL: foreign write allowed';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.forge_memberships(workshop_id,user_id,role) select v,auth.uid(),'admin' from public.security_fixture where k='a';
  raise exception 'FAIL: foreign membership inserted';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
insert into public.forge_memberships(workshop_id,user_id,role)
 select v,'cccccccc-0000-0000-0000-000000000003','viewer' from public.security_fixture where k='a';
insert into public.forge_memberships(workshop_id,user_id,role)
 select v,'dddddddd-0000-0000-0000-000000000004','editor' from public.security_fixture where k='a';
set role authenticated;
set request.jwt.claim.sub='cccccccc-0000-0000-0000-000000000003';
do $$ begin
 if (select count(*) from public.forge_documents)<>1 then raise exception 'FAIL: viewer cannot read'; end if;
 begin
  perform public.forge_save_document((select v from public.security_fixture where k='a'),'mp_projects','[]',1);
  raise exception 'FAIL: viewer wrote document';
 exception when insufficient_privilege then null; end;
 begin
  update public.forge_memberships set role='admin' where user_id=auth.uid();
  raise exception 'FAIL: viewer self promotion';
 exception when insufficient_privilege then null; end;
end $$;
set request.jwt.claim.sub='dddddddd-0000-0000-0000-000000000004';
do $$ declare result jsonb; begin
 result=public.forge_save_document((select v from public.security_fixture where k='a'),'mp_projects','[{"synthetic":true}]',1);
 if result->>'revision'<>'2' then raise exception 'FAIL: editor revision update'; end if;
 result=public.forge_save_document((select v from public.security_fixture where k='a'),'mp_projects','[]',1);
 if result->>'status'<>'conflict' then raise exception 'FAIL: stale write accepted'; end if;
 result=public.forge_save_document((select v from public.security_fixture where k='a'),'mp_projects','[]',0);
 if result->>'status'<>'conflict' then raise exception 'FAIL: initial write overwrote existing'; end if;
 if not exists(select 1 from public.forge_documents where revision=2 and payload='[{"synthetic":true}]'::jsonb and updated_by=auth.uid()) then raise exception 'FAIL: contents or editor attribution changed'; end if;
 begin
  perform public.forge_save_document((select v from public.security_fixture where k='a'),'unsupported','[]',0);
  raise exception 'FAIL: unsupported key accepted';
 exception when invalid_parameter_value then null; end;
 begin
  perform public.forge_save_document((select v from public.security_fixture where k='a'),'mp_projects','{}',0);
  raise exception 'FAIL: wrong payload type accepted';
 exception when invalid_parameter_value then null; end;
 begin
  perform public.forge_save_document((select v from public.security_fixture where k='a'),'mp_settings_v1',jsonb_build_object('synthetic',repeat('x',2097153)),0);
  raise exception 'FAIL: oversized payload accepted';
 exception when invalid_parameter_value then null; end;
 begin
  update public.forge_documents set revision=100;
  raise exception 'FAIL: direct write bypassed RPC';
 exception when insufficient_privilege then null; end;
end $$;
set role anon;
reset request.jwt.claim.sub;
do $$ begin
 begin
  perform public.forge_bootstrap('anonymous');
  raise exception 'FAIL: anon RPC allowed';
 exception when insufficient_privilege then null; end;
 begin
  perform count(*) from public.forge_documents;
  raise exception 'FAIL: anon reads documents';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin
 if has_function_privilege('authenticated','public.rls_auto_enable()','execute') then raise exception 'FAIL: privileged helper executable'; end if;
 if has_schema_privilege('authenticated','public','create') then raise exception 'FAIL: public schema writable'; end if;
end $$;
\echo ALL FORGE RLS CHECKS PASSED
