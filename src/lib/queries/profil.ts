import { cache } from "react";
import { requireRole } from "@/lib/auth/session";
import { BATAS_BAYAR_JAM } from "@/lib/konstanta";
import { hitungStatus, terapkanTabel, type KonfigTabel, type ParamTabel } from "@/lib/table-params";
import {
  namaBerkas,
  urlBerkasPublik,
} from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/server";
import { menitSampai, sekarangIso, tambahJam } from "@/lib/waktu";
import type {
  KeadaanPengajuan,
  KomentarSaya,
  PengajuanSaya,
  PesananSaya,
  PeringatanSaya,
  PostDisukai,
  PostSaya,
  ProfilSaya,
  RiwayatBaca,
  Sesi,
  TutorialSaya,
} from "@/types/domain";
import type { ListHasil } from "./moderasi";

export const KONFIG_BACA: KonfigTabel = {
  kunciCari: ["judul", "keterangan"],
  kunciStatus: "jenis",
  perHalaman: 8,
  urutBawaan: "dibaca_pada",
  arahBawaan: "desc",
};

export const KONFIG_POST_DIBUAT: KonfigTabel = {
  kunciCari: ["judul", "topik"],
  kunciAngka: ["jumlah_suka", "jumlah_komentar"],
  kunciFilter: ["topik"],
  perHalaman: 8,
  urutBawaan: "dibuat_pada",
  arahBawaan: "desc",
};

export const KONFIG_POST_DISUKAI: KonfigTabel = {
  kunciCari: ["judul", "penulis_username", "topik"],
  kunciAngka: ["jumlah_suka"],
  kunciFilter: ["topik"],
  perHalaman: 8,
  urutBawaan: "disukai_pada",
  arahBawaan: "desc",
};

export const KONFIG_KOMENTAR: KonfigTabel = {
  kunciCari: ["isi", "terkait"],
  kunciStatus: "jenis",
  perHalaman: 8,
  urutBawaan: "dibuat_pada",
  arahBawaan: "desc",
};

export const KONFIG_PESANAN: KonfigTabel = {
  kunciCari: ["judul_produk", "kode"],
  kunciAngka: ["harga_saat_beli"],
  kunciStatus: "status",
  perHalaman: 8,
  urutBawaan: "dibuat_pada",
  arahBawaan: "desc",
};

export const KONFIG_PERINGATAN_SAYA: KonfigTabel = {
  kunciCari: ["alasan", "cuplikan_konten"],
  perHalaman: 8,
  urutBawaan: "dibuat_pada",
  arahBawaan: "desc",
};

export const KONFIG_TUTORIAL: KonfigTabel = {
  kunciCari: ["judul", "konsol"],
  kunciAngka: ["pembaca", "jumlah_komentar"],
  kunciFilter: ["konsol", "tingkat"],
  perHalaman: 8,
  urutBawaan: "dibuat_pada",
  arahBawaan: "desc",
};

type DbClient = Awaited<ReturnType<typeof createClient>>;

interface KonteksProfil {
  sesi: Sesi;
  supabase: DbClient;
  profil: ProfilSaya;
}

const sesiProfil = cache(async (): Promise<KonteksProfil> => {
  const sesi = await requireRole("anggota", "teknisi");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("profil_saya");
  if (error) throw error;
  const baris = data[0];
  if (!baris) throw new Error("Profil pengguna tidak ditemukan.");
  return {
    sesi,
    supabase,
    profil: {
      id: baris.id,
      username: baris.username,
      email: baris.email,
      jenis_kelamin: baris.jenis_kelamin,
      pfp_url: urlBerkasPublik(supabase, "profile-photos", baris.pfp_url),
      tanggal_lahir: baris.tanggal_lahir,
      peran: baris.peran,
      terakhir_aktif_pada: baris.terakhir_aktif_pada ?? baris.dibuat_pada,
      dibuat_pada: baris.dibuat_pada,
    },
  };
});

function daftar<T extends object>(
  semua: T[],
  p: ParamTabel,
  konfig: KonfigTabel,
): ListHasil<T> {
  return {
    hasil: terapkanTabel(semua, p, konfig),
    hitung: konfig.kunciStatus ? hitungStatus(semua, konfig.kunciStatus) : {},
    totalSemua: semua.length,
  };
}

