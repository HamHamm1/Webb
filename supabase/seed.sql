-- ════════════════════════════════════════════════════════════════
-- Hammie World — data seed (generated, idempotent). Run AFTER 0001-0003.
-- Generated: 2026-06-02T02:42:53.012Z  ·  auth domain: hammie.local
-- ════════════════════════════════════════════════════════════════

-- ranks
insert into ranks (
  id,
  name,
  description,
  icon_url,
  default_icon,
  sort
) values (
  'eee3c163-0277-4131-9842-b885e5710dcd',
  'แฮมเต๋อตัวจิ๋ว',
  'ครอบครัวแฮมอ้วน',
  'https://i.postimg.cc/FHh2w9d7/file-00000000e4087230b33dca91188ea489.png',
  'flower',
  0
) on conflict do nothing;
insert into ranks (
  id,
  name,
  description,
  icon_url,
  default_icon,
  sort
) values (
  'c869a87d-7d25-4306-9932-ea7a41fd8e88',
  'แฮมเต๋อตัวเบิ้ม',
  'ยอดสั่งซื้อ 480 บาทขึ้นไป',
  'https://i.postimg.cc/CxwW9FB5/Screenshot-20260529-235619-Chat-GPT.jpg',
  'heart',
  1
) on conflict do nothing;
insert into ranks (
  id,
  name,
  description,
  icon_url,
  default_icon,
  sort
) values (
  'e16acfb0-1208-42fc-afc5-f7a8a06d04c5',
  'ติดปีกแก้มตุ่ย',
  'คนบูสต์เซิร์ฟเวอร์ดิสของแฮม (ทุกคำสั่งซื้อ + 5 ข้อความ)',
  'https://i.postimg.cc/qvp9Wkhh/Screenshot-20260529-235627-Chat-GPT.jpg',
  'star',
  2
) on conflict do nothing;
insert into ranks (
  id,
  name,
  description,
  icon_url,
  default_icon,
  sort
) values (
  '898ecadd-3b0f-47c8-a094-763bdfe27bd8',
  'คนเก่งของแฮม',
  'มีบอทในดิส 2 บอทขึ้นไป',
  'https://i.postimg.cc/cLdVPsgH/Screenshot-20260529-235634-Chat-GPT.jpg',
  'crown',
  3
) on conflict do nothing;

-- providers
insert into providers (
  id,
  name,
  display_name,
  divisor,
  quota_check_url,
  base_url,
  highlight_tag,
  has_rank_pricing,
  sort,
  is_active
) values
(
  '453a0ccf-405d-4349-b7e7-ee2f444f009c',
  'cc',
  'CC (gemai)',
  5,
  'https://key.gemai.cc/',
  'https://api.gemai.cc/v1',
  'มีโปรลดตามยศ • เสถียร',
  true,
  0,
  true
),
(
  'bc2d2437-b817-44b4-b38f-d7874f7b7949',
  'xfxai',
  'xfxai',
  2.5,
  'https://iqr.xfxai.top/',
  'https://new.xfxai.top/v1',
  'มี GPT 5.5 • ทางเลือกสำรอง',
  false,
  1,
  true
)
on conflict do nothing;

-- models
insert into models (
  id,
  name,
  description,
  sort
) values
(
  '9c3d981a-712a-4366-9d77-d1bd4431d0ba',
  'Gemini 3.1 Pro',
  'โมเดลหลัก',
  0
),
(
  'cb372efa-1c74-4985-aa5e-2ed93719ed68',
  'GPT 5.5',
  'ทางเลือกบน xfxai',
  1
)
on conflict do nothing;

