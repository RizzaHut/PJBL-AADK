-- ============================================================
-- AADK — Migration 0002 (perbaikan keamanan + penyelarasan dashboard)
-- Dijalankan SETELAH 0001_init.sql. Aman dijalankan pada database kosong
-- maupun yang sudah berisi data uji.
--
-- Keputusan yang dipakai:
--   * Kolom keputusan moderator memakai nama ditinjau_oleh / ditinjau_pada
--     (sesuai 0001). Dokumen SKEMA_DATABASE.md yang diubah, bukan SQL.
--   * Akun pembeli yang dihapus: transaksi selesai dipertahankan dengan
--     pembeli_id = null (riwayat pendapatan tetap utuh). Transaksi yang
--     belum selesai dibersihkan, atau penghapusan ditolak bila bukti
--     bayar sudah terkirim.
-- ============================================================

-- ============ 1. ENUM: buang nilai 'cancelled' ============
-- Postgres tidak bisa mengurangi nilai enum, jadi tipe dibuat ulang.
update produk_toko set status = 'available' where status = 'cancelled';
delete from transaksi where status = 'cancelled';

drop index if exists idx_satu_transaksi_aktif_per_produk;

alter table produk_toko alter column status drop default;
alter table produk_toko alter column status type text using status::text;
drop type status_produk;
create type status_produk as enum ('available', 'pending', 'sold');
alter table produk_toko alter column status type status_produk using status::status_produk;
alter table produk_toko alter column status set default 'available';

alter table transaksi alter column status drop default;
alter table transaksi alter column status type text using status::text;
drop type status_transaksi;
create type status_transaksi as enum ('pending', 'payment_uploaded', 'completed');
alter table transaksi alter column status type status_transaksi using status::status_transaksi;
alter table transaksi alter column status set default 'pending';

create unique index idx_satu_transaksi_aktif_per_produk
  on transaksi (produk_id)
  where status in ('pending', 'payment_uploaded');

-- ============ 2. PERUBAHAN KOLOM ============
alter table staf add column if not exists pfp_url text;

-- tutorial tidak punya thumbnail
alter table tutorial drop column if exists url_thumbnail;

-- tahun rilis: smallint + rentang 1970-2100
alter table konsol alter column tahun_rilis type smallint;
alter table model_konsol alter column tahun_rilis type smallint;
alter table konsol add constraint konsol_tahun_rilis_wajar check (tahun_rilis between 1970 and 2100);
alter table model_konsol add constraint model_konsol_tahun_rilis_wajar check (tahun_rilis between 1970 and 2100);

-- langkah_tutorial: satu gambar per langkah, urutan boleh ditukar dalam satu transaksi
alter table langkah_tutorial alter column url_gambar drop default;
alter table langkah_tutorial alter column url_gambar type text using url_gambar[1];
alter table langkah_tutorial drop constraint langkah_tutorial_tutorial_id_nomor_langkah_key;
alter table langkah_tutorial add constraint langkah_tutorial_urutan_unik
  unique (tutorial_id, nomor_langkah) deferrable initially deferred;

-- transaksi: simpan harga saat beli supaya riwayat tidak berubah bila harga produk diubah
alter table transaksi add column harga_saat_beli numeric(12,2) not null default 0;
alter table transaksi alter column harga_saat_beli drop default;
alter table transaksi alter column pembeli_id drop not null;

-- laporan: salinan konten saat dilaporkan + pembuat konten
alter table laporan add column terlapor_id uuid;
alter table laporan add column judul_konten text;
alter table laporan add column cuplikan_konten text;
alter table laporan add column konten_dibuat_pada timestamptz;
alter table laporan alter column pelapor_id drop not null;
alter table laporan add constraint laporan_satu_per_pelapor unique (pelapor_id, target_type, target_id);
create index idx_laporan_target on laporan (target_type, target_id);

-- peringatan: tanpa diberikan_oleh (keputusan dashboard moderator)
alter table peringatan drop column if exists staf_id;

-- satu pengajuan pending per pengguna
create unique index idx_satu_pengajuan_pending
  on pengajuan_teknisi (pengguna_id) where status = 'pending';

