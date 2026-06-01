import { requireAdmin } from "@/lib/auth";
import { getCatalog } from "@/lib/catalog";
import { ProductManager } from "@/components/admin/ProductManager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();
  const catalog = await getCatalog();
  return (
    <div>
      <h3 className="font-head font-bold text-primary text-2xl mb-4">สินค้า</h3>
      <ProductManager catalog={catalog} />
    </div>
  );
}
