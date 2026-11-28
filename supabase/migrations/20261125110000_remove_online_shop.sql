do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    execute 'select cron.unschedule(jobid) from cron.job where jobname = ''bersihkan-transaksi-pending''';
  end if;
end;
$$;

drop trigger if exists trg_sebelum_pengguna_dihapus on public.pengguna;
drop function if exists public.sebelum_pengguna_dihapus();

create or replace function public.jaga_kolom_staf()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(public.peran_staf_ini()::text, '') <> 'super_admin' and auth.uid() is not null
     and new.peran is distinct from old.peran then
    raise exception 'Hanya Super Admin yang boleh mengubah kolom ini' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop function if exists public.bersihkan_transaksi_pending();
drop function if exists public.buat_transaksi(uuid);
drop function if exists public.kirim_bukti_bayar(uuid, text);
drop function if exists public.konfirmasi_transaksi(uuid);
drop function if exists public.kontak_toko();

drop policy if exists "gambar_produk_toko_insert" on storage.objects;
drop policy if exists "gambar_produk_toko_update" on storage.objects;
drop policy if exists "gambar_produk_toko_delete" on storage.objects;
drop policy if exists "qris_pembayaran_insert" on storage.objects;
drop policy if exists "qris_pembayaran_update" on storage.objects;
drop policy if exists "qris_pembayaran_delete" on storage.objects;
drop policy if exists "bukti_pembayaran_select" on storage.objects;
drop policy if exists "bukti_pembayaran_insert" on storage.objects;
drop policy if exists "bukti_pembayaran_update" on storage.objects;
drop policy if exists "bukti_pembayaran_delete" on storage.objects;
drop policy if exists "payment_proofs_read_owner_staff" on storage.objects;
drop policy if exists "payment_proofs_write_own" on storage.objects;

-- Storage metadata is managed by the Storage API, not direct SQL mutations.

drop table if exists public.transaksi;
drop table if exists public.produk_toko;

alter table public.staf
  drop column if exists nomor_whatsapp,
  drop column if exists qris_url;

drop type if exists public.status_transaksi;
drop type if exists public.status_produk;
drop type if exists public.kategori_produk;
drop type if exists public.kondisi_produk;
