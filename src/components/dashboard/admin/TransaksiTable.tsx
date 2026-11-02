import { AksiIkon } from "@/components/dashboard/ui/AksiBaris";
import { Badge } from "@/components/dashboard/ui/Badge";
import { DataTable, type Kolom } from "@/components/dashboard/ui/DataTable";
import { rupiah, tanggal } from "@/lib/format";
import { LABEL_TRANSAKSI } from "@/lib/labels";
import type { ListHasil } from "@/lib/queries/moderasi";
import { buatHref, type ParamTabel } from "@/lib/table-params";
import type { StatusTransaksi, Transaksi } from "@/types/domain";

export const BASE_TRANSAKSI = "/admin/transaksi";

const URUTAN: StatusTransaksi[] = ["payment_uploaded", "pending", "completed"];

export async function TransaksiTable({ list, param }: { list: ListHasil<Transaksi>; param: ParamTabel }) {
  const kolom: Kolom<Transaksi>[] = [
    { kunci: "judul_produk", label: "Produk" },
    { kunci: "pembeli_username", label: "Pembeli", lebar: "170px", sel: (r) => r.pembeli_username ?? "Akun dihapus" },
    { kunci: "harga_saat_beli", label: "Harga", angka: true, lebar: "140px", sel: (r) => rupiah(r.harga_saat_beli) },
    {
      kunci: "status",
      label: "Status",
      lebar: "190px",
      sel: (r) => <Badge nada={LABEL_TRANSAKSI[r.status].nada}>{LABEL_TRANSAKSI[r.status].teks}</Badge>,
    },
    { kunci: "dibuat_pada", label: "Dibuat", lebar: "130px", sel: (r) => tanggal(r.dibuat_pada) },
  ];
  return (
    <DataTable
      kolom={kolom}
      hasil={list.hasil}
      param={param}
      basePath={BASE_TRANSAKSI}
      kunciBaris={(r) => r.id}
      placeholderCari="Cari produk atau pembeli…"
      pil={[
        { nilai: "", label: "Semua", jumlah: list.totalSemua },
        ...URUTAN.map((s) => ({ nilai: s, label: LABEL_TRANSAKSI[s].teks, jumlah: list.hitung[s] ?? 0 })),
      ]}
      kosong={{ judul: "Belum ada transaksi", teks: "Pesanan pembeli akan muncul di sini." }}
      aksi={(r) => (
        <AksiIkon
          href={buatHref(BASE_TRANSAKSI, param, { detail: r.id })}
          label={r.status === "payment_uploaded" ? `Periksa transaksi ${r.judul_produk}` : `Lihat transaksi ${r.judul_produk}`}
          ikon={r.status === "payment_uploaded" ? "check-badge" : "eye"}
        />
      )}
    />
  );
}
