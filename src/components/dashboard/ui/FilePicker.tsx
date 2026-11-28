"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./Icon";
import { galatBerkas, type AturanBerkas } from "@/lib/validasi";

export interface ItemBerkas {
  /** Kunci unik di daftar. */
  kunci: string;
  nama: string;
  /** URL pratinjau (object URL) untuk gambar baru. */
  url?: string;
  /** Berkas baru; kosong untuk berkas yang sudah tersimpan. */
  berkas?: File;
}

interface FilePickerProps {
  id: string;
  label: string;
  hint: string;
  accept: string;
  aturan: AturanBerkas;
  maks: number;
  item: ItemBerkas[];
  onChange: (item: ItemBerkas[]) => void;
  /** Galat dari server (per kolom). */
  galat?: string;
  /** Tampilkan pratinjau gambar (default true). */
  pratinjau?: boolean;
}

let urut = 0;

function PratinjauGambar({ url, nama }: { url: string; nama: string }) {
  const [gagal, setGagal] = useState(false);
  if (gagal) {
    return (
      <div className="ph" role="img" aria-label={`Pratinjau ${nama} tidak tersedia`}>
        <Icon nama="image" ukuran={22} />
        <span>Pratinjau tidak tersedia</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={`Pratinjau ${nama}`}
      onError={() => setGagal(true)}
    />
  );
}

/**
 * Pemilih berkas terkendali: validasi jenis dan ukuran, pratinjau, dan hapus.
 * Daftar `item` disimpan induk, jadi bisa dikirim sebagai FormData tanpa input file asli.
 */
export function FilePicker({ id, label, hint, accept, aturan, maks, item, onChange, galat, pratinjau = true }: FilePickerProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [galatLokal, setGalatLokal] = useState("");
  const idHint = useId();
  const idGalat = useId();
  const urlSebelumnya = useRef(new Set(item.flatMap((it) => it.url ? [it.url] : [])));
  const tampilGalat = galatLokal || galat || "";

  useEffect(() => {
    const urlSaatIni = new Set(item.flatMap((it) => it.url ? [it.url] : []));
    for (const url of urlSebelumnya.current) {
      if (url.startsWith("blob:") && !urlSaatIni.has(url)) {
        URL.revokeObjectURL(url);
      }
    }
    urlSebelumnya.current = urlSaatIni;
  }, [item]);

  useEffect(
    () => () => {
      for (const url of urlSebelumnya.current) {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      }
    },
    [],
  );

  function pilih(daftar: FileList | null) {
    setGalatLokal("");
    if (!daftar) return;
    let hasil = item.slice();
    let pesan = "";
    for (const f of Array.from(daftar)) {
      if (hasil.length >= maks && maks > 1) {
        pesan = `Maksimal ${maks} file.`;
        break;
      }
      const g = galatBerkas(f, aturan);
      if (g) {
        pesan = g;
        continue;
      }
      if (maks === 1) hasil = [];
      urut += 1;
      hasil.push({
        kunci: `baru-${urut}`,
        nama: f.name,
        url: pratinjau && f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
        berkas: f,
      });
    }
    setGalatLokal(pesan);
    if (ref.current) ref.current.value = "";
    onChange(hasil);
  }

  function hapus(kunci: string) {
    onChange(item.filter((x) => x.kunci !== kunci));
    setGalatLokal("");
  }

  const penuh = item.length >= maks;

  return (
    <div className="pick" id={id}>
      {penuh ? null : (
        <button
          type="button"
          className="upload"
          aria-describedby={tampilGalat ? `${idHint} ${idGalat}` : idHint}
          onClick={() => ref.current?.click()}
        >
          <Icon nama="upload" ukuran={20} />
          <div>{label}</div>
        </button>
      )}
      <div className="hint" id={idHint}>
        {hint}
      </div>
      {tampilGalat ? (
        <div className="fld-err" id={idGalat} role="alert">
          {tampilGalat}
        </div>
      ) : null}
      {item.length ? (
        <div className="thumbs">
          {item.map((it) => (
            <div className="thumb" key={it.kunci}>
              {it.url ? (
                <PratinjauGambar url={it.url} nama={it.nama} />
              ) : (
                <div className="ph">
                  <Icon nama="image" ukuran={22} />
                </div>
              )}
              <span className="nm" title={it.nama}>
                {it.nama}
              </span>
              <button type="button" aria-label={`Hapus ${it.nama}`} onClick={() => hapus(it.kunci)}>
                <Icon nama="x" ukuran={12} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <input
        ref={ref}
        type="file"
        hidden
        accept={accept}
        multiple={maks > 1}
        onChange={(e) => pilih(e.target.files)}
      />
    </div>
  );
}
