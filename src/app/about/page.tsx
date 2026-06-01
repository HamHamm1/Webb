import { getStoreSettings } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const s = await getStoreSettings().catch(() => null);
  return (
    <div className="panel">
      <div className="ptitle">🐹 เกี่ยวกับร้าน</div>
      <p className="muted whitespace-pre-line mb-4">{s?.description ?? "ร้านเล็กๆ ขายเอาสังคม ตามประสาคนขี้เหงา"}</p>
      <div className="inforow"><span className="k">ชื่อร้าน</span><span className="v">{s?.name ?? "Hammie World"}</span></div>
      <div className="inforow"><span className="k">Discord</span><span className="v">{s?.discord_user ?? "-"}</span></div>
      {s?.hours_open && (
        <div className="inforow">
          <span className="k">เวลาเปิด</span>
          <span className="v">{s.hours_open} - {s.hours_close}</span>
        </div>
      )}
    </div>
  );
}
