import type { Metadata } from "next";
import { localizedMetadata } from "@/i18n/metadata";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { AkunProfilForm } from "@/components/dashboard/profil/AkunProfilForm";
import { profilSaya } from "@/lib/queries/profil";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localizedMetadata(locale, "Akun saya · Profil", "My account · Profile");
}

export default async function AkunPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [me, t] = await Promise.all([profilSaya(), getTranslations("dashboard")]);
  return (
    <>
      <PageHeader judul="Akun saya" sub="Kelola profil, email, dan password." />
      <AkunProfilForm
        username={me.username}
        email={me.email}
        tanggalLahir={me.tanggal_lahir}
        jenisKelamin={me.jenis_kelamin}
        peranLabel={t(`peran.${me.peran}`)}
      />
    </>
  );
}
