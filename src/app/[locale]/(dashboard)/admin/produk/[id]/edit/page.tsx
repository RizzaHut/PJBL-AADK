import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ProdukForm } from "@/components/dashboard/admin/ProdukForm";
import { detailProduk } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Edit produk · Admin" };

export default async function ProdukEditPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const p = await detailProduk(id);
  if (!p) notFound();
  return <ProdukForm awal={p} />;
}
