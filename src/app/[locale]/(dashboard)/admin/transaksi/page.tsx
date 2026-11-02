import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { KonfirmasiTransaksi } from "@/components/dashboard/admin/KonfirmasiTransaksi";
import { TransaksiDetail } from "@/components/dashboard/admin/TransaksiDetail";
import { BASE_TRANSAKSI, TransaksiTable } from "@/components/dashboard/admin/TransaksiTable";
import { Drawer } from "@/components/dashboard/ui/Drawer";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { daftarTransaksi, detailTransaksi, KONFIG_TRANSAKSI } from "@/lib/queries/admin";
import { bacaParam, buatHref, type SearchParams } from "@/lib/table-params";

export const metadata: Metadata = { title: "Kelola transaksi · Admin" };

export default async function TransaksiPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const param = bacaParam(await searchParams, KONFIG_TRANSAKSI);
  const [list, detail] = await Promise.all([
    daftarTransaksi(param),
    param.detail ? detailTransaksi(param.detail) : Promise.resolve(null),
  ]);
  const tutupHref = buatHref(BASE_TRANSAKSI, param, { detail: null });
  return (
    <>
      <PageHeader judul="Kelola transaksi" sub="Periksa bukti bayar lalu konfirmasi transaksi." />
      <TransaksiTable list={list} param={param} />
      {detail ? (
        <Drawer
          key={detail.id}
          judul="Detail transaksi"
          tutupHref={tutupHref}
          foot={detail.status === "payment_uploaded" ? <KonfirmasiTransaksi id={detail.id} tutupHref={tutupHref} /> : undefined}
        >
          <TransaksiDetail t={detail} />
        </Drawer>
      ) : null}
    </>
  );
}
