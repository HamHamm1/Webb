import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const ERR_TH: Record<string, string> = {
  OUT_OF_STOCK: "คลังหมด เพิ่มคีย์ก่อนน้า (ออเดอร์ยังค้างรอตรวจ)",
  ALREADY_APPROVED: "ออเดอร์นี้อนุมัติไปแล้ว",
  ORDER_NOT_FOUND: "ไม่พบออเดอร์",
  ORDER_MISSING_PRODUCT: "ออเดอร์นี้ไม่มีข้อมูลสินค้า ใช้ Ledger จัดการแทน",
};

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  let adminCustomer;
  try {
    adminCustomer = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("approve_order", {
    p_order: params.id,
    p_admin: adminCustomer.id,
  });

  if (error) {
    const code = (error.message || "").replace(/.*?([A-Z_]+).*/s, "$1");
    return NextResponse.json(
      { error: ERR_TH[code] ?? error.message },
      { status: code === "OUT_OF_STOCK" ? 409 : 400 }
    );
  }
  const key = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({ ok: true, key_id: key?.key_id });
}
