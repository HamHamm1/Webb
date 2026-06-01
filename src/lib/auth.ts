import { createSupabaseServerClient } from "./supabase/server";
import type { Customer } from "./types";

/**
 * Customers log in with an API *code* (not an email). Supabase Auth needs
 * an email, so we deterministically map code → email. The code is stored
 * verbatim on the customers row; this only builds the auth identity.
 */
export function codeToEmail(code: string): string {
  const domain = process.env.AUTH_EMAIL_DOMAIN || "hammie.local";
  const slug = code
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  // Keep codes unique even when they normalize to the same slug by
  // appending a short hash of the original code.
  const hash = simpleHash(code);
  return `${slug || "user"}-${hash}@${domain}`;
}

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

/** Resolve the logged-in customer row (or null). For Server Components. */
export async function getCurrentCustomer(): Promise<Customer | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("customers")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  return (data as Customer) ?? null;
}

export async function requireCustomer(): Promise<Customer> {
  const c = await getCurrentCustomer();
  if (!c) throw new Error("UNAUTHENTICATED");
  return c;
}

export async function requireAdmin(): Promise<Customer> {
  const c = await getCurrentCustomer();
  if (!c || !c.is_admin) throw new Error("FORBIDDEN");
  return c;
}
