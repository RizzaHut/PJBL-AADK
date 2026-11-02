import { AksiIkon } from "@/components/dashboard/ui/AksiBaris";
import { TombolHapus } from "@/components/dashboard/ui/AksiBarisKlien";
import { Badge } from "@/components/dashboard/ui/Badge";
import { DataTable, type Kolom } from "@/components/dashboard/ui/DataTable";
import { hapusProduk } from "@/lib/actions/admin";
import { rupiah } from "@/lib/format";
import { LABEL_KATEGORI, LABEL_KONDISI, LABEL_PRODUK } from "@/lib/labels";
import type { ListHasil } from "@/lib/queries/moderasi";
import type { ParamTabel } from "@/lib/table-params";
import type { KategoriProduk, KondisiProduk, ProdukToko, StatusProduk } from "@/types/domain";
import { NamaThumb } from "./NamaThumb";

export const BASE_PRODUK = "/admin/produk";

const FILTER = [
  {
    kunci: "kategori",
    label: "Semua kategori",
    opsi: (Object.keys(LABEL_KATEGORI) as KategoriProduk[]).map((k) => ({ nilai: k, label: LABEL_KATEGORI[k] })),
  },
  {
    kunci: "kondisi",
    label: "Semua kondisi",
    opsi: (Object.keys(LABEL_KONDISI) as KondisiProduk[]).map((k) => ({ nilai: k, label: LABEL_KONDISI[k] })),
  },
];

const URUTAN_STATUS: StatusProduk[] = ["available", "pending", "sold"];

export async function ProdukTable({ list, param }: { list: ListHasil<ProdukToko>; param: ParamTabel }) {
  const kolom: Kolom<ProdukToko>[] = [
    { kunci: "judul", label: "Produk", sel: (r) => <NamaThumb nama={r.judul} /> },
    { kunci: "kategori", label: "Kategori", lebar: "130px", sel: (r) => LABEL_KATEGORI[r.kategori] },
    { kunci: "kondisi", label: "Kondisi", lebar: "110px", sel: (r) => LABEL_KONDISI[r.kondisi] },
    { kunci: "harga", label: "Harga", angka: true, lebar: "140px", sel: (r) => rupiah(r.harga) },
    {
      kunci: "status",
      label: "Status",
      lebar: "140px",
      sel: (r) => <Badge nada={LABEL_PRODUK[r.status].nada}>{LABEL_PRODUK[r.status].teks}</Badge>,
    },
  ];
  return (
    <DataTable
      kolom={kolom}
      hasil={list.hasil}
      param={param}
      basePath={BASE_PRODUK}
      kunciBaris={(r) => r.id}
      placeholderCari="Cari judul produk…"
      filter={FILTER}
      pil={[
        { nilai: "", label: "Semua", jumlah: list.totalSemua },
        ...URUTAN_STATUS.map((s) => ({ nilai: s, label: LABEL_PRODUK[s].teks, jumlah: list.hitung[s] ?? 0 })),
      ]}
      kosong={{ judul: "Belum ada produk", teks: "Tambahkan produk pertama untuk toko." }}
      aksi={(r) => (
        <>
          <AksiIkon href={`${BASE_PRODUK}/${r.id}/edit`} label={`Edit produk ${r.judul}`} ikon="edit" />
          <TombolHapus
            label={`Hapus produk ${r.judul}`}
            judul="Hapus produk ini?"
            isi={
              <>
                Produk <b>{r.judul}</b> akan dihapus dan tidak bisa dikembalikan.
              </>
            }
            diblokir={
              r.status === "available"
                ? undefined
                : `“${r.judul}” terkait transaksi, jadi tidak bisa dihapus. Produk yang dipesan kembali tersedia otomatis jika pembayaran tidak dilakukan dalam 24 jam.`
            }
            jalankan={hapusProduk.bind(null, r.id)}
            pesanSukses="Produk dihapus."
          />
        </>
      )}
    />
  );
}
