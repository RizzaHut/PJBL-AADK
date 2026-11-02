import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ModelForm } from "@/components/dashboard/admin/ModelForm";
import { detailKonsol } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Tambah model · Admin" };

export default async function ModelBaruPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const konsol = await detailKonsol(id);
  if (!konsol) notFound();
  return <ModelForm konsol={{ id: konsol.id, nama: konsol.nama }} />;
}
