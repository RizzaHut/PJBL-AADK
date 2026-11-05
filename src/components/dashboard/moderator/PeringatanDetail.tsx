import { KV } from "@/components/dashboard/ui/KV";
import { tanggal } from "@/lib/format";
import type { DetailPeringatan } from "@/lib/queries/moderasi";
import { Person } from "./Person";

/** Isi drawer peringatan (hanya baca; peringatan permanen). */
export function PeringatanDetail({ d }: { d: DetailPeringatan }) {
  const { peringatan: w, penerima, laporan } = d;
  return (
    <>
      <div className="dsec">Penerima</div>
      <Person username={w.penerima_username} sub={w.penerima_email} />
      <KV
        item={[
          { label: "Tanggal", nilai: tanggal(w.dibuat_pada) },
          { label: "Total peringatan", nilai: penerima?.jumlah_peringatan ?? 1 },
        ]}
      />
      <div className="dsec">Alasan</div>
      <div className="quote" style={{ marginTop: 0 }}>
        {w.alasan}
      </div>
      {laporan ? (
        <>
          <div className="dsec">Terkait laporan</div>
          <div className="card card-pad">
            <div className="cell-sub">
              {laporan.jenis_label} · {laporan.judul_konten}
            </div>
            <p style={{ margin: "6px 0 0" }}>{laporan.cuplikan_konten}</p>
          </div>
        </>
      ) : null}
      <div className="note" style={{ marginTop: 18 }}>
        Peringatan bersifat permanen. Tidak bisa diubah atau dihapus.
      </div>
    </>
  );
}
