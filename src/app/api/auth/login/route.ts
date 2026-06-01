import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { codeToEmail } from "@/lib/auth";

export async function POST(req: Request) {
  const { code, password } = await req.json().catch(() => ({}));
  if (!code || !password) {
    return NextResponse.json({ error: "กรอกรหัสชื่อและรหัสผ่าน" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const email = codeToEmail(String(code));
  const { error } = await supabase.auth.signInWithPassword({ email, password: String(password) });
  if (error) {
    return NextResponse.json({ error: "รหัสชื่อหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("is_admin,is_active")
    .eq("code", String(code))
    .maybeSingle();

  if (customer && customer.is_active === false) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "บัญชีนี้ถูกระงับ" }, { status: 403 });
  }

  return NextResponse.json({ ok: true, is_admin: !!customer?.is_admin });
}
