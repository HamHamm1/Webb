import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { notifyDiscord, orderEmbed } from "@/lib/discord";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/heic"];

export async function POST(req: Request, { params }: { params: { id: string } }) {
  let customer;
  try {
    customer = await requireCustomer();
  } catch {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("slip") as File | null;
  const apiLabel = (form.get("api_label") as string | null) ?? null;
  if (!file) return NextResponse.json({ error: "ไม่พบไฟล์สลิป" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "ไฟล์ใหญ่เกิน 5MB" }, { status: 400 });
  if (file.type && !ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "รองรับเฉพาะรูปภาพ" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  // verify ownership + state
  const { data: order } = await admin
    .from("orders")
    .select("id,customer_id,status,messages,amount_baht,code")
    .eq("id", params.id)
    .maybeSingle();
  if (!order || order.customer_id !== customer.id) {
    return NextResponse.json({ error: "ไม่พบออเดอร์" }, { status: 404 });
  }
  if (!["pending_slip", "awaiting_review"].includes(order.status)) {
    return NextResponse.json({ error: "ออเดอร์นี้ปิดแล้ว" }, { status: 400 });
  }

  const bucket = process.env.SLIP_BUCKET || "slips";
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `${customer.id}/${params.id}-${Date.now()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: upErr } = await admin.storage
    .from(bucket)
    .upload(path, bytes, { contentType: file.type || "image/png", upsert: true });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { error } = await admin
    .from("orders")
    .update({ slip_url: path, api_label: apiLabel, status: "awaiting_review" })
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await notifyDiscord(
    "🔔 มีออเดอร์อัปสลิปใหม่รอตรวจ!",
    orderEmbed({
      code: order.code,
      display_name: customer.display_name,
      messages: order.messages,
      amount_baht: order.amount_baht,
      api_label: apiLabel,
    })
  );

  return NextResponse.json({ ok: true });
}
