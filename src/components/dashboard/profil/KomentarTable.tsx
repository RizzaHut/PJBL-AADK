import { AksiIkon } from "@/components/dashboard/ui/AksiBaris";
import { TombolHapus } from "@/components/dashboard/ui/AksiBarisKlien";
import { Badge } from "@/components/dashboard/ui/Badge";
import { DataTable, type Kolom } from "@/components/dashboard/ui/DataTable";
import { hapusKomentar } from "@/lib/actions/profil";
import { tanggal } from "@/lib/format";
import { LABEL_KOMENTAR } from "@/lib/labels";
import type { ListHasil } from "@/lib/queries/moderasi";
import { buatHref, type ParamTabel } from "@/lib/table-params";
import type { KomentarSaya } from "@/types/domain";

export const BASE_KOMENTAR = "/profil/komentar";

export async function KomentarTable({ list, param }: { list: ListHasil<KomentarSaya>; param: ParamTabel }) {
  const kolom: Kolom<KomentarSaya>[] = [
    {
      kunci: "isi",
      label: "Komentar",
      sel: (r) => (
        <>
          <div className="cell-snippet">{r.isi}</div>
          <div className="cell-sub">Di: {r.terkait}</div>
        </>
      ),
    },
    {
      kunci: "jenis",
      label: "Jenis",
      lebar: "160px",
      sel: (r) => <Badge nada={LABEL_KOMENTAR[r.jenis].nada}>{LABEL_KOMENTAR[r.jenis].teks}</Badge>,
    },
    { kunci: "dibuat_pada", label: "Tanggal", lebar: "130px", sel: (r) => tanggal(r.dibuat_pada) },
  ];
  const h = list.hitung;
  return (
    <DataTable
      kolom={kolom}
      hasil={list.hasil}
      param={param}
      basePath={BASE_KOMENTAR}
      kunciBaris={(r) => r.id}
      placeholderCari="Cari isi komentar…"
      pil={[
        { nilai: "", label: "Semua", jumlah: list.totalSemua },
        { nilai: "komentar_tutorial", label: "Komentar tutorial", jumlah: h.komentar_tutorial ?? 0 },
        { nilai: "komentar_forum", label: "Komentar forum", jumlah: h.komentar_forum ?? 0 },
      ]}
      kosong={{ judul: "Belum ada komentar", teks: "Komentar yang kamu tulis di tutorial dan forum akan muncul di sini." }}
      aksi={(r) => (
        <>
          <AksiIkon href={buatHref(BASE_KOMENTAR, param, { detail: r.id })} label="Edit komentar" ikon="edit" />
          <TombolHapus
            label="Hapus komentar"
            judul="Hapus komentar ini?"
            isi="Komentar dihapus permanen dari halaman asalnya. Tidak bisa dikembalikan."
            jalankan={hapusKomentar.bind(null, r.id)}
            pesanSukses="Komentar dihapus."
          />
        </>
      )}
    />
  );
}
