import { AksiIkon } from "@/components/dashboard/ui/AksiBaris";
import { TombolHapus } from "@/components/dashboard/ui/AksiBarisKlien";
import { DataTable, type Kolom } from "@/components/dashboard/ui/DataTable";
import { hapusModel } from "@/lib/actions/admin";
import type { ListHasil } from "@/lib/queries/moderasi";
import type { ParamTabel } from "@/lib/table-params";
import type { ModelKonsol } from "@/types/domain";

export async function ModelTable({
  konsolId,
  list,
  param,
}: {
  konsolId: string;
  list: ListHasil<ModelKonsol>;
  param: ParamTabel;
}) {
  const base = `/admin/konsol/${konsolId}`;
  const kolom: Kolom<ModelKonsol>[] = [
    { kunci: "nama", label: "Nama model" },
    { kunci: "kode", label: "Kode model", lebar: "150px", sel: (r) => r.kode || "—" },
    { kunci: "tahun_rilis", label: "Tahun rilis", angka: true, lebar: "120px" },
  ];
  return (
    <DataTable
      kolom={kolom}
      hasil={list.hasil}
      param={param}
      basePath={base}
      kunciBaris={(r) => r.id}
      placeholderCari="Cari model…"
      kosong={{ judul: "Belum ada model", teks: "Tambahkan model pertama untuk konsol ini." }}
      aksi={(r) => (
        <>
          <AksiIkon href={`${base}/model/${r.id}`} label={`Lihat model ${r.nama}`} ikon="eye" />
          <AksiIkon href={`${base}/model/${r.id}/edit`} label={`Edit model ${r.nama}`} ikon="edit" />
          <TombolHapus
            label={`Hapus model ${r.nama}`}
            judul="Hapus model ini?"
            isi={
              <>
                Model <b>{r.nama}</b> akan dihapus dan tidak bisa dikembalikan.
              </>
            }
            jalankan={hapusModel.bind(null, r.id)}
            pesanSukses="Model dihapus."
          />
        </>
      )}
    />
  );
}
