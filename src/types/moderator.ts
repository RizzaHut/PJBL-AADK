export type ApplicationStatus = "Menunggu" | "Disetujui" | "Ditolak";

export type Pengajuan = {
  username: string;
  tanggal: string;
  status: ApplicationStatus;
  email?: string;
  alasan?: string;
};

export type ReportStatus = "Menunggu" | "Ditindak" | "Ditolak";

export type Laporan = {
  id: string;
  jenis: string;
  pelapor: string;
  tanggal: string;
  status: ReportStatus;
  konten: string;
  alasan: string;
};

export type Peringatan = {
  username: string;
  alasan: string;
  laporan: string;
  tanggal: string;
};
