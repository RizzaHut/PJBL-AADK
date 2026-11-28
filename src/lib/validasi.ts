/**
 * Validasi form bersama klien (umpan balik langsung) dan Server Action (penegakan).
 * Murni; mengembalikan pesan galat atau "" bila valid. Nanti bisa diganti skema zod
 * tanpa mengubah pemanggil.
 */

export const USERNAME_RE = /^[a-z0-9._]{3,20}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function galatUsername(v: string, dipakai: readonly string[] = []): string {
  const u = v.trim();
  if (!USERNAME_RE.test(u)) return "Gunakan 3–20 karakter: huruf kecil, angka, titik, atau garis bawah.";
  if (dipakai.includes(u)) return "Username sudah dipakai.";
  return "";
}

export function galatEmail(v: string): string {
  return EMAIL_RE.test(v.trim()) ? "" : "Masukkan alamat email yang valid.";
}

export function galatUrlBukti(v: string): string {
  const nilai = v.trim();
  if (!nilai) return "Masukkan URL bukti atau portofolio.";
  if (nilai.length > 2048) return "URL bukti maksimal 2048 karakter.";

  try {
    const url = new URL(nilai);
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password) {
      return "Gunakan URL HTTPS yang valid tanpa nama pengguna atau kata sandi.";
    }
  } catch {
    return "Masukkan URL HTTPS yang valid.";
  }

  return "";
}

export function galatPasswordBaru(baru: string, lama: string): string {
  if (baru.length < 8) return "Minimal 8 karakter.";
  if (baru === lama) return "Password baru harus berbeda dari yang lama.";
  return "";
}

export function galatPasswordUlang(ulang: string, baru: string): string {
  return ulang === baru ? "" : "Password tidak sama.";
}

export const BATAS_ALASAN = 500;

export function galatAlasan(v: string, pesanKosong: string): string {
  const t = v.trim();
  if (!t) return pesanKosong;
  if (t.length > BATAS_ALASAN) return `Maksimal ${BATAS_ALASAN} karakter.`;
  return "";
}

/** Validasi berkas unggahan: jenis (MIME) dan ukuran. Dipakai klien dan Server Action. */
export interface AturanBerkas {
  tipe: RegExp;
  mb: number;
  pesanTipe: string;
}

export function galatBerkas(f: { name: string; type: string; size: number }, a: AturanBerkas): string {
  if (!a.tipe.test(f.type)) return a.pesanTipe;
  if (f.size > a.mb * 1_048_576) return `“${f.name}” lebih dari ${a.mb} MB.`;
  return "";
}

export function tandaTanganGambarSesuaiMime(mime: string, header: Uint8Array): boolean {
  const cocok = (signature: number[]) =>
    signature.every((byte, index) => header[index] === byte);

  switch (mime.toLowerCase()) {
    case "image/jpeg":
      return cocok([0xff, 0xd8, 0xff]);
    case "image/png":
      return cocok([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "image/webp":
      return (
        header.length >= 12 &&
        cocok([0x52, 0x49, 0x46, 0x46]) &&
        header[8] === 0x57 &&
        header[9] === 0x45 &&
        header[10] === 0x42 &&
        header[11] === 0x50
      );
    default:
      return false;
  }
}

export const ATURAN_GAMBAR: AturanBerkas = {
  tipe: /^image\/(jpeg|png|webp)$/,
  mb: 5,
  pesanTipe: "Gunakan gambar JPG, PNG, atau WebP.",
};

export const ATURAN_PFP: AturanBerkas = {
  tipe: /^image\/(jpeg|png)$/,
  mb: 2,
  pesanTipe: "Gunakan gambar JPG atau PNG.",
};

export const ATURAN_VIDEO: AturanBerkas = {
  tipe: /^video\/(mp4|webm|quicktime)$/,
  mb: 50,
  pesanTipe: "Gunakan video MP4, WebM, atau MOV.",
};

export function galatJudul(v: string): string {
  return v.trim().length < 5 ? "Judul minimal 5 karakter." : v.trim().length > 120 ? "Judul maksimal 120 karakter." : "";
}

export function galatIsiPost(v: string): string {
  return v.trim().length < 10 ? "Isi post minimal 10 karakter." : v.trim().length > 5000 ? "Isi post maksimal 5000 karakter." : "";
}

export function galatTanggalLahir(v: string, hariIni: string): string {
  return v && v > hariIni ? "Tanggal lahir tidak boleh di masa depan." : "";
}

export const ATURAN_FOTO_LANGKAH: AturanBerkas = {
  tipe: /^image\/(jpeg|png|webp)$/,
  mb: 2,
  pesanTipe: "Gunakan gambar JPG, PNG, atau WebP.",
};

export function galatTahunRilis(v: string): string {
  const tahun = Number(v.trim());
  return Number.isInteger(tahun) && tahun >= 1970 && tahun <= 2100
    ? ""
    : "Isi tahun antara 1970 dan 2100.";
}

export function galatNamaWajib(v: string, pesan: string): string {
  const nama = v.trim();
  if (!nama) return pesan;
  return nama.length > 120 ? "Maksimal 120 karakter." : "";
}

/** Harga dalam rupiah; `v` boleh memuat titik pemisah ribuan. */
export function bacaHarga(v: string): number {
  return Number(v.replace(/\D/g, "")) || 0;
}

export function galatHarga(v: string): string {
  const harga = bacaHarga(v);
  if (harga <= 0) return "Isi harga dalam rupiah, lebih dari 0.";
  return harga > 999_999_999 ? "Harga terlalu besar." : "";
}

export function galatWhatsapp(v: string): string {
  const nomor = v.replace(/[\s-]/g, "");
  return /^(\+62|62|0)8\d{7,12}$/.test(nomor)
    ? ""
    : "Isi nomor WhatsApp yang valid, mis. 0812xxxxxxxx.";
}

export const ATURAN_FOTO_KARTU: AturanBerkas = {
  tipe: /^image\/(jpeg|png|webp)$/,
  mb: 2,
  pesanTipe: "Gunakan gambar JPG, PNG, atau WebP.",
};
