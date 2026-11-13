import type { Metadata } from "next";
import { localizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { PostDisukaiTable, SubTab } from "@/components/dashboard/profil/PostTables";
import { daftarPostDisukai, jumlahPost, KONFIG_POST_DISUKAI } from "@/lib/queries/profil";
import { bacaParam, type SearchParams } from "@/lib/table-params";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localizedMetadata(locale, "Post disukai · Profil", "Liked posts · Profile");
}

export default async function PostDisukaiPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const param = bacaParam(await searchParams, KONFIG_POST_DISUKAI);
  const [list, jumlah] = await Promise.all([daftarPostDisukai(param), jumlahPost()]);
  return (
    <>
      <PageHeader judul="Post forum" sub="Post yang kamu buat dan post yang kamu sukai." />
      <SubTab aktif="disukai" jumlah={jumlah} />
      <PostDisukaiTable list={list} param={param} />
    </>
  );
}
