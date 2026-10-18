# FORGE — Google sign-in setup (Free only)

Google OAuth for SHALVERO FORGE is supported by Supabase Free's Social OAuth capability. This setup does not require paid Google Identity Platform, additional APIs, or custom email SMTP. Do not enable billing, start trials requiring billing, or purchase paid services without the owner's explicit approval.

Current live provider status at implementation time: **disabled** (`/auth/v1/settings`: `external.google=false`). The website detects provider status automatically and disables Google sign-in until it is configured.

## Google Auth Platform (must be configured by the Google account owner)
1. Open https://console.cloud.google.com/auth/overview and create/select a Google Cloud project dedicated to SHALVERO FORGE. Avoid creating any billable resources or enabling extra APIs.
2. In Google Auth Platform, configure **Branding**, **Audience** (External; Testing with the intended Google test account initially) and Data Access with only `openid`, `userinfo.email`, `userinfo.profile`. Never request Gmail, Drive or additional scopes.
3. Under https://console.cloud.google.com/auth/clients create **OAuth client ID** → **Web application**.
4. In **Authorized JavaScript origins**, add exactly `https://shalevedge.github.io` (no trailing path).
5. In **Authorized redirect URIs**, add exactly `https://szlrmlhiqmyxgbitycez.supabase.co/auth/v1/callback` (the Supabase provider callback, NOT the website account page).
6. Copy the OAuth **Client ID** and **Client Secret** directly into your Supabase project at https://supabase.com/dashboard/project/szlrmlhiqmyxgbitycez/auth/providers?provider=Google, then enable Google and Save.
7. In https://supabase.com/dashboard/project/szlrmlhiqmyxgbitycez/auth/url-configuration ensure the **Site URL** is `https://shalevedge.github.io/metal-plans-site/` and **Redirect URLs** include `https://shalevedge.github.io/metal-plans-site/account.html`.
8. **Do not paste the Client Secret into chat, code, GitHub, browser console or public files.** Keep it only in the Google/Supabase secure dashboards.
9. Visit the site's `account.html` page in regular Safari or desktop browser. Refresh once. The Google button should enable automatically when `/auth/v1/settings` confirms Google is enabled. Sign in with a **test account** and confirm return to the account page.

## Security / data safeguards
- The Google redirect from browser is fixed to the official `account.html`; it does **not** send customers' project data automatically.
- RLS and workshop identity checks remain the same as other login methods.
- A Google login may create a new Supabase account or link an existing verified email identity according to Supabase Auth linking rules. Check the account identity/workshop before uploading local data, especially when switching accounts on one device.
- Do not merge cloud account records on the basis of matching display email alone.
- Keep local backups; never enable auto sync until after verifying identity and completing an explicit first transfer.
- The Supabase default email rate limit is separate. Google OAuth does not send a Supabase magic-link email per login.
- If Google's OAuth application remains in Testing, only listed test users can sign in; use production publishing only after review of branding/privacy requirements. Do not grant Gmail or Drive permissions.

## Verification
Run `node tests/cloud-sync.test.cjs` and `python tests/site_check.py`. End-to-end Google consent requires the owner to configure their Google Cloud OAuth client and enable the Supabase provider; local tests cannot stand in for a real Google login.
