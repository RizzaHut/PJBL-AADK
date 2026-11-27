import { Badge } from "@/components/dashboard/ui/Badge";
import { Icon } from "@/components/dashboard/ui/Icon";
import type { NamaIkon } from "@/components/dashboard/ui/icons";
import { Link } from "@/i18n/navigation";
import { angka, inisial, tanggal, tanggalPanjang } from "@/lib/format";
import type { RangkumanProfil as Data } from "@/lib/queries/profil";

function Kartu({ ikon, nada, label, nilai, teks }: { ikon: NamaIkon; nada?: "o"; label: string; nilai: React.ReactNode; teks?: boolean }) {
  return (
    <div className="st">
      <div className="st-top">
        <span className={nada ? `st-ico ${nada}` : "st-ico"}>
          <Icon nama={ikon} />
        </span>
        {label}
      </div>
      <div className={teks ? "st-num stat-text" : "st-num"}>{nilai}</div>
    </div>
  );
}

function Baris({ href, ikon, judul, detail, jumlah, nol }: { href: string; ikon: NamaIkon; judul: string; detail: string; jumlah: React.ReactNode; nol?: boolean }) {
  return (
    <Link className="todo-row" href={href}>
      <span className="st-ico">
        <Icon nama={ikon} />
      </span>
      <span className="tt">
        <b>{judul}</b>
        <small>{detail}</small>
      </span>
      <em data-zero={nol ? "" : undefined}>{jumlah}</em>
      <span className="go">
        <Icon nama="chev-r" />
      </span>
    </Link>
  );
}

/** Halaman Rangkuman profil (Server Component). Anggota dan Teknisi memakai tampilan sama. */
export function RangkumanProfil({ d, hariIni }: { d: Data; hariIni: string }) {
  const { me, teknisi } = d;
  const ket = {
    baru: "Ajukan bukti keahlian untuk menulis tutorial",
    menunggu: "Moderator sedang meninjau pengajuanmu",
    tunggu: `Ditolak. Boleh ajukan lagi ${tanggal(d.cooldownSampai)}`,
    bisa: "Masa tunggu selesai, kamu boleh mengajukan lagi",
    teknisi: "",
  }[d.keadaan];
  const aktif = me.terakhir_aktif_pada.slice(0, 10) === hariIni.slice(0, 10) ? "hari ini" : tanggal(me.terakhir_aktif_pada);

  return (
    <>
      <div className="card card-pad prof">
        <span className="prof-av">{me.pfp_url ? "" : inisial(me.username)}</span>
        <div className="prof-main">
          <div className="prof-name">
            {me.username}
            <Badge nada={teknisi ? "ok" : "info"}>{teknisi ? "Teknisi" : "Anggota"}</Badge>
          </div>
          <div className="pmeta">
            {me.tanggal_lahir ? (
              <span>
                <Icon nama="cake" ukuran={15} />
                Lahir {tanggalPanjang(me.tanggal_lahir)}
              </span>
            ) : null}
            <span>
              <Icon nama="clock" ukuran={15} />
              Terakhir aktif {aktif}
            </span>
            <span>
              <Icon nama="calendar" ukuran={15} />
              Bergabung {tanggalPanjang(me.dibuat_pada)}
            </span>
          </div>
        </div>
        <Link className="btn btn-ghost" href="/profil/akun">
          <Icon nama="edit" />
          Edit profil
        </Link>
      </div>

      <div className="stats">
        <div className="st-row">
          <Kartu ikon="book" label="Tutorial dibaca" nilai={d.tutorialDibaca} />
          <Kartu ikon="comment" label="Post dibuat" nilai={d.postDibuat} />
          <Kartu ikon="reply" label="Komentar dibuat" nilai={d.komentarDibuat} />
          <Kartu ikon="star" nada="o" label="Merek favorit" nilai={d.merekFavorit} teks />
        </div>
      </div>

      {teknisi ? (
        <>
          <div className="dsec" style={{ margin: "18px 0 8px" }}>
            Tutorialmu
          </div>
          <div className="stats">
            <div className="st-row">
              <Kartu ikon="book" label="Tutorial dibuat" nilai={teknisi.tutorialDibuat} />
              <Kartu ikon="eye" label="Total pembaca" nilai={angka(teknisi.totalPembaca)} />
              <Kartu ikon="reply" label="Komentar masuk" nilai={teknisi.komentarMasuk} />
              <Kartu ikon="console" nada="o" label="Konsol terpopuler" nilai={teknisi.konsolTerpopuler} teks />
            </div>
          </div>
        </>
      ) : null}

      <div className="todo2" style={{ marginTop: 14 }}>
        <div className="todo2-h">Perlu tindakan</div>
        <div className="todo2-b">
          {teknisi ? (
            <Baris href="/profil/tutorial/baru" ikon="plus" judul="Tulis tutorial baru" detail="Bagikan panduan perbaikan terbaru" jumlah="Mulai" nol />
          ) : (
            <Baris
              href="/profil/jadi-teknisi"
              ikon="check-badge"
              judul="Jadi teknisi"
              detail={ket}
              jumlah={d.keadaan === "menunggu" ? "Menunggu" : d.keadaan === "tunggu" ? "Ditolak" : "Ajukan"}
              nol={d.keadaan === "menunggu" || d.keadaan === "tunggu"}
            />
          )}
        </div>
      </div>
    </>
  );
}
