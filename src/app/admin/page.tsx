import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AdminOrders } from "@/components/admin/AdminOrders";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("orders")
    .select(
      `id,messages,amount_baht,api_label,status,slip_url,created_at,code,
       customers(display_name),providers(display_name),models(name)`
    )
    .eq("status", "awaiting_review")
    .order("created_at", { ascending: true });

  const orders = ((data as any[]) ?? []).map((o) => ({
    id: o.id,
    code: o.code,
    display_name: o.customers?.display_name ?? o.code ?? "-",
    provider: o.providers?.display_name ?? "-",
    model: o.models?.name ?? "-",
    messages: o.messages,
    amount_baht: o.amount_baht,
    api_label: o.api_label,
    slip_url: o.slip_url,
    created_at: o.created_at,
  }));

  return (
    <div>
      <h3 className="font-head font-bold text-primary text-2xl mb-4">
        ออเดอร์รอตรวจ ({orders.length})
      </h3>
      <AdminOrders orders={orders} />
    </div>
  );
}
