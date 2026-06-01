# 🐹 Hammie World — Project Brief (ฉบับเต็มสำหรับ build จริง)

> เอกสารนี้ใช้ brief ให้ **Claude Code** สร้างเว็บไซต์ขาย API จริง
> เขียนจากของเดิม: `index.html` (single-file + Firebase) + `hammie-backup__5_.json`
> เป้าหมาย: เว็บที่ **ซื้อขายได้จริง**, จ่ายเงิน QR + อัปสลิป, แอดมินอนุมัติ + จ่ายคีย์จากสต็อก, มีระบบ rank/points — **ฟรีล้วน ไม่ต้องใช้บัตรเครดิต**

---

## 0. สรุปการตัดสินใจ (locked) + ข้อสมมติที่ต้องยืนยัน

### ✅ ตัดสินแล้ว
| หัวข้อ | สรุป |
|---|---|
| Stack | **Next.js (App Router) + Supabase + Vercel** — ฟรีล้วน ไม่ต้องผูกบัตร |
| คลังคีย์ | **โมเดล A** — ระบบเก็บ "สตริงคีย์จริง" เป็นคลัง แอดมินอัปล่วงหน้าเป็นล็อต, อนุมัติแล้วระบบหยิบให้อัตโนมัติ 1 ใบ |
| สต็อก 0 | กดซื้อ bundle นั้นไม่ได้ (ขึ้น "หมดสต็อก") |
| เช็ค quota | **manual** — เปิดเว็บ provider เอง เอาเลขกลาง (ยอดคงเหลือ $) มาหารด้วยตัวหาร (cc=5, xfxai=2.5) ระบบมีตัวช่วยหารให้ + เก็บตัวหารแก้ได้ |
| ตรวจสลิป | **manual** — ลูกค้าอัปสลิป → แอดมินเปิดดูรูปเอง → กดอนุมัติ (ไม่ใช้บริการ auto ใน v1) |
| แจ้งเตือน | **Discord webhook** เด้งทุกครั้งที่มีออเดอร์ใหม่/อัปสลิป |
| ราคาตาม rank | ใช้กับ **cc/Gemini เท่านั้น** (มี tab ราคาตามยศ) — **xfxai ไม่มีลด** ทุกคนจ่ายราคาเดียว |
| Login | ลูกค้า login ด้วย **รหัสชื่อ API ที่แอดมินลงทะเบียน** + รหัสผ่าน, **ยศแอดมินมอบเอง** |
| Points | **อัตโนมัติ** 1 แต้ม / 100 ข้อความ (รวมออเดอร์ในเว็บ + ออเดอร์นอกเว็บที่แอดมินใส่เอง) |
| Ledger | ระบบยอดคำสั่งซื้อ **แอดมินแก้ไข/เพิ่มเองได้** (เผื่อคนซื้อในดิสไม่ผ่านเว็บแต่อยากสะสมแต้ม) |
| ป้ายจุดเด่นต้นทาง | **แก้ได้ในแอดมิน** + ใส่ตัวอย่างไว้ |
| ธีม | คงธีมแฮมเตอร์พาสเทล + assets เดิมทั้งหมด |
| ข้อมูลเดิม | **ย้ายมาทั้งหมด** (28 ลูกค้า, 12 ออเดอร์, 4 ยศ, ราคา, assets, about, ประกาศ) |

### ⚠️ ข้อสมมติ (ปรับได้ตอน review — Claude Code จะถามซ้ำตอน build)
1. **วิธี login:** ใช้ `รหัสชื่อ API (code)` + `รหัสผ่าน` ที่แอดมินตั้งให้ตอนลงทะเบียน (โชว์ครั้งเดียวให้ลูกค้า, ลูกค้าเปลี่ยนเองได้ทีหลัง) — เพราะถ้า login ด้วยชื่ออย่างเดียวจะไม่ปลอดภัย (คีย์เป็นของมีค่า)
2. **Guest (ไม่ login):** ดูสินค้า/ราคาปกติได้ แต่ต้อง login ก่อนกดซื้อ
3. **ยศที่ไม่มี tab ราคา** (จิ๋ว / ติดปีกแก้มตุ่ย) → เห็น **ราคาปกติ**

---

## 1. ภาพรวม / เป้าหมาย

