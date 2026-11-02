"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/dashboard/ui/ConfirmDialog";
import { useToast } from "@/components/dashboard/ui/Toast";
import { useRouter } from "@/i18n/navigation";
import { konfirmasiTransaksi } from "@/lib/actions/admin";

/** Tombol di kaki drawer transaksi: konfirmasi pembayaran diterima (dengan dialog). */
export function KonfirmasiTransaksi({ id, tutupHref }: { id: string; tutupHref: string }) {
  const [buka, setBuka] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function ok() {
    const h = await konfirmasiTransaksi(id);
    setBuka(false);
    toast.tampil(h.ok ? (h.pesan ?? "Transaksi dikonfirmasi.") : h.pesan);
    if (h.ok) {
      router.replace(tutupHref, { scroll: false });
      router.refresh();
    }
  }

  return (
    <>
      <button className="btn btn-primary" type="button" onClick={() => setBuka(true)}>
        Konfirmasi diterima
      </button>
      {buka ? (
        <ConfirmDialog
          judul="Konfirmasi pembayaran diterima?"
          isi="Transaksi selesai dan produk ditandai terjual."
          labelOk="Konfirmasi pembayaran"
          onOk={ok}
          onTutup={() => setBuka(false)}
        />
      ) : null}
    </>
  );
}