-- provider_models
insert into provider_models (
  id,
  provider_id,
  model_id,
  status,
  is_active
) values
(
  '6f80d7c1-9aff-4ea1-9aa9-b2d606749c73',
  '453a0ccf-405d-4349-b7e7-ee2f444f009c',
  '9c3d981a-712a-4366-9d77-d1bd4431d0ba',
  'ok',
  true
),
(
  'e2e9db21-1578-41ad-ae12-4667873677f8',
  'bc2d2437-b817-44b4-b38f-d7874f7b7949',
  '9c3d981a-712a-4366-9d77-d1bd4431d0ba',
  'ok',
  true
),
(
  '27af984f-a88f-46e6-97df-21a2e797fb70',
  'bc2d2437-b817-44b4-b38f-d7874f7b7949',
  'cb372efa-1c74-4985-aa5e-2ed93719ed68',
  'ok',
  true
)
on conflict do nothing;

-- bundles: cc × Gemini (std prices)
insert into bundles (
  id,
  provider_model_id,
  messages,
  price_default,
  bonus_note,
  featured,
  is_active
) values
(
  'f1414d8a-dd79-45a7-9036-ec7ae72d6ce1',
  '6f80d7c1-9aff-4ea1-9aa9-b2d606749c73',
  100,
  48,
  'แจ้งว่าเป็นยศติดปีก + 5 ข้อความอัตโนมัติ',
  false,
  true
),
(
  '66d11825-f2fd-4173-88d1-0428e2945952',
  '6f80d7c1-9aff-4ea1-9aa9-b2d606749c73',
  200,
  96,
  'แจ้งว่าเป็นยศติดปีก + 5 ข้อความอัตโนมัติ',
  false,
  true
),
(
  'c3ded06a-7d05-459b-affc-c88fb59a0369',
  '6f80d7c1-9aff-4ea1-9aa9-b2d606749c73',
  300,
  144,
  'แจ้งว่าเป็นยศติดปีก + 5 ข้อความอัตโนมัติ',
  false,
  true
),
(
  '391582a7-f0fe-4431-83eb-17ee1420b591',
  '6f80d7c1-9aff-4ea1-9aa9-b2d606749c73',
  400,
  192,
  'แจ้งว่าเป็นยศติดปีก + 5 ข้อความอัตโนมัติ',
  false,
  true
),
(
  '4f06bd33-8c82-4a04-b572-3c125296cd2d',
  '6f80d7c1-9aff-4ea1-9aa9-b2d606749c73',
  500,
  240,
  'แจ้งว่าเป็นยศติดปีก + 5 ข้อความอัตโนมัติ',
  false,
  true
),
(
  '4ebd7b4d-0007-4f4d-bd4b-2c67bd4aed56',
  '6f80d7c1-9aff-4ea1-9aa9-b2d606749c73',
  600,
  288,
  'แจ้งว่าเป็นยศติดปีก + 5 ข้อความอัตโนมัติ',
  false,
  true
),
(
  'e899ca70-b2af-4f79-8d99-3aa7ac314e2d',
  '6f80d7c1-9aff-4ea1-9aa9-b2d606749c73',
  700,
  336,
  'แจ้งว่าเป็นยศติดปีก + 5 ข้อความอัตโนมัติ',
  false,
  true
),
(
  'cfa84a6f-c377-44c3-8547-c819c5d51fea',
  '6f80d7c1-9aff-4ea1-9aa9-b2d606749c73',
  800,
  384,
  'แจ้งว่าเป็นยศติดปีก + 5 ข้อความอัตโนมัติ',
  false,
  true
),
(
  'c193034a-38c7-4db7-80b0-80ef16dffbd5',
  '6f80d7c1-9aff-4ea1-9aa9-b2d606749c73',
  900,
  432,
  'แจ้งว่าเป็นยศติดปีก + 5 ข้อความอัตโนมัติ',
  false,
  true
),
(
  '418cb889-bc25-49c1-b971-b7650c588a61',
  '6f80d7c1-9aff-4ea1-9aa9-b2d606749c73',
  1000,
  480,
  'แถมฟรี +200 ข้อความ (ติดปีก + 10 ข้อความ)',
  true,
  true
)
on conflict do nothing;