ร้าน **Hammie World** ขายสิทธิ์ใช้งาน API (ปัจจุบัน Gemini 3.1 Pro, อนาคต GPT 5.5 ฯลฯ) ผ่านหลายต้นทาง (provider) โดยขายเป็น "จำนวนข้อความ" แบบ bundle ตายตัว ลูกค้าจ่ายผ่านพร้อมเพย์ QR แล้วอัปสลิป แอดมินตรวจแล้วจ่ายคีย์จากคลัง คีย์โผล่ในหน้าบัญชีลูกค้า พร้อมระบบยศ + แต้มสะสม

**สิ่งที่ต้องเปลี่ยนจากของเดิม:** จากแค่ "แค็ตตาล็อก + แดชบอร์ดแอดมิน" (ซื้อจริงต้องทักดิส) → เป็น **ร้านที่ลูกค้ากดซื้อ/จ่าย/รับคีซ์ในเว็บได้จริง** มี backend จริง, มี auth, มีคลังคีย์, มี audit ครบ

---

## 2. Tech Stack + เหตุผล

| ชั้น | เครื่องมือ | ทำไม / Free tier |
|---|---|---|
| Frontend + Backend | **Next.js 14+ (App Router, TypeScript)** | หน้าเว็บ + API routes (serverless) ในโปรเจกต์เดียว |
| Hosting | **Vercel (Hobby)** | ฟรี ไม่ต้องผูกบัตร, auto deploy จาก GitHub |
| Database | **Supabase Postgres** | ฟรี (500MB), SQL จริง, มี Row Level Security |
| Auth | **Supabase Auth** (custom: code+password) | ฟรี, จัดการ session/JWT ให้ |
| ไฟล์ (สลิป) | **Supabase Storage** | ฟรี (1GB) |
| รูป assets เดิม | คง **postimg** เดิม (external) | ฟรี ไม่ต้องย้าย |
| แจ้งเตือน | **Discord Webhook** | ฟรี |
| Styling | **Tailwind CSS** (แปลงธีมเดิมมาเป็น design tokens) | — |

> **หมายเหตุ Firebase:** ไม่ใช้ต่อ เพราะ Cloud Functions ต้องเปิด Blaze (ผูกบัตร) → ขัดกับ "ฟรีล้วน" จึงย้ายมา Supabase ทั้งหมด (ดึง JSON เดิม import ครั้งเดียว)

---

## 3. สถาปัตยกรรม (ภาพรวม flow)

```
[Browser]
  ├─ หน้าร้าน (public)  ─────────────┐
  ├─ หน้าลูกค้า (ต้อง login)         │  เรียก
  └─ หน้าแอดมิน (ต้อง login + role)  │  ↓
                                     [Next.js API Routes / Server Actions]
                                          ├─ ตรวจ stock + ล็อกคีย์ (transaction)
                                          ├─ คำนวณราคา (provider×model×bundle×rank)
                                          ├─ คำนวณแต้ม
                                          ├─ ยิง Discord webhook
                                          └─ อ่าน/เขียน
                                              [Supabase: Postgres + Auth + Storage]
```

หลักการ: **ตรรกะสำคัญ (ราคา/สต็อก/อนุมัติ/แต้ม) ทำฝั่ง server เท่านั้น** ห้ามให้ client คำนวณราคาหรือแตะคลังคีย์ตรง ๆ (กัน user แก้ราคาผ่าน devtools)

---

## 4. Database Schema (Postgres / Supabase)

> ทุกตารางมี `id uuid default gen_random_uuid()`, `created_at timestamptz default now()` (ละไว้ในตารางด้านล่าง)

### 4.1 `providers` — ต้นทาง
| คอลัมน์ | ชนิด | หมายเหตุ |
|---|---|---|
| name | text | `cc`, `xfxai` |
| display_name | text | ชื่อโชว์ |
| divisor | numeric | ตัวหาร quota: cc=`5`, xfxai=`2.5` |
| quota_check_url | text | cc=`https://key.gemai.cc/`, xfxai=`https://iqr.xfxai.top/` |
| base_url | text | default base URL ของคีย์: cc=`https://api.gemai.cc/v1`, xfxai=`https://new.xfxai.top/v1` |
| highlight_tag | text | ป้ายจุดเด่น (แก้ได้) เช่น cc=`มีโปรลดตามยศ • เสถียร`, xfxai=`มี GPT 5.5 • ทางเลือกสำรอง` |
| has_rank_pricing | bool | cc=`true`, xfxai=`false` |
| sort | int | ลำดับแสดง |
| is_active | bool | |

