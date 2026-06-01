import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/auth";
import { AdminNav } from "@/components/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const customer = await getCurrentCustomer().catch(() => null);
  if (!customer) redirect("/login");
  if (!customer.is_admin) redirect("/me");

  return (
    <div className="fixed inset-0 bg-[#FFFDFB] overflow-auto z-[2000]">
      <div className="flex items-center justify-between gap-2.5 bg-gradient-to-r from-[#FFF1F5] to-[#FFF8F0] border-b-[2.5px] border-bborder px-5 py-3.5 sticky top-0 z-10 flex-wrap">
        <h2 className="font-head font-extrabold text-primary text-xl">🐹 แอดมิน — Hammie World</h2>
        <a href="/" className="btn-sm b-neutral">กลับหน้าร้าน</a>
      </div>
      <div className="grid md:grid-cols-[210px_1fr] min-h-[calc(100vh-64px)]">
        <AdminNav />
        <main className="p-6 max-w-[960px]">{children}</main>
      </div>
    </div>
  );
}
