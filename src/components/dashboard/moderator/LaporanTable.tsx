import { AksiIkon } from "@/components/dashboard/ui/AksiBaris";
import { Badge } from "@/components/dashboard/ui/Badge";
import { DataTable, type Kolom } from "@/components/dashboard/ui/DataTable";
import { tanggal } from "@/lib/format";
import { AMBANG_TERLAMBAT_HARI } from "@/lib/konstanta";
import { LABEL_LAPORAN } from "@/lib/labels";
import type { ListHasil } from "@/lib/queries/moderasi";
import { buatHref, type ParamTabel } from "@/lib/table-params";
import { hariSejak } from "@/lib/waktu";
import type { AntreanLaporan } from "@/types/domain";
import { Terlambat } from "./Person";

export const BASE_LAPORAN = "/moderator/laporan";

export async function LaporanTable({
  list,
  param,
  opsiJenis,
}: {
  list: ListHasil<AntreanLaporan>;
  param: ParamTabel;
  opsiJenis: string[];
}) {
  const kolom: Kolom<AntreanLaporan>[] = [
    {
      kunci: "cuplikan_konten",
      label: "Konten dilaporkan",
      sel: (r) => (
        <>
          <div className="cell-snippet">{r.cuplikan_konten}</div>
          <div className="cell-sub">
            {r.jenis_label} · {r.judul_konten}
          </div>
        </>
      ),
    },
    {
      kunci: "terlapor_username",
      label: "Terlapor",
      lebar: "150px",
      sel: (r) => <span className="cell-strong">{r.terlapor_username ?? "Akun dihapus"}</span>,
    },
    {
      kunci: "pelapor_teks",
      label: "Pelapor",
      lebar: "160px",
      sel: (r) => (
        <>
          {r.pelapor[0]?.username ?? "Akun dihapus"}
          {r.jumlah_pelapor > 1 ? <span className="mono mute"> +{r.jumlah_pelapor - 1}</span> : null}
        </>
      ),
    },
    {
      kunci: "terakhir_dilaporkan_pada",
      label: "Dilaporkan",
      lebar: "170px",
      sel: (r) => {
        const hari = hariSejak(r.pertama_dilaporkan_pada);
        return (
          <>
            {tanggal(r.terakhir_dilaporkan_pada)}
            {r.status === "pending" && hari > AMBANG_TERLAMBAT_HARI ? <Terlambat hari={hari} /> : null}
          </>
        );
      },
    },
    {
      kunci: "status",
      label: "Status",
      lebar: "130px",
      sel: (r) => <Badge nada={LABEL_LAPORAN[r.status].nada}>{LABEL_LAPORAN[r.status].teks}</Badge>,
    },
  ];

  const h = list.hitung;
  const pil = (["pending", "reviewed", "dismissed"] as const).map((s) => ({
    nilai: s,
    label: LABEL_LAPORAN[s].teks,
    jumlah: h[s] ?? 0,
  }));

  return (
    <DataTable
      kolom={kolom}
      hasil={list.hasil}
      param={param}
      basePath={BASE_LAPORAN}
      kunciBaris={(r) => r.kunci}
      placeholderCari="Cari konten, terlapor, pelapor…"
      pil={pil}
      statusBawaan="pending"
      filter={[
        {
          kunci: "jenis_label",
          label: "Semua jenis",
          opsi: opsiJenis.map((j) => ({ nilai: j, label: j })),
        },
      ]}
      kosong={{ judul: "Belum ada laporan", teks: "Laporan dari pengguna akan muncul di sini." }}
      aksi={(r) => (
        <AksiIkon
          href={buatHref(BASE_LAPORAN, param, { detail: r.kunci })}
          label={`Lihat laporan ${r.jenis_label}`}
          ikon="eye"
        />
      )}
    />
  );
}
