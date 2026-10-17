-- Applied to dedicated SHALVERO-FORGE Supabase project as two migrations.
-- These permissions are separate from the intended authenticated FORGE RPC functions.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
create index if not exists forge_documents_updated_by_idx on public.forge_documents(updated_by);
