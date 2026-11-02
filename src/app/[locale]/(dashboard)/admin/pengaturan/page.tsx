import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PengaturanForm } from "@/components/dashboard/admin/PengaturanForm";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { pengaturanToko } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Pengaturan toko · Admin" };

export default async function PengaturanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const p = await pengaturanToko();
  return (
    <>
      <PageHeader judul="Pengaturan toko" sub="Nomor WhatsApp dan QRIS yang dilihat semua pembeli." />
      <PengaturanForm whatsapp={p.nomor_whatsapp} namaQris={p.nama_qris} />
    </>
  );
}
