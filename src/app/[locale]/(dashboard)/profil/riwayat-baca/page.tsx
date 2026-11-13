import type { Metadata } from "next";
import { localizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { RiwayatBacaTable } from "@/components/dashboard/profil/RiwayatBacaTable";
import { daftarRiwayatBaca, KONFIG_BACA } from "@/lib/queries/profil";
import { bacaParam, type SearchParams } from "@/lib/table-params";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localizedMetadata(locale, "Riwayat baca · Profil", "Reading history · Profile");
}

export default async function RiwayatBacaPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const param = bacaParam(await searchParams, KONFIG_BACA);
  const list = await daftarRiwayatBaca(param);
  return (
    <>
      <PageHeader judul="Riwayat baca" sub="Tutorial dan post forum yang pernah kamu buka." />
      <RiwayatBacaTable list={list} param={param} />
    </>
  );
}
