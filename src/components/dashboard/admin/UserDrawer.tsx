"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/dashboard/ui/ConfirmDialog";
import { Drawer } from "@/components/dashboard/ui/Drawer";
import { Select } from "@/components/dashboard/ui/Field";
import { KV } from "@/components/dashboard/ui/KV";
import { Badge } from "@/components/dashboard/ui/Badge";
import { useToast } from "@/components/dashboard/ui/Toast";
import { useRouter } from "@/i18n/navigation";
import { hapusUser, jadikanModerator, ubahPeranUser } from "@/lib/actions/admin";
import { LABEL_PERAN, NADA_PERAN } from "@/lib/labels";
import type { ActionResult } from "@/lib/actions/hasil";
import type { PeranPengguna } from "@/types/domain";

interface Props {
  id: string;
  username: string;
  email: string;
  peran: PeranPengguna;
  inisial: string;
  aktifLabel: string;
  sejakLabel: string;
  tutupHref: string;
}

type Dialog = "peran" | "moderator" | "hapus" | null;

/** Drawer detail pengguna: ubah peran, jadikan moderator, hapus akun (semuanya lewat dialog). */
export function UserDrawer({ id, username, email, peran, inisial, aktifLabel, sejakLabel, tutupHref }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [pilih, setPilih] = useState<PeranPengguna>(peran);
  const [dialog, setDialog] = useState<Dialog>(null);

  async function jalankan(f: () => Promise<ActionResult>, pesan: string) {
    const h = await f();
    setDialog(null);
    toast.tampil(h.ok ? (h.pesan ?? pesan) : h.pesan);
    if (h.ok) {
      router.replace(tutupHref, { scroll: false });
      router.refresh();
    }
  }

  return (
    <Drawer judul="Detail pengguna" tutupHref={tutupHref}>
      <div className="row-flex" style={{ gap: 14, marginBottom: 18 }}>
        <span className="av" style={{ width: 56, height: 56, fontSize: 18 }} aria-hidden="true">
          {inisial}
        </span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{username}</div>
          <div className="cell-sub">{email}</div>
        </div>
      </div>
      <KV
        item={[
          { label: "Peran", nilai: <Badge nada={NADA_PERAN[peran]}>{LABEL_PERAN[peran]}</Badge> },
          { label: "Terakhir aktif", nilai: aktifLabel },
          { label: "Anggota sejak", nilai: sejakLabel },
        ]}
      />
      <hr className="hr" />
      <div className="field">
        <label htmlFor="u-peran">Ubah peran</label>
        <div className="inline-add">
          <Select id="u-peran" value={pilih} onChange={(e) => setPilih(e.target.value as PeranPengguna)}>
            <option value="anggota">{LABEL_PERAN.anggota}</option>
            <option value="teknisi">{LABEL_PERAN.teknisi}</option>
          </Select>
          <button className="btn btn-blue" type="button" disabled={pilih === peran} onClick={() => setDialog("peran")}>
            Simpan
          </button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
        <button className="btn btn-ghost" type="button" onClick={() => setDialog("moderator")}>
          Jadikan moderator
        </button>
        <button className="btn btn-danger" type="button" onClick={() => setDialog("hapus")}>
          Hapus akun
        </button>
      </div>

      {dialog === "peran" ? (
        <ConfirmDialog
          judul="Ubah peran pengguna?"
          isi={
            <>
              Peran <b>{username}</b> akan diubah menjadi {LABEL_PERAN[pilih]}.
            </>
          }
          labelOk="Ubah peran"
          onOk={() => jalankan(() => ubahPeranUser(id, pilih), "Peran diperbarui.")}
          onTutup={() => setDialog(null)}
        />
      ) : null}
      {dialog === "moderator" ? (
        <ConfirmDialog
          judul="Jadikan moderator?"
          isi={`${username} tetap memakai email dan password yang sama, dan akan masuk ke dashboard moderator. Konten lamanya tetap tersimpan. Bisa dicabut kapan saja dari Kelola staf.`}
          labelOk="Jadikan moderator"
          onOk={() => jalankan(() => jadikanModerator(id), "Akun dijadikan moderator.")}
          onTutup={() => setDialog(null)}
        />
      ) : null}
      {dialog === "hapus" ? (
        <ConfirmDialog
          judul="Hapus akun ini?"
          isi={`Semua tutorial, post, dan komentar milik ${username} ikut terhapus dan tidak bisa dikembalikan.`}
          bahaya
          labelOk="Hapus akun"
          onOk={() => jalankan(() => hapusUser(id), "Akun dihapus.")}
          onTutup={() => setDialog(null)}
        />
      ) : null}
    </Drawer>
  );
}
