import { AksiIkon } from "@/components/dashboard/ui/AksiBaris";
import { Badge } from "@/components/dashboard/ui/Badge";
import { DataTable, type Kolom } from "@/components/dashboard/ui/DataTable";
import { tanggal } from "@/lib/format";
import { AMBANG_TERLAMBAT_HARI } from "@/lib/konstanta";
import { LABEL_PENGAJUAN } from "@/lib/labels";
import type { ListHasil } from "@/lib/queries/moderasi";
import { buatHref, type ParamTabel } from "@/lib/table-params";
import { hariSejak } from "@/lib/waktu";
import type { PengajuanTeknisi } from "@/types/domain";
import { Terlambat } from "./Person";

export const BASE_PENGAJUAN = "/moderator/pengajuan";

export async function PengajuanTable({ list, param }: { list: ListHasil<PengajuanTeknisi>; param: ParamTabel }) {
  const kolom: Kolom<PengajuanTeknisi>[] = [
    {
      kunci: "username",
      label: "Pemohon",
      sel: (r) => (
        <>
          <div className="cell-strong">{r.username}</div>
          <div className="cell-sub">{r.email}</div>
        </>
      ),
    },
    {
      kunci: "diajukan_pada",
      label: "Diajukan",
      lebar: "170px",
      sel: (r) => {
        const hari = hariSejak(r.diajukan_pada);
        return (
          <>
            {tanggal(r.diajukan_pada)}
            {r.status === "pending" && hari > AMBANG_TERLAMBAT_HARI ? <Terlambat hari={hari} /> : null}
          </>
        );
      },
    },
    {
      kunci: "status",
      label: "Status",
      lebar: "140px",
      sel: (r) => <Badge nada={LABEL_PENGAJUAN[r.status].nada}>{LABEL_PENGAJUAN[r.status].teks}</Badge>,
    },
    {
      kunci: "ditinjau_oleh_username",
      label: "Ditinjau oleh",
      lebar: "170px",
      sel: (r) => r.ditinjau_oleh_username ?? <span className="mute">—</span>,
    },
  ];

  const h = list.hitung;
  const pil = (["pending", "approved", "rejected"] as const).map((s) => ({
    nilai: s,
    label: LABEL_PENGAJUAN[s].teks,
    jumlah: h[s] ?? 0,
  }));

  return (
    <DataTable
      kolom={kolom}
      hasil={list.hasil}
      param={param}
      basePath={BASE_PENGAJUAN}
      kunciBaris={(r) => r.id}
      placeholderCari="Cari username atau email pemohon…"
      pil={pil}
      statusBawaan="pending"
      kosong={{ judul: "Belum ada pengajuan", teks: "Pengajuan teknisi dari anggota akan muncul di sini." }}
      aksi={(r) => (
        <AksiIkon
          href={buatHref(BASE_PENGAJUAN, param, { detail: r.id })}
          label={`Lihat pengajuan ${r.username}`}
          ikon="eye"
        />
      )}
    />
  );
}
