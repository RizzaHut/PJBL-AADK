import { Badge } from "@/components/dashboard/ui/Badge";
import { KV } from "@/components/dashboard/ui/KV";
import { BuktiPengajuanMedia } from "@/components/dashboard/moderator/BuktiPengajuanMedia";
import { tanggal } from "@/lib/format";
import { LABEL_PENGAJUAN } from "@/lib/labels";
import type { DetailPengajuan } from "@/lib/queries/moderasi";
import { sekarangIso } from "@/lib/waktu";
import { Person } from "./Person";

/** Isi drawer pengajuan teknisi (Server Component). */
export function PengajuanDetail({ d }: { d: DetailPengajuan }) {
  const { pengajuan: p, pemohon, riwayat } = d;
  const menunggu = p.status === "pending";
  const masihTunggu = p.cooldown_sampai ? p.cooldown_sampai > sekarangIso() : false;

  return (
    <>
      <div className="dsec">Bukti keahlian</div>
      <BuktiPengajuanMedia
        key={p.id}
        url={p.url_bukti}
        jenis={p.jenis_bukti}
        nama={p.nama_berkas}
        tersedia={d.buktiTersedia}
      />

      <div className="dsec">Pemohon</div>
      <Person username={p.username} sub={pemohon.email} />
      <KV
        item={[
          { label: "Bergabung", nilai: tanggal(pemohon.dibuat_pada) },
          { label: "Aktivitas", nilai: `${pemohon.jumlah_post} post · ${pemohon.jumlah_komentar} komentar` },
          { label: "Peringatan", nilai: pemohon.jumlah_peringatan || "Belum ada" },
        ]}
      />

      <div className="dsec">Pengajuan ini</div>
      <KV
        item={[
          { label: "Diajukan", nilai: tanggal(p.diajukan_pada) },
          {
            label: "Status",
            nilai: <Badge nada={LABEL_PENGAJUAN[p.status].nada}>{LABEL_PENGAJUAN[p.status].teks}</Badge>,
          },
          ...(menunggu
            ? []
            : [
                {
                  label: "Ditinjau oleh",
                  nilai: `${p.ditinjau_oleh_username ?? "Akun dihapus"} · ${tanggal(p.ditinjau_pada)}`,
                },
              ]),
          ...(p.alasan_penolakan ? [{ label: "Alasan penolakan", nilai: p.alasan_penolakan }] : []),
          ...(p.cooldown_sampai
            ? [
                {
                  label: "Boleh mengajukan lagi",
                  nilai: (
                    <>
                      {tanggal(p.cooldown_sampai)}
                      {masihTunggu ? <span className="mute"> (masih dalam masa tunggu)</span> : null}
                    </>
                  ),
                },
              ]
            : []),
        ]}
      />

      {riwayat.length ? (
        <>
          <div className="dsec">Riwayat pengajuan</div>
          <ul className="hist">
            {riwayat.map((r) => (
              <li key={r.id}>
                <span>
                  <Badge nada={LABEL_PENGAJUAN[r.status].nada}>{LABEL_PENGAJUAN[r.status].teks}</Badge>
                </span>
                <span className="when">{tanggal(r.diajukan_pada)}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
}
