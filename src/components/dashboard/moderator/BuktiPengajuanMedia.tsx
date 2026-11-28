"use client";

import { useState } from "react";
import { galatUrlBukti } from "@/lib/validasi";

interface BuktiPengajuanMediaProps {
  url: string;
  jenis: "foto" | "video" | "tautan";
  nama: string;
  tersedia: boolean;
}

export function BuktiPengajuanMedia({
  url,
  jenis,
  nama,
  tersedia,
}: BuktiPengajuanMediaProps) {
  const [gagalMuat, setGagalMuat] = useState(false);
  const video = jenis === "video";
  const tautan = jenis === "tautan";
  const tautanValid = tautan && !galatUrlBukti(url);
  const tidakTersedia = !tersedia || gagalMuat;

  return (
    <div className={video && !tidakTersedia ? "pv" : "pv ph"}>
      {tidakTersedia ? (
        <span role="alert">
          {!tersedia
            ? "Berkas bukti tidak ditemukan di penyimpanan."
            : "Berkas bukti tidak dapat ditampilkan. Minta pemohon mengunggah ulang."}
        </span>
      ) : tautan ? (
        tautanValid ? (
          <a
            className="min-h-11 rounded border border-[#4B5B76] bg-white px-4 py-2 font-semibold text-[#0b0b0b] underline underline-offset-4"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Buka tautan bukti (tab baru)
          </a>
        ) : (
          <span>Tautan bukti tidak valid</span>
        )
      ) : video ? (
        <video
          className="absolute inset-0 h-full w-full object-contain"
          src={url}
          controls
          preload="metadata"
          width={640}
          height={360}
          aria-label="Bukti video pengajuan teknisi"
          onError={() => setGagalMuat(true)}
        >
          Video bukti tidak dapat diputar.
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="absolute inset-0 h-full w-full object-contain"
          src={url}
          alt="Bukti foto pengajuan teknisi"
          width={640}
          height={360}
          onError={() => setGagalMuat(true)}
        />
      )}
      {!tautan && !tidakTersedia ? (
        <div className="pv-meta">
          <span>{nama}</span>
          <span>{video ? "Video" : "Foto"}</span>
        </div>
      ) : null}
    </div>
  );
}
