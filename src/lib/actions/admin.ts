"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { ATURAN_FOTO_KARTU, ATURAN_GAMBAR, bacaHarga, galatBerkas, galatEmail, galatHarga, galatNamaWajib, galatTahunRilis, galatUsername, galatWhatsapp } from "@/lib/validasi";
import {
  hapusBerkasMilik,
  pathDariUrlPublik,
  unggahBerkas,
} from "@/lib/supabase/storage";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { gagal, sukses, type ActionResult } from "./hasil";
import type { KeadaanForm } from "./profil";
import type { KategoriProduk, KondisiProduk, Merek, PeranPengguna, TipeKonsol } from "@/types/domain";

function segarkan(...jalur: string[]) {
  revalidatePath("/[locale]/admin", "layout");
  for (const path of jalur) revalidatePath(path, "page");
}

function teks(data: FormData, kunci: string) {
  return String(data.get(kunci) ?? "").trim();
}

function berkas(v: FormDataEntryValue | null): File | null {
  return v instanceof File && v.size > 0 ? v : null;
}

async function hapusPathPunyaku(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bucket: "listing-photos",
  pemilik: string,
  paths: string[],
) {
  const milik = paths
    .map((path) => pathDariUrlPublik(bucket, path))
    .filter((path) => path.startsWith(`${pemilik}/`));
  await hapusBerkasMilik(supabase, bucket, pemilik, milik);
}

const MEREK: Merek[] = ["Nintendo", "Playstation", "Xbox"];
const TIPE: TipeKonsol[] = ["home_console", "hybrid_console", "handheld_console"];
const KATEGORI: KategoriProduk[] = ["konsol", "aksesoris", "komponen"];
const KONDISI: KondisiProduk[] = ["baru", "bekas"];

export async function simpanKonsol(_sebelumnya: KeadaanForm<{ id: string }>, data: FormData): Promise<ActionResult<{ id: string }>> {
  const sesi = await requireRole("super_admin");
  const supabase = await createClient();
  const id = teks(data, "id");
  const merek = teks(data, "merek") as Merek;
  const tipe = teks(data, "tipe") as TipeKonsol;
  const nama = teks(data, "nama");
  const deskripsi = teks(data, "deskripsi");
  const tahun = teks(data, "tahun");
  const foto = berkas(data.get("foto"));
  const kolom: Record<string, string> = {};
  if (!MEREK.includes(merek)) kolom.merek = "Pilih merek.";
  if (!TIPE.includes(tipe)) kolom.tipe = "Pilih tipe.";
  const errorNama = galatNamaWajib(nama, "Nama konsol wajib diisi.");
  if (errorNama) kolom.nama = errorNama;
  if (deskripsi.length > 1000) kolom.deskripsi = "Maksimal 1000 karakter.";
  const errorTahun = galatTahunRilis(tahun);
  if (errorTahun) kolom.tahun = errorTahun;
  if (foto) {
    const errorFoto = galatBerkas(foto, ATURAN_FOTO_KARTU);
    if (errorFoto) kolom.foto = errorFoto;
  }
  if (Object.keys(kolom).length) return gagal("Periksa kolom yang ditandai.", kolom);

  const { data: duplikat, error: errorDuplikat } = await supabase
    .from("konsol")
    .select("id")
    .ilike("nama", nama)
    .neq("id", id || "00000000-0000-0000-0000-000000000000")
    .maybeSingle();
  if (errorDuplikat) return gagal("Nama konsol tidak dapat diperiksa.");
  if (duplikat) return gagal("Nama konsol sudah ada.", { nama: "Nama konsol sudah ada." });
  const { data: lama, error: errorLama } = id
    ? await supabase.from("konsol").select("url_gambar_kartu").eq("id", id).maybeSingle()
    : { data: null, error: null };
  if (errorLama) return gagal("Konsol tidak dapat dimuat.");
  if (id && !lama) return gagal("Konsol tidak ditemukan.");

  const pathFoto = foto ? await unggahBerkas(supabase, "listing-photos", sesi.id, foto) : null;
  const values = {
    nama,
    merek,
    tipe,
    deskripsi: deskripsi || null,
    tahun_rilis: Number(tahun),
    ...(pathFoto ? { url_gambar_kartu: pathFoto } : {}),
  };
  const hasil = id
    ? await supabase.from("konsol").update(values).eq("id", id).select("id").maybeSingle()
    : await supabase.from("konsol").insert(values).select("id").single();
  if (hasil.error || !hasil.data) {
    if (pathFoto) await hapusPathPunyaku(supabase, "listing-photos", sesi.id, [pathFoto]);
    return gagal("Konsol tidak dapat disimpan.");
  }
  if (pathFoto && lama?.url_gambar_kartu) {
    await hapusPathPunyaku(supabase, "listing-photos", sesi.id, [lama.url_gambar_kartu]);
  }
  segarkan("/[locale]/consoles");
  return sukses(id ? "Konsol diperbarui." : "Konsol ditambahkan.", { id: hasil.data.id });
}

