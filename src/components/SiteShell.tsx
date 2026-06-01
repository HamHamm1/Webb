"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Customer, StoreSettings } from "@/lib/types";

const NAV = [
  { href: "/", label: "หน้าแรก" },
  { href: "/prices", label: "ราคา" },
  { href: "/promotion", label: "โปรโมชั่น" },
  { href: "/rank", label: "อันดับ" },
  { href: "/about", label: "เกี่ยวกับ" },
  { href: "/contact", label: "ติดต่อ" },
];

export function SiteShell({
  customer,
  settings,
  children,
}: {
  customer: Customer | null;
  settings: StoreSettings | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Admin uses a dedicated full-screen chrome.
  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  const logo = settings?.assets?.logo;
  const name = settings?.name ?? "Hammie World";

  return (
    <div className="shell">
      <div className="ear ear-l" />
      <div className="ear ear-r" />
      <div className="relative z-[2]">
        <header className="flex items-center gap-3.5 flex-wrap justify-between bg-white/95 border-2 border-line rounded-[26px] px-4.5 py-3 shadow-card mb-4 sticky top-3 z-50 backdrop-blur">
          <Link href="/" className="flex items-center gap-2.5 font-head font-extrabold text-[1.4rem] text-primary">
            <span className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-highlight">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="" className="w-full h-full object-cover" />
              ) : (
                "🐹"
              )}
            </span>
            <span>{name}</span>
          </Link>

          <button
            className="md:hidden w-10 h-10 border-2 border-line bg-white rounded-xl text-secondary"
            onClick={() => setOpen((v) => !v)}
            aria-label="menu"
          >
            ☰
          </button>

          <nav
            className={`${
              open ? "flex" : "hidden"
            } md:flex gap-1 flex-wrap flex-1 justify-center w-full md:w-auto flex-col md:flex-row mt-2 md:mt-0`}
          >
            {NAV.map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={`font-sub font-semibold px-3.5 py-2 rounded-2xl text-[0.92rem] transition border-2 border-transparent ${
                    active
                      ? "bg-highlight text-primary"
                      : "text-secondary hover:bg-highlight hover:text-primary"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex gap-2 items-center flex-wrap">
            {customer ? (
              <>
                <Link href="/shop" className="pill pill-accent">
                  ซื้อ API
                </Link>
                <Link href="/me" className="pill pill-soft">
                  {customer.display_name}
                </Link>
                {customer.is_admin && (
                  <Link href="/admin" className="pill pill-warn">
                    แอดมิน
                  </Link>
                )}
              </>
            ) : (
              <Link href="/login" className="pill pill-accent">
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </header>

        {children}

        <footer className="text-center font-deco text-secondary text-[0.84rem] leading-relaxed bg-panel-pink rounded-b-[38px] -mx-[30px] mt-7 px-3 py-5">
          {settings?.footer ??
            "Hammie World — ขายเอาสังคม ตามประสาคนขี้เหงา ขอบคุณที่มาอุดหนุนน้า"}
        </footer>
      </div>
    </div>
  );
}
