import { requireCustomer } from "@/lib/auth";
import { getCustomerOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  pending_slip: { text: "รอแนบสลิป", cls: "st-soon" },
  awaiting_review: { text: "รอตรวจสอบ", cls: "st-soon" },
  approved: { text: "อนุมัติแล้ว", cls: "st-open" },
  rejected: { text: "ถูกปฏิเสธ", cls: "st-close" },
  cancelled: { text: "ยกเลิก", cls: "st-close" },
};

export default async function MyOrdersPage() {
  const customer = await requireCustomer();
  const orders = await getCustomerOrders(customer.id);

  return (
    <div className="panel">
      <div className="ptitle">🧾 ออเดอร์ของฉัน</div>
      {orders.length === 0 && <p className="muted">ยังไม่มีออเดอร์น้า</p>}
      <div className="flex flex-col gap-2.5">
        {orders.map((o) => {
          const s = STATUS_LABEL[o.status] ?? { text: o.status, cls: "st-soon" };
          return (
            <div key={o.id} className="bg-white border-2 border-line rounded-2xl p-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="font-sub font-bold text-primary">
                  {o.model_name ?? "API"} · {o.messages.toLocaleString()} ข้อความ · {o.amount_baht} ฿
                </div>
                <span className={`status-pill ${s.cls}`} style={{ background: "#FCF3E0" }}>
                  <span className="dot" style={{ background: "#F3C98B" }} />
                  {s.text}
                </span>
              </div>
              <div className="text-[0.74rem] text-secondary mt-1">
                {new Date(o.created_at).toLocaleString("th-TH")}
                {o.source === "offline" && " · นอกเว็บ"}
              </div>
              {o.status === "rejected" && o.reject_reason && (
                <div className="text-[0.8rem] text-danger mt-1">เหตุผล: {o.reject_reason}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
