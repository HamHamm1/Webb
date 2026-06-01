import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { LedgerManager } from "@/components/admin/LedgerManager";

export const dynamic = "force-dynamic";

export default async function LedgerPage() {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const [{ data: customers }, { data: orders }] = await Promise.all([
    admin.from("customers").select("id,code,display_name").order("display_name"),
    admin
      .from("orders")
      .select("id,code,messages,amount_baht,source,status,created_at,customers(display_name)")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <div>
      <h3 className="font-head font-bold text-primary text-2xl mb-4">Ledger — ออเดอร์นอกเว็บ</h3>
      <p className="muted mb-4">เพิ่มออเดอร์ที่ซื้อในดิส เพื่อให้ลูกค้าได้สะสมแต้ม/ยอด (สถานะ approved ทันที)</p>
      <LedgerManager
        customers={(customers as any[]) ?? []}
        recent={(orders as any[]) ?? []}
      />
    </div>
  );
}
