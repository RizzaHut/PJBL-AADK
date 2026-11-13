import type { Metadata } from "next";
import { localizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { JadiTeknisiView } from "@/components/dashboard/profil/JadiTeknisiView";
import { requireRole } from "@/lib/auth/session";
import { jadiTeknisi } from "@/lib/queries/profil";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localizedMetadata(locale, "Jadi teknisi · Profil", "Become a technician · Profile");
}

export default async function JadiTeknisiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("anggota");
  const d = await jadiTeknisi();
  return (
    <>
      <PageHeader judul="Jadi teknisi" sub="Ajukan diri untuk menulis tutorial perbaikan konsol." />
      <JadiTeknisiView d={d} />
    </>
  );
}
