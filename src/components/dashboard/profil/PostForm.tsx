"use client";

import { useState, useTransition } from "react";
import { Crumbs, useKeluarForm } from "@/components/dashboard/ui/FormHalaman";
import { Field, Input, Select, Textarea, idDeskripsi } from "@/components/dashboard/ui/Field";
import { FilePicker, type ItemBerkas } from "@/components/dashboard/ui/FilePicker";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { useToast } from "@/components/dashboard/ui/Toast";
import { useRouter } from "@/i18n/navigation";
import { simpanPost } from "@/lib/actions/profil";
import { TOPIK_FORUM } from "@/lib/konstanta";
import { ATURAN_GAMBAR, galatIsiPost, galatJudul } from "@/lib/validasi";

interface Props {
  awal?: { id: string; judul: string; topik: string; isi: string; gambar: string[] };
}

type Galat = Partial<Record<"judul" | "topik" | "isi" | "gambar", string>>;

const KEMBALI = "/profil/post";

/** Form post forum (halaman penuh): buat atau edit. */
export function PostForm({ awal }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [judul, setJudul] = useState(awal?.judul ?? "");
  const [topik, setTopik] = useState(awal?.topik ?? "");
  const [isi, setIsi] = useState(awal?.isi ?? "");
  const [gambar, setGambar] = useState<ItemBerkas[]>((awal?.gambar ?? []).map((n) => ({ kunci: `lama-${n}`, nama: n })));
  const [galat, setGalat] = useState<Galat>({});
  const [kotor, setKotor] = useState(false);
  const [berjalan, mulai] = useTransition();
  const { keluar, dialog } = useKeluarForm(kotor, KEMBALI);
  const edit = Boolean(awal);

  const ubah = <T,>(set: (v: T) => void, kunci?: keyof Galat) => (v: T) => {
    set(v);
    setKotor(true);
    if (kunci) setGalat((g) => ({ ...g, [kunci]: "" }));
  };

  function simpan() {
    const g: Galat = {
      judul: galatJudul(judul),
      topik: topik ? "" : "Pilih satu topik.",
      isi: galatIsiPost(isi),
    };
    setGalat(g);
    if (g.judul || g.topik || g.isi) return;

    const data = new FormData();
    if (awal) data.set("id", awal.id);
    data.set("judul", judul);
    data.set("topik", topik);
    data.set("isi", isi);
    for (const it of gambar) {
      if (it.berkas) data.append("gambar", it.berkas);
      else data.append("gambar_tetap", it.nama);
    }
    mulai(async () => {
      const h = await simpanPost(null, data);
      if (h.ok) {
        setKotor(false);
        toast.tampil(h.pesan ?? "Tersimpan.");
        router.push(KEMBALI);
        router.refresh();
      } else {
        setGalat(h.kolom ?? {});
        toast.tampil(h.pesan);
      }
    });
  }

  return (
    <>
      <Crumbs awal="Post forum" sekarang={edit ? "Edit post" : "Buat post"} onAwal={keluar} />
      <PageHeader
        judul={edit ? "Edit post" : "Buat post"}
        sub={
          edit
            ? "Perbarui isi post. Komentar dan suka tetap tersimpan."
            : "Tulis topik diskusi seputar konsol."
        }
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
        <Field id="pf-judul" label="Judul" galat={galat.judul}>
          <Input
            id="pf-judul"
            maxLength={120}
            value={judul}
            placeholder="Contoh: Joy-Con drift setelah update"
            galat={!!galat.judul}
            aria-describedby={idDeskripsi("pf-judul", { galat: !!galat.judul })}
            onChange={(e) => ubah(setJudul, "judul")(e.target.value)}
          />
        </Field>
        <Field id="pf-topik" label="Topik" galat={galat.topik}>
          <Select
            id="pf-topik"
            value={topik}
            galat={!!galat.topik}
            aria-describedby={idDeskripsi("pf-topik", { galat: !!galat.topik })}
            onChange={(e) => ubah(setTopik, "topik")(e.target.value)}
          >
            <option value="">Pilih topik…</option>
            {TOPIK_FORUM.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="pf-isi" label="Isi post" galat={galat.isi}>
          <Textarea
            id="pf-isi"
            rows={8}
            maxLength={5000}
            value={isi}
            placeholder="Jelaskan masalah atau topikmu selengkap mungkin."
            galat={!!galat.isi}
            aria-describedby={idDeskripsi("pf-isi", { galat: !!galat.isi })}
            onChange={(e) => ubah(setIsi, "isi")(e.target.value)}
          />
        </Field>
        <div className="field">
          <label htmlFor="pf-img">
            Gambar <span className="mute">(opsional, maksimal 3)</span>
          </label>
          <FilePicker
            id="pf-img"
            label="Klik untuk memilih gambar"
            hint="JPG, PNG, atau WebP. Maksimal 5 MB per gambar."
            accept="image/jpeg,image/png,image/webp"
            aturan={ATURAN_GAMBAR}
            maks={3}
            item={gambar}
            galat={galat.gambar}
            onChange={ubah(setGambar, "gambar")}
          />
        </div>
        <div className="row-flex form-bar">
          <button className="btn btn-primary" type="submit" disabled={berjalan}>
            {berjalan ? "Menyimpan…" : edit ? "Simpan perubahan" : "Terbitkan post"}
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
