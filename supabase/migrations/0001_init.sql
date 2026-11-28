-- ============================================================
-- AADK (Ada Apa Dengan Konsol) — Migration Final (Rebuild)
-- Menggantikan 0001_init.sql versi sebelumnya sepenuhnya.
-- Penamaan tabel & kolom: Bahasa Indonesia.
-- Lihat SKEMA_DATABASE.md untuk penjelasan tiap tabel, trigger,
-- bucket storage, dan RLS.
-- ============================================================

-- ============ 1. ENUM TYPES ============
create type jenis_kelamin as enum ('laki_laki', 'perempuan');
create type peran_pengguna as enum ('anggota', 'teknisi');
create type peran_staf as enum ('moderator', 'super_admin');

create type merek_konsol as enum ('Nintendo', 'Playstation', 'Xbox');
create type tipe_konsol as enum ('home_console', 'hybrid_console', 'handheld_console');

create type tingkat_kesulitan as enum ('mudah', 'sedang', 'sulit');
create type estimasi_waktu as enum ('15_menit', '30_menit', '1_jam', '2_jam', 'lebih_2_jam');

create type tag_topik as enum (
  'Hardware & Technical', 'Software & System', 'Server & Network',
  'Accessories & Controller', 'Storage & Memory', 'Maintenance & Care',
  'Service & Spare Part', 'General'
);

create type kategori_produk as enum ('konsol', 'aksesoris', 'komponen');
create type kondisi_produk as enum ('baru', 'bekas');
create type status_produk as enum ('available', 'pending', 'sold', 'cancelled');
create type status_transaksi as enum ('pending', 'payment_uploaded', 'completed', 'cancelled');

create type status_pengajuan as enum ('pending', 'approved', 'rejected');
create type target_laporan as enum ('postingan_forum', 'komentar_tutorial', 'komentar_forum');
create type status_laporan as enum ('pending', 'reviewed', 'dismissed');

-- ============ 2. PENGGUNA (Anggota & Teknisi) ============
create table pengguna (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  email text not null,
  jenis_kelamin jenis_kelamin not null,
  pfp_url text,
  tanggal_lahir date,
  peran peran_pengguna not null default 'anggota',
  terakhir_aktif_pada timestamptz,
  dibuat_pada timestamptz not null default now(),
  diperbarui_pada timestamptz not null default now()
);

-- ============ 3. STAF (Moderator & Super Admin) ============
create table staf (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  email text not null,
  peran peran_staf not null,
  nomor_whatsapp text,
  qris_url text,
  dibuat_pada timestamptz not null default now(),
  diperbarui_pada timestamptz not null default now()
);

-- ============ 4. PENGAJUAN_TEKNISI ============
create table pengajuan_teknisi (
  id uuid primary key default gen_random_uuid(),
  pengguna_id uuid not null references pengguna(id),
  url_bukti text not null,
  status status_pengajuan not null default 'pending',
  diajukan_pada timestamptz not null default now(),
  ditinjau_oleh uuid references staf(id),
  ditinjau_pada timestamptz,
  alasan_penolakan text,
  cooldown_sampai timestamptz
);

-- ============ 5. KONSOL ============
create table konsol (
  id uuid primary key default gen_random_uuid(),
  merek merek_konsol not null,
  tipe tipe_konsol not null,
  nama text not null,
  deskripsi text,
  tahun_rilis int not null,
  url_gambar_kartu text,
  dibuat_pada timestamptz not null default now()
);

-- ============ 6. MODEL_KONSOL ============
create table model_konsol (
  id uuid primary key default gen_random_uuid(),
  konsol_id uuid not null references konsol(id) on delete cascade,
  nama text not null,
  kode_model text,
  tahun_rilis int not null,
  url_gambar_banner text,
  opsi_warna text[],
  konektivitas text[],
  performa text,
  media_penyimpanan text,
  urutan int not null default 0
);

-- ============ 7. TUTORIAL ============
create table tutorial (
  id uuid primary key default gen_random_uuid(),
  konsol_id uuid not null references konsol(id),
  penulis_id uuid not null references pengguna(id),
  judul text not null,
  url_thumbnail text,
  tingkat_kesulitan tingkat_kesulitan not null,
  estimasi_waktu estimasi_waktu not null,
  item text[] not null default '{}',
  konten_peringatan text,
  dibuat_pada timestamptz not null default now(),
  diperbarui_pada timestamptz not null default now()
);