export async function hapusKonsol(id: string): Promise<ActionResult> {
  const sesi = await requireRole("super_admin");
  const supabase = await createClient();
  const { data: konsol, error: errorKonsol } = await supabase
    .from("konsol")
    .select("url_gambar_kartu")
    .eq("id", id)
    .maybeSingle();
  if (errorKonsol) return gagal("Konsol tidak dapat dimuat.");
  if (!konsol) return gagal("Konsol tidak ditemukan.");
  const { error } = await supabase.from("konsol").delete().eq("id", id);
  if (error) return gagal("Konsol tidak dapat dihapus. Hapus atau pindahkan tutorial terkait terlebih dahulu.");
  if (konsol.url_gambar_kartu) {
    await hapusPathPunyaku(supabase, "listing-photos", sesi.id, [konsol.url_gambar_kartu]);
  }
  segarkan("/[locale]/consoles");
  return sukses("Konsol dihapus.");
}

export async function simpanModel(_sebelumnya: KeadaanForm<{ id: string }>, data: FormData): Promise<ActionResult<{ id: string }>> {
  const sesi = await requireRole("super_admin");
  const supabase = await createClient();
  const id = teks(data, "id");
  const konsolId = teks(data, "konsol_id");
  const nama = teks(data, "nama");
  const tahun = teks(data, "tahun");
  const kode = teks(data, "kode");
  const banner = berkas(data.get("banner"));
  const warna = data.getAll("warna").map(String).map((value) => value.trim()).filter(Boolean);
  const konektivitas = data.getAll("konektivitas").map(String).map((value) => value.trim()).filter(Boolean);
  const kolom: Record<string, string> = {};
  const errorNama = galatNamaWajib(nama, "Nama model wajib diisi.");
  const errorTahun = galatTahunRilis(tahun);
  if (errorNama) kolom.nama = errorNama;
  if (errorTahun) kolom.tahun = errorTahun;
  if (kode.length > 40) kolom.kode = "Maksimal 40 karakter.";
  if (banner) {
    const errorBanner = galatBerkas(banner, ATURAN_FOTO_KARTU);
    if (errorBanner) kolom.banner = errorBanner;
  }
  if (Object.keys(kolom).length) return gagal("Periksa kolom yang ditandai.", kolom);

  const { data: konsol, error: errorKonsol } = await supabase.from("konsol").select("id").eq("id", konsolId).maybeSingle();
  if (errorKonsol) return gagal("Konsol tidak dapat dimuat.");
  if (!konsol) return gagal("Konsol tidak ditemukan.");
  const { data: lama, error: errorLama } = id
    ? await supabase.from("model_konsol").select("url_gambar_banner").eq("id", id).eq("konsol_id", konsolId).maybeSingle()
    : { data: null, error: null };
  if (errorLama) return gagal("Model tidak dapat dimuat.");
  if (id && !lama) return gagal("Model tidak ditemukan.");
  const pathBanner = banner ? await unggahBerkas(supabase, "listing-photos", sesi.id, banner) : null;
  const values = {
    konsol_id: konsolId,
    nama,
    kode_model: kode || null,
    tahun_rilis: Number(tahun),
    performa: teks(data, "performa") || null,
    media_penyimpanan: teks(data, "media") || null,
    opsi_warna: warna,
    konektivitas,
    ...(pathBanner ? { url_gambar_banner: pathBanner } : {}),
  };
  const hasil = id
    ? await supabase.from("model_konsol").update(values).eq("id", id).eq("konsol_id", konsolId).select("id").maybeSingle()
    : await supabase.from("model_konsol").insert(values).select("id").single();
  if (hasil.error || !hasil.data) {
    if (pathBanner) await hapusPathPunyaku(supabase, "listing-photos", sesi.id, [pathBanner]);
    return gagal("Model tidak dapat disimpan.");
  }
  if (pathBanner && lama?.url_gambar_banner) {
    await hapusPathPunyaku(supabase, "listing-photos", sesi.id, [lama.url_gambar_banner]);
  }
  segarkan("/[locale]/consoles");
  return sukses(id ? "Model diperbarui." : "Model ditambahkan.", { id: hasil.data.id });
}

