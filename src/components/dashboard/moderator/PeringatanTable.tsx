import { Link } from "@/i18n/navigation";
import { AksiIkon } from "@/components/dashboard/ui/AksiBaris";
import { DataTable, type Kolom } from "@/components/dashboard/ui/DataTable";
import { tanggal } from "@/lib/format";
import type { ListHasil } from "@/lib/queries/moderasi";
import { buatHref, type ParamTabel } from "@/lib/table-params";
import type { Peringatan } from "@/types/domain";
import { BASE_LAPORAN } from "./LaporanTable";

export const BASE_PERINGATAN = "/moderator/peringatan";

export async function PeringatanTable({ list, param }: { list: ListHasil<Peringatan>; param: ParamTabel }) {
  const kolom: Kolom<Peringatan>[] = [
    {
      kunci: "penerima_username",
      label: "Penerima",
      lebar: "230px",
      sel: (r) => (
        <>
          <div className="cell-strong">{r.penerima_username}</div>
          <div className="cell-sub">{r.penerima_email}</div>
        </>
      ),
    },
    { kunci: "alasan", label: "Alasan peringatan", sel: (r) => <div className="cell-snippet">{r.alasan}</div> },
    {
      kunci: "laporan_label",
      label: "Terkait laporan",
      lebar: "250px",
      sel: (r) =>
        r.laporan_kunci ? (
          <Link href={`${BASE_LAPORAN}?detail=${encodeURIComponent(r.laporan_kunci)}`} scroll={false}>
            {r.laporan_label}
          </Link>
        ) : (
          <span className="mute">—</span>
        ),
    },
    { kunci: "dibuat_pada", label: "Tanggal", lebar: "130px", sel: (r) => tanggal(r.dibuat_pada) },
  ];

  return (
    <DataTable
      kolom={kolom}
      hasil={list.hasil}
      param={param}
      basePath={BASE_PERINGATAN}
      kunciBaris={(r) => r.id}
      placeholderCari="Cari username atau alasan…"
      kosong={{ judul: "Belum ada peringatan", teks: "Peringatan yang kamu berikan akan tercatat di sini." }}
      aksi={(r) => (
        <AksiIkon
          href={buatHref(BASE_PERINGATAN, param, { detail: r.id })}
          label={`Lihat peringatan untuk ${r.penerima_username}`}
          ikon="eye"
        />
      )}
    />
  );
}
