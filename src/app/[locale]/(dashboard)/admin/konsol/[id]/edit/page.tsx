import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { KonsolForm } from "@/components/dashboard/admin/KonsolForm";
import { detailKonsol } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Edit konsol · Admin" };

export default async function KonsolEditPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const konsol = await detailKonsol(id);
  if (!konsol) notFound();
  return <KonsolForm awal={konsol} />;
}