export async function hapusModel(id: string): Promise<ActionResult> {
  const sesi = await requireRole("super_admin");
  const supabase = await createClient();
  const { data: model, error: errorModel } = await supabase.from("model_konsol").select("url_gambar_banner").eq("id", id).maybeSingle();
  if (errorModel) return gagal("Model tidak dapat dimuat.");
  if (!model) return gagal("Model tidak ditemukan.");
  const { error } = await supabase.from("model_konsol").delete().eq("id", id);
  if (error) return gagal("Model tidak dapat dihapus.");
  if (model.url_gambar_banner) {
    await hapusPathPunyaku(supabase, "listing-photos", sesi.id, [model.url_gambar_banner]);
  }
  segarkan("/[locale]/consoles");
  return sukses("Model dihapus.");
}

export async function simpanProduk(_sebelumnya: KeadaanForm<{ id: string }>, data: FormData): Promise<ActionResult<{ id: string }>> {
  const sesi = await requireRole("super_admin");
  const supabase = await createClient();
  const id = teks(data, "id");
  const judul = teks(data, "judul");
  const kategori = teks(data, "kategori") as KategoriProduk;
  const kondisi = teks(data, "kondisi") as KondisiProduk;
  const lokasi = teks(data, "lokasi");
  const harga = teks(data, "harga");
  const deskripsi = teks(data, "deskripsi");
  const files = data.getAll("foto").map(berkas).filter((file): file is File => file !== null);
  const kolom: Record<string, string> = {};
  const errorJudul = galatNamaWajib(judul, "Judul produk wajib diisi.");
  const errorHarga = galatHarga(harga);
  if (errorJudul) kolom.judul = errorJudul;
  if (!KATEGORI.includes(kategori)) kolom.kategori = "Pilih kategori.";
  if (!KONDISI.includes(kondisi)) kolom.kondisi = "Pilih kondisi.";
  if (!lokasi) kolom.lokasi = "Lokasi wajib diisi.";
  if (deskripsi.length > 2000) kolom.deskripsi = "Maksimal 2000 karakter.";
  if (errorHarga) kolom.harga = errorHarga;
  if (files.length > 5) kolom.foto = "Maksimal 5 foto.";
  else {
    const errorFoto = files.map((file) => galatBerkas(file, ATURAN_GAMBAR)).find(Boolean);
    if (errorFoto) kolom.foto = errorFoto;
  }
  if (Object.keys(kolom).length) return gagal("Periksa kolom yang ditandai.", kolom);

  const { data: lama, error: errorLama } = id
    ? await supabase.from("produk_toko").select("gambar,status").eq("id", id).maybeSingle()
    : { data: null, error: null };
  if (errorLama) return gagal("Produk tidak dapat dimuat.");
  if (id && !lama) return gagal("Produk tidak ditemukan.");
  if (lama && lama.status !== "available") return gagal("Produk terkait transaksi dan tidak dapat diubah.");
  const gambarTetap = new Set(
    data.getAll("foto_tetap").map(String).map((path) => pathDariUrlPublik("listing-photos", path)),
  );
  const gambarLama = new Set(lama?.gambar ?? []);
  if ([...gambarTetap].some((path) => !gambarLama.has(path))) return gagal("Daftar foto produk tidak valid.");
  if (gambarTetap.size + files.length > 5) return gagal("Maksimal 5 foto.", { foto: "Maksimal 5 foto." });
  const uploaded: string[] = [];
  try {
    for (const file of files) uploaded.push(await unggahBerkas(supabase, "listing-photos", sesi.id, file));
  } catch (error) {
    await hapusPathPunyaku(supabase, "listing-photos", sesi.id, uploaded);
    throw error;
  }
  const gambar = [...gambarTetap, ...uploaded];
  const values = {
    judul,
    deskripsi,
    kategori,
    kondisi,
    lokasi,
    harga: bacaHarga(harga),
    gambar,
  };
  const hasil = id
    ? await supabase.from("produk_toko").update(values).eq("id", id).select("id").maybeSingle()
    : await supabase.from("produk_toko").insert(values).select("id").single();
  if (hasil.error || !hasil.data) {
    await hapusPathPunyaku(supabase, "listing-photos", sesi.id, uploaded);
    return gagal("Produk tidak dapat disimpan.");
  }
  if (lama) {
    await hapusPathPunyaku(
      supabase,
      "listing-photos",
      sesi.id,
      lama.gambar.filter((path) => !gambarTetap.has(path)),
    );
  }
  segarkan("/[locale]/home");
  return sukses(id ? "Produk diperbarui." : "Produk ditambahkan.", { id: hasil.data.id });
}

