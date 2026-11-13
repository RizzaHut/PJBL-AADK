"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { COOLDOWN_HARI, TOPIK_FORUM } from "@/lib/konstanta";
import {
  hapusBerkasMilik,
  pathDariUrlPublik,
  unggahBerkas,
} from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/server";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import {
  ATURAN_FOTO_LANGKAH,
  ATURAN_GAMBAR,
  ATURAN_PFP,
  ATURAN_VIDEO,
  galatBerkas,
  galatEmail,
  galatIsiPost,
  galatJudul,
  galatPasswordBaru,
  galatPasswordUlang,
  galatTanggalLahir,
  galatUsername,
} from "@/lib/validasi";
import { sekarangIso } from "@/lib/waktu";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { TingkatKesulitan, WaktuPengerjaan } from "@/types/domain";
import { gagal, sukses, type ActionResult } from "./hasil";

export type KeadaanForm<T = undefined> = ActionResult<T> | null;

function segarkan(...jalur: string[]) {
  revalidatePath("/[locale]/profil", "layout");
  for (const path of jalur) revalidatePath(path, "page");
}

function berkas(v: FormDataEntryValue | null): File | null {
  return v instanceof File && v.size > 0 ? v : null;
}

const teks = (data: FormData, kunci: string) => String(data.get(kunci) ?? "").trim();

async function hapusPathPunyaku(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bucket: "profile-photos" | "payment-proofs" | "technician-evidence" | "tutorial-media" | "listing-photos",
  pemilik: string,
  paths: string[],
) {
  const milik = paths
    .map((path) => pathDariUrlPublik(bucket, path))
    .filter((path) => path.startsWith(`${pemilik}/`));
  await hapusBerkasMilik(supabase, bucket, pemilik, milik);
}

/* Riwayat baca dan suka */

export async function hapusRiwayatBaca(id: string): Promise<ActionResult> {
  const sesi = await requireRole("anggota", "teknisi");
  const [jenis, targetId] = id.split(":");
  if (!targetId || (jenis !== "tutorial" && jenis !== "postingan_forum")) {
    return gagal("Riwayat tidak valid.");
  }
  const supabase = await createClient();
  const hasil =
    jenis === "tutorial"
      ? await supabase.from("baca_tutorial").delete().eq("pengguna_id", sesi.id).eq("tutorial_id", targetId).select("tutorial_id").maybeSingle()
      : await supabase.from("baca_postingan").delete().eq("pengguna_id", sesi.id).eq("postingan_id", targetId).select("postingan_id").maybeSingle();
  const { data, error } = hasil;
  if (error) return gagal("Riwayat tidak dapat dihapus.");
  if (!data) return gagal("Riwayat tidak ditemukan.");
  segarkan();
  return sukses();
}

export async function batalSuka(id: string): Promise<ActionResult> {
  const sesi = await requireRole("anggota", "teknisi");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suka_postingan")
    .delete()
    .eq("pengguna_id", sesi.id)
    .eq("postingan_id", id)
    .select("postingan_id")
    .maybeSingle();
  if (error) return gagal("Suka tidak dapat dibatalkan.");
  if (!data) return gagal("Post tidak ditemukan.");
  segarkan("/[locale]/forum");
  return sukses();
}

/* Post forum */

export async function hapusPost(id: string): Promise<ActionResult> {
  const sesi = await requireRole("anggota", "teknisi");
  const supabase = await createClient();
  const { data: post, error: errorPost } = await supabase
    .from("postingan_forum")
    .select("gambar")
    .eq("id", id)
    .eq("penulis_id", sesi.id)
    .maybeSingle();
  if (errorPost) return gagal("Post tidak dapat dimuat.");
  if (!post) return gagal("Post tidak ditemukan atau bukan milik akun ini.");
  const { error } = await supabase
    .from("postingan_forum")
    .delete()
    .eq("id", id)
    .eq("penulis_id", sesi.id);
  if (error) return gagal("Post tidak dapat dihapus.");
  await hapusPathPunyaku(supabase, "listing-photos", sesi.id, post.gambar ?? []);
  segarkan("/[locale]/forum");
  return sukses("Post dihapus.");
}