-- bundles: xfxai × Gemini (copy cc default)
insert into bundles (
  id,
  provider_model_id,
  messages,
  price_default,
  featured,
  is_active
) values
(
  '368033bf-d57b-490a-9d92-2e297396a2a0',
  'e2e9db21-1578-41ad-ae12-4667873677f8',
  100,
  48,
  false,
  true
),
(
  '55188d82-07f8-440f-b873-7ab3ba3b7bef',
  'e2e9db21-1578-41ad-ae12-4667873677f8',
  200,
  96,
  false,
  true
),
(
  '2c128470-9268-44c0-adae-65ab2c1013b8',
  'e2e9db21-1578-41ad-ae12-4667873677f8',
  300,
  144,
  false,
  true
),
(
  'c7690395-7e95-4a3b-86dc-ae57f3175ee0',
  'e2e9db21-1578-41ad-ae12-4667873677f8',
  400,
  192,
  false,
  true
),
(
  '8038e430-6fd8-4e86-a546-0eba0700bbaf',
  'e2e9db21-1578-41ad-ae12-4667873677f8',
  500,
  240,
  false,
  true
),
(
  'ef202276-fe9e-48ad-a02d-c5a4dceaba92',
  'e2e9db21-1578-41ad-ae12-4667873677f8',
  600,
  288,
  false,
  true
),
(
  '857cb38d-f6db-4449-b130-a1ef0c899eb8',
  'e2e9db21-1578-41ad-ae12-4667873677f8',
  700,
  336,
  false,
  true
),
(
  'c3555e9d-83f8-4b92-9f87-2642850d4d71',
  'e2e9db21-1578-41ad-ae12-4667873677f8',
  800,
  384,
  false,
  true
),
(
  '99f841b1-7546-42a8-8b30-c226e6153849',
  'e2e9db21-1578-41ad-ae12-4667873677f8',
  900,
  432,
  false,
  true
),
(
  'f832ee41-7eb4-47df-854b-cb1ebc4cc8e7',
  'e2e9db21-1578-41ad-ae12-4667873677f8',
  1000,
  480,
  true,
  true
)
on conflict do nothing;

-- bundles: xfxai × GPT 5.5 (×49)
insert into bundles (
  id,
  provider_model_id,
  messages,
  price_default,
  featured,
  is_active
) values
(
  'd864a8cd-1ff8-4509-b2f0-0cb273ace4e1',
  '27af984f-a88f-46e6-97df-21a2e797fb70',
  100,
  49,
  false,
  true
),
(
  '71186cdf-46c4-464f-9887-cf7f7acafd6d',
  '27af984f-a88f-46e6-97df-21a2e797fb70',
  200,
  98,
  false,
  true
),
(
  'ba67ee9c-80e0-4517-a962-13ceb0732523',
  '27af984f-a88f-46e6-97df-21a2e797fb70',
  300,
  147,
  false,
  true
),
(
  'ab27b7d1-6e02-4a7e-bc8a-dd09ae710b1d',
  '27af984f-a88f-46e6-97df-21a2e797fb70',
  400,
  196,
  false,
  true
),
(
  '3c00456c-bfe7-4c58-92f2-dc3b70e5e4ac',
  '27af984f-a88f-46e6-97df-21a2e797fb70',
  500,
  245,
  false,
  true
),
(
  '5756fb7f-6308-4dca-945f-0864a79b015b',
  '27af984f-a88f-46e6-97df-21a2e797fb70',
  600,
  294,
  false,
  true
),
(
  '869205e5-0f8b-4377-ad1b-eb9dbf362758',
  '27af984f-a88f-46e6-97df-21a2e797fb70',
  700,
  343,
  false,
  true
),
(
  'bb5419e6-d166-4e2b-9c83-de7521cfa82a',
  '27af984f-a88f-46e6-97df-21a2e797fb70',
  800,
  392,
  false,
  true
),
(
  '4d334451-fb1c-40fb-bfb9-89e2a51e08f8',
  '27af984f-a88f-46e6-97df-21a2e797fb70',
  900,
  441,
  false,
  true
),
(
  '4c3cbc09-6ea1-416b-82f9-a2a8e510c69d',
  '27af984f-a88f-46e6-97df-21a2e797fb70',
  1000,
  490,
  true,
  true
)
on conflict do nothing;

