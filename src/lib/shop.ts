import { createSupabaseAdminClient } from "./supabase/admin";
import { getCatalog } from "./catalog";
import { priceForBundle } from "./pricing";
import type { Customer, ModelStatus } from "./types";

export interface ShopBundle {
  id: string;
  messages: number;
  price: number;
  price_default: number;
  bonus_note: string | null;
  featured: boolean;
  stock: number;
}

export interface ShopRow {
  providerModelId: string;
  providerId: string;
  modelId: string;
  providerName: string;
  modelName: string;
  status: ModelStatus;
  noExpiryNote: string | null;
  bundles: ShopBundle[];
}

/** Build the shop catalog priced for `customer`, with live stock counts. */
export async function getShopData(customer: Customer | null): Promise<ShopRow[]> {
  const catalog = await getCatalog();
  const admin = createSupabaseAdminClient();

  // rank prices for this customer's rank (cc/Gemini only have rows)
  let rankPriceByBundle: Record<string, number> = {};
  if (customer?.rank_id) {
    const { data } = await admin
      .from("bundle_rank_prices")
      .select("bundle_id,price")
      .eq("rank_id", customer.rank_id);
    for (const r of (data as any[]) ?? []) rankPriceByBundle[r.bundle_id] = r.price;
  }

  // live stock: count available keys per (provider, model, messages)
  const { data: keys } = await admin
    .from("inventory_keys")
    .select("provider_id,model_id,bundle_messages")
    .eq("status", "available");
  const stockMap = new Map<string, number>();
  for (const k of (keys as any[]) ?? []) {
    const key = `${k.provider_id}|${k.model_id}|${k.bundle_messages}`;
    stockMap.set(key, (stockMap.get(key) ?? 0) + 1);
  }

  return catalog.map((row) => ({
    providerModelId: row.providerModel.id,
    providerId: row.provider.id,
    modelId: row.model.id,
    providerName: row.provider.display_name,
    modelName: row.model.name,
    status: row.providerModel.status,
    noExpiryNote: row.model.no_expiry_note,
    bundles: row.bundles.map((b) => ({
      id: b.id,
      messages: b.messages,
      price_default: b.price_default,
      price: priceForBundle(row.provider, b, rankPriceByBundle[b.id]),
      bonus_note: b.bonus_note,
      featured: b.featured,
      stock: stockMap.get(`${row.provider.id}|${row.model.id}|${b.messages}`) ?? 0,
    })),
  }));
}
