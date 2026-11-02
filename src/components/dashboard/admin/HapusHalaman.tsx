"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/dashboard/ui/ConfirmDialog";
import { Icon } from "@/components/dashboard/ui/Icon";
import { useToast } from "@/components/dashboard/ui/Toast";
import { useRouter } from "@/i18n/navigation";
import type { ActionResult } from "@/lib/actions/hasil";

interface Props {
  /** Teks tombol, mis. "Hapus konsol". */
  label: string;
  judul: string;
  isi: React.ReactNode;
  jalankan: () => Promise<ActionResult>;
  /** Halaman tujuan setelah berhasil menghapus. */
  kembaliHref: string;
  pesanSukses: string;
}

/** Tombol hapus di kepala halaman detail: dialog dampak, lalu kembali ke daftar. */
export function HapusHalaman({ label, judul, isi, jalankan, kembaliHref, pesanSukses }: Props) {
  const [buka, setBuka] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function ok() {
    const h = await jalankan();
    setBuka(false);
    if (h.ok) {
      toast.tampil(h.pesan ?? pesanSukses);
      router.push(kembaliHref);
      router.refresh();
    } else {
      toast.tampil(h.pesan);
    }
  }

  return (
    <>
      <button className="btn btn-ghost" type="button" onClick={() => setBuka(true)}>
        <Icon nama="trash" />
        {label}
      </button>
      {buka ? <ConfirmDialog judul={judul} isi={isi} bahaya labelOk={label} onOk={ok} onTutup={() => setBuka(false)} /> : null}
    </>
  );
}
