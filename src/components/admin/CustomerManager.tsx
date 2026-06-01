"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Rank { id: string; name: string; }
interface Customer {
  id: string; code: string; display_name: string; rank_id: string | null;
  points: number; total_baht: number; is_active: boolean; notes: string | null; is_admin: boolean;
}

export function CustomerManager({ customers, ranks }: { customers: Customer[]; ranks: Rank[] }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [created, setCreated] = useState<{ code: string; password: string } | null>(null);
  const [msg, setMsg] = useState("");

  async function register(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setCreated(null);
    const res = await fetch("/api/admin/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, display_name: name || code }),
    });
    const json = await res.json();
    if (!res.ok) return setMsg(json.error ?? "สร้างไม่สำเร็จ");
    setCreated({ code, password: json.password });
    setCode("");
    setName("");
    router.refresh();
  }

  async function update(id: string, patch: Record<string, unknown>) {
    await fetch(`/api/admin/customers/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={register} className="bg-[#FFF8F4] border-2 border-line rounded-2xl p-4">
        <div className="font-head font-bold text-primary mb-3">ลงทะเบียนลูกค้าใหม่</div>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="fld mb-0">
            <label>รหัสชื่อ API (ใช้ login)</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
          <div className="fld mb-0">
            <label>ชื่อที่แสดง</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="(เว้นว่าง = ใช้รหัสชื่อ)" />
          </div>
        </div>
        <button className="btn-sm b-add mt-3">สร้างบัญชี + สุ่มรหัสผ่าน</button>
        {msg && <p className="text-danger font-sub font-semibold mt-2">{msg}</p>}
        {created && (
          <div className="mt-3 bg-[#EAF6EC] border-2 border-dashed border-success rounded-xl p-3">
            <div className="font-sub font-bold text-[#5e8c66]">สร้างแล้ว! ส่งให้ลูกค้าน้า (โชว์ครั้งเดียว)</div>
            <div className="font-mono text-sm mt-1">รหัสชื่อ: <b>{created.code}</b></div>
            <div className="font-mono text-sm">รหัสผ่าน: <b>{created.password}</b></div>
          </div>
        )}
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-secondary font-sub">
              <th className="p-2">ชื่อ</th><th className="p-2">รหัส</th><th className="p-2">ยศ</th>
              <th className="p-2">แต้ม</th><th className="p-2">ยอด</th><th className="p-2">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-dashed border-dot">
                <td className="p-2 font-sub font-bold text-primary">
                  {c.display_name}{c.is_admin && " 👑"}
                </td>
                <td className="p-2"><span className="code-tag">{c.code}</span></td>
                <td className="p-2">
                  <select
                    defaultValue={c.rank_id ?? ""}
                    onChange={(e) => update(c.id, { rank_id: e.target.value || null })}
                    className="border-2 border-line rounded-lg px-2 py-1 text-xs"
                  >
                    <option value="">— ไม่มี —</option>
                    {ranks.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </td>
                <td className="p-2 tabular-nums">{c.points}</td>
                <td className="p-2 tabular-nums">{Number(c.total_baht).toLocaleString()}</td>
                <td className="p-2">
                  <button
                    onClick={() => update(c.id, { is_active: !c.is_active })}
                    className={`btn-sm ${c.is_active ? "b-neutral" : "b-del"} !px-2 !py-1 !text-xs`}
                  >
                    {c.is_active ? "ปกติ" : "ระงับ"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
