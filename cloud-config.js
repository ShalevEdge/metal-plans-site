// Public browser config only. A Supabase publishable key is not a secret; never place service_role/secret keys here.
// Activation requires deploying supabase/migrations/20261018_forge_cloud.sql with verified RLS.
window.FORGE_CLOUD_CONFIG = Object.freeze({
  url: '',
  publishableKey: ''
});
