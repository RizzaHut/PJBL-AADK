import type { Metadata } from "next";
import { localizedMetadata } from "@/i18n/metadata";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AkunForm } from "@/components/dashboard/moderator/AkunForm";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { requireRole } from "@/lib/auth/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localizedMetadata(locale, "Akun saya · Moderator", "My account · Moderator");
}

export default async function AkunPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sesi = await requireRole("moderator", "super_admin");
  const t = await getTranslations("dashboard");

  return (
    <>
      <PageHeader judul="Akun saya" sub="Kelola username, email, dan password untuk masuk ke dashboard moderator." />
      <AkunForm username={sesi.username} email={sesi.email} peranLabel={t(`peran.${sesi.peran}`)} />
    </>
  );
}
