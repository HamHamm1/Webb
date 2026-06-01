import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PromotionPage() {
  const supabase = createSupabaseServerClient();
  const { data: promos } = await supabase
    .from("announcements")
    .select("*")
    .eq("type", "promo")
    .order("date", { ascending: false });

  return (
    <div className="panel">
      <div className="ptitle">🎁 โปรโมชั่น</div>
      {(promos ?? []).length === 0 && (
        <p className="muted">
          ขณะนี้ทางร้านไม่มีโปรโมชั่นส่วนลดเพิ่มเติมแล้วนะคั้บผมมม ต้องขออภัยในความไม่สะดวกด้วยน้าาา
        </p>
      )}
      {(promos ?? []).map((a: any) => (
        <div key={a.id} className="bg-white border-2 border-accent rounded-2xl p-3.5 mb-3">
          <div className="font-sub font-bold text-primary">{a.title}</div>
          {a.body && <div className="text-[0.84rem] text-secondary mt-1.5 whitespace-pre-line">{a.body}</div>}
        </div>
      ))}
    </div>
  );
}