### 4.2 `models` — โมเดล
| name | text | `Gemini 3.1 Pro`, `GPT 5.5` |
| description | text | |
| no_expiry_note | text | "โมเดลไม่มีวันหมดอายุ" (โชว์ตอนเตือน) |
| sort | int | |

### 4.3 `provider_models` — โมเดลอยู่ต้นทางไหน + สถานะ (เมทริกซ์ "เสียบ้าง")
| provider_id | fk providers | |
| model_id | fk models | |
| status | text | `ok` (ลื่น) / `unstable` (ไม่เสถียร) |
| is_active | bool | ปิด = ไม่ขายชั่วคราว |

> เช่น (cc × Gemini, status=unstable), (xfxai × Gemini, status=ok), (xfxai × GPT5.5, status=ok)
> **สถานะผูกกับคู่ provider×model** (Gemini เสียที่ cc แต่ปกติที่ xfxai ได้)

### 4.4 `bundles` — แพ็กเกจตายตัว (ราคา default = ราคาปกติ/ไม่มียศ)
| provider_model_id | fk | |
| messages | int | 100, 200, ..., 1000 |
| price_default | int | บาท (cc Gemini 100=48 … 1000=480; xfxai GPT5.5 100=49,200=98…1000=490) |
| bonus_note | text | เช่น "1,000 ข้อความ แถมฟรี +200" |
| featured | bool | |
| is_active | bool | |

### 4.5 `bundle_rank_prices` — ราคาเฉพาะยศ (ใช้กับ cc/Gemini เท่านั้น)
| bundle_id | fk | |
| rank_id | fk ranks | |
| price | int | ราคาที่ยศนี้จ่าย |

> มาจาก tab เดิม: `ราคาแฮมเต๋อตัวเบิ้ม` (100=39…1000=390), `ราคาคนเก่งของแฮม` (100=45…1000=450)
> ลูกค้าไม่มี override → ใช้ `price_default`. xfxai ไม่มี row ที่นี่เลย → ทุกคนจ่าย default

### 4.6 `ranks` — ยศ (มอบโดยแอดมิน)
| name | text | จิ๋ว / เบิ้ม / ติดปีกแก้มตุ่ย / คนเก่งของแฮม |
| description | text | เกณฑ์ (โชว์เฉย ๆ) |
| icon_url | text | |
| default_icon | text | flower/heart/star/crown |
| sort | int | |

### 4.7 `customers` — ลูกค้า (= บัญชี login)
| code | text **unique** | รหัสชื่อ API ใช้ login |
| display_name | text | ชื่อโชว์ในอันดับ |
| password_hash | text | (ผ่าน Supabase Auth) |
| rank_id | fk ranks | แอดมินตั้ง |
| points | int | คำนวณอัตโนมัติ (ดู §6) |
| total_baht | numeric | คำนวณจากออเดอร์ approved |
| notes | text | |
| special | text | |
| is_active | bool | |

### 4.8 `inventory_keys` — คลังคีย์ (โมเดล A)
| provider_id | fk | |
| model_id | fk | |
| bundle_messages | int | คีย์นี้สำหรับ bundle กี่ข้อความ (100/200/…) |
| key_string | text | สตริงคีย์จริง (เช่น `sk-...`) — **เข้ารหัส/จำกัดสิทธิ์อ่าน** |
| base_url | text | cc=`https://api.gemai.cc/v1`, xfxai=`https://new.xfxai.top/v1` (ตั้ง default ตาม provider) |
| status | text | `available` / `reserved` / `sold` / `dead` |
| order_id | fk orders (nullable) | ผูกตอนขาย |
| note | text | |
| sold_at | timestamptz | |

> **สต็อกของ bundle** = นับ `inventory_keys` ที่ตรง (provider, model, messages) และ status=`available`
> Claude Code: ตอนอนุมัติต้องใช้ **transaction + row lock** (`SELECT … FOR UPDATE SKIP LOCKED`) กันจ่ายคีย์ซ้ำ

