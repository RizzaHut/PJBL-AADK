import type { Metadata } from "next";
import { localizedMetadata } from "@/i18n/metadata";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { PostForm } from "@/components/dashboard/profil/PostForm";
import { detailPost } from "@/lib/queries/profil";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localizedMetadata(locale, "Edit post · Profil", "Edit post · Profile");
}

export default async function PostEditPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const p = await detailPost(id);
  if (!p) notFound();
  return <PostForm awal={{ id: p.id, judul: p.judul, topik: p.topik, isi: p.isi, gambar: p.gambar }} />;
}
