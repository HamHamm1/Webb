import { getStoreSettings } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const s = await getStoreSettings().catch(() => null);
  return (
    <div className="panel text-center">
      <div className="ptitle justify-center">💌 ติดต่อเรา</div>
      <p className="muted mb-5">ทักมาในดิสได้เลยน้า (⌒‐⌒)</p>
      {s?.discord_link && (
        <a
          href={s.discord_link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-[#5865F2] text-white font-sub font-bold no-underline rounded-[18px] px-6 py-3.5 text-lg"
        >
          เข้าร่วม Discord
        </a>
      )}
      {s?.discord_user && (
        <div className="mt-3 font-sub font-bold text-primary">@{s.discord_user}</div>
      )}
    </div>
  );
}
