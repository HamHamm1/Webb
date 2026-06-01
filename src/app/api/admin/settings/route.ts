import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const ALLOWED = [
  "name", "subtitle", "description", "discord_link", "discord_user", "footer",
  "payment_qr_url", "bank_text", "hours_open", "hours_close", "hours_days",
  "discord_webhook_url", "assets", "status",
];

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = { id: 1 };
  for (const k of ALLOWED) if (k in body) patch[k] = body[k];

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("store_settings").upsert(patch, { onConflict: "id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
