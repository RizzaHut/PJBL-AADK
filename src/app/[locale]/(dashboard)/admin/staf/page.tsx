import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { StafTable } from "@/components/dashboard/admin/StafTable";
import { UndangStaf } from "@/components/dashboard/admin/UndangStaf";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { daftarStaf, KONFIG_STAF } from "@/lib/queries/admin";
import { bacaParam, type SearchParams } from "@/lib/table-params";

export const metadata: Metadata = { title: "Kelola staf · Admin" };

export default async function StafPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const param = bacaParam(await searchParams, KONFIG_STAF);
  const list = await daftarStaf(param);
  return (
    <>
      <PageHeader judul="Kelola staf" sub="Moderator yang menjaga forum dan tutorial." aksi={<UndangStaf />} />
      <StafTable list={list} param={param} />
    </>
  );
}