-- bundle_rank_prices (cc × Gemini)
insert into bundle_rank_prices (
  id,
  bundle_id,
  rank_id,
  price
) values
(
  '484e7114-07a5-409c-9457-36b539a29611',
  'f1414d8a-dd79-45a7-9036-ec7ae72d6ce1',
  'c869a87d-7d25-4306-9932-ea7a41fd8e88',
  39
),
(
  'e0acbb83-1ed4-4b82-8418-03ea0d99ebe4',
  '66d11825-f2fd-4173-88d1-0428e2945952',
  'c869a87d-7d25-4306-9932-ea7a41fd8e88',
  78
),
(
  '1942a939-30c1-4a74-8d09-619e0e3c0881',
  'c3ded06a-7d05-459b-affc-c88fb59a0369',
  'c869a87d-7d25-4306-9932-ea7a41fd8e88',
  117
),
(
  '21b3c547-fc1a-42d2-b3f5-428fad506470',
  '391582a7-f0fe-4431-83eb-17ee1420b591',
  'c869a87d-7d25-4306-9932-ea7a41fd8e88',
  156
),
(
  '97472398-05a4-42bf-a01b-c93901839b93',
  '4f06bd33-8c82-4a04-b572-3c125296cd2d',
  'c869a87d-7d25-4306-9932-ea7a41fd8e88',
  195
),
(
  '97416a7c-4c80-4401-b81b-f8fb3d337e9e',
  '4ebd7b4d-0007-4f4d-bd4b-2c67bd4aed56',
  'c869a87d-7d25-4306-9932-ea7a41fd8e88',
  234
),
(
  'b2676449-50fc-45d9-865d-cd143e7f5d0c',
  'e899ca70-b2af-4f79-8d99-3aa7ac314e2d',
  'c869a87d-7d25-4306-9932-ea7a41fd8e88',
  273
),
(
  'e6e4b094-565f-40af-8fe7-cfb2449ade40',
  'cfa84a6f-c377-44c3-8547-c819c5d51fea',
  'c869a87d-7d25-4306-9932-ea7a41fd8e88',
  312
),
(
  'fdded7ad-d8a9-465f-9b1c-b79d1bb776e0',
  'c193034a-38c7-4db7-80b0-80ef16dffbd5',
  'c869a87d-7d25-4306-9932-ea7a41fd8e88',
  351
),
(
  'b809d374-f1eb-411a-bf16-66e108e05150',
  '418cb889-bc25-49c1-b971-b7650c588a61',
  'c869a87d-7d25-4306-9932-ea7a41fd8e88',
  390
),
(
  '66d2a712-2093-4d10-8232-1c74a1ca1443',
  'f1414d8a-dd79-45a7-9036-ec7ae72d6ce1',
  '898ecadd-3b0f-47c8-a094-763bdfe27bd8',
  45
),
(
  '608f7bff-8ea0-4523-9c9d-e7ba4a8196a0',
  '66d11825-f2fd-4173-88d1-0428e2945952',
  '898ecadd-3b0f-47c8-a094-763bdfe27bd8',
  90
),
(
  '199eb7d9-d385-4a05-aec6-7b54b0668dfe',
  'c3ded06a-7d05-459b-affc-c88fb59a0369',
  '898ecadd-3b0f-47c8-a094-763bdfe27bd8',
  135
),
(
  '4566325c-8394-403e-b870-564a57d5cd34',
  '391582a7-f0fe-4431-83eb-17ee1420b591',
  '898ecadd-3b0f-47c8-a094-763bdfe27bd8',
  180
),
(
  'eefc2367-b139-4e62-8b22-edec1a6b18a5',
  '4f06bd33-8c82-4a04-b572-3c125296cd2d',
  '898ecadd-3b0f-47c8-a094-763bdfe27bd8',
  225
),
(
  '8d85ff59-32cd-48b9-9215-3507165de8bb',
  '4ebd7b4d-0007-4f4d-bd4b-2c67bd4aed56',
  '898ecadd-3b0f-47c8-a094-763bdfe27bd8',
  270
),
(
  'ed865e5d-1eb4-45de-9620-41817ed29d14',
  'e899ca70-b2af-4f79-8d99-3aa7ac314e2d',
  '898ecadd-3b0f-47c8-a094-763bdfe27bd8',
  315
),
(
  '04ecebe0-b68e-4638-b7b1-513c92d766b3',
  'cfa84a6f-c377-44c3-8547-c819c5d51fea',
  '898ecadd-3b0f-47c8-a094-763bdfe27bd8',
  360
),
(
  '67936557-b273-4099-8af0-6378e5010514',
  'c193034a-38c7-4db7-80b0-80ef16dffbd5',
  '898ecadd-3b0f-47c8-a094-763bdfe27bd8',
  405
),
(
  'efe3536b-aff9-490b-9978-abdc81c27307',
  '418cb889-bc25-49c1-b971-b7650c588a61',
  '898ecadd-3b0f-47c8-a094-763bdfe27bd8',
  450
)
on conflict do nothing;