-- ============ 3. FOREIGN KEY: aturan hapus ============
create or replace function pg_temp.set_fk(t regclass, col text, ref regclass, act text)
returns void language plpgsql as $$
declare c text;
begin
  select conname into c from pg_constraint
   where conrelid = t and contype = 'f'
     and conkey = array[(select attnum from pg_attribute where attrelid = t and attname = col)];
  if c is not null then execute format('alter table %s drop constraint %I', t, c); end if;
  execute format('alter table %s add foreign key (%I) references %s(id) on delete %s', t, col, ref, act);
end $$;

do $$ begin perform pg_temp.set_fk('pengajuan_teknisi','pengguna_id','pengguna','cascade'); end $$;
do $$ begin perform pg_temp.set_fk('pengajuan_teknisi','ditinjau_oleh','staf','set null'); end $$;
do $$ begin perform pg_temp.set_fk('tutorial','penulis_id','pengguna','cascade'); end $$;
do $$ begin perform pg_temp.set_fk('tutorial','konsol_id','konsol','cascade'); end $$;
do $$ begin perform pg_temp.set_fk('baca_tutorial','pengguna_id','pengguna','cascade'); end $$;
do $$ begin perform pg_temp.set_fk('postingan_forum','penulis_id','pengguna','cascade'); end $$;
do $$ begin perform pg_temp.set_fk('komentar_tutorial','penulis_id','pengguna','cascade'); end $$;
do $$ begin perform pg_temp.set_fk('komentar_forum','penulis_id','pengguna','cascade'); end $$;
do $$ begin perform pg_temp.set_fk('suka_postingan','pengguna_id','pengguna','cascade'); end $$;
do $$ begin perform pg_temp.set_fk('baca_postingan','pengguna_id','pengguna','cascade'); end $$;
do $$ begin perform pg_temp.set_fk('transaksi','pembeli_id','pengguna','set null'); end $$;
do $$ begin perform pg_temp.set_fk('laporan','pelapor_id','pengguna','set null'); end $$;
do $$ begin perform pg_temp.set_fk('laporan','terlapor_id','pengguna','set null'); end $$;
do $$ begin perform pg_temp.set_fk('laporan','ditinjau_oleh','staf','set null'); end $$;
do $$ begin perform pg_temp.set_fk('peringatan','pengguna_id','pengguna','cascade'); end $$;
do $$ begin perform pg_temp.set_fk('peringatan','laporan_id','laporan','set null'); end $$;

-- ============ 4. TRIGGER ============
-- 4a. diperbarui_pada otomatis
create function public.set_diperbarui_pada()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.diperbarui_pada = now();
  return new;
end $$;

create trigger trg_diperbarui before update on pengguna for each row execute function public.set_diperbarui_pada();
create trigger trg_diperbarui before update on staf for each row execute function public.set_diperbarui_pada();
create trigger trg_diperbarui before update on tutorial for each row execute function public.set_diperbarui_pada();
create trigger trg_diperbarui before update on postingan_forum for each row execute function public.set_diperbarui_pada();
create trigger trg_diperbarui before update on komentar_tutorial for each row execute function public.set_diperbarui_pada();
create trigger trg_diperbarui before update on komentar_forum for each row execute function public.set_diperbarui_pada();
create trigger trg_diperbarui before update on produk_toko for each row execute function public.set_diperbarui_pada();

-- 4b. email dan waktu login disalin dari auth.users
create function public.sinkron_dari_auth()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.pengguna
     set email = new.email,
         terakhir_aktif_pada = coalesce(new.last_sign_in_at, terakhir_aktif_pada)
   where id = new.id;
  update public.staf set email = new.email where id = new.id;
  return new;
end $$;

create trigger saat_auth_diperbarui
  after update of email, last_sign_in_at on auth.users
  for each row execute function public.sinkron_dari_auth();

