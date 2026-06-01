import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS. SERVER ONLY.
 * Never import this from a Client Component. Used for privileged
 * operations: assigning keys, recomputing stats, reading webhook URL,
 * provisioning customer auth users, etc.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