export async function simpanPost(
  _sebelumnya: KeadaanForm<{ id: string }>,
  data: FormData,
): Promise<ActionResult<{ id: string }>> {
  const sesi = await requireRole("anggota", "teknisi");
  const supabase = await createClient();
  const id = teks(data, "id");
  const judul = teks(data, "judul");
  const topik = teks(data, "topik");
  const isi = teks(data, "isi");
  const files = data.getAll("gambar").map(berkas).filter((file): file is File => file !== null);
  const kolom: Record<string, string> = {};
  const errorJudul = galatJudul(judul);
  const errorIsi = galatIsiPost(isi);
  if (errorJudul) kolom.judul = errorJudul;
  if (!(TOPIK_FORUM as readonly string[]).includes(topik)) kolom.topik = "Pilih satu topik.";
  if (errorIsi) kolom.isi = errorIsi;
  if (files.length > 3) kolom.gambar = "Maksimal 3 gambar.";
  else {
    const errorFile = files.map((file) => galatBerkas(file, ATURAN_GAMBAR)).find(Boolean);
    if (errorFile) kolom.gambar = errorFile;
  }
  if (Object.keys(kolom).length) return gagal("Periksa kolom yang ditandai.", kolom);

  let postLama: { gambar: string[] } | null = null;
  if (id) {
    const { data: row, error } = await supabase
      .from("postingan_forum")
      .select("gambar")
      .eq("id", id)
      .eq("penulis_id", sesi.id)
      .maybeSingle();
    if (error) return gagal("Post tidak dapat dimuat.");
    if (!row) return gagal("Post tidak ditemukan atau bukan milik akun ini.");
    postLama = row;
  }
  const simpan = new Set(
    data
      .getAll("gambar_tetap")
      .map(String)
      .map((path) => pathDariUrlPublik("listing-photos", path)),
  );
  const gambarLama = new Set(postLama?.gambar ?? []);
  if ([...simpan].some((path) => !gambarLama.has(path))) {
    return gagal("Daftar gambar post tidak valid.");
  }
  if (simpan.size + files.length > 3) return gagal("Maksimal 3 gambar.");

  const uploaded: string[] = [];
  try {
    for (const file of files) {
      uploaded.push(await unggahBerkas(supabase, "listing-photos", sesi.id, file));
    }
  } catch (error) {
    await hapusPathPunyaku(supabase, "listing-photos", sesi.id, uploaded);
    throw error;
  }

  const gambar = [...simpan, ...uploaded];
  const isiPost = {
    judul,
    topik: topik as Database["public"]["Enums"]["tag_topik"],
    isi,
    gambar,
  };
  const result = id
    ? await supabase
        .from("postingan_forum")
        .update(isiPost)
        .eq("id", id)
        .eq("penulis_id", sesi.id)
        .select("id")
        .maybeSingle()
    : await supabase
        .from("postingan_forum")
        .insert({ ...isiPost, penulis_id: sesi.id })
        .select("id")
        .single();
  if (result.error || !result.data) {
    await hapusPathPunyaku(supabase, "listing-photos", sesi.id, uploaded);
    return gagal("Post tidak dapat disimpan.");
  }
  if (postLama) {
    await hapusPathPunyaku(
      supabase,
      "listing-photos",
      sesi.id,
      postLama.gambar.filter((path) => !simpan.has(path)),
    );
  }
  segarkan("/[locale]/forum");
  return sukses(id ? "Post diperbarui." : "Post diterbitkan.", { id: result.data.id });
}

/* Komentar */

function pecahIdKomentar(id: string): { tabel: "komentar_forum" | "komentar_tutorial"; id: string } | null {
  const [jenis, targetId] = id.split(":");
  return targetId && (jenis === "komentar_forum" || jenis === "komentar_tutorial")
    ? { tabel: jenis, id: targetId }
    : null;
}

