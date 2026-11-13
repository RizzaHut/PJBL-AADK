import type { Metadata } from "next";
import { localizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { BASE_KOMENTAR, KomentarTable } from "@/components/dashboard/profil/KomentarTable";
import { KomentarEdit } from "@/components/dashboard/profil/KomentarEdit";
import { LABEL_KOMENTAR } from "@/lib/labels";
import { daftarKomentar, detailKomentar, KONFIG_KOMENTAR } from "@/lib/queries/profil";
import { bacaParam, buatHref, type SearchParams } from "@/lib/table-params";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localizedMetadata(locale, "Komentar · Profil", "Comments · Profile");
}

export default async function KomentarPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const param = bacaParam(await searchParams, KONFIG_KOMENTAR);
  const [list, detail] = await Promise.all([
    daftarKomentar(param),
    param.detail ? detailKomentar(param.detail) : Promise.resolve(null),
  ]);
  const tutupHref = buatHref(BASE_KOMENTAR, param, { detail: null });
  return (
    <>
      <PageHeader judul="Komentar" sub="Komentar yang pernah kamu tulis di tutorial dan forum." />
      <KomentarTable list={list} param={param} />
      {detail ? (
        <KomentarEdit
          key={detail.id}
          id={detail.id}
          jenisLabel={LABEL_KOMENTAR[detail.jenis].teks}
          terkait={detail.terkait}
          isiAwal={detail.isi}
          tutupHref={tutupHref}
        />
      ) : null}
    </>
  );
}
