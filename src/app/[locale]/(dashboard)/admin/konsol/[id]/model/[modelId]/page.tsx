import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { HapusHalaman } from "@/components/dashboard/admin/HapusHalaman";
import { CrumbsJalur } from "@/components/dashboard/ui/FormHalaman";
import { Icon } from "@/components/dashboard/ui/Icon";
import { KV } from "@/components/dashboard/ui/KV";
import { Link } from "@/i18n/navigation";
import { hapusModel } from "@/lib/actions/admin";
import { detailKonsol, detailModel } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Detail model · Admin" };

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; modelId: string }>;
}) {
  const { locale, id, modelId } = await params;
  setRequestLocale(locale);
  const [konsol, m] = await Promise.all([detailKonsol(id), detailModel(modelId)]);
  if (!konsol || !m || m.konsol_id !== id) notFound();
  const dasar = `/admin/konsol/${id}`;

  return (
    <>
      <CrumbsJalur
        item={[
          { label: "Kelola konsol", href: "/admin/konsol" },
          { label: konsol.nama, href: dasar },
          { label: m.nama },
        ]}
      />
      <div className="hero">
        <div className="hero-t">
          <h1 className="title">{m.nama}</h1>
          <p className="sub">
            Model dari {konsol.nama}
            {m.kode ? ` · ${m.kode}` : ""}
          </p>
        </div>
        <div className="row-flex">
          <Link className="btn btn-ghost" href={`${dasar}/model/${m.id}/edit`}>
            <Icon nama="edit" />
            Edit model
          </Link>
          <HapusHalaman
            label="Hapus model"
            judul="Hapus model ini?"
            isi={`Model ${m.nama} dihapus dari ${konsol.nama}. Tutorial yang memakainya tidak ikut terhapus.`}
            jalankan={hapusModel.bind(null, m.id)}
            kembaliHref={dasar}
            pesanSukses="Model dihapus."
          />
        </div>
      </div>
      <div className="banner-ph" aria-hidden={m.url_banner ? undefined : true}>
        {m.url_banner ?? "Belum ada banner"}
      </div>
      <KV
        item={[
          { label: "Kode model", nilai: m.kode || "-" },
          { label: "Tahun rilis", nilai: m.tahun_rilis ?? "-" },
          { label: "Warna", nilai: m.warna.length ? m.warna.join(", ") : "-" },
          { label: "Konektivitas", nilai: m.konektivitas.length ? m.konektivitas.join(", ") : "-" },
          { label: "Performa", nilai: m.performa || "-" },
          { label: "Media penyimpanan", nilai: m.media_penyimpanan || "-" },
        ]}
      />
    </>
  );
}
