"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "เข้าสู่ระบบไม่สำเร็จ");
      router.push(json.is_admin ? "/admin" : "/me");
      router.refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="fld">
        <label>รหัสชื่อ API</label>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="เช่น มูมู" required />
      </div>
      <div className="fld">
        <label>รหัสผ่าน</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {err && <p className="text-danger font-sub font-semibold text-sm mb-3">{err}</p>}
      <button className="btn-big btn-primary w-full justify-center" disabled={loading}>
        {loading ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