-- 4c. username unik lintas pengguna dan staf; salinan username moderator hasil promosi ikut berubah
create function public.jaga_username_unik()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_table_name = 'pengguna' then
    if exists (select 1 from public.staf s where s.username = new.username and s.id <> new.id) then
      raise exception 'Username sudah dipakai' using errcode = '23505';
    end if;
  else
    if exists (select 1 from public.pengguna p where p.username = new.username and p.id <> new.id) then
      raise exception 'Username sudah dipakai' using errcode = '23505';
    end if;
  end if;
  return new;
end $$;

create trigger trg_username_unik before insert or update of username on pengguna
  for each row execute function public.jaga_username_unik();
create trigger trg_username_unik before insert or update of username on staf
  for each row execute function public.jaga_username_unik();

create function public.sinkron_username()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if pg_trigger_depth() > 1 then return null; end if;
  if tg_table_name = 'pengguna' then
    update public.staf set username = new.username where id = new.id and username is distinct from new.username;
  else
    update public.pengguna set username = new.username where id = new.id and username is distinct from new.username;
  end if;
  return null;
end $$;

create trigger trg_sinkron_username after update of username on pengguna
  for each row execute function public.sinkron_username();
create trigger trg_sinkron_username after update of username on staf
  for each row execute function public.sinkron_username();

-- 4d. staf non-super-admin tidak boleh mengubah peran, nomor WhatsApp, atau QRIS
create function public.jaga_kolom_staf()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(public.peran_staf_ini()::text, '') <> 'super_admin' and auth.uid() is not null then
    if new.peran is distinct from old.peran
       or new.nomor_whatsapp is distinct from old.nomor_whatsapp
       or new.qris_url is distinct from old.qris_url then
      raise exception 'Hanya Super Admin yang boleh mengubah kolom ini' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;

create trigger trg_jaga_kolom_staf before update on staf
  for each row execute function public.jaga_kolom_staf();

-- 4e. hapus akun pembeli: bersihkan transaksi yang belum selesai
create function public.sebelum_pengguna_dihapus()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.transaksi where pembeli_id = old.id and status = 'payment_uploaded') then
    raise exception 'Akun punya transaksi yang menunggu konfirmasi. Selesaikan dulu sebelum menghapus akun.' using errcode = 'P0001';
  end if;
  update public.produk_toko set status = 'available'
   where id in (select produk_id from public.transaksi where pembeli_id = old.id and status = 'pending');
  delete from public.transaksi where pembeli_id = old.id and status = 'pending';
  return old;
end $$;

create trigger trg_sebelum_pengguna_dihapus before delete on pengguna
  for each row execute function public.sebelum_pengguna_dihapus();

-- ============ 5. FUNGSI SECURITY DEFINER ============
-- Semua aksi yang mengubah lebih dari yang boleh diubah RLS lewat fungsi.
-- search_path dikosongkan dan semua nama di-qualify.