-- ============ 8. LANGKAH_TUTORIAL ============
create table langkah_tutorial (
  id uuid primary key default gen_random_uuid(),
  tutorial_id uuid not null references tutorial(id) on delete cascade,
  nomor_langkah int not null,
  deskripsi text not null,
  url_gambar text[] default '{}',
  unique(tutorial_id, nomor_langkah)
);

-- ============ 9. BACA_TUTORIAL ============
create table baca_tutorial (
  pengguna_id uuid not null references pengguna(id),
  tutorial_id uuid not null references tutorial(id) on delete cascade,
  terakhir_dibaca_pada timestamptz not null default now(),
  primary key (pengguna_id, tutorial_id)
);

-- ============ 10. POSTINGAN_FORUM ============
create table postingan_forum (
  id uuid primary key default gen_random_uuid(),
  penulis_id uuid not null references pengguna(id),
  judul text not null,
  isi text not null,
  gambar text[] not null default '{}',
  topik tag_topik not null,
  dibuat_pada timestamptz not null default now(),
  diperbarui_pada timestamptz not null default now(),
  constraint postingan_forum_maks_3_gambar
    check (array_length(gambar, 1) is null or array_length(gambar, 1) <= 3)
);

-- ============ 11. KOMENTAR_TUTORIAL ============
create table komentar_tutorial (
  id uuid primary key default gen_random_uuid(),
  penulis_id uuid not null references pengguna(id),
  tutorial_id uuid not null references tutorial(id) on delete cascade,
  isi text not null,
  dibuat_pada timestamptz not null default now(),
  diperbarui_pada timestamptz not null default now()
);

-- ============ 12. KOMENTAR_FORUM ============
create table komentar_forum (
  id uuid primary key default gen_random_uuid(),
  penulis_id uuid not null references pengguna(id),
  postingan_id uuid not null references postingan_forum(id) on delete cascade,
  isi text not null,
  dibuat_pada timestamptz not null default now(),
  diperbarui_pada timestamptz not null default now()
);

-- ============ 13. SUKA_POSTINGAN ============
create table suka_postingan (
  pengguna_id uuid not null references pengguna(id),
  postingan_id uuid not null references postingan_forum(id) on delete cascade,
  dibuat_pada timestamptz not null default now(),
  primary key (pengguna_id, postingan_id)
);

-- ============ 14. BACA_POSTINGAN ============
create table baca_postingan (
  pengguna_id uuid not null references pengguna(id),
  postingan_id uuid not null references postingan_forum(id) on delete cascade,
  terakhir_dibaca_pada timestamptz not null default now(),
  primary key (pengguna_id, postingan_id)
);

-- ============ 15. PRODUK_TOKO ============
create table produk_toko (
  id uuid primary key default gen_random_uuid(),
  judul text not null,
  deskripsi text not null,
  kategori kategori_produk not null,
  kondisi kondisi_produk not null,
  lokasi text not null,
  harga numeric(12,2) not null,
  gambar text[] not null default '{}',
  status status_produk not null default 'available',
  dibuat_pada timestamptz not null default now(),
  diperbarui_pada timestamptz not null default now()
);

-- ============ 16. TRANSAKSI ============
create table transaksi (
  id uuid primary key default gen_random_uuid(),
  produk_id uuid not null references produk_toko(id),
  pembeli_id uuid not null references pengguna(id),
  status status_transaksi not null default 'pending',
  url_bukti_bayar text,
  dibuat_pada timestamptz not null default now(),
  selesai_pada timestamptz
);

-- Jaring pengaman race condition: cegah >1 transaksi aktif per produk
create unique index idx_satu_transaksi_aktif_per_produk
  on transaksi (produk_id)
  where status in ('pending', 'payment_uploaded');

-- ============ 17. LAPORAN ============
create table laporan (
  id uuid primary key default gen_random_uuid(),
  pelapor_id uuid not null references pengguna(id),
  target_type target_laporan not null,
  target_id uuid not null,
  alasan text not null,
  status status_laporan not null default 'pending',
  ditinjau_oleh uuid references staf(id),
  ditinjau_pada timestamptz,
  dibuat_pada timestamptz not null default now()
);

-- ============ 18. PERINGATAN ============
create table peringatan (
  id uuid primary key default gen_random_uuid(),
  pengguna_id uuid not null references pengguna(id),
  staf_id uuid not null references staf(id),
  laporan_id uuid references laporan(id),
  alasan text not null,
  dibuat_pada timestamptz not null default now()
);

