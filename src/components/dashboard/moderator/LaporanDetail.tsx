import { Badge } from "@/components/dashboard/ui/Badge";
import { KV } from "@/components/dashboard/ui/KV";
import { tanggal } from "@/lib/format";
import { LABEL_LAPORAN } from "@/lib/labels";
import type { DetailLaporan } from "@/lib/queries/moderasi";
import { Person } from "./Person";

/** Isi drawer laporan konten (Server Component). */
export function LaporanDetail({ d }: { d: DetailLaporan }) {
  const { antrean: a, terlapor, peringatanTerkait } = d;
  const menunggu = a.status === "pending";
  const nama = a.terlapor_username ?? "Akun dihapus";
  const jumlahPeringatan = terlapor?.jumlah_peringatan ?? 0;

  return (
    <>
      <div className="dsec">Konten dilaporkan</div>
      <div className="card card-pad">
        <Person username={nama} sub={`${a.jenis_label} · ${tanggal(a.konten_dibuat_pada)}`} />
        <div className="cell-sub" style={{ margin: "-4px 0 6px" }}>
          {a.judul_konten}
        </div>
        <p style={{ margin: 0 }}>{a.cuplikan_konten}</p>
      </div>

      <div className="dsec">Dilaporkan {a.jumlah_pelapor} kali</div>
      {a.pelapor.map((p, i) => (
        <div className="rep" key={`${p.username}-${i}`}>
          <div className="rep-h">
            <span className="cell-strong">{p.username ?? "Akun dihapus"}</span>
            <span>{tanggal(p.dibuat_pada)}</span>
          </div>
          <p>{p.alasan}</p>
        </div>
      ))}

      <div className="dsec">Riwayat {nama}</div>
      <KV
        item={[
          { label: "Bergabung", nilai: terlapor ? tanggal(terlapor.dibuat_pada) : "-" },
          { label: "Laporan ditindak", nilai: terlapor?.jumlah_laporan_ditindak || "Belum ada" },
          { label: "Peringatan diterima", nilai: jumlahPeringatan || "Belum ada" },
        ]}
      />
      {jumlahPeringatan >= 2 ? (
        <div className="note warn" style={{ marginTop: 12 }}>
          Pengguna ini sudah menerima {jumlahPeringatan} peringatan.
        </div>
      ) : null}

      {menunggu ? null : (
        <>
          <div className="dsec">Keputusan</div>
          <KV
            item={[
              { label: "Status", nilai: <Badge nada={LABEL_LAPORAN[a.status].nada}>{LABEL_LAPORAN[a.status].teks}</Badge> },
              { label: "Diputuskan oleh", nilai: `${a.ditinjau_oleh_username ?? "Akun dihapus"} · ${tanggal(a.ditinjau_pada)}` },
              {
                label: "Tindakan",
                nilai: a.status === "reviewed" ? "Konten dihapus. Cuplikan tersimpan di laporan ini." : "Konten tetap tayang.",
              },
              ...(a.status === "reviewed"
                ? [
                    {
                      label: "Peringatan",
                      nilai: peringatanTerkait ? `Diberikan · ${tanggal(peringatanTerkait.dibuat_pada)}` : "Tidak diberikan",
                    },
                  ]
                : []),
            ]}
          />
        </>
      )}
    </>
  );
}
