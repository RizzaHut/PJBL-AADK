import { Icon } from "@/components/dashboard/ui/Icon";
import type { NamaIkon } from "@/components/dashboard/ui/icons";
import type { RangkumanAdmin as Data } from "@/lib/queries/admin";

function Kartu({ ikon, nada, label, nilai }: { ikon: NamaIkon; nada: "" | "o"; label: string; nilai: number }) {
  return (
    <div className="st">
      <div className="st-top">
        <span className={nada ? `st-ico ${nada}` : "st-ico"}>
          <Icon nama={ikon} />
        </span>
        {label}
      </div>
      <div className="st-num">{nilai.toLocaleString("id-ID")}</div>
    </div>
  );
}

/** Ringkasan angka utama dashboard admin (Server Component). */
export function RangkumanAdmin({ d }: { d: Data }) {
  return (
    <div className="stats" id="stats">
      <div className="st-row">
        <Kartu ikon="users" nada="" label="Total pengguna" nilai={d.totalPengguna} />
        <Kartu ikon="console" nada="" label="Total konsol" nilai={d.totalKonsol} />
        <Kartu ikon="book" nada="" label="Total tutorial" nilai={d.totalTutorial} />
        <Kartu ikon="comment" nada="o" label="Total post forum" nilai={d.totalPostForum} />
      </div>
    </div>
  );
}
