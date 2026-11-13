import { Badge } from "@/components/dashboard/ui/Badge";
import { KV } from "@/components/dashboard/ui/KV";
import { tanggal } from "@/lib/format";
import { LABEL_PENGAJUAN } from "@/lib/labels";
import type { DataJadiTeknisi } from "@/lib/queries/profil";
import { hariSejak, menitSampai } from "@/lib/waktu";
import { FormPengajuan } from "./FormPengajuan";

const pendek = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

/** Halaman "Jadi teknisi" untuk Anggota: menunggu, ditolak (masa tunggu), atau form pengajuan. */
export function JadiTeknisiView({ d }: { d: DataJadiTeknisi }) {
  const { keadaan, terbaru, riwayat } = d;
  const hariTunggu = terbaru?.cooldown_sampai ? Math.max(0, Math.ceil(menitSampai(terbaru.cooldown_sampai) / 1440)) : 0;

  return (
    <>
      {keadaan === "menunggu" && terbaru ? (
        <div className="sec-form">
          <div className="card">
            <div className="intro-card">
              <h2>
                <Badge nada="warn">Menunggu</Badge> Pengajuanmu sedang ditinjau
              </h2>
              <p>
                Moderator memeriksa bukti keahlianmu. Kamu akan menjadi teknisi setelah disetujui, dan tidak perlu
                mengajukan lagi.
              </p>
            </div>
            <div className="card-pad">
              <KV
                item={[
                  {
                    label: "Diajukan",
                    nilai: (
                      <>
                        {tanggal(terbaru.diajukan_pada)}{" "}
                        <span className="mute">({hariSejak(terbaru.diajukan_pada)} hari lalu)</span>
                      </>
                    ),
                  },
                  {
                    label: "Bukti",
                    nilai: (
                      <>
                        {terbaru.jenis_bukti === "video" ? "Video" : "Foto"} ·{" "}
                        <span className="mono">{terbaru.nama_berkas}</span>
                      </>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      ) : null}

      {keadaan === "tunggu" && terbaru ? (
        <div className="sec-form">
          <div className="card">
            <div className="intro-card">
              <h2>
                <Badge nada="err">Ditolak</Badge> Pengajuan terakhir ditolak
              </h2>
              <p>Perbaiki bukti sesuai catatan moderator, lalu ajukan lagi setelah masa tunggu selesai.</p>
            </div>
            <div className="card-pad">
              <KV
                item={[
                  { label: "Ditinjau", nilai: tanggal(terbaru.ditinjau_pada) },
                  { label: "Alasan penolakan", nilai: terbaru.alasan_penolakan },
                  {
                    label: "Boleh mengajukan lagi",
                    nilai: (
                      <>
                        {tanggal(terbaru.cooldown_sampai)} <span className="mute">({hariTunggu} hari lagi)</span>
                      </>
                    ),
                  },
                ]}
              />
            </div>
            <div className="card-pad" style={{ paddingTop: 0 }}>
              <button className="btn btn-primary" type="button" disabled>
                Ajukan lagi
              </button>
              <div className="hint" style={{ marginTop: 6 }}>
                Tombol aktif pada {tanggal(terbaru.cooldown_sampai)}.
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {keadaan === "baru" || keadaan === "bisa" ? (
        <FormPengajuan alasanSebelumnya={keadaan === "bisa" ? (terbaru?.alasan_penolakan ?? null) : null} />
      ) : null}

      {riwayat.length ? (
        <div className="sec-form" style={{ marginTop: 28 }}>
          <div className="sec-head">
            <div className="sec-title">Riwayat pengajuan</div>
          </div>
          <div className="card card-pad">
            <ul className="hist">
              {riwayat.map((r, i) => (
                <li key={r.id}>
                  <span>
                    <Badge nada={LABEL_PENGAJUAN[r.status].nada}>{LABEL_PENGAJUAN[r.status].teks}</Badge>
                    {r.alasan_penolakan && i > 0 ? (
                      <span className="mute"> {pendek(r.alasan_penolakan, 60)}</span>
                    ) : null}
                  </span>
                  <span className="when">{tanggal(r.diajukan_pada)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
