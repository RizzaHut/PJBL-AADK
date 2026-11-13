import { AksiIkon } from "@/components/dashboard/ui/AksiBaris";
import { Badge } from "@/components/dashboard/ui/Badge";
import { DataTable, type Kolom } from "@/components/dashboard/ui/DataTable";
import { rupiah, sisaWaktu, tanggalWaktu } from "@/lib/format";
import { LABEL_TRANSAKSI } from "@/lib/labels";
import type { ListHasil } from "@/lib/queries/moderasi";
import { infoBayar } from "@/lib/queries/profil";
import { buatHref, type ParamTabel } from "@/lib/table-params";
import type { PesananSaya } from "@/types/domain";

export const BASE_PESANAN = "/profil/pesanan";

export async function PesananTable({ list, param }: { list: ListHasil<PesananSaya>; param: ParamTabel }) {
  const kolom: Kolom<PesananSaya>[] = [
    { kunci: "judul_produk", label: "Produk", sel: (r) => <div className="cell-strong">{r.judul_produk}</div> },
    { kunci: "harga_saat_beli", label: "Total", angka: true, lebar: "130px", sel: (r) => rupiah(r.harga_saat_beli) },
    {
      kunci: "status",
      label: "Status",
      lebar: "180px",
      sel: (r) => <Badge nada={LABEL_TRANSAKSI[r.status].nada}>{LABEL_TRANSAKSI[r.status].teks}</Badge>,
    },
    {
      kunci: "dibuat_pada",
      label: "Dibuat",
      lebar: "210px",
      sel: (r) => (
        <>
          {tanggalWaktu(r.dibuat_pada)}
          {r.status === "pending" ? (
            <div className="late">
              <i aria-hidden="true" />
              {sisaWaktu(infoBayar(r).sisaMenit)}
            </div>
          ) : null}
        </>
      ),
    },
  ];
  const h = list.hitung;
  return (
    <DataTable
      kolom={kolom}
      hasil={list.hasil}
      param={param}
      basePath={BASE_PESANAN}
      kunciBaris={(r) => r.id}
      placeholderCari="Cari produk…"
      pil={[
        { nilai: "", label: "Semua", jumlah: list.totalSemua },
        { nilai: "pending", label: LABEL_TRANSAKSI.pending.teks, jumlah: h.pending ?? 0 },
        { nilai: "payment_uploaded", label: LABEL_TRANSAKSI.payment_uploaded.teks, jumlah: h.payment_uploaded ?? 0 },
        { nilai: "completed", label: LABEL_TRANSAKSI.completed.teks, jumlah: h.completed ?? 0 },
      ]}
      kosong={{ judul: "Belum ada pesanan", teks: "Pesanan dari toko AADK akan muncul di sini." }}
      aksi={(r) => (
        <AksiIkon href={buatHref(BASE_PESANAN, param, { detail: r.id })} label={`Lihat pesanan ${r.kode}`} ikon="eye" />
      )}
    />
  );
}
