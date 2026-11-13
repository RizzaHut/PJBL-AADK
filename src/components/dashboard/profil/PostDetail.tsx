import { Icon } from "@/components/dashboard/ui/Icon";
import { KV } from "@/components/dashboard/ui/KV";
import { tanggal } from "@/lib/format";
import type { PostSaya } from "@/types/domain";

/** Isi drawer detail post (Server Component). */
export function PostDetail({ p }: { p: PostSaya }) {
  return (
    <>
      <div className="cell-strong" style={{ fontSize: 16, marginBottom: 12 }}>
        {p.judul}
      </div>
      <KV
        item={[
          { label: "Topik", nilai: p.topik },
          { label: "Dibuat", nilai: tanggal(p.dibuat_pada) },
          { label: "Disukai", nilai: p.jumlah_suka },
          { label: "Komentar", nilai: p.jumlah_komentar },
        ]}
      />
      <div className="dsec">Isi post</div>
      <div className="quote" style={{ marginTop: 0 }}>
        {p.isi}
      </div>
      {p.gambar.length ? (
        <>
          <div className="dsec">Gambar ({p.gambar.length})</div>
          <div className="thumbs">
            {p.gambar.map((g) => (
              <div className="thumb" key={g}>
                <div className="ph">
                  <Icon nama="image" ukuran={22} />
                </div>
                <span className="nm">{g}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}
