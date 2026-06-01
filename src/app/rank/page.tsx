import { getRanks } from "@/lib/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ICON: Record<string, string> = { flower: "🌸", heart: "💗", star: "⭐", crown: "👑" };

export default async function RankPage() {
  const ranks = await getRanks();
  const supabase = createSupabaseServerClient();
  const { data: leaders } = await supabase
    .from("customers")
    .select("display_name,points,total_baht,rank_id,is_active")
    .eq("is_active", true)
    .order("total_baht", { ascending: false })
    .order("points", { ascending: false })
    .limit(30);

  const rankName = (id: string | null) => ranks.find((r) => r.id === id)?.name ?? "-";

  return (
    <div className="flex flex-col gap-4.5">
      <section className="panel">
        <div className="ptitle">🏅 เกณฑ์ยศ</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ranks.map((r) => (
            <div key={r.id} className="bg-white border-2 border-line rounded-2xl p-3.5 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-highlight flex items-center justify-center overflow-hidden text-2xl">
                {r.icon_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.icon_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  ICON[r.default_icon ?? "flower"] ?? "🐹"
                )}
              </div>
              <div className="font-sub font-bold text-primary text-[0.88rem]">{r.name}</div>
              {r.description && (
                <div className="text-[0.74rem] text-secondary mt-1 leading-snug">{r.description}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="panel panel-pink">
        <div className="ptitle">👑 อันดับลูกค้า</div>
        <div className="flex flex-col gap-1.5">
          {(leaders ?? []).map((c: any, i: number) => (
            <div key={i} className="flex items-center justify-between bg-white border-2 border-line rounded-2xl px-4 py-2.5">
              <div className="flex items-center gap-3">
                <span className="font-head font-extrabold text-accent-d w-6 text-center">{i + 1}</span>
                <div>
                  <div className="font-sub font-bold text-primary">{c.display_name}</div>
                  <div className="text-[0.74rem] text-secondary">{rankName(c.rank_id)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-sub font-bold text-primary">{c.points} แต้ม</div>
                <div className="text-[0.74rem] text-secondary">{Number(c.total_baht).toLocaleString()} ฿</div>
              </div>
            </div>
          ))}
          {(leaders ?? []).length === 0 && <p className="muted">ยังไม่มีข้อมูลน้า</p>}
        </div>
      </section>
    </div>
  );
}
