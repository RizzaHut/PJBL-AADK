import { Badge } from "@/components/dashboard/ui/Badge";
import { KV } from "@/components/dashboard/ui/KV";
import { angka, tanggal } from "@/lib/format";
import { LABEL_WAKTU } from "@/lib/konstanta";
import { LABEL_KESULITAN, NADA_KESULITAN } from "@/lib/labels";
import type { TutorialSaya } from "@/types/domain";

/** Isi drawer detail tutorial (Server Component). */
export function TutorialDetail({ t }: { t: TutorialSaya }) {
  return (
    <>
      <div className="cell-strong" style={{ fontSize: 16, marginBottom: 12 }}>
        {t.judul}
      </div>
      <KV
        item={[
          { label: "Konsol", nilai: t.konsol },
          { label: "Tingkat", nilai: <Badge nada={NADA_KESULITAN[t.tingkat]}>{LABEL_KESULITAN[t.tingkat]}</Badge> },
          { label: "Estimasi waktu", nilai: LABEL_WAKTU[t.waktu] },
          { label: "Diterbitkan", nilai: tanggal(t.dibuat_pada) },
          { label: "Pembaca", nilai: angka(t.pembaca) },
          { label: "Komentar", nilai: t.jumlah_komentar },
        ]}
      />
      <div className="dsec">Alat dan bahan</div>
      <ul className="effects">
        {t.alat.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      {t.peringatan ? (
        <>
          <div className="dsec">Peringatan</div>
          <div className="note warn">{t.peringatan}</div>
        </>
      ) : null}
      <div className="dsec">Langkah-langkah</div>
      <ol className="step-list">
        {t.langkah.map((l, i) => (
          <li key={i}>
            {l.teks}
            {l.foto ? <span className="mute"> · foto: {l.foto}</span> : null}
          </li>
        ))}
      </ol>
    </>
  );
}
