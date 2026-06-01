import { getCatalog } from "@/lib/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { QuotaHelper } from "@/components/QuotaHelper";

export const dynamic = "force-dynamic";

export default async function PricesPage() {
  const catalog = await getCatalog();
  const supabase = createSupabaseServerClient();
  const { data: rankPrices } = await supabase
    .from("bundle_rank_prices")
    .select("bundle_id,rank_id,price,ranks(name)");

  return (
    <div className="flex flex-col gap-4.5">
      <section className="panel">
        <div className="ptitle">💰 ราคา</div>
        <p className="muted mb-4">
          ราคาด้านล่างเป็น <b>ราคาปกติ</b> — ลูกค้าที่มียศจะเห็นราคาพิเศษของตัวเองตอนกดซื้อใน
          หน้า <code className="code-tag">ซื้อ API</code> (เฉพาะ cc/Gemini)
        </p>

        {catalog.map((row) => {
          const tag = row.provider.highlight_tag;
          const unstable = row.providerModel.status === "unstable";
          const ranks = (rankPrices ?? []).filter((rp: any) =>
            row.bundles.some((b) => b.id === rp.bundle_id)
          );
          return (
            <div key={row.providerModel.id} className="mb-7">
              <div className="flex items-center gap-2.5 flex-wrap mb-3">
                <span className="font-head font-bold text-primary text-lg">
                  {row.model.name}
                </span>
                <span className="font-sub text-secondary text-sm">
                  @ {row.provider.display_name}
                </span>
                {tag && (
                  <span className="badge badge-promo">{tag}</span>
                )}
                {unstable ? (
                  <span className="status-pill st-close"><span className="dot" />ไม่เสถียร</span>
                ) : (
                  <span className="status-pill st-open"><span className="dot" />ลื่นปกติ</span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {row.bundles.map((b) => (
                  <div key={b.id} className={`pcard ${b.featured ? "feat" : ""}`}>
                    {b.featured && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-white font-sub font-bold text-[0.7rem] px-3.5 py-0.5 rounded-xl whitespace-nowrap">
                        แนะนำ
                      </div>
                    )}
                    <div className="font-sub font-bold text-primary text-[0.95rem]">
                      {b.messages.toLocaleString()} ข้อความ
                    </div>
                    <div className="pprice">
                      {b.price_default}
                      <span className="text-[0.85rem] text-secondary"> ฿</span>
                    </div>
                    {b.bonus_note && (
                      <div className="text-[0.74rem] text-success font-bold min-h-[1em] mb-2">
                        {b.bonus_note}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {row.provider.has_rank_pricing && ranks.length > 0 && (
                <p className="muted mt-3">
                  🎀 มีราคาพิเศษตามยศ (เช่น แฮมเต๋อตัวเบิ้ม / คนเก่งของแฮม) — ระบบจะคิดให้อัตโนมัติตอนกดซื้อ
                </p>
              )}
            </div>
          );
        })}

        {catalog.length === 0 && (
          <p className="muted">ยังไม่มีสินค้าในระบบ — แอดมินเพิ่มสินค้าก่อนน้า</p>
        )}
      </section>

      <section className="panel panel-pink">
        <div className="ptitle">🧮 เช็กข้อความคงเหลือ</div>
        <QuotaHelper providers={catalog.map((r) => r.provider).filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i)} />
      </section>
    </div>
  );
}
