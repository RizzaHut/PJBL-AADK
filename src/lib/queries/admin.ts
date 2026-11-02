import { cache } from "react";
import { requireRole } from "@/lib/auth/session";
import { LABEL_KATEGORI, LABEL_TRANSAKSI } from "@/lib/labels";
import { hitungStatus, terapkanTabel, type KonfigTabel, type ParamTabel } from "@/lib/table-params";
import { namaBerkas, urlBerkasPublik, urlBerkasSementara } from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/server";
import { sekarangIso } from "@/lib/waktu";
import type {
  Konsol,
  ModelKonsol,
  PengaturanToko,
  Pengguna,
  ProdukToko,
  Staf,
  Transaksi,
} from "@/types/domain";
import type { ListHasil } from "./moderasi";

export const KONFIG_KONSOL: KonfigTabel = {
  kunciCari: ["nama", "merek"],
  kunciAngka: ["tahun_rilis", "jumlah_model"],
  kunciFilter: ["merek", "tipe"],
  perHalaman: 8,
  urutBawaan: "tahun_rilis",
  arahBawaan: "desc",
};

export const KONFIG_MODEL: KonfigTabel = {
  kunciCari: ["nama", "kode"],
  kunciAngka: ["tahun_rilis"],
  perHalaman: 6,
  urutBawaan: "tahun_rilis",
  arahBawaan: "asc",
};

export const KONFIG_PRODUK: KonfigTabel = {
  kunciCari: ["judul"],
  kunciAngka: ["harga"],
  kunciStatus: "status",
  kunciFilter: ["kategori", "kondisi"],
  perHalaman: 8,
  urutBawaan: "harga",
  arahBawaan: "desc",
};

export const KONFIG_TRANSAKSI: KonfigTabel = {
  kunciCari: ["judul_produk", "pembeli_username"],
  kunciAngka: ["harga_saat_beli"],
  kunciStatus: "status",
  perHalaman: 8,
  urutBawaan: "dibuat_pada",
  arahBawaan: "desc",
};

export const KONFIG_USER: KonfigTabel = {
  kunciCari: ["username", "email"],
  kunciFilter: ["peran"],
  perHalaman: 8,
  urutBawaan: "dibuat_pada",
  arahBawaan: "desc",
};

export const KONFIG_STAF: KonfigTabel = {
  kunciCari: ["username", "email"],
  perHalaman: 8,
  urutBawaan: "username",
  arahBawaan: "asc",
};

const clientAdmin = cache(async () => {
  await requireRole("super_admin");
  return createClient();
});

function daftar<T extends object>(
  semua: T[],
  p: ParamTabel,
  k: KonfigTabel,
): ListHasil<T> {
  return {
    hasil: terapkanTabel(semua, p, k),
    hitung: k.kunciStatus ? hitungStatus(semua, k.kunciStatus) : {},
    totalSemua: semua.length,
  };
}

async function semuaStafId(): Promise<Set<string>> {
  const supabase = await clientAdmin();
  const { data, error } = await supabase.from("staf").select("id");
  if (error) throw error;
  return new Set(data.map((staf) => staf.id));
}

async function semuaPengguna(): Promise<Pengguna[]> {
  const supabase = await clientAdmin();
  const [{ data: pengguna, error: errorPengguna }, stafId] = await Promise.all([
    supabase.rpc("daftar_pengguna_staf"),
    semuaStafId(),
  ]);
  if (errorPengguna) throw errorPengguna;
  return (pengguna ?? [])
    .filter((u) => !stafId.has(u.id))
    .map((u) => ({
      ...u,
      pfp_url: urlBerkasPublik(supabase, "profile-photos", u.pfp_url),
      jenis_kelamin: u.jenis_kelamin,
      terakhir_aktif_pada: u.terakhir_aktif_pada,
    }));
}

function modelDariBaris(row: {
  id: string;
  konsol_id: string;
  nama: string;
  kode_model: string | null;
  tahun_rilis: number;
  opsi_warna: string[] | null;
  konektivitas: string[] | null;
  performa: string | null;
  media_penyimpanan: string | null;
  url_gambar_banner: string | null;
}): ModelKonsol {
  return {
    id: row.id,
    konsol_id: row.konsol_id,
    nama: row.nama,
    kode: row.kode_model ?? "",
    tahun_rilis: row.tahun_rilis,
    warna: row.opsi_warna ?? [],
    konektivitas: row.konektivitas ?? [],
    performa: row.performa ?? "",
    media_penyimpanan: row.media_penyimpanan ?? "",
    url_banner: row.url_gambar_banner,
  };
}

export interface RangkumanAdmin {
  tanggalIso: string;
  totalPengguna: number;
  totalKonsol: number;
  totalTutorial: number;
  totalProduk: number;
  transaksiMenunggu: number;
  produkDipesan: number;
  grafik: {
    bulan: string[];
    pendapatan: number[];
    penggunaBaru: number[];
    kategori: { label: string; nilai: number }[];
    status: { label: string; nilai: number }[];
  };
}

