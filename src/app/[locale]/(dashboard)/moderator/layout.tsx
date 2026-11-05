import { getTranslations, setRequestLocale } from "next-intl/server";
import { Shell } from "@/components/dashboard/ui/Shell";
import type { GrupNav } from "@/components/dashboard/ui/SidebarNav";
import { KeputusanProvider } from "@/components/dashboard/ui/KeputusanProvider";
import { requireRole } from "@/lib/auth/session";
import { hitungAntrean } from "@/lib/queries/moderasi";

export default async function ModeratorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.nav.moderator");
  const sesi = await requireRole("moderator", "super_admin");
  const antrean = await hitungAntrean();

  const grup: GrupNav[] = [
    { item: [{ href: "/moderator", label: t("summary"), ikon: "summary", tepat: true }] },
    {
      judul: t("moderation"),
      item: [
        { href: "/moderator/pengajuan", label: t("technicianApplications"), ikon: "check-badge", lencana: antrean.pengajuan },
        { href: "/moderator/laporan", label: t("contentReports"), ikon: "flag", lencana: antrean.laporan },
        { href: "/moderator/peringatan", label: t("warnings"), ikon: "alert" },
      ],
    },
    { judul: t("account"), item: [{ href: "/moderator/akun", label: t("myAccount"), ikon: "user" }] },
  ];

  return (
    <Shell varian="moderator" grup={grup} sesi={sesi} akunHref="/moderator/akun">
      <KeputusanProvider>{children}</KeputusanProvider>
    </Shell>
  );
}
