import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/dashboard/ui/Icon";
import type { NamaIkon } from "@/components/dashboard/ui/icons";
import type { StatistikModerator } from "@/lib/queries/moderasi";

function Kartu({ ikon, nada, label, nilai }: { ikon: NamaIkon; nada: "" | "o"; label: string; nilai: number }) {
  return (
    <div className="st">
      <div className="st-top">
        <span className={nada ? `st-ico ${nada}` : "st-ico"}>
          <Icon nama={ikon} />
        </span>
        {label}
      </div>
      <div className="st-num">{nilai}</div>
    </div>
  );
}

function Baris({
  href,
  ikon,
  judul,
  detail,
  jumlah,
}: {
  href: string;
  ikon: NamaIkon;
  judul: string;
  detail: string;
  jumlah: number;
}) {
  return (
    <Link className="todo-row" href={href}>
      <span className="st-ico">
        <Icon nama={ikon} />
      </span>
      <span className="tt">
        <b>{judul}</b>
        <small>{detail}</small>
      </span>
      <em data-zero={jumlah ? undefined : ""}>{jumlah}</em>
      <span className="go">
        <Icon nama="chev-r" />
      </span>
    </Link>
  );
}

const tertua = (hari: number | null) =>
  hari === null ? "Tidak ada antrean" : `Tertua menunggu ${hari} hari`;

/** Empat kartu angka + kartu "Perlu tindakan". Id `stats` dipakai CSS moderator. */
export function RangkumanStats({ s }: { s: StatistikModerator }) {
  return (
    <div className="stats" id="stats">
      <div className="st-row">
        <Kartu ikon="flag" nada="o" label="Laporan menunggu" nilai={s.laporanMenunggu} />
        <Kartu ikon="check-badge" nada="o" label="Pengajuan menunggu" nilai={s.pengajuanMenunggu} />
        <Kartu ikon="shield" nada="" label="Laporan ditindak bulan ini" nilai={s.ditindakBulanIni} />
        <Kartu ikon="alert" nada="" label="Peringatan bulan ini" nilai={s.peringatanBulanIni} />
      </div>
      <div className="todo2">
        <div className="todo2-h">Perlu tindakan</div>
        <div className="todo2-b">
          <Baris
            href="/moderator/laporan"
            ikon="flag"
            judul="Laporan konten menunggu"
            detail={tertua(s.tertuaLaporanHari)}
            jumlah={s.laporanMenunggu}
          />
          <Baris
            href="/moderator/pengajuan"
            ikon="check-badge"
            judul="Pengajuan teknisi menunggu"
            detail={tertua(s.tertuaPengajuanHari)}
            jumlah={s.pengajuanMenunggu}
          />
        </div>
      </div>
    </div>
  );
}