-- ════════════════════════════════════════════════════════════════
-- Hammie World — seed ส่วนที่ 2/3 : ลูกค้า + แอดมิน (รันหลังส่วนที่ 1)
-- ════════════════════════════════════════════════════════════════
create temp table _seed (
  uid uuid, email text, pass_hash text, code text, display_name text,
  rank_name text, points int, baht numeric, is_admin boolean, notes text
);
insert into _seed (uid,email,pass_hash,code,display_name,rank_name,points,baht,is_admin,notes) values
  ('439a71a8-ba8c-4a3c-8338-b22e62c54e05'::uuid,'user-1l9xxsj@hammie.local','$2b$10$Q2ClZtWJWWX03PuZf3KNvuN4zTyhxeHz4dFA3eOdsM/nBrxcxmjp2','อันดา','อันดา','แฮมเต๋อตัวจิ๋ว',0,0,false,'ขอบคุณนะคะ ＼(^-^)／'),
  ('bbf815e8-c4d0-4c89-bbbd-898eed90daee'::uuid,'user-25mdw@hammie.local','$2b$10$4zGDOZsbJLv6eir3HV3qguHr.yK3Pzdt5UZvT3lSSUwX8oBTG4lXG','แคท','1 แคท','แฮมเต๋อตัวเบิ้ม',0,0,false,'ขอบคุณมากๆเลยนะคะ (*^^*)'),
  ('615fd0a1-f29b-4101-ae68-214499977888'::uuid,'user-1t8zpe2@hammie.local','$2b$10$ODR06cHZHzveAw7x9gxDjO5tAZWUR3gpnh3q/0COufX.kdBwRZSF6','มุมินน','2 มุมินน','แฮมเต๋อตัวเบิ้ม',0,0,false,'ขอบคุณมากๆเลยนะคะ (^-^)/'),
  ('b66ec0d6-8a6f-4e77-9359-57a4b2b92a41'::uuid,'user-8f7xv0@hammie.local','$2b$10$z/55CwLGSK5nFAUuCFLrtu4RawlFOmB/2rD9l9joq1F1F.WFVXZnO','เนมมี่','3 เนมมี่','แฮมเต๋อตัวจิ๋ว',0,0,false,'ขอบคุณมากๆเลยนะคะ (⌒0⌒)／~~'),
  ('7ef37138-61d1-477a-9a3b-418eb996e5af'::uuid,'muay-api-1caujaa@hammie.local','$2b$10$8sAd8epOxFnjeeF4JWfCnu/T5vkFqGyYk.7YmY.unLhdAfketoH4O','MUAY API.คุณมุ','4 คุณหมวย','แฮมเต๋อตัวจิ๋ว',1,40,false,'ขอบคุณมากๆเลยนะคะ ( ≧∀≦)ノ'),
  ('72ed42c0-aabe-4121-abdf-619aad9e3151'::uuid,'kj990-16l175@hammie.local','$2b$10$Z5v4rfq38xznSoLooCXZuex44ctlCoK5sjcanzFjItajf4jknbJEu','KJ990','5 kj990','แฮมเต๋อตัวจิ๋ว',0,0,false,'ขอบคุณมากๆเลยนะคะ ( ＾ω＾ )'),
  ('c2b8c87c-e03d-4885-96fe-478c213178da'::uuid,'kazer-16fz3l@hammie.local','$2b$10$XNL5fBBM5OwWcskm0h4YDOQ5vbySzUWyI4zyPELf/InpPYQhPy73y','KAZER','6 kazer','แฮมเต๋อตัวจิ๋ว',0,0,false,'ขอบคุณมากๆเลยนะคะ ( ☆∀☆)'),
  ('370a1e49-3b26-4e40-926a-053188f18ac3'::uuid,'user-1q4k5hl@hammie.local','$2b$10$QdN4mQeruvztTBwteN.ayuJI13CuCIUO7J43wGTV1dnBywUA78zny','ปลาทอง','7 ปลาทอง','แฮมเต๋อตัวจิ๋ว',2,80,false,'ขอบคุณมากๆเลยนะคะ d=(^o^)=b'),
  ('304e2ab3-a748-448a-9476-fa07c10dd710'::uuid,'user-1uk4yzd@hammie.local','$2b$10$o4I9eRsxEKbp/rmzkbXTBe5BD0C7HZ4FweqCtNLWosKHfnGG8CpUq','แมวชมพู','8 แมวชมพู','แฮมเต๋อตัวเบิ้ม',0,0,false,'ขอบคุณมากๆเลยนะคะ ( 〃▽〃)'),
  ('07b19830-7ae3-4a5a-ad72-c6afa7f27cf1'::uuid,'user-1vea0xt@hammie.local','$2b$10$gNVPF5wfq8uGYxEEX0.xIuB49gCK.CNRzvdA/kBw176jD33zU67rS','ล่าแบ้','9 ล่าแบ้','แฮมเต๋อตัวเบิ้ม',0,0,false,'ขอบคุณมากๆเลยนะคะ ( ﾉ^ω^)ﾉ'),
  ('d7a15acc-8e0e-4b5d-95dc-2311a2181a4c'::uuid,'user-1ows7ie@hammie.local','$2b$10$sXGNwKc9ZPX5JlyDQqG6GuxLG1VLheq/bgSKcuro0FqBsD29kuXFW','ซัน ซัน','10 ซัน ซัน','แฮมเต๋อตัวจิ๋ว',0,0,false,'ขอบคุณมากๆเลยนะคะ ( 〃▽〃)'),
  ('bf40ac93-538b-4738-8d46-ae266dd723e0'::uuid,'user-1ljp2o3@hammie.local','$2b$10$8HVExBh3M5YEh0F2cYwb2eyM6Oa98WJYtFWVTtDcKtNpqL9dBTqRC','เฉียน','11 เฉียน','แฮมเต๋อตัวจิ๋ว',2,80,false,'ขอบคุณมากๆเลยนะคะ (*/∀＼*)'),
  ('575f3eb1-22f9-47b9-878e-53a62f12e506'::uuid,'user-1of3oel@hammie.local','$2b$10$ztWaFMclCpKlTDz1Fybq0uC0EdyILcSarNxRS981EcxKogW4H/K1W','ทานุกิ','12 ทานุกิ','แฮมเต๋อตัวจิ๋ว',0,0,false,'ขอบคุณมากๆเลยนะคะ (*ゝω･*)'),
  ('f9475768-7a77-43d2-81e6-834219a70622'::uuid,'user-16yplgh@hammie.local','$2b$10$nMKWdtRKs4rexZMZ2K1dcebyhJIDboe8HD/MWF5LiSxQvBbTIQsSC','ลำไยไหลำ','13 ลำไยไหลำ','แฮมเต๋อตัวจิ๋ว',5,200,false,'ขอบคุณมากๆเลยนะคะ ( =＾ω＾)'),
  ('54d27133-cdbb-4414-8d9e-5f7d3c2828ae'::uuid,'user-quyf4a@hammie.local','$2b$10$iakyMQfHZKoPy1DPZG98hODxzc0Y/1AbcBrt7RAgFn810oY5qVGnG','มาจากุ้ก','14 มาจากุ้ก','แฮมเต๋อตัวเบิ้ม',2,80,false,'ขอบคุณมากๆเลยนะคะ (*^-^*)'),
  ('0b015baf-86d5-4e41-92ef-7b17d91e8a7a'::uuid,'user-9yw18i@hammie.local','$2b$10$lXMztwyV2gkN7pSAGj2Ho.wKG6pWP.dDElcgIDUEFh/gErrdrxE0G','ไก่ต้ม','15 ไก่ต้ม','แฮมเต๋อตัวจิ๋ว',0,0,false,'ขอบคุณมากๆเลยนะคะ (*´∀`)♪'),
  ('6cca5f3e-a80e-4550-837d-24c5a75fa7b1'::uuid,'user-1xvgpu2@hammie.local','$2b$10$Oj9FCLumsvhHoCepDTkD7eIgoA.evWsVuoZXSb0xhprHzaefpB2bW','ร้ากไพน่อน','16 ร้ากไพน่อน','แฮมเต๋อตัวเบิ้ม',0,0,false,'ขอบคุณมากๆเลยนะคะ (^-^)/'),
  ('8dcea748-4835-441e-befe-3b3340715fff'::uuid,'user-jiqm4c@hammie.local','$2b$10$hXHptysEiItrJbxXUcWUAODil/PSYAXwsuszxqE6JcTvaY17P1lOe','บูบูกาก่า','17 บูบูกาก่า','แฮมเต๋อตัวจิ๋ว',0,0,false,'ขอบคุณมากๆเลยนะคะ (*^▽^)/★*☆♪'),
  ('08364e4f-98ad-447d-a5a1-9a5e0988b065'::uuid,'user-9lyecu@hammie.local','$2b$10$3TbuLBYl7gpCIc/KGh/99eNl3lBDISKqf5SwPnMyvM7K7CHTSIPfS','รักแมวส้ม','18 รักแมวส้ม','แฮมเต๋อตัวจิ๋ว',0,0,false,'ขอบคุณมากๆเลยนะคะ(⌒‐⌒)'),
  ('1c8ed910-4038-43ef-aa1b-68b68647005b'::uuid,'user-24yc2@hammie.local','$2b$10$ns.xEYXnvouwIY/C3HJJeO3sn.lHAkBkgRdwzBj.lOUclBGusED52','ฟิว','19 ฟิว','แฮมเต๋อตัวจิ๋ว',0,0,false,'ขอบคุณมากๆเลยนะคะ ( 〃▽〃)'),
  ('2c025e5c-ac5c-4cdc-b6d9-fe5d89954643'::uuid,'nongnok-1azwd2o@hammie.local','$2b$10$XKBhEO0vGspHTfYsrsFv1e5ZgDU45SKpH2gc2AsfzZvr6BgReqQJ2','NONGNOK','20 nongnok','แฮมเต๋อตัวจิ๋ว',1,60,false,'ขอบคุณมากๆเลยนะคะ (*^^*)'),
  ('18a65f21-984c-48aa-8a33-6eae74bdb707'::uuid,'user-1ub0q8@hammie.local','$2b$10$G6Oq.dVJwG5Y0C7t/1rn/.VkmPKrJAZIMNyarj5/a0bZ6zpho67oW','มูมู','21 มูมู','แฮมเต๋อตัวจิ๋ว',0,0,false,'ขอบคุณมากๆเลยนะคะ (⌒‐⌒)'),
  ('44bee467-0e53-487a-a12a-9db8622a50dd'::uuid,'kira-1dg5p@hammie.local','$2b$10$sgDRky5uIFbhRaguPWdZsOVDZ4UxxDLeUGfmh1rcxRat0b0vrYmIW','KIRA','22 Kira','แฮมเต๋อตัวจิ๋ว',0,0,false,'ขอบคุณมากๆเลยนะคะ ( ≧∀≦)ノ'),
  ('456a08fa-6d81-41c7-9fd5-0de34bc83f5d'::uuid,'jongyue-1nbfigb@hammie.local','$2b$10$vLuPbkD0fEVhrZKGQQ/tT.yq8tjUiviGxjDXrZ1KpC/lSKUKPT3Oa','JONGYUE','23 JongYue','แฮมเต๋อตัวจิ๋ว',0,0,false,'ขอบคุณมากๆเลยนะคะ ( ＾ω＾ )'),
  ('13bd21d9-ac3f-4286-a171-23ab6e37572f'::uuid,'user-y79jy0@hammie.local','$2b$10$oJQfgRQECa7BwTSkTBWqxuiNsOkL7JaPctsTc1qVCw/cG7ZI1a/XW','คุณเกรป','24 คุณเกรป','แฮมเต๋อตัวจิ๋ว',0,0,false,'ขอบคุณมากๆเลยนะคะ (*≧з≦)'),
  ('1adfeba5-ce3e-4f86-a037-c24e3c81953d'::uuid,'user-1ga1sd5@hammie.local','$2b$10$997pAf/4KcVyeFmNEDss9uoDBfaIuexyjptS/U0EDgdZKUIEakKsq','คุณแชมเปญ','25 คุณแชมเปญ','แฮมเต๋อตัวเบิ้ม',11,400,false,'ขอบคุณมากๆเลยนะคะ (*^3(*^o^*)'),
  ('ddfd3b8f-30b6-45c3-9c93-fa2006c4e6e6'::uuid,'bomnaja0-19799ye@hammie.local','$2b$10$vhpuiWUg15GbX8YywV/EwOtcL3md8la83in7vvltD/S7lTL4v5dpy','BOMNAJA0','26 bomnaja0','แฮมเต๋อตัวเบิ้ม',2,96,false,'ขอบคุณมากๆเลยนะคะ (○´∀｀人´∀｀○)'),
  ('1a25a283-d39c-44d7-9a9d-98dd944d5ad1'::uuid,'user-1m5n836@hammie.local','$2b$10$Jvd.mnPKjrR1J7JnEd5S2u7YsD.3o7u.vGeJnlmFz7MPQYDpV5dSC','ผีเสื้อสุดเบียว','27 คุณผีเสื้อ','แฮมเต๋อตัวเบิ้ม',12,480,false,NULL),
  ('2e83c3b7-bf02-4259-a558-a1ce8df5e66f'::uuid,'admin-1j67nz@hammie.local','$2b$10$mVCA9HWyv9ksLBqqiNKdheJDgshst/m34YxcSKc.aJSKoro16GkZC','admin','แอดมินแฮม',NULL,0,0,true,NULL);

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
