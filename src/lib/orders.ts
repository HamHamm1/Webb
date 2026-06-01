import { createSupabaseAdminClient } from "./supabase/admin";

export interface OrderWithKey {
  id: string;
  status: string;
  source: string;
  messages: number;
  amount_baht: number;
  api_label: string | null;
  created_at: string;
  reject_reason: string | null;
  provider_name: string | null;
  provider_quota_url: string | null;
  model_name: string | null;
  key_string: string | null;
  base_url: string | null;
}

/**
 * Orders for ONE customer, with the assigned key joined in. Uses the
 * service-role client (keys bypass RLS) but is strictly scoped to the
 * given customerId — callers must pass the authenticated customer's id.
 */
export async function getCustomerOrders(customerId: string): Promise<OrderWithKey[]> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("orders")
    .select(
      `id,status,source,messages,amount_baht,api_label,created_at,reject_reason,
       providers(name,quota_check_url),
       models(name),
       inventory_keys!orders_assigned_key_fk(key_string,base_url)`
    )
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  return ((data as any[]) ?? []).map((o) => ({
    id: o.id,
    status: o.status,
    source: o.source,
    messages: o.messages,
    amount_baht: o.amount_baht,
    api_label: o.api_label,
    created_at: o.created_at,
    reject_reason: o.reject_reason,
    provider_name: o.providers?.name ?? null,
    provider_quota_url: o.providers?.quota_check_url ?? null,
    model_name: o.models?.name ?? null,
    key_string: o.inventory_keys?.key_string ?? null,
    base_url: o.inventory_keys?.base_url ?? null,
  }));
}
