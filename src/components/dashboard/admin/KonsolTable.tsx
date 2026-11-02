import { AksiIkon } from "@/components/dashboard/ui/AksiBaris";
import { TombolHapus } from "@/components/dashboard/ui/AksiBarisKlien";
import { DataTable, type Kolom } from "@/components/dashboard/ui/DataTable";
import { Link } from "@/i18n/navigation";
import { hapusKonsol } from "@/lib/actions/admin";
import { LABEL_MEREK, LABEL_TIPE } from "@/lib/labels";
import type { ListHasil } from "@/lib/queries/moderasi";
import type { ParamTabel } from "@/lib/table-params";
import type { Konsol, Merek, TipeKonsol } from "@/types/domain";
import { NamaThumb } from "./NamaThumb";

export const BASE_KONSOL = "/admin/konsol";

const FILTER = [
  {
    kunci: "merek",
    label: "Semua merek",
    opsi: (Object.keys(LABEL_MEREK) as Merek[]).map((m) => ({ nilai: m, label: LABEL_MEREK[m] })),
  },
  {
    kunci: "tipe",
    label: "Semua tipe",
    opsi: (Object.keys(LABEL_TIPE) as TipeKonsol[]).map((t) => ({ nilai: t, label: LABEL_TIPE[t] })),
  },
];

/** Kalimat dampak hapus konsol, dipakai tabel dan halaman detail. */
export function DampakHapusKonsol({ nama, jumlahModel }: { nama: string; jumlahModel: number }) {
  return (
    <>
      Konsol <b>{nama}</b> akan dihapus
      {jumlahModel ? (
        <>
          {" "}
          <b>beserta {jumlahModel} model konsol</b> miliknya
        </>
      ) : null}
      . Data yang dihapus tidak bisa dikembalikan.
    </>
  );
}

export async function KonsolTable({ list, param }: { list: ListHasil<Konsol>; param: ParamTabel }) {
  const kolom: Kolom<Konsol>[] = [
    {
      kunci: "nama",
      label: "Konsol",
      sel: (r) => <NamaThumb nama={r.nama} />,
    },
    { kunci: "merek", label: "Merek", lebar: "120px", sel: (r) => LABEL_MEREK[r.merek] },
    { kunci: "tipe", label: "Tipe", lebar: "185px", sel: (r) => LABEL_TIPE[r.tipe] },
    { kunci: "tahun_rilis", label: "Tahun rilis", angka: true, lebar: "120px" },
    {
      kunci: "jumlah_model",
      label: "Model",
      angka: true,
      lebar: "100px",
      sel: (r) => (
        <Link className="lnk-model" href={`${BASE_KONSOL}/${r.id}`}>
          {r.jumlah_model} model
        </Link>
      ),
    },
  ];
  return (
    <DataTable
      kolom={kolom}
      hasil={list.hasil}
      param={param}
      basePath={BASE_KONSOL}
      kunciBaris={(r) => r.id}
      placeholderCari="Cari nama konsol…"
      filter={FILTER}
      kosong={{ judul: "Belum ada konsol", teks: "Tambahkan konsol pertama untuk katalog." }}
      aksi={(r) => (
        <>
          <AksiIkon href={`${BASE_KONSOL}/${r.id}`} label={`Lihat konsol ${r.nama}`} ikon="eye" />
          <AksiIkon href={`${BASE_KONSOL}/${r.id}/edit`} label={`Edit konsol ${r.nama}`} ikon="edit" />
          <TombolHapus
            label={`Hapus konsol ${r.nama}`}
            judul="Hapus konsol ini?"
            isi={<DampakHapusKonsol nama={r.nama} jumlahModel={r.jumlah_model} />}
            jalankan={hapusKonsol.bind(null, r.id)}
            pesanSukses="Konsol dan modelnya dihapus."
          />
        </>
      )}
    />
  );
}
