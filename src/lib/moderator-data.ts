import type { Laporan, Pengajuan, Peringatan } from "@/types/moderator";

export const initialPengajuan: Pengajuan[] = [
  { username: "rizky_teknisi", tanggal: "2026-09-18", status: "Menunggu", email: "rizky@example.com", alasan: "Memiliki pengalaman memperbaiki dan merawat konsol." },
  { username: "andika_console", tanggal: "2026-09-17", status: "Menunggu", email: "andika@example.com", alasan: "Ingin membantu komunitas sebagai teknisi." },
  { username: "bayu_repair", tanggal: "2026-09-12", status: "Disetujui", email: "bayu@example.com", alasan: "Pengalaman servis konsol selama beberapa tahun." },
  { username: "dimas_fix", tanggal: "2026-09-08", status: "Ditolak", email: "dimas@example.com", alasan: "Informasi pengajuan belum lengkap." },
];

export const initialLaporan: Laporan[] = [
  { id: "RPT-001", jenis: "Komentar", pelapor: "andi", tanggal: "2026-09-19", status: "Menunggu", konten: "Komentar yang dilaporkan karena dianggap tidak sesuai.", alasan: "Konten tidak relevan." },
  { id: "RPT-002", jenis: "Forum", pelapor: "sinta", tanggal: "2026-09-18", status: "Menunggu", konten: "Posting forum yang dilaporkan pengguna.", alasan: "Pelanggaran aturan komunitas." },
  { id: "RPT-003", jenis: "Tutorial", pelapor: "fajar", tanggal: "2026-09-15", status: "Ditindak", konten: "Tutorial yang sudah diperiksa moderator.", alasan: "Informasi kurang akurat." },
  { id: "RPT-004", jenis: "Forum", pelapor: "nanda", tanggal: "2026-09-10", status: "Ditolak", konten: "Laporan yang tidak memenuhi kriteria tindakan.", alasan: "Tidak ditemukan pelanggaran." },
];

export const initialPeringatan: Peringatan[] = [
  { username: "andi", alasan: "Pelanggaran aturan komunitas", laporan: "RPT-014", tanggal: "2026-09-19" },
  { username: "sinta", alasan: "Konten berulang", laporan: "RPT-011", tanggal: "2026-09-16" },
];

export const users = [
  "andi", "sinta", "fajar", "nanda", "rizky_teknisi", "andika_console",
  "bayu_repair", "dimas_fix", "budi", "citra", "dewi", "eko",
];
