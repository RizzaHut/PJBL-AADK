import { inisial } from "@/lib/format";

/** Avatar bulat + nama + keterangan kecil, dipakai di drawer. */
export function Person({ username, sub }: { username: string; sub: string }) {
  return (
    <div className="person">
      <span className="av" aria-hidden="true">
        {inisial(username)}
      </span>
      <div className="t">
        <span className="cell-strong">{username}</span>
        <span className="cell-sub">{sub}</span>
      </div>
    </div>
  );
}

/** Penanda antrean lama: muncul bila status menunggu dan umur melewati ambang. */
export function Terlambat({ hari }: { hari: number }) {
  return (
    <div className="late">
      <i aria-hidden="true" />
      {hari} hari menunggu
    </div>
  );
}
