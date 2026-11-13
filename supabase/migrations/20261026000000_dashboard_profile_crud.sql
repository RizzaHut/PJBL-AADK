alter table public.laporan
  add column if not exists terlapor_id uuid,
  add column if not exists judul_konten text,
  add column if not exists cuplikan_konten text,
  add column if not exists konten_dibuat_pada timestamptz;
alter table public.transaksi
  add column if not exists harga_saat_beli numeric(12, 2);
update public.transaksi t
set harga_saat_beli = p.harga
from public.produk_toko p
where t.produk_id = p.id and t.harga_saat_beli is null;
alter table public.transaksi
  alter column harga_saat_beli set not null;
alter table public.staf
  add column if not exists pfp_url text,
  add column if not exists qris_url text;
alter table public.pengajuan_teknisi
  add column if not exists jenis_bukti text not null default 'foto';
alter table public.pengajuan_teknisi
  drop constraint if exists pengajuan_teknisi_jenis_bukti_check;
alter table public.pengajuan_teknisi
  add constraint pengajuan_teknisi_jenis_bukti_check
  check (jenis_bukti in ('foto', 'video'));
create or replace function public.jaga_username_unik()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext(lower(new.username)));
  if tg_table_name = 'pengguna' then
    if exists (
      select 1 from public.staf s
      where lower(s.username) = lower(new.username) and s.id <> new.id
    ) then
      raise exception 'Username sudah dipakai' using errcode = '23505';
    end if;
  elsif exists (
    select 1 from public.pengguna p
    where lower(p.username) = lower(new.username) and p.id <> new.id
  ) then
    raise exception 'Username sudah dipakai' using errcode = '23505';
  end if;
  return new;
end;
$$;
drop trigger if exists trg_username_unik on public.pengguna;
create trigger trg_username_unik
  before insert or update of username on public.pengguna
  for each row execute function public.jaga_username_unik();
drop trigger if exists trg_username_unik on public.staf;
create trigger trg_username_unik
  before insert or update of username on public.staf
  for each row execute function public.jaga_username_unik();
create or replace function public.sinkron_username()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if pg_trigger_depth() > 1 then return null; end if;
  if tg_table_name = 'pengguna' then
    update public.staf set username = new.username
    where id = new.id and username is distinct from new.username;
  else
    update public.pengguna set username = new.username
    where id = new.id and username is distinct from new.username;
  end if;
  return null;
end;
$$;
drop trigger if exists trg_sinkron_username on public.pengguna;
create trigger trg_sinkron_username
  after update of username on public.pengguna
  for each row execute function public.sinkron_username();
drop trigger if exists trg_sinkron_username on public.staf;
create trigger trg_sinkron_username
  after update of username on public.staf
  for each row execute function public.sinkron_username();
create or replace function public.sebelum_pengguna_dihapus()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if exists (
    select 1 from public.transaksi
    where pembeli_id = old.id and status = 'payment_uploaded'
  ) then
    raise exception 'Akun punya transaksi yang menunggu konfirmasi. Selesaikan dulu sebelum menghapus akun.'
      using errcode = 'P0001';
  end if;
  update public.produk_toko
  set status = 'available'
  where id in (
    select produk_id from public.transaksi
    where pembeli_id = old.id and status = 'pending'
  );
  delete from public.transaksi where pembeli_id = old.id and status = 'pending';
  return old;
end;
$$;
drop trigger if exists trg_sebelum_pengguna_dihapus on public.pengguna;
create trigger trg_sebelum_pengguna_dihapus
  before delete on public.pengguna
  for each row execute function public.sebelum_pengguna_dihapus();
revoke execute on function public.jaga_username_unik(),
  public.sinkron_username(),
  public.sebelum_pengguna_dihapus()
from public, anon, authenticated;
create or replace function public.profil_saya()
returns setof public.pengguna
language sql stable security definer set search_path = ''
as $$
  select p.* from public.pengguna p where p.id = auth.uid();
$$;
create or replace function public.daftar_pengguna_staf()
returns setof public.pengguna
language sql stable security definer set search_path = ''
as $$
  select p.* from public.pengguna p where public.adalah_staf();