export async function perbaruiKomentar(id: string, isi: string): Promise<ActionResult> {
  const sesi = await requireRole("anggota", "teknisi");
  const target = pecahIdKomentar(id);
  if (!target) return gagal("Komentar tidak valid.");
  const teksKomentar = isi.trim();
  if (!teksKomentar) return gagal("Komentar tidak boleh kosong.", { isi: "Komentar tidak boleh kosong." });
  if (teksKomentar.length > 1000) return gagal("Komentar maksimal 1000 karakter.", { isi: "Komentar maksimal 1000 karakter." });
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(target.tabel)
    .update({ isi: teksKomentar })
    .eq("id", target.id)
    .eq("penulis_id", sesi.id)
    .select("id")
    .maybeSingle();
  if (error) return gagal("Komentar tidak dapat diperbarui.");
  if (!data) return gagal("Komentar tidak ditemukan atau bukan milik akun ini.");
  segarkan("/[locale]/forum");
  return sukses("Komentar diperbarui.");
}

export async function hapusKomentar(id: string): Promise<ActionResult> {
  const sesi = await requireRole("anggota", "teknisi");
  const target = pecahIdKomentar(id);
  if (!target) return gagal("Komentar tidak valid.");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(target.tabel)
    .delete()
    .eq("id", target.id)
    .eq("penulis_id", sesi.id)
    .select("id")
    .maybeSingle();
  if (error) return gagal("Komentar tidak dapat dihapus.");
  if (!data) return gagal("Komentar tidak ditemukan atau bukan milik akun ini.");
  segarkan("/[locale]/forum");
  return sukses("Komentar dihapus.");
}

/* Pesanan */

export async function kirimBuktiBayar(id: string, data: FormData): Promise<ActionResult> {
  const sesi = await requireRole("anggota", "teknisi");
  const file = berkas(data.get("bukti"));
  if (!file) return gagal("Pilih berkas bukti bayar.", { bukti: "Pilih berkas bukti bayar." });
  const errorFile = galatBerkas(file, ATURAN_GAMBAR);
  if (errorFile) return gagal(errorFile, { bukti: errorFile });
  const supabase = await createClient();
  const { data: transaksi, error: errorTransaksi } = await supabase
    .from("transaksi")
    .select("status,url_bukti_bayar")
    .eq("id", id)
    .eq("pembeli_id", sesi.id)
    .maybeSingle();
  if (errorTransaksi) return gagal("Pesanan tidak dapat dimuat.");
  if (!transaksi) return gagal("Pesanan tidak ditemukan.");
  if (transaksi.status === "completed") return gagal("Pesanan sudah selesai.");
  const lama = transaksi.url_bukti_bayar;
  const path = await unggahBerkas(supabase, "payment-proofs", sesi.id, file);
  const { error } = await supabase.rpc("kirim_bukti_bayar", { p_id: id, p_path: path });
  if (error) {
    await hapusPathPunyaku(supabase, "payment-proofs", sesi.id, [path]);
    return gagal("Bukti bayar tidak dapat dikirim.");
  }
  if (lama && lama !== path) {
    await hapusPathPunyaku(supabase, "payment-proofs", sesi.id, [lama]);
  }
  segarkan();
  return sukses(transaksi.status === "payment_uploaded" ? "Bukti bayar diganti." : "Bukti bayar terkirim.");
}

/* Pengajuan teknisi */

