"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ConfirmDialog } from "@/components/dashboard/ui/ConfirmDialog";
import { Field, Textarea, idDeskripsi } from "@/components/dashboard/ui/Field";
import { Modal } from "@/components/dashboard/ui/Modal";
import { useToast } from "@/components/dashboard/ui/Toast";
import { abaikanLaporan, hapusKonten } from "@/lib/actions/moderasi";
import { BATAS_ALASAN, galatAlasan } from "@/lib/validasi";
import { useKeputusan } from "@/components/dashboard/ui/KeputusanProvider";

interface Props {
  kunci: string;
  terlapor: string;
  jumlahPelapor: number;
  /** Teks tempat konten tayang, mis. "forum (balasan di bawahnya ikut terhapus)". */
  tempat: string;
  tutupHref: string;
  berikutnyaHref: string | null;
}

/** Tombol keputusan di footer drawer laporan. */
export function AksiLaporan({ kunci, terlapor, jumlahPelapor, tempat, tutupHref, berikutnyaHref }: Props) {
  const router = useRouter();
  const { tunda } = useKeputusan();
  const toast = useToast();
  const [mode, setMode] = useState<"abai" | "hapus" | null>(null);
  const [beriPeringatan, setBeriPeringatan] = useState(false);
  const [alasan, setAlasan] = useState("");
  const [galat, setGalat] = useState("");

  function tutupModal() {
    setMode(null);
    setBeriPeringatan(false);
    setAlasan("");
    setGalat("");
  }

  function abai() {
    tutupModal();
    router.replace(tutupHref, { scroll: false });
    tunda({ kunci, pesan: "Laporan diabaikan.", jalankan: () => abaikanLaporan(kunci), berikutnyaHref });
  }

  function hapus() {
    if (beriPeringatan) {
      const g = galatAlasan(alasan, "Alasan peringatan belum diisi.");
      if (g) {
        setGalat(g);
        toast.tampil(g);
        return;
      }
    }
    const opsi = { beriPeringatan, alasanPeringatan: alasan.trim() };
    tutupModal();
    router.replace(tutupHref, { scroll: false });
    tunda({
      kunci,
      pesan: opsi.beriPeringatan ? "Konten dihapus dan peringatan dicatat." : "Konten dihapus.",
      jalankan: () => hapusKonten(kunci, opsi),
      berikutnyaHref,
    });
  }

  return (
    <>
      <button className="btn btn-ghost" type="button" onClick={() => setMode("abai")}>
        Abaikan laporan
      </button>
      <button className="btn btn-danger" type="button" onClick={() => setMode("hapus")}>
        Hapus konten
      </button>

      {mode === "abai" ? (
        <ConfirmDialog
          judul="Abaikan laporan ini?"
          isi={
            <>
              Konten tetap tayang. Semua {jumlahPelapor} laporan atas konten ini ditandai <b>Diabaikan</b>.
            </>
          }
          labelOk="Ya, abaikan"
          onOk={abai}
          onTutup={tutupModal}
        />
      ) : null}

      {mode === "hapus" ? (
        <Modal
          judul="Hapus konten yang dilaporkan"
          onTutup={tutupModal}
          foot={
            <>
              <button className="btn btn-ghost" type="button" onClick={tutupModal}>
                Batal
              </button>
              <button className="btn btn-danger" type="button" onClick={hapus}>
                {beriPeringatan ? "Hapus konten & beri peringatan" : "Hapus konten"}
              </button>
            </>
          }
        >
          <ul className="effects">
            <li>Konten dihapus permanen dari {tempat}.</li>
            <li>
              Semua {jumlahPelapor} laporan atas konten ini ditandai <b>Ditindak</b>.
            </li>
            <li>Cuplikan konten tetap tersimpan di laporan sebagai arsip.</li>
          </ul>
          <label className="checkline" htmlFor="cb-warn">
            <input
              type="checkbox"
              id="cb-warn"
              checked={beriPeringatan}
              onChange={(e) => {
                setBeriPeringatan(e.target.checked);
                setGalat("");
              }}
            />
            <span>
              <span className="cell-strong">Beri peringatan ke {terlapor}</span>
              <br />
              <span className="cell-sub">Tercatat permanen di riwayat pengguna dan terhubung ke laporan ini.</span>
            </span>
          </label>
          {beriPeringatan ? (
            <div style={{ marginTop: 14 }}>
              <Field id="warn-alasan" label="Alasan peringatan" galat={galat}>
                <Textarea
                  id="warn-alasan"
                  value={alasan}
                  maxLength={BATAS_ALASAN}
                  galat={!!galat}
                  autoFocus
                  aria-describedby={idDeskripsi("warn-alasan", { galat: !!galat })}
                  placeholder="Contoh: promosi jualan di luar lapak resmi."
                  onChange={(e) => {
                    setAlasan(e.target.value);
                    if (galat) setGalat("");
                  }}
                />
              </Field>
            </div>
          ) : null}
        </Modal>
      ) : null}
    </>
  );
}
