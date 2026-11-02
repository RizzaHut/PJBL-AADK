"use client";

import { useState, useTransition } from "react";
import { Field, Input, idDeskripsi } from "@/components/dashboard/ui/Field";
import { FilePicker, type ItemBerkas } from "@/components/dashboard/ui/FilePicker";
import { useToast } from "@/components/dashboard/ui/Toast";
import { useRouter } from "@/i18n/navigation";
import { simpanPengaturan } from "@/lib/actions/admin";
import { ATURAN_GAMBAR, galatWhatsapp } from "@/lib/validasi";

type Galat = Partial<Record<"whatsapp" | "qris", string>>;

/** Pengaturan toko: satu nomor WhatsApp dan satu QRIS untuk semua pembeli. */
export function PengaturanForm({ whatsapp, namaQris }: { whatsapp: string; namaQris: string | null }) {
  const router = useRouter();
  const toast = useToast();
  const [wa, setWa] = useState(whatsapp);
  const [qris, setQris] = useState<ItemBerkas[]>([]);
  const [galat, setGalat] = useState<Galat>({});
  const [berjalan, mulai] = useTransition();
  const adaQris = qris[0]?.nama ?? namaQris;

  function simpan() {
    const g: Galat = { whatsapp: galatWhatsapp(wa) };
    setGalat(g);
    if (g.whatsapp) return;
    const data = new FormData();
    data.set("whatsapp", wa);
    if (qris[0]?.berkas) data.set("qris", qris[0].berkas);
    mulai(async () => {
      const h = await simpanPengaturan(null, data);
      if (h.ok) {
        setQris([]);
        toast.tampil(h.pesan ?? "Pengaturan toko disimpan.");
        router.refresh();
      } else {
        setGalat(h.kolom ?? {});
        toast.tampil(h.pesan);
      }
    });
  }

  return (
    <div className="set-grid">
      <form
        className="form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          simpan();
        }}
      >
        <Field id="st-wa" label="Nomor WhatsApp" galat={galat.whatsapp}>
          <Input
            id="st-wa"
            inputMode="tel"
            maxLength={20}
            value={wa}
            placeholder="0812xxxxxxxx"
            galat={!!galat.whatsapp}
            aria-describedby={idDeskripsi("st-wa", { galat: !!galat.whatsapp })}
            onChange={(e) => {
              setWa(e.target.value);
              setGalat((g) => ({ ...g, whatsapp: "" }));
            }}
          />
        </Field>
        <div className="field">
          <label htmlFor="st-qris">Foto QRIS</label>
          <FilePicker
            id="st-qris"
            label="Klik untuk mengunggah atau mengganti QRIS"
            hint="JPG, PNG, atau WebP. Maksimal 5 MB."
            accept="image/jpeg,image/png,image/webp"
            aturan={ATURAN_GAMBAR}
            maks={1}
            item={qris}
            galat={galat.qris}
            onChange={setQris}
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={berjalan}>
          {berjalan ? "Menyimpan…" : "Simpan pengaturan"}
        </button>
      </form>
      <aside className="qris-prev" aria-label="Pratinjau tampilan pembeli">
        <div className="qris-box">
          <b>{adaQris ?? "Belum ada QRIS"}</b>
        </div>
        <p className="hint">
          Pratinjau: begini pembeli melihat QRIS di halaman pembayaran. Nomor WhatsApp tampil di halaman detail produk.
        </p>
      </aside>
    </div>
  );
}