export const profilSaya = cache(async (): Promise<ProfilSaya> => (await sesiProfil()).profil);

export interface InfoBayar {
  batas: string;
  sisaMenit: number;
}

export function infoBayar(pesanan: PesananSaya): InfoBayar {
  const batas = tambahJam(pesanan.dibuat_pada, BATAS_BAYAR_JAM);
  return { batas, sisaMenit: menitSampai(batas) };
}

export const jumlahMenungguBayar = cache(async (): Promise<number> => {
  const { sesi, supabase } = await sesiProfil();
  const { count, error } = await supabase
    .from("transaksi")
    .select("id", { count: "exact", head: true })
    .eq("pembeli_id", sesi.id)
    .eq("status", "pending");
  if (error) throw error;
  return count ?? 0;
});

export function keadaanPengajuan(data: {
  me: Pick<ProfilSaya, "peran">;
  pengajuan: PengajuanSaya[];
}): KeadaanPengajuan {
  if (data.me.peran === "teknisi") return "teknisi";
  const terbaru = [...data.pengajuan].sort((a, b) => b.diajukan_pada.localeCompare(a.diajukan_pada))[0];
  if (!terbaru || terbaru.status === "approved") return "baru";
  if (terbaru.status === "pending") return "menunggu";
  return terbaru.cooldown_sampai && terbaru.cooldown_sampai > sekarangIso() ? "tunggu" : "bisa";
}

function pengajuanDariBaris(row: {
  id: string;
  status: PengajuanSaya["status"];
  diajukan_pada: string;
  jenis_bukti: string;
  nama_berkas: string;
  ditinjau_pada: string | null;
  alasan_penolakan: string | null;
  cooldown_sampai: string | null;
}): PengajuanSaya {
  return {
    ...row,
    jenis_bukti: row.jenis_bukti === "video" ? "video" : "foto",
  };
}

async function semuaPengajuanSaya(): Promise<PengajuanSaya[]> {
  const { sesi, supabase } = await sesiProfil();
  const { data, error } = await supabase
    .from("pengajuan_teknisi")
    .select("id,status,diajukan_pada,jenis_bukti,url_bukti,ditinjau_pada,alasan_penolakan,cooldown_sampai")
    .eq("pengguna_id", sesi.id)
    .order("diajukan_pada", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) =>
    pengajuanDariBaris({ ...row, nama_berkas: namaBerkas(row.url_bukti) ?? "Berkas bukti" }),
  );
}

export interface DataJadiTeknisi {
  keadaan: KeadaanPengajuan;
  terbaru: PengajuanSaya | null;
  riwayat: PengajuanSaya[];
}

export async function jadiTeknisi(): Promise<DataJadiTeknisi> {
  const { profil } = await sesiProfil();
  const riwayat = await semuaPengajuanSaya();
  return {
    keadaan: keadaanPengajuan({ me: profil, pengajuan: riwayat }),
    terbaru: riwayat[0] ?? null,
    riwayat,
  };
}

export interface RangkumanProfil {
  me: ProfilSaya;
  tutorialDibaca: number;
  postDibuat: number;
  komentarDibuat: number;
  merekFavorit: string;
  pesananMenungguBayar: PesananSaya[];
  keadaan: KeadaanPengajuan;
  cooldownSampai: string | null;
  teknisi: null | {
    tutorialDibuat: number;
    totalPembaca: number;
    komentarMasuk: number;
    konsolTerpopuler: string;
  };
}

async function semuaPesanan(): Promise<PesananSaya[]> {
  const { sesi, supabase } = await sesiProfil();
  const { data, error } = await supabase
    .from("transaksi")
    .select("id,produk_id,harga_saat_beli,status,url_bukti_bayar,dibuat_pada,selesai_pada")
    .eq("pembeli_id", sesi.id)
    .order("dibuat_pada", { ascending: false });
  if (error) throw error;
  const transaksi = data ?? [];
  const produkIds = [...new Set(transaksi.map((row) => row.produk_id))];
  const { data: produk, error: errorProduk } = produkIds.length
    ? await supabase.from("produk_toko").select("id,judul").in("id", produkIds)
    : { data: [], error: null };
  if (errorProduk) throw errorProduk;
  const judulById = new Map((produk ?? []).map((row) => [row.id, row.judul]));
  return transaksi.map((row) => ({
    id: row.id,
    kode: `TRX-${row.id.slice(0, 8).toUpperCase()}`,
    judul_produk: judulById.get(row.produk_id) ?? "Produk dihapus",
    harga_saat_beli: Number(row.harga_saat_beli),
    status: row.status,
    dibuat_pada: row.dibuat_pada,
    selesai_pada: row.selesai_pada,
    nama_bukti: namaBerkas(row.url_bukti_bayar),
  }));
}

