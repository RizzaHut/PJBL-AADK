import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ProdukTable } from "@/components/dashboard/admin/ProdukTable";
import { Icon } from "@/components/dashboard/ui/Icon";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { Link } from "@/i18n/navigation";
import { daftarProduk, KONFIG_PRODUK } from "@/lib/queries/admin";
import { bacaParam, type SearchParams } from "@/lib/table-params";

export const metadata: Metadata = { title: "Kelola produk · Admin" };

export default async function ProdukPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const param = bacaParam(await searchParams, KONFIG_PRODUK);
  const list = await daftarProduk(param);
  return (
    <>
      <PageHeader
        judul="Kelola produk"
        sub="Produk toko, harga, dan statusnya."
        aksi={
          <Link className="btn btn-primary" href="/admin/produk/baru">
            <Icon nama="plus" />
            Tambah produk
          </Link>
        }
      />
      <ProdukTable list={list} param={param} />
    </>
  );
}
