import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { InventoryManager } from "@/components/admin/InventoryManager";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const [{ data: providers }, { data: models }, { data: bundles }, { data: keys }] =
    await Promise.all([
      admin.from("providers").select("id,name,display_name,base_url").order("sort"),
      admin.from("models").select("id,name").order("sort"),
      admin
        .from("bundles")
        .select("messages,provider_models(provider_id,model_id)")
        .eq("is_active", true),
      admin.from("inventory_keys").select("provider_id,model_id,bundle_messages,status"),
    ]);

  // distinct bundle sizes available across catalog
  const sizes = [...new Set((bundles as any[] ?? []).map((b) => b.messages))].sort((a, b) => a - b);

  // stock counts by provider|model|messages|status
  const stock: Record<string, { available: number; sold: number; dead: number }> = {};
  for (const k of (keys as any[]) ?? []) {
    const key = `${k.provider_id}|${k.model_id}|${k.bundle_messages}`;
    stock[key] ??= { available: 0, sold: 0, dead: 0 };
    if (k.status === "available") stock[key].available++;
    else if (k.status === "sold") stock[key].sold++;
    else if (k.status === "dead") stock[key].dead++;
  }

  return (
    <div>
      <h3 className="font-head font-bold text-primary text-2xl mb-4">คลังคีย์</h3>
      <InventoryManager
        providers={(providers as any[]) ?? []}
        models={(models as any[]) ?? []}
        sizes={sizes}
        stock={stock}
      />
    </div>
  );
}
