import type { Metadata } from "next";
import { localizedMetadata } from "@/i18n/metadata";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { TutorialStepper } from "@/components/dashboard/profil/TutorialStepper";
import { requireRole } from "@/lib/auth/session";
import { daftarPilihanKonsol, detailTutorial } from "@/lib/queries/profil";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localizedMetadata(locale, "Edit tutorial · Profil", "Edit tutorial · Profile");
}

export default async function TutorialEditPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireRole("teknisi");
  const [t, konsolPilihan] = await Promise.all([detailTutorial(id), daftarPilihanKonsol()]);
  if (!t) notFound();
  return <TutorialStepper key={t.id} awal={t} konsolPilihan={konsolPilihan} />;
}
