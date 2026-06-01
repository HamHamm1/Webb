import { createSupabaseAdminClient } from "./supabase/admin";

/**
 * Fire a Discord webhook notification. The URL comes from env first, then
 * store_settings (admin-editable). Never throws to the caller — a failed
 * notification must not break an order.
 */
export async function notifyDiscord(content: string, embeds?: unknown[]) {
  try {
    let url = process.env.DISCORD_WEBHOOK_URL || "";
    if (!url) {
      const admin = createSupabaseAdminClient();
      const { data } = await admin
        .from("store_settings")
        .select("discord_webhook_url")
        .eq("id", 1)
        .maybeSingle();
      url = data?.discord_webhook_url || "";
    }
    if (!url) return;

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, embeds }),
    });
  } catch (e) {
    console.error("[discord] notify failed", e);
  }
}

export function orderEmbed(o: {
  code?: string | null;
  display_name?: string | null;
  messages: number;
  amount_baht: number;
  api_label?: string | null;
}) {
  return [
    {
      title: "🐹 ออเดอร์ใหม่ / อัปสลิปแล้ว",
      color: 0xe7a8bc,
      fields: [
        { name: "ลูกค้า", value: `${o.display_name ?? "-"} (${o.code ?? "-"})`, inline: true },
        { name: "จำนวน", value: `${o.messages} ข้อความ`, inline: true },
        { name: "ยอด", value: `${o.amount_baht} บาท`, inline: true },
        { name: "ชื่อ API", value: o.api_label || "-", inline: false },
      ],
      timestamp: new Date().toISOString(),
    },
  ];
}
