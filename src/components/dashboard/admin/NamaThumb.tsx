import { inisial } from "@/lib/format";

/** Kotak inisial + nama + keterangan kecil untuk sel tabel (pengganti foto sampai Storage siap). */
export function NamaThumb({ nama, sub }: { nama: string; sub?: string }) {
  return (
    <div className="person">
      <span className="av-sq" aria-hidden="true">
        {inisial(nama)}
      </span>
      <div className="t">
        <span className="cell-strong">{nama}</span>
        {sub ? <span className="cell-sub">{sub}</span> : null}
      </div>
    </div>
  );
}
