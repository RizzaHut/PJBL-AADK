import { Icon } from "@/components/dashboard/ui/Icon";
import type { NamaIkon } from "@/components/dashboard/ui/icons";
import { Link } from "@/i18n/navigation";
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

function Baris({ href, ikon, judul, detail, jumlah }: { href: string; ikon: NamaIkon; judul: string; detail: string; jumlah: number }) {
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

/** Empat kartu angka + kartu "Perlu tindakan" (Server Component). */
export function RangkumanAdmin({ d }: { d: Data }) {
  return (
    <div className="stats" id="stats">
      <div className="st-row">
        <Kartu ikon="users" nada="" label="Total pengguna" nilai={d.totalPengguna} />
        <Kartu ikon="console" nada="" label="Total konsol" nilai={d.totalKonsol} />
        <Kartu ikon="book" nada="" label="Total tutorial" nilai={d.totalTutorial} />
        <Kartu ikon="box" nada="o" label="Produk toko" nilai={d.totalProduk} />
      </div>
      <div className="todo2">
        <div className="todo2-h">Perlu tindakan</div>
        <div className="todo2-b">
          <Baris
            href="/admin/transaksi?status=payment_uploaded"
            ikon="cash"
            judul="Transaksi menunggu konfirmasi"
            detail={d.transaksiMenunggu ? "Bukti bayar sudah diunggah pembeli" : "Tidak ada antrean"}
            jumlah={d.transaksiMenunggu}
          />
          <Baris
            href="/admin/produk?status=pending"
            ikon="box"
            judul="Produk sedang dipesan"
            detail={d.produkDipesan ? "Menunggu pembayaran atau konfirmasi" : "Tidak ada pesanan berjalan"}
            jumlah={d.produkDipesan}
          />
        </div>
      </div>
    </div>
  );
}
