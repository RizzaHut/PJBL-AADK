SET local check_function_bodies = off;

SELECT cron.unschedule('bersihkan-transaksi-pending');

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT EXECUTE ON FUNCTIONS TO PUBLIC;

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON TABLES FROM "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON TABLES FROM "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON TABLES FROM "service_role";

REVOKE ALL ON FUNCTION "public"."adalah_staf"() FROM "anon";

REVOKE ALL ON FUNCTION "public"."adalah_staf"() FROM "authenticated";

REVOKE ALL ON FUNCTION "public"."adalah_staf"() FROM "service_role";

REVOKE ALL ON FUNCTION "public"."peran_pengguna_ini"() FROM "anon";

REVOKE ALL ON FUNCTION "public"."peran_pengguna_ini"() FROM "authenticated";

REVOKE ALL ON FUNCTION "public"."peran_pengguna_ini"() FROM "service_role";

REVOKE ALL ON FUNCTION "public"."peran_staf_ini"() FROM "anon";

REVOKE ALL ON FUNCTION "public"."peran_staf_ini"() FROM "authenticated";

REVOKE ALL ON FUNCTION "public"."peran_staf_ini"() FROM "service_role";

REVOKE ALL ON FUNCTION "public"."tangani_pengguna_baru"() FROM "anon";

REVOKE ALL ON FUNCTION "public"."tangani_pengguna_baru"() FROM "authenticated";

REVOKE ALL ON FUNCTION "public"."tangani_pengguna_baru"() FROM "service_role";

REVOKE ALL ON SCHEMA "public" FROM PUBLIC;

REVOKE ALL ON SCHEMA "public" FROM "pg_database_owner";

REVOKE ALL ON TABLE "public"."baca_postingan" FROM "service_role";

REVOKE ALL ON TABLE "public"."baca_tutorial" FROM "service_role";

REVOKE ALL ON TABLE "public"."komentar_forum" FROM "service_role";

REVOKE ALL ON TABLE "public"."komentar_tutorial" FROM "service_role";

REVOKE ALL ON TABLE "public"."konsol" FROM "service_role";

REVOKE ALL ON TABLE "public"."langkah_tutorial" FROM "service_role";

REVOKE ALL ON TABLE "public"."laporan" FROM "service_role";

REVOKE ALL ON TABLE "public"."model_konsol" FROM "service_role";

REVOKE ALL ON TABLE "public"."pengajuan_teknisi" FROM "service_role";

REVOKE ALL ("dibuat_pada") ON TABLE "public"."pengguna" FROM "anon";

REVOKE ALL ("id") ON TABLE "public"."pengguna" FROM "anon";

REVOKE ALL ("peran") ON TABLE "public"."pengguna" FROM "anon";

REVOKE ALL ("pfp_url") ON TABLE "public"."pengguna" FROM "anon";

REVOKE ALL ("username") ON TABLE "public"."pengguna" FROM "anon";

REVOKE ALL ("dibuat_pada") ON TABLE "public"."pengguna" FROM "authenticated";

REVOKE ALL ("id") ON TABLE "public"."pengguna" FROM "authenticated";

REVOKE ALL ("jenis_kelamin") ON TABLE "public"."pengguna" FROM "authenticated";

REVOKE ALL ("peran") ON TABLE "public"."pengguna" FROM "authenticated";

REVOKE ALL ("pfp_url") ON TABLE "public"."pengguna" FROM "authenticated";

REVOKE ALL ("tanggal_lahir") ON TABLE "public"."pengguna" FROM "authenticated";

REVOKE ALL ("username") ON TABLE "public"."pengguna" FROM "authenticated";

REVOKE ALL ON TABLE "public"."pengguna" FROM "service_role";

REVOKE ALL ON TABLE "public"."peringatan" FROM "service_role";

REVOKE ALL ON TABLE "public"."postingan_forum" FROM "service_role";

REVOKE ALL ON TABLE "public"."produk_toko" FROM "service_role";

REVOKE ALL ON TABLE "public"."staf" FROM "service_role";

REVOKE ALL ON TABLE "public"."suka_postingan" FROM "service_role";

REVOKE ALL ON TABLE "public"."transaksi" FROM "service_role";

REVOKE ALL ON TABLE "public"."tutorial" FROM "service_role";

COMMENT ON SCHEMA "public" IS NULL;