-- ============ 19. TRIGGER: auto-create baris pengguna saat signup ============
-- tipe_akun dikirim lewat options.data saat signUp()/admin.createUser().
-- Default 'pengguna' kalau tidak diset (jalur Register publik selalu jadi pengguna).
-- Staf HARUS dibuat lewat Route Handler khusus (admin.createUser() dengan
-- tipe_akun='staf'), supaya tidak ikut ke-insert ke tabel `pengguna`.
create function public.tangani_pengguna_baru()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(new.raw_user_meta_data->>'tipe_akun', 'pengguna') = 'pengguna' then
    insert into public.pengguna (id, email, username, jenis_kelamin)
    values (
      new.id,
      new.email,
      new.raw_user_meta_data->>'username',
      (new.raw_user_meta_data->>'jenis_kelamin')::public.jenis_kelamin
    );
  end if;
  return new;
end;
$$;

create trigger saat_pengguna_baru_dibuat
  after insert on auth.users
  for each row execute function public.tangani_pengguna_baru();

-- ============ 20. HELPER FUNCTIONS (dipakai berulang di RLS) ============
-- PENTING: wajib SECURITY DEFINER supaya bypass RLS saat query internal ke
-- pengguna/staf — tanpa ini, policy tabel lain yang memanggil function ini
-- bisa memicu rekursi berlapis lewat RLS staf/pengguna sendiri dan gagal
-- dengan error 54001 (statement_too_complex).
create or replace function peran_pengguna_ini()
returns peran_pengguna
language sql stable
security definer
set search_path = ''
as $$
  select peran from public.pengguna where id = auth.uid();
$$;

create or replace function peran_staf_ini()
returns peran_staf
language sql stable
security definer
set search_path = ''
as $$
  select peran from public.staf where id = auth.uid();
$$;

create or replace function adalah_staf()
returns boolean
language sql stable
security definer
set search_path = ''
as $$
  select exists(select 1 from public.staf where id = auth.uid());
$$;

-- ============ 21. ROW LEVEL SECURITY POLICIES ============

-- pengguna
alter table pengguna enable row level security;
create policy "pengguna_select_all" on pengguna for select using (true);
create policy "pengguna_insert_own" on pengguna
  for insert with check (true);
create policy "pengguna_update_own_or_super_admin" on pengguna
  for update using (auth.uid() = id or peran_staf_ini() = 'super_admin');

-- staf
alter table staf enable row level security;
create policy "staf_select_own_or_staf" on staf
  for select using (auth.uid() = id or adalah_staf());
create policy "staf_write_super_admin" on staf
  for all using (peran_staf_ini() = 'super_admin');

-- pengajuan_teknisi
alter table pengajuan_teknisi enable row level security;
create policy "pengajuan_teknisi_select" on pengajuan_teknisi
  for select using (auth.uid() = pengguna_id or adalah_staf());
create policy "pengajuan_teknisi_insert_own" on pengajuan_teknisi
  for insert with check (auth.uid() = pengguna_id);
create policy "pengajuan_teknisi_update_moderator" on pengajuan_teknisi
  for update using (peran_staf_ini() = 'moderator');

-- konsol
alter table konsol enable row level security;
create policy "konsol_select_all" on konsol for select using (true);
create policy "konsol_write_super_admin" on konsol
  for all using (peran_staf_ini() = 'super_admin');

-- model_konsol
alter table model_konsol enable row level security;
create policy "model_konsol_select_all" on model_konsol for select using (true);
create policy "model_konsol_write_super_admin" on model_konsol
  for all using (peran_staf_ini() = 'super_admin');

-- tutorial
alter table tutorial enable row level security;
create policy "tutorial_select_all" on tutorial for select using (true);
create policy "tutorial_insert_teknisi" on tutorial
  for insert with check (peran_pengguna_ini() = 'teknisi');
create policy "tutorial_update" on tutorial
  for update using (auth.uid() = penulis_id or peran_staf_ini() = 'super_admin');
create policy "tutorial_delete" on tutorial
  for delete using (auth.uid() = penulis_id or peran_staf_ini() = 'super_admin');

-- langkah_tutorial
alter table langkah_tutorial enable row level security;
create policy "langkah_tutorial_select_all" on langkah_tutorial for select using (true);
create policy "langkah_tutorial_write" on langkah_tutorial
  for all using (
    exists (select 1 from tutorial t where t.id = tutorial_id
      and (t.penulis_id = auth.uid() or peran_staf_ini() = 'super_admin'))
  );

