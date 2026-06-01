import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CustomerManager } from "@/components/admin/CustomerManager";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const [{ data: customers }, { data: ranks }] = await Promise.all([
    admin.from("customers").select("*").order("total_baht", { ascending: false }),
    admin.from("ranks").select("id,name").order("sort"),
  ]);

  return (
    <div>
      <h3 className="font-head font-bold text-primary text-2xl mb-4">ลูกค้า</h3>
      <CustomerManager
        customers={(customers as any[]) ?? []}
        ranks={(ranks as any[]) ?? []}
      />
    </div>
  );
}
