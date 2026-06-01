import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { requireAdmin, codeToEmail } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { code, display_name } = await req.json().catch(() => ({}));
  if (!code) return NextResponse.json({ error: "ต้องมีรหัสชื่อ" }, { status: 400 });

  const admin = createSupabaseAdminClient();

  // unique code check
  const { data: exists } = await admin
    .from("customers")
    .select("id")
    .eq("code", code)
    .maybeSingle();
  if (exists) return NextResponse.json({ error: "รหัสชื่อนี้มีแล้ว" }, { status: 409 });

  const email = codeToEmail(String(code));
  const password = randomBytes(6).toString("base64url");

  const { data: authUser, error: authErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authErr || !authUser.user) {
    return NextResponse.json({ error: authErr?.message ?? "สร้าง auth ไม่สำเร็จ" }, { status: 500 });
  }

  const { error } = await admin.from("customers").insert({
    auth_user_id: authUser.user.id,
    code,
    display_name: display_name || code,
  });
  if (error) {
    await admin.auth.admin.deleteUser(authUser.user.id);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, password });
}
