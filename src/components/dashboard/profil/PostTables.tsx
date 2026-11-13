import { AksiIkon } from "@/components/dashboard/ui/AksiBaris";
import { TombolHapus, TombolTunda } from "@/components/dashboard/ui/AksiBarisKlien";
import { DataTable, type Kolom } from "@/components/dashboard/ui/DataTable";
import { Link } from "@/i18n/navigation";
import { hapusPost, batalSuka } from "@/lib/actions/profil";
import { tanggal } from "@/lib/format";
import { TOPIK_FORUM } from "@/lib/konstanta";
import type { ListHasil } from "@/lib/queries/moderasi";
import { buatHref, type ParamTabel } from "@/lib/table-params";
import type { PostDisukai, PostSaya } from "@/types/domain";

export const BASE_POST = "/profil/post";
export const BASE_DISUKAI = "/profil/post/disukai";

const FILTER_TOPIK = [
  { kunci: "topik", label: "Semua topik", opsi: TOPIK_FORUM.map((t) => ({ nilai: t, label: t })) },
];

/** Tab "Dibuat" dan "Disukai" sebagai tautan (dua route). */
export function SubTab({ aktif, jumlah }: { aktif: "dibuat" | "disukai"; jumlah: { dibuat: number; disukai: number } }) {
  return (
    <div className="subtabs" role="navigation" aria-label="Jenis post">
      <Link href={BASE_POST} aria-current={aktif === "dibuat" ? "page" : undefined}>
        Dibuat ({jumlah.dibuat})
      </Link>
      <Link href={BASE_DISUKAI} aria-current={aktif === "disukai" ? "page" : undefined}>
        Disukai ({jumlah.disukai})
      </Link>
    </div>
  );
}

export async function PostDibuatTable({ list, param }: { list: ListHasil<PostSaya>; param: ParamTabel }) {
  const kolom: Kolom<PostSaya>[] = [
    {
      kunci: "judul",
      label: "Post",
      sel: (r) => (
        <>
          <div className="cell-strong">{r.judul}</div>
          <div className="cell-sub">{r.topik}</div>
        </>
      ),
    },
    { kunci: "jumlah_suka", label: "Suka", angka: true, lebar: "90px" },
    { kunci: "jumlah_komentar", label: "Komentar", angka: true, lebar: "100px" },
    { kunci: "dibuat_pada", label: "Dibuat", lebar: "130px", sel: (r) => tanggal(r.dibuat_pada) },
  ];
  return (
    <DataTable
      kolom={kolom}
      hasil={list.hasil}
      param={param}
      basePath={BASE_POST}
      kunciBaris={(r) => r.id}
      placeholderCari="Cari judul post…"
      filter={FILTER_TOPIK}
      kosong={{ judul: "Belum ada post", teks: "Buat post pertamamu untuk memulai diskusi." }}
      aksi={(r) => (
        <>
          <AksiIkon href={buatHref(BASE_POST, param, { detail: r.id })} label={`Lihat post ${r.judul}`} ikon="eye" />
          <AksiIkon href={`${BASE_POST}/${r.id}/edit`} label={`Edit post ${r.judul}`} ikon="edit" />
          <TombolHapus
            label={`Hapus post ${r.judul}`}
            judul="Hapus post ini?"
            isi={
              <>
                Post beserta <b>{r.jumlah_komentar} komentar</b>, <b>{r.jumlah_suka} suka</b>, dan gambarnya ikut
                terhapus. Tidak bisa dikembalikan.
              </>
            }
            jalankan={hapusPost.bind(null, r.id)}
            pesanSukses="Post dihapus."
          />
        </>
      )}
    />
  );
}

export async function PostDisukaiTable({ list, param }: { list: ListHasil<PostDisukai>; param: ParamTabel }) {
  const kolom: Kolom<PostDisukai>[] = [
    {
      kunci: "judul",
      label: "Post",
      sel: (r) => (
        <>
          <div className="cell-strong">{r.judul}</div>
          <div className="cell-sub">
            {r.penulis_username} · {r.topik}
          </div>
        </>
      ),
    },
    { kunci: "jumlah_suka", label: "Suka", angka: true, lebar: "90px" },
    { kunci: "disukai_pada", label: "Disukai pada", lebar: "140px", sel: (r) => tanggal(r.disukai_pada) },
  ];
  return (
    <DataTable
      kolom={kolom}
      hasil={list.hasil}
      param={param}
      basePath={BASE_DISUKAI}
      kunciBaris={(r) => r.id}
      placeholderCari="Cari judul atau penulis…"
      filter={FILTER_TOPIK}
      kosong={{ judul: "Belum ada post disukai", teks: "Post yang kamu sukai di forum akan muncul di sini." }}
      aksi={(r) => (
        <TombolTunda
          kunci={r.id}
          label={`Batal suka ${r.judul}`}
          ikon="x"
          pesan="Batal suka."
          jalankan={batalSuka.bind(null, r.id)}
        />
      )}
    />
  );
}
