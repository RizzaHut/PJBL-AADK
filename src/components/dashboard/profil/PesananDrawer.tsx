"use client";

import { useState, useTransition } from "react";
import { Drawer } from "@/components/dashboard/ui/Drawer";
import { FilePicker, type ItemBerkas } from "@/components/dashboard/ui/FilePicker";
import { Icon } from "@/components/dashboard/ui/Icon";
import { useToast } from "@/components/dashboard/ui/Toast";
import { useRouter } from "@/i18n/navigation";
import { kirimBuktiBayar } from "@/lib/actions/profil";
import type { StatusTransaksi } from "@/types/domain";
import { ATURAN_GAMBAR } from "@/lib/validasi";

interface Props {
  id: string;
  status: StatusTransaksi;
  tutupHref: string;
  waHref: string;
  /** Ringkasan pesanan yang dirender server (rincian, QRIS, bukti terkirim). */
  ringkasan: React.ReactNode;
}

/** Drawer detail pesanan. Bila belum selesai, ada pemilih bukti bayar dan tombol kirim. */
export function PesananDrawer({ id, status, tutupHref, waHref, ringkasan }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [item, setItem] = useState<ItemBerkas[]>([]);
  const [galat, setGalat] = useState("");
  const [berjalan, mulai] = useTransition();
  const bisaKirim = status !== "completed";
  const ganti = status === "payment_uploaded";

  function kirim() {
    const f = item[0]?.berkas;
    if (!f) return;
    const data = new FormData();
    data.set("bukti", f);
    mulai(async () => {
      const h = await kirimBuktiBayar(id, data);
      if (h.ok) {
        toast.tampil(h.pesan ?? "Bukti bayar terkirim.");
        router.replace(tutupHref, { scroll: false });
        router.refresh();
      } else {
        setGalat(h.kolom?.bukti ?? h.pesan);
      }
    });
  }

  return (
    <Drawer
      judul="Detail pesanan"
      tutupHref={tutupHref}
      foot={
        <>
          {bisaKirim ? (
            <button className="btn btn-primary" type="button" onClick={kirim} disabled={!item.length || berjalan}>
              <Icon nama="upload" />
              {berjalan ? "Mengirim…" : ganti ? "Ganti bukti" : "Kirim bukti bayar"}
            </button>
          ) : null}
          <a className="btn btn-ghost" href={waHref} target="_blank" rel="noopener noreferrer">
            Hubungi admin
          </a>
        </>
      }
    >
      {ringkasan}
      {bisaKirim ? (
        <>
          <div className="dsec">{ganti ? "Ganti bukti bayar" : "Bukti bayar"}</div>
          <FilePicker
            id="pay-pick"
            label={ganti ? "Klik untuk memilih bukti pengganti" : "Klik untuk memilih bukti bayar"}
            hint="JPG, PNG, atau WebP. Maksimal 5 MB."
            accept="image/jpeg,image/png,image/webp"
            aturan={ATURAN_GAMBAR}
            maks={1}
            item={item}
            onChange={(n) => {
              setItem(n);
              setGalat("");
            }}
            galat={galat}
          />
        </>
      ) : null}
    </Drawer>
  );
}