-- baca_tutorial
alter table baca_tutorial enable row level security;
create policy "baca_tutorial_own" on baca_tutorial for all using (auth.uid() = pengguna_id);

-- postingan_forum
alter table postingan_forum enable row level security;
create policy "postingan_forum_select_all" on postingan_forum for select using (true);
create policy "postingan_forum_insert" on postingan_forum
  for insert with check (auth.uid() = penulis_id);
create policy "postingan_forum_update_own" on postingan_forum
  for update using (auth.uid() = penulis_id);
create policy "postingan_forum_delete" on postingan_forum
  for delete using (auth.uid() = penulis_id or peran_staf_ini() = 'moderator');

-- komentar_tutorial
alter table komentar_tutorial enable row level security;
create policy "komentar_tutorial_select_all" on komentar_tutorial for select using (true);
create policy "komentar_tutorial_insert" on komentar_tutorial
  for insert with check (auth.uid() = penulis_id);
create policy "komentar_tutorial_update_own" on komentar_tutorial
  for update using (auth.uid() = penulis_id);
create policy "komentar_tutorial_delete" on komentar_tutorial
  for delete using (auth.uid() = penulis_id or peran_staf_ini() = 'moderator');

-- komentar_forum
alter table komentar_forum enable row level security;
create policy "komentar_forum_select_all" on komentar_forum for select using (true);
create policy "komentar_forum_insert" on komentar_forum
  for insert with check (auth.uid() = penulis_id);
create policy "komentar_forum_update_own" on komentar_forum
  for update using (auth.uid() = penulis_id);
create policy "komentar_forum_delete" on komentar_forum
  for delete using (auth.uid() = penulis_id or peran_staf_ini() = 'moderator');

-- suka_postingan
alter table suka_postingan enable row level security;
create policy "suka_postingan_select_all" on suka_postingan for select using (true);
create policy "suka_postingan_own" on suka_postingan for all using (auth.uid() = pengguna_id);

-- baca_postingan
alter table baca_postingan enable row level security;
create policy "baca_postingan_own" on baca_postingan for all using (auth.uid() = pengguna_id);

-- produk_toko
alter table produk_toko enable row level security;
create policy "produk_toko_select_all" on produk_toko for select using (true);
create policy "produk_toko_write_super_admin" on produk_toko
  for all using (peran_staf_ini() = 'super_admin');

-- transaksi
alter table transaksi enable row level security;
create policy "transaksi_select" on transaksi
  for select using (auth.uid() = pembeli_id or adalah_staf());
create policy "transaksi_insert_pembeli" on transaksi
  for insert with check (auth.uid() = pembeli_id);
create policy "transaksi_update_super_admin" on transaksi
  for update using (peran_staf_ini() = 'super_admin');

-- laporan
alter table laporan enable row level security;
create policy "laporan_select" on laporan
  for select using (auth.uid() = pelapor_id or adalah_staf());
create policy "laporan_insert_own" on laporan
  for insert with check (auth.uid() = pelapor_id);
create policy "laporan_update_moderator" on laporan
  for update using (peran_staf_ini() = 'moderator');

-- peringatan
alter table peringatan enable row level security;
create policy "peringatan_select" on peringatan
  for select using (auth.uid() = pengguna_id or adalah_staf());
create policy "peringatan_insert_moderator" on peringatan
  for insert with check (peran_staf_ini() = 'moderator');

-- ============ 22. GRANTS (wajib eksplisit — Supabase terbaru tidak auto-grant) ============
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- ============================================================
-- END OF MIGRATION
-- ============================================================

-- ============ 23. STORAGE BUCKET POLICIES ============
-- Catatan: "Public bucket" cuma mempengaruhi akses BACA (siapa saja bisa
-- lihat/download tanpa login). Akses TULIS (insert/update/delete) tetap
-- butuh policy eksplisit di storage.objects, terlepas dari status public/private.
-- Struktur path yang diharapkan: <bucket>/<uid-pemilik>/<nama-file>

