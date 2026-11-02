import { Badge } from "@/components/dashboard/ui/Badge";
import { Icon } from "@/components/dashboard/ui/Icon";
import { KV } from "@/components/dashboard/ui/KV";
import { rupiah, tanggal } from "@/lib/format";
import { LABEL_TRANSAKSI } from "@/lib/labels";
import type { Transaksi } from "@/types/domain";

/** Isi drawer detail transaksi (Server Component): bukti bayar dan rincian. */
export function TransaksiDetail({ t }: { t: Transaksi }) {
  return (
    <>
      {t.url_bukti_bayar ? (
        <div className="proof">
          <Icon nama="image" ukuran={22} />
          <div>Bukti bayar QRIS</div>
          <div style={{ fontSize: 12.5 }}>{t.url_bukti_bayar}</div>
        </div>
      ) : (
        <div className="note">Pembeli belum mengunggah bukti bayar.</div>
      )}
      <div style={{ height: 14 }} />
      <KV
        item={[
          { label: "Produk", nilai: t.judul_produk },
          { label: "Pembeli", nilai: t.pembeli_username ?? "Akun dihapus" },
          { label: "Nominal", nilai: rupiah(t.harga_saat_beli) },
          { label: "Dibuat", nilai: tanggal(t.dibuat_pada) },
          { label: "Status", nilai: <Badge nada={LABEL_TRANSAKSI[t.status].nada}>{LABEL_TRANSAKSI[t.status].teks}</Badge> },
        ]}
      />
      {t.status === "payment_uploaded" ? (
        <p className="cell-sub" style={{ marginTop: 12 }}>
          Bukti tidak sesuai? Hubungi pembeli lewat WhatsApp. Pembeli bisa mengganti bukti selama belum dikonfirmasi.
        </p>
      ) : null}
    </>
  );
}
