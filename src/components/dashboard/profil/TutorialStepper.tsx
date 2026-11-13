"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/dashboard/ui/Badge";
import { ChipInput } from "@/components/dashboard/ui/ChipInput";
import { Field, Input, Select, Textarea, idDeskripsi } from "@/components/dashboard/ui/Field";
import { FilePicker, type ItemBerkas } from "@/components/dashboard/ui/FilePicker";
import { Crumbs, useKeluarForm } from "@/components/dashboard/ui/FormHalaman";
import { Icon } from "@/components/dashboard/ui/Icon";
import { KV } from "@/components/dashboard/ui/KV";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { Pilihan } from "@/components/dashboard/ui/Pilihan";
import { Stepper } from "@/components/dashboard/ui/Stepper";
import { useToast } from "@/components/dashboard/ui/Toast";
import { useRouter } from "@/i18n/navigation";
import { simpanTutorial } from "@/lib/actions/profil";
import { LABEL_WAKTU } from "@/lib/konstanta";
import { LABEL_KESULITAN, NADA_KESULITAN } from "@/lib/labels";
import { ATURAN_FOTO_LANGKAH, galatJudul } from "@/lib/validasi";
import type { TingkatKesulitan, TutorialSaya, WaktuPengerjaan } from "@/types/domain";

const LANGKAH_FORM = ["Info dasar", "Peringatan", "Langkah-langkah", "Tinjau"];
const KEMBALI = "/profil/tutorial";
const TINGKAT = Object.keys(LABEL_KESULITAN) as TingkatKesulitan[];

interface ItemLangkah {
  kunci: number;
  teks: string;
  foto: ItemBerkas[];
}

type Galat = Partial<Record<"judul" | "konsol" | "tingkat" | "waktu" | "alat", string>>;

let urut = 0;
const langkahKosong = (): ItemLangkah => ({ kunci: ++urut, teks: "", foto: [] });

function dariTutorial(t: TutorialSaya): ItemLangkah[] {
  return t.langkah.map((l) => ({
    kunci: ++urut,
    teks: l.teks,
    foto: l.foto ? [{ kunci: `lama-${urut}`, nama: l.foto.split("/").at(-1) ?? l.foto, url: l.foto }] : [],
  }));
}

