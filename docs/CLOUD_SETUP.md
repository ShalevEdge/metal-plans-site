# SHALVERO FORGE CLOUD V8

## Status
Site runs local-first. `cloud-config.js` is deliberately empty until a dedicated Supabase project and RLS migration are verified. Cloud is unavailable but local backups and other features still work.

## Activation checklist
1. User chooses the Supabase organization and confirms any nonzero quoted project cost before creation.
2. Create a dedicated FORGE project, not a Crypto or Stocks project.
3. Apply `supabase/migrations/20261018_forge_cloud.sql` through migration tool.
4. Verify RLS: `anon` cannot access the tables; authenticated users cannot read/write other workshops. Writes must occur through authenticated RPC `forge_save_document` with revision check.
5. Run the security advisor and address any RLS/security warnings.
6. Enable email magic links. Allow `https://shalevedge.github.io/metal-plans-site/account.html` in Auth redirect URLs.
7. Set only public URL and publishable key in `cloud-config.js`. NEVER commit secret keys, service_role credentials, passwords or user tokens.
8. Test independent accounts and two browsers: initial upload/download, conflict, sign-out, offline, restore and expired session.
9. Only then activate cloud and opt in on each device.

## Document coverage
- `mp_projects`, `mp_inventory_v1`, `mp_settings_v1`, `mp_purchase_orders_v1` are synchronized as per-workshop revisioned JSON documents.
- Local profile, temporary draft, active timer and backup controls are not synced.
- Locally editable 'plan' is NOT a paid subscription entitlement.

## Limitations
- Document-level optimistic concurrency, not record-level merge. Two editors can trigger conflicts, resolved manually.
- No team invitation UI, payment processor, signed quotes or server audit log yet.
- Local storage is not encrypted. Shared devices need separate browser profiles.
- JSON backups contain customer data; keep them private.
- Documents are capped at 2 MiB each; photos require separate secure object storage.
- Online network status is not proof of cloud synchronization.
- No cloud service is active until account project creation/migration and validation.

## QA
Run `node tests/cloud-sync.test.cjs`, `node tests/operations.test.cjs` and `python tests/site_check.py`.
