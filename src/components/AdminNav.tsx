"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "📋 ออเดอร์รอตรวจ" },
  { href: "/admin/inventory", label: "🔑 คลังคีย์" },
  { href: "/admin/customers", label: "👥 ลูกค้า" },
  { href: "/admin/ledger", label: "📒 Ledger" },
  { href: "/admin/products", label: "🛍️ สินค้า" },
  { href: "/admin/settings", label: "⚙️ ตั้งค่าร้าน" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="bg-[#FFF6F0] md:border-r-2 md:border-dashed md:border-dot p-3.5 flex md:flex-col gap-1.5 overflow-x-auto">
      {ITEMS.map((it) => {
        const active = pathname === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`font-sub font-semibold rounded-xl px-3.5 py-2.5 text-[0.92rem] whitespace-nowrap transition ${
              active ? "bg-accent text-white" : "text-secondary hover:bg-white"
            }`}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
