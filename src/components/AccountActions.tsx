"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AccountActions() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/me/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    setMsg(res.ok ? "เปลี่ยนรหัสผ่านแล้ว ✓" : "เปลี่ยนไม่สำเร็จ");
    if (res.ok) setPw("");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <section className="panel panel-pink">
      <div className="ptitle">⚙️ บัญชี</div>
      <form onSubmit={changePassword} className="flex gap-2 flex-wrap items-end">
        <div className="fld flex-1 min-w-[200px] mb-0">
          <label>เปลี่ยนรหัสผ่าน</label>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)"
            minLength={6}
            required
          />
        </div>
        <button className="btn-sm b-save">บันทึก</button>
      </form>
      {msg && <p className="muted mt-2">{msg}</p>}
      <button onClick={logout} className="btn-sm b-neutral mt-4">
        ออกจากระบบ
      </button>
    </section>
  );
}
