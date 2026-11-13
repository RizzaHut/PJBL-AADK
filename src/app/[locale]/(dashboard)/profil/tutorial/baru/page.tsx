import type { Metadata } from "next";
import { localizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { TutorialStepper } from "@/components/dashboard/profil/TutorialStepper";
import { requireRole } from "@/lib/auth/session";
import { daftarPilihanKonsol } from "@/lib/queries/profil";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localizedMetadata(locale, "Tulis tutorial · Profil", "Write a tutorial · Profile");
}

export default async function TutorialBaruPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("teknisi");
  const konsolPilihan = await daftarPilihanKonsol();
  return <TutorialStepper konsolPilihan={konsolPilihan} />;
}
