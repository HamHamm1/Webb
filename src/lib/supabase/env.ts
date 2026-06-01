/**
 * Central place to read Supabase connection env vars. Supports both the
 * new Supabase API key names (publishable / secret) and the legacy ones
 * (anon / service_role) as a fallback, so either works.
 *
 * NOTE: the literal `process.env.NEXT_PUBLIC_*` references must stay inline
 * here so Next can statically inline them into the client bundle.
 */

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

// Browser-safe key (respects RLS): new `sb_publishable_…` or legacy anon.
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

// Server-only key (bypasses RLS): new `sb_secret_…` or legacy service_role.
// Never reference this from a client component.
export const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "";
