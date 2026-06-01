"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CatalogRow } from "@/lib/catalog";

async function patch(table: string, id: string, p: Record<string, unknown>) {
  await fetch("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ table, id, patch: p }),
  });
}

export function ProductManager({ catalog }: { catalog: CatalogRow[] }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");

  async function save(table: string, id: string, p: Record<string, unknown>) {
    await patch(table, id, p);
    setMsg("บันทึกแล้ว ✓");
    router.refresh();
    setTimeout(() => setMsg(""), 1500);
  }

  // unique providers from catalog
  const providers = catalog
    .map((r) => r.provider)
    .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i);

  return (
    <div className="flex flex-col gap-6">
      {msg && <p className="font-sub font-semibold text-accent-d">{msg}</p>}

      <div className="bg-[#FFF8F4] border-2 border-line rounded-2xl p-4">
        <div className="font-head font-bold text-primary mb-3">ต้นทาง (ป้ายจุดเด่น / ตัวหาร / quota URL)</div>
        {providers.map((p) => (
          <div key={p.id} className="grid md:grid-cols-3 gap-2 mb-3 items-end border-b border-dashed border-dot pb-3">
            <div className="fld mb-0">
              <label>{p.display_name} — ป้ายจุดเด่น</label>
              <input
                defaultValue={p.highlight_tag ?? ""}
                onBlur={(e) => save("providers", p.id, { highlight_tag: e.target.value })}
              />
            </div>
            <div className="fld mb-0">
              <label>ตัวหาร quota</label>
              <input
                type="number" step="0.1"
                defaultValue={p.divisor}
                onBlur={(e) => save("providers", p.id, { divisor: Number(e.target.value) })}
              />
            </div>
            <div className="fld mb-0">
              <label>quota check URL</label>
              <input
                defaultValue={p.quota_check_url ?? ""}
                onBlur={(e) => save("providers", p.id, { quota_check_url: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>

      {catalog.map((row) => (
        <div key={row.providerModel.id} className="bg-[#FFF8F4] border-2 border-line rounded-2xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div className="font-head font-bold text-primary">
              {row.model.name} @ {row.provider.display_name}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-secondary font-sub font-semibold">สถานะ:</label>
              <select
                defaultValue={row.providerModel.status}
                onChange={(e) => save("provider_models", row.providerModel.id, { status: e.target.value })}
                className="border-2 border-line rounded-lg px-2 py-1 text-sm"
              >
                <option value="ok">ลื่น (ok)</option>
                <option value="unstable">ไม่เสถียร</option>
              </select>
              <label className="flex items-center gap-1 text-sm text-secondary">
                <input
                  type="checkbox"
                  defaultChecked={row.providerModel.is_active}
                  onChange={(e) => save("provider_models", row.providerModel.id, { is_active: e.target.checked })}
                />
                เปิดขาย
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {row.bundles.map((b) => (
              <div key={b.id} className="bg-white border-2 border-line rounded-xl p-2 text-center">
                <div className="text-xs text-secondary font-sub font-semibold">{b.messages}</div>
                <input
                  type="number"
                  defaultValue={b.price_default}
                  onBlur={(e) => save("bundles", b.id, { price_default: Number(e.target.value) })}
                  className="w-full text-center border-2 border-line rounded-lg px-1 py-1 text-sm my-1"
                />
                <label className="flex items-center justify-center gap-1 text-[0.7rem] text-secondary">
                  <input
                    type="checkbox"
                    defaultChecked={b.featured}
                    onChange={(e) => save("bundles", b.id, { featured: e.target.checked })}
                  />
                  แนะนำ
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
