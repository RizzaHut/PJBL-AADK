import { AksiIkon } from "@/components/dashboard/ui/AksiBaris";
import { Badge } from "@/components/dashboard/ui/Badge";
import { DataTable, type Kolom } from "@/components/dashboard/ui/DataTable";
import { inisial, tanggal, waktuLalu } from "@/lib/format";
import { LABEL_PERAN, NADA_PERAN } from "@/lib/labels";
import type { ListHasil } from "@/lib/queries/moderasi";
import { buatHref, type ParamTabel } from "@/lib/table-params";
import type { Pengguna } from "@/types/domain";

export const BASE_USER = "/admin/user";

const FILTER = [
  {
    kunci: "peran",
    label: "Semua peran",
    opsi: [
      { nilai: "anggota", label: LABEL_PERAN.anggota },
      { nilai: "teknisi", label: LABEL_PERAN.teknisi },
    ],
  },
];

export async function UserTable({ list, param }: { list: ListHasil<Pengguna>; param: ParamTabel }) {
  const kolom: Kolom<Pengguna>[] = [
    {
      kunci: "username",
      label: "Pengguna",
      sel: (r) => (
        <div className="person">
          <span className="av" aria-hidden="true">
            {inisial(r.username)}
          </span>
          <div className="t">
            <span className="cell-strong">{r.username}</span>
            <span className="cell-sub">{r.email}</span>
          </div>
        </div>
      ),
    },
    {
      kunci: "peran",
      label: "Peran",
      lebar: "120px",
      sel: (r) => <Badge nada={NADA_PERAN[r.peran]}>{LABEL_PERAN[r.peran]}</Badge>,
    },
    {
      kunci: "terakhir_aktif_pada",
      label: "Terakhir aktif",
      lebar: "150px",
      sel: (r) => waktuLalu(r.terakhir_aktif_pada),
    },
    { kunci: "dibuat_pada", label: "Anggota sejak", lebar: "150px", sel: (r) => tanggal(r.dibuat_pada) },
  ];
  return (
    <DataTable
      kolom={kolom}
      hasil={list.hasil}
      param={param}
      basePath={BASE_USER}
      kunciBaris={(r) => r.id}
      placeholderCari="Cari username atau email…"
      filter={FILTER}
      kosong={{ judul: "Belum ada pengguna", teks: "Akun yang mendaftar akan muncul di sini." }}
      aksi={(r) => (
        <AksiIkon href={buatHref(BASE_USER, param, { detail: r.id })} label={`Lihat pengguna ${r.username}`} ikon="eye" />
      )}
    />
  );
}
