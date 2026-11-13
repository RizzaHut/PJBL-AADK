import { AksiIkon } from "@/components/dashboard/ui/AksiBaris";
import { TombolHapus } from "@/components/dashboard/ui/AksiBarisKlien";
import { Badge } from "@/components/dashboard/ui/Badge";
import { DataTable, type Kolom } from "@/components/dashboard/ui/DataTable";
import { hapusTutorial } from "@/lib/actions/profil";
import { angka, tanggal } from "@/lib/format";
import { LABEL_WAKTU } from "@/lib/konstanta";
import { LABEL_KESULITAN, NADA_KESULITAN } from "@/lib/labels";
import type { ListHasil } from "@/lib/queries/moderasi";
import { buatHref, type ParamTabel } from "@/lib/table-params";
import type { TutorialSaya } from "@/types/domain";

export const BASE_TUTORIAL = "/profil/tutorial";

const FILTER_TINGKAT =
  {
    kunci: "tingkat",
    label: "Semua tingkat",
    opsi: (Object.keys(LABEL_KESULITAN) as (keyof typeof LABEL_KESULITAN)[]).map((k) => ({ nilai: k, label: LABEL_KESULITAN[k] })),
  };

export async function TutorialTable({
  list,
  param,
  konsolPilihan,
}: {
  list: ListHasil<TutorialSaya>;
  param: ParamTabel;
  konsolPilihan: string[];
}) {
  const kolom: Kolom<TutorialSaya>[] = [
    {
      kunci: "judul",
      label: "Tutorial",
      sel: (r) => (
        <>
          <div className="cell-strong">{r.judul}</div>
          <div className="cell-sub">{r.konsol}</div>
        </>
      ),
    },
    {
      kunci: "tingkat",
      label: "Tingkat",
      lebar: "110px",
      sel: (r) => <Badge nada={NADA_KESULITAN[r.tingkat]}>{LABEL_KESULITAN[r.tingkat]}</Badge>,
    },
    { kunci: "waktu", label: "Estimasi", lebar: "130px", sel: (r) => LABEL_WAKTU[r.waktu] },
    { kunci: "pembaca", label: "Pembaca", angka: true, lebar: "100px", sel: (r) => angka(r.pembaca) },
    { kunci: "jumlah_komentar", label: "Komentar", angka: true, lebar: "100px" },
    { kunci: "dibuat_pada", label: "Diterbitkan", lebar: "130px", sel: (r) => tanggal(r.dibuat_pada) },
  ];
  return (
    <DataTable
      kolom={kolom}
      hasil={list.hasil}
      param={param}
      basePath={BASE_TUTORIAL}
      kunciBaris={(r) => r.id}
      placeholderCari="Cari judul atau konsol…"
      filter={[
        { kunci: "konsol", label: "Semua konsol", opsi: konsolPilihan.map((k) => ({ nilai: k, label: k })) },
        FILTER_TINGKAT,
      ]}
      kosong={{ judul: "Belum ada tutorial", teks: "Tulis tutorial pertamamu untuk dibaca anggota lain." }}
      aksi={(r) => (
        <>
          <AksiIkon href={buatHref(BASE_TUTORIAL, param, { detail: r.id })} label={`Lihat tutorial ${r.judul}`} ikon="eye" />
          <AksiIkon href={`${BASE_TUTORIAL}/${r.id}/edit`} label={`Edit tutorial ${r.judul}`} ikon="edit" />
          <TombolHapus
            label={`Hapus tutorial ${r.judul}`}
            judul="Hapus tutorial ini?"
            isi={
              <>
                Tutorial beserta <b>{r.jumlah_komentar} komentar</b>, riwayat baca ({angka(r.pembaca)} pembaca), dan semua
                gambar langkahnya ikut terhapus. Tidak bisa dikembalikan.
              </>
            }
            jalankan={hapusTutorial.bind(null, r.id)}
            pesanSukses="Tutorial dihapus."
          />
        </>
      )}
    />
  );
}