$$;
create or replace function public.kontak_toko()
returns table (nomor_whatsapp text, qris_url text)
language sql stable security definer set search_path = ''
as $$
  select s.nomor_whatsapp, s.qris_url
  from public.staf s
  where s.peran = 'super_admin'
  order by s.dibuat_pada
  limit 1;
$$;
create or replace function public.peringatan_saya()
returns table (
  id uuid,
  alasan text,
  dibuat_pada timestamptz,
  jenis_konten public.target_laporan,
  cuplikan_konten text
)
language sql stable security definer set search_path = ''
as $$
  select p.id, p.alasan, p.dibuat_pada, l.target_type, l.cuplikan_konten
  from public.peringatan p
  left join public.laporan l on l.id = p.laporan_id
  where p.pengguna_id = auth.uid()
  order by p.dibuat_pada desc;
$$;
drop function if exists public.ajukan_teknisi(text);
create or replace function public.ajukan_teknisi(p_url_bukti text, p_jenis_bukti text)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
begin
  if public.peran_pengguna_ini() is distinct from 'anggota' then
    raise exception 'Hanya anggota yang bisa mengajukan' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(79131, hashtext(auth.uid()::text));
  if p_url_bukti is null or p_url_bukti not like auth.uid()::text || '/%' then
    raise exception 'Path bukti harus berada di folder milikmu' using errcode = '22023';
  end if;
  if p_jenis_bukti is null or p_jenis_bukti not in ('foto', 'video') then
    raise exception 'Jenis bukti tidak valid' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.pengajuan_teknisi
    where pengguna_id = auth.uid() and status = 'pending'
  ) then
    raise exception 'Masih ada pengajuan yang menunggu' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.pengajuan_teknisi
    where pengguna_id = auth.uid()
      and status = 'rejected'
      and cooldown_sampai > now()
  ) then
    raise exception 'Masa tunggu pengajuan belum selesai' using errcode = 'P0001';
  end if;

  insert into public.pengajuan_teknisi (pengguna_id, url_bukti, jenis_bukti)
  values (auth.uid(), p_url_bukti, p_jenis_bukti)
  returning id into v_id;
  return v_id;
end;
$$;
create or replace function public.simpan_tutorial(
  p_id uuid,
  p_konsol_id uuid,
  p_judul text,
  p_tingkat public.tingkat_kesulitan,
  p_waktu public.estimasi_waktu,
  p_alat text[],
  p_peringatan text,
  p_langkah jsonb
)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
begin
  if public.peran_pengguna_ini() is distinct from 'teknisi' then
    raise exception 'Khusus teknisi' using errcode = '42501';
  end if;
  if nullif(btrim(p_judul), '') is null or coalesce(cardinality(p_alat), 0) = 0
    or jsonb_typeof(p_langkah) is distinct from 'array' then
    raise exception 'Data tutorial tidak lengkap' using errcode = '22023';
  end if;
  if jsonb_array_length(p_langkah) = 0 then
    raise exception 'Data tutorial tidak lengkap' using errcode = '22023';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_langkah) as langkah(value)
    where nullif(btrim(langkah.value->>'deskripsi'), '') is null
      or (
        nullif(langkah.value->>'url_gambar', '') is not null
        and langkah.value->>'url_gambar' not like auth.uid()::text || '/%'
      )
  ) then
    raise exception 'Langkah tutorial atau path gambar tidak valid' using errcode = '22023';
  end if;

  if p_id is null then
    insert into public.tutorial (
      konsol_id, penulis_id, judul, tingkat_kesulitan, estimasi_waktu, item, konten_peringatan
    )
    values (
      p_konsol_id, auth.uid(), btrim(p_judul), p_tingkat, p_waktu, p_alat, nullif(btrim(p_peringatan), '')
    )
    returning id into v_id;
  else
    update public.tutorial
    set konsol_id = p_konsol_id,
        judul = btrim(p_judul),
        tingkat_kesulitan = p_tingkat,
        estimasi_waktu = p_waktu,
        item = p_alat,
        konten_peringatan = nullif(btrim(p_peringatan), '')
    where id = p_id and penulis_id = auth.uid()
    returning id into v_id;
    if v_id is null then
      raise exception 'Tutorial tidak ditemukan' using errcode = 'P0002';
    end if;
    delete from public.langkah_tutorial where tutorial_id = v_id;
  end if;

  insert into public.langkah_tutorial (tutorial_id, nomor_langkah, deskripsi, url_gambar)
  select v_id, (langkah.ordinality)::integer, btrim(langkah.value->>'deskripsi'),
         nullif(langkah.value->>'url_gambar', '')
  from jsonb_array_elements(p_langkah) with ordinality as langkah(value, ordinality);
  return v_id;
