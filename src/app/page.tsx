import Link from "next/link";
import { getStoreSettings } from "@/lib/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getStoreSettings().catch(() => null);
  const supabase = createSupabaseServerClient();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("pinned", { ascending: false })
    .order("date", { ascending: false })
    .limit(5);

  const status = settings?.status ?? {};
  const hero = settings?.assets?.hero;

  return (
    <div className="flex flex-col gap-4.5">
      {/* hero */}
      <section className="grid md:grid-cols-[1.25fr_.85fr] gap-6 items-center bg-gradient-to-br from-[#FFF3F7] via-[#FFF9F2] to-[#FDEEF3] border-[2.5px] border-bborder rounded-[32px] p-8 shadow-card overflow-hidden relative">
        <div>
          <h1 className="font-head text-4xl md:text-[2.7rem] font-extrabold leading-tight text-primary">
            {settings?.name ?? "Hammie World"}
          </h1>
          <p className="font-sub font-semibold text-accent-d text-lg my-2">
            {settings?.subtitle ?? "Gemini 3.1 Pro API Store"}
          </p>
          <p className="text-secondary leading-relaxed mb-5 max-w-[480px]">
            {settings?.description ??
              "ร้านขาย API Gemini 3.1 Pro แบบ อัปเดตไว พร้อมดูแลลูกค้าตลอดเลยค่า"}
          </p>
          <div className="flex gap-2.5 flex-wrap">
            <Link href="/shop" className="btn-big btn-primary">
              ซื้อ API เลย 🛒
            </Link>
            <Link href="/prices" className="btn-big btn-ghost">
              ดูราคา
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[200px]">
          {hero ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hero}
              alt="hero"
              className="w-full max-w-[280px] rounded-[26px] object-cover shadow-card border-[3px] border-white"
            />
          ) : (
            <div className="w-[200px] h-[200px] rounded-full bg-highlight border-2 border-dashed border-dot flex items-center justify-center text-6xl">
              🐹
            </div>
          )}
        </div>
      </section>

      {/* status + announcements */}
      <div className="grid md:grid-cols-[280px_1fr] gap-4.5 items-start">
        <section className="panel panel-cream">
          <div className="ptitle">📊 สถานะร้าน</div>
          <div className="grid grid-cols-2 gap-2.5">
            <StatMini label="ประกาศ" value={status.announce ?? "เปิดรับออเดอร์ปกติ"} full />
            <StatMini label="โมเดล" value={status.model ?? "Gemini 3.1 Pro"} />
            <StatMini label="ความเร็ว" value={status.speed ?? "เร็วลื่น"} />
            <StatMini label="คิว" value={status.queue ?? "ไม่มีคิว"} />
            <StatMini label="สต็อก" value={status.stock ?? "พร้อมขาย"} />
          </div>
        </section>

        <section className="panel">
          <div className="ptitle">📣 ประกาศ</div>
          {(announcements ?? []).length === 0 && (
            <p className="muted">ยังไม่มีประกาศตอนนี้น้า</p>
          )}
          {(announcements ?? []).map((a: any) => (
            <div
              key={a.id}
              className={`bg-white border-2 rounded-2xl p-3.5 mb-3 ${
                a.pinned ? "border-accent" : "border-line"
              }`}
            >
              <div className="font-sub font-bold text-primary flex items-center gap-2 flex-wrap">
                {a.pinned && "📌"} {a.title}
                <span className={`badge badge-${a.type ?? "news"}`}>{a.type}</span>
              </div>
              {a.body && (
                <div className="text-[0.84rem] text-secondary leading-relaxed mt-1.5 whitespace-pre-line">
                  {a.body}
                </div>
              )}
              {a.date && <div className="text-[0.72rem] text-secondary mt-1.5 opacity-75">{a.date}</div>}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

function StatMini({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={`bg-white border-2 border-line rounded-[15px] p-2.5 text-center ${full ? "col-span-2" : ""}`}>
      <div className="font-sub font-semibold text-secondary text-[0.74rem] mb-1">{label}</div>
      <div className="font-head font-bold text-primary text-[0.92rem]">{value}</div>
    </div>
  );
}
