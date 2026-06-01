import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { provider_id, model_id, bundle_messages, base_url, keys } =
    await req.json().catch(() => ({}));
  if (!provider_id || !model_id || !bundle_messages || !Array.isArray(keys) || keys.length === 0) {
    return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  // resolve default base_url from provider when not given
  let effectiveBase = base_url;
  if (!effectiveBase) {
    const { data: p } = await admin
      .from("providers")
      .select("base_url")
      .eq("id", provider_id)
      .maybeSingle();
    effectiveBase = p?.base_url ?? null;
  }

  const rows = (keys as string[]).map((k) => ({
    provider_id,
    model_id,
    bundle_messages: Number(bundle_messages),
    key_string: k,
    base_url: effectiveBase,
    status: "available",
  }));

  const { error, count } = await admin
    .from("inventory_keys")
    .insert(rows, { count: "exact" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, added: count ?? rows.length });
}