/** Form tutorial bertahap (halaman penuh): info dasar, peringatan, langkah, tinjau. Khusus Teknisi. */
export function TutorialStepper({ awal, konsolPilihan }: { awal?: TutorialSaya; konsolPilihan: string[] }) {
  const router = useRouter();
  const toast = useToast();
  const edit = Boolean(awal);

  const [langkah, setLangkah] = useState(0);
  const [maks, setMaks] = useState(edit ? 3 : 0);
  const [judul, setJudul] = useState(awal?.judul ?? "");
  const [konsol, setKonsol] = useState(awal?.konsol ?? "");
  const [tingkat, setTingkat] = useState<TingkatKesulitan | "">(awal?.tingkat ?? "");
  const [waktu, setWaktu] = useState<WaktuPengerjaan | "">(awal?.waktu ?? "");
  const [alat, setAlat] = useState<string[]>(awal?.alat ?? []);
  const [peringatan, setPeringatan] = useState(awal?.peringatan ?? "");
  const [isiLangkah, setIsiLangkah] = useState<ItemLangkah[]>(() => (awal ? dariTutorial(awal) : [langkahKosong()]));
  const [galat, setGalat] = useState<Galat>({});
  const [galatLangkah, setGalatLangkah] = useState<Record<number, string>>({});
  const [kotor, setKotor] = useState(false);
  const [berjalan, mulai] = useTransition();
  const { keluar, dialog } = useKeluarForm(kotor, KEMBALI);

  const ubah = <T,>(set: (v: T) => void, kunci?: keyof Galat) => (v: T) => {
    set(v);
    setKotor(true);
    if (kunci) setGalat((g) => ({ ...g, [kunci]: "" }));
  };

  function periksaInfo(): boolean {
    const g: Galat = {
      judul: galatJudul(judul),
      konsol: konsol ? "" : "Pilih konsol yang dibahas.",
      tingkat: tingkat ? "" : "Pilih tingkat kesulitan.",
      waktu: waktu ? "" : "Pilih estimasi waktu.",
      alat: alat.length ? "" : "Tambahkan minimal satu alat atau bahan.",
    };
    setGalat(g);
    return !Object.values(g).some(Boolean);
  }

  function periksaLangkah(): boolean {
    const g: Record<number, string> = {};
    for (const l of isiLangkah) if (!l.teks.trim()) g[l.kunci] = "Isi langkah tidak boleh kosong.";
    setGalatLangkah(g);
    return Object.keys(g).length === 0;
  }

  const periksa = (n: number) => (n === 0 ? periksaInfo() : n === 2 ? periksaLangkah() : true);

  function pindah(n: number) {
    if (n > langkah && !periksa(langkah)) return;
    setLangkah(n);
    window.scrollTo(0, 0);
  }

  function lanjut() {
    if (!periksa(langkah)) return;
    setMaks((m) => Math.max(m, langkah + 1));
    setLangkah(langkah + 1);
    window.scrollTo(0, 0);
  }

  function terbitkan() {
    if (!periksaInfo()) return pindah0(0);
    if (!periksaLangkah()) return pindah0(2);
    const data = new FormData();
    data.set("judul", judul);
    data.set("konsol", konsol);
    data.set("tingkat", tingkat);
    data.set("waktu", waktu);
    data.set("peringatan", peringatan);
    for (const item of alat) data.append("alat", item);
    data.set(
      "langkah",
      JSON.stringify(
        isiLangkah.map((item, index) => {
          const foto = item.foto[0];
          if (foto?.berkas) data.set(`langkah_foto_${index}`, foto.berkas);
          return {
            teks: item.teks,
            foto_tetap: foto && !foto.berkas ? foto.url ?? "" : "",
          };
        }),
      ),
    );
    mulai(async () => {
      const h = await simpanTutorial(awal?.id ?? null, data);
      if (h.ok) {
        setKotor(false);
        toast.tampil(h.pesan ?? "Tersimpan.");
        router.push(KEMBALI);
        router.refresh();
      } else {
        const k = h.kolom ?? {};
        setGalat({ judul: k.judul, konsol: k.konsol, tingkat: k.tingkat, waktu: k.waktu, alat: k.alat });
        toast.tampil(h.pesan);
        if (k.langkah) setLangkah(2);
        else setLangkah(0);
      }
    });
  }

  function pindah0(n: number) {
    setLangkah(n);
    window.scrollTo(0, 0);
  }

  const ubahLangkah = (kunci: number, f: (l: ItemLangkah) => ItemLangkah) => {
    setIsiLangkah((daftar) => daftar.map((l) => (l.kunci === kunci ? f(l) : l)));
    setKotor(true);
  };

  function geser(i: number, j: number) {
    setIsiLangkah((d) => {
      const n = d.slice();
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
    setKotor(true);
  }

  const terakhir = langkah === 3;

  return (
    <>
      <Crumbs awal="Tutorial saya" sekarang={edit ? "Edit tutorial" : "Tulis tutorial baru"} onAwal={keluar} />
      <PageHeader
        judul={edit ? "Edit tutorial" : "Tulis tutorial baru"}
        sub={
          edit
            ? "Perbarui isi panduan. Komentar dan riwayat baca tetap tersimpan."
            : "Susun panduan perbaikan selangkah demi selangkah. Tutorial langsung tayang setelah diterbitkan."
        }
      />
      <div style={{ maxWidth: 820 }}>
        <Stepper langkah={LANGKAH_FORM} aktif={langkah} maks={maks} onPilih={pindah} />

        {langkah === 0 ? (
          <div className="form">
            <Field id="tf-judul" label="Judul tutorial" galat={galat.judul}>
              <Input
                id="tf-judul"
                maxLength={120}
                value={judul}
                placeholder="Contoh: Ganti thermal paste PS4 Slim"
                galat={!!galat.judul}
                aria-describedby={idDeskripsi("tf-judul", { galat: !!galat.judul })}
                onChange={(e) => ubah(setJudul, "judul")(e.target.value)}
              />
            </Field>
            <Field id="tf-konsol" label="Konsol" galat={galat.konsol}>
              <Select
                id="tf-konsol"
                value={konsol}
                galat={!!galat.konsol}
                aria-describedby={idDeskripsi("tf-konsol", { galat: !!galat.konsol })}
                onChange={(e) => ubah(setKonsol, "konsol")(e.target.value)}
              >
                <option value="">Pilih konsol…</option>
                {konsolPilihan.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="field">
              <label>Tingkat kesulitan</label>
              <Pilihan
                label="Tingkat kesulitan"
                nilai={tingkat}
                opsi={TINGKAT.map((t) => ({ nilai: t, label: LABEL_KESULITAN[t] }))}
                onChange={ubah(setTingkat, "tingkat")}
              />
              {galat.tingkat ? (
                <div className="fld-err" role="alert">
                  {galat.tingkat}
                </div>
              ) : null}
            </div>
            <Field id="tf-waktu" label="Estimasi waktu" galat={galat.waktu}>
              <Select
                id="tf-waktu"
                value={waktu}
                galat={!!galat.waktu}
                aria-describedby={idDeskripsi("tf-waktu", { galat: !!galat.waktu })}
                onChange={(e) => ubah(setWaktu, "waktu")(e.target.value as WaktuPengerjaan)}
              >
                <option value="">Pilih estimasi…</option>
                {Object.entries(LABEL_WAKTU).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </Field>
            <ChipInput
              id="tf-alat"
              label="Alat dan bahan"
              placeholder="Contoh: Obeng Phillips #0"
              hint="Ketik lalu tekan Enter atau Tambah. Minimal satu."
              nilai={alat}
              galat={galat.alat}
              onChange={ubah(setAlat, "alat")}
            />
          </div>
        ) : null}

        {langkah === 1 ? (
          <div className="form">
            <Field
              id="tf-warn"
              label="Peringatan keselamatan (opsional)"
              hint="Tampil menonjol di atas langkah-langkah. Kosongkan bila tidak ada risiko khusus."
            >
              <Textarea
                id="tf-warn"
                rows={6}
                maxLength={1000}
                value={peringatan}
                placeholder="Contoh: Cabut kabel daya dan tunggu 10 menit sebelum membuka casing."
                aria-describedby={idDeskripsi("tf-warn", { hint: true })}
                onChange={(e) => ubah(setPeringatan)(e.target.value)}
              />
            </Field>
          </div>
        ) : null}

        {langkah === 2 ? (
          <div className="card lcards">
            {isiLangkah.map((l, i) => (
              <div className="lcard" key={l.kunci}>
                <div className="lcard-h">
                  <span className="stepnum">{i + 1}</span>
                  <span className="grow">Langkah {i + 1}</span>
                  <button
                    type="button"
                    className="iconbtn"
                    title="Naikkan"
                    aria-label={`Naikkan langkah ${i + 1}`}
                    disabled={i === 0}
                    onClick={() => geser(i, i - 1)}
                  >
                    <Icon nama="up" ukuran={15} />
                  </button>
                  <button
                    type="button"
                    className="iconbtn"
                    title="Turunkan"
                    aria-label={`Turunkan langkah ${i + 1}`}
                    disabled={i === isiLangkah.length - 1}
                    onClick={() => geser(i, i + 1)}
                  >
                    <Icon nama="down" ukuran={15} />
                  </button>
                  <button
                    type="button"
                    className="iconbtn"
                    title="Hapus langkah"
                    aria-label={`Hapus langkah ${i + 1}`}
                    disabled={isiLangkah.length === 1}
                    onClick={() => {
                      setIsiLangkah((d) => d.filter((x) => x.kunci !== l.kunci));
                      setKotor(true);
                    }}
                  >
                    <Icon nama="trash" ukuran={15} />
                  </button>
                </div>
                <Textarea
                  id={`lg-${l.kunci}`}
                  rows={3}
                  maxLength={1000}
                  value={l.teks}
                  aria-label={`Isi langkah ${i + 1}`}
                  placeholder="Jelaskan apa yang dikerjakan pada langkah ini."
                  galat={!!galatLangkah[l.kunci]}
                  aria-describedby={galatLangkah[l.kunci] ? `lg-${l.kunci}-err` : undefined}
                  onChange={(e) => {
                    ubahLangkah(l.kunci, (x) => ({ ...x, teks: e.target.value }));
                    setGalatLangkah((g) => ({ ...g, [l.kunci]: "" }));
                  }}
                />
                {galatLangkah[l.kunci] ? (
                  <div className="fld-err" id={`lg-${l.kunci}-err`} role="alert">
                    {galatLangkah[l.kunci]}
                  </div>
                ) : null}
                <FilePicker
                  id={`lgp-${l.kunci}`}
                  label="Tambah foto langkah (opsional)"
                  hint="JPG, PNG, atau WebP. Maksimal 2 MB."
                  accept="image/jpeg,image/png,image/webp"
                  aturan={ATURAN_FOTO_LANGKAH}
                  maks={1}
                  item={l.foto}
                  onChange={(n) => ubahLangkah(l.kunci, (x) => ({ ...x, foto: n }))}
                />
              </div>
            ))}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setIsiLangkah((d) => [...d, langkahKosong()]);
                setKotor(true);
              }}
            >
              <Icon nama="plus" />
              Tambah langkah
            </button>
          </div>
        ) : null}

        {terakhir ? (
          <div className="card tf-sum">
            <div className="note">Periksa sekali lagi. Setelah diterbitkan, tutorial langsung bisa dibaca semua anggota.</div>
            <div style={{ marginTop: 16 }}>
              <KV
                item={[
                  { label: "Judul", nilai: judul },
                  { label: "Konsol", nilai: konsol },
                  { label: "Tingkat", nilai: tingkat ? <Badge nada={NADA_KESULITAN[tingkat]}>{LABEL_KESULITAN[tingkat]}</Badge> : "—" },
                  { label: "Estimasi", nilai: waktu ? LABEL_WAKTU[waktu] : "—" },
                  { label: "Alat dan bahan", nilai: alat.join(", ") },
                  { label: "Peringatan", nilai: peringatan.trim() || "—" },
                ]}
              />
            </div>
            <div className="dsec">{isiLangkah.length} langkah</div>
            <ol className="step-list">
              {isiLangkah.map((l) => (
                <li key={l.kunci}>
                  {l.teks}
                  {l.foto[0] ? <span className="mute"> · foto: {l.foto[0].nama}</span> : null}
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        <div className="row-flex form-bar" style={{ marginTop: 14 }}>
          <button
            className="btn btn-primary"
            type="button"
            disabled={berjalan}
            onClick={terakhir ? terbitkan : lanjut}
          >
            {terakhir ? (berjalan ? "Menyimpan…" : edit ? "Simpan perubahan" : "Terbitkan tutorial") : "Lanjut"}
          </button>
          {langkah > 0 ? (
            <button className="btn btn-ghost" type="button" onClick={() => pindah0(langkah - 1)}>
              Kembali
            </button>
          ) : null}
          <button className="btn btn-ghost" type="button" onClick={keluar}>
            Batal
          </button>
        </div>
      </div>
      {dialog}
    </>
  );
}
