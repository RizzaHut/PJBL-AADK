import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { KonsolTable } from "@/components/dashboard/admin/KonsolTable";
import { Icon } from "@/components/dashboard/ui/Icon";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { Link } from "@/i18n/navigation";
import { daftarKonsol, KONFIG_KONSOL } from "@/lib/queries/admin";
import { bacaParam, type SearchParams } from "@/lib/table-params";

export const metadata: Metadata = { title: "Kelola konsol · Admin" };

export default async function KonsolPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const param = bacaParam(await searchParams, KONFIG_KONSOL);
  const list = await daftarKonsol(param);
  return (
    <>
      <PageHeader
        judul="Kelola konsol"
        sub="Katalog konsol yang dipakai tutorial dan filter."
        aksi={
          <Link className="btn btn-primary" href="/admin/konsol/baru">
            <Icon nama="plus" />
            Tambah konsol
          </Link>
        }
      />
      <KonsolTable list={list} param={param} />
    </>
  );
}
