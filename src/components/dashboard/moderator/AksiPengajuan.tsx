"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ConfirmDialog } from "@/components/dashboard/ui/ConfirmDialog";
import { Field, Textarea, idDeskripsi } from "@/components/dashboard/ui/Field";
import { Modal } from "@/components/dashboard/ui/Modal";
import { useToast } from "@/components/dashboard/ui/Toast";
import { setujuiPengajuan, tolakPengajuan } from "@/lib/actions/moderasi";
import { tanggal } from "@/lib/format";
import { BATAS_ALASAN, galatAlasan } from "@/lib/validasi";
import { COOLDOWN_HARI } from "@/lib/konstanta";
import { useKeputusan } from "@/components/dashboard/ui/KeputusanProvider";

interface Props {
  id: string;
  username: string;
  tutupHref: string;
  berikutnyaHref: string | null;
  /** Tanggal pemohon boleh mengajukan lagi bila ditolak sekarang (ISO). */
  bolehLagi: string;
}

/** Tombol keputusan di footer drawer pengajuan. Keputusan ditahan sebentar supaya bisa diurungkan. */
export function AksiPengajuan({ id, username, tutupHref, berikutnyaHref, bolehLagi }: Props) {
  const router = useRouter();
  const { tunda } = useKeputusan();
  const toast = useToast();
  const [mode, setMode] = useState<"setuju" | "tolak" | null>(null);
  const [alasan, setAlasan] = useState("");
  const [galat, setGalat] = useState("");

  function tutupModal() {
    setMode(null);
    setAlasan("");
    setGalat("");
  }

  function setuju() {
    tutupModal();
    router.replace(tutupHref, { scroll: false });
    tunda({
      kunci: id,
      pesan: "Pengajuan disetujui.",
      jalankan: () => setujuiPengajuan(id),
      berikutnyaHref,
    });
  }

  function tolak() {
    const g = galatAlasan(alasan, "Alasan penolakan wajib diisi.");
    if (g) {
      setGalat(g);
      toast.tampil(g);
      return;
    }
    const isi = alasan.trim();
    tutupModal();
    router.replace(tutupHref, { scroll: false });
    tunda({
      kunci: id,
      pesan: "Pengajuan ditolak.",
      jalankan: () => tolakPengajuan(id, isi),
      berikutnyaHref,
    });
  }

  return (
    <>
      <button className="btn btn-danger" type="button" onClick={() => setMode("tolak")}>
        Tolak
      </button>
      <button className="btn btn-ok" type="button" onClick={() => setMode("setuju")}>
        Setujui
      </button>

      {mode === "setuju" ? (
        <ConfirmDialog
          judul="Setujui pengajuan ini?"
          isi={
            <>
              Peran <b>{username}</b> berubah dari anggota menjadi teknisi dan bisa langsung menerbitkan tutorial.
              Keputusan tercatat atas namamu.
            </>
          }
          labelOk="Ya, setujui"
          onOk={setuju}
          onTutup={tutupModal}
        />
      ) : null}

      {mode === "tolak" ? (
        <Modal
          judul="Tolak pengajuan"
          onTutup={tutupModal}
          foot={
            <>
              <button className="btn btn-ghost" type="button" onClick={tutupModal}>
                Batal
              </button>
              <button className="btn btn-danger" type="button" onClick={tolak}>
                Tolak pengajuan
              </button>
            </>
          }
        >
          <Field
            id="tolak-alasan"
            label="Alasan penolakan"
            galat={galat}
            hint={`Alasan tampil ke pemohon. Pemohon boleh mengajukan lagi mulai ${tanggal(bolehLagi)} (${COOLDOWN_HARI} hari).`}
          >
            <Textarea
              id="tolak-alasan"
              value={alasan}
              maxLength={BATAS_ALASAN}
              galat={!!galat}
              aria-describedby={idDeskripsi("tolak-alasan", { hint: true, galat: !!galat })}
              placeholder="Jelaskan apa yang kurang supaya pemohon bisa memperbaikinya."
              onChange={(e) => {
                setAlasan(e.target.value);
                if (galat) setGalat("");
              }}
            />
          </Field>
        </Modal>
      ) : null}
    </>
  );
}
