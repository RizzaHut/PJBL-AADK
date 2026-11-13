import { AksiIkon } from "@/components/dashboard/ui/AksiBaris";
import { DataTable, type Kolom } from "@/components/dashboard/ui/DataTable";
import { KV } from "@/components/dashboard/ui/KV";
import { tanggal } from "@/lib/format";
import { LABEL_TARGET } from "@/lib/labels";
import type { ListHasil } from "@/lib/queries/moderasi";
import { buatHref, type ParamTabel } from "@/lib/table-params";
import type { PeringatanSaya } from "@/types/domain";

export const BASE_PERINGATAN_SAYA = "/profil/peringatan";

export async function PeringatanSayaTable({ list, param }: { list: ListHasil<PeringatanSaya>; param: ParamTabel }) {
  const kolom: Kolom<PeringatanSaya>[] = [
    { kunci: "alasan", label: "Alasan peringatan", sel: (r) => <div className="cell-snippet">{r.alasan}</div> },
    {
      kunci: "cuplikan_konten",
      label: "Konten terkait",
      lebar: "280px",
      sel: (r) => (
        <>
          <div className="cell-snippet">{r.cuplikan_konten}</div>
          <div className="cell-sub">{r.jenis_konten ? LABEL_TARGET[r.jenis_konten] : ""}</div>
        </>
      ),
    },
    { kunci: "dibuat_pada", label: "Tanggal", lebar: "130px", sel: (r) => tanggal(r.dibuat_pada) },
  ];
  return (
    <DataTable
      kolom={kolom}
      hasil={list.hasil}
      param={param}
      basePath={BASE_PERINGATAN_SAYA}
      kunciBaris={(r) => r.id}
      placeholderCari="Cari alasan atau cuplikan…"
      kosong={{ judul: "Belum ada peringatan", teks: "Kamu belum pernah menerima peringatan. Terima kasih sudah menjaga forum." }}
      aksi={(r) => (
        <AksiIkon href={buatHref(BASE_PERINGATAN_SAYA, param, { detail: r.id })} label="Lihat peringatan" ikon="eye" />
      )}
    />
  );
}

/** Isi drawer peringatan (hanya baca). */
export function PeringatanSayaDetail({ w }: { w: PeringatanSaya }) {
  return (
    <>
      <KV
        item={[
          { label: "Tanggal", nilai: tanggal(w.dibuat_pada) },
          { label: "Jenis konten", nilai: w.jenis_konten ? LABEL_TARGET[w.jenis_konten] : "-" },
        ]}
      />
      <div className="dsec">Alasan</div>
      <div className="quote" style={{ marginTop: 0 }}>
        {w.alasan}
      </div>
      {w.cuplikan_konten ? (
        <>
          <div className="dsec">Cuplikan konten yang dihapus</div>
          <div className="card card-pad">
            <p style={{ margin: 0 }}>{w.cuplikan_konten}</p>
          </div>
        </>
      ) : null}
      <div className="note" style={{ marginTop: 18 }}>
        Peringatan bersifat permanen dan tidak bisa dihapus atau diubah.
      </div>
    </>
  );
}
