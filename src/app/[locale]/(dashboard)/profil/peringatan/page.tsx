import type { Metadata } from "next";
import { localizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { Drawer } from "@/components/dashboard/ui/Drawer";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import {
  BASE_PERINGATAN_SAYA,
  PeringatanSayaDetail,
  PeringatanSayaTable,
} from "@/components/dashboard/profil/PeringatanSayaTable";
import { daftarPeringatanSaya, detailPeringatanSaya, KONFIG_PERINGATAN_SAYA } from "@/lib/queries/profil";
import { bacaParam, buatHref, type SearchParams } from "@/lib/table-params";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localizedMetadata(locale, "Peringatan · Profil", "Warnings · Profile");
}

export default async function PeringatanPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const param = bacaParam(await searchParams, KONFIG_PERINGATAN_SAYA);
  const [list, detail] = await Promise.all([
    daftarPeringatanSaya(param),
    param.detail ? detailPeringatanSaya(param.detail) : Promise.resolve(null),
  ]);
  const tutupHref = buatHref(BASE_PERINGATAN_SAYA, param, { detail: null });
  return (
    <>
      <PageHeader judul="Peringatan" sub="Peringatan dari moderator untuk akunmu." />
      <PeringatanSayaTable list={list} param={param} />
      {detail ? (
        <Drawer judul="Detail peringatan" tutupHref={tutupHref}>
          <PeringatanSayaDetail w={detail} />
        </Drawer>
      ) : null}
    </>
  );
}
