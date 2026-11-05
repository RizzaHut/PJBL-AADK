import type { Metadata } from "next";
import { localizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { AksiLaporan } from "@/components/dashboard/moderator/AksiLaporan";
import { LaporanDetail } from "@/components/dashboard/moderator/LaporanDetail";
import { BASE_LAPORAN, LaporanTable } from "@/components/dashboard/moderator/LaporanTable";
import { Drawer } from "@/components/dashboard/ui/Drawer";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { daftarLaporan, detailLaporan, KONFIG_LAPORAN, opsiJenisLaporan } from "@/lib/queries/moderasi";
import { bacaParam, buatHref, type SearchParams } from "@/lib/table-params";
import type { TargetLaporan } from "@/types/domain";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localizedMetadata(locale, "Laporan konten · Moderator", "Content reports · Moderator");
}

const TEMPAT: Record<TargetLaporan, string> = {
  postingan_forum: "forum (balasan di bawahnya ikut terhapus)",
  komentar_tutorial: "halaman tutorial",
  komentar_forum: "thread forum",
};

export default async function LaporanPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const param = bacaParam(await searchParams, KONFIG_LAPORAN);
  const [list, opsiJenis, detail] = await Promise.all([
    daftarLaporan(param),
    opsiJenisLaporan(),
    param.detail ? detailLaporan(param.detail) : Promise.resolve(null),
  ]);
  const tutupHref = buatHref(BASE_LAPORAN, param, { detail: null });

  return (
    <>
      <PageHeader
        judul="Laporan konten"
        sub="Laporan atas konten yang sama digabung. Satu keputusan berlaku untuk semua pelapor."
      />
      <LaporanTable list={list} param={param} opsiJenis={opsiJenis} />
      {detail ? (
        <Drawer
          judul="Laporan konten"
          tutupHref={tutupHref}
          foot={
            detail.antrean.status === "pending" ? (
              <AksiLaporan
                kunci={detail.antrean.kunci}
                terlapor={detail.antrean.terlapor_username ?? "akun ini"}
                jumlahPelapor={detail.antrean.jumlah_pelapor}
                tempat={TEMPAT[detail.antrean.target_type]}
                tutupHref={tutupHref}
                berikutnyaHref={
                  detail.berikutnyaKunci ? buatHref(BASE_LAPORAN, param, { detail: detail.berikutnyaKunci }) : null
                }
              />
            ) : undefined
          }
        >
          <LaporanDetail d={detail} />
        </Drawer>
      ) : null}
    </>
  );
}
