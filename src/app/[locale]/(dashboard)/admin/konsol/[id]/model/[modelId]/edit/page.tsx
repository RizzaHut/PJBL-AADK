import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ModelForm } from "@/components/dashboard/admin/ModelForm";
import { detailKonsol, detailModel } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Edit model · Admin" };

export default async function ModelEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; modelId: string }>;
}) {
  const { locale, id, modelId } = await params;
  setRequestLocale(locale);
  const [konsol, model] = await Promise.all([detailKonsol(id), detailModel(modelId)]);
  if (!konsol || !model || model.konsol_id !== id) notFound();
  return <ModelForm konsol={{ id: konsol.id, nama: konsol.nama }} awal={model} />;
}