export async function ajukanTeknisi(_sebelumnya: KeadaanForm, data: FormData): Promise<ActionResult> {
  const sesi = await requireRole("anggota");
  const jenis = teks(data, "jenis") === "foto" ? "foto" : "video";
  const file = berkas(data.get("berkas"));
  const kolom: Record<string, string> = {};
  if (!file) kolom.berkas = `Pilih ${jenis === "video" ? "video" : "foto"} sebagai bukti.`;
  else {
    const errorFile = galatBerkas(file, jenis === "video" ? ATURAN_VIDEO : ATURAN_GAMBAR);
    if (errorFile) kolom.berkas = errorFile;
  }
  if (data.get("pernyataan") !== "on") kolom.pernyataan = "Centang pernyataan ini untuk melanjutkan.";
  if (Object.keys(kolom).length) return gagal("Periksa kolom yang ditandai.", kolom);

  const supabase = await createClient();
  const { data: riwayat, error: errorRiwayat } = await supabase
    .from("pengajuan_teknisi")
    .select("status,cooldown_sampai")
    .eq("pengguna_id", sesi.id)
    .order("diajukan_pada", { ascending: false })
    .limit(1);
  if (errorRiwayat) return gagal("Status pengajuan tidak dapat dimuat.");
  const terbaru = riwayat?.[0];
  if (terbaru?.status === "pending") return gagal("Pengajuanmu masih ditinjau.");
  if (terbaru?.cooldown_sampai && terbaru.cooldown_sampai > sekarangIso()) {
    return gagal(`Kamu boleh mengajukan lagi setelah masa tunggu ${COOLDOWN_HARI} hari berakhir.`);
  }
  const path = await unggahBerkas(supabase, "technician-evidence", sesi.id, file!);
  const { error } = await supabase.rpc("ajukan_teknisi", {
    p_url_bukti: path,
    p_jenis_bukti: jenis,
  });
  if (error) {
    await hapusPathPunyaku(supabase, "technician-evidence", sesi.id, [path]);
    return gagal("Pengajuan tidak dapat dikirim.");
  }
  segarkan();
  return sukses("Pengajuan terkirim. Moderator akan meninjaunya.");
}

/* Profil akun */

export async function perbaruiProfilSaya(_sebelumnya: KeadaanForm, data: FormData): Promise<ActionResult> {
  const sesi = await requireRole("anggota", "teknisi");
  const username = teks(data, "username");
  const tanggalLahir = teks(data, "tanggal_lahir");
  const jenisKelamin = teks(data, "jenis_kelamin");
  const foto = berkas(data.get("foto"));
  const kolom: Record<string, string> = {};
  const errorUsername = galatUsername(username);
  const errorTanggal = galatTanggalLahir(tanggalLahir, sekarangIso().slice(0, 10));
  if (errorUsername) kolom.username = errorUsername;
  if (errorTanggal) kolom.tanggal_lahir = errorTanggal;
  if (jenisKelamin && jenisKelamin !== "laki_laki" && jenisKelamin !== "perempuan") {
    kolom.jenis_kelamin = "Pilih jenis kelamin yang valid.";
  }
  if (foto) {
    const errorFoto = galatBerkas(foto, ATURAN_PFP);
    if (errorFoto) kolom.foto = errorFoto;
  }
  if (Object.keys(kolom).length) return gagal("Periksa kolom yang ditandai.", kolom);

  const supabase = await createClient();
  let pathFoto: string | null = null;
  if (foto) pathFoto = await unggahBerkas(supabase, "profile-photos", sesi.id, foto);
  const { data: lama, error: errorLama } = await supabase
    .from("pengguna")
    .select("pfp_url")
    .eq("id", sesi.id)
    .maybeSingle();
  if (errorLama || !lama) {
    if (pathFoto) await hapusPathPunyaku(supabase, "profile-photos", sesi.id, [pathFoto]);
    return gagal("Profil tidak dapat dimuat.");
  }
  const update: {
    username: string;
    tanggal_lahir: string | null;
    jenis_kelamin?: "laki_laki" | "perempuan";
    pfp_url?: string;
  } = {
    username,
    tanggal_lahir: tanggalLahir || null,
  };
  if (jenisKelamin) update.jenis_kelamin = jenisKelamin as "laki_laki" | "perempuan";
  if (pathFoto) update.pfp_url = pathFoto;
  const { error } = await supabase.from("pengguna").update(update).eq("id", sesi.id);
  if (error) {
    if (pathFoto) await hapusPathPunyaku(supabase, "profile-photos", sesi.id, [pathFoto]);
    return gagal(error.code === "23505" ? "Username sudah dipakai." : "Profil tidak dapat disimpan.");
  }
  if (pathFoto && lama.pfp_url) {
    await hapusPathPunyaku(supabase, "profile-photos", sesi.id, [lama.pfp_url]);
  }
  segarkan();
  return sukses("Profil disimpan.");
}

