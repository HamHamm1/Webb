"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SettingsManager({ settings }: { settings: any }) {
  const router = useRouter();
  const [s, setS] = useState<any>({ ...settings, status: settings.status ?? {} });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  function set(k: string, v: unknown) {
    setS((prev: any) => ({ ...prev, [k]: v }));
  }
  function setStatus(k: string, v: string) {
    setS((prev: any) => ({ ...prev, status: { ...prev.status, [k]: v } }));
  }

  async function save() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: s.name, subtitle: s.subtitle, description: s.description,
        discord_link: s.discord_link, discord_user: s.discord_user, footer: s.footer,
        payment_qr_url: s.payment_qr_url, bank_text: s.bank_text,
        hours_open: s.hours_open, hours_close: s.hours_close,
        discord_webhook_url: s.discord_webhook_url, status: s.status,
      }),
    });
    setMsg(res.ok ? "บันทึกแล้ว ✓" : "บันทึกไม่สำเร็จ");
    setBusy(false);
    router.refresh();
  }

  const F = ({ label, k, area }: { label: string; k: string; area?: boolean }) => (
    <div className="fld">
      <label>{label}</label>
      {area ? (
        <textarea value={s[k] ?? ""} onChange={(e) => set(k, e.target.value)} rows={3} />
      ) : (
        <input value={s[k] ?? ""} onChange={(e) => set(k, e.target.value)} />
      )}
    </div>
  );

  return (
    <div className="bg-[#FFF8F4] border-2 border-line rounded-2xl p-4 max-w-[640px]">
      <div className="grid md:grid-cols-2 gap-3">
        <F label="ชื่อร้าน" k="name" />
        <F label="หัวข้อย่อย" k="subtitle" />
      </div>
      <F label="คำอธิบายร้าน" k="description" area />
      <div className="grid md:grid-cols-2 gap-3">
        <F label="ลิงก์ Discord" k="discord_link" />
        <F label="Discord user" k="discord_user" />
      </div>
      <F label="URL รูป QR พร้อมเพย์" k="payment_qr_url" />
      <F label="ข้อความบัญชี/พร้อมเพย์" k="bank_text" area />
      <div className="grid md:grid-cols-2 gap-3">
        <F label="เวลาเปิด" k="hours_open" />
        <F label="เวลาปิด" k="hours_close" />
      </div>
      <F label="Footer" k="footer" area />

      <div className="fld">
        <label>Discord Webhook URL (สำหรับแจ้งเตือนออเดอร์ — ความลับ)</label>
        <input
          value={s.discord_webhook_url ?? ""}
          onChange={(e) => set("discord_webhook_url", e.target.value)}
          placeholder="https://discord.com/api/webhooks/…"
        />
      </div>

      <div className="font-head font-bold text-primary mt-4 mb-2">สถานะร้าน (โชว์หน้าแรก)</div>
      <div className="grid md:grid-cols-2 gap-3">
        {["announce", "model", "speed", "queue", "stock"].map((k) => (
          <div className="fld mb-0" key={k}>
            <label>{k}</label>
            <input value={s.status?.[k] ?? ""} onChange={(e) => setStatus(k, e.target.value)} />
          </div>
        ))}
      </div>

      <button onClick={save} disabled={busy} className="btn-sm b-save mt-4">
        {busy ? "กำลังบันทึก…" : "บันทึกทั้งหมด"}
      </button>
      {msg && <p className="font-sub font-semibold text-accent-d mt-2">{msg}</p>}
    </div>
  );
}
