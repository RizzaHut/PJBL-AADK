"use client";

import { useState, useTransition } from "react";
import { Field, Input, Select, Textarea, idDeskripsi } from "@/components/dashboard/ui/Field";
import { FilePicker, type ItemBerkas } from "@/components/dashboard/ui/FilePicker";
import { CrumbsJalur, useKeluarForm } from "@/components/dashboard/ui/FormHalaman";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { useToast } from "@/components/dashboard/ui/Toast";
import { useRouter } from "@/i18n/navigation";
import { simpanKonsol } from "@/lib/actions/admin";
import { LABEL_MEREK, LABEL_TIPE } from "@/lib/labels";
import { ATURAN_FOTO_KARTU, galatNamaWajib, galatTahunRilis } from "@/lib/validasi";
import type { Konsol, Merek, TipeKonsol } from "@/types/domain";

type Galat = Partial<Record<"merek" | "tipe" | "nama" | "tahun" | "deskripsi" | "foto", string>>;

/** Form konsol (halaman penuh): tambah atau edit. Batal kembali ke detail (edit) atau daftar (tambah). */
export function KonsolForm({ awal }: { awal?: Konsol }) {
  const router = useRouter();
  const toast = useToast();
  const edit = Boolean(awal);
  const kembali = awal ? `/admin/konsol/${awal.id}` : "/admin/konsol";

  const [merek, setMerek] = useState<Merek | "">(awal?.merek ?? "");
  const [tipe, setTipe] = useState<TipeKonsol | "">(awal?.tipe ?? "");
  const [nama, setNama] = useState(awal?.nama ?? "");
  const [deskripsi, setDeskripsi] = useState(awal?.deskripsi ?? "");
  const [tahun, setTahun] = useState(awal ? String(awal.tahun_rilis) : "");
  const [foto, setFoto] = useState<ItemBerkas[]>([]);
  const [galat, setGalat] = useState<Galat>({});
  const [kotor, setKotor] = useState(false);
  const [berjalan, mulai] = useTransition();
  const { keluar, keluarKe, dialog } = useKeluarForm(kotor, kembali);

  const ubah = <T,>(set: (v: T) => void, kunci?: keyof Galat) => (v: T) => {
    set(v);
    setKotor(true);
    if (kunci) setGalat((g) => ({ ...g, [kunci]: "" }));
  };

  function simpan() {
    const g: Galat = {
      merek: merek ? "" : "Pilih merek.",
      tipe: tipe ? "" : "Pilih tipe.",
      nama: galatNamaWajib(nama, "Nama konsol wajib diisi."),
      tahun: galatTahunRilis(tahun),
    };
    setGalat(g);
    if (Object.values(g).some(Boolean)) return;
    const data = new FormData();
    if (awal) data.set("id", awal.id);
    data.set("merek", merek);
    data.set("tipe", tipe);
    data.set("nama", nama);
    data.set("deskripsi", deskripsi);
    data.set("tahun", tahun);
    if (foto[0]?.berkas) data.set("foto", foto[0].berkas);
    mulai(async () => {
      const h = await simpanKonsol(null, data);
      if (h.ok) {
        setKotor(false);
        toast.tampil(h.pesan ?? "Tersimpan.");
        router.push(awal ? kembali : `/admin/konsol/${h.data?.id ?? ""}`);
        router.refresh();
      } else {
        setGalat(h.kolom ?? {});
        toast.tampil(h.pesan);
      }
    });
  }

  return (
    <>
      <CrumbsJalur
        item={[
          { label: "Kelola konsol", onKlik: () => keluarKe("/admin/konsol") },
          ...(awal ? [{ label: awal.nama, onKlik: keluar }] : []),
          { label: edit ? "Edit konsol" : "Tambah konsol" },
        ]}
      />
      <PageHeader
        judul={edit ? "Edit konsol" : "Tambah konsol"}
        sub="Kolom bertanda * wajib diisi. Data ini tampil di kartu konsol pada katalog."
      />
      <form
        className="form"
        style={{ maxWidth: 760 }}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          simpan();
        }}
      >
        <div className="grid grid-2" style={{ gap: 14 }}>
          <Field id="k-merek" label="Merek *" galat={galat.merek}>
            <Select
              id="k-merek"
              value={merek}
              galat={!!galat.merek}
              aria-describedby={idDeskripsi("k-merek", { galat: !!galat.merek })}
              onChange={(e) => ubah(setMerek, "merek")(e.target.value as Merek)}
            >
              <option value="">Pilih merek…</option>
              {(Object.keys(LABEL_MEREK) as Merek[]).map((m) => (
                <option key={m} value={m}>
                  {LABEL_MEREK[m]}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="k-tipe" label="Tipe *" galat={galat.tipe}>
            <Select
              id="k-tipe"
              value={tipe}
              galat={!!galat.tipe}
              aria-describedby={idDeskripsi("k-tipe", { galat: !!galat.tipe })}
              onChange={(e) => ubah(setTipe, "tipe")(e.target.value as TipeKonsol)}
            >
              <option value="">Pilih tipe…</option>
              {(Object.keys(LABEL_TIPE) as TipeKonsol[]).map((t) => (
                <option key={t} value={t}>
                  {LABEL_TIPE[t]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field id="k-nama" label="Nama konsol *" galat={galat.nama}>
          <Input
            id="k-nama"
            maxLength={120}
            value={nama}
            placeholder="Contoh: PlayStation 5"
            galat={!!galat.nama}
            aria-describedby={idDeskripsi("k-nama", { galat: !!galat.nama })}
            onChange={(e) => ubah(setNama, "nama")(e.target.value)}
          />
        </Field>
        <Field id="k-desc" label="Deskripsi" galat={galat.deskripsi}>
          <Textarea
            id="k-desc"
            rows={4}
            maxLength={1000}
            value={deskripsi}
            placeholder="Ringkasan singkat yang tampil di halaman konsol."
            galat={!!galat.deskripsi}
            onChange={(e) => ubah(setDeskripsi, "deskripsi")(e.target.value)}
          />
        </Field>
        <Field id="k-tahun" label="Tahun rilis *" hint="Antara 1970 dan 2100." galat={galat.tahun}>
          <Input
            id="k-tahun"
            inputMode="numeric"
            maxLength={4}
            value={tahun}
            placeholder="Contoh: 2020"
            galat={!!galat.tahun}
            aria-describedby={idDeskripsi("k-tahun", { hint: true, galat: !!galat.tahun })}
            onChange={(e) => ubah(setTahun, "tahun")(e.target.value.replace(/\D/g, ""))}
          />
        </Field>
        <div className="field">
          <label htmlFor="k-foto">Foto kartu</label>
          <FilePicker
            id="k-foto"
            label="Klik untuk mengunggah"
            hint="JPG, PNG, atau WebP. Maksimal 2 MB."
            accept="image/jpeg,image/png,image/webp"
            aturan={ATURAN_FOTO_KARTU}
            maks={1}
            item={foto}
            galat={galat.foto}
            onChange={(n) => {
              setFoto(n);
              setKotor(true);
            }}
          />
        </div>
        <div className="row-flex form-bar">
          <button className="btn btn-primary" type="submit" disabled={berjalan}>
            {berjalan ? "Menyimpan…" : edit ? "Simpan perubahan" : "Tambah konsol"}
          </button>
          <button className="btn btn-ghost" type="button" onClick={keluar}>
            Batal
          </button>
        </div>
      </form>
      {dialog}
    </>
  );
}