export async function ubahEmailSaya(_sebelumnya: KeadaanForm, data: FormData): Promise<ActionResult> {
  const sesi = await requireRole("anggota", "teknisi");
  const email = teks(data, "email");
  const errorEmail = galatEmail(email);
  if (errorEmail) return gagal(errorEmail, { email: errorEmail });
  if (email.toLowerCase() === sesi.email.toLowerCase()) return gagal("Email tidak berubah.");
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email });
  if (error) return gagal("Tautan konfirmasi email tidak dapat dikirim.");
  segarkan();
  return sukses(`Tautan konfirmasi dikirim ke ${email}. Email masuk tetap ${sesi.email} sampai dikonfirmasi.`);
}

export async function gantiPasswordSaya(_sebelumnya: KeadaanForm, data: FormData): Promise<ActionResult> {
  const sesi = await requireRole("anggota", "teknisi");
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

  const { url, anonKey } = getSupabasePublicConfig();
  const pemeriksa = createSupabaseClient<Database>(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const { error: errorMasuk } = await pemeriksa.auth.signInWithPassword({
    email: sesi.email,
    password: lama,
  });
  if (errorMasuk) return gagal("Password saat ini tidak benar.", { lama: "Password saat ini tidak benar." });
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: baru });
  if (error) return gagal("Password tidak dapat diganti.");
  segarkan();
  return sukses("Password diganti.");
}

/* Tutorial teknisi */

interface LangkahInput {
  teks: string;
  foto_tetap?: string;
}

