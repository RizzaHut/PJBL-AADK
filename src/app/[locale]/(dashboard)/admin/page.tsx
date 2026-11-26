import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { RangkumanAdmin } from "@/components/dashboard/admin/RangkumanAdmin";
import { BarChart, ChartCard, DonutChart, LineChart, WARNA } from "@/components/dashboard/ui/chart/Charts";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { tanggalPanjang } from "@/lib/format";
import { rangkumanAdmin } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Rangkuman · Admin" };

export default async function RangkumanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const d = await rangkumanAdmin();
  const g = d.grafik;

  return (
    <>
      <PageHeader
        judul="Rangkuman"
        sub={`Kondisi AADK per ${tanggalPanjang(d.tanggalIso)}`}
      />
      <RangkumanAdmin d={d} />
      <div className="grid grid-2" style={{ marginTop: 14 }}>
        <ChartCard judul="Tutorial baru per bulan" catatan="12 bulan terakhir">
          <LineChart label="Tutorial baru per bulan, 12 bulan terakhir" labels={g.bulan} nilai={g.tutorialBaru} />
        </ChartCard>
        <ChartCard judul="Pengguna baru per bulan" catatan="12 bulan terakhir">
          <BarChart label="Pengguna baru per bulan, 12 bulan terakhir" labels={g.bulan} nilai={g.penggunaBaru} />
        </ChartCard>
        <ChartCard judul="Komposisi pengguna" catatan="Anggota dan teknisi">
          <DonutChart
            label="Komposisi pengguna: anggota dan teknisi"
            segmen={[
              { label: "Anggota", nilai: g.peranPengguna.anggota, warna: WARNA.blue },
              { label: "Teknisi", nilai: g.peranPengguna.teknisi, warna: WARNA.orange },
            ]}
          />
        </ChartCard>
        <ChartCard judul="Post forum baru per bulan" catatan="12 bulan terakhir">
          <BarChart label="Post forum baru per bulan, 12 bulan terakhir" labels={g.bulan} nilai={g.forumBaru} />
        </ChartCard>
      </div>
    </>
  );
}