### 4.9 `orders` — คำสั่งซื้อ + ledger
| customer_id | fk (nullable สำหรับ offline ที่ยังไม่ผูกบัญชี) | |
| code | text | denormalize ชื่อร้าน |
| source | text | `web` / `offline` |
| provider_id, model_id | fk (nullable สำหรับ offline เก่า) | |
| messages | int | |
| amount_baht | int | |
| api_label | text | ชื่อ API ที่ลูกค้าตั้ง (ตามฟอร์มเดิม) |
| status | text | `pending_slip` → `awaiting_review` → `approved` / `rejected` / `cancelled` |
| slip_url | text | ใน Supabase Storage |
| assigned_key_id | fk inventory_keys (nullable) | |
| note | text | |
| approved_at, approved_by | | |

### 4.10 `announcements` (title, body, type, pinned, date) — ตามเดิม
### 4.11 `store_settings` (singleton แถวเดียว)
ชื่อร้าน, subtitle, description, discord_link, discord_user, footer, **payment_qr_url**, **bank_text** (`SCB 427-202933-9 / น.ส.ชลณิชา เข็มทอง` + พร้อมเพย์), hours_open/close/days, **discord_webhook_url**, assets (logo/banner/hero/cover/profile/nav_* — เก็บเป็น jsonb)

### 4.12 (Phase 2) `reviews`, `claims`

---

## 5. การย้ายข้อมูล (Firebase JSON → Supabase)

เขียน **สคริปต์ import ครั้งเดียว** (`scripts/migrate.ts`) อ่าน `hammie-backup__5_.json`:

| JSON เดิม | → ตารางใหม่ | หมายเหตุ |
|---|---|---|
| `about`, `store`, `assets`, `hours`, `status` | `store_settings` | รวมเป็นแถวเดียว |
| `ranks` (4) | `ranks` | ตรง ๆ |
| `customers` (28) | `customers` | ต้อง **gen รหัสผ่านเริ่มต้น** ให้แต่ละคน + แจ้งลูกค้า; map `rank` (string) → `rank_id` |
| `pricing.tabs[std]` | `bundles` (cc×Gemini, price_default) | |
| `pricing.tabs[r2/คนเก่ง]` | `bundle_rank_prices` | map เป็น rank override |
| `orders` (12) | `orders` (source=`offline`/`web` ตามจริง, status=`approved`) | เพื่อให้แต้ม/ยอดเดิมไม่หาย |
| — | `providers` | สร้าง cc, xfxai ด้วยมือในสคริปต์ |
| — | `models` | Gemini 3.1 Pro, GPT 5.5 |
| — | `provider_models` | cc×Gemini, xfxai×Gemini, xfxai×GPT5.5 |
| — | `bundles` xfxai | Gemini = ก็อป cc default; GPT5.5 = ×49 |

> คลัง `inventory_keys` เริ่มจากว่าง — แอดมินอัปคีย์เองหลัง deploy

---

## 6. Business Logic + สูตรสำคัญ (ทำฝั่ง server)

**ราคาที่ลูกค้าต้องจ่าย** =
```
ถ้า provider.has_rank_pricing == true:
    price = bundle_rank_prices(bundle, ลูกค้า.rank) ?? bundle.price_default
ไม่งั้น:
    price = bundle.price_default          // xfxai ทุกคนเท่ากัน
```

**ข้อความคงเหลือ (quota helper, manual):**
```
remaining_messages = floor( ยอดคงเหลือ$ ที่กรอก / provider.divisor )
// cc: ÷5, xfxai: ÷2.5
```

**แต้มสะสม:** `points = floor( รวม messages จากออเดอร์ approved ทั้งหมด / 100 )` → คำนวณใหม่ทุกครั้งที่ approve/แก้/เพิ่ม order
**ยอดสะสม:** `total_baht = sum(amount_baht) ของออเดอร์ approved`
**ยศ:** แอดมินตั้งเอง (ระบบ "แนะนำ" ได้จาก total_baht แต่ไม่เปลี่ยนอัตโนมัติ)

**สถานะโมเดล:**
- `ok` → ซื้อได้ปกติ
- `unstable` → ซื้อได้ แต่ก่อนยืนยันเด้ง dialog:
  > "ขณะนี้โมเดล [X] ที่ [provider] กำลังไม่เสถียร เป็นอาการชั่วคราว อาจกลับมาใช้ได้เร็ว ๆ นี้ และ **โมเดลไม่มีวันหมดอายุ** — ต้องการยืนยันรับสินค้าไหมคะ?"
