import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SettingsManager } from "@/components/admin/SettingsManager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("store_settings").select("*").eq("id", 1).maybeSingle();
  return (
    <div>
      <h3 className="font-head font-bold text-primary text-2xl mb-4">ตั้งค่าร้าน</h3>
      <SettingsManager settings={(data as any) ?? {}} />
    </div>
  );
}
