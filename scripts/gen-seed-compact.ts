/**
 * Compact seed generator — emits short, copy-safe SQL for the customer /
 * order data using a single temp table + set-based INSERTs (one row per
 * line, one UUID per line). Far smaller than the per-column wrapped form.
 *
 *   npx tsx scripts/gen-seed-compact.ts
 *   → scripts/output/seed_part2_customers.sql
 *   → scripts/output/seed_part3_orders.sql
 *   → scripts/output/credentials.csv   (raw passwords, gitignored)
 *
 * Customers link to ranks by NAME and orders link to customers by CODE, so
 * these parts don't depend on the catalog's random UUIDs — only that the
 * catalog (Part 1) has been run first.
 */
import bcrypt from "bcryptjs";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const DOMAIN = process.env.AUTH_EMAIL_DOMAIN || "hammie.local";
const COST = 10;

/** Deterministic UUID-format string from any input (for idempotent re-runs). */
function detUuid(s: string): string {
  const h = createHash("md5").update(s).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

function codeToEmail(code: string): string {
  const slug = code.trim().toLowerCase().normalize("NFKC")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (Math.imul(31, h) + code.charCodeAt(i)) | 0;
  return `${slug || "user"}-${(h >>> 0).toString(36)}@${DOMAIN}`;
}
const pw = () => randomBytes(9).toString("base64url");
const toInt = (v: unknown) => { const n = parseInt(String(v ?? "").replace(/[^0-9]/g, ""), 10); return Number.isFinite(n) ? n : 0; };
const q = (v: unknown) => (v === null || v === undefined || v === "" ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);

const raw = JSON.parse(readFileSync(resolve("scripts/data/hammie-backup.json"), "utf8"));
const creds = ["role,code,display_name,email,password"];

// precompute points/total from orders
const stat: Record<string, { m: number; b: number }> = {};
for (const o of raw.orders ?? []) {
  if (!o.code) continue;
  stat[o.code] ??= { m: 0, b: 0 };
  stat[o.code].m += toInt(o.messages);
  stat[o.code].b += toInt(o.amount);
}

// ── build customer rows ───────────────────────────────────────────
type Row = { uid: string; email: string; hash: string; code: string; name: string; rank: string | null; points: number; baht: number; admin: boolean; notes: string | null };
const rows: Row[] = [];
for (const c of raw.customers ?? []) {
  if (!c.code) continue;
  const password = pw();
  const st = stat[c.code] ?? { m: 0, b: 0 };
  rows.push({
    uid: randomUUID(), email: codeToEmail(c.code), hash: bcrypt.hashSync(password, COST),
    code: c.code, name: c.name || c.code, rank: c.rank || null,
    points: Math.floor(st.m / 100), baht: st.b, admin: false, notes: c.notes || null,
  });
  creds.push(`customer,${c.code},${c.name || c.code},${codeToEmail(c.code)},${password}`);
}
const adminCode = process.env.ADMIN_CODE || "admin";
const adminPw = pw();
rows.push({
  uid: randomUUID(), email: codeToEmail(adminCode), hash: bcrypt.hashSync(adminPw, COST),
  code: adminCode, name: "แอดมินแฮม", rank: null, points: 0, baht: 0, admin: true, notes: null,
});
creds.push(`admin,${adminCode},แอดมินแฮม,${codeToEmail(adminCode)},${adminPw}`);

// ── Part 2: customers ─────────────────────────────────────────────
const seedRows = rows.map((r) =>
  `  (${q(r.uid)}::uuid,${q(r.email)},${q(r.hash)},${q(r.code)},${q(r.name)},${r.rank ? q(r.rank) : "NULL"},${r.points},${r.baht},${r.admin},${q(r.notes)})`
).join(",\n");

const part2 = `-- ════════════════════════════════════════════════════════════════
-- Hammie World — seed ส่วนที่ 2/3 : ลูกค้า + แอดมิน (รันหลังส่วนที่ 1)
-- ════════════════════════════════════════════════════════════════
create temp table _seed (
  uid uuid, email text, pass_hash text, code text, display_name text,
  rank_name text, points int, baht numeric, is_admin boolean, notes text
);
insert into _seed (uid,email,pass_hash,code,display_name,rank_name,points,baht,is_admin,notes) values
${seedRows};

-- 1) auth.users
insert into auth.users (
  instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
  created_at,updated_at,raw_app_meta_data,raw_user_meta_data,
  confirmation_token,recovery_token,email_change_token_new,email_change)
select '00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated',
  email,pass_hash,now(),now(),now(),
  '{"provider":"email","providers":["email"]}','{}','','','',''
from _seed
on conflict do nothing;

-- 2) auth.identities
insert into auth.identities (
  provider_id,user_id,identity_data,provider,last_sign_in_at,created_at,updated_at)
select email,uid,
  jsonb_build_object('sub',uid::text,'email',email,'email_verified',true),
  'email',now(),now(),now()
from _seed
on conflict do nothing;

-- 3) customers (link rank by name)
insert into customers (
  id,auth_user_id,code,display_name,rank_id,points,total_baht,is_admin,notes,special,is_active)
select gen_random_uuid(),s.uid,s.code,s.display_name,r.id,s.points,s.baht,s.is_admin,s.notes,NULL,true
from _seed s
left join ranks r on r.name = s.rank_name
on conflict do nothing;

drop table _seed;
`;

// ── Part 3: orders + store_settings + announcements ───────────────
const orderRows = (raw.orders ?? []).map((o: any) =>
  `  (${q(detUuid(o.id || randomUUID()))}::uuid,${q(o.code)},${toInt(o.messages)},${toInt(o.amount)},${o.date ? `'${o.date}'::timestamptz` : "now()"})`
).join(",\n");

const assets = JSON.stringify(raw.assets ?? {}).replace(/'/g, "''");
const status = JSON.stringify(raw.status ?? {}).replace(/'/g, "''");
const days = JSON.stringify(raw.hours?.days ?? [0, 1, 2, 3, 4, 5, 6]);

const part3 = `-- ════════════════════════════════════════════════════════════════
-- Hammie World — seed ส่วนที่ 3/3 : orders + ตั้งค่าร้าน + ประกาศ
-- ════════════════════════════════════════════════════════════════
-- orders (offline, approved) — link to customer by code
insert into orders (id,customer_id,code,source,messages,amount_baht,status,approved_at)
select d.id,c.id,d.code,'offline',d.messages,d.amount,'approved',d.dt
from (values
${orderRows}
) as d(id,code,messages,amount,dt)
left join customers c on c.code = d.code
on conflict do nothing;

-- store_settings (singleton id=1)
insert into store_settings (
  id,name,subtitle,description,discord_link,discord_user,footer,bank_text,
  hours_open,hours_close,hours_days,assets,status) values (
  1,
  ${q(raw.store?.name || "Hammie World")},
  ${q(raw.store?.subtitle)},
  ${q(raw.store?.description || raw.about?.bio)},
  ${q(raw.store?.discordLink || raw.about?.socials?.[0]?.url)},
  ${q(raw.store?.discordUser || raw.about?.discord)},
  ${q(raw.store?.footer)},
  'SCB 427-202933-9 / น.ส.ชลณิชา เข็มทอง (พร้อมเพย์)',
  ${q(raw.hours?.open)},
  ${q(raw.hours?.close)},
  '${days}'::jsonb,
  '${assets}'::jsonb,
  '${status}'::jsonb)
on conflict do nothing;

-- announcements
${(raw.announcements ?? []).map((a: any) =>
  `insert into announcements (id,title,body,type,pinned,date) values (${q(detUuid("ann:" + (a.title || "") + (a.date || "")))}::uuid,${q(a.title)},${q(a.body)},${q(a.type || "news")},${a.pinned ? "true" : "false"},${q(a.date)}) on conflict do nothing;`
).join("\n")}
`;

mkdirSync(resolve("scripts/output"), { recursive: true });
writeFileSync(resolve("scripts/output/seed_part2_customers.sql"), part2, "utf8");
writeFileSync(resolve("scripts/output/seed_part3_orders.sql"), part3, "utf8");
writeFileSync(resolve("scripts/output/credentials.csv"), creds.join("\n"), "utf8");
console.log(`✅ part2 (${part2.split("\n").length} lines) + part3 (${part3.split("\n").length} lines) + credentials.csv (${creds.length - 1})`);
