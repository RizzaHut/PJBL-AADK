"use client";

import { useState, useTransition } from "react";
import { Field, Input, Select, Textarea, idDeskripsi } from "@/components/dashboard/ui/Field";
import { FilePicker, type ItemBerkas } from "@/components/dashboard/ui/FilePicker";
import { Crumbs, useKeluarForm } from "@/components/dashboard/ui/FormHalaman";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { Pilihan } from "@/components/dashboard/ui/Pilihan";
import { useToast } from "@/components/dashboard/ui/Toast";
import { useRouter } from "@/i18n/navigation";
import { simpanProduk } from "@/lib/actions/admin";
import { LABEL_KATEGORI, LABEL_KONDISI, LABEL_PRODUK } from "@/lib/labels";
import { ATURAN_GAMBAR, bacaHarga, galatHarga, galatNamaWajib } from "@/lib/validasi";
import type { KategoriProduk, KondisiProduk, ProdukToko } from "@/types/domain";

type Galat = Partial<Record<"judul" | "kategori" | "lokasi" | "harga" | "foto", string>>;

const KEMBALI = "/admin/produk";
const format = (v: string) => {
  const n = bacaHarga(v);
  return n ? n.toLocaleString("id-ID") : "";
};

/** Form produk toko (halaman penuh): tambah atau edit. Status diatur otomatis oleh transaksi. */
export function ProdukForm({ awal }: { awal?: ProdukToko }) {
  const router = useRouter();
  const toast = useToast();
  const edit = Boolean(awal);

  const [judul, setJudul] = useState(awal?.judul ?? "");
  const [deskripsi, setDeskripsi] = useState(awal?.deskripsi ?? "");
  const [kategori, setKategori] = useState<KategoriProduk>(awal?.kategori ?? "konsol");
  const [lokasi, setLokasi] = useState(awal?.lokasi ?? "");
  const [kondisi, setKondisi] = useState<KondisiProduk>(awal?.kondisi ?? "baru");
  const [harga, setHarga] = useState(awal ? format(String(awal.harga)) : "");
  const [foto, setFoto] = useState<ItemBerkas[]>((awal?.gambar ?? []).map((n) => ({ kunci: `lama-${n}`, nama: n })));
  const [galat, setGalat] = useState<Galat>({});
  const [kotor, setKotor] = useState(false);
  const [berjalan, mulai] = useTransition();
  const { keluar, dialog } = useKeluarForm(kotor, KEMBALI);

  const ubah = <T,>(set: (v: T) => void, kunci?: keyof Galat) => (v: T) => {
    set(v);
    setKotor(true);
    if (kunci) setGalat((g) => ({ ...g, [kunci]: "" }));
  };

  function simpan() {
    const g: Galat = {
      judul: galatNamaWajib(judul, "Judul produk wajib diisi."),
      lokasi: lokasi.trim() ? "" : "Lokasi wajib diisi.",
      harga: galatHarga(harga),
    };
    setGalat(g);
    if (Object.values(g).some(Boolean)) return;
    const data = new FormData();
    if (awal) data.set("id", awal.id);
    data.set("judul", judul);
    data.set("deskripsi", deskripsi);
    data.set("kategori", kategori);
    data.set("lokasi", lokasi);
    data.set("kondisi", kondisi);
    data.set("harga", harga);
    for (const it of foto) {
      if (it.berkas) data.append("foto", it.berkas);
      else data.append("foto_tetap", it.nama);
    }
    mulai(async () => {
      const h = await simpanProduk(null, data);
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
      <Crumbs awal="Kelola produk" sekarang={edit ? "Edit produk" : "Tambah produk"} onAwal={keluar} />
      <PageHeader judul={edit ? "Edit produk" : "Tambah produk"} sub="Barang yang dijual melalui toko AADK." />
      <form
        className="form"
        style={{ maxWidth: 760 }}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          simpan();
        }}
      >
        <Field id="pr-judul" label="Judul produk *" galat={galat.judul}>
          <Input
            id="pr-judul"
            maxLength={120}
            value={judul}
            placeholder="Contoh: Stik DualShock 4 v2"
            galat={!!galat.judul}
            aria-describedby={idDeskripsi("pr-judul", { galat: !!galat.judul })}
            onChange={(e) => ubah(setJudul, "judul")(e.target.value)}
          />
        </Field>
        <Field id="pr-desc" label="Deskripsi">
          <Textarea
            id="pr-desc"
            rows={4}
            maxLength={2000}
            value={deskripsi}
            placeholder="Jelaskan kondisi barang, kelengkapan, dan catatan penting."
            onChange={(e) => ubah(setDeskripsi)(e.target.value)}
          />
        </Field>
        <div className="grid grid-2" style={{ gap: 14 }}>
          <Field id="pr-kat" label="Kategori">
            <Select id="pr-kat" value={kategori} onChange={(e) => ubah(setKategori)(e.target.value as KategoriProduk)}>
              {(Object.keys(LABEL_KATEGORI) as KategoriProduk[]).map((k) => (
                <option key={k} value={k}>
                  {LABEL_KATEGORI[k]}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="pr-lok" label="Lokasi *" galat={galat.lokasi}>
            <Input
              id="pr-lok"
              maxLength={120}
              value={lokasi}
              placeholder="Contoh: Sidoarjo, Jawa Timur"
              galat={!!galat.lokasi}
              aria-describedby={idDeskripsi("pr-lok", { galat: !!galat.lokasi })}
              onChange={(e) => ubah(setLokasi, "lokasi")(e.target.value)}
            />
          </Field>
        </div>
        <div className="field">
          <label>Kondisi</label>
          <Pilihan
            label="Kondisi"
            nilai={kondisi}
            opsi={(Object.keys(LABEL_KONDISI) as KondisiProduk[]).map((k) => ({ nilai: k, label: LABEL_KONDISI[k] }))}
            onChange={ubah(setKondisi)}
          />
        </div>
        <Field id="pr-harga" label="Harga (Rp) *" hint="Isi angka saja, titik ditambahkan otomatis." galat={galat.harga}>
          <Input
            id="pr-harga"
            inputMode="numeric"
            value={harga}
            placeholder="Contoh: 250.000"
            galat={!!galat.harga}
            aria-describedby={idDeskripsi("pr-harga", { hint: true, galat: !!galat.harga })}
            onChange={(e) => ubah(setHarga, "harga")(format(e.target.value))}
          />
        </Field>
        {awal ? (
          <div className="field">
            <label>Status</label>
            <div className="cell-sub">
              {LABEL_PRODUK[awal.status].teks}. Status diatur otomatis oleh transaksi
              {awal.status === "available" ? "; produk tanpa transaksi bisa dihapus kapan saja." : "."}
            </div>
          </div>
        ) : null}
        <div className="field">
          <label htmlFor="pr-foto">Foto produk</label>
          <FilePicker
            id="pr-foto"
            label="Klik untuk mengunggah beberapa foto"
            hint="JPG, PNG, atau WebP. Maksimal 5 MB per foto, 5 foto."
            accept="image/jpeg,image/png,image/webp"
            aturan={ATURAN_GAMBAR}
            maks={5}
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
            {berjalan ? "Menyimpan…" : edit ? "Simpan perubahan" : "Tambah produk"}
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