- stock = 0 → ปุ่มซื้อ disable แสดง "หมดสต็อก"

---

## 7. Flow หลัก: ซื้อ → จ่าย → อนุมัติ → รับคีย์

1. ลูกค้า **login** (code + password)
2. เลือก **โมเดล → ต้นทาง → bundle** (ระบบเช็ค stock + status; unstable เด้งเตือน/ยืนยัน)
3. ระบบสร้าง `order` (status=`pending_slip`) + แสดง **Order Summary** (สไตล์ฟอร์มเดิม) + **QR พร้อมเพย์** + ช่องตั้งชื่อ API
4. ลูกค้าโอน → **อัปสลิป** → status=`awaiting_review` → **ยิง Discord webhook** หาแอดมิน
5. แอดมินเปิดแอดมิน → เห็นออเดอร์รอตรวจ + **รูปสลิป** → กด **อนุมัติ**
6. ระบบ (transaction): หยิบ `inventory_keys` ที่ว่าง 1 ใบ (ตรง provider×model×messages) → mark `sold` + ผูก order → order=`approved` → คำนวณแต้ม/ยอดใหม่
7. ลูกค้าเห็น **คีย์ + Base URL + วิธีตั้งค่า + ลิงก์เช็ค quota** ในหน้าบัญชีตัวเอง (สไตล์ฟอร์ม Order Confirmed)
8. ถ้าสต็อกไม่พอตอนกดอนุมัติ → แจ้งแอดมิน "คลังหมด เพิ่มคีย์ก่อน" (order ค้าง awaiting)

แอดมิน **reject** ได้ (พร้อมเหตุผล) → ลูกค้าเห็นสถานะถูกปฏิเสธ

---

## 8. หน้าเว็บทั้งหมด

### Public (ไม่ต้อง login) — ยกธีม/เนื้อหาเดิมมา
`/` Home (hero, สถานะร้าน, ประกาศ) · `/prices` ราคา (โชว์ราคาปกติ + สถานะโมเดลแต่ละต้นทาง + ป้ายจุดเด่น) · `/promotion` · `/rank` (อันดับลูกค้า + เกณฑ์ยศ) · `/about` · `/contact` · `/login`

### Customer (login)
`/me` บัญชี: ยศ/แต้ม/ยอด, **คีย์ที่ได้รับ** (ประวัติ order + คีย์ + ปุ่มคัดลอก + ลิงก์เช็ค quota), เปลี่ยนรหัสผ่าน · `/shop` ซื้อ (เลือก→จ่าย→อัปสลิป) · `/me/orders` สถานะออเดอร์

### Admin (login + role=admin)
- **Dashboard:** ออเดอร์รอตรวจ (เด่นสุด) + ดูสลิป + อนุมัติ/ปฏิเสธ
- **คลังคีย์:** อัปคีย์ทีละล็อต (วาง textarea หลายบรรทัด เลือก provider/model/bundle), ดูจำนวนคงเหลือ, mark dead
- **สินค้า:** จัดการ providers/models/provider_models(สถานะ ok/unstable)/bundles/ราคา/ป้ายจุดเด่น/ตัวหาร/quota url
- **ลูกค้า:** ลงทะเบียน (gen code+password), มอบยศ, แก้แต้ม/โน้ต
- **Ledger:** เพิ่ม/แก้ออเดอร์ offline (เพื่อสะสมแต้มให้คนซื้อในดิส)
- **ตั้งค่าร้าน:** assets, QR, บัญชี, เวลาเปิด, ประกาศ, Discord webhook URL

---

## 9. ความปลอดภัย (สำคัญ — ของเดิมมีรหัสแอดมิน `010148` ฝังในโค้ด ❌)

- รหัสผ่านทั้งหมด **hash** (ผ่าน Supabase Auth) — ห้าม plaintext/ฝังในโค้ด
- แยก role `admin` ชัดเจน; หน้า/เอนด์พอยต์แอดมินเช็ค role ฝั่ง server
- **Supabase RLS:** ลูกค้าอ่านได้แค่ข้อมูล/คีซ์ของตัวเอง; `inventory_keys.key_string`, `service_role` key, Discord webhook URL → server-only ไม่หลุดไป client
- คำนวณราคา/หยิบคีซ์/อนุมัติ = server เท่านั้น (กันแก้ราคาใน devtools)
- อนุมัติใช้ transaction กันจ่ายคีซ์ซ้ำ (race condition)
- จำกัดชนิด/ขนาดไฟล์สลิป + rate limit หน้า login

