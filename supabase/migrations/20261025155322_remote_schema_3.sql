SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.adalah_staf()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  select exists(select 1 from public.staf where id = auth.uid());
$function$;

CREATE OR REPLACE FUNCTION public.peran_pengguna_ini()
  RETURNS public.peran_pengguna
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  select peran from public.pengguna where id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.peran_staf_ini()
  RETURNS public.peran_staf
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  select peran from public.staf where id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.tangani_pengguna_baru()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  if coalesce(new.raw_user_meta_data->>'tipe_akun', 'pengguna') = 'pengguna' then
    insert into public.pengguna (id, email, username, jenis_kelamin)
    values (
      new.id,
      new.email,
      new.raw_user_meta_data->>'username',
      (new.raw_user_meta_data->>'jenis_kelamin')::public.jenis_kelamin
    );
  elsif new.raw_user_meta_data->>'tipe_akun' = 'staf' then
    insert into public.staf (id, username, email, peran)
    values (
      new.id,
      new.raw_user_meta_data->>'username',
      new.email,
      coalesce(new.raw_user_meta_data->>'peran', 'moderator')::public.peran_staf
    );
  end if;

  return new;
end;
$function$;

ALTER TABLE "public"."baca_postingan"
  ADD CONSTRAINT "baca_postingan_pengguna_id_fkey" FOREIGN KEY (pengguna_id) REFERENCES public.pengguna(id);

ALTER TABLE "public"."baca_tutorial"
  ADD CONSTRAINT "baca_tutorial_pengguna_id_fkey" FOREIGN KEY (pengguna_id) REFERENCES public.pengguna(id);

ALTER TABLE "public"."komentar_forum"
  ADD CONSTRAINT "komentar_forum_penulis_id_fkey" FOREIGN KEY (penulis_id) REFERENCES public.pengguna(id);

ALTER TABLE "public"."komentar_tutorial"
  ADD CONSTRAINT "komentar_tutorial_penulis_id_fkey" FOREIGN KEY (penulis_id) REFERENCES public.pengguna(id);

ALTER TABLE "public"."langkah_tutorial"
  ADD CONSTRAINT "langkah_tutorial_tutorial_id_nomor_langkah_key" UNIQUE (tutorial_id, nomor_langkah);

ALTER TABLE "public"."laporan"
  ADD CONSTRAINT "laporan_ditinjau_oleh_fkey" FOREIGN KEY (ditinjau_oleh) REFERENCES public.staf(id);

ALTER TABLE "public"."laporan"
  ADD CONSTRAINT "laporan_pelapor_id_fkey" FOREIGN KEY (pelapor_id) REFERENCES public.pengguna(id);

ALTER TABLE "public"."pengajuan_teknisi"
  ADD CONSTRAINT "pengajuan_teknisi_ditinjau_oleh_fkey" FOREIGN KEY (ditinjau_oleh) REFERENCES public.staf(id);

ALTER TABLE "public"."pengajuan_teknisi"
  ADD CONSTRAINT "pengajuan_teknisi_pengguna_id_fkey" FOREIGN KEY (pengguna_id) REFERENCES public.pengguna(id);

ALTER TABLE "public"."peringatan"
  ADD CONSTRAINT "peringatan_laporan_id_fkey" FOREIGN KEY (laporan_id) REFERENCES public.laporan(id);

ALTER TABLE "public"."peringatan"
  ADD CONSTRAINT "peringatan_pengguna_id_fkey" FOREIGN KEY (pengguna_id) REFERENCES public.pengguna(id);

ALTER TABLE "public"."peringatan"
  ADD CONSTRAINT "peringatan_staf_id_fkey" FOREIGN KEY (staf_id) REFERENCES public.staf(id);

ALTER TABLE "public"."postingan_forum"
  ADD CONSTRAINT "postingan_forum_penulis_id_fkey" FOREIGN KEY (penulis_id) REFERENCES public.pengguna(id);

ALTER TABLE "public"."suka_postingan"
  ADD CONSTRAINT "suka_postingan_pengguna_id_fkey" FOREIGN KEY (pengguna_id) REFERENCES public.pengguna(id);

ALTER TABLE "public"."transaksi"
  ADD CONSTRAINT "transaksi_pembeli_id_fkey" FOREIGN KEY (pembeli_id) REFERENCES public.pengguna(id);

