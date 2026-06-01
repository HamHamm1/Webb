"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Provider { id: string; name: string; display_name: string; base_url: string | null; }
interface Model { id: string; name: string; }

export function InventoryManager({
  providers, models, sizes, stock,
}: {
  providers: Provider[];
  models: Model[];
  sizes: number[];
  stock: Record<string, { available: number; sold: number; dead: number }>;
}) {
  const router = useRouter();
  const [providerId, setProviderId] = useState(providers[0]?.id ?? "");
  const [modelId, setModelId] = useState(models[0]?.id ?? "");
  const [messages, setMessages] = useState(sizes[0] ?? 100);
  const [baseUrl, setBaseUrl] = useState("");
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    const keys = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (keys.length === 0) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_id: providerId,
          model_id: modelId,
          bundle_messages: Number(messages),
          base_url: baseUrl || null,
          keys,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "เพิ่มคีย์ไม่สำเร็จ");
      setMsg(`เพิ่มแล้ว ${json.added} คีย์ ✓`);
      setText("");
      router.refresh();
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-5">
      <form onSubmit={upload} className="bg-[#FFF8F4] border-2 border-line rounded-2xl p-4">
        <div className="font-head font-bold text-primary mb-3">เพิ่มคีย์เป็นล็อต</div>
        <div className="fld">
          <label>ต้นทาง</label>
          <select value={providerId} onChange={(e) => setProviderId(e.target.value)}>
            {providers.map((p) => <option key={p.id} value={p.id}>{p.display_name}</option>)}
          </select>
        </div>
        <div className="fld">
          <label>โมเดล</label>
          <select value={modelId} onChange={(e) => setModelId(e.target.value)}>
            {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="fld">
          <label>แพ็กเกจ (ข้อความ)</label>
          <select value={messages} onChange={(e) => setMessages(Number(e.target.value))}>
            {sizes.map((s) => <option key={s} value={s}>{s.toLocaleString()}</option>)}
          </select>
        </div>
        <div className="fld">
          <label>Base URL (ว่างได้ = ใช้ค่า default ของต้นทาง)</label>
          <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder={providers.find((p) => p.id === providerId)?.base_url ?? ""} />
        </div>
        <div className="fld">
          <label>คีย์ (บรรทัดละ 1 คีย์)</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder={"sk-xxxx\nsk-yyyy"} />
        </div>
        {msg && <p className="font-sub font-semibold text-accent-d mb-2">{msg}</p>}
        <button className="btn-sm b-add" disabled={busy}>{busy ? "กำลังเพิ่ม…" : "เพิ่มเข้าคลัง"}</button>
      </form>

      <div className="bg-[#FFF8F4] border-2 border-line rounded-2xl p-4">
        <div className="font-head font-bold text-primary mb-3">สต็อกคงเหลือ</div>
        <div className="flex flex-col gap-1.5">
          {providers.flatMap((p) =>
            models.flatMap((m) =>
              sizes.map((s) => {
                const st = stock[`${p.id}|${m.id}|${s}`];
                if (!st || (st.available + st.sold + st.dead) === 0) return null;
                return (
                  <div key={`${p.id}-${m.id}-${s}`} className="flex justify-between text-sm border-b border-dashed border-dot py-1">
                    <span className="text-secondary">{m.name} @ {p.display_name} · {s}</span>
                    <span className="font-sub font-bold">
                      <span className="text-success">{st.available} พร้อม</span>
                      {st.sold > 0 && <span className="text-secondary"> · {st.sold} ขายแล้ว</span>}
                      {st.dead > 0 && <span className="text-danger"> · {st.dead} เสีย</span>}
                    </span>
                  </div>
                );
              })
            )
          )}
        </div>
      </div>
    </div>
  );
}