DROP POLICY "komentar_forum_delete" ON "public"."komentar_forum";

DROP POLICY "komentar_tutorial_delete" ON "public"."komentar_tutorial";

DROP POLICY "pengguna_update_own" ON "public"."pengguna";

DROP POLICY "peringatan_delete_super_admin" ON "public"."peringatan";

DROP POLICY "postingan_forum_delete" ON "public"."postingan_forum";

DROP POLICY "staf_update_own" ON "public"."staf";

DROP POLICY "tutorial_insert_teknisi" ON "public"."tutorial";

DROP POLICY "bukti_pembayaran_delete" ON "storage"."objects";

DROP POLICY "bukti_pembayaran_update" ON "storage"."objects";

DROP POLICY "bukti_verifikasi_teknisi_delete" ON "storage"."objects";

DROP POLICY "gambar_tutorial_insert" ON "storage"."objects";

DROP POLICY "gambar_tutorial_update" ON "storage"."objects";

DROP POLICY "qris_pembayaran_delete" ON "storage"."objects";

DROP POLICY "qris_pembayaran_insert" ON "storage"."objects";

DROP POLICY "qris_pembayaran_update" ON "storage"."objects";

DROP TRIGGER "saat_auth_diperbarui" ON "auth"."users";

DROP TRIGGER "trg_diperbarui" ON "public"."komentar_forum";

DROP TRIGGER "trg_diperbarui" ON "public"."komentar_tutorial";

DROP TRIGGER "trg_diperbarui" ON "public"."pengguna";

DROP TRIGGER "trg_sebelum_pengguna_dihapus" ON "public"."pengguna";

DROP TRIGGER "trg_sinkron_username" ON "public"."pengguna";

DROP TRIGGER "trg_username_unik" ON "public"."pengguna";

DROP TRIGGER "trg_diperbarui" ON "public"."postingan_forum";

DROP TRIGGER "trg_diperbarui" ON "public"."produk_toko";

DROP TRIGGER "trg_diperbarui" ON "public"."staf";

DROP TRIGGER "trg_jaga_kolom_staf" ON "public"."staf";

DROP TRIGGER "trg_sinkron_username" ON "public"."staf";

DROP TRIGGER "trg_username_unik" ON "public"."staf";

DROP TRIGGER "trg_diperbarui" ON "public"."tutorial";

DROP INDEX "public"."idx_laporan_target";

DROP INDEX "public"."idx_satu_pengajuan_pending";

ALTER TABLE "public"."baca_postingan"
  DROP CONSTRAINT "baca_postingan_pengguna_id_fkey";

ALTER TABLE "public"."baca_tutorial"
  DROP CONSTRAINT "baca_tutorial_pengguna_id_fkey";

ALTER TABLE "public"."komentar_forum"
  DROP CONSTRAINT "komentar_forum_penulis_id_fkey";

ALTER TABLE "public"."komentar_tutorial"
  DROP CONSTRAINT "komentar_tutorial_penulis_id_fkey";

ALTER TABLE "public"."konsol"
  DROP CONSTRAINT "konsol_tahun_rilis_wajar";

ALTER TABLE "public"."langkah_tutorial"
  DROP CONSTRAINT "langkah_tutorial_urutan_unik";

ALTER TABLE "public"."laporan"
  DROP CONSTRAINT "laporan_ditinjau_oleh_fkey";

ALTER TABLE "public"."laporan"
  DROP CONSTRAINT "laporan_pelapor_id_fkey";

ALTER TABLE "public"."laporan"
  DROP CONSTRAINT "laporan_satu_per_pelapor";

ALTER TABLE "public"."laporan"
  DROP CONSTRAINT "laporan_terlapor_id_fkey";

ALTER TABLE "public"."model_konsol"
  DROP CONSTRAINT "model_konsol_tahun_rilis_wajar";

ALTER TABLE "public"."pengajuan_teknisi"
  DROP CONSTRAINT "pengajuan_teknisi_ditinjau_oleh_fkey";

ALTER TABLE "public"."pengajuan_teknisi"
  DROP CONSTRAINT "pengajuan_teknisi_pengguna_id_fkey";

ALTER TABLE "public"."peringatan"
  DROP CONSTRAINT "peringatan_laporan_id_fkey";

ALTER TABLE "public"."peringatan"
  DROP CONSTRAINT "peringatan_pengguna_id_fkey";

