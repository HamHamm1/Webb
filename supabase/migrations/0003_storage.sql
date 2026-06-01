-- ════════════════════════════════════════════════════════════════
-- Hammie World — storage bucket for payment slips
-- ════════════════════════════════════════════════════════════════

-- Private bucket: slips are uploaded by customers, read by admins.
insert into storage.buckets (id, name, public)
values ('slips', 'slips', false)
on conflict (id) do nothing;

-- Customers may upload (insert) slip objects.
drop policy if exists "slips_insert" on storage.objects;
create policy "slips_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'slips');

-- Owners and admins may read their slips. Admins read all.
drop policy if exists "slips_read" on storage.objects;
create policy "slips_read" on storage.objects for select to authenticated
  using (bucket_id = 'slips' and (owner = auth.uid() or is_admin()));
