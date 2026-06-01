import { createSupabaseServerClient } from "./supabase/server";
import type {
  Bundle, Provider, Model, ProviderModel, Rank, StoreSettings,
} from "./types";

/** Public, anon-readable store settings (secrets stripped by RLS/select). */
export async function getStoreSettings(): Promise<StoreSettings | null> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("store_settings")
    .select(
      "id,name,subtitle,description,discord_link,discord_user,footer,payment_qr_url,bank_text,hours_open,hours_close,hours_days,assets,status"
    )
    .eq("id", 1)
    .maybeSingle();
  return (data as StoreSettings) ?? null;
}

export interface CatalogRow {
  provider: Provider;
  model: Model;
  providerModel: ProviderModel;
  bundles: Bundle[];
}

/** Full public catalog: providers × models × bundles, active only. */
export async function getCatalog(): Promise<CatalogRow[]> {
  const supabase = createSupabaseServerClient();
  const [{ data: providers }, { data: models }, { data: pms }, { data: bundles }] =
    await Promise.all([
      supabase.from("providers").select("*").eq("is_active", true).order("sort"),
      supabase.from("models").select("*").order("sort"),
      supabase.from("provider_models").select("*").eq("is_active", true),
      supabase.from("bundles").select("*").eq("is_active", true).order("messages"),
    ]);

  const rows: CatalogRow[] = [];
  for (const pm of (pms as ProviderModel[]) ?? []) {
    const provider = (providers as Provider[])?.find((p) => p.id === pm.provider_id);
    const model = (models as Model[])?.find((m) => m.id === pm.model_id);
    if (!provider || !model) continue;
    rows.push({
      provider,
      model,
      providerModel: pm,
      bundles: ((bundles as Bundle[]) ?? []).filter(
        (b) => b.provider_model_id === pm.id
      ),
    });
  }
  return rows;
}

export async function getRanks(): Promise<Rank[]> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("ranks").select("*").order("sort");
  return (data as Rank[]) ?? [];
}
