import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { RangkumanAdmin } from "@/components/dashboard/admin/RangkumanAdmin";
import { BarChart, ChartCard, DonutChart, LineChart, WARNA } from "@/components/dashboard/ui/chart/Charts";
import { Icon } from "@/components/dashboard/ui/Icon";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { Link } from "@/i18n/navigation";
import { tanggalPanjang } from "@/lib/format";
import { rangkumanAdmin } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Rangkuman · Admin" };

export default async function RangkumanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const d = await rangkumanAdmin();
  const g = d.grafik;
  const total = g.pendapatan.reduce((a, b) => a + b, 0) * 1000;
  const warna = [WARNA.blue, WARNA.orange, WARNA.green];

  return (
    <>
      <PageHeader
        judul="Rangkuman"
        sub={`Kondisi AADK per ${tanggalPanjang(d.tanggalIso)}`}
        aksi={
          <>
            <Link className="btn btn-ghost" href="/admin/konsol/baru">
              <Icon nama="plus" />
              Tambah konsol
            </Link>
            <Link className="btn btn-primary" href="/admin/produk/baru">
              <Icon nama="plus" />
              Tambah produk
            </Link>
          </>
        }
      />
      <RangkumanAdmin d={d} />
      <div className="grid grid-2" style={{ marginTop: 14 }}>
        <ChartCard
          judul="Pendapatan toko"
          catatan={`Dalam ribuan rupiah · Total Rp ${total.toLocaleString("id-ID")}`}
        >
          <LineChart label="Pendapatan toko per bulan, 12 bulan terakhir" labels={g.bulan} nilai={g.pendapatan} />
        </ChartCard>
        <ChartCard judul="Pengguna baru per bulan" catatan="12 bulan terakhir">
          <BarChart label="Pengguna baru per bulan, 12 bulan terakhir" labels={g.bulan} nilai={g.penggunaBaru} />
        </ChartCard>
        <ChartCard judul="Produk per kategori">
          <DonutChart
            label="Produk per kategori"
            segmen={g.kategori.map((s, i) => ({ ...s, warna: warna[i % warna.length] }))}
          />
        </ChartCard>
        <ChartCard judul="Transaksi per status">
          <BarChart
            label="Transaksi per status"
            labels={g.status.map((s) => s.label)}
            nilai={g.status.map((s) => s.nilai)}
            warna={[WARNA.orange, WARNA.blue, WARNA.green]}
          />
        </ChartCard>
      </div>
    </>
  );
}
