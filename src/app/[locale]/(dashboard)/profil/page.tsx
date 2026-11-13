import type { Metadata } from "next";
import { localizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { RangkumanProfil } from "@/components/dashboard/profil/RangkumanProfil";
import { rangkumanProfil } from "@/lib/queries/profil";
import { sekarangIso } from "@/lib/waktu";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localizedMetadata(locale, "Rangkuman · Profil", "Overview · Profile");
}

export default async function ProfilPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const d = await rangkumanProfil();
  return (
    <>
      <PageHeader judul="Rangkuman" sub="Ringkasan aktivitas dan hal yang perlu kamu lakukan." />
      <RangkumanProfil d={d} hariIni={sekarangIso()} />
    </>
  );
}
