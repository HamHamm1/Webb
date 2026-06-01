import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/** Returns a short-lived signed URL for an order's payment slip. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const admin = createSupabaseAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("slip_url")
    .eq("id", params.id)
    .maybeSingle();
  if (!order?.slip_url) return NextResponse.json({ error: "ไม่มีสลิป" }, { status: 404 });

  const bucket = process.env.SLIP_BUCKET || "slips";
  const { data, error } = await admin.storage
    .from(bucket)
    .createSignedUrl(order.slip_url, 60 * 5);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ url: data.signedUrl });
}
