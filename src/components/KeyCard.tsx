"use client";

import { useState } from "react";
import type { OrderWithKey } from "@/lib/orders";

export function KeyCard({ order }: { order: OrderWithKey }) {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, which: string) {
    navigator.clipboard?.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="bg-panel-cream border-2 border-line rounded-2xl p-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <div className="font-sub font-bold text-primary">
          {order.model_name ?? "API"} · {order.messages.toLocaleString()} ข้อความ
        </div>
        <span className="text-[0.74rem] text-secondary">{order.api_label ?? ""}</span>
      </div>

      <Field label="API Key" value={order.key_string!} onCopy={() => copy(order.key_string!, "key")} copied={copied === "key"} mono />
      {order.base_url && (
        <Field label="Base URL" value={order.base_url} onCopy={() => copy(order.base_url!, "url")} copied={copied === "url"} mono />
      )}

      {order.provider_quota_url && (
        <a
          href={order.provider_quota_url}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-2 text-accent-d underline text-sm font-sub font-semibold"
        >
          🔗 เช็กข้อความคงเหลือ
        </a>
      )}
      <p className="text-[0.74rem] text-secondary mt-2">โมเดลไม่มีวันหมดอายุน้า เก็บคีย์ไว้ดีๆ 🐹</p>
    </div>
  );
}

function Field({
  label, value, onCopy, copied, mono,
}: { label: string; value: string; onCopy: () => void; copied: boolean; mono?: boolean }) {
  return (
    <div className="mb-2">
      <div className="font-sub font-semibold text-secondary text-[0.78rem] mb-1">{label}</div>
      <div className="flex gap-2 items-center">
        <code className={`flex-1 bg-white border-2 border-line rounded-xl px-3 py-2 text-[0.82rem] text-primary break-all ${mono ? "font-mono" : ""}`}>
          {value}
        </code>
        <button onClick={onCopy} className="btn-sm b-save shrink-0">
          {copied ? "คัดลอกแล้ว" : "คัดลอก"}
        </button>
      </div>
    </div>
  );
}
