import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { KonsolForm } from "@/components/dashboard/admin/KonsolForm";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Tambah konsol · Admin" };

export default async function KonsolBaruPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("super_admin");
  return <KonsolForm />;
}