ALTER TABLE "public"."postingan_forum"
  DROP CONSTRAINT "postingan_forum_penulis_id_fkey";

ALTER TABLE "public"."suka_postingan"
  DROP CONSTRAINT "suka_postingan_pengguna_id_fkey";

ALTER TABLE "public"."transaksi"
  DROP CONSTRAINT "transaksi_pembeli_id_fkey";

ALTER TABLE "public"."tutorial"
  DROP CONSTRAINT "tutorial_konsol_id_fkey";

ALTER TABLE "public"."tutorial"
  DROP CONSTRAINT "tutorial_penulis_id_fkey";

DROP FUNCTION "public"."ajukan_teknisi"(text);

DROP FUNCTION "public"."bersihkan_transaksi_pending"();

DROP FUNCTION "public"."buat_laporan"(public.target_laporan, uuid, text);

DROP FUNCTION "public"."buat_transaksi"(uuid);

DROP FUNCTION "public"."daftar_pengguna_staf"();

DROP FUNCTION "public"."jaga_kolom_staf"();

DROP FUNCTION "public"."jaga_username_unik"();

DROP FUNCTION "public"."kirim_bukti_bayar"(uuid, text);

DROP FUNCTION "public"."konfirmasi_transaksi"(uuid);

DROP FUNCTION "public"."kontak_toko"();

DROP FUNCTION "public"."peringatan_saya"();

DROP FUNCTION "public"."profil_saya"();

DROP FUNCTION "public"."sebelum_pengguna_dihapus"();

DROP FUNCTION "public"."set_diperbarui_pada"();

DROP FUNCTION "public"."setujui_pengajuan"(uuid);

DROP FUNCTION "public"."sinkron_dari_auth"();

DROP FUNCTION "public"."sinkron_username"();

DROP FUNCTION "public"."tangani_laporan"(public.target_laporan, uuid, boolean, text);

DROP FUNCTION "public"."tolak_pengajuan"(uuid, text);

DROP FUNCTION "public"."ubah_peran_pengguna"(uuid, public.peran_pengguna);

ALTER TABLE "public"."laporan"
  DROP COLUMN "cuplikan_konten";

ALTER TABLE "public"."laporan"
  DROP COLUMN "judul_konten";

ALTER TABLE "public"."laporan"
  DROP COLUMN "konten_dibuat_pada";

ALTER TABLE "public"."laporan"
  DROP COLUMN "terlapor_id";

ALTER TABLE "public"."staf"
  DROP COLUMN "pfp_url";

ALTER TABLE "public"."staf"
  DROP COLUMN "qris_url";

ALTER TABLE "public"."transaksi"
  DROP COLUMN "harga_saat_beli";

DROP EXTENSION "pg_cron";

ALTER TABLE "public"."peringatan"
  ADD COLUMN "staf_id" uuid NOT NULL;

ALTER TABLE "public"."tutorial"
  ADD COLUMN "url_thumbnail" text;

ALTER TABLE "public"."konsol"
  ALTER COLUMN "tahun_rilis" DROP DEFAULT;

ALTER TABLE "public"."konsol"
  ALTER COLUMN "tahun_rilis" TYPE integer USING "tahun_rilis"::integer;

ALTER TABLE "public"."langkah_tutorial"
  ALTER COLUMN "url_gambar" DROP DEFAULT;

ALTER TABLE "public"."langkah_tutorial"
  ALTER COLUMN "url_gambar" TYPE text[] USING "url_gambar"::text[];

ALTER TABLE "public"."langkah_tutorial"
  ALTER COLUMN "url_gambar" SET DEFAULT '{}'::text[];

ALTER TABLE "public"."laporan"
  ALTER COLUMN "pelapor_id" SET NOT NULL;

ALTER TABLE "public"."model_konsol"
  ALTER COLUMN "tahun_rilis" DROP DEFAULT;

ALTER TABLE "public"."model_konsol"
  ALTER COLUMN "tahun_rilis" TYPE integer USING "tahun_rilis"::integer;

ALTER TABLE "public"."transaksi"
  ALTER COLUMN "pembeli_id" SET NOT NULL;

ALTER TABLE "public"."langkah_tutorial"
  ALTER COLUMN "url_gambar" SET DEFAULT '{}'::text[];

ALTER TYPE "public"."status_produk" ADD VALUE 'cancelled' AFTER 'sold';

