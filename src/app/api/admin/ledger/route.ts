import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { customer_id, messages, amount_baht, note } = await req.json().catch(() => ({}));
  if (!customer_id || !messages) {
    return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: cust } = await admin
    .from("customers")
    .select("code")
    .eq("id", customer_id)
    .maybeSingle();

  const { error } = await admin.from("orders").insert({
    customer_id,
    code: cust?.code ?? null,
    source: "offline",
    messages: Number(messages),
    amount_baht: Number(amount_baht) || 0,
    note: note || null,
    status: "approved",
    approved_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // recompute points/total for this customer (§6)
  await admin.rpc("recompute_customer_stats", { p_customer: customer_id });
  return NextResponse.json({ ok: true });
}
