import { Badge } from "@/components/dashboard/ui/Badge";
import { Icon } from "@/components/dashboard/ui/Icon";
import { KV } from "@/components/dashboard/ui/KV";
import { rupiah, sisaWaktu, tanggal, tanggalWaktu } from "@/lib/format";
import { LABEL_TRANSAKSI } from "@/lib/labels";
import { infoBayar } from "@/lib/queries/profil";
import type { PesananSaya } from "@/types/domain";

/** Rincian pesanan di drawer (Server Component): data, tenggat bayar + QRIS, atau bukti terkirim. */
export function PesananRingkasan({ p }: { p: PesananSaya }) {
  const bayar = p.status === "pending";
  const info = infoBayar(p);
  return (
    <>
      <div className="dsec">Pesanan</div>
      <KV
        item={[
          { label: "Kode", nilai: p.kode },
          { label: "Produk", nilai: p.judul_produk },
          { label: "Total", nilai: rupiah(p.harga_saat_beli) },
          { label: "Dibuat", nilai: tanggalWaktu(p.dibuat_pada) },
          { label: "Status", nilai: <Badge nada={LABEL_TRANSAKSI[p.status].nada}>{LABEL_TRANSAKSI[p.status].teks}</Badge> },
          ...(p.selesai_pada ? [{ label: "Selesai pada", nilai: tanggal(p.selesai_pada) }] : []),
        ]}
      />
      {bayar ? (
        <>
          <div className="dsec">Pembayaran</div>
          <div className={info.sisaMenit < 360 ? "note warn" : "note"}>
            Bayar sebelum <b>{tanggalWaktu(info.batas)}</b> ({sisaWaktu(info.sisaMenit)}). Setelah itu pesanan dibatalkan
            otomatis.
          </div>
          <div className="qris" style={{ marginTop: 14 }} role="img" aria-label="Kode QRIS pembayaran">
            <Icon nama="image" ukuran={40} />
            <span>QRIS AADK</span>
          </div>
          <ol className="step-list">
            <li>Scan QRIS dengan aplikasi bank atau dompet digital.</li>
            <li>
              Bayar tepat <b>{rupiah(p.harga_saat_beli)}</b>.
            </li>
            <li>Unggah tangkapan layar bukti bayar di bawah.</li>
          </ol>
        </>
      ) : (
        <>
          <div className="dsec">Bukti bayar</div>
          <div className="pv ph" role="img" aria-label="Bukti bayar terkirim">
            <Icon nama="image" ukuran={40} />
            <div className="pv-meta">
              <span>{p.nama_bukti}</span>
              <span>{p.status === "completed" ? "Dikonfirmasi" : "Terkirim"}</span>
            </div>
          </div>
          {p.status === "payment_uploaded" ? (
            <div className="note" style={{ marginTop: 14 }}>
              Admin sedang memeriksa pembayaranmu. Salah unggah? Ganti bukti selama belum dikonfirmasi.
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
