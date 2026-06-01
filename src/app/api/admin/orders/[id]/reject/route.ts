import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const { reason } = await req.json().catch(() => ({}));
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("orders")
    .update({ status: "rejected", reject_reason: reason || "ไม่ระบุเหตุผล" })
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
