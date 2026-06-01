"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Customer { id: string; code: string; display_name: string; }
interface OrderRow {
  id: string; code: string | null; messages: number; amount_baht: number;
  source: string; status: string; created_at: string; customers?: { display_name: string };
}

export function LedgerManager({ customers, recent }: { customers: Customer[]; recent: OrderRow[] }) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [messages, setMessages] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/admin/ledger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: customerId,
        messages: Number(messages),
        amount_baht: Number(amount),
        note,
      }),
    });
    const json = await res.json();
    if (!res.ok) return setMsg(json.error ?? "เพิ่มไม่สำเร็จ");
    setMsg("เพิ่มแล้ว ✓ คำนวณแต้มใหม่เรียบร้อย");
    setMessages(""); setAmount(""); setNote("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={add} className="bg-[#FFF8F4] border-2 border-line rounded-2xl p-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="fld mb-0">
            <label>ลูกค้า</label>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.display_name} ({c.code})</option>)}
            </select>
          </div>
          <div className="fld mb-0">
            <label>จำนวนข้อความ</label>
            <input value={messages} onChange={(e) => setMessages(e.target.value)} inputMode="numeric" required />
          </div>
          <div className="fld mb-0">
            <label>ยอด (บาท)</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" required />
          </div>
          <div className="fld mb-0">
            <label>โน้ต</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
        <button className="btn-sm b-add mt-3">เพิ่มออเดอร์นอกเว็บ</button>
        {msg && <p className="font-sub font-semibold text-accent-d mt-2">{msg}</p>}
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-secondary font-sub">
              <th className="p-2">ลูกค้า</th><th className="p-2">ข้อความ</th><th className="p-2">ยอด</th>
              <th className="p-2">ที่มา</th><th className="p-2">สถานะ</th><th className="p-2">วันที่</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((o) => (
              <tr key={o.id} className="border-t border-dashed border-dot">
                <td className="p-2 font-sub font-bold text-primary">{o.customers?.display_name ?? o.code ?? "-"}</td>
                <td className="p-2 tabular-nums">{o.messages.toLocaleString()}</td>
                <td className="p-2 tabular-nums">{o.amount_baht}</td>
                <td className="p-2">{o.source}</td>
                <td className="p-2">{o.status}</td>
                <td className="p-2 text-secondary">{new Date(o.created_at).toLocaleDateString("th-TH")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