-- 5a. Teknisi: ajukan, setujui, tolak
create function public.ajukan_teknisi(p_url_bukti text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_cd timestamptz;
begin
  if public.peran_pengguna_ini() is distinct from 'anggota' then
    raise exception 'Hanya anggota yang bisa mengajukan' using errcode = '42501';
  end if;
  if p_url_bukti is null or p_url_bukti not like auth.uid()::text || '/%' then
    raise exception 'Path bukti harus berada di folder milikmu' using errcode = '22023';
  end if;
  select max(cooldown_sampai) into v_cd from public.pengajuan_teknisi
   where pengguna_id = auth.uid() and status = 'rejected';
  if v_cd is not null and v_cd > now() then
    raise exception 'Belum boleh mengajukan lagi sampai %', v_cd using errcode = 'P0001';
  end if;
  insert into public.pengajuan_teknisi (pengguna_id, url_bukti) values (auth.uid(), p_url_bukti)
    returning id into v_id;
  return v_id;
end $$;

create function public.setujui_pengajuan(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user uuid;
begin
  if not public.adalah_staf() then raise exception 'Khusus staf' using errcode = '42501'; end if;
  update public.pengajuan_teknisi
     set status = 'approved', ditinjau_oleh = auth.uid(), ditinjau_pada = now()
   where id = p_id and status = 'pending'
   returning pengguna_id into v_user;
  if v_user is null then raise exception 'Pengajuan tidak ditemukan atau sudah diputuskan' using errcode = 'P0002'; end if;
  update public.pengguna set peran = 'teknisi' where id = v_user and peran = 'anggota';
end $$;

create function public.tolak_pengajuan(p_id uuid, p_alasan text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user uuid;
begin
  if not public.adalah_staf() then raise exception 'Khusus staf' using errcode = '42501'; end if;
  if nullif(btrim(p_alasan), '') is null then raise exception 'Alasan penolakan wajib diisi' using errcode = '22023'; end if;
  update public.pengajuan_teknisi
     set status = 'rejected', alasan_penolakan = btrim(p_alasan), ditinjau_oleh = auth.uid(),
         ditinjau_pada = now(), cooldown_sampai = now() + interval '30 days'
   where id = p_id and status = 'pending'
   returning pengguna_id into v_user;
  if v_user is null then raise exception 'Pengajuan tidak ditemukan atau sudah diputuskan' using errcode = 'P0002'; end if;
end $$;

-- 5b. Super Admin mengubah peran anggota/teknisi
create function public.ubah_peran_pengguna(p_id uuid, p_peran public.peran_pengguna)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if public.peran_staf_ini() is distinct from 'super_admin' then
    raise exception 'Khusus Super Admin' using errcode = '42501';
  end if;
  update public.pengguna set peran = p_peran where id = p_id;
end $$;

-- 5c. Laporan: buat (dengan salinan konten) dan tangani
create function public.buat_laporan(p_target public.target_laporan, p_target_id uuid, p_alasan text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_penulis uuid; v_judul text; v_isi text; v_dibuat timestamptz; v_id uuid;
begin
  if public.peran_pengguna_ini() is null then raise exception 'Harus masuk sebagai pengguna' using errcode = '42501'; end if;
  if nullif(btrim(p_alasan), '') is null then raise exception 'Alasan wajib diisi' using errcode = '22023'; end if;
  if p_target = 'postingan_forum' then
    select penulis_id, judul, isi, dibuat_pada into v_penulis, v_judul, v_isi, v_dibuat
      from public.postingan_forum where id = p_target_id;
  elsif p_target = 'komentar_forum' then
    select k.penulis_id, 'Re: ' || p.judul, k.isi, k.dibuat_pada into v_penulis, v_judul, v_isi, v_dibuat
      from public.komentar_forum k join public.postingan_forum p on p.id = k.postingan_id where k.id = p_target_id;
  else
    select k.penulis_id, t.judul, k.isi, k.dibuat_pada into v_penulis, v_judul, v_isi, v_dibuat
      from public.komentar_tutorial k join public.tutorial t on t.id = k.tutorial_id where k.id = p_target_id;
  end if;
  if v_penulis is null then raise exception 'Konten tidak ditemukan' using errcode = 'P0002'; end if;
  if v_penulis = auth.uid() then raise exception 'Tidak bisa melaporkan konten sendiri' using errcode = '22023'; end if;
  insert into public.laporan (pelapor_id, target_type, target_id, alasan, terlapor_id, judul_konten, cuplikan_konten, konten_dibuat_pada)
  values (auth.uid(), p_target, p_target_id, btrim(p_alasan), v_penulis, v_judul, left(v_isi, 1000), v_dibuat)
  returning id into v_id;
  return v_id;
end $$;

-- p_hapus = false: abaikan. p_hapus = true: hapus konten, boleh disertai peringatan.
create function public.tangani_laporan(p_target public.target_laporan, p_target_id uuid, p_hapus boolean, p_alasan_peringatan text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare v_pertama uuid; v_terlapor uuid;
begin
  if not public.adalah_staf() then raise exception 'Khusus staf' using errcode = '42501'; end if;
  select id, terlapor_id into v_pertama, v_terlapor from public.laporan
   where target_type = p_target and target_id = p_target_id and status = 'pending'
   order by dibuat_pada limit 1;
  if v_pertama is null then raise exception 'Tidak ada laporan menunggu untuk konten ini' using errcode = 'P0002'; end if;

  if p_hapus then
    if p_target = 'postingan_forum' then delete from public.postingan_forum where id = p_target_id;
    elsif p_target = 'komentar_forum' then delete from public.komentar_forum where id = p_target_id;
    else delete from public.komentar_tutorial where id = p_target_id; end if;
    if v_terlapor is not null and nullif(btrim(p_alasan_peringatan), '') is not null then
      insert into public.peringatan (pengguna_id, laporan_id, alasan) values (v_terlapor, v_pertama, btrim(p_alasan_peringatan));
    end if;
  end if;

  update public.laporan
     set status = case when p_hapus then 'reviewed'::public.status_laporan else 'dismissed'::public.status_laporan end,
         ditinjau_oleh = auth.uid(), ditinjau_pada = now()
   where target_type = p_target and target_id = p_target_id and status = 'pending';
end $$;

-- 5d. Toko: beli, kirim bukti, konfirmasi, bersihkan
create function public.buat_transaksi(p_produk_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_harga numeric; v_id uuid;
begin
  if public.peran_pengguna_ini() is null then raise exception 'Harus masuk sebagai pengguna' using errcode = '42501'; end if;
  select harga into v_harga from public.produk_toko where id = p_produk_id and status = 'available' for update;
  if v_harga is null then raise exception 'Produk tidak tersedia' using errcode = 'P0001'; end if;
  insert into public.transaksi (produk_id, pembeli_id, harga_saat_beli) values (p_produk_id, auth.uid(), v_harga)
    returning id into v_id;
  update public.produk_toko set status = 'pending' where id = p_produk_id;
  return v_id;
end $$;

create function public.kirim_bukti_bayar(p_id uuid, p_path text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_path is null or p_path not like auth.uid()::text || '/%' then
    raise exception 'Path bukti harus berada di folder milikmu' using errcode = '22023';
  end if;
  update public.transaksi set url_bukti_bayar = p_path, status = 'payment_uploaded'
   where id = p_id and pembeli_id = auth.uid() and status in ('pending', 'payment_uploaded');
  if not found then raise exception 'Transaksi tidak ditemukan atau sudah selesai' using errcode = 'P0002'; end if;
end $$;

create function public.konfirmasi_transaksi(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_produk uuid;
begin
  if public.peran_staf_ini() is distinct from 'super_admin' then raise exception 'Khusus Super Admin' using errcode = '42501'; end if;
  update public.transaksi set status = 'completed', selesai_pada = now()
   where id = p_id and status = 'payment_uploaded' returning produk_id into v_produk;
  if v_produk is null then raise exception 'Transaksi belum menunggu konfirmasi' using errcode = 'P0002'; end if;
  update public.produk_toko set status = 'sold' where id = v_produk;
end $$;

-- File bukti di Storage tidak ikut terhapus; job pembersih file dilakukan di luar database.
create function public.bersihkan_transaksi_pending()
returns integer language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  update public.produk_toko set status = 'available'
   where id in (select produk_id from public.transaksi
                 where status = 'pending' and url_bukti_bayar is null and dibuat_pada < now() - interval '24 hours');
  delete from public.transaksi where status = 'pending' and url_bukti_bayar is null and dibuat_pada < now() - interval '24 hours';
  get diagnostics n = row_count;
  return n;
end $$;

-- 5e. Baca data yang tidak boleh terbuka lewat select biasa
create function public.profil_saya()
returns setof public.pengguna language sql stable security definer set search_path = '' as $$
  select * from public.pengguna where id = auth.uid();
$$;

create function public.daftar_pengguna_staf()
returns setof public.pengguna language sql stable security definer set search_path = '' as $$
  select * from public.pengguna where public.adalah_staf();
$$;

create function public.kontak_toko()
returns table (nomor_whatsapp text, qris_url text) language sql stable security definer set search_path = '' as $$
  select s.nomor_whatsapp, s.qris_url from public.staf s
   where s.peran = 'super_admin' order by s.dibuat_pada limit 1;
$$;

-- Peringatan milik sendiri beserta salinan konten, tanpa membuka tabel laporan
create function public.peringatan_saya()
returns table (id uuid, alasan text, dibuat_pada timestamptz, jenis_konten public.target_laporan, cuplikan_konten text)
language sql stable security definer set search_path = '' as $$
  select p.id, p.alasan, p.dibuat_pada, l.target_type, l.cuplikan_konten
    from public.peringatan p left join public.laporan l on l.id = p.laporan_id
   where p.pengguna_id = auth.uid()
   order by p.dibuat_pada desc;
$$;

-- hak eksekusi: tutup dari anon kecuali yang memang publik
revoke execute on function
  public.ajukan_teknisi(text), public.setujui_pengajuan(uuid), public.tolak_pengajuan(uuid, text),
  public.ubah_peran_pengguna(uuid, public.peran_pengguna), public.buat_laporan(public.target_laporan, uuid, text),
  public.tangani_laporan(public.target_laporan, uuid, boolean, text), public.buat_transaksi(uuid),
  public.kirim_bukti_bayar(uuid, text), public.konfirmasi_transaksi(uuid), public.bersihkan_transaksi_pending(),
  public.profil_saya(), public.daftar_pengguna_staf(), public.peringatan_saya()
  from public, anon;
grant execute on function
  public.ajukan_teknisi(text), public.setujui_pengajuan(uuid), public.tolak_pengajuan(uuid, text),
  public.ubah_peran_pengguna(uuid, public.peran_pengguna), public.buat_laporan(public.target_laporan, uuid, text),
  public.tangani_laporan(public.target_laporan, uuid, boolean, text), public.buat_transaksi(uuid),
  public.kirim_bukti_bayar(uuid, text), public.konfirmasi_transaksi(uuid),
  public.profil_saya(), public.daftar_pengguna_staf(), public.peringatan_saya()
  to authenticated;
revoke execute on function public.bersihkan_transaksi_pending() from authenticated;
grant execute on function public.kontak_toko() to anon, authenticated;

-- ============ 6. RLS: ganti policy yang terlalu longgar ============
-- pengguna: tidak ada insert/delete dari klien; update hanya diri sendiri dan hanya kolom profil
drop policy "pengguna_insert_own" on pengguna;
drop policy "pengguna_update_own_or_super_admin" on pengguna;
create policy "pengguna_update_own" on pengguna for update using (auth.uid() = id);

revoke select on pengguna from anon, authenticated;
revoke insert, update, delete on pengguna from authenticated;
grant select (id, username, pfp_url, peran, dibuat_pada) on pengguna to anon, authenticated;
grant update (username, pfp_url, tanggal_lahir, jenis_kelamin) on pengguna to authenticated;
-- Catatan klien: update pengguna jangan memakai .select() penuh; baca ulang lewat rpc('profil_saya').

-- staf: boleh memperbarui baris sendiri (username, pfp_url); kolom lain dijaga trigger jaga_kolom_staf
create policy "staf_update_own" on staf for update using (auth.uid() = id);

-- pengajuan_teknisi: hanya lewat fungsi
drop policy "pengajuan_teknisi_insert_own" on pengajuan_teknisi;
drop policy "pengajuan_teknisi_update_moderator" on pengajuan_teknisi;
revoke insert, update, delete on pengajuan_teknisi from authenticated;

-- tutorial: penulis harus diri sendiri
drop policy "tutorial_insert_teknisi" on tutorial;
create policy "tutorial_insert_teknisi" on tutorial
  for insert with check (peran_pengguna_ini() = 'teknisi' and penulis_id = auth.uid());

-- moderator tidak menghapus konten langsung, hanya lewat tangani_laporan
drop policy "postingan_forum_delete" on postingan_forum;
create policy "postingan_forum_delete" on postingan_forum for delete using (auth.uid() = penulis_id);
drop policy "komentar_tutorial_delete" on komentar_tutorial;
create policy "komentar_tutorial_delete" on komentar_tutorial for delete using (auth.uid() = penulis_id);
drop policy "komentar_forum_delete" on komentar_forum;
create policy "komentar_forum_delete" on komentar_forum for delete using (auth.uid() = penulis_id);

-- transaksi: hanya lewat fungsi
drop policy "transaksi_insert_pembeli" on transaksi;
drop policy "transaksi_update_super_admin" on transaksi;
revoke insert, update, delete on transaksi from authenticated;

-- laporan: hanya lewat fungsi
drop policy "laporan_insert_own" on laporan;
drop policy "laporan_update_moderator" on laporan;
revoke insert, update, delete on laporan from authenticated;

-- peringatan: dibuat oleh tangani_laporan; hanya Super Admin yang boleh menghapus baris keliru
drop policy "peringatan_insert_moderator" on peringatan;
create policy "peringatan_delete_super_admin" on peringatan for delete using (peran_staf_ini() = 'super_admin');
revoke insert, update on peringatan from authenticated;

-- peringatan: pengguna biasa membaca lewat peringatan_saya() agar cuplikan ikut terbaca
-- (policy select tetap: pemilik atau staf)

-- ============ 7. STORAGE ============
insert into storage.buckets (id, name, public) values
  ('photo_profiles', 'photo_profiles', true),
  ('gambar_tutorial', 'gambar_tutorial', true),
  ('gambar_postingan_forum', 'gambar_postingan_forum', true),
  ('gambar_kartu_konsol', 'gambar_kartu_konsol', true),
  ('gambar_banner_konsol', 'gambar_banner_konsol', true),
  ('gambar_produk_toko', 'gambar_produk_toko', true),
  ('qris_pembayaran', 'qris_pembayaran', true),
  ('bukti_verifikasi_teknisi', 'bukti_verifikasi_teknisi', false),
  ('bukti_pembayaran', 'bukti_pembayaran', false)
on conflict (id) do nothing;

-- gambar_tutorial: hanya teknisi (folder sendiri) atau Super Admin
drop policy "gambar_tutorial_insert" on storage.objects;
drop policy "gambar_tutorial_update" on storage.objects;
drop policy "gambar_tutorial_delete" on storage.objects;
create policy "gambar_tutorial_insert" on storage.objects for insert
  with check (bucket_id = 'gambar_tutorial' and ((auth.uid()::text = (storage.foldername(name))[1] and public.peran_pengguna_ini() = 'teknisi') or public.peran_staf_ini() = 'super_admin'));
create policy "gambar_tutorial_update" on storage.objects for update
  using (bucket_id = 'gambar_tutorial' and ((auth.uid()::text = (storage.foldername(name))[1] and public.peran_pengguna_ini() = 'teknisi') or public.peran_staf_ini() = 'super_admin'));
create policy "gambar_tutorial_delete" on storage.objects for delete
  using (bucket_id = 'gambar_tutorial' and (auth.uid()::text = (storage.foldername(name))[1] or public.peran_staf_ini() = 'super_admin'));

-- bukti_pembayaran: pembeli boleh mengganti dan menghapus file miliknya
create policy "bukti_pembayaran_update" on storage.objects for update
  using (bucket_id = 'bukti_pembayaran' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "bukti_pembayaran_delete" on storage.objects for delete
  using (bucket_id = 'bukti_pembayaran' and auth.uid()::text = (storage.foldername(name))[1]);

-- bukti_verifikasi_teknisi: pemilik boleh menghapus bukti miliknya
create policy "bukti_verifikasi_teknisi_delete" on storage.objects for delete
  using (bucket_id = 'bukti_verifikasi_teknisi' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============ 8. JOB PEMBERSIH (pg_cron) ============
-- Di Supabase: aktifkan extension pg_cron dari Dashboard bila perintah ini gagal.
do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule('bersihkan-transaksi-pending', '*/15 * * * *', 'select public.bersihkan_transaksi_pending()');
exception when others then
  raise notice 'pg_cron belum aktif: jadwalkan public.bersihkan_transaksi_pending() setiap 15 menit secara manual (%)', sqlerrm;
end $$;

-- ============================================================
-- END OF 0002
-- ============================================================
