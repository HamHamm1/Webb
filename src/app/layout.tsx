import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/SiteShell";
import { getCurrentCustomer } from "@/lib/auth";
import { getStoreSettings } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Hammie World — Gemini 3.1 Pro API Store",
  description: "ร้านขาย API แบบน่ารัก ฟรีล้วน อัปเดตไว ดูแลตลอด",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [customer, settings] = await Promise.all([
    getCurrentCustomer().catch(() => null),
    getStoreSettings().catch(() => null),
  ]);

  return (
    <html lang="th">
      <body>
        <div className="max-w-[1180px] mx-auto px-3 py-5 md:py-6">
          <SiteShell customer={customer} settings={settings}>
            {children}
          </SiteShell>
        </div>
      </body>
    </html>
  );
}
