"use client";

import { useState, useTransition } from "react";
import { ChipInput } from "@/components/dashboard/ui/ChipInput";
import { Field, Input } from "@/components/dashboard/ui/Field";
import { idDeskripsi } from "@/components/dashboard/ui/Field";
import { FilePicker, type ItemBerkas } from "@/components/dashboard/ui/FilePicker";
import { CrumbsJalur, useKeluarForm } from "@/components/dashboard/ui/FormHalaman";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { useToast } from "@/components/dashboard/ui/Toast";
import { useRouter } from "@/i18n/navigation";
import { simpanModel } from "@/lib/actions/admin";
import { ATURAN_FOTO_KARTU, galatNamaWajib, galatTahunRilis } from "@/lib/validasi";
import type { ModelKonsol } from "@/types/domain";

type Galat = Partial<Record<"nama" | "tahun" | "kode" | "banner", string>>;

interface Props {
  konsol: { id: string; nama: string };
  awal?: ModelKonsol;
}

/** Form model konsol (halaman penuh): tambah atau edit. */
export function ModelForm({ konsol, awal }: Props) {
  const router = useRouter();
  const toast = useToast();
  const edit = Boolean(awal);
  const kembali = awal ? `/admin/konsol/${konsol.id}/model/${awal.id}` : `/admin/konsol/${konsol.id}`;

  const [nama, setNama] = useState(awal?.nama ?? "");
  const [kode, setKode] = useState(awal?.kode ?? "");
  const [tahun, setTahun] = useState(awal ? String(awal.tahun_rilis) : "");
  const [warna, setWarna] = useState<string[]>(awal?.warna ?? []);
  const [konek, setKonek] = useState<string[]>(awal?.konektivitas ?? []);
  const [performa, setPerforma] = useState(awal?.performa ?? "");
  const [media, setMedia] = useState(awal?.media_penyimpanan ?? "");
  const [banner, setBanner] = useState<ItemBerkas[]>([]);
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
      nama: galatNamaWajib(nama, "Nama model wajib diisi."),
      tahun: galatTahunRilis(tahun),
    };
    setGalat(g);
    if (Object.values(g).some(Boolean)) return;
    const data = new FormData();
    if (awal) data.set("id", awal.id);
    data.set("konsol_id", konsol.id);
    data.set("nama", nama);
    data.set("kode", kode);
    data.set("tahun", tahun);
    data.set("performa", performa);
    data.set("media", media);
    warna.forEach((w) => data.append("warna", w));
    konek.forEach((k) => data.append("konektivitas", k));
    if (banner[0]?.berkas) data.set("banner", banner[0].berkas);
    mulai(async () => {
      const h = await simpanModel(null, data);
      if (h.ok) {
        setKotor(false);
        toast.tampil(h.pesan ?? "Tersimpan.");
        router.push(awal ? kembali : `/admin/konsol/${konsol.id}`);
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
          { label: konsol.nama, onKlik: () => keluarKe(`/admin/konsol/${konsol.id}`) },
          ...(awal ? [{ label: awal.nama, onKlik: keluar }] : []),
          { label: edit ? "Edit model" : "Tambah model" },
        ]}
      />
      <PageHeader judul={edit ? "Edit model" : "Tambah model"} sub={`Model dari ${konsol.nama}. Kolom bertanda * wajib diisi.`} />
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
          <Field id="m-nama" label="Nama model *" galat={galat.nama}>
            <Input
              id="m-nama"
              maxLength={120}
              value={nama}
              placeholder={`Contoh: ${konsol.nama} Slim`}
              galat={!!galat.nama}
              aria-describedby={idDeskripsi("m-nama", { galat: !!galat.nama })}
              onChange={(e) => ubah(setNama, "nama")(e.target.value)}
            />
          </Field>
          <Field id="m-kode" label="Kode model" galat={galat.kode}>
            <Input
              id="m-kode"
              maxLength={40}
              value={kode}
              placeholder="Contoh: CUH-2006A"
              galat={!!galat.kode}
              onChange={(e) => ubah(setKode, "kode")(e.target.value)}
            />
          </Field>
        </div>
        <Field id="m-tahun" label="Tahun rilis *" galat={galat.tahun}>
          <Input
            id="m-tahun"
            inputMode="numeric"
            maxLength={4}
            value={tahun}
            placeholder="Contoh: 2016"
            galat={!!galat.tahun}
            aria-describedby={idDeskripsi("m-tahun", { galat: !!galat.tahun })}
            onChange={(e) => ubah(setTahun, "tahun")(e.target.value.replace(/\D/g, ""))}
          />
        </Field>
        <div className="field">
          <label htmlFor="m-banner">Foto banner</label>
          <FilePicker
            id="m-banner"
            label="Klik untuk mengunggah"
            hint="JPG, PNG, atau WebP. Maksimal 2 MB."
            accept="image/jpeg,image/png,image/webp"
            aturan={ATURAN_FOTO_KARTU}
            maks={1}
            item={banner}
            galat={galat.banner}
            onChange={(n) => {
              setBanner(n);
              setKotor(true);
            }}
          />
        </div>
        <ChipInput id="m-warna" label="Opsi warna" placeholder="Contoh: Jet Black" nilai={warna} onChange={ubah(setWarna)} />
        <ChipInput id="m-konek" label="Konektivitas" placeholder="Contoh: HDMI 2.0" nilai={konek} onChange={ubah(setKonek)} />
        <div className="grid grid-2" style={{ gap: 14 }}>
          <Field id="m-perf" label="Performa">
            <Input id="m-perf" maxLength={120} value={performa} placeholder="Contoh: AMD Jaguar 8 core" onChange={(e) => ubah(setPerforma)(e.target.value)} />
          </Field>
          <Field id="m-media" label="Media penyimpanan">
            <Input id="m-media" maxLength={120} value={media} placeholder="Contoh: HDD 500 GB" onChange={(e) => ubah(setMedia)(e.target.value)} />
          </Field>
        </div>
        <div className="row-flex form-bar">
          <button className="btn btn-primary" type="submit" disabled={berjalan}>
            {berjalan ? "Menyimpan…" : edit ? "Simpan perubahan" : "Tambah model"}
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
