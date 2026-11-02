"use client";
import { useState } from "react";
import { Upload } from "lucide-react";
import Modal from "./Modal";
import { FormField, inputClass, buttonGhost, buttonPrimary } from "./FormField";

import { createClient } from "@/lib/supabase/client";

export type ConsoleRow = {
  id?: string;
  modelId?: string;
  nama: string;
  merek: string;
  tipe: string;
  tahun: number;
  model: number;
  deskripsi?: string;
  fotoUrl?: string;
  bannerUrl?: string;
  opsiWarna?: string;
  konektivitas?: string;
  performa?: string;
  mediaPenyimpanan?: string;
};

type ConsoleFormProps = {
  open: boolean;
  row: ConsoleRow | null;
  onClose: () => void;
  onSave: (r: ConsoleRow) => Promise<void> | void;
};

export default function ConsoleForm(props: ConsoleFormProps) {
  if (!props.open) return null;

  return (
    <ConsoleFormContent
      key={props.row?.id ?? "new"}
      {...props}
    />
  );
}

function ConsoleFormContent({ open, row, onClose, onSave }: ConsoleFormProps) {
  const [nama, setNama] = useState(row?.nama ?? "");
  const [merek, setMerek] = useState(row?.merek ?? "Nintendo");
  const [tipe, setTipe] = useState(row?.tipe ?? "Home Console");
  const [tahun, setTahun] = useState(row?.tahun ? String(row.tahun) : "");
  const [deskripsi, setDeskripsi] = useState(row?.deskripsi ?? "");
  const [fotoUrl, setFotoUrl] = useState(row?.fotoUrl ?? "");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [bannerUrl, setBannerUrl] = useState(row?.bannerUrl ?? "");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [opsiWarna, setOpsiWarna] = useState(row?.opsiWarna ?? "");
  const [konektivitas, setKonektivitas] = useState(row?.konektivitas ?? "");
  const [performa, setPerforma] = useState(row?.performa ?? "");
  const [mediaPenyimpanan, setMediaPenyimpanan] = useState(
    row?.mediaPenyimpanan ?? "",
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  const triggerSave = () => {
    if (!nama.trim()) return;
    setConfirmOpen(true);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;

    if (!nextFile.type.startsWith("image/")) {
      alert("File yang dipilih harus berupa gambar.");
      event.target.value = "";
      return;
    }

    setFotoFile(nextFile);
    setFotoUrl(URL.createObjectURL(nextFile));
  };

  const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;

    if (!nextFile.type.startsWith("image/")) {
      alert("File yang dipilih harus berupa gambar.");
      event.target.value = "";
      return;
    }

    setBannerFile(nextFile);
    setBannerUrl(URL.createObjectURL(nextFile));
  };

  const confirmSave = async () => {
    let uploadedCardUrl = fotoUrl || "";
    let uploadedBannerUrl = bannerUrl || "";

    if (fotoFile) {
      const supabase = createClient();
      const extension = fotoFile.name.includes(".")
        ? fotoFile.name.split(".").pop() || "png"
        : "png";
      const path = `console-cards/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("gambar_kartu_konsol")
        .upload(path, fotoFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: fotoFile.type || "image/png",
        });

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const { data: publicData } = supabase.storage
        .from("gambar_kartu_konsol")
        .getPublicUrl(path);

      uploadedCardUrl = publicData.publicUrl;
    }

    if (bannerFile) {
      const supabase = createClient();
      const extension = bannerFile.name.includes(".")
        ? bannerFile.name.split(".").pop() || "png"
        : "png";
      const path = `console-banners/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("gambar_banner_konsol")
        .upload(path, bannerFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: bannerFile.type || "image/png",
        });

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const { data: publicData } = supabase.storage
        .from("gambar_banner_konsol")
        .getPublicUrl(path);

      uploadedBannerUrl = publicData.publicUrl;
    }

    await onSave({
      nama: nama.trim(),
      merek,
      tipe,
      tahun: Number(tahun) || 2026,
      model: row?.model ?? 0,
      deskripsi,
      fotoUrl: uploadedCardUrl || undefined,
      bannerUrl: uploadedBannerUrl || undefined,
      opsiWarna: opsiWarna.trim(),
      konektivitas: konektivitas.trim(),
      performa: performa.trim(),
      mediaPenyimpanan: mediaPenyimpanan.trim(),
    });
    setConfirmOpen(false);
  };

  return (
    <>
      <Modal
        open={open}
        title={row ? "Edit konsol" : "Tambah konsol"}
        wide
        onClose={onClose}
        footer={
          <>
            <button type="button" className={buttonGhost} onClick={onClose}>
              Batal
            </button>
            <button
              type="button"
              className={buttonPrimary}
              onClick={triggerSave}
            >
              {row ? "Simpan perubahan" : "Tambah konsol"}
            </button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Merek">
            <select
              className={inputClass}
              value={merek}
              onChange={(e) => setMerek(e.target.value)}
            >
              <option>Nintendo</option>
              <option>PlayStation</option>
              <option>Xbox</option>
            </select>
          </FormField>

          <FormField label="Tipe">
            <select
              className={inputClass}
              value={tipe}
              onChange={(e) => setTipe(e.target.value)}
            >
              <option>Home Console</option>
              <option>Hybrid Console</option>
              <option>Handheld Console</option>
            </select>
          </FormField>
        </div>

        <FormField label="Nama konsol">
          <input
            className={inputClass}
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: PlayStation 5"
          />
        </FormField>

        <FormField label="Deskripsi">
          <textarea
            className={`${inputClass} min-h-22.5 resize-y`}
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Ringkasan singkat yang tampil di halaman konsol."
          />
        </FormField>

        <FormField label="Tahun rilis">
          <input
            className={inputClass}
            type="number"
            min="1990"
            max="2026"
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
          />
        </FormField>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Opsi warna">
            <textarea
              className={`${inputClass} min-h-18.5 resize-y`}
              value={opsiWarna}
              onChange={(e) => setOpsiWarna(e.target.value)}
              placeholder="Pisahkan dengan koma, contoh: Hitam, Putih, Biru"
            />
          </FormField>

          <FormField label="Konektivitas">
            <textarea
              className={`${inputClass} min-h-18.5 resize-y`}
              value={konektivitas}
              onChange={(e) => setKonektivitas(e.target.value)}
              placeholder="Pisahkan dengan koma, contoh: HDMI, USB, Wi‑Fi"
            />
          </FormField>

          <FormField label="Performa">
            <textarea
              className={`${inputClass} min-h-18.5 resize-y`}
              value={performa}
              onChange={(e) => setPerforma(e.target.value)}
              placeholder="Pisahkan dengan koma, contoh: Snapdragon 8 Gen 3, 12GB RAM"
            />
          </FormField>

          <FormField label="Media penyimpanan">
            <textarea
              className={`${inputClass} min-h-18.5 resize-y`}
              value={mediaPenyimpanan}
              onChange={(e) => setMediaPenyimpanan(e.target.value)}
              placeholder="Pisahkan dengan koma, contoh: SSD 1TB, microSD, HDD"
            />
          </FormField>
        </div>

        <FormField label="Foto kartu">
          <div className="space-y-3">
            <input
              id="console-card-photo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />

            <label
              htmlFor="console-card-photo"
              className="grid cursor-pointer place-items-center gap-2 rounded-2xl border-2 border-dashed border-[#c9d5e7] bg-[#f7f9fd] p-5 text-slate-500 transition-colors hover:border-[#006FCD] hover:bg-[#edf5ff] hover:text-[#006FCD]"
            >
              <Upload size={20} />
              <div className="text-sm font-medium">
                {fotoUrl ? "Ganti foto kartu" : "Klik untuk mengunggah foto"}
              </div>
            </label>

            {fotoUrl && (
              <div className="overflow-hidden rounded-xl border border-[#dfe5f0] bg-white p-2">
                <img
                  src={fotoUrl}
                  alt="Preview foto kartu konsol"
                  className="h-32 w-full rounded-lg object-cover"
                />
              </div>
            )}
          </div>
        </FormField>

        <FormField label="Foto banner">
          <div className="space-y-3">
            <input
              id="console-banner-photo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerChange}
            />

            <label
              htmlFor="console-banner-photo"
              className="grid cursor-pointer place-items-center gap-2 rounded-2xl border-2 border-dashed border-[#c9d5e7] bg-[#f7f9fd] p-5 text-slate-500 transition-colors hover:border-[#006FCD] hover:bg-[#edf5ff] hover:text-[#006FCD]"
            >
              <Upload size={20} />
              <div className="text-sm font-medium">
                {bannerUrl
                  ? "Ganti foto banner"
                  : "Klik untuk mengunggah banner"}
              </div>
            </label>

            {bannerUrl && (
              <div className="overflow-hidden rounded-xl border border-[#dfe5f0] bg-white p-2">
                <img
                  src={bannerUrl}
                  alt="Preview banner konsol"
                  className="h-28 w-full rounded-lg object-cover"
                />
              </div>
            )}
          </div>
        </FormField>
      </Modal>

      <Modal
        open={confirmOpen}
        title={row ? "Konfirmasi perubahan" : "Konfirmasi data baru"}
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <button
              type="button"
              className={buttonGhost}
              onClick={() => setConfirmOpen(false)}
            >
              Batal
            </button>
            <button
              type="button"
              className={buttonPrimary}
              onClick={confirmSave}
            >
              Simpan
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-700">
          {row
            ? "Apakah Anda yakin ingin menyimpan perubahan data konsol ini?"
            : "Apakah Anda yakin ingin menambahkan konsol baru ini?"}
        </p>
      </Modal>
    </>
  );
}
