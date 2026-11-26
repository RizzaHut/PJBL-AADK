/** Aturan sistem yang dipakai di tampilan dan di action. Nilai tunggal, jangan disalin. */

/** Masa tunggu sebelum anggota yang pengajuannya ditolak boleh mengajukan lagi. */
export const COOLDOWN_HARI = 30;

/** Jeda sebelum keputusan moderasi benar-benar dikirim, agar tombol Urungkan bisa bekerja. */
export const JEDA_URUNGKAN_MS = 8000;

/** Laporan/pengajuan menunggu lebih lama dari ini diberi penanda "terlambat". */
export const AMBANG_TERLAMBAT_HARI = 3;

/** Topik forum (enum `topik_forum` di database). */
export const TOPIK_FORUM = [
  "Hardware & Technical",
  "Software & System",
  "Accessories & Controller",
  "Maintenance & Care",
  "Service & Spare Part",
  "Storage & Memory",
  "Server & Network",
  "General",
] as const;

/** Pilihan konsol yang tersedia di form tutorial. */
export const KONSOL_PILIHAN = [
  "PlayStation 4", "Nintendo Switch", "Xbox 360", "PlayStation 2", "Nintendo Wii",
  "Xbox Series X", "PlayStation 5", "Nintendo GameCube", "Xbox One", "PlayStation Portable",
  "Nintendo 3DS", "PlayStation 3", "Nintendo Wii U", "Xbox Classic", "PlayStation Vita",
] as const;

export const LABEL_WAKTU: Record<string, string> = {
  "15_menit": "15 menit",
  "30_menit": "30 menit",
  "1_jam": "1 jam",
  "2_jam": "2 jam",
  lebih_2_jam: "Lebih dari 2 jam",
};

export const BATAS_UKURAN_MB = { gambarPost: 5, pfp: 2, fotoLangkah: 2, buktiFoto: 5, buktiVideo: 50 } as const;
