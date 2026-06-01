import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}));
  if (!password || String(password).length < 6) {
    return NextResponse.json({ error: "รหัสผ่านสั้นเกินไป" }, { status: 400 });
  }
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { error } = await supabase.auth.updateUser({ password: String(password) });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
