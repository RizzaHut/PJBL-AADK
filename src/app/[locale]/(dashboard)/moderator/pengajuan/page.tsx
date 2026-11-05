import type { Metadata } from "next";
import { localizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { AksiPengajuan } from "@/components/dashboard/moderator/AksiPengajuan";
import { PengajuanDetail } from "@/components/dashboard/moderator/PengajuanDetail";
import { BASE_PENGAJUAN, PengajuanTable } from "@/components/dashboard/moderator/PengajuanTable";
import { Drawer } from "@/components/dashboard/ui/Drawer";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { COOLDOWN_HARI } from "@/lib/konstanta";
import { daftarPengajuan, detailPengajuan, KONFIG_PENGAJUAN } from "@/lib/queries/moderasi";
import { bacaParam, buatHref, type SearchParams } from "@/lib/table-params";
import { sekarangIso, tambahHari } from "@/lib/waktu";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localizedMetadata(locale, "Pengajuan teknisi · Moderator", "Technician applications · Moderator");
}

export default async function PengajuanPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const param = bacaParam(await searchParams, KONFIG_PENGAJUAN);
  const [list, detail] = await Promise.all([
    daftarPengajuan(param),
    param.detail ? detailPengajuan(param.detail) : Promise.resolve(null),
  ]);
  const tutupHref = buatHref(BASE_PENGAJUAN, param, { detail: null });

  return (
    <>
      <PageHeader
        judul="Pengajuan teknisi"
        sub="Tinjau bukti keahlian anggota yang ingin menjadi teknisi. Maksimal satu pengajuan menunggu per anggota."
      />
      <PengajuanTable list={list} param={param} />
      {detail ? (
        <Drawer
          judul="Pengajuan teknisi"
          tutupHref={tutupHref}
          foot={
            detail.pengajuan.status === "pending" ? (
              <AksiPengajuan
                id={detail.pengajuan.id}
                username={detail.pengajuan.username}
                tutupHref={tutupHref}
                berikutnyaHref={
                  detail.berikutnyaId ? buatHref(BASE_PENGAJUAN, param, { detail: detail.berikutnyaId }) : null
                }
                bolehLagi={tambahHari(sekarangIso(), COOLDOWN_HARI)}
              />
            ) : undefined
          }
        >
          <PengajuanDetail d={detail} />
        </Drawer>
      ) : null}
    </>
  );
}
