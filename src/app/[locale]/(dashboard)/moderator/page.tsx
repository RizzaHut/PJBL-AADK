import type { Metadata } from "next";
import { localizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { RangkumanStats } from "@/components/dashboard/moderator/RangkumanStats";
import { ChartCard, DonutChart, LineChart, WARNA } from "@/components/dashboard/ui/chart/Charts";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { grafikModerator, statistikModerator } from "@/lib/queries/moderasi";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localizedMetadata(locale, "Rangkuman · Moderator", "Overview · Moderator");
}

export default async function RangkumanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [stat, grafik] = await Promise.all([statistikModerator(), grafikModerator()]);
  const warna = [WARNA.blue, WARNA.orange, WARNA.green];

  return (
    <>
      <PageHeader judul="Rangkuman" sub="Antrean yang butuh keputusanmu dan gambaran laporan terbaru." />
      <RangkumanStats s={stat} />
      <div className="grid grid-2" style={{ marginTop: 14 }}>
        <ChartCard judul="Laporan masuk per minggu" catatan="8 minggu terakhir">
          <LineChart
            label="Laporan masuk per minggu, 8 minggu terakhir"
            labels={grafik.mingguan.labels}
            nilai={grafik.mingguan.nilai}
          />
        </ChartCard>
        <ChartCard judul="Laporan per jenis konten">
          <DonutChart
            label="Laporan per jenis konten"
            segmen={grafik.perJenis.map((s, i) => ({ ...s, warna: warna[i % warna.length] }))}
          />
        </ChartCard>
      </div>
    </>
  );
}
