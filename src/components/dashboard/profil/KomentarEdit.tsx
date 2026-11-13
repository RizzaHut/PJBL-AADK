"use client";

import { useState, useTransition } from "react";
import { Drawer } from "@/components/dashboard/ui/Drawer";
import { Field, Textarea, idDeskripsi } from "@/components/dashboard/ui/Field";
import { useToast } from "@/components/dashboard/ui/Toast";
import { useRouter } from "@/i18n/navigation";
import { perbaruiKomentar } from "@/lib/actions/profil";

interface Props {
  id: string;
  jenisLabel: string;
  terkait: string;
  isiAwal: string;
  tutupHref: string;
}

/** Drawer edit komentar. Simpan memanggil Server Action, lalu menutup drawer. */
export function KomentarEdit({ id, jenisLabel, terkait, isiAwal, tutupHref }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [isi, setIsi] = useState(isiAwal);
  const [galat, setGalat] = useState("");
  const [berjalan, mulai] = useTransition();

  function simpan() {
    if (!isi.trim()) {
      setGalat("Komentar tidak boleh kosong.");
      return;
    }
    mulai(async () => {
      const h = await perbaruiKomentar(id, isi);
      if (h.ok) {
        toast.tampil(h.pesan ?? "Komentar diperbarui.");
        router.replace(tutupHref, { scroll: false });
        router.refresh();
      } else {
        setGalat(h.kolom?.isi ?? h.pesan);
      }
    });
  }

  return (
    <Drawer
      judul="Edit komentar"
      tutupHref={tutupHref}
      foot={
        <>
          <button className="btn btn-ghost" type="button" onClick={() => router.replace(tutupHref, { scroll: false })}>
            Batal
          </button>
          <button className="btn btn-primary" type="button" onClick={simpan} disabled={berjalan}>
            {berjalan ? "Menyimpan…" : "Simpan"}
          </button>
        </>
      }
    >
      <div className="dsec">Komentar di</div>
      <div className="card card-pad">
        <div className="cell-sub">{jenisLabel}</div>
        <div className="cell-strong">{terkait}</div>
      </div>
      <div className="dsec">Isi komentar</div>
      <Field id="k-isi" label="Isi komentar" galat={galat}>
        <Textarea
          id="k-isi"
          rows={6}
          maxLength={1000}
          value={isi}
          galat={!!galat}
          aria-describedby={idDeskripsi("k-isi", { galat: !!galat })}
          onChange={(e) => {
            setIsi(e.target.value);
            setGalat("");
          }}
        />
      </Field>
    </Drawer>
  );
}
