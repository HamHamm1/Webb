import { requireCustomer } from "@/lib/auth";
import { getRanks } from "@/lib/catalog";
import { getCustomerOrders } from "@/lib/orders";
import { KeyCard } from "@/components/KeyCard";
import { AccountActions } from "@/components/AccountActions";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const customer = await requireCustomer();
  const [orders, ranks] = await Promise.all([
    getCustomerOrders(customer.id),
    getRanks(),
  ]);
  const rank = ranks.find((r) => r.id === customer.rank_id);
  const approved = orders.filter((o) => o.status === "approved" && o.key_string);

  return (
    <div className="flex flex-col gap-4.5">
      <section className="panel text-center">
        <div className="font-head font-extrabold text-primary text-2xl">{customer.display_name}</div>
        <div className="inline-block mt-1 bg-highlight text-primary font-sub font-bold px-3.5 py-1 rounded-2xl text-[0.83rem]">
          {rank?.name ?? "ยังไม่มียศ"}
        </div>
        <div className="grid grid-cols-3 gap-2.5 mt-4">
          <Stat label="แต้มสะสม" value={`${customer.points}`} />
          <Stat label="ยอดสะสม" value={`${Number(customer.total_baht).toLocaleString()} ฿`} />
          <Stat label="รหัสชื่อ" value={customer.code} />
        </div>
      </section>

      <section className="panel">
        <div className="ptitle">🔑 คีย์ที่ได้รับ</div>
        {approved.length === 0 && <p className="muted">ยังไม่มีคีย์น้า — สั่งซื้อแล้วรออนุมัติได้เลย</p>}
        <div className="flex flex-col gap-3">
          {approved.map((o) => (
            <KeyCard key={o.id} order={o} />
          ))}
        </div>
      </section>

      <AccountActions />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border-2 border-line rounded-[15px] p-2.5 text-center">
      <div className="font-sub font-semibold text-secondary text-[0.74rem] mb-1">{label}</div>
      <div className="font-head font-bold text-primary text-[0.95rem] break-words">{value}</div>
    </div>
  );
}