export async function hapusProduk(id: string): Promise<ActionResult> {
  const sesi = await requireRole("super_admin");
  const supabase = await createClient();
  const { data: produk, error: errorProduk } = await supabase.from("produk_toko").select("judul,status,gambar").eq("id", id).maybeSingle();
  if (errorProduk) return gagal("Produk tidak dapat dimuat.");
  if (!produk) return gagal("Produk tidak ditemukan.");
  if (produk.status !== "available") return gagal(`“${produk.judul}” terkait transaksi, jadi tidak bisa dihapus.`);
  const { error } = await supabase.from("produk_toko").delete().eq("id", id);
  if (error) return gagal("Produk tidak dapat dihapus.");
  await hapusPathPunyaku(supabase, "listing-photos", sesi.id, produk.gambar ?? []);
  segarkan("/[locale]/home");
  return sukses("Produk dihapus.");
}

export async function konfirmasiTransaksi(id: string): Promise<ActionResult> {
  await requireRole("super_admin");
  const supabase = await createClient();
  const { error } = await supabase.rpc("konfirmasi_transaksi", { p_id: id });
  if (error) return gagal("Transaksi tidak dapat dikonfirmasi.");
  segarkan("/[locale]/home");
  return sukses("Transaksi dikonfirmasi.");
}

export async function simpanPengaturan(_sebelumnya: KeadaanForm, data: FormData): Promise<ActionResult> {
  const sesi = await requireRole("super_admin");
  const supabase = await createClient();
  const whatsapp = teks(data, "whatsapp");
  const qris = berkas(data.get("qris"));
  const kolom: Record<string, string> = {};
  const errorWhatsapp = galatWhatsapp(whatsapp);
  if (errorWhatsapp) kolom.whatsapp = errorWhatsapp;
  if (qris) {
    const errorQris = galatBerkas(qris, ATURAN_GAMBAR);
    if (errorQris) kolom.qris = errorQris;
  }
  if (Object.keys(kolom).length) return gagal("Periksa kolom yang ditandai.", kolom);
  const { data: lama, error: errorLama } = await supabase.from("staf").select("qris_url").eq("id", sesi.id).maybeSingle();
  if (errorLama) return gagal("Pengaturan toko tidak dapat dimuat.");
  if (!lama) return gagal("Akun admin tidak ditemukan.");
  const pathQris = qris ? await unggahBerkas(supabase, "listing-photos", sesi.id, qris) : null;
  const { error } = await supabase
    .from("staf")
    .update({ nomor_whatsapp: whatsapp, ...(pathQris ? { qris_url: pathQris } : {}) })
    .eq("id", sesi.id);
  if (error) {
    if (pathQris) await hapusPathPunyaku(supabase, "listing-photos", sesi.id, [pathQris]);
    return gagal("Pengaturan toko tidak dapat disimpan.");
  }
  if (pathQris && lama.qris_url) {
    await hapusPathPunyaku(supabase, "listing-photos", sesi.id, [lama.qris_url]);
  }
  segarkan();
  return sukses("Pengaturan toko disimpan.");
}

