import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { UserDrawer } from "@/components/dashboard/admin/UserDrawer";
import { BASE_USER, UserTable } from "@/components/dashboard/admin/UserTable";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { inisial, tanggal, waktuLalu } from "@/lib/format";
import { daftarUser, detailUser, KONFIG_USER } from "@/lib/queries/admin";
import { bacaParam, buatHref, type SearchParams } from "@/lib/table-params";

export const metadata: Metadata = { title: "Kelola user · Admin" };

export default async function UserPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const param = bacaParam(await searchParams, KONFIG_USER);
  const [list, detail] = await Promise.all([
    daftarUser(param),
    param.detail ? detailUser(param.detail) : Promise.resolve(null),
  ]);
  const tutupHref = buatHref(BASE_USER, param, { detail: null });
  return (
    <>
      <PageHeader judul="Kelola user" sub="Anggota dan teknisi terdaftar." />
      <UserTable list={list} param={param} />
      {detail ? (
        <UserDrawer
          key={detail.id}
          id={detail.id}
          username={detail.username}
          email={detail.email}
          peran={detail.peran}
          inisial={inisial(detail.username)}
          aktifLabel={waktuLalu(detail.terakhir_aktif_pada)}
          sejakLabel={tanggal(detail.dibuat_pada)}
          tutupHref={tutupHref}
        />
      ) : null}
    </>
  );
}