export const jumlahPerluKonfirmasi = cache(async (): Promise<number> => {
  const supabase = await clientAdmin();
  const { count, error } = await supabase
    .from("transaksi")
    .select("id", { count: "exact", head: true })
    .eq("status", "payment_uploaded");
  if (error) throw error;
  return count ?? 0;
});

function bulanBerjalan(jumlah: number): { kunci: string; label: string }[] {
  const sekarang = new Date();
  const formatter = new Intl.DateTimeFormat("id-ID", {
    month: "short",
    timeZone: "UTC",
  });
  return Array.from({ length: jumlah }, (_, index) => {
    const tanggal = new Date(
      Date.UTC(sekarang.getUTCFullYear(), sekarang.getUTCMonth() - jumlah + index + 1, 1),
    );
    return {
      kunci: tanggal.toISOString().slice(0, 7),
      label: formatter.format(tanggal),
    };
  });
}

export async function rangkumanAdmin(): Promise<RangkumanAdmin> {
  const supabase = await clientAdmin();
  const bulan = bulanBerjalan(12);
  const awal = `${bulan[0].kunci}-01T00:00:00.000Z`;
  const [
    { count: totalPenggunaMentah, error: errorPengguna },
    { data: idsStaf, error: errorStaf },
    { count: totalKonsol, error: errorKonsol },
    { count: totalTutorial, error: errorTutorial },
    { data: produk, error: errorProduk },
    { data: transaksi, error: errorTransaksi },
    { data: penggunaBaru, error: errorPenggunaBaru },
  ] = await Promise.all([
    supabase.from("pengguna").select("id", { count: "exact", head: true }),
    supabase.from("staf").select("id"),
    supabase.from("konsol").select("id", { count: "exact", head: true }),
    supabase.from("tutorial").select("id", { count: "exact", head: true }),
    supabase.from("produk_toko").select("kategori,status"),
    supabase
      .from("transaksi")
      .select("status,harga_saat_beli,dibuat_pada")
      .gte("dibuat_pada", awal),
    supabase.from("pengguna").select("dibuat_pada").gte("dibuat_pada", awal),
  ]);
  if (errorPengguna) throw errorPengguna;
  if (errorStaf) throw errorStaf;
  if (errorKonsol) throw errorKonsol;
  if (errorTutorial) throw errorTutorial;
  if (errorProduk) throw errorProduk;
  if (errorTransaksi) throw errorTransaksi;
  if (errorPenggunaBaru) throw errorPenggunaBaru;

  const staffIds = (idsStaf ?? []).map((staf) => staf.id);
  let penggunaStaf = 0;
  if (staffIds.length) {
    const { count, error } = await supabase
      .from("pengguna")
      .select("id", { count: "exact", head: true })
      .in("id", staffIds);
    if (error) throw error;
    penggunaStaf = count ?? 0;
  }

  const transaksiStatus = await Promise.all(
    (["pending", "payment_uploaded", "completed"] as const).map(async (status) => {
      const { count, error } = await supabase
        .from("transaksi")
        .select("id", { count: "exact", head: true })
        .eq("status", status);
      if (error) throw error;
      return { status, count: count ?? 0 };
    }),
  );
  const penjualanSebelumnya = new Map(bulan.map((b) => [b.kunci, 0]));
  const penggunaSebelumnya = new Map(bulan.map((b) => [b.kunci, 0]));
  for (const row of transaksi ?? []) {
    if (row.status !== "completed") continue;
    const kunci = row.dibuat_pada.slice(0, 7);
    if (penjualanSebelumnya.has(kunci)) {
      penjualanSebelumnya.set(
        kunci,
        (penjualanSebelumnya.get(kunci) ?? 0) + Number(row.harga_saat_beli),
      );
    }
  }
  for (const row of penggunaBaru ?? []) {
    const kunci = row.dibuat_pada.slice(0, 7);
    if (penggunaSebelumnya.has(kunci)) {
      penggunaSebelumnya.set(kunci, (penggunaSebelumnya.get(kunci) ?? 0) + 1);
    }
  }

  const jumlahProduk = (status: string) =>
    (produk ?? []).filter((row) => row.status === status).length;
  const kategoriProduk = (["komponen", "aksesoris", "konsol"] as const).map((kategori) => ({
    label: LABEL_KATEGORI[kategori],
    nilai: (produk ?? []).filter((row) => row.kategori === kategori).length,
  }));

  return {
    tanggalIso: sekarangIso(),
    totalPengguna: Math.max(0, (totalPenggunaMentah ?? 0) - penggunaStaf),
    totalKonsol: totalKonsol ?? 0,
    totalTutorial: totalTutorial ?? 0,
    totalProduk: produk?.length ?? 0,
    transaksiMenunggu:
      transaksiStatus.find((item) => item.status === "payment_uploaded")?.count ?? 0,
    produkDipesan: jumlahProduk("pending"),
    grafik: {
      bulan: bulan.map((item) => item.label),
      pendapatan: bulan.map((item) => penjualanSebelumnya.get(item.kunci) ?? 0),
      penggunaBaru: bulan.map((item) => penggunaSebelumnya.get(item.kunci) ?? 0),
      kategori: kategoriProduk,
      status: transaksiStatus.map((item) => ({
        label: LABEL_TRANSAKSI[item.status].teks,
        nilai: item.count,
      })),
    },
  };
}

