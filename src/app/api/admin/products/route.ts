import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Allowlist of editable tables → columns. Anything else is rejected.
const EDITABLE: Record<string, string[]> = {
  providers: ["highlight_tag", "divisor", "quota_check_url", "base_url", "is_active", "display_name"],
  provider_models: ["status", "is_active"],
  bundles: ["price_default", "featured", "is_active", "bonus_note"],
  bundle_rank_prices: ["price"],
};

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { table, id, patch } = await req.json().catch(() => ({}));
  const cols = EDITABLE[table];
  if (!cols || !id || !patch) {
    return NextResponse.json({ error: "คำขอไม่ถูกต้อง" }, { status: 400 });
  }

  const safe: Record<string, unknown> = {};
  for (const k of cols) if (k in patch) safe[k] = patch[k];
  if (Object.keys(safe).length === 0) {
    return NextResponse.json({ error: "ไม่มีคอลัมน์ให้แก้" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from(table).update(safe).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
