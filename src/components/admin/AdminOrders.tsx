"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Row {
  id: string;
  code: string | null;
  display_name: string;
  provider: string;
  model: string;
  messages: number;
  amount_baht: number;
  api_label: string | null;
  slip_url: string | null;
  created_at: string;
}

export function AdminOrders({ orders }: { orders: Row[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [slip, setSlip] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function viewSlip(id: string) {
    const res = await fetch(`/api/admin/orders/${id}/slip`);
    const json = await res.json();
    if (res.ok) setSlip(json.url);
    else setMsg(json.error ?? "เปิดสลิปไม่ได้");
  }

  async function act(id: string, action: "approve" | "reject") {
    let reason = "";
    if (action === "reject") {
      reason = window.prompt("เหตุผลที่ปฏิเสธ?") ?? "";
      if (!reason) return;
    }
    setBusy(id);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/orders/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "ทำรายการไม่สำเร็จ");
      setMsg(action === "approve" ? "อนุมัติแล้ว ✓ จ่ายคีย์เรียบร้อย" : "ปฏิเสธแล้ว");
      router.refresh();
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setBusy(null);
    }
  }

  if (orders.length === 0) return <p className="muted">ไม่มีออเดอร์รอตรวจตอนนี้น้า 🎉</p>;

  return (
    <div>
      {msg && <p className="font-sub font-semibold text-accent-d mb-3">{msg}</p>}
      <div className="flex flex-col gap-3">
        {orders.map((o) => (
          <div key={o.id} className="bg-[#FFF8F4] border-2 border-line rounded-2xl p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="font-sub font-bold text-primary">
                  {o.display_name} <span className="code-tag ml-1">{o.code}</span>
                </div>
                <div className="text-sm text-secondary">
                  {o.model} @ {o.provider} · {o.messages.toLocaleString()} ข้อความ ·{" "}
                  <b className="text-accent-d">{o.amount_baht} ฿</b>
                </div>
                {o.api_label && <div className="text-[0.78rem] text-secondary">ชื่อ API: {o.api_label}</div>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {o.slip_url && (
                  <button onClick={() => viewSlip(o.id)} className="btn-sm b-neutral">ดูสลิป</button>
                )}
                <button onClick={() => act(o.id, "approve")} disabled={busy === o.id} className="btn-sm b-add">
                  {busy === o.id ? "…" : "อนุมัติ"}
                </button>
                <button onClick={() => act(o.id, "reject")} disabled={busy === o.id} className="btn-sm b-del">
                  ปฏิเสธ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {slip && (
        <div
          className="fixed inset-0 bg-black/40 z-[3000] flex items-center justify-center p-4"
          onClick={() => setSlip(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slip} alt="slip" className="max-h-[90vh] max-w-full rounded-2xl border-4 border-white" />
        </div>
      )}
    </div>
  );
}
