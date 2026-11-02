import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { DampakHapusKonsol } from "@/components/dashboard/admin/KonsolTable";
import { HapusHalaman } from "@/components/dashboard/admin/HapusHalaman";
import { ModelTable } from "@/components/dashboard/admin/ModelTable";
import { CrumbsJalur } from "@/components/dashboard/ui/FormHalaman";
import { Icon } from "@/components/dashboard/ui/Icon";
import { Link } from "@/i18n/navigation";
import { hapusKonsol } from "@/lib/actions/admin";
import { inisial } from "@/lib/format";
import { LABEL_MEREK, LABEL_TIPE } from "@/lib/labels";
import { daftarModel, detailKonsol, KONFIG_MODEL } from "@/lib/queries/admin";
import { bacaParam, type SearchParams } from "@/lib/table-params";

export const metadata: Metadata = { title: "Detail konsol · Admin" };

export default async function KonsolDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const konsol = await detailKonsol(id);
  if (!konsol) notFound();
  const param = bacaParam(await searchParams, KONFIG_MODEL);
  const list = await daftarModel(id, param);

  return (
    <>
      <CrumbsJalur item={[{ label: "Kelola konsol", href: "/admin/konsol" }, { label: konsol.nama }]} />
      <div className="hero">
        <div className="hero-ph" aria-hidden="true">
          {inisial(konsol.nama)}
        </div>
        <div className="hero-t">
          <h1 className="title">{konsol.nama}</h1>
          <p className="sub">
            {LABEL_MEREK[konsol.merek]} · {LABEL_TIPE[konsol.tipe]} · Rilis {konsol.tahun_rilis}
          </p>
        </div>
        <div className="row-flex">
          <Link className="btn btn-ghost" href={`/admin/konsol/${id}/edit`}>
            <Icon nama="edit" />
            Edit konsol
          </Link>
          <HapusHalaman
            label="Hapus konsol"
            judul="Hapus konsol ini?"
            isi={<DampakHapusKonsol nama={konsol.nama} jumlahModel={konsol.jumlah_model} />}
            jalankan={hapusKonsol.bind(null, id)}
            kembaliHref="/admin/konsol"
            pesanSukses="Konsol dihapus."
          />
        </div>
      </div>

      {konsol.deskripsi ? (
        <p style={{ maxWidth: 720, margin: "4px 0 20px" }}>{konsol.deskripsi}</p>
      ) : (
        <div className="empty-desc">
          Konsol ini belum punya deskripsi.{" "}
          <Link href={`/admin/konsol/${id}/edit`}>Tambah deskripsi</Link>
        </div>
      )}

      <div className="sec">
        <div className="sec-head">
          <h2>Model konsol ({konsol.jumlah_model})</h2>
          <Link className="btn btn-primary btn-sm" href={`/admin/konsol/${id}/model/baru`}>
            <Icon nama="plus" />
            Tambah model
          </Link>
        </div>
        <ModelTable konsolId={id} list={list} param={param} />
      </div>
    </>
  );
}
