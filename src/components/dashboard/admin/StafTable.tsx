import { TombolHapus } from "@/components/dashboard/ui/AksiBarisKlien";
import { Badge } from "@/components/dashboard/ui/Badge";
import { DataTable, type Kolom } from "@/components/dashboard/ui/DataTable";
import { cabutModerator } from "@/lib/actions/admin";
import { tanggal } from "@/lib/format";
import type { ListHasil } from "@/lib/queries/moderasi";
import type { ParamTabel } from "@/lib/table-params";
import type { Staf } from "@/types/domain";

export const BASE_STAF = "/admin/staf";

export async function StafTable({ list, param }: { list: ListHasil<Staf>; param: ParamTabel }) {
  const kolom: Kolom<Staf>[] = [
    { kunci: "username", label: "Username" },
    { kunci: "email", label: "Email" },
    {
      kunci: "asal",
      label: "Asal",
      lebar: "150px",
      bisaUrut: false,
      sel: (r) => <Badge nada={r.asal === "undangan" ? "info" : "mute"}>{r.asal === "undangan" ? "Diundang" : "Dari anggota"}</Badge>,
    },
    { kunci: "dibuat_pada", label: "Bergabung", lebar: "130px", sel: (r) => tanggal(r.dibuat_pada) },
  ];
  return (
    <DataTable
      kolom={kolom}
      hasil={list.hasil}
      param={param}
      basePath={BASE_STAF}
      kunciBaris={(r) => r.id}
      placeholderCari="Cari moderator…"
      kosong={{ judul: "Belum ada moderator", teks: "Undang moderator pertama lewat tombol di atas." }}
      aksi={(r) =>
        r.peran === "moderator" ? (
          <TombolHapus
            label={`Cabut moderator ${r.username}`}
            judul="Hapus akun moderator ini?"
            isi={
              <>
                Akun <b>{r.username}</b> tidak bisa masuk lagi ke dashboard moderator. Tindakan ini tidak bisa dikembalikan.
              </>
            }
            labelOk="Hapus akun"
            jalankan={cabutModerator.bind(null, r.id)}
            pesanSukses="Akun moderator dihapus."
          />
        ) : null
      }
    />
  );
}
