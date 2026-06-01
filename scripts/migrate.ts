/**
 * One-time data migration: Firebase backup JSON → Supabase (brief §5).
 *
 *   npm run migrate
 *
 * Idempotent where it can be (upserts on natural keys). Generates a random
 * password for each customer + the admin, creates Supabase Auth users, and
 * writes credentials to scripts/output/credentials.csv (gitignored) so you
 * can hand them out. Re-running reuses existing auth users by email.
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

config({ path: ".env.local" });
config({ path: ".env" });

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DOMAIN = process.env.AUTH_EMAIL_DOMAIN || "hammie.local";
if (!URL || !KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const db: SupabaseClient = createClient(URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── helpers ───────────────────────────────────────────────────────
function codeToEmail(code: string): string {
  const slug = code.trim().toLowerCase().normalize("NFKC")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (Math.imul(31, h) + code.charCodeAt(i)) | 0;
  return `${slug || "user"}-${(h >>> 0).toString(36)}@${DOMAIN}`;
}
function genPassword(): string {
  return randomBytes(6).toString("base64url"); // ~8 chars
}
function toInt(v: unknown): number {
  const n = parseInt(String(v ?? "").replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}
const creds: string[] = ["role,code,display_name,email,password"];

async function ensureAuthUser(email: string, password: string): Promise<string> {
  // try create; if exists, find by listing
  const { data, error } = await db.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (!error && data.user) return data.user.id;
  // already exists → look it up
  const { data: list } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const found = list.users.find((u) => u.email === email);
  if (found) {
    await db.auth.admin.updateUserById(found.id, { password });
    return found.id;
  }
  throw new Error(`Cannot ensure auth user for ${email}: ${error?.message}`);
}

async function main() {
  const raw = JSON.parse(
    readFileSync(resolve("scripts/data/hammie-backup.json"), "utf8")
  );

  // ── store_settings (singleton) ──────────────────────────────────
  console.log("→ store_settings");
  await db.from("store_settings").upsert({
    id: 1,
    name: raw.store?.name ?? raw.about?.name ?? "Hammie World",
    subtitle: raw.store?.subtitle ?? null,
    description: raw.store?.description ?? raw.about?.bio ?? null,
    discord_link: raw.store?.discordLink ?? raw.about?.socials?.[0]?.url ?? null,
    discord_user: raw.store?.discordUser ?? raw.about?.discord ?? null,
    footer: raw.store?.footer ?? null,
    bank_text: "SCB 427-202933-9 / น.ส.ชลณิชา เข็มทอง (พร้อมเพย์)",
    hours_open: raw.hours?.open ?? null,
    hours_close: raw.hours?.close ?? null,
    hours_days: raw.hours?.days ?? [0, 1, 2, 3, 4, 5, 6],
    assets: raw.assets ?? {},
    status: raw.status ?? {},
  });

  // ── ranks ───────────────────────────────────────────────────────
  console.log("→ ranks");
  const rankByName: Record<string, string> = {};
  let rsort = 0;
  for (const r of raw.ranks ?? []) {
    const { data } = await db.from("ranks").upsert(
      {
        name: r.name,
        description: r.desc ?? null,
        icon_url: r.iconUrl ?? null,
        default_icon: r.defIcon ?? null,
        sort: rsort++,
      },
      { onConflict: "name" }
    ).select("id,name").single();
    if (data) rankByName[data.name] = data.id;
  }

  // ── providers ───────────────────────────────────────────────────
  console.log("→ providers");
  const providers = [
    {
      name: "cc", display_name: "CC (gemai)", divisor: 5,
      quota_check_url: raw.store?.quotaCheckUrl ?? "https://key.gemai.cc/",
      base_url: "https://api.gemai.cc/v1",
      highlight_tag: "มีโปรลดตามยศ • เสถียร", has_rank_pricing: true, sort: 0,
    },
    {
      name: "xfxai", display_name: "xfxai", divisor: 2.5,
      quota_check_url: "https://iqr.xfxai.top/",
      base_url: "https://new.xfxai.top/v1",
      highlight_tag: "มี GPT 5.5 • ทางเลือกสำรอง", has_rank_pricing: false, sort: 1,
    },
  ];
  const provByName: Record<string, string> = {};
  for (const p of providers) {
    const { data } = await db.from("providers").upsert(p, { onConflict: "name" })
      .select("id,name").single();
    if (data) provByName[data.name] = data.id;
  }

  // ── models ──────────────────────────────────────────────────────
  console.log("→ models");
  const models = [
    { name: "Gemini 3.1 Pro", description: "โมเดลหลัก", sort: 0 },
    { name: "GPT 5.5", description: "ทางเลือกบน xfxai", sort: 1 },
  ];
  const modelByName: Record<string, string> = {};
  for (const m of models) {
    const { data } = await db.from("models").upsert(m, { onConflict: "name" })
      .select("id,name").single();
    if (data) modelByName[data.name] = data.id;
  }

  // ── provider_models ─────────────────────────────────────────────
  console.log("→ provider_models");
  const pmDefs = [
    { p: "cc", m: "Gemini 3.1 Pro", status: "ok" },
    { p: "xfxai", m: "Gemini 3.1 Pro", status: "ok" },
    { p: "xfxai", m: "GPT 5.5", status: "ok" },
  ];
  const pmId: Record<string, string> = {};
  for (const d of pmDefs) {
    const { data } = await db.from("provider_models").upsert(
      { provider_id: provByName[d.p], model_id: modelByName[d.m], status: d.status },
      { onConflict: "provider_id,model_id" }
    ).select("id").single();
    if (data) pmId[`${d.p}|${d.m}`] = data.id;
  }

  // ── bundles + rank prices (from pricing.tabs) ───────────────────
  console.log("→ bundles + rank prices");
  const tabs: any[] = raw.pricing?.tabs ?? [];
  const stdTab = tabs.find((t) => t.id === "std");
  const ccGemPm = pmId["cc|Gemini 3.1 Pro"];
  const bundleByMsgsCC: Record<number, string> = {};

  for (const item of stdTab?.items ?? []) {
    const messages = toInt(item.label);
    const { data } = await db.from("bundles").upsert(
      {
        provider_model_id: ccGemPm,
        messages,
        price_default: toInt(item.price),
        bonus_note: item.note || null,
        featured: !!item.featured,
      },
      { onConflict: "provider_model_id,messages" }
    ).select("id").single();
    if (data) bundleByMsgsCC[messages] = data.id;
  }

  // rank tabs → bundle_rank_prices (cc/Gemini only)
  const rankTabMap: Record<string, string> = {
    r2: "แฮมเต๋อตัวเบิ้ม",
    t1780077089760: "คนเก่งของแฮม",
  };
  for (const tab of tabs) {
    const rankName = rankTabMap[tab.id];
    if (!rankName || !rankByName[rankName]) continue;
    for (const item of tab.items ?? []) {
      const messages = toInt(item.label);
      const bundleId = bundleByMsgsCC[messages];
      if (!bundleId) continue;
      await db.from("bundle_rank_prices").upsert(
        { bundle_id: bundleId, rank_id: rankByName[rankName], price: toInt(item.price) },
        { onConflict: "bundle_id,rank_id" }
      );
    }
  }

  // ── xfxai bundles: Gemini = copy cc default; GPT5.5 = ×49 ────────
  console.log("→ xfxai bundles");
  const xfxaiGemPm = pmId["xfxai|Gemini 3.1 Pro"];
  for (const [m, id] of Object.entries(bundleByMsgsCC)) {
    void id;
    const messages = Number(m);
    const ccDefault = (stdTab?.items ?? []).find((i: any) => toInt(i.label) === messages);
    await db.from("bundles").upsert(
      {
        provider_model_id: xfxaiGemPm,
        messages,
        price_default: toInt(ccDefault?.price),
        featured: !!ccDefault?.featured,
      },
      { onConflict: "provider_model_id,messages" }
    );
  }
  const xfxaiGptPm = pmId["xfxai|GPT 5.5"];
  for (let n = 100; n <= 1000; n += 100) {
    await db.from("bundles").upsert(
      {
        provider_model_id: xfxaiGptPm,
        messages: n,
        price_default: (n / 100) * 49,
        featured: n === 1000,
      },
      { onConflict: "provider_model_id,messages" }
    );
  }

  // ── customers (+ auth users) ────────────────────────────────────
  console.log("→ customers");
  const custByCode: Record<string, string> = {};
  for (const c of raw.customers ?? []) {
    if (!c.code) continue;
    const email = codeToEmail(c.code);
    const password = genPassword();
    const authId = await ensureAuthUser(email, password);
    const { data } = await db.from("customers").upsert(
      {
        auth_user_id: authId,
        code: c.code,
        display_name: c.name || c.code,
        rank_id: rankByName[c.rank] ?? null,
        notes: c.notes || null,
        special: c.special || null,
      },
      { onConflict: "code" }
    ).select("id,code").single();
    if (data) {
      custByCode[data.code] = data.id;
      creds.push(`customer,${c.code},${c.name || c.code},${email},${password}`);
    }
  }

  // ── admin account ───────────────────────────────────────────────
  console.log("→ admin");
  const adminCode = process.env.ADMIN_CODE || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || genPassword();
  const adminEmail = codeToEmail(adminCode);
  const adminAuthId = await ensureAuthUser(adminEmail, adminPass);
  await db.from("customers").upsert(
    {
      auth_user_id: adminAuthId,
      code: adminCode,
      display_name: "แอดมินแฮม",
      is_admin: true,
    },
    { onConflict: "code" }
  );
  creds.push(`admin,${adminCode},แอดมินแฮม,${adminEmail},${adminPass}`);

  // ── orders (offline, approved) ──────────────────────────────────
  console.log("→ orders");
  const touched = new Set<string>();
  for (const o of raw.orders ?? []) {
    const customerId = custByCode[o.code] ?? null;
    await db.from("orders").upsert(
      {
        id: undefined,
        customer_id: customerId,
        code: o.code ?? null,
        source: "offline",
        messages: toInt(o.messages),
        amount_baht: toInt(o.amount),
        note: o.note || null,
        status: "approved",
        approved_at: o.date ? new Date(o.date).toISOString() : new Date().toISOString(),
      } as any
    );
    if (customerId) touched.add(customerId);
  }

  // recompute points/total for everyone who got an order
  console.log("→ recompute stats");
  for (const id of touched) {
    await db.rpc("recompute_customer_stats", { p_customer: id });
  }

  // ── announcements ───────────────────────────────────────────────
  console.log("→ announcements");
  for (const a of raw.announcements ?? []) {
    await db.from("announcements").insert({
      title: a.title,
      body: a.body || null,
      type: a.type || "news",
      pinned: !!a.pinned,
      date: a.date || null,
    });
  }

  // ── write credentials file ──────────────────────────────────────
  mkdirSync(resolve("scripts/output"), { recursive: true });
  writeFileSync(resolve("scripts/output/credentials.csv"), creds.join("\n"), "utf8");
  console.log(`\n✅ Done. Credentials → scripts/output/credentials.csv (${creds.length - 1} accounts)`);
  console.log("   Hand these to customers; they can change their password in /me.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
