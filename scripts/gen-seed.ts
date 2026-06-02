/**
 * Offline seed generator (no network needed).
 *
 *   npx tsx scripts/gen-seed.ts
 *
 * Reads scripts/data/hammie-backup.json and writes:
 *   scripts/output/seed.sql        ← paste into Supabase SQL Editor
 *   scripts/output/credentials.csv ← code + raw password to hand out
 *
 * Passwords are bcrypt-hashed (compatible with Supabase Auth / GoTrue) so
 * the SQL file contains NO plaintext. Customers are inserted straight into
 * auth.users + auth.identities so the existing code+password login works.
 *
 * Idempotent: every row uses a fixed UUID + ON CONFLICT DO NOTHING, so the
 * whole file can be re-run safely.
 *
 * NOTE: AUTH_EMAIL_DOMAIN here MUST match the app's env (default hammie.local),
 * because login derives the auth email from the code with the same algorithm.
 */
import bcrypt from "bcryptjs";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const DOMAIN = process.env.AUTH_EMAIL_DOMAIN || "hammie.local";
const BCRYPT_COST = 10;

// ── helpers ───────────────────────────────────────────────────────
function codeToEmail(code: string): string {
  const slug = code.trim().toLowerCase().normalize("NFKC")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (Math.imul(31, h) + code.charCodeAt(i)) | 0;
  return `${slug || "user"}-${(h >>> 0).toString(36)}@${DOMAIN}`;
}
function genPassword(): string {
  return randomBytes(9).toString("base64url"); // 12 chars, SQL/CSV-safe
}
function toInt(v: unknown): number {
  const n = parseInt(String(v ?? "").replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}
/** SQL string literal (escapes single quotes). null → NULL. */
function s(v: unknown): string {
  if (v === null || v === undefined || v === "") return "NULL";
  return `'${String(v).replace(/'/g, "''")}'`;
}
/** SQL jsonb literal. */
function j(v: unknown): string {
  return `'${JSON.stringify(v ?? {}).replace(/'/g, "''")}'::jsonb`;
}
function num(v: unknown): string {
  const n = Number(v);
  return Number.isFinite(n) ? String(n) : "0";
}

const raw = JSON.parse(readFileSync(resolve("scripts/data/hammie-backup.json"), "utf8"));
const out: string[] = [];
const creds: string[] = ["role,code,display_name,email,password"];
out.push("-- ════════════════════════════════════════════════════════════════");
out.push("-- Hammie World — data seed (generated, idempotent). Run AFTER 0001-0003.");
out.push(`-- Generated: ${new Date().toISOString()}  ·  auth domain: ${DOMAIN}`);
out.push("-- ════════════════════════════════════════════════════════════════");
out.push("");

// ── ranks ─────────────────────────────────────────────────────────
const rankId: Record<string, string> = {};
out.push("-- ranks");
(raw.ranks ?? []).forEach((r: any, i: number) => {
  rankId[r.name] = randomUUID();
  out.push(
    `insert into ranks (id,name,description,icon_url,default_icon,sort) values ` +
    `('${rankId[r.name]}',${s(r.name)},${s(r.desc)},${s(r.iconUrl)},${s(r.defIcon)},${i}) on conflict do nothing;`
  );
});
out.push("");

// ── providers ─────────────────────────────────────────────────────
const provId = { cc: randomUUID(), xfxai: randomUUID() };
out.push("-- providers");
out.push(
  `insert into providers (id,name,display_name,divisor,quota_check_url,base_url,highlight_tag,has_rank_pricing,sort,is_active) values\n` +
  `('${provId.cc}','cc','CC (gemai)',5,${s(raw.store?.quotaCheckUrl || "https://key.gemai.cc/")},'https://api.gemai.cc/v1','มีโปรลดตามยศ • เสถียร',true,0,true),\n` +
  `('${provId.xfxai}','xfxai','xfxai',2.5,'https://iqr.xfxai.top/','https://new.xfxai.top/v1','มี GPT 5.5 • ทางเลือกสำรอง',false,1,true)\n` +
  `on conflict do nothing;`
);
out.push("");

// ── models ────────────────────────────────────────────────────────
const modelId = { gem: randomUUID(), gpt: randomUUID() };
out.push("-- models");
out.push(
  `insert into models (id,name,description,sort) values\n` +
  `('${modelId.gem}','Gemini 3.1 Pro','โมเดลหลัก',0),\n` +
  `('${modelId.gpt}','GPT 5.5','ทางเลือกบน xfxai',1)\n` +
  `on conflict do nothing;`
);
out.push("");

// ── provider_models ───────────────────────────────────────────────
const pm = { ccGem: randomUUID(), xfxaiGem: randomUUID(), xfxaiGpt: randomUUID() };
out.push("-- provider_models");
out.push(
  `insert into provider_models (id,provider_id,model_id,status,is_active) values\n` +
  `('${pm.ccGem}','${provId.cc}','${modelId.gem}','ok',true),\n` +
  `('${pm.xfxaiGem}','${provId.xfxai}','${modelId.gem}','ok',true),\n` +
  `('${pm.xfxaiGpt}','${provId.xfxai}','${modelId.gpt}','ok',true)\n` +
  `on conflict do nothing;`
);
out.push("");

// ── bundles ───────────────────────────────────────────────────────
const tabs: any[] = raw.pricing?.tabs ?? [];
const stdItems: any[] = tabs.find((t) => t.id === "std")?.items ?? [];
const ccBundleId: Record<number, string> = {};
out.push("-- bundles: cc × Gemini (std prices)");
const ccRows = stdItems.map((it) => {
  const m = toInt(it.label);
  ccBundleId[m] = randomUUID();
  return `('${ccBundleId[m]}','${pm.ccGem}',${m},${toInt(it.price)},${s(it.note)},${it.featured ? "true" : "false"},true)`;
});
out.push(
  `insert into bundles (id,provider_model_id,messages,price_default,bonus_note,featured,is_active) values\n` +
  ccRows.join(",\n") + "\non conflict do nothing;"
);
out.push("");
out.push("-- bundles: xfxai × Gemini (copy cc default)");
const xgRows = stdItems.map((it) => {
  const m = toInt(it.label);
  return `('${randomUUID()}','${pm.xfxaiGem}',${m},${toInt(it.price)},${it.featured ? "true" : "false"},true)`;
});
out.push(
  `insert into bundles (id,provider_model_id,messages,price_default,featured,is_active) values\n` +
  xgRows.join(",\n") + "\non conflict do nothing;"
);
out.push("");
out.push("-- bundles: xfxai × GPT 5.5 (×49)");
const gptRows: string[] = [];
for (let n = 100; n <= 1000; n += 100) {
  gptRows.push(`('${randomUUID()}','${pm.xfxaiGpt}',${n},${(n / 100) * 49},${n === 1000 ? "true" : "false"},true)`);
}
out.push(
  `insert into bundles (id,provider_model_id,messages,price_default,featured,is_active) values\n` +
  gptRows.join(",\n") + "\non conflict do nothing;"
);
out.push("");

// ── bundle_rank_prices (cc/Gemini only) ──────────────────────────
const rankTabMap: Record<string, string> = {
  r2: "แฮมเต๋อตัวเบิ้ม",
  t1780077089760: "คนเก่งของแฮม",
};
out.push("-- bundle_rank_prices (cc × Gemini)");
const brpRows: string[] = [];
for (const tab of tabs) {
  const rname = rankTabMap[tab.id];
  if (!rname || !rankId[rname]) continue;
  for (const it of tab.items ?? []) {
    const m = toInt(it.label);
    if (!ccBundleId[m]) continue;
    brpRows.push(`('${randomUUID()}','${ccBundleId[m]}','${rankId[rname]}',${toInt(it.price)})`);
  }
}
if (brpRows.length) {
  out.push(
    `insert into bundle_rank_prices (id,bundle_id,rank_id,price) values\n` +
    brpRows.join(",\n") + "\non conflict do nothing;"
  );
}
out.push("");

// ── precompute customer points/total from orders ──────────────────
const statByCode: Record<string, { msgs: number; baht: number }> = {};
for (const o of raw.orders ?? []) {
  const c = o.code;
  if (!c) continue;
  statByCode[c] ??= { msgs: 0, baht: 0 };
  statByCode[c].msgs += toInt(o.messages);
  statByCode[c].baht += toInt(o.amount);
}

// ── customers → auth.users + auth.identities + customers ──────────
const custId: Record<string, string> = {};
out.push("-- ── auth users + customers ──────────────────────────────────────");
function emitAccount(code: string, displayName: string, opts: {
  rank?: string | null; notes?: string | null; special?: string | null; isAdmin?: boolean; role: string;
}) {
  const uid = randomUUID();
  const cid = randomUUID();
  custId[code] = cid;
  const email = codeToEmail(code);
  const password = genPassword();
  const hash = bcrypt.hashSync(password, BCRYPT_COST);
  const st = statByCode[code] ?? { msgs: 0, baht: 0 };
  const points = Math.floor(st.msgs / 100);

  // auth.users
  out.push(
    `insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,` +
    `created_at,updated_at,raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token,` +
    `email_change_token_new,email_change) values ` +
    `('00000000-0000-0000-0000-000000000000','${uid}','authenticated','authenticated',${s(email)},` +
    `${s(hash)},now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','','','','') ` +
    `on conflict do nothing;`
  );
  // auth.identities
  out.push(
    `insert into auth.identities (id,provider_id,user_id,identity_data,provider,last_sign_in_at,created_at,updated_at) values ` +
    `('${randomUUID()}',${s(email)},'${uid}',jsonb_build_object('sub','${uid}','email',${s(email)},'email_verified',true),'email',now(),now(),now()) ` +
    `on conflict do nothing;`
  );
  // customers
  const rid = opts.rank && rankId[opts.rank] ? `'${rankId[opts.rank]}'` : "NULL";
  out.push(
    `insert into customers (id,auth_user_id,code,display_name,rank_id,points,total_baht,is_admin,notes,special,is_active) values ` +
    `('${cid}','${uid}',${s(code)},${s(displayName)},${rid},${points},${num(st.baht)},${opts.isAdmin ? "true" : "false"},` +
    `${s(opts.notes)},${s(opts.special)},true) on conflict do nothing;`
  );
  out.push("");

  creds.push(`${opts.role},${code},${displayName},${email},${password}`);
}

for (const c of raw.customers ?? []) {
  if (!c.code) continue;
  emitAccount(c.code, c.name || c.code, {
    rank: c.rank, notes: c.notes, special: c.special, role: "customer",
  });
}

// admin
const adminCode = process.env.ADMIN_CODE || "admin";
emitAccount(adminCode, "แอดมินแฮม", { isAdmin: true, role: "admin" });

// ── orders (offline, approved) ────────────────────────────────────
out.push("-- orders (offline, approved)");
const ordRows: string[] = [];
for (const o of raw.orders ?? []) {
  const cid = custId[o.code];
  const when = o.date ? `'${o.date}'::timestamptz` : "now()";
  ordRows.push(
    `('${randomUUID()}',` +
    `${cid ? `'${cid}'` : "NULL"},${s(o.code)},'offline',${toInt(o.messages)},${toInt(o.amount)},` +
    `${s(o.note)},'approved',${when})`
  );
}
out.push(
  `insert into orders (id,customer_id,code,source,messages,amount_baht,note,status,approved_at) values\n` +
  ordRows.join(",\n") + "\non conflict do nothing;"
);
out.push("");

// ── store_settings (singleton) ────────────────────────────────────
out.push("-- store_settings (singleton id=1)");
out.push(
  `insert into store_settings (id,name,subtitle,description,discord_link,discord_user,footer,bank_text,` +
  `hours_open,hours_close,hours_days,assets,status) values (1,` +
  `${s(raw.store?.name || raw.about?.name || "Hammie World")},${s(raw.store?.subtitle)},` +
  `${s(raw.store?.description || raw.about?.bio)},${s(raw.store?.discordLink || raw.about?.socials?.[0]?.url)},` +
  `${s(raw.store?.discordUser || raw.about?.discord)},${s(raw.store?.footer)},` +
  `'SCB 427-202933-9 / น.ส.ชลณิชา เข็มทอง (พร้อมเพย์)',` +
  `${s(raw.hours?.open)},${s(raw.hours?.close)},${j(raw.hours?.days ?? [0,1,2,3,4,5,6])},` +
  `${j(raw.assets ?? {})},${j(raw.status ?? {})}) on conflict do nothing;`
);
out.push("");

// ── announcements ─────────────────────────────────────────────────
out.push("-- announcements");
for (const a of raw.announcements ?? []) {
  out.push(
    `insert into announcements (id,title,body,type,pinned,date) values ` +
    `('${randomUUID()}',${s(a.title)},${s(a.body)},${s(a.type || "news")},${a.pinned ? "true" : "false"},${s(a.date)}) ` +
    `on conflict do nothing;`
  );
}
out.push("");

mkdirSync(resolve("scripts/output"), { recursive: true });

// ── safety net: assert every UUID literal is a valid 8-4-4-4-12 ───
const sql = out.join("\n");
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const candidates = [...sql.matchAll(/'([0-9a-fA-F]{4,}-[0-9a-fA-F-]{8,})'/g)].map((m) => m[1]);
const bad = [...new Set(candidates)].filter((u) => !UUID_RE.test(u));
if (bad.length) {
  console.error("✗ malformed UUID literal(s) detected, aborting:", bad);
  process.exit(1);
}

writeFileSync(resolve("scripts/output/seed.sql"), sql, "utf8");
writeFileSync(resolve("scripts/output/credentials.csv"), creds.join("\n"), "utf8");
console.log(`✅ seed.sql (${out.length} lines) + credentials.csv (${creds.length - 1} accounts) → scripts/output/`);
console.log(`   UUID check: ${candidates.length} literals, all valid 8-4-4-4-12 ✓`);
