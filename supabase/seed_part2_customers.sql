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
