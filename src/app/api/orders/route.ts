import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { priceForBundle } from "@/lib/pricing";

/**
 * Create an order (status=pending_slip). Price, stock and product status
 * are all resolved server-side from the bundle id — the client only sends
 * which bundle it wants (§6, §9).
 */
export async function POST(req: Request) {
  let customer;
  try {
    customer = await requireCustomer();
  } catch {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { bundle_id } = await req.json().catch(() => ({}));
  if (!bundle_id) return NextResponse.json({ error: "ไม่พบแพ็กเกจ" }, { status: 400 });

  const admin = createSupabaseAdminClient();

  // Resolve bundle → provider_model → provider/model
  const { data: bundle } = await admin
    .from("bundles")
    .select(
      `id,messages,price_default,is_active,
       provider_models!inner(id,status,is_active,provider_id,model_id,
         providers!inner(id,has_rank_pricing),
         models!inner(id))`
    )
    .eq("id", bundle_id)
    .maybeSingle();

  if (!bundle || !bundle.is_active) {
    return NextResponse.json({ error: "แพ็กเกจนี้ปิดขายอยู่" }, { status: 400 });
  }
  const pm: any = (bundle as any).provider_models;
  if (!pm.is_active) {
    return NextResponse.json({ error: "สินค้านี้ปิดขายอยู่" }, { status: 400 });
  }

  // rank override price (if any)
  let rankPrice: number | null = null;
  if (pm.providers.has_rank_pricing && customer.rank_id) {
    const { data: rp } = await admin
      .from("bundle_rank_prices")
      .select("price")
      .eq("bundle_id", bundle.id)
      .eq("rank_id", customer.rank_id)
      .maybeSingle();
    rankPrice = rp?.price ?? null;
  }
  const amount = priceForBundle(
    { has_rank_pricing: pm.providers.has_rank_pricing },
    { price_default: bundle.price_default },
    rankPrice
  );

  // stock check (soft — final lock happens at approval)
  const { count } = await admin
    .from("inventory_keys")
    .select("id", { count: "exact", head: true })
    .eq("provider_id", pm.provider_id)
    .eq("model_id", pm.model_id)
    .eq("bundle_messages", bundle.messages)
    .eq("status", "available");
  if (!count || count <= 0) {
    return NextResponse.json({ error: "สินค้าหมดสต็อก" }, { status: 409 });
  }

  const { data: order, error } = await admin
    .from("orders")
    .insert({
      customer_id: customer.id,
      code: customer.code,
      source: "web",
      provider_id: pm.provider_id,
      model_id: pm.model_id,
      messages: bundle.messages,
      amount_baht: amount,
      status: "pending_slip",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ order_id: order.id, amount });
}
