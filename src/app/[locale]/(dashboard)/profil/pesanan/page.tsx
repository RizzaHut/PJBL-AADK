import type { Metadata } from "next";
import { localizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { PesananDrawer } from "@/components/dashboard/profil/PesananDrawer";
import { PesananRingkasan } from "@/components/dashboard/profil/PesananRingkasan";
import { BASE_PESANAN, PesananTable } from "@/components/dashboard/profil/PesananTable";
import { daftarPesanan, detailPesanan, KONFIG_PESANAN } from "@/lib/queries/profil";
import { bacaParam, buatHref, type SearchParams } from "@/lib/table-params";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localizedMetadata(locale, "Pesanan · Profil", "Orders · Profile");
}

const WA_ADMIN = "https://wa.me/6280000000000";

export default async function PesananPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const param = bacaParam(await searchParams, KONFIG_PESANAN);
  const [list, detail] = await Promise.all([
    daftarPesanan(param),
    param.detail ? detailPesanan(param.detail) : Promise.resolve(null),
  ]);
  const tutupHref = buatHref(BASE_PESANAN, param, { detail: null });
  return (
    <>
      <PageHeader judul="Pesanan" sub="Pesanan toko dan status pembayarannya." />
      <PesananTable list={list} param={param} />
      {detail ? (
        <PesananDrawer
          key={detail.id}
          id={detail.id}
          status={detail.status}
          tutupHref={tutupHref}
          waHref={WA_ADMIN}
          ringkasan={<PesananRingkasan p={detail} />}
        />
      ) : null}
    </>
  );
}