export async function rangkumanProfil(): Promise<RangkumanProfil> {
  const { sesi, supabase, profil } = await sesiProfil();
  const [
    { data: riwayatTutorial, error: errorBaca },
    { count: postDibuat, error: errorPost },
    { count: komentarForum, error: errorKomentarForum },
    { count: komentarTutorial, error: errorKomentarTutorial },
    pesanan,
    pengajuan,
  ] = await Promise.all([
    supabase.from("baca_tutorial").select("tutorial_id").eq("pengguna_id", sesi.id),
    supabase.from("postingan_forum").select("id", { count: "exact", head: true }).eq("penulis_id", sesi.id),
    supabase.from("komentar_forum").select("id", { count: "exact", head: true }).eq("penulis_id", sesi.id),
    supabase.from("komentar_tutorial").select("id", { count: "exact", head: true }).eq("penulis_id", sesi.id),
    semuaPesanan(),
    semuaPengajuanSaya(),
  ]);
  if (errorBaca) throw errorBaca;
  if (errorPost) throw errorPost;
  if (errorKomentarForum) throw errorKomentarForum;
  if (errorKomentarTutorial) throw errorKomentarTutorial;

  const tutorialIds = [...new Set((riwayatTutorial ?? []).map((row) => row.tutorial_id))];
  let merekFavorit = "—";
  if (tutorialIds.length) {
    const { data: tutorial, error } = await supabase
      .from("tutorial")
      .select("konsol_id")
      .in("id", tutorialIds);
    if (error) throw error;
    const konsolIds = [...new Set((tutorial ?? []).map((row) => row.konsol_id))];
    if (konsolIds.length) {
      const { data: konsol, error: errorKonsol } = await supabase
        .from("konsol")
        .select("merek")
        .in("id", konsolIds);
      if (errorKonsol) throw errorKonsol;
      const frekuensi = new Map<string, number>();
      for (const row of konsol ?? []) {
        frekuensi.set(row.merek, (frekuensi.get(row.merek) ?? 0) + 1);
      }
      merekFavorit = [...frekuensi.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    }
  }

  const teknisi = profil.peran === "teknisi";
  let ringkasanTeknisi: RangkumanProfil["teknisi"] = null;
  if (teknisi) {
    const { data: tutorial, error } = await supabase
      .from("tutorial")
      .select("id,konsol_id")
      .eq("penulis_id", sesi.id);
    if (error) throw error;
    const milikSaya = tutorial ?? [];
    const idTutorial = milikSaya.map((row) => row.id);
    const [{ data: pembaca, error: errorPembaca }, { count: komentarMasuk, error: errorMasuk }, { data: konsol, error: errorKonsol }] =
      await Promise.all([
        idTutorial.length
          ? supabase.from("baca_tutorial").select("tutorial_id").in("tutorial_id", idTutorial)
          : Promise.resolve({ data: [], error: null }),
        idTutorial.length
          ? supabase.from("komentar_tutorial").select("id", { count: "exact", head: true }).in("tutorial_id", idTutorial)
          : Promise.resolve({ count: 0, error: null }),
        supabase.from("konsol").select("id,nama").in("id", [...new Set(milikSaya.map((row) => row.konsol_id))]),
      ]);
    if (errorPembaca) throw errorPembaca;
    if (errorMasuk) throw errorMasuk;
    if (errorKonsol) throw errorKonsol;
    const namaKonsol = new Map((konsol ?? []).map((row) => [row.id, row.nama]));
    const jumlahPerKonsol = new Map<string, number>();
    for (const row of pembaca ?? []) {
      const judul = namaKonsol.get(milikSaya.find((item) => item.id === row.tutorial_id)?.konsol_id ?? "") ?? "—";
      jumlahPerKonsol.set(judul, (jumlahPerKonsol.get(judul) ?? 0) + 1);
    }
    ringkasanTeknisi = {
      tutorialDibuat: milikSaya.length,
      totalPembaca: pembaca?.length ?? 0,
      komentarMasuk: komentarMasuk ?? 0,
      konsolTerpopuler: [...jumlahPerKonsol.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—",
    };
  }

  const terbaruPengajuan = pengajuan[0] ?? null;
  return {
    me: profil,
    tutorialDibaca: riwayatTutorial?.length ?? 0,
    postDibuat: postDibuat ?? 0,
    komentarDibuat: (komentarForum ?? 0) + (komentarTutorial ?? 0),
    merekFavorit,
    pesananMenungguBayar: pesanan
      .filter((row) => row.status === "pending")
      .sort((a, b) => infoBayar(a).sisaMenit - infoBayar(b).sisaMenit),
    keadaan: keadaanPengajuan({ me: profil, pengajuan }),
    cooldownSampai: terbaruPengajuan?.cooldown_sampai ?? null,
    teknisi: ringkasanTeknisi,
  };
}

async function semuaRiwayatBaca(): Promise<RiwayatBaca[]> {
  const { sesi, supabase } = await sesiProfil();
  const [
    { data: bacaTutorial, error: errorTutorial },
    { data: bacaPost, error: errorPost },
  ] = await Promise.all([
    supabase.from("baca_tutorial").select("tutorial_id,terakhir_dibaca_pada").eq("pengguna_id", sesi.id),
    supabase.from("baca_postingan").select("postingan_id,terakhir_dibaca_pada").eq("pengguna_id", sesi.id),
  ]);
  if (errorTutorial) throw errorTutorial;
  if (errorPost) throw errorPost;
  const tutorialIds = (bacaTutorial ?? []).map((row) => row.tutorial_id);
  const postIds = (bacaPost ?? []).map((row) => row.postingan_id);
  const { data: tutorial, error: errorJudulTutorial } = tutorialIds.length
    ? await supabase.from("tutorial").select("id,judul,konsol_id").in("id", tutorialIds)
    : { data: [], error: null };
  if (errorJudulTutorial) throw errorJudulTutorial;
  const konsolIds = [...new Set((tutorial ?? []).map((row) => row.konsol_id))];
  const [{ data: konsol, error: errorKonsol }, { data: posts, error: errorJudulPost }] =
    await Promise.all([
      konsolIds.length ? supabase.from("konsol").select("id,nama").in("id", konsolIds) : Promise.resolve({ data: [], error: null }),
      postIds.length ? supabase.from("postingan_forum").select("id,judul,topik").in("id", postIds) : Promise.resolve({ data: [], error: null }),
    ]);
  if (errorKonsol) throw errorKonsol;
  if (errorJudulPost) throw errorJudulPost;
  const tutorialById = new Map((tutorial ?? []).map((row) => [row.id, row]));
  const konsolById = new Map((konsol ?? []).map((row) => [row.id, row.nama]));
  const postById = new Map((posts ?? []).map((row) => [row.id, row]));
  return [
    ...(bacaTutorial ?? []).flatMap((row) => {
      const judul = tutorialById.get(row.tutorial_id);
      return judul
        ? [{
            id: `tutorial:${row.tutorial_id}`,
            jenis: "tutorial" as const,
            judul: judul.judul,
            keterangan: konsolById.get(judul.konsol_id) ?? "",
            dibaca_pada: row.terakhir_dibaca_pada,
          }]
        : [];
    }),
    ...(bacaPost ?? []).flatMap((row) => {
      const post = postById.get(row.postingan_id);
      return post
        ? [{
            id: `postingan_forum:${row.postingan_id}`,
            jenis: "postingan_forum" as const,
            judul: post.judul,
            keterangan: post.topik,
            dibaca_pada: row.terakhir_dibaca_pada,
          }]
        : [];
    }),
  ];
}

async function jumlahInteraksiPost(ids: string[]): Promise<Map<string, { suka: number; komentar: number }>> {
  const { supabase } = await sesiProfil();
  if (!ids.length) return new Map();
  const [{ data: suka, error: errorSuka }, { data: komentar, error: errorKomentar }] =
    await Promise.all([
      supabase.from("suka_postingan").select("postingan_id").in("postingan_id", ids),
      supabase.from("komentar_forum").select("postingan_id").in("postingan_id", ids),
    ]);
  if (errorSuka) throw errorSuka;
  if (errorKomentar) throw errorKomentar;
  const jumlah = new Map(ids.map((id) => [id, { suka: 0, komentar: 0 }]));
  for (const row of suka ?? []) jumlah.get(row.postingan_id)!.suka += 1;
  for (const row of komentar ?? []) jumlah.get(row.postingan_id)!.komentar += 1;
  return jumlah;
}

async function semuaPostSaya(): Promise<PostSaya[]> {
  const { sesi, supabase } = await sesiProfil();
  const { data, error } = await supabase
    .from("postingan_forum")
    .select("id,judul,topik,isi,gambar,dibuat_pada")
    .eq("penulis_id", sesi.id)
    .order("dibuat_pada", { ascending: false });
  if (error) throw error;
  const posts = data ?? [];
  const jumlah = await jumlahInteraksiPost(posts.map((row) => row.id));
  return posts.map((row) => ({
    ...row,
    gambar: (row.gambar ?? []).map(
      (path) => urlBerkasPublik(supabase, "listing-photos", path) ?? path,
    ),
    jumlah_suka: jumlah.get(row.id)?.suka ?? 0,
    jumlah_komentar: jumlah.get(row.id)?.komentar ?? 0,
  }));
}

async function semuaPostDisukai(): Promise<PostDisukai[]> {
  const { sesi, supabase } = await sesiProfil();
  const { data: suka, error } = await supabase
    .from("suka_postingan")
    .select("postingan_id,dibuat_pada")
    .eq("pengguna_id", sesi.id)
    .order("dibuat_pada", { ascending: false });
  if (error) throw error;
  const disukai = suka ?? [];
  const ids = disukai.map((row) => row.postingan_id);
  if (!ids.length) return [];
  const [{ data: posts, error: errorPost }, { data: jumlahSuka, error: errorSuka }] =
    await Promise.all([
      supabase.from("postingan_forum").select("id,judul,penulis_id,topik").in("id", ids),
      supabase.from("suka_postingan").select("postingan_id").in("postingan_id", ids),
    ]);
  if (errorPost) throw errorPost;
  if (errorSuka) throw errorSuka;
  const penulisIds = [...new Set((posts ?? []).map((row) => row.penulis_id))];
  const { data: penulis, error: errorPenulis } = penulisIds.length
    ? await supabase.from("pengguna").select("id,username").in("id", penulisIds)
    : { data: [], error: null };
  if (errorPenulis) throw errorPenulis;
  const postById = new Map((posts ?? []).map((row) => [row.id, row]));
  const penulisById = new Map((penulis ?? []).map((row) => [row.id, row.username]));
  const sukaById = new Map<string, number>();
  for (const row of jumlahSuka ?? []) {
    sukaById.set(row.postingan_id, (sukaById.get(row.postingan_id) ?? 0) + 1);
  }
  return disukai.flatMap((row) => {
    const post = postById.get(row.postingan_id);
    return post
      ? [{
          id: post.id,
          judul: post.judul,
          penulis_username: penulisById.get(post.penulis_id) ?? "akun dihapus",
          topik: post.topik,
          jumlah_suka: sukaById.get(post.id) ?? 0,
          disukai_pada: row.dibuat_pada,
        }]
      : [];
  });
}

async function semuaKomentarSaya(): Promise<KomentarSaya[]> {
  const { sesi, supabase } = await sesiProfil();
  const [{ data: forum, error: errorForum }, { data: tutorialKomentar, error: errorTutorial }] =
    await Promise.all([
      supabase.from("komentar_forum").select("id,isi,postingan_id,dibuat_pada").eq("penulis_id", sesi.id),
      supabase.from("komentar_tutorial").select("id,isi,tutorial_id,dibuat_pada").eq("penulis_id", sesi.id),
    ]);
  if (errorForum) throw errorForum;
  if (errorTutorial) throw errorTutorial;
  const postIds = [...new Set((forum ?? []).map((row) => row.postingan_id))];
  const tutorialIds = [...new Set((tutorialKomentar ?? []).map((row) => row.tutorial_id))];
  const [{ data: posts, error: errorPost }, { data: tutorials, error: errorJudulTutorial }] =
    await Promise.all([
      postIds.length ? supabase.from("postingan_forum").select("id,judul").in("id", postIds) : Promise.resolve({ data: [], error: null }),
      tutorialIds.length ? supabase.from("tutorial").select("id,judul").in("id", tutorialIds) : Promise.resolve({ data: [], error: null }),
    ]);
  if (errorPost) throw errorPost;
  if (errorJudulTutorial) throw errorJudulTutorial;
  const postById = new Map((posts ?? []).map((row) => [row.id, row.judul]));
  const tutorialById = new Map((tutorials ?? []).map((row) => [row.id, row.judul]));
  return [
    ...(forum ?? []).map((row) => ({
      id: `komentar_forum:${row.id}`,
      jenis: "komentar_forum" as const,
      isi: row.isi,
      terkait: postById.get(row.postingan_id) ?? "Post dihapus",
      dibuat_pada: row.dibuat_pada,
    })),
    ...(tutorialKomentar ?? []).map((row) => ({
      id: `komentar_tutorial:${row.id}`,
      jenis: "komentar_tutorial" as const,
      isi: row.isi,
      terkait: tutorialById.get(row.tutorial_id) ?? "Tutorial dihapus",
      dibuat_pada: row.dibuat_pada,
    })),
  ];
}

async function semuaPeringatanSaya(): Promise<PeringatanSaya[]> {
  const { supabase } = await sesiProfil();
  const { data, error } = await supabase.rpc("peringatan_saya");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    alasan: row.alasan,
    jenis_konten: row.jenis_konten,
    cuplikan_konten: row.cuplikan_konten,
    dibuat_pada: row.dibuat_pada,
  }));
}