export async function daftarKonsol(p: ParamTabel): Promise<ListHasil<Konsol>> {
  const supabase = await clientAdmin();
  const [
    { data: konsol, error: errorKonsol },
    { data: model, error: errorModel },
    { data: tutorial, error: errorTutorial },
  ] =
    await Promise.all([
      supabase.from("konsol").select("*").order("tahun_rilis", { ascending: false }),
      supabase.from("model_konsol").select("id,konsol_id"),
      supabase.from("tutorial").select("id,konsol_id"),
    ]);
  if (errorKonsol) throw errorKonsol;
  if (errorModel) throw errorModel;
  if (errorTutorial) throw errorTutorial;
  const jumlahModel = new Map<string, number>();
  const jumlahTutorial = new Map<string, number>();
  for (const row of model ?? []) {
    jumlahModel.set(row.konsol_id, (jumlahModel.get(row.konsol_id) ?? 0) + 1);
  }
  for (const row of tutorial ?? []) {
    jumlahTutorial.set(row.konsol_id, (jumlahTutorial.get(row.konsol_id) ?? 0) + 1);
  }
  const hasil = (konsol ?? []).map((row) => ({
    ...row,
    deskripsi: row.deskripsi ?? "",
    jumlah_model: jumlahModel.get(row.id) ?? 0,
    jumlah_tutorial: jumlahTutorial.get(row.id) ?? 0,
    url_gambar_kartu: urlBerkasPublik(supabase, "listing-photos", row.url_gambar_kartu),
  }));
  return daftar(hasil, p, KONFIG_KONSOL);
}

export async function detailKonsol(id: string): Promise<Konsol | null> {
  const supabase = await clientAdmin();
  const [{ data: row, error }, { count: jumlahModel, error: errorModel }, { count: jumlahTutorial, error: errorTutorial }] =
    await Promise.all([
      supabase.from("konsol").select("*").eq("id", id).maybeSingle(),
      supabase.from("model_konsol").select("id", { count: "exact", head: true }).eq("konsol_id", id),
      supabase.from("tutorial").select("id", { count: "exact", head: true }).eq("konsol_id", id),
    ]);
  if (error) throw error;
  if (errorModel) throw errorModel;
  if (errorTutorial) throw errorTutorial;
  return row
    ? {
        ...row,
        deskripsi: row.deskripsi ?? "",
        jumlah_model: jumlahModel ?? 0,
        jumlah_tutorial: jumlahTutorial ?? 0,
        url_gambar_kartu: urlBerkasPublik(supabase, "listing-photos", row.url_gambar_kartu),
      }
    : null;
}

export async function daftarModel(
  konsolId: string,
  p: ParamTabel,
): Promise<ListHasil<ModelKonsol>> {
  const supabase = await clientAdmin();
  const { data, error } = await supabase
    .from("model_konsol")
    .select("*")
    .eq("konsol_id", konsolId)
    .order("tahun_rilis", { ascending: true });
  if (error) throw error;
  return daftar((data ?? []).map(modelDariBaris), p, KONFIG_MODEL);
}

export async function detailModel(id: string): Promise<ModelKonsol | null> {
  const supabase = await clientAdmin();
  const { data, error } = await supabase.from("model_konsol").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const model = modelDariBaris(data);
  return {
    ...model,
    url_banner: urlBerkasPublik(supabase, "listing-photos", model.url_banner),
  };
}

function produkDariBaris(row: {
  id: string;
  judul: string;
  deskripsi: string;
  kategori: ProdukToko["kategori"];
  kondisi: ProdukToko["kondisi"];
  lokasi: string;
  harga: number;
  gambar: string[];
  status: ProdukToko["status"];
  dibuat_pada: string;
}): ProdukToko {
  return { ...row, harga: Number(row.harga), gambar: row.gambar ?? [] };
}

