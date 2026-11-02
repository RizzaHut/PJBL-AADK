import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ProdukForm } from "@/components/dashboard/admin/ProdukForm";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Tambah produk · Admin" };

export default async function ProdukBaruPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("super_admin");
  return <ProdukForm />;
}