-- photo_profiles (public read; tulis: pemilik sendiri)
create policy "photo_profiles_insert_own"
on storage.objects for insert
with check (bucket_id = 'photo_profiles' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "photo_profiles_update_own"
on storage.objects for update
using (bucket_id = 'photo_profiles' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "photo_profiles_delete_own"
on storage.objects for delete
using (bucket_id = 'photo_profiles' and auth.uid()::text = (storage.foldername(name))[1]);

-- gambar_tutorial (public read; tulis: penulis tutorial atau super_admin)
create policy "gambar_tutorial_insert"
on storage.objects for insert
with check (bucket_id = 'gambar_tutorial' and (auth.uid()::text = (storage.foldername(name))[1] or peran_staf_ini() = 'super_admin'));
create policy "gambar_tutorial_update"
on storage.objects for update
using (bucket_id = 'gambar_tutorial' and (auth.uid()::text = (storage.foldername(name))[1] or peran_staf_ini() = 'super_admin'));
create policy "gambar_tutorial_delete"
on storage.objects for delete
using (bucket_id = 'gambar_tutorial' and (auth.uid()::text = (storage.foldername(name))[1] or peran_staf_ini() = 'super_admin'));

-- gambar_postingan_forum (public read; tulis: penulis post sendiri)
create policy "gambar_postingan_forum_insert"
on storage.objects for insert
with check (bucket_id = 'gambar_postingan_forum' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "gambar_postingan_forum_update"
on storage.objects for update
using (bucket_id = 'gambar_postingan_forum' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "gambar_postingan_forum_delete"
on storage.objects for delete
using (bucket_id = 'gambar_postingan_forum' and auth.uid()::text = (storage.foldername(name))[1]);

-- gambar_kartu_konsol (public read; tulis: super_admin saja)
create policy "gambar_kartu_konsol_insert"
on storage.objects for insert with check (bucket_id = 'gambar_kartu_konsol' and peran_staf_ini() = 'super_admin');
create policy "gambar_kartu_konsol_update"
on storage.objects for update using (bucket_id = 'gambar_kartu_konsol' and peran_staf_ini() = 'super_admin');
create policy "gambar_kartu_konsol_delete"
on storage.objects for delete using (bucket_id = 'gambar_kartu_konsol' and peran_staf_ini() = 'super_admin');

-- gambar_banner_konsol (public read; tulis: super_admin saja)
create policy "gambar_banner_konsol_insert"
on storage.objects for insert with check (bucket_id = 'gambar_banner_konsol' and peran_staf_ini() = 'super_admin');
create policy "gambar_banner_konsol_update"
on storage.objects for update using (bucket_id = 'gambar_banner_konsol' and peran_staf_ini() = 'super_admin');
create policy "gambar_banner_konsol_delete"
on storage.objects for delete using (bucket_id = 'gambar_banner_konsol' and peran_staf_ini() = 'super_admin');

-- gambar_produk_toko (public read; tulis: super_admin saja)
create policy "gambar_produk_toko_insert"
on storage.objects for insert with check (bucket_id = 'gambar_produk_toko' and peran_staf_ini() = 'super_admin');
create policy "gambar_produk_toko_update"
on storage.objects for update using (bucket_id = 'gambar_produk_toko' and peran_staf_ini() = 'super_admin');
create policy "gambar_produk_toko_delete"
on storage.objects for delete using (bucket_id = 'gambar_produk_toko' and peran_staf_ini() = 'super_admin');

-- bukti_verifikasi_teknisi (private; baca+tulis: pemilik, baca juga: moderator)
create policy "bukti_verifikasi_teknisi_select"
on storage.objects for select
using (bucket_id = 'bukti_verifikasi_teknisi' and (auth.uid()::text = (storage.foldername(name))[1] or peran_staf_ini() = 'moderator'));
create policy "bukti_verifikasi_teknisi_insert"
on storage.objects for insert
with check (bucket_id = 'bukti_verifikasi_teknisi' and auth.uid()::text = (storage.foldername(name))[1]);

-- bukti_pembayaran (private; baca: pembeli terkait + staf, tulis: pembeli)
create policy "bukti_pembayaran_select"
on storage.objects for select
using (bucket_id = 'bukti_pembayaran' and (auth.uid()::text = (storage.foldername(name))[1] or adalah_staf()));
create policy "bukti_pembayaran_insert"
on storage.objects for insert
with check (bucket_id = 'bukti_pembayaran' and auth.uid()::text = (storage.foldername(name))[1]);

-- qris_pembayaran (public read; tulis: super_admin saja)
create policy "qris_pembayaran_insert"
on storage.objects for insert with check (bucket_id = 'qris_pembayaran' and peran_staf_ini() = 'super_admin');
create policy "qris_pembayaran_update"
on storage.objects for update using (bucket_id = 'qris_pembayaran' and peran_staf_ini() = 'super_admin');
create policy "qris_pembayaran_delete"
on storage.objects for delete using (bucket_id = 'qris_pembayaran' and peran_staf_ini() = 'super_admin');

-- ============================================================
-- END OF FILE
-- ============================================================
