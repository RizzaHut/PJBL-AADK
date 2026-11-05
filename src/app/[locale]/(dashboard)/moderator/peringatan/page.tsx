import type { Metadata } from "next";
import { localizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { PeringatanDetail } from "@/components/dashboard/moderator/PeringatanDetail";
import { BASE_PERINGATAN, PeringatanTable } from "@/components/dashboard/moderator/PeringatanTable";
import { Drawer } from "@/components/dashboard/ui/Drawer";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { daftarPeringatan, detailPeringatan, KONFIG_PERINGATAN } from "@/lib/queries/moderasi";
import { bacaParam, buatHref, type SearchParams } from "@/lib/table-params";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localizedMetadata(locale, "Peringatan · Moderator", "Warnings · Moderator");
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
  const param = bacaParam(await searchParams, KONFIG_PERINGATAN);
  const [list, detail] = await Promise.all([
    daftarPeringatan(param),
    param.detail ? detailPeringatan(param.detail) : Promise.resolve(null),
  ]);

  return (
    <>
      <PageHeader
        judul="Peringatan"
        sub="Peringatan lahir dari keputusan hapus konten pada laporan. Tidak bisa dibuat atau diubah dari sini."
      />
      <PeringatanTable list={list} param={param} />
      {detail ? (
        <Drawer judul="Detail peringatan" tutupHref={buatHref(BASE_PERINGATAN, param, { detail: null })}>
          <PeringatanDetail d={detail} />
        </Drawer>
      ) : null}
    </>
  );
}
