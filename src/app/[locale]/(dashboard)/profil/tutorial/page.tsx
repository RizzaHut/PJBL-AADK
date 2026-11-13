import type { Metadata } from "next";
import { localizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { Drawer } from "@/components/dashboard/ui/Drawer";
import { Icon } from "@/components/dashboard/ui/Icon";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { TutorialDetail } from "@/components/dashboard/profil/TutorialDetail";
import { BASE_TUTORIAL, TutorialTable } from "@/components/dashboard/profil/TutorialTable";
import { Link } from "@/i18n/navigation";
import { requireRole } from "@/lib/auth/session";
import { daftarPilihanKonsol, daftarTutorial, detailTutorial, KONFIG_TUTORIAL } from "@/lib/queries/profil";
import { bacaParam, buatHref, type SearchParams } from "@/lib/table-params";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localizedMetadata(locale, "Tutorial saya · Profil", "My tutorials · Profile");
}

export default async function TutorialPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("teknisi");
  const param = bacaParam(await searchParams, KONFIG_TUTORIAL);
  const [list, detail, konsolPilihan] = await Promise.all([
    daftarTutorial(param),
    param.detail ? detailTutorial(param.detail) : Promise.resolve(null),
    daftarPilihanKonsol(),
  ]);
  const tutupHref = buatHref(BASE_TUTORIAL, param, { detail: null });
  return (
    <>
      <PageHeader
        judul="Tutorial saya"
        sub="Panduan perbaikan yang kamu tulis."
        aksi={
          <Link className="btn btn-primary" href="/profil/tutorial/baru">
            <Icon nama="plus" />
            Tulis tutorial
          </Link>
        }
      />
      <TutorialTable list={list} param={param} konsolPilihan={konsolPilihan} />
      {detail ? (
        <Drawer
          judul="Detail tutorial"
          tutupHref={tutupHref}
          foot={
            <Link className="btn btn-primary" href={`/profil/tutorial/${detail.id}/edit`}>
              <Icon nama="edit" />
              Edit tutorial
            </Link>
          }
        >
          <TutorialDetail t={detail} />
        </Drawer>
      ) : null}
    </>
  );
}
