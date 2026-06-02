-- ════════════════════════════════════════════════════════════════
-- Hammie World — seed ส่วนที่ 3/3 : orders + ตั้งค่าร้าน + ประกาศ
-- ════════════════════════════════════════════════════════════════
-- orders (offline, approved) — link to customer by code
insert into orders (id,customer_id,code,source,messages,amount_baht,status,approved_at)
select d.id,c.id,d.code,'offline',d.messages,d.amount,'approved',d.dt
from (values
  ('39016c66-3183-fad0-c2da-724688c4b51f'::uuid,'ลำไยไหลำ',500,200,'2026-06-01'::timestamptz),
  ('6f0c2059-514a-124e-d81e-8ddb0f79b9aa'::uuid,'BOMNAJA0',200,96,'2026-06-01'::timestamptz),
  ('a03fe52d-f4cf-a348-1cd5-3cc6acef187e'::uuid,'ผีเสื้อสุดเบียว',1200,480,'2026-06-01'::timestamptz),
  ('350537ed-98af-a9ef-8241-8ec575f2f9a9'::uuid,'มาจากุ้ก',200,80,'2026-06-01'::timestamptz),
  ('9ebbe7b1-aadd-ca4e-85cc-1b00d3b0a06f'::uuid,'เฉียน',100,40,'2026-05-31'::timestamptz),
  ('21203e47-27c9-79ce-7492-210104b6d1ca'::uuid,'ปลาทอง',100,40,'2026-05-31'::timestamptz),
  ('83c9f00e-4089-d2b4-7596-79939468132a'::uuid,'คุณแชมเปญ',1100,400,'2026-05-31'::timestamptz),
  ('100701f3-196e-4062-742c-b3dfa57af076'::uuid,'MUAY API.คุณมุ',100,40,'2026-05-31'::timestamptz),
  ('e258e545-6a16-0561-80bb-ba235bec375c'::uuid,'เฉียน',100,40,'2026-05-30'::timestamptz),
  ('0cb6d45c-570a-4828-6b13-ed2221ab966c'::uuid,'ปลาทอง',100,40,'2026-05-30'::timestamptz),
  ('a12396ab-e52e-042e-7885-6a901864fa32'::uuid,'NONGNOK',50,20,'2026-05-29'::timestamptz),
  ('baa82c83-2ce4-b55e-a34b-7c4c7fdc8f21'::uuid,'NONGNOK',100,40,'2026-05-29'::timestamptz)
) as d(id,code,messages,amount,dt)
left join customers c on c.code = d.code
on conflict do nothing;

-- store_settings (singleton id=1)
insert into store_settings (
  id,name,subtitle,description,discord_link,discord_user,footer,bank_text,
  hours_open,hours_close,hours_days,assets,status) values (
  1,
  'Hammie World',
  'Gemini 3.1 Pro API Store',
  'ร้านขาย API Gemini 3.1 Pro แบบ อัปเดตไว พร้อมดูแลลูกค้าตลอดเลยค่า',
  'https://discord.gg/bdhHahn8NF',
  'muumook',
  'Hammie World — ขายเอาสังคม ตามประสาคนขี้เหงา ขอบคุณที่มาอุดหนุนน้า',
  'SCB 427-202933-9 / น.ส.ชลณิชา เข็มทอง (พร้อมเพย์)',
  '06:00',
  '05:00',
  '[0,1,2,3,4,5,6]'::jsonb,
  '{"background":"https://i.postimg.cc/MTKZ17W4/file-000000009d80720b818b68e5d564be4d.png","banner":"https://i.postimg.cc/xdgnjXvY/file-00000000584c71fab0497f0de7069467.png","cover":"https://i.postimg.cc/9F5CM5Ss/file-000000006d7471f8bf4a536a3608bb4b.png","hero":"https://i.postimg.cc/pV9LrBLg/Untitled153-20260507234246.png","logo":"https://i.postimg.cc/JhgS2jCD/TA-2026-04-21-15-24-19-(artist-ma-1579392565-0.png","nav_about":"https://i.postimg.cc/ht89wnWq/file-00000000c19c7230933eed46543ff9e1.png","nav_contact":"https://i.postimg.cc/85xJcXQb/file-00000000a4a87230bbd5c1f693b6a651.png","nav_customer":"https://i.postimg.cc/RZ1c8m5x/file-000000003adc7230a010c7a14e884c6f.png","nav_home":"https://i.postimg.cc/L635F8XY/file-00000000b2e07230b41c7ec0f917b005.png","nav_prices":"https://i.postimg.cc/ZRXBnstF/file-0000000027707230a31a99be61a9042a.png","nav_promotion":"https://i.postimg.cc/htQY7fdS/file-0000000005a47230a1f9a48411b2b0e4.png","nav_rank":"https://i.postimg.cc/3Rz4Nf5B/file-00000000bef87230b835f214818a6e3c.png","profile":"https://i.postimg.cc/q7MkTsFm/4822.jpg"}'::jsonb,
  '{"announce":"เปิดรับออเดอร์ปกติค่า","model":"Gemini 3.1 Pro","queue":"ไม่มีคิว","speed":"เร็วลื่นปรื๊ด","stock":"พร้อมขายจ้า"}'::jsonb)
on conflict do nothing;

-- announcements
insert into announcements (id,title,body,type,pinned,date) values ('07777470-d40e-a516-8bd1-753fe668cfec'::uuid,'ยินดีต้อนรับสู่ Hammie World','สวัสดีค่าทุกคนน แฮมแฮมเปิดร้านขาย API Gemini 3.1 Pro แล้วน้าาา พร้อมดูแลตลอดเลยคั้บ','news',true,'2026-05-30') on conflict do nothing;
