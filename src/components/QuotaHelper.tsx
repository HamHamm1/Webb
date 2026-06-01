"use client";

import { useState } from "react";
import { remainingMessages } from "@/lib/pricing";
import type { Provider } from "@/lib/types";

/** Manual quota helper (§6): balance ÷ provider divisor = remaining msgs. */
export function QuotaHelper({ providers }: { providers: Provider[] }) {
  const [providerId, setProviderId] = useState(providers[0]?.id ?? "");
  const [balance, setBalance] = useState("");

  const provider = providers.find((p) => p.id === providerId);
  const bal = parseFloat(balance);
  const result =
    provider && Number.isFinite(bal)
      ? remainingMessages(bal, Number(provider.divisor))
      : null;

  return (
    <div>
      <p className="muted mb-3">
        เปิดหน้าเช็กของต้นทางเอา <b>ยอดคงเหลือ ($)</b> มากรอก ระบบจะหารด้วยตัวหารของต้นทางให้
        {provider?.quota_check_url && (
          <>
            {" "}
            (
            <a className="text-accent-d underline" href={provider.quota_check_url} target="_blank" rel="noreferrer">
              เปิดหน้าเช็ก {provider.display_name}
            </a>
            )
          </>
        )}
      </p>
      <div className="flex gap-2 flex-wrap items-center">
        <select
          className="border-2 border-line rounded-2xl px-3 py-2.5 text-primary"
          value={providerId}
          onChange={(e) => setProviderId(e.target.value)}
        >
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.display_name} (÷{p.divisor})
            </option>
          ))}
        </select>
        <input
          className="flex-1 min-w-[130px] border-2 border-line rounded-2xl px-3.5 py-2.5 text-primary"
          placeholder="ยอดคงเหลือ $"
          inputMode="decimal"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
        />
      </div>
      {result !== null && (
        <div className="mt-3 bg-[#EAF6EC] border-2 border-dashed border-success rounded-2xl p-3.5 text-center font-head font-bold text-[#5e8c66] text-lg animate-pop">
          เหลือประมาณ {result.toLocaleString()} ข้อความ
        </div>
      )}
    </div>
  );
}
