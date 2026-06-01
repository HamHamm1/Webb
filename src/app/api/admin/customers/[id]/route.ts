import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const ALLOWED = ["display_name", "rank_id", "points", "notes", "special", "is_active"];

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  for (const k of ALLOWED) if (k in body) patch[k] = body[k];
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "ไม่มีข้อมูลให้แก้" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("customers").update(patch).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