ALTER TABLE "public"."tutorial"
  ADD CONSTRAINT "tutorial_konsol_id_fkey" FOREIGN KEY (konsol_id) REFERENCES public.konsol(id);

ALTER TABLE "public"."tutorial"
  ADD CONSTRAINT "tutorial_penulis_id_fkey" FOREIGN KEY (penulis_id) REFERENCES public.pengguna(id);

CREATE POLICY "komentar_forum_delete" ON "public"."komentar_forum"
  FOR DELETE
  TO PUBLIC
  USING (((auth.uid() = penulis_id) OR (public.peran_staf_ini() = 'moderator'::public.peran_staf)));

CREATE POLICY "komentar_tutorial_delete" ON "public"."komentar_tutorial"
  FOR DELETE
  TO PUBLIC
  USING (((auth.uid() = penulis_id) OR (public.peran_staf_ini() = 'moderator'::public.peran_staf)));

CREATE POLICY "laporan_insert_own" ON "public"."laporan"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = pelapor_id));

CREATE POLICY "laporan_update_moderator" ON "public"."laporan"
  FOR UPDATE
  TO PUBLIC
  USING ((public.peran_staf_ini() = 'moderator'::public.peran_staf));

CREATE POLICY "pengajuan_teknisi_insert_own" ON "public"."pengajuan_teknisi"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = pengguna_id));

CREATE POLICY "pengajuan_teknisi_update_moderator" ON "public"."pengajuan_teknisi"
  FOR UPDATE
  TO PUBLIC
  USING ((public.peran_staf_ini() = 'moderator'::public.peran_staf));

CREATE POLICY "pengguna_insert_own" ON "public"."pengguna"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = id));

CREATE POLICY "pengguna_update_own_or_super_admin" ON "public"."pengguna"
  FOR UPDATE
  TO PUBLIC
  USING (((auth.uid() = id) OR (public.peran_staf_ini() = 'super_admin'::public.peran_staf)));

CREATE POLICY "peringatan_insert_moderator" ON "public"."peringatan"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((public.peran_staf_ini() = 'moderator'::public.peran_staf));

CREATE POLICY "postingan_forum_delete" ON "public"."postingan_forum"
  FOR DELETE
  TO PUBLIC
  USING (((auth.uid() = penulis_id) OR (public.peran_staf_ini() = 'moderator'::public.peran_staf)));

CREATE POLICY "transaksi_insert_pembeli" ON "public"."transaksi"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = pembeli_id));

CREATE POLICY "transaksi_update_super_admin" ON "public"."transaksi"
  FOR UPDATE
  TO PUBLIC
  USING ((public.peran_staf_ini() = 'super_admin'::public.peran_staf));

CREATE POLICY "tutorial_insert_teknisi" ON "public"."tutorial"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((public.peran_pengguna_ini() = 'teknisi'::public.peran_pengguna));

CREATE POLICY "console_media_read" ON "storage"."objects"
  FOR SELECT
  TO PUBLIC
  USING ((bucket_id = 'console-media'::text));

CREATE POLICY "gambar_tutorial_insert" ON "storage"."objects"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (((bucket_id = 'gambar_tutorial'::text) AND (((auth.uid())::text = (storage.foldername(name))[1]) OR (public.peran_staf_ini() = 'super_admin'::public.peran_staf))));

CREATE POLICY "gambar_tutorial_update" ON "storage"."objects"
  FOR UPDATE
  TO PUBLIC
  USING (((bucket_id = 'gambar_tutorial'::text) AND (((auth.uid())::text = (storage.foldername(name))[1]) OR (public.peran_staf_ini() = 'super_admin'::public.peran_staf))));

CREATE POLICY "listing_photos_read" ON "storage"."objects"
  FOR SELECT
  TO PUBLIC
  USING ((bucket_id = 'listing-photos'::text));