export async function daftarProduk(p: ParamTabel): Promise<ListHasil<ProdukToko>> {
  const supabase = await clientAdmin();
  const { data, error } = await supabase.from("produk_toko").select("*");
  if (error) throw error;
  return daftar(
    (data ?? []).map((row) => ({
      ...produkDariBaris(row),
      gambar: (row.gambar ?? []).map(
        (path) => urlBerkasPublik(supabase, "listing-photos", path) ?? path,
      ),
    })),
    p,
    KONFIG_PRODUK,
  );
}

export async function detailProduk(id: string): Promise<ProdukToko | null> {
  const supabase = await clientAdmin();
  const { data, error } = await supabase.from("produk_toko").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data
    ? {
        ...produkDariBaris(data),
        gambar: (data.gambar ?? []).map(
          (path) => urlBerkasPublik(supabase, "listing-photos", path) ?? path,
        ),
      }
    : null;
}

async function semuaTransaksi(): Promise<Transaksi[]> {
  const supabase = await clientAdmin();
  const { data, error } = await supabase
    .from("transaksi")
    .select("id,produk_id,pembeli_id,harga_saat_beli,status,url_bukti_bayar,dibuat_pada,selesai_pada");
  if (error) throw error;
  const rows = data ?? [];
  const produkIds = [...new Set(rows.map((row) => row.produk_id))];
  const pembeliIds = [...new Set(rows.map((row) => row.pembeli_id).filter((id): id is string => Boolean(id)))];
  const [{ data: produk, error: errorProduk }, { data: pengguna, error: errorPengguna }] =
    await Promise.all([
      produkIds.length
        ? supabase.from("produk_toko").select("id,judul").in("id", produkIds)
        : Promise.resolve({ data: [], error: null }),
      pembeliIds.length
        ? supabase.from("pengguna").select("id,username").in("id", pembeliIds)
        : Promise.resolve({ data: [], error: null }),
    ]);
  if (errorProduk) throw errorProduk;
  if (errorPengguna) throw errorPengguna;
  const judulProduk = new Map((produk ?? []).map((item) => [item.id, item.judul]));
  const usernamePembeli = new Map((pengguna ?? []).map((item) => [item.id, item.username]));
  return rows.map((row) => ({
    ...row,
    judul_produk: judulProduk.get(row.produk_id) ?? "Produk dihapus",
    pembeli_username: row.pembeli_id ? usernamePembeli.get(row.pembeli_id) ?? null : null,
    harga_saat_beli: Number(row.harga_saat_beli),
    url_bukti_bayar: namaBerkas(row.url_bukti_bayar),
  }));
}

export async function daftarTransaksi(p: ParamTabel): Promise<ListHasil<Transaksi>> {
  return daftar(await semuaTransaksi(), p, KONFIG_TRANSAKSI);
}

export async function detailTransaksi(id: string): Promise<Transaksi | null> {
  const supabase = await clientAdmin();
  const transaksi = (await semuaTransaksi()).find((row) => row.id === id);
  if (!transaksi) return null;
  const { data, error } = await supabase
    .from("transaksi")
    .select("url_bukti_bayar")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return {
    ...transaksi,
    url_bukti_bayar: data?.url_bukti_bayar
      ? await urlBerkasSementara(supabase, "payment-proofs", data.url_bukti_bayar)
      : null,
  };
}

export async function pengaturanToko(): Promise<PengaturanToko> {
  const supabase = await clientAdmin();
  const { data, error } = await supabase.rpc("kontak_toko");
  if (error) throw error;
  const setting = data[0];
  return {
    nomor_whatsapp: setting?.nomor_whatsapp ?? "",
    nama_qris: namaBerkas(setting?.qris_url ?? null),
  };
}

export async function daftarUser(p: ParamTabel): Promise<ListHasil<Pengguna>> {
  return daftar(await semuaPengguna(), p, KONFIG_USER);
}

export async function detailUser(id: string): Promise<Pengguna | null> {
  const stafId = await semuaStafId();
  if (stafId.has(id)) return null;
  return (await semuaPengguna()).find((pengguna) => pengguna.id === id) ?? null;
}

export async function daftarStaf(p: ParamTabel): Promise<ListHasil<Staf>> {
  const supabase = await clientAdmin();
  const [{ data: staf, error }, { data: pengguna, error: errorPengguna }] = await Promise.all([
    supabase.from("staf").select("*"),
    supabase.from("pengguna").select("id"),
  ]);
  if (error) throw error;
  if (errorPengguna) throw errorPengguna;
  const penggunaId = new Set((pengguna ?? []).map((row) => row.id));
  const hasil = (staf ?? []).map((row) => ({
    ...row,
    pfp_url: urlBerkasPublik(supabase, "profile-photos", row.pfp_url),
    asal: penggunaId.has(row.id) ? "promosi" as const : "undangan" as const,
    nomor_whatsapp: row.nomor_whatsapp ?? null,
    qris_url: row.qris_url ?? null,
  }));
  return daftar(hasil, p, KONFIG_STAF);
}