async function semuaTutorialSaya(): Promise<TutorialSaya[]> {
  const { sesi, supabase } = await sesiProfil();
  if (sesi.peran !== "teknisi") return [];
  const { data, error } = await supabase
    .from("tutorial")
    .select("id,judul,konsol_id,tingkat_kesulitan,estimasi_waktu,dibuat_pada,item,konten_peringatan")
    .eq("penulis_id", sesi.id)
    .order("dibuat_pada", { ascending: false });
  if (error) throw error;
  const tutorials = data ?? [];
  const ids = tutorials.map((row) => row.id);
  const konsolIds = [...new Set(tutorials.map((row) => row.konsol_id))];
  const [
    { data: langkah, error: errorLangkah },
    { data: konsol, error: errorKonsol },
    { data: pembaca, error: errorPembaca },
    { data: komentar, error: errorKomentar },
  ] = await Promise.all([
    ids.length
      ? supabase.from("langkah_tutorial").select("id,tutorial_id,nomor_langkah,deskripsi,url_gambar").in("tutorial_id", ids).order("nomor_langkah")
      : Promise.resolve({ data: [], error: null }),
    konsolIds.length
      ? supabase.from("konsol").select("id,nama").in("id", konsolIds)
      : Promise.resolve({ data: [], error: null }),
    ids.length
      ? supabase.from("baca_tutorial").select("tutorial_id").in("tutorial_id", ids)
      : Promise.resolve({ data: [], error: null }),
    ids.length
      ? supabase.from("komentar_tutorial").select("tutorial_id").in("tutorial_id", ids)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (errorLangkah) throw errorLangkah;
  if (errorKonsol) throw errorKonsol;
  if (errorPembaca) throw errorPembaca;
  if (errorKomentar) throw errorKomentar;
  const konsolById = new Map((konsol ?? []).map((row) => [row.id, row.nama]));
  type BarisLangkah = {
    tutorial_id: string;
    nomor_langkah: number;
    deskripsi: string;
    url_gambar: string | null;
  };
  const langkahById = new Map<string, BarisLangkah[]>();
  for (const row of langkah ?? []) {
    const daftarLangkah = langkahById.get(row.tutorial_id) ?? [];
    daftarLangkah.push(row);
    langkahById.set(row.tutorial_id, daftarLangkah);
  }
  const pembacaById = new Map<string, number>();
  for (const row of pembaca ?? []) pembacaById.set(row.tutorial_id, (pembacaById.get(row.tutorial_id) ?? 0) + 1);
  const komentarById = new Map<string, number>();
  for (const row of komentar ?? []) komentarById.set(row.tutorial_id, (komentarById.get(row.tutorial_id) ?? 0) + 1);
  return tutorials.map((row) => ({
    id: row.id,
    judul: row.judul,
    konsol: konsolById.get(row.konsol_id) ?? "Konsol dihapus",
    tingkat: row.tingkat_kesulitan,
    waktu: row.estimasi_waktu,
    pembaca: pembacaById.get(row.id) ?? 0,
    jumlah_komentar: komentarById.get(row.id) ?? 0,
    dibuat_pada: row.dibuat_pada,
    alat: row.item ?? [],
    peringatan: row.konten_peringatan ?? "",
    langkah: (langkahById.get(row.id) ?? []).map((item) => ({
      teks: item.deskripsi,
      foto: urlBerkasPublik(supabase, "tutorial-media", item.url_gambar) ?? "",
    })),
  }));
}

export async function daftarRiwayatBaca(p: ParamTabel): Promise<ListHasil<RiwayatBaca>> {
  return daftar(await semuaRiwayatBaca(), p, KONFIG_BACA);
}

export async function daftarPostDibuat(p: ParamTabel): Promise<ListHasil<PostSaya>> {
  return daftar(await semuaPostSaya(), p, KONFIG_POST_DIBUAT);
}

export async function daftarPostDisukai(p: ParamTabel): Promise<ListHasil<PostDisukai>> {
  return daftar(await semuaPostDisukai(), p, KONFIG_POST_DISUKAI);
}

export async function daftarKomentar(p: ParamTabel): Promise<ListHasil<KomentarSaya>> {
  return daftar(await semuaKomentarSaya(), p, KONFIG_KOMENTAR);
}

export async function daftarPesanan(p: ParamTabel): Promise<ListHasil<PesananSaya>> {
  return daftar(await semuaPesanan(), p, KONFIG_PESANAN);
}

export async function daftarPeringatanSaya(p: ParamTabel): Promise<ListHasil<PeringatanSaya>> {
  return daftar(await semuaPeringatanSaya(), p, KONFIG_PERINGATAN_SAYA);
}

export async function daftarTutorial(p: ParamTabel): Promise<ListHasil<TutorialSaya>> {
  const { sesi } = await sesiProfil();
  return daftar(sesi.peran === "teknisi" ? await semuaTutorialSaya() : [], p, KONFIG_TUTORIAL);
}

export async function daftarPilihanKonsol(): Promise<string[]> {
  const { supabase } = await sesiProfil();
  const { data, error } = await supabase.from("konsol").select("nama").order("nama");
  if (error) throw error;
  return (data ?? []).map((row) => row.nama);
}

export async function jumlahPost(): Promise<{ dibuat: number; disukai: number }> {
  const { sesi, supabase } = await sesiProfil();
  const [{ count: dibuat, error: errorDibuat }, { count: disukai, error: errorDisukai }] =
    await Promise.all([
      supabase.from("postingan_forum").select("id", { count: "exact", head: true }).eq("penulis_id", sesi.id),
      supabase.from("suka_postingan").select("postingan_id", { count: "exact", head: true }).eq("pengguna_id", sesi.id),
    ]);
  if (errorDibuat) throw errorDibuat;
  if (errorDisukai) throw errorDisukai;
  return { dibuat: dibuat ?? 0, disukai: disukai ?? 0 };
}

export async function detailPost(id: string): Promise<PostSaya | null> {
  const posts = await semuaPostSaya();
  return posts.find((post) => post.id === id) ?? null;
}

export async function detailKomentar(id: string): Promise<KomentarSaya | null> {
  const komentar = await semuaKomentarSaya();
  return komentar.find((item) => item.id === id) ?? null;
}

export async function detailPesanan(id: string): Promise<PesananSaya | null> {
  const pesanan = await semuaPesanan();
  return pesanan.find((item) => item.id === id) ?? null;
}

export async function detailPeringatanSaya(id: string): Promise<PeringatanSaya | null> {
  const peringatan = await semuaPeringatanSaya();
  return peringatan.find((item) => item.id === id) ?? null;
}

export async function detailTutorial(id: string): Promise<TutorialSaya | null> {
  const { sesi } = await sesiProfil();
  if (sesi.peran !== "teknisi") return null;
  const tutorial = await semuaTutorialSaya();
  return tutorial.find((item) => item.id === id) ?? null;
}
