import "server-only";

import type { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type BucketSupabase =
  | "profile-photos"
  | "technician-evidence"
  | "tutorial-media"
  | "listing-photos";

const EKSTENSI_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export async function unggahBerkas(
  supabase: SupabaseClient,
  bucket: BucketSupabase,
  pemilikId: string,
  berkas: File,
): Promise<string> {
  const ekstensi = EKSTENSI_MIME[berkas.type];
  if (!ekstensi) throw new Error("Jenis berkas tidak didukung.");

  const path = `${pemilikId}/${crypto.randomUUID()}.${ekstensi}`;
  const { error } = await supabase.storage.from(bucket).upload(path, berkas, {
    cacheControl: "3600",
    contentType: berkas.type,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export function urlBerkasPublik(
  supabase: SupabaseClient,
  bucket: BucketSupabase,
  path: string | null,
): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function urlBerkasSementara(
  supabase: SupabaseClient,
  bucket: BucketSupabase,
  path: string,
  durasiDetik = 900,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, durasiDetik);
  if (error) throw error;
  return data.signedUrl;
}

export function pathDariUrlPublik(bucket: BucketSupabase, nilai: string): string {
  const penanda = `/storage/v1/object/public/${bucket}/`;
  const posisi = nilai.indexOf(penanda);
  if (posisi < 0) return nilai;
  return decodeURIComponent(nilai.slice(posisi + penanda.length));
}

export function namaBerkas(path: string | null): string | null {
  if (!path) return null;
  const bersih = path.split(/[?#]/)[0];
  return bersih.split("/").at(-1) || null;
}

export async function hapusBerkasMilik(
  supabase: SupabaseClient,
  bucket: BucketSupabase,
  pemilikId: string,
  paths: string[],
): Promise<void> {
  const unik = [...new Set(paths.map((path) => pathDariUrlPublik(bucket, path)).filter(Boolean))];
  if (!unik.length) return;
  if (unik.some((path) => !path.startsWith(`${pemilikId}/`))) {
    throw new Error("Path Storage tidak dimiliki akun aktif.");
  }

  const { error } = await supabase.storage.from(bucket).remove(unik);
  if (error) throw error;
}
