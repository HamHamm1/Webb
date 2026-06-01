# 🐹 Hammie World

ร้านขายสิทธิ์ใช้งาน API (Gemini 3.1 Pro / GPT 5.5 ฯลฯ) — ซื้อ → จ่ายผ่าน QR พร้อมเพย์ →
อัปสลิป → แอดมินอนุมัติ → รับคีย์จากคลังอัตโนมัติ พร้อมระบบยศ + แต้มสะสม

**Stack:** Next.js 14 (App Router, TS) · Supabase (Postgres + Auth + Storage) · Tailwind · Vercel
ฟรีล้วน ไม่ต้องผูกบัตร ดูบรีฟเต็มที่ [`docs-hammie-world-brief.md`](./docs-hammie-world-brief.md)

---

## เริ่มใช้งาน (Setup)

### 1. ติดตั้ง
```bash
npm install
cp .env.example .env.local   # แล้วเติมค่าจริง
```

### 2. สร้างโปรเจกต์ Supabase (ฟรี)
- เอา `Project URL`, `anon key`, `service_role key` มาใส่ `.env.local`
- รัน SQL ใน `supabase/migrations/` ตามลำดับ (`0001` → `0002` → `0003`)
  ผ่าน Supabase SQL Editor หรือ Supabase CLI:
  ```bash
  supabase db push     # ถ้าใช้ Supabase CLI + ลิงก์โปรเจกต์แล้ว
  ```

### 3. ย้ายข้อมูลเดิม (ครั้งเดียว)
อ่าน `scripts/data/hammie-backup.json` เข้า DB — สร้างยศ/ลูกค้า/ราคา/ออเดอร์เดิม
และ **สุ่มรหัสผ่าน** ให้ลูกค้าทุกคน + บัญชีแอดมิน:
```bash
# ตั้งรหัสแอดมินเองได้ (ไม่งั้นจะสุ่มให้)
ADMIN_CODE=admin ADMIN_PASSWORD=ตั้งเอง npm run migrate
```
รหัสผ่านทั้งหมดจะถูกเขียนไว้ที่ `scripts/output/credentials.csv` (ถูก gitignore) — เอาไปแจกลูกค้า

### 4. รันเว็บ
```bash
npm run dev      # http://localhost:3000
```

### 5. Deploy (Vercel)
- เชื่อม GitHub repo เข้ากับ Vercel
- ใส่ env vars ทั้งหมดจาก `.env.local` ใน Vercel Project Settings
- ตั้ง Storage bucket `slips` แบบ private (สคริปต์/migration สร้างให้แล้ว)

---

## โครงสร้าง

```
src/
  app/
    (public)            หน้าร้าน: /, /prices, /promotion, /rank, /about, /contact, /login
    me/                 บัญชีลูกค้า: คีย์ที่ได้รับ, แต้ม, เปลี่ยนรหัส, /me/orders
    shop/               ซื้อ → QR → อัปสลิป
    admin/              แดชบอร์ด, คลังคีย์, ลูกค้า, ledger, สินค้า, ตั้งค่า
    api/                server routes (auth, orders, admin/*)
  lib/                  supabase clients, auth, pricing, points, discord, catalog, shop
  components/           UI (ธีมแฮมเตอร์พาสเทล) + admin/*
supabase/migrations/    SQL: schema, RLS+functions, storage
scripts/migrate.ts      import JSON เดิม → Supabase
```

## หลักความปลอดภัย (สำคัญ)
- ราคา / การหยิบคีย์ / อนุมัติ ทำ **ฝั่ง server เท่านั้น** (กันแก้ผ่าน devtools)
- อนุมัติใช้ Postgres function `approve_order` (row lock `FOR UPDATE SKIP LOCKED`) กันจ่ายคีย์ซ้ำ
- `inventory_keys.key_string`, `service_role key`, Discord webhook → **ไม่หลุดไป client** (RLS + server-only)
- รหัสผ่านทุกบัญชีผ่าน Supabase Auth (hash) — ไม่มี secret ฝังในโค้ด

## ตรรกะหลัก (§6)
- **ราคา:** cc/Gemini ใช้ราคาตามยศ (ถ้ามี) ไม่งั้นราคาปกติ · xfxai ทุกคนราคาเดียว
- **แต้ม:** `floor(รวมข้อความจากออเดอร์ approved / 100)` คำนวณใหม่ทุกครั้งที่อนุมัติ/เพิ่ม ledger
- **quota helper:** `floor(ยอดคงเหลือ$ / ตัวหาร)` — cc ÷5, xfxai ÷2.5
- **สถานะโมเดล:** `ok` ซื้อปกติ · `unstable` เด้งยืนยันก่อนซื้อ · สต็อก 0 ปุ่มหมดสต็อก
