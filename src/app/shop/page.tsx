import { requireCustomer } from "@/lib/auth";
import { getShopData } from "@/lib/shop";
import { getStoreSettings } from "@/lib/catalog";
import { ShopFlow } from "@/components/ShopFlow";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const customer = await requireCustomer();
  const [rows, settings] = await Promise.all([
    getShopData(customer),
    getStoreSettings().catch(() => null),
  ]);

  return (
    <div className="panel">
      <div className="ptitle">🛒 ซื้อ API</div>
      <p className="muted mb-4">
        เลือกโมเดล → ต้นทาง → แพ็กเกจ แล้วโอนตาม QR และอัปสลิป รออนุมัติแล้วคีย์จะเด้งในหน้าบัญชีน้า
      </p>
      <ShopFlow
        rows={rows}
        paymentQrUrl={settings?.payment_qr_url ?? null}
        bankText={settings?.bank_text ?? null}
      />
    </div>
  );
}
