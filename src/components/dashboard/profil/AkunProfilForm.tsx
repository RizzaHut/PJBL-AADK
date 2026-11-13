"use client";

import { useState, useTransition } from "react";
import { Field, Input, idDeskripsi } from "@/components/dashboard/ui/Field";
import { FilePicker, type ItemBerkas } from "@/components/dashboard/ui/FilePicker";
import { Pilihan } from "@/components/dashboard/ui/Pilihan";
import { useToast } from "@/components/dashboard/ui/Toast";
import { useRouter } from "@/i18n/navigation";
import type { ActionResult } from "@/lib/actions/hasil";
import { gantiPasswordSaya, perbaruiProfilSaya, ubahEmailSaya } from "@/lib/actions/profil";
import { inisial } from "@/lib/format";
import { ATURAN_PFP } from "@/lib/validasi";
import type { JenisKelamin } from "@/types/domain";

interface Props {
  username: string;
  email: string;
  tanggalLahir: string | null;
  jenisKelamin: JenisKelamin | null;
  peranLabel: string;
}

type Kolom = Record<string, string>;
const kolomDari = (h: ActionResult<unknown>): Kolom => (h.ok ? {} : (h.kolom ?? {}));

/** Halaman Akun saya untuk Anggota dan Teknisi: profil, email, password. */
export function AkunProfilForm({ username, email, tanggalLahir, jenisKelamin, peranLabel }: Props) {
  const toast = useToast();
  const router = useRouter();

  const [u, setU] = useState(username);
  const [lahir, setLahir] = useState(tanggalLahir ?? "");
  const [jk, setJk] = useState<JenisKelamin | "">(jenisKelamin ?? "");
  const [foto, setFoto] = useState<ItemBerkas[]>([]);
  const [gProfil, setGProfil] = useState<Kolom>({});
  const [pProfil, mulaiProfil] = useTransition();

  const [em, setEm] = useState(email);
  const [gEmail, setGEmail] = useState<Kolom>({});
  const [petunjukEmail, setPetunjukEmail] = useState("");
  const [pEmail, mulaiEmail] = useTransition();

  const [lama, setLama] = useState("");
  const [baru, setBaru] = useState("");
  const [ulang, setUlang] = useState("");
  const [gPass, setGPass] = useState<Kolom>({});
  const [pPass, mulaiPass] = useTransition();

  function simpanProfil() {
    const data = new FormData();
    data.set("username", u);
    data.set("tanggal_lahir", lahir);
    data.set("jenis_kelamin", jk);
    if (foto[0]?.berkas) data.set("foto", foto[0].berkas);
    mulaiProfil(async () => {
      const h = await perbaruiProfilSaya(null, data);
      setGProfil(kolomDari(h));
      toast.tampil(h.ok ? (h.pesan ?? "Profil disimpan.") : h.pesan);
      if (h.ok) router.refresh();
    });
  }

  function simpanEmail() {
    const data = new FormData();
    data.set("email", em);
    mulaiEmail(async () => {
      const h = await ubahEmailSaya(null, data);
      setGEmail(kolomDari(h));
      toast.tampil(h.ok ? "Cek email baru untuk konfirmasi." : h.pesan);
      if (h.ok) setPetunjukEmail(h.pesan ?? "");
    });
  }

  function simpanPass() {
    const data = new FormData();
    data.set("lama", lama);
    data.set("baru", baru);
    data.set("ulang", ulang);
    mulaiPass(async () => {
      const h = await gantiPasswordSaya(null, data);
      setGPass(kolomDari(h));
      toast.tampil(h.ok ? (h.pesan ?? "Password diganti.") : h.pesan);
      if (h.ok) {
        setLama("");
        setBaru("");
        setUlang("");
      }
    });
  }

  const kirim = (f: () => void) => (e: React.FormEvent) => {
    e.preventDefault();
    f();
  };

  return (
    <>
      <form className="sec-form" noValidate onSubmit={kirim(simpanProfil)}>
        <div className="sec-head">
          <div className="sec-title">Profil</div>
          <div className="sec-sub">Username dan foto tampil di forum, komentar, dan tutorial.</div>
        </div>
        <div className="form">
          <div className="field">
            <label htmlFor="pfp">Foto profil</label>
            <div className="prof" style={{ margin: "0 0 10px" }}>
              <span className="prof-av">
                {foto[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={foto[0].url} alt="Pratinjau foto profil" />
                ) : (
                  inisial(u || username)
                )}
              </span>
            </div>
            <FilePicker
              id="pfp"
              label="Klik untuk mengganti foto"
              hint="JPG atau PNG. Maksimal 2 MB."
              accept="image/jpeg,image/png"
              aturan={ATURAN_PFP}
              maks={1}
              item={foto}
              galat={gProfil.foto}
              onChange={setFoto}
            />
          </div>
          <Field
            id="a-user"
            label="Username"
            galat={gProfil.username}
            hint="3–20 karakter: huruf kecil, angka, titik, atau garis bawah. Harus unik."
          >
            <Input
              id="a-user"
              value={u}
              autoComplete="username"
              spellCheck={false}
              galat={!!gProfil.username}
              aria-describedby={idDeskripsi("a-user", { hint: true, galat: !!gProfil.username })}
              onChange={(e) => {
                setU(e.target.value);
                setGProfil((g) => ({ ...g, username: "" }));
              }}
            />
          </Field>
          <Field
            id="a-lahir"
            label="Tanggal lahir (opsional)"
            galat={gProfil.tanggal_lahir}
          >
            <Input
              id="a-lahir"
              type="date"
              value={lahir}
              galat={!!gProfil.tanggal_lahir}
              aria-describedby={idDeskripsi("a-lahir", { galat: !!gProfil.tanggal_lahir })}
              onChange={(e) => {
                setLahir(e.target.value);
                setGProfil((g) => ({ ...g, tanggal_lahir: "" }));
              }}
            />
          </Field>
          <div className="field">
            <label>Jenis kelamin</label>
            <Pilihan
              label="Jenis kelamin"
              nilai={jk}
              opsi={[
                { nilai: "laki_laki", label: "Laki-laki" },
                { nilai: "perempuan", label: "Perempuan" },
              ]}
              onChange={setJk}
            />
          </div>
          <Field id="a-role" label="Peran" hint="Peran berubah lewat pengajuan teknisi atau oleh Super Admin.">
            <Input id="a-role" value={peranLabel} disabled readOnly aria-describedby="a-role-hint" />
          </Field>
          <div className="row-flex form-bar">
            <button className="btn btn-primary" type="submit" disabled={pProfil}>
              {pProfil ? "Menyimpan…" : "Simpan profil"}
            </button>
          </div>
        </div>
      </form>

      <form className="sec-form" noValidate onSubmit={kirim(simpanEmail)}>
        <div className="sec-head">
          <div className="sec-title">Email</div>
          <div className="sec-sub">Dipakai untuk masuk dan pemulihan akun.</div>
        </div>
        <div className="form">
          <Field
            id="a-email"
            label="Email"
            galat={gEmail.email}
            hint={
              petunjukEmail ||
              "Mengubah email mengirim tautan konfirmasi ke alamat baru. Email lama tetap berlaku sampai dikonfirmasi."
            }
          >
            <Input
              id="a-email"
              type="email"
              value={em}
              autoComplete="email"
              galat={!!gEmail.email}
              aria-describedby={idDeskripsi("a-email", { hint: true, galat: !!gEmail.email })}
              onChange={(e) => {
                setEm(e.target.value);
                setGEmail({});
              }}
            />
          </Field>
          <div className="row-flex form-bar">
            <button className="btn btn-primary" type="submit" disabled={pEmail}>
              {pEmail ? "Mengirim…" : "Ubah email"}
            </button>
          </div>
        </div>
      </form>

      <form className="sec-form" noValidate onSubmit={kirim(simpanPass)}>
        <div className="sec-head">
          <div className="sec-title">Password</div>
          <div className="sec-sub">Gunakan password yang tidak dipakai di layanan lain.</div>
        </div>
        <div className="form">
          <Field id="p-now" label="Password saat ini" galat={gPass.lama}>
            <Input
              id="p-now"
              type="password"
              value={lama}
              autoComplete="current-password"
              galat={!!gPass.lama}
              aria-describedby={idDeskripsi("p-now", { galat: !!gPass.lama })}
              onChange={(e) => {
                setLama(e.target.value);
                setGPass((g) => ({ ...g, lama: "" }));
              }}
            />
          </Field>
          <Field id="p-new" label="Password baru" galat={gPass.baru} hint="Minimal 8 karakter.">
            <Input
              id="p-new"
              type="password"
              value={baru}
              autoComplete="new-password"
              galat={!!gPass.baru}
              aria-describedby={idDeskripsi("p-new", { hint: true, galat: !!gPass.baru })}
              onChange={(e) => {
                setBaru(e.target.value);
                setGPass((g) => ({ ...g, baru: "" }));
              }}
            />
          </Field>
          <Field id="p-rep" label="Ulangi password baru" galat={gPass.ulang}>
            <Input
              id="p-rep"
              type="password"
              value={ulang}
              autoComplete="new-password"
              galat={!!gPass.ulang}
              aria-describedby={idDeskripsi("p-rep", { galat: !!gPass.ulang })}
              onChange={(e) => {
                setUlang(e.target.value);
                setGPass((g) => ({ ...g, ulang: "" }));
              }}
            />
          </Field>
          <div className="row-flex form-bar">
            <button className="btn btn-primary" type="submit" disabled={pPass}>
              {pPass ? "Menyimpan…" : "Ganti password"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