export async function simpanTutorial(
  id: string | null,
  data: FormData,
): Promise<ActionResult<{ id: string }>> {
  const sesi = await requireRole("teknisi");
  const judul = teks(data, "judul");
  const konsolNama = teks(data, "konsol");
  const tingkat = teks(data, "tingkat");
  const waktu = teks(data, "waktu");
  const alat = data.getAll("alat").map(String).map((value) => value.trim()).filter(Boolean);
  const peringatan = teks(data, "peringatan");
  const langkahRaw = teks(data, "langkah");
  let langkah: LangkahInput[];
  try {
    const parsed: unknown = JSON.parse(langkahRaw);
    if (!Array.isArray(parsed)) throw new Error("Format langkah tidak valid.");
    langkah = parsed.map((item) => {
      if (
        !item ||
        typeof item !== "object" ||
        !("teks" in item) ||
        typeof item.teks !== "string" ||
        ("foto_tetap" in item && typeof item.foto_tetap !== "string")
      ) {
        throw new Error("Format langkah tidak valid.");
      }
      return { teks: item.teks, foto_tetap: "foto_tetap" in item ? item.foto_tetap : "" };
    });
  } catch {
    return gagal("Data langkah tidak valid.");
  }

  const kolom: Record<string, string> = {};
  const errorJudul = galatJudul(judul);
  if (errorJudul) kolom.judul = errorJudul;
  if (!konsolNama) kolom.konsol = "Pilih konsol yang dibahas.";
  if (!["mudah", "sedang", "sulit"].includes(tingkat)) kolom.tingkat = "Pilih tingkat kesulitan.";
  if (!["15_menit", "30_menit", "1_jam", "2_jam", "lebih_2_jam"].includes(waktu)) kolom.waktu = "Pilih estimasi waktu.";
  if (!alat.length) kolom.alat = "Tambahkan minimal satu alat atau bahan.";
  if (!langkah.length || langkah.some((item) => !item.teks.trim())) kolom.langkah = "Isi langkah tidak boleh kosong.";
  if (peringatan.length > 1000) kolom.peringatan = "Maksimal 1000 karakter.";
  if (Object.keys(kolom).length) return gagal("Periksa kolom yang ditandai.", kolom);

  const supabase = await createClient();
  const { data: konsol, error: errorKonsol } = await supabase
    .from("konsol")
    .select("id")
    .eq("nama", konsolNama)
    .maybeSingle();
  if (errorKonsol) return gagal("Daftar konsol tidak dapat dimuat.");
  if (!konsol) return gagal("Pilih konsol yang tersedia.", { konsol: "Konsol tidak ditemukan." });

  let langkahLama: { id: string; url_gambar: string | null }[] = [];
  if (id) {
    const { data: tutorial, error } = await supabase
      .from("tutorial")
      .select("id")
      .eq("id", id)
      .eq("penulis_id", sesi.id)
      .maybeSingle();
    if (error) return gagal("Tutorial tidak dapat dimuat.");
    if (!tutorial) return gagal("Tutorial tidak ditemukan atau bukan milik akun ini.");
    const { data, error: errorLangkah } = await supabase
      .from("langkah_tutorial")
      .select("id,url_gambar")
      .eq("tutorial_id", id);
    if (errorLangkah) return gagal("Langkah tutorial tidak dapat dimuat.");
    langkahLama = data ?? [];
  }
  const fotoLama = new Set(langkahLama.map((item) => item.url_gambar).filter((path): path is string => Boolean(path)));
  if (langkah.some((item) => item.foto_tetap && !fotoLama.has(pathDariUrlPublik("tutorial-media", item.foto_tetap)))) {
    return gagal("Foto langkah tidak valid.");
  }

  const files = langkah.map((_, index) => berkas(data.get(`langkah_foto_${index}`)));
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    if (!file) continue;
    const errorFile = galatBerkas(file, ATURAN_FOTO_LANGKAH);
    if (errorFile) return gagal(errorFile, { langkah: errorFile });
  }
  const uploaded: string[] = [];
  try {
    for (const file of files) {
      if (file) uploaded.push(await unggahBerkas(supabase, "tutorial-media", sesi.id, file));
      else uploaded.push("");
    }
  } catch (error) {
    await hapusPathPunyaku(supabase, "tutorial-media", sesi.id, uploaded);
    throw error;
  }
  const gambarTersimpan = langkah.map(
    (item, index) =>
      uploaded[index] || (item.foto_tetap ? pathDariUrlPublik("tutorial-media", item.foto_tetap) : ""),
  );
  const rpcLangkah = langkah.map((item, index) => ({
    deskripsi: item.teks.trim(),
    url_gambar: gambarTersimpan[index] || null,
  }));
  const { data: hasilId, error } = await supabase.rpc("simpan_tutorial", {
    p_id: id,
    p_judul: judul,
    p_konsol_id: konsol.id,
    p_tingkat: tingkat as TingkatKesulitan,
    p_waktu: waktu as WaktuPengerjaan,
    p_alat: alat,
    p_peringatan: peringatan || null,
    p_langkah: rpcLangkah,
  });
  if (error || !hasilId) {
    await hapusPathPunyaku(supabase, "tutorial-media", sesi.id, uploaded);
    return gagal("Tutorial tidak dapat disimpan.");
  }
  const pathDisimpan = new Set(gambarTersimpan.filter(Boolean));
  await hapusPathPunyaku(
    supabase,
    "tutorial-media",
    sesi.id,
    langkahLama
      .map((item) => item.url_gambar)
      .filter((path): path is string => path !== null && !pathDisimpan.has(path)),
  );
  segarkan("/[locale]/consoles");
  return sukses(id ? "Perubahan tutorial disimpan." : "Tutorial diterbitkan.", { id: hasilId });
}

export async function hapusTutorial(id: string): Promise<ActionResult> {
  const sesi = await requireRole("teknisi");
  const supabase = await createClient();
  const { data: tutorial, error: errorTutorial } = await supabase
    .from("tutorial")
    .select("id")
    .eq("id", id)
    .eq("penulis_id", sesi.id)
    .maybeSingle();
  if (errorTutorial) return gagal("Tutorial tidak dapat dimuat.");
  if (!tutorial) return gagal("Tutorial tidak ditemukan atau bukan milik akun ini.");
  const { data: langkah, error: errorLangkah } = await supabase
    .from("langkah_tutorial")
    .select("url_gambar")
    .eq("tutorial_id", id);
  if (errorLangkah) return gagal("Foto tutorial tidak dapat dimuat.");
  const { error } = await supabase.from("tutorial").delete().eq("id", id).eq("penulis_id", sesi.id);
  if (error) return gagal("Tutorial tidak dapat dihapus.");
  await hapusPathPunyaku(
    supabase,
    "tutorial-media",
    sesi.id,
    (langkah ?? []).map((item) => item.url_gambar).filter((path): path is string => Boolean(path)),
  );
  segarkan("/[locale]/consoles");
  return sukses("Tutorial dihapus.");
}