---

## 10. แผนงานเป็น Phase

**Phase 0 — Setup:** สร้าง repo, Supabase, schema, สคริปต์ migrate, ยกธีมเดิมเป็น Tailwind tokens
**Phase 1 — MVP (โฟกัสนี้ก่อน):** auth, หน้าร้าน public, ระบบซื้อ→QR→อัปสลิป, แอดมินอนุมัติ+คลังคีซ์, จ่ายคีซ์เข้าหน้าลูกค้า, Discord webhook, rank/points/ledger, สถานะโมเดล
**Phase 2 (ทีหลัง):** ระบบเคลม "กล่องเปล่า 3 ครั้ง", รีวิวบนเว็บ, ตรวจสลิปอัตโนมัติ (SlipOK), ดึง quota อัตโนมัติถ้า provider มี API, สินค้าประเภทอื่น (preset/ไฟล์ดิจิทัล/ปลดล็อกฟีเจอร์ — schema เผื่อไว้แล้วผ่าน `products` generic)

---

## 11. Setup Checklist (สิ่งที่ ไไ ต้องเตรียม)
- [ ] บัญชี GitHub, Vercel, Supabase (ทั้งหมดฟรี ไม่ต้องบัตร)
- [ ] สร้าง Discord channel + **Webhook URL** สำหรับแจ้งเตือน
- [ ] รูป **QR พร้อมเพย์** (มีแล้ว) อัปขึ้น storage
- [x] **xfxai:** quota_check_url=`https://iqr.xfxai.top/`, base_url=`https://new.xfxai.top/v1`, ตัวหาร=`2.5` ✅
- [x] ราคา **gpt5.5** xfxai = ×49 (100=49 … 1000=490) ✅ · ราคา xfxai Gemini = เท่าราคาปกติ cc (100=48 … 1000=480) ✅
- [ ] เตรียมคีซ์ล็อตแรกไว้อัปเข้าคลัง

---

## 12. Prompt สำหรับ brief Claude Code (ก๊อปไปวางได้เลย)

```
ช่วยสร้างเว็บไซต์ขาย API ชื่อ "Hammie World" ตามไฟล์บรีฟแนบ (hammie-world-brief.md)

Stack: Next.js (App Router, TypeScript) + Supabase (Postgres + Auth + Storage) + Tailwind, deploy Vercel — ฟรีล้วน ห้ามใช้บริการที่ต้องผูกบัตร

เริ่มจาก Phase 0 + Phase 1 ในบรีฟ:
1. ตั้งโปรเจกต์ + Tailwind + โครงโฟลเดอร์
2. สร้าง Supabase schema ตาม §4 ทั้งหมด (เขียนเป็น SQL migration) + เปิด RLS ตาม §9
3. เขียนสคริปต์ migrate อ่าน hammie-backup__5_.json เข้า DB ตาม §5
4. ยกธีมแฮมเตอร์พาสเทลจาก index.html เดิม (assets, สี, ฟอนต์) มาเป็น design tokens/คอมโพเนนต์
5. ทำ flow ซื้อ→QR→อัปสลิป→แอดมินอนุมัติ→จ่ายคีซ์ ตาม §7 (ตรรกะราคา/สต็อก/แต้ม ฝั่ง server ตาม §6, transaction ตอนหยิบคีซ์)
6. Discord webhook แจ้งเตือนออเดอร์ใหม่
7. หน้า public/customer/admin ตาม §8

ทำทีละขั้น ถามยืนยันก่อนรันคำสั่งที่กระทบ DB/ลบไฟล์ และอย่าฝัง secret/รหัสผ่านในโค้ด ใช้ .env
ข้อสมมติใน §0 ถ้าไม่แน่ใจให้ถามก่อน
```

> วางไฟล์ `hammie-world-brief.md`, `hammie-backup__5_.json`, และ `index.html` (ของเดิม) ไว้ในโฟลเดอร์โปรเจกต์ก่อนสั่ง Claude Code จะได้อ้างอิงได้ครบ
