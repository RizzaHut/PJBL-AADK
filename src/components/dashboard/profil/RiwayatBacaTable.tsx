import { Badge } from "@/components/dashboard/ui/Badge";
import { DataTable, type Kolom } from "@/components/dashboard/ui/DataTable";
import { TombolTunda } from "@/components/dashboard/ui/AksiBarisKlien";
import { hapusRiwayatBaca } from "@/lib/actions/profil";
import { tanggal } from "@/lib/format";
import { LABEL_BACA } from "@/lib/labels";
import type { ListHasil } from "@/lib/queries/moderasi";
import type { ParamTabel } from "@/lib/table-params";
import type { RiwayatBaca } from "@/types/domain";

export const BASE_BACA = "/profil/riwayat-baca";

export async function RiwayatBacaTable({ list, param }: { list: ListHasil<RiwayatBaca>; param: ParamTabel }) {
  const kolom: Kolom<RiwayatBaca>[] = [
    {
      kunci: "judul",
      label: "Judul",
      sel: (r) => (
        <>
          <div className="cell-strong">{r.judul}</div>
          <div className="cell-sub">{r.keterangan}</div>
        </>
      ),
    },
    {
      kunci: "jenis",
      label: "Jenis",
      lebar: "130px",
      sel: (r) => <Badge nada={LABEL_BACA[r.jenis].nada}>{LABEL_BACA[r.jenis].teks}</Badge>,
    },
    { kunci: "dibaca_pada", label: "Terakhir dibaca", lebar: "150px", sel: (r) => tanggal(r.dibaca_pada) },
  ];
  const h = list.hitung;
  return (
    <DataTable
      kolom={kolom}
      hasil={list.hasil}
      param={param}
      basePath={BASE_BACA}
      kunciBaris={(r) => r.id}
      placeholderCari="Cari judul…"
      pil={[
        { nilai: "", label: "Semua", jumlah: list.totalSemua },
        { nilai: "tutorial", label: "Tutorial", jumlah: h.tutorial ?? 0 },
        { nilai: "postingan_forum", label: "Post forum", jumlah: h.postingan_forum ?? 0 },
      ]}
      kosong={{ judul: "Riwayat baca kosong", teks: "Tutorial dan post forum yang kamu buka akan tercatat di sini." }}
      aksi={(r) => (
        <TombolTunda
          kunci={r.id}
          label={`Hapus ${r.judul} dari riwayat`}
          ikon="trash"
          konfirmasi={{
            judul: "Hapus dari riwayat?",
            isi: (
              <>
                Hanya catatan riwayat bacamu yang dihapus. <b>{r.judul}</b> tetap ada di{" "}
                {r.jenis === "tutorial" ? "daftar tutorial" : "forum"}.
              </>
            ),
            labelOk: "Hapus",
          }}
          pesan="Dihapus dari riwayat."
          jalankan={hapusRiwayatBaca.bind(null, r.id)}
        />
      )}
    />
  );
}
