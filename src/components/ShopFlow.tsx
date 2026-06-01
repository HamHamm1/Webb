"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ShopRow, ShopBundle } from "@/lib/shop";

type Stage = "browse" | "pay" | "done";

export function ShopFlow({
  rows,
  paymentQrUrl,
  bankText,
}: {
  rows: ShopRow[];
  paymentQrUrl: string | null;
  bankText: string | null;
}) {
  const router = useRouter();
  const models = useMemo(
    () => [...new Map(rows.map((r) => [r.modelId, r.modelName])).entries()],
    [rows]
  );

  const [modelId, setModelId] = useState(models[0]?.[0] ?? "");
  const providerRows = rows.filter((r) => r.modelId === modelId);
  const [pmId, setPmId] = useState(providerRows[0]?.providerModelId ?? "");
  const activeRow = rows.find((r) => r.providerModelId === pmId) ?? providerRows[0];

  const [stage, setStage] = useState<Stage>("browse");
  const [selected, setSelected] = useState<ShopBundle | null>(null);
  const [apiLabel, setApiLabel] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  function pickModel(id: string) {
    setModelId(id);
    const first = rows.find((r) => r.modelId === id);
    setPmId(first?.providerModelId ?? "");
  }

  async function buy(b: ShopBundle) {
    if (!activeRow) return;
    if (activeRow.status === "unstable") {
      const ok = window.confirm(
        `ขณะนี้โมเดล ${activeRow.modelName} ที่ ${activeRow.providerName} กำลังไม่เสถียร ` +
          `เป็นอาการชั่วคราว อาจกลับมาใช้ได้เร็ว ๆ นี้ และโมเดลไม่มีวันหมดอายุ — ต้องการยืนยันรับสินค้าไหมคะ?`
      );
      if (!ok) return;
    }
    setSelected(b);
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundle_id: b.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "สร้างออเดอร์ไม่สำเร็จ");
      setOrderId(json.order_id);
      setStage("pay");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function uploadSlip(file: File) {
    if (!orderId) return;
    setErr("");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("slip", file);
      fd.append("api_label", apiLabel);
      const res = await fetch(`/api/orders/${orderId}/slip`, { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "อัปสลิปไม่สำเร็จ");
      setStage("done");
      router.refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (stage === "done") {
    return (
      <div className="bg-[#EAF6EC] border-2 border-dashed border-success rounded-2xl p-6 text-center">
        <div className="text-4xl mb-2">🎉</div>
        <div className="font-head font-extrabold text-[#5e8c66] text-xl mb-1">ส่งสลิปเรียบร้อย!</div>
        <p className="muted">แอดมินกำลังตรวจสอบน้า คีย์จะเด้งในหน้าบัญชีเมื่ออนุมัติแล้ว</p>
        <a href="/me/orders" className="btn-big btn-primary mt-4 inline-flex">ดูสถานะออเดอร์</a>
      </div>
    );
  }

  if (stage === "pay" && selected) {
    return (
      <div className="max-w-[480px] mx-auto">
        <div className="bg-panel-cream border-2 border-line rounded-2xl p-4 mb-4">
          <div className="font-head font-bold text-primary mb-2">สรุปคำสั่งซื้อ</div>
          <div className="inforow"><span className="k">สินค้า</span><span className="v">{activeRow?.modelName} @ {activeRow?.providerName}</span></div>
          <div className="inforow"><span className="k">จำนวน</span><span className="v">{selected.messages.toLocaleString()} ข้อความ</span></div>
          <div className="inforow"><span className="k">ยอดที่ต้องโอน</span><span className="v text-accent-d font-extrabold">{selected.price} บาท</span></div>
        </div>

        {paymentQrUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={paymentQrUrl} alt="QR พร้อมเพย์" className="w-full max-w-[280px] mx-auto rounded-2xl border-2 border-line mb-2" />
        )}
        {bankText && <p className="muted text-center mb-4">{bankText}</p>}

        <div className="fld">
          <label>ตั้งชื่อ API (ไว้แสดงในคีย์ของคุณ)</label>
          <input value={apiLabel} onChange={(e) => setApiLabel(e.target.value)} placeholder="เช่น muu-bot" />
        </div>
        <div className="fld">
          <label>อัปโหลดสลิปการโอน</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && uploadSlip(e.target.files[0])}
            disabled={busy}
          />
        </div>
        {err && <p className="text-danger font-sub font-semibold text-sm">{err}</p>}
        {busy && <p className="muted">กำลังส่ง…</p>}
      </div>
    );
  }

  // browse
  return (
    <div>
      {err && <p className="text-danger font-sub font-semibold text-sm mb-3">{err}</p>}

      <Selector label="โมเดล" value={modelId} onChange={pickModel}
        options={models.map(([id, name]) => ({ id, name }))} />

      <Selector label="ต้นทาง" value={pmId} onChange={setPmId}
        options={providerRows.map((r) => ({
          id: r.providerModelId,
          name: `${r.providerName}${r.status === "unstable" ? " (ไม่เสถียร)" : ""}`,
        }))} />

      {activeRow?.status === "unstable" && (
        <div className="bg-[#FBEAEA] border-2 border-dashed border-danger rounded-2xl p-3 mb-4 text-[#a86a6a] text-sm font-sub font-semibold">
          ⚠️ ต้นทางนี้กำลังไม่เสถียร เป็นอาการชั่วคราว — โมเดลไม่มีวันหมดอายุน้า
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {(activeRow?.bundles ?? []).map((b) => {
          const out = b.stock <= 0;
          return (
            <div key={b.id} className={`pcard ${b.featured ? "feat" : ""}`}>
              <div className="font-sub font-bold text-primary text-[0.95rem]">{b.messages.toLocaleString()} ข้อความ</div>
              <div className="pprice">{b.price}<span className="text-[0.85rem] text-secondary"> ฿</span></div>
              {b.bonus_note && <div className="text-[0.72rem] text-success font-bold mb-1">{b.bonus_note}</div>}
              <div className={`text-[0.72rem] mb-2 ${out ? "text-danger" : "text-secondary"}`}>
                {out ? "หมดสต็อก" : `เหลือ ${b.stock} ใบ`}
              </div>
              <button
                disabled={out || busy}
                onClick={() => buy(b)}
                className="w-full btn-sm b-save disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {out ? "หมดสต็อก" : "ซื้อ"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Selector({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; name: string }[];
}) {
  return (
    <div className="mb-3">
      <div className="font-sub font-semibold text-secondary text-[0.88rem] mb-1.5">{label}</div>
      <div className="flex gap-2 flex-wrap">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`font-sub font-semibold border-2 rounded-2xl px-3.5 py-2 text-sm transition ${
              value === o.id ? "bg-accent text-white border-accent" : "bg-white text-secondary border-line"
            }`}
          >
            {o.name}
          </button>
        ))}
      </div>
    </div>
  );
}
