import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SECRET_KEY } from "./env";

/**
 * Service-role client — bypasses RLS. SERVER ONLY.
 * Uses the Supabase secret key (`sb_secret_…`) or legacy service_role key.
 * Never import this from a Client Component. Used for privileged
 * operations: assigning keys, recomputing stats, reading webhook URL,
 * provisioning customer auth users, etc.
 */
export function createSupabaseAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error(
      "Missing SUPABASE secret key / URL (set SUPABASE_SECRET_KEY + NEXT_PUBLIC_SUPABASE_URL)"
    );
  }
  return createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
