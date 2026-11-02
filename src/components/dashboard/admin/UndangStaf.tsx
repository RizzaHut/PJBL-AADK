"use client";

import { useState, useTransition } from "react";
import { Field, Input, idDeskripsi } from "@/components/dashboard/ui/Field";
import { Icon } from "@/components/dashboard/ui/Icon";
import { Modal } from "@/components/dashboard/ui/Modal";
import { useToast } from "@/components/dashboard/ui/Toast";
import { useRouter } from "@/i18n/navigation";
import { undangModerator } from "@/lib/actions/admin";

type Galat = Partial<Record<"username" | "email", string>>;

/** Tombol "Tambah moderator" + modal undangan (username dan email). */
export function UndangStaf() {
  const router = useRouter();
  const toast = useToast();
  const [buka, setBuka] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [galat, setGalat] = useState<Galat>({});
  const [berjalan, mulai] = useTransition();

  function tutup() {
    setBuka(false);
    setUsername("");
    setEmail("");
    setGalat({});
  }

  function kirim() {
    const data = new FormData();
    data.set("username", username);
    data.set("email", email);
    mulai(async () => {
      const h = await undangModerator(null, data);
      if (h.ok) {
        toast.tampil(h.pesan ?? "Undangan terkirim.");
        tutup();
        router.refresh();
      } else {
        setGalat(h.kolom ?? {});
        if (!h.kolom) toast.tampil(h.pesan);
      }
    });
  }

  return (
    <>
      <button className="btn btn-primary" type="button" onClick={() => setBuka(true)}>
        <Icon nama="plus" />
        Tambah moderator
      </button>
      {buka ? (
        <Modal
          judul="Undang moderator baru"
          onTutup={tutup}
          foot={
            <>
              <button className="btn btn-ghost" type="button" onClick={tutup} disabled={berjalan}>
                Batal
              </button>
              <button className="btn btn-primary" type="submit" form="form-undang" disabled={berjalan}>
                {berjalan ? "Mengirim…" : "Kirim undangan"}
              </button>
            </>
          }
        >
          <form
            id="form-undang"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              kirim();
            }}
          >
            <Field id="s-user" label="Username" galat={galat.username}>
              <Input
                id="s-user"
                value={username}
                placeholder="Contoh: moderator_rani"
                galat={!!galat.username}
                aria-describedby={idDeskripsi("s-user", { galat: !!galat.username })}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setGalat((g) => ({ ...g, username: "" }));
                }}
              />
            </Field>
            <Field id="s-mail" label="Email" galat={galat.email}>
              <Input
                id="s-mail"
                type="email"
                value={email}
                placeholder="nama@aadk.id"
                galat={!!galat.email}
                aria-describedby={idDeskripsi("s-mail", { galat: !!galat.email })}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setGalat((g) => ({ ...g, email: "" }));
                }}
              />
            </Field>
            <p className="cell-sub">
              Undangan dikirim ke email ini. Moderator mengatur password sendiri lewat tautan di email.
            </p>
          </form>
        </Modal>
      ) : null}
    </>
  );
}