end;
$$;
create or replace function public.setujui_pengajuan(p_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_user uuid;
begin
  if not public.adalah_staf() then
    raise exception 'Khusus staf' using errcode = '42501';
  end if;

  update public.pengajuan_teknisi
  set status = 'approved', ditinjau_oleh = auth.uid(), ditinjau_pada = now()
  where id = p_id and status = 'pending'
  returning pengguna_id into v_user;
  if v_user is null then
    raise exception 'Pengajuan tidak ditemukan atau sudah diputuskan' using errcode = 'P0002';
  end if;

  update public.pengguna set peran = 'teknisi'
  where id = v_user and peran = 'anggota';
end;
$$;
create or replace function public.tolak_pengajuan(p_id uuid, p_alasan text)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.adalah_staf() then
    raise exception 'Khusus staf' using errcode = '42501';
  end if;
  if nullif(btrim(p_alasan), '') is null then
    raise exception 'Alasan penolakan wajib diisi' using errcode = '22023';
  end if;

  update public.pengajuan_teknisi
  set status = 'rejected',
      alasan_penolakan = btrim(p_alasan),
      ditinjau_oleh = auth.uid(),
      ditinjau_pada = now(),
      cooldown_sampai = now() + interval '30 days'
  where id = p_id and status = 'pending';
  if not found then
    raise exception 'Pengajuan tidak ditemukan atau sudah diputuskan' using errcode = 'P0002';
  end if;
end;
$$;
create or replace function public.buat_laporan(
  p_target public.target_laporan,
  p_target_id uuid,
  p_alasan text
)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_penulis uuid;
  v_judul text;
  v_isi text;
  v_dibuat timestamptz;
  v_id uuid;
begin
  if public.peran_pengguna_ini() is null then
    raise exception 'Harus masuk sebagai pengguna' using errcode = '42501';
  end if;
  if nullif(btrim(p_alasan), '') is null then
    raise exception 'Alasan wajib diisi' using errcode = '22023';
  end if;

  if p_target = 'postingan_forum' then
    select penulis_id, judul, isi, dibuat_pada
    into v_penulis, v_judul, v_isi, v_dibuat
    from public.postingan_forum where id = p_target_id;
  elsif p_target = 'komentar_forum' then
    select k.penulis_id, 'Re: ' || p.judul, k.isi, k.dibuat_pada
    into v_penulis, v_judul, v_isi, v_dibuat
    from public.komentar_forum k
    join public.postingan_forum p on p.id = k.postingan_id
    where k.id = p_target_id;
  else
    select k.penulis_id, t.judul, k.isi, k.dibuat_pada
    into v_penulis, v_judul, v_isi, v_dibuat
    from public.komentar_tutorial k
    join public.tutorial t on t.id = k.tutorial_id
    where k.id = p_target_id;
  end if;
  if v_penulis is null then
    raise exception 'Konten tidak ditemukan' using errcode = 'P0002';
  end if;
  if v_penulis = auth.uid() then
    raise exception 'Tidak bisa melaporkan konten sendiri' using errcode = '22023';
  end if;

  insert into public.laporan (
    pelapor_id, target_type, target_id, alasan, terlapor_id,
    judul_konten, cuplikan_konten, konten_dibuat_pada
  )
  values (
    auth.uid(), p_target, p_target_id, btrim(p_alasan), v_penulis,
    v_judul, left(v_isi, 1000), v_dibuat
  )
  returning id into v_id;
  return v_id;
end;
$$;
create or replace function public.tangani_laporan(
  p_target public.target_laporan,
  p_target_id uuid,
  p_hapus boolean,
  p_alasan_peringatan text default null
)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_pertama uuid;
  v_terlapor uuid;
begin
  if not public.adalah_staf() then
    raise exception 'Khusus staf' using errcode = '42501';
  end if;

  select id, terlapor_id into v_pertama, v_terlapor
  from public.laporan
  where target_type = p_target and target_id = p_target_id and status = 'pending'
  order by dibuat_pada
  limit 1;
  if v_pertama is null then
    raise exception 'Tidak ada laporan menunggu untuk konten ini' using errcode = 'P0002';
  end if;

  if p_hapus then
    if p_target = 'postingan_forum' then
      delete from public.postingan_forum where id = p_target_id;
    elsif p_target = 'komentar_forum' then
      delete from public.komentar_forum where id = p_target_id;
    else
      delete from public.komentar_tutorial where id = p_target_id;
    end if;
    if v_terlapor is not null and nullif(btrim(p_alasan_peringatan), '') is not null then
      insert into public.peringatan (pengguna_id, laporan_id, alasan)
      values (v_terlapor, v_pertama, btrim(p_alasan_peringatan));
    end if;
  end if;

  update public.laporan
  set status = case when p_hapus then 'reviewed'::public.status_laporan
                    else 'dismissed'::public.status_laporan end,
      ditinjau_oleh = auth.uid(),
      ditinjau_pada = now()
  where target_type = p_target and target_id = p_target_id and status = 'pending';
end;
$$;
create or replace function public.buat_transaksi(p_produk_id uuid)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_harga numeric;
  v_id uuid;
begin
  if public.peran_pengguna_ini() is null then
    raise exception 'Harus masuk sebagai pengguna' using errcode = '42501';
  end if;

  select harga into v_harga
  from public.produk_toko
  where id = p_produk_id and status = 'available'
  for update;
  if v_harga is null then
    raise exception 'Produk tidak tersedia' using errcode = 'P0001';
  end if;

  insert into public.transaksi (produk_id, pembeli_id, harga_saat_beli)
  values (p_produk_id, auth.uid(), v_harga)
  returning id into v_id;
  update public.produk_toko set status = 'pending' where id = p_produk_id;
  return v_id;
end;
$$;
create or replace function public.kirim_bukti_bayar(p_id uuid, p_path text)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if p_path is null or p_path not like auth.uid()::text || '/%' then
    raise exception 'Path bukti harus berada di folder milikmu' using errcode = '22023';
  end if;

  update public.transaksi
  set url_bukti_bayar = p_path, status = 'payment_uploaded'
  where id = p_id and pembeli_id = auth.uid()
    and status in ('pending', 'payment_uploaded');
  if not found then
    raise exception 'Transaksi tidak ditemukan atau sudah selesai' using errcode = 'P0002';
  end if;
end;
$$;
create or replace function public.konfirmasi_transaksi(p_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_produk uuid;
begin
  if public.peran_staf_ini() is distinct from 'super_admin' then
    raise exception 'Khusus Super Admin' using errcode = '42501';
  end if;

  update public.transaksi
  set status = 'completed', selesai_pada = now()
  where id = p_id and status = 'payment_uploaded'
  returning produk_id into v_produk;
  if v_produk is null then
    raise exception 'Transaksi tidak ditemukan atau belum memiliki bukti' using errcode = 'P0002';
  end if;

  update public.produk_toko set status = 'sold' where id = v_produk;
end;
$$;
revoke execute on function public.profil_saya(),
  public.daftar_pengguna_staf(),
  public.kontak_toko(),
  public.peringatan_saya(),
  public.ajukan_teknisi(text, text),
  public.simpan_tutorial(uuid, uuid, text, public.tingkat_kesulitan, public.estimasi_waktu, text[], text, jsonb),
  public.setujui_pengajuan(uuid),
  public.tolak_pengajuan(uuid, text),
  public.buat_laporan(public.target_laporan, uuid, text),
  public.tangani_laporan(public.target_laporan, uuid, boolean, text),
  public.buat_transaksi(uuid),
  public.kirim_bukti_bayar(uuid, text),
  public.konfirmasi_transaksi(uuid)
from public, anon;
grant execute on function public.profil_saya(),
  public.daftar_pengguna_staf(),
  public.peringatan_saya(),
  public.ajukan_teknisi(text, text),
  public.simpan_tutorial(uuid, uuid, text, public.tingkat_kesulitan, public.estimasi_waktu, text[], text, jsonb),
  public.setujui_pengajuan(uuid),
  public.tolak_pengajuan(uuid, text),
  public.buat_laporan(public.target_laporan, uuid, text),
  public.tangani_laporan(public.target_laporan, uuid, boolean, text),
  public.buat_transaksi(uuid),
  public.kirim_bukti_bayar(uuid, text),
  public.konfirmasi_transaksi(uuid)
to authenticated;
grant execute on function public.kontak_toko() to anon, authenticated;
drop policy if exists "laporan_update_moderator" on public.laporan;
create policy "laporan_update_staf" on public.laporan
  for update using (public.adalah_staf());
drop policy if exists "peringatan_insert_moderator" on public.peringatan;
create policy "peringatan_insert_staf" on public.peringatan
  for insert with check (public.adalah_staf());
insert into storage.buckets (id, name, public)
values
  ('profile-photos', 'profile-photos', true),
  ('payment-proofs', 'payment-proofs', false),
  ('technician-evidence', 'technician-evidence', false),
  ('tutorial-media', 'tutorial-media', true),
  ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;
update storage.buckets
set public = true,
    file_size_limit = 2097152,
    allowed_mime_types = array['image/jpeg', 'image/png']
where id = 'profile-photos';
update storage.buckets
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'payment-proofs';
update storage.buckets
set public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'listing-photos';
update storage.buckets
set public = false,
    file_size_limit = 52428800,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
where id = 'technician-evidence';
update storage.buckets
set public = true,
    file_size_limit = 2097152,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'tutorial-media';
drop policy if exists "profile_photos_write_own" on storage.objects;
create policy "profile_photos_write_own" on storage.objects
  for all using (
    bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
drop policy if exists "post_images_write_own" on storage.objects;
create policy "post_images_write_own" on storage.objects
  for all using (
    bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
drop policy if exists "tutorial_media_write_own" on storage.objects;
create policy "tutorial_media_write_own" on storage.objects
  for all using (
    bucket_id = 'tutorial-media'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.peran_pengguna_ini() = 'teknisi'
  )
  with check (
    bucket_id = 'tutorial-media'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.peran_pengguna_ini() = 'teknisi'
  );
create or replace function public.sinkron_dari_auth()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  update public.pengguna
  set email = new.email,
      terakhir_aktif_pada = coalesce(new.last_sign_in_at, terakhir_aktif_pada)
  where id = new.id;
  update public.staf set email = new.email where id = new.id;
  return new;
end;
$$;
drop trigger if exists saat_auth_diperbarui on auth.users;
create trigger saat_auth_diperbarui
  after update of email, last_sign_in_at on auth.users
  for each row execute function public.sinkron_dari_auth();
revoke execute on function public.sinkron_dari_auth() from public, anon, authenticated;
drop policy if exists "tech_evidence_read_owner_staff" on storage.objects;
create policy "tech_evidence_read_owner_staff" on storage.objects
  for select using (
    bucket_id = 'technician-evidence'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.adalah_staf()
    )
  );
drop policy if exists "tech_evidence_write_own" on storage.objects;
create policy "tech_evidence_write_own" on storage.objects
  for insert with check (
    bucket_id = 'technician-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.peran_pengguna_ini() = 'anggota'
  );
drop policy if exists "payment_proofs_read_owner_staff" on storage.objects;
create policy "payment_proofs_read_owner_staff" on storage.objects
  for select using (
    bucket_id = 'payment-proofs'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.adalah_staf()
    )
  );
drop policy if exists "payment_proofs_write_own" on storage.objects;
create policy "payment_proofs_write_own" on storage.objects
  for all using (
    bucket_id = 'payment-proofs' and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'payment-proofs' and (storage.foldername(name))[1] = auth.uid()::text
  );