export async function ubahPeranUser(id: string, peran: PeranPengguna): Promise<ActionResult> {
  await requireRole("super_admin");
  if (peran !== "anggota" && peran !== "teknisi") return gagal("Peran tidak valid.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("ubah_peran_pengguna", { p_id: id, p_peran: peran });
  if (error) return gagal("Peran pengguna tidak dapat diperbarui.");
  revalidatePath("/[locale]/moderator", "layout");
  segarkan();
  return sukses("Peran diperbarui.");
}

export async function jadikanModerator(id: string): Promise<ActionResult> {
  await requireRole("super_admin");
  const supabase = await createClient();
  const { data: pengguna, error: errorPengguna } = await supabase
    .from("pengguna")
    .select("id,username,email,pfp_url")
    .eq("id", id)
    .maybeSingle();
  if (errorPengguna) return gagal("Pengguna tidak dapat dimuat.");
  if (!pengguna) return gagal("Pengguna tidak ditemukan.");
  const { data: existing, error: errorExisting } = await supabase.from("staf").select("id").eq("id", id).maybeSingle();
  if (errorExisting) return gagal("Status staf tidak dapat diperiksa.");
  if (existing) return gagal("Akun ini sudah menjadi staf.");
  const { error } = await supabase.from("staf").insert({
    id: pengguna.id,
    username: pengguna.username,
    email: pengguna.email,
    pfp_url: pengguna.pfp_url,
    peran: "moderator",
  });
  if (error) return gagal("Akun tidak dapat dijadikan moderator.");
  segarkan();
  return sukses("Akun dijadikan moderator.");
}

export async function hapusUser(id: string): Promise<ActionResult> {
  await requireRole("super_admin");
  const admin = createAdminClient();
  const { data: staf, error: errorStaf } = await admin.from("staf").select("id").eq("id", id).maybeSingle();
  if (errorStaf) return gagal("Status akun tidak dapat diperiksa.");
  if (staf) return gagal("Akun staf tidak dapat dihapus sebagai pengguna.");
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return gagal("Akun tidak dapat dihapus.");
  segarkan();
  return sukses("Akun dihapus.");
}

export async function undangModerator(_sebelumnya: KeadaanForm, data: FormData): Promise<ActionResult> {
  await requireRole("super_admin");
  const username = teks(data, "username");
  const email = teks(data, "email");
  const kolom: Record<string, string> = {};
  const errorUsername = galatUsername(username);
  const errorEmail = galatEmail(email);
  if (errorUsername) kolom.username = errorUsername;
  if (errorEmail) kolom.email = errorEmail;
  if (Object.keys(kolom).length) return gagal("Periksa kolom yang ditandai.", kolom);

  const admin = createAdminClient();
  const [{ data: pengguna, error: errorPengguna }, { data: staf, error: errorStaf }] =
    await Promise.all([
      admin.from("pengguna").select("username,email"),
      admin.from("staf").select("username,email"),
    ]);
  if (errorPengguna || errorStaf) return gagal("Akun terdaftar tidak dapat diperiksa.");
  const accounts = [...(pengguna ?? []), ...(staf ?? [])];
  if (accounts.some((item) => item.username.toLowerCase() === username.toLowerCase())) {
    return gagal("Username sudah dipakai.", { username: "Username sudah dipakai." });
  }
  if (accounts.some((item) => item.email.toLowerCase() === email.toLowerCase())) {
    return gagal("Email sudah terdaftar.", { email: "Email sudah terdaftar." });
  }
  const { data: invited, error: errorInvite } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { username, tipe_akun: "staf" },
  });
  if (errorInvite) return gagal("Undangan tidak dapat dikirim.");
  if (!invited.user) return gagal("Undangan tidak menghasilkan akun.");
  const { error: errorInsert } = await admin.from("staf").insert({
    id: invited.user.id,
    username,
    email,
    peran: "moderator",
  });
  if (errorInsert) {
    const { error: errorCleanup } = await admin.auth.admin.deleteUser(invited.user.id);
    if (errorCleanup) throw new AggregateError([errorInsert, errorCleanup], "Undangan moderator gagal dibersihkan.");
    return gagal("Undangan tidak dapat disimpan sebagai staf.");
  }
  segarkan();
  return sukses(`Undangan dikirim ke ${email}.`);
}

export async function cabutModerator(id: string): Promise<ActionResult> {
  await requireRole("super_admin");
  const supabase = await createClient();
  const { data: staf, error: errorStaf } = await supabase
    .from("staf")
    .select("peran")
    .eq("id", id)
    .maybeSingle();
  if (errorStaf) return gagal("Akun staf tidak dapat dimuat.");
  if (!staf) return gagal("Moderator tidak ditemukan.");
  if (staf.peran !== "moderator") return gagal("Hanya akun moderator yang bisa dicabut.");
  const { error } = await supabase.from("staf").delete().eq("id", id);
  if (error) return gagal("Akun moderator tidak dapat dicabut.");
  segarkan();
  return sukses("Akun moderator dicabut.");
}
