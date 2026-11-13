import { getTranslations, setRequestLocale } from "next-intl/server";
import { KeputusanProvider } from "@/components/dashboard/ui/KeputusanProvider";
import { Shell } from "@/components/dashboard/ui/Shell";
import type { GrupNav } from "@/components/dashboard/ui/SidebarNav";
import { requireRole } from "@/lib/auth/session";
import { jumlahMenungguBayar } from "@/lib/queries/profil";

export default async function ProfilLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.nav.profile");
  const sesi = await requireRole("anggota", "teknisi");
  const menunggu = await jumlahMenungguBayar();
  const teknisi = sesi.peran === "teknisi";

  const grup: GrupNav[] = [
    { item: [{ href: "/profil", label: t("summary"), ikon: "summary", tepat: true }] },
    {
      judul: t("activity"),
      item: [
        ...(teknisi ? [{ href: "/profil/tutorial", label: t("myTutorials"), ikon: "book" as const }] : []),
        { href: "/profil/riwayat-baca", label: t("readingHistory"), ikon: "activity" },
        { href: "/profil/post", label: t("forumPosts"), ikon: "comment" },
        { href: "/profil/komentar", label: t("comments"), ikon: "reply" },
      ],
    },
    {
      judul: t("store"),
      item: [{ href: "/profil/pesanan", label: t("orders"), ikon: "box", lencana: menunggu || undefined }],
    },
    {
      judul: t("account"),
      item: [
        { href: "/profil/peringatan", label: t("warnings"), ikon: "alert" },
        ...(teknisi ? [] : [{ href: "/profil/jadi-teknisi", label: t("becomeTechnician"), ikon: "check-badge" as const }]),
        { href: "/profil/akun", label: t("myAccount"), ikon: "user" },
      ],
    },
    { item: [{ href: "/", label: t("backToSite"), ikon: "globe" }] },
  ];

  return (
    <Shell varian="profil" grup={grup} sesi={sesi} akunHref="/profil/akun">
      <KeputusanProvider>{children}</KeputusanProvider>
    </Shell>
  );
}
