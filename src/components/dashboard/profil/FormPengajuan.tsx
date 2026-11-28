"use client";

import { useState, useTransition } from "react";
import { FilePicker, type ItemBerkas } from "@/components/dashboard/ui/FilePicker";
import { Pilihan } from "@/components/dashboard/ui/Pilihan";
import { useToast } from "@/components/dashboard/ui/Toast";
import { useRouter } from "@/i18n/navigation";
import { ajukanTeknisi } from "@/lib/actions/profil";
import { ATURAN_GAMBAR, ATURAN_VIDEO } from "@/lib/validasi";

type Tipe = "video" | "foto";

/** Form pengajuan teknisi: jenis bukti, unggah berkas, pernyataan. */
export function FormPengajuan({ alasanSebelumnya }: { alasanSebelumnya: string | null }) {
  const router = useRouter();
  const toast = useToast();
  const [tipe, setTipe] = useState<Tipe>("video");
  const [item, setItem] = useState<ItemBerkas[]>([]);
  const [setuju, setSetuju] = useState(false);
  const [galat, setGalat] = useState<{
    berkas?: string;
    pernyataan?: string;
    umum?: string;
  }>({});
  const [berjalan, mulai] = useTransition();
  const video = tipe === "video";

  function kirim() {
    const file = item[0]?.berkas;
    const g = {
      berkas: file
        ? ""
        : `Pilih ${video ? "video" : "foto"} sebagai bukti.`,
      pernyataan: setuju ? "" : "Centang pernyataan ini untuk melanjutkan.",
    };
    setGalat(g);
    if (g.berkas || g.pernyataan) return;
    if (!file) return;
    const data = new FormData();
    data.set("jenis", tipe);
    data.set("berkas", file);
    data.set("pernyataan", "on");
    mulai(async () => {
      try {
        const h = await ajukanTeknisi(null, data);
        if (h.ok) {
          toast.tampil(h.pesan ?? "Pengajuan terkirim.");
          router.refresh();
        } else {
          setGalat(h.kolom ?? {});
          toast.tampil(h.pesan);
        }
      } catch (error) {
        console.error("Pengajuan teknisi gagal dikirim:", error);
        const pesan = "Pengajuan gagal diproses. Periksa koneksi lalu coba lagi.";
        setGalat({ umum: pesan });
        toast.tampil(pesan);
      }
    });
  }

  return (
    <form
      className="sec-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        kirim();
      }}
    >
      {alasanSebelumnya ? (
        <div className="note warn" style={{ marginBottom: 14 }}>
          <b>Pengajuan sebelumnya ditolak.</b> {alasanSebelumnya}
        </div>
      ) : null}
      {galat.umum ? (
        <p className="fld-err" role="alert">
          {galat.umum}
        </p>
      ) : null}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="intro-card" style={{ border: 0 }}>
          <h2>Syarat pengajuan</h2>
          <ol className="step-list" style={{ marginTop: 8 }}>
            <li>Tunjukkan proses perbaikan konsol yang kamu kerjakan sendiri.</li>
            <li>Video terlihat jelas, atau foto menampilkan sebelum dan sesudah perbaikan.</li>
            <li>Tanpa watermark milik orang lain.</li>
          </ol>
        </div>
      </div>
      <div className="form">
        <div className="field">
          <label>Jenis bukti</label>
          <Pilihan
            label="Jenis bukti"
            nilai={tipe}
            opsi={[
              { nilai: "video", label: "Video" },
              { nilai: "foto", label: "Foto" },
            ]}
            onChange={(v) => {
              setTipe(v);
              setItem([]);
              setGalat({});
            }}
          />
        </div>
        <div className="field">
          <label>Unggah bukti</label>
          <FilePicker
            id="tk-file"
            label={video ? "Klik untuk memilih video" : "Klik untuk memilih foto"}
            hint={video ? "MP4, WebM, atau MOV. Maksimal 50 MB." : "JPG, PNG, atau WebP. Maksimal 5 MB."}
            accept={video ? "video/mp4,video/webm,video/quicktime" : "image/jpeg,image/png,image/webp"}
            aturan={video ? ATURAN_VIDEO : ATURAN_GAMBAR}
            maks={1}
            pratinjau={!video}
            item={item}
            galat={galat.berkas}
            onChange={(n) => {
              setItem(n);
              setGalat((g) => ({ ...g, berkas: "", umum: "" }));
            }}
          />
        </div>
        <div className="field">
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontWeight: 400 }}>
            <input
              type="checkbox"
              checked={setuju}
              style={{ marginTop: 3 }}
              onChange={(e) => {
                setSetuju(e.target.checked);
                setGalat((g) => ({ ...g, pernyataan: "" }));
              }}
            />
            <span>Saya menyatakan bukti ini hasil kerja saya sendiri.</span>
          </label>
          {galat.pernyataan ? (
            <div className="err" role="alert">
              {galat.pernyataan}
            </div>
          ) : null}
        </div>
        <div className="row-flex form-bar">
          <button className="btn btn-primary" type="submit" disabled={berjalan}>
            {berjalan ? "Mengirim…" : "Kirim pengajuan"}
          </button>
        </div>
      </div>
    </form>
  );
}
