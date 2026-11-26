import type {
  JenisBaca,
  JenisKomentar,
  Merek,
  Peran,
  StatusLaporan,
  StatusPengajuan,
  TargetLaporan,
  TingkatKesulitan,
  TipeKonsol,
} from "../types/domain";

/** Warna lencana yang tersedia di CSS dashboard (`.badge.<nada>`). */
export type Nada = "ok" | "warn" | "err" | "info" | "mute";

interface Label {
  teks: string;
  nada: Nada;
}

export const LABEL_MEREK: Record<Merek, string> = {
  Nintendo: "Nintendo",
  Playstation: "PlayStation",
  Xbox: "Xbox",
};

export const LABEL_PERAN: Record<Peran, string> = {
  anggota: "Anggota",
  teknisi: "Teknisi",
  moderator: "Moderator",
  super_admin: "Super Admin",
};

export const LABEL_LAPORAN: Record<StatusLaporan, Label> = {
  pending: { teks: "Menunggu", nada: "warn" },
  reviewed: { teks: "Ditindak", nada: "ok" },
  dismissed: { teks: "Diabaikan", nada: "mute" },
};

export const LABEL_PENGAJUAN: Record<StatusPengajuan, Label> = {
  pending: { teks: "Menunggu", nada: "warn" },
  approved: { teks: "Disetujui", nada: "ok" },
  rejected: { teks: "Ditolak", nada: "err" },
};

export const LABEL_TARGET: Record<TargetLaporan, string> = {
  postingan_forum: "Post forum",
  komentar_forum: "Komentar forum",
  komentar_tutorial: "Komentar tutorial",
};

export const LABEL_KESULITAN: Record<TingkatKesulitan, string> = {
  mudah: "Mudah",
  sedang: "Sedang",
  sulit: "Sulit",
};

export const LABEL_BACA: Record<JenisBaca, Label> = {
  tutorial: { teks: "Tutorial", nada: "info" },
  postingan_forum: { teks: "Post forum", nada: "mute" },
};

export const LABEL_KOMENTAR: Record<JenisKomentar, Label> = {
  komentar_tutorial: { teks: "Komentar tutorial", nada: "info" },
  komentar_forum: { teks: "Komentar forum", nada: "mute" },
};

export const NADA_KESULITAN: Record<TingkatKesulitan, Nada> = {
  mudah: "ok",
  sedang: "warn",
  sulit: "err",
};

export const LABEL_TIPE: Record<TipeKonsol, string> = {
  home_console: "Home Console",
  hybrid_console: "Hybrid Console",
  handheld_console: "Handheld Console",
};

export const NADA_PERAN: Record<Peran, Nada> = {
  anggota: "info",
  teknisi: "ok",
  moderator: "info",
  super_admin: "warn",
};