CREATE POLICY "listing_photos_write_own" ON "storage"."objects"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (((bucket_id = 'listing-photos'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));

CREATE POLICY "tech_evidence_write_own" ON "storage"."objects"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (((bucket_id = 'technician-evidence'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));

CREATE POLICY "tutorial_media_read" ON "storage"."objects"
  FOR SELECT
  TO PUBLIC
  USING ((bucket_id = 'tutorial-media'::text));

REVOKE ALL ON SCHEMA "public" FROM "postgres";

GRANT CREATE, USAGE ON SCHEMA "public" TO "postgres";

REVOKE ALL ON TABLE "public"."baca_postingan" FROM "anon";

GRANT SELECT ON TABLE "public"."baca_postingan" TO "anon";

REVOKE ALL ON TABLE "public"."baca_postingan" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."baca_postingan" TO "authenticated";

REVOKE ALL ON TABLE "public"."baca_tutorial" FROM "anon";

GRANT SELECT ON TABLE "public"."baca_tutorial" TO "anon";

REVOKE ALL ON TABLE "public"."baca_tutorial" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."baca_tutorial" TO "authenticated";

REVOKE ALL ON TABLE "public"."komentar_forum" FROM "anon";

GRANT SELECT ON TABLE "public"."komentar_forum" TO "anon";

REVOKE ALL ON TABLE "public"."komentar_forum" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."komentar_forum" TO "authenticated";

REVOKE ALL ON TABLE "public"."komentar_tutorial" FROM "anon";

GRANT SELECT ON TABLE "public"."komentar_tutorial" TO "anon";

REVOKE ALL ON TABLE "public"."komentar_tutorial" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."komentar_tutorial" TO "authenticated";

REVOKE ALL ON TABLE "public"."konsol" FROM "anon";

GRANT SELECT ON TABLE "public"."konsol" TO "anon";

REVOKE ALL ON TABLE "public"."konsol" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."konsol" TO "authenticated";

REVOKE ALL ON TABLE "public"."langkah_tutorial" FROM "anon";

GRANT SELECT ON TABLE "public"."langkah_tutorial" TO "anon";

REVOKE ALL ON TABLE "public"."langkah_tutorial" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."langkah_tutorial" TO "authenticated";

REVOKE ALL ON TABLE "public"."laporan" FROM "anon";

GRANT SELECT ON TABLE "public"."laporan" TO "anon";

REVOKE ALL ON TABLE "public"."laporan" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."laporan" TO "authenticated";

REVOKE ALL ON TABLE "public"."model_konsol" FROM "anon";

GRANT SELECT ON TABLE "public"."model_konsol" TO "anon";

REVOKE ALL ON TABLE "public"."model_konsol" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."model_konsol" TO "authenticated";

REVOKE ALL ON TABLE "public"."pengajuan_teknisi" FROM "anon";

GRANT SELECT ON TABLE "public"."pengajuan_teknisi" TO "anon";

REVOKE ALL ON TABLE "public"."pengajuan_teknisi" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."pengajuan_teknisi" TO "authenticated";

REVOKE ALL ON TABLE "public"."pengguna" FROM "anon";

GRANT SELECT ON TABLE "public"."pengguna" TO "anon";

REVOKE ALL ON TABLE "public"."pengguna" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."pengguna" TO "authenticated";

REVOKE ALL ON TABLE "public"."peringatan" FROM "anon";

GRANT SELECT ON TABLE "public"."peringatan" TO "anon";

REVOKE ALL ON TABLE "public"."peringatan" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."peringatan" TO "authenticated";

REVOKE ALL ON TABLE "public"."postingan_forum" FROM "anon";

GRANT SELECT ON TABLE "public"."postingan_forum" TO "anon";

REVOKE ALL ON TABLE "public"."postingan_forum" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."postingan_forum" TO "authenticated";

REVOKE ALL ON TABLE "public"."produk_toko" FROM "anon";

GRANT SELECT ON TABLE "public"."produk_toko" TO "anon";

REVOKE ALL ON TABLE "public"."produk_toko" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."produk_toko" TO "authenticated";

REVOKE ALL ON TABLE "public"."staf" FROM "anon";

GRANT SELECT ON TABLE "public"."staf" TO "anon";

REVOKE ALL ON TABLE "public"."staf" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."staf" TO "authenticated";

REVOKE ALL ON TABLE "public"."suka_postingan" FROM "anon";

GRANT SELECT ON TABLE "public"."suka_postingan" TO "anon";

REVOKE ALL ON TABLE "public"."suka_postingan" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."suka_postingan" TO "authenticated";

REVOKE ALL ON TABLE "public"."transaksi" FROM "anon";

GRANT SELECT ON TABLE "public"."transaksi" TO "anon";

REVOKE ALL ON TABLE "public"."transaksi" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."transaksi" TO "authenticated";

REVOKE ALL ON TABLE "public"."tutorial" FROM "anon";

GRANT SELECT ON TABLE "public"."tutorial" TO "anon";

REVOKE ALL ON TABLE "public"."tutorial" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."tutorial" TO "authenticated";

