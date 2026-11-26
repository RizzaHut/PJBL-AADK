import { setRequestLocale } from "next-intl/server";
import { KeputusanProvider } from "@/components/dashboard/ui/KeputusanProvider";
import { Shell } from "@/components/dashboard/ui/Shell";
import type { GrupNav } from "@/components/dashboard/ui/SidebarNav";
import { requireRole } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sesi = await requireRole("super_admin");

  const grup: GrupNav[] = [
    { item: [{ href: "/admin", label: "Rangkuman", ikon: "summary", tepat: true }] },
    { judul: "Konten", item: [{ href: "/admin/konsol", label: "Kelola konsol", ikon: "console" }] },
    {
      judul: "Pengguna & staf",
      item: [
        { href: "/admin/user", label: "Kelola user", ikon: "users" },
        { href: "/admin/staf", label: "Kelola staf", ikon: "shield" },
      ],
    },
  ];

  return (
    <Shell varian="admin" grup={grup} sesi={sesi} akunHref="/admin">
      <KeputusanProvider>{children}</KeputusanProvider>
    </Shell>
  );
}
