"use client";

import { useActionState, useState } from "react";
import { Field, Input, idDeskripsi } from "@/components/dashboard/ui/Field";
import { useToast } from "@/components/dashboard/ui/Toast";
import type { ActionResult } from "@/lib/actions/hasil";
import { gantiPassword, perbaruiProfil } from "@/lib/actions/moderasi";

type Keadaan = ActionResult | null;

function galatKolom(s: Keadaan, k: string): string {
  return s && !s.ok ? (s.kolom?.[k] ?? "") : "";
}

/** Form "Akun saya" untuk staf: profil dan password. Galat per kolom tampil inline. */
export function AkunForm({ username, email, peranLabel }: { username: string; email: string; peranLabel: string }) {
  const toast = useToast();
  const [u, setU] = useState(username);
  const [e, setE] = useState(email);
  const [lama, setLama] = useState("");
  const [baru, setBaru] = useState("");
  const [ulang, setUlang] = useState("");

  const [sProfil, aksiProfil, tungguProfil] = useActionState<Keadaan, FormData>(async (prev, data) => {
    const h = await perbaruiProfil(prev, data);
    toast.tampil(h.ok ? (h.pesan ?? "Tersimpan.") : h.pesan);
    return h;
  }, null);

  const [sPass, aksiPass, tungguPass] = useActionState<Keadaan, FormData>(async (prev, data) => {
    const h = await gantiPassword(prev, data);
    toast.tampil(h.ok ? (h.pesan ?? "Tersimpan.") : h.pesan);
    if (h.ok) {
      setLama("");
      setBaru("");
      setUlang("");
    }
    return h;
  }, null);

  const gUser = galatKolom(sProfil, "username");
  const gEmail = galatKolom(sProfil, "email");
  const gLama = galatKolom(sPass, "lama");
  const gBaru = galatKolom(sPass, "baru");
  const gUlang = galatKolom(sPass, "ulang");

  return (
    <>
      <form className="sec-form" action={aksiProfil} noValidate>
        <div className="sec-head">
          <div className="sec-title">Profil</div>
          <div className="sec-sub">Username tampil di forum dan di riwayat keputusan moderasi.</div>
        </div>
        <div className="form">
          <Field id="a-role" label="Peran" hint="Peran hanya bisa diubah oleh Super Admin.">
            <Input id="a-role" value={peranLabel} disabled readOnly aria-describedby="a-role-hint" />
          </Field>
          <Field
            id="a-user"
            label="Username"
            galat={gUser}
            hint="3–20 karakter: huruf kecil, angka, titik, atau garis bawah. Harus unik."
          >
            <Input
              id="a-user"
              name="username"
              value={u}
              onChange={(ev) => setU(ev.target.value)}
              autoComplete="username"
              spellCheck={false}
              galat={!!gUser}
              aria-describedby={idDeskripsi("a-user", { hint: true, galat: !!gUser })}
            />
          </Field>
          <Field
            id="a-email"
            label="Email"
            galat={gEmail}
            hint="Mengubah email mengirim tautan konfirmasi ke alamat baru. Email lama tetap dipakai sampai dikonfirmasi."
          >
            <Input
              id="a-email"
              name="email"
              type="email"
              value={e}
              onChange={(ev) => setE(ev.target.value)}
              autoComplete="email"
              galat={!!gEmail}
              aria-describedby={idDeskripsi("a-email", { hint: true, galat: !!gEmail })}
            />
          </Field>
          <div className="row-flex form-bar">
            <button className="btn btn-primary" type="submit" disabled={tungguProfil}>
              {tungguProfil ? "Menyimpan…" : "Simpan profil"}
            </button>
          </div>
        </div>
      </form>

      <form className="sec-form" action={aksiPass} noValidate>
        <div className="sec-head">
          <div className="sec-title">Password</div>
          <div className="sec-sub">Gunakan password yang tidak dipakai di layanan lain.</div>
        </div>
        <div className="form">
          <Field id="p-now" label="Password saat ini" galat={gLama}>
            <Input
              id="p-now"
              name="lama"
              type="password"
              value={lama}
              onChange={(ev) => setLama(ev.target.value)}
              autoComplete="current-password"
              galat={!!gLama}
              aria-describedby={idDeskripsi("p-now", { galat: !!gLama })}
            />
          </Field>
          <Field id="p-new" label="Password baru" galat={gBaru} hint="Minimal 8 karakter.">
            <Input
              id="p-new"
              name="baru"
              type="password"
              value={baru}
              onChange={(ev) => setBaru(ev.target.value)}
              autoComplete="new-password"
              galat={!!gBaru}
              aria-describedby={idDeskripsi("p-new", { hint: true, galat: !!gBaru })}
            />
          </Field>
          <Field id="p-rep" label="Ulangi password baru" galat={gUlang}>
            <Input
              id="p-rep"
              name="ulang"
              type="password"
              value={ulang}
              onChange={(ev) => setUlang(ev.target.value)}
              autoComplete="new-password"
              galat={!!gUlang}
              aria-describedby={idDeskripsi("p-rep", { galat: !!gUlang })}
            />
          </Field>
          <div className="row-flex form-bar">
            <button className="btn btn-primary" type="submit" disabled={tungguPass}>
              {tungguPass ? "Menyimpan…" : "Ganti password"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
