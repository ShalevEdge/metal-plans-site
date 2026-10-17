# SHALVERO FORGE CLOUD — live project setup

## Verified server state (18 Oct 2026)
- Supabase organization: ShalevEdge's Org, Free plan (latest project quote $0/month).
- Dedicated SHALVERO-FORGE project: szlrmlhiqmyxgbitycez, eu-west-1, ACTIVE_HEALTHY.
- Database migrations applied: forge_cloud_initial, forge_restrict_auto_rls_trigger, forge_documents_updated_by_index.
- All three forge tables have RLS enabled. Anonymous table reads and anonymous RPC bootstrap were denied in a live browser test.
- The website contains only the browser-safe project URL and **publishable** key. No database password or service-role key.
- Two Security Advisor warnings for forge_bootstrap and forge_save_document are expected: SECURITY DEFINER RPCs intentionally callable by authenticated users, both enforce auth.uid() and workshop/role access. Review when changing permissions.
- No existing customer data has been uploaded, and no paid subscription was enabled.

## One manual dashboard setting is required
In Supabase dashboard select SHALVERO-FORGE → Authentication → URL Configuration:
1. Set Site URL to `https://shalevedge.github.io/metal-plans-site/`.
2. In Redirect URLs add exactly `https://shalevedge.github.io/metal-plans-site/account.html`.
3. Save. Do not add wildcards or unrelated domains.
4. Check Authentication → Providers → Email is enabled. The site's sign-in uses email magic links.

Then open `https://shalevedge.github.io/metal-plans-site/account.html`, send a login link to an email address under your control, open it in the same browser, and verify sign-in works.

## Explicit sync activation and safety
- First device: export a local JSON backup, then click "העלה את הנתונים המקומיים לענן ריק" **only after reviewing and approving data transfer**.
- Other device: export its local backup, sign in to the *same account*, then choose "הורד נתוני ענן למכשיר זה" after confirmation. Existing local data will be replaced; back up first.
- Automatic sync is **off by default**. It is opt-in only after a first successful sync.
- On concurrent edits, the software pauses and asks whether to prefer the local or cloud version. No silent overwrite.
- For a thorough production authorization test, verify two real accounts cannot access each other's records and test normal sync, conflicts, sign-out, offline, and session expiry.

## Data and limits
Cloud documents: `mp_projects`, `mp_inventory_v1`, `mp_settings_v1`, `mp_purchase_orders_v1`. Local profile, work-in-progress draft and running timer remain device-local.

Sync uses **whole-document revision numbers**, so multiple employees editing different projects may still conflict. The current cloud feature is an initial personal account sync, not multi-worker production collaboration.

JSON documents limited to 2 MiB. Data remains in localStorage on the device even after upload; protect shared devices and backup files. No photos/attachments backend, subscription billing, or digital signatures.

## Free-only cost guard
Do not enable upgrades, paid add-ons, increased compute, overage billing or any paid service without user approval. Free tier may throttle or pause as limits are reached; use local-first features and export backups.

## Automated test commands
- `node tests/cloud-sync.test.cjs`
- `node tests/operations.test.cjs`
- `python tests/site_check.py`
