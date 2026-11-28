"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { galatAlasan, galatEmail, galatPasswordBaru, galatPasswordUlang, galatUsername } from "@/lib/validasi";
import { gagal, sukses, type ActionResult } from "./hasil";

function segarkan() {
  revalidatePath("/[locale]/moderator", "layout");
  revalidatePath("/[locale]/profil", "layout");
}

export async function setujuiPengajuan(id: string): Promise<ActionResult> {
  await requireRole("moderator", "super_admin");
  const supabase = await createClient();
  const { error } = await supabase.rpc("setujui_pengajuan", { p_id: id });
  if (error) return gagal("Pengajuan tidak dapat disetujui.");
  segarkan();
  return sukses("Pengajuan disetujui.");
}

export async function tolakPengajuan(id: string, alasan: string): Promise<ActionResult> {
  await requireRole("moderator", "super_admin");
  const errorAlasan = galatAlasan(alasan, "Alasan penolakan wajib diisi.");
  if (errorAlasan) return gagal(errorAlasan, { alasan: errorAlasan });
  const supabase = await createClient();
  const { error } = await supabase.rpc("tolak_pengajuan", { p_id: id, p_alasan: alasan.trim() });
  if (error) return gagal("Pengajuan tidak dapat ditolak.");
  segarkan();
  return sukses("Pengajuan ditolak.");
}

export interface OpsiHapusKonten {
  beriPeringatan: boolean;
  alasanPeringatan: string;
}

async function tanganiLaporan(
  kunci: string,
  hapus: boolean,
  alasanPeringatan: string | null,
): Promise<ActionResult> {
  await requireRole("moderator", "super_admin");
  const pemisah = kunci.indexOf(":");
  const target = kunci.slice(0, pemisah);
  const targetId = kunci.slice(pemisah + 1);
  const jenisValid = ["postingan_forum", "komentar_forum", "komentar_tutorial"].includes(target);
  if (pemisah <= 0 || !targetId || !jenisValid) return gagal("Laporan tidak valid.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("tangani_laporan", {
    p_target: target as Database["public"]["Enums"]["target_laporan"],
    p_target_id: targetId,
    p_hapus: hapus,
    p_alasan_peringatan: alasanPeringatan,
  });
  if (error) return gagal("Laporan tidak dapat ditangani.");
  segarkan();
  return sukses(hapus ? "Konten dihapus." : "Laporan diabaikan.");
}

export async function abaikanLaporan(kunci: string): Promise<ActionResult> {
  return tanganiLaporan(kunci, false, null);
}

export async function hapusKonten(kunci: string, opsi: OpsiHapusKonten): Promise<ActionResult> {
  let alasan: string | null = null;
  if (opsi.beriPeringatan) {
    const errorAlasan = galatAlasan(opsi.alasanPeringatan, "Alasan peringatan belum diisi.");
    if (errorAlasan) return gagal(errorAlasan, { alasanPeringatan: errorAlasan });
    alasan = opsi.alasanPeringatan.trim();
  }
  return tanganiLaporan(kunci, true, alasan);
}

export type KeadaanForm = ActionResult | null;

export async function perbaruiProfil(_sebelumnya: KeadaanForm, data: FormData): Promise<ActionResult> {
  const sesi = await requireRole("moderator", "super_admin");
  const username = String(data.get("username") ?? "").trim();
  const email = String(data.get("email") ?? "").trim();
  const errorUsername = galatUsername(username);
  const errorEmail = galatEmail(email);
  const kolom: Record<string, string> = {};
  if (errorUsername) kolom.username = errorUsername;
  if (errorEmail) kolom.email = errorEmail;
  if (Object.keys(kolom).length) return gagal("Periksa kolom yang ditandai.", kolom);
  if (username === sesi.username && email === sesi.email) return gagal("Tidak ada perubahan untuk disimpan.");

  const admin = createAdminClient();
  const [{ data: pengguna, error: errorPengguna }, { data: staf, error: errorStaf }] =
    await Promise.all([
      admin.from("pengguna").select("username").neq("id", sesi.id),
      admin.from("staf").select("username").neq("id", sesi.id),
    ]);
  if (errorPengguna || errorStaf) return gagal("Nama pengguna tidak dapat diperiksa.");
  const terpakai = [...(pengguna ?? []), ...(staf ?? [])].map((row) => row.username);
  const duplikat = galatUsername(username, terpakai);
  if (duplikat) return gagal(duplikat, { username: duplikat });

  if (username !== sesi.username) {
    const { error } = await admin.from("staf").update({ username }).eq("id", sesi.id);
    if (error) return gagal(error.code === "23505" ? "Username sudah dipakai." : "Username tidak dapat disimpan.");
  }
  if (email !== sesi.email) {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ email });
    if (error) {
      return gagal(
        username !== sesi.username
          ? "Username tersimpan, tetapi tautan konfirmasi email tidak dapat dikirim."
          : "Tautan konfirmasi email tidak dapat dikirim.",
        { email: "Email tidak dapat diperbarui." },
      );
    }
  }
  segarkan();
  return sukses(
    email !== sesi.email
      ? `Profil disimpan. Tautan konfirmasi dikirim ke ${email}. Email masuk tetap ${sesi.email} sampai dikonfirmasi.`
      : "Profil disimpan.",
  );
}

export async function gantiPassword(_sebelumnya: KeadaanForm, data: FormData): Promise<ActionResult> {
  await requireRole("moderator", "super_admin");
  const lama = String(data.get("lama") ?? "");
  const baru = String(data.get("baru") ?? "");
  const ulang = String(data.get("ulang") ?? "");
  const kolom: Record<string, string> = {};
  if (!lama) kolom.lama = "Isi password saat ini.";
  const errorBaru = galatPasswordBaru(baru, lama);
  const errorUlang = galatPasswordUlang(ulang, baru);
  if (errorBaru) kolom.baru = errorBaru;
  if (errorUlang) kolom.ulang = errorUlang;
  if (Object.keys(kolom).length) return gagal("Periksa kolom yang ditandai.", kolom);

  const supabase = await createClient();
  const { data: { user }, error: errorUser } = await supabase.auth.getUser();
  if (errorUser) return gagal("Sesi tidak dapat diverifikasi.");
  if (!user?.email) return gagal("Akun tidak memiliki alamat email untuk verifikasi password.");
  const { url, anonKey } = await import("@/lib/supabase/config").then((module) => module.getSupabasePublicConfig());
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const checker = createSupabaseClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const { error: errorMasuk } = await checker.auth.signInWithPassword({ email: user.email, password: lama });
  if (errorMasuk) return gagal("Password saat ini tidak benar.", { lama: "Password saat ini tidak benar." });
  const { error } = await supabase.auth.updateUser({ password: baru });
  if (error) return gagal("Password tidak dapat diganti.");
  segarkan();
  return sukses("Password diganti.");
}
