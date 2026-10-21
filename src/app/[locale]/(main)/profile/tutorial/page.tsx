"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import Modal from "@/components/dashboard/admin/Modal";
import {
  buttonGhost,
  buttonPrimary,
  FormField,
  inputClass,
} from "@/components/dashboard/admin/FormField";
import DataTable, { type Column } from "@/components/dashboard/admin/DataTable";
import { ProfileLayout } from "@/components/dashboard/profile/ProfileShell";
import { createClient } from "@/lib/supabase/client";

type TutorialRow = {
  id: string;
  merek: string;
  konsol: string;
  judul: string;
  tingkat_kesulitan: "mudah" | "sedang" | "sulit";
  komentar: number;
  pembaca: number;
};

type NewTutorialForm = {
  konsol_id: string;
  judul: string;
  url_thumbnail: string;
  tingkat_kesulitan: "mudah" | "sedang" | "sulit";
  estimasi_waktu: "15_menit" | "30_menit" | "1_jam" | "2_jam" | "lebih_2_jam";
  item: string;
  konten_peringatan: string;
};

type TutorialStep = {
  id: number;
  deskripsi: string;
  url_gambar: string[];
  gambarFile: File | null;
};

function ImageDropzone({
  file,
  label,
  onFile,
}: {
  file: File | null;
  label: string;
  onFile: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const acceptFile = (nextFile: File | undefined) => {
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/")) return;
    onFile(nextFile);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    acceptFile(event.dataTransfer.files[0]);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`cursor-pointer rounded-[14px] border-[1.5px] border-dashed p-6 text-center transition-colors ${
        isDragging
          ? "border-[#006FCD] bg-[#e4f1ff]"
          : "border-[#9ca3af] bg-[#dfeaf6] hover:border-[#006FCD]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          acceptFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <div className="mb-2 flex justify-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-8 w-8 text-[#4b5563]"
          aria-hidden="true"
        >
          <path d="M12 16V4m0 0 4 4m-4-4-4 4M4 15.5v2A2.5 2.5 0 0 0 6.5 20h11A2.5 2.5 0 0 0 20 17.5v-2" />
        </svg>
      </div>
      <div className="text-[16px] text-[#242424]">
        {file ? file.name : label}
      </div>
      <div className="mt-1 text-sm text-[#606060]">
        Seret gambar ke sini atau klik untuk memilih
      </div>
    </div>
  );
}

const formatCount = (value: number) => value.toLocaleString("id-ID");

const defaultNewTutorial: NewTutorialForm = {
  konsol_id: "",
  judul: "",
  url_thumbnail: "",
  tingkat_kesulitan: "mudah",
  estimasi_waktu: "30_menit",
  item: "",
  konten_peringatan: "",
};

const createEmptyTutorialStep = (id: number): TutorialStep => ({
  id,
  deskripsi: "",
  url_gambar: [],
  gambarFile: null,
});

export default function ProfileTutorialPage() {
  const [activeTab, setActiveTab] = useState<"dibaca" | "dibuat">("dibaca");
  const [rows, setRows] = useState<TutorialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [consoleOptions, setConsoleOptions] = useState<
    Array<{ id: string; merek: string; nama: string }>
  >([]);
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialRow | null>(
    null,
  );
  const [editingTutorial, setEditingTutorial] = useState<TutorialRow | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<TutorialRow | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [showAddTutorial, setShowAddTutorial] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [newTutorial, setNewTutorial] =
    useState<NewTutorialForm>(defaultNewTutorial);
  const [tutorialSteps, setTutorialSteps] = useState<TutorialStep[]>([
    createEmptyTutorialStep(1),
  ]);

  const loadTutorials = async (tabOverride?: "dibaca" | "dibuat") => {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }

    const currentTab = tabOverride ?? activeTab;
    const isReadHistory = currentTab === "dibaca";

    const selected = isReadHistory
      ? await supabase
          .from("baca_tutorial")
          .select("tutorial_id")
          .eq("pengguna_id", user.id)
      : await supabase.from("tutorial").select("id").eq("penulis_id", user.id);

    const tutorialIds = (selected.data ?? []).map((row) =>
      isReadHistory ? row.tutorial_id : row.id,
    );

    if (tutorialIds.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }

    const [tutorialsRes, konsolRes] = await Promise.all([
      supabase
        .from("tutorial")
        .select("id, judul, konsol_id, penulis_id, tingkat_kesulitan")
        .in("id", tutorialIds),
      supabase.from("konsol").select("id, merek, nama"),
    ]);

    const konsolMap = new Map(
      (konsolRes.data ?? []).map((konsol) => [konsol.id, konsol]),
    );

    const tutorialRows = (tutorialsRes.data ?? []).map((tutorial) => {
      const konsol = konsolMap.get(tutorial.konsol_id);
      return {
        id: tutorial.id,
        merek: konsol?.merek ?? "-",
        konsol: konsol?.nama ?? "-",
        judul: tutorial.judul,
        tingkat_kesulitan: tutorial.tingkat_kesulitan,
        komentar: 0,
        pembaca: 0,
      };
    });

    const counts = await Promise.all(
      tutorialRows.map(async (item) => {
        const [commentRes, readRes] = await Promise.all([
          supabase
            .from("komentar_tutorial")
            .select("id", { count: "exact", head: true })
            .eq("tutorial_id", item.id),
          supabase
            .from("baca_tutorial")
            .select("pengguna_id", { count: "exact", head: true })
            .eq("tutorial_id", item.id),
        ]);

        return {
          ...item,
          komentar: commentRes.count ?? 0,
          pembaca: readRes.count ?? 0,
        };
      }),
    );

    setRows(counts);
    setLoading(false);
  };

  useEffect(() => {
    const loadConsoles = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("konsol")
        .select("id, merek, nama")
        .order("merek", { ascending: true })
        .order("nama", { ascending: true });

      setConsoleOptions(data ?? []);
    };

    void loadConsoles();
  }, []);

  useEffect(() => {
    void loadTutorials();
  }, [activeTab]);

  const openEditTutorial = (row: TutorialRow) => {
    setEditingTutorial(row);
    setDraftTitle(row.judul);
  };

  const saveTutorialTitle = async () => {
    if (!editingTutorial || !draftTitle.trim()) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("tutorial")
      .update({ judul: draftTitle.trim() })
      .eq("id", editingTutorial.id)
      .eq("penulis_id", user.id);

    if (!error) {
      setRows((current) =>
        current.map((item) =>
          item.id === editingTutorial.id
            ? { ...item, judul: draftTitle.trim() }
            : item,
        ),
      );
    }

    setEditingTutorial(null);
    setDraftTitle("");
  };

  const confirmDeleteTutorial = async () => {
    if (!deleteTarget) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("tutorial")
      .delete()
      .eq("id", deleteTarget.id)
      .eq("penulis_id", user.id);

    setRows((current) => current.filter((item) => item.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const resetTutorialWizard = () => {
    setShowAddTutorial(false);
    setWizardStep(1);
    setThumbnailFile(null);
    setNewTutorial(defaultNewTutorial);
    setTutorialSteps([createEmptyTutorialStep(1)]);
  };

  const updateTutorialStep = (
    stepId: number,
    field: "deskripsi" | "url_gambar" | "gambarFile",
    value: string | string[] | File | null,
  ) => {
    setTutorialSteps((current) =>
      current.map((step) =>
        step.id === stepId
          ? {
              ...step,
              [field]: value,
            }
          : step,
      ),
    );
  };

  const addTutorialStep = () => {
    setTutorialSteps((current) => [
      ...current,
      createEmptyTutorialStep(current.length + 1),
    ]);
  };

  const removeTutorialStep = (stepId: number) => {
    setTutorialSteps((current) => {
      if (current.length <= 1) {
        return [createEmptyTutorialStep(1)];
      }

      return current
        .filter((step) => step.id !== stepId)
        .map((step, index) => ({ ...step, id: index + 1 }));
    });
  };

  const handleProceedToSteps = () => {
    setWizardStep(2);
  };

  const handleCreateTutorial = async () => {
    if (!newTutorial.konsol_id || !newTutorial.judul.trim()) {
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const itemList = newTutorial.item
      .split(",")
      .map((val) => val.trim())
      .filter(Boolean);

    const { data: insertedTutorial, error: tutorialError } = await supabase
      .from("tutorial")
      .insert({
        konsol_id: newTutorial.konsol_id,
        penulis_id: user.id,
        judul: newTutorial.judul.trim(),
        url_thumbnail: newTutorial.url_thumbnail.trim() || null,
        tingkat_kesulitan: newTutorial.tingkat_kesulitan,
        estimasi_waktu: newTutorial.estimasi_waktu,
        item: itemList,
        konten_peringatan: newTutorial.konten_peringatan.trim() || null,
      })
      .select("id")
      .single();

    if (tutorialError || !insertedTutorial) {
      return;
    }

    const validSteps = tutorialSteps
      .filter((step) => step.deskripsi.trim())
      .map((step, index) => ({
        tutorial_id: insertedTutorial.id,
        nomor_langkah: index + 1,
        deskripsi: step.deskripsi.trim(),
        url_gambar: step.url_gambar.filter(Boolean),
      }));

    if (validSteps.length > 0) {
      await supabase.from("langkah_tutorial").insert(validSteps);
    }

    resetTutorialWizard();
    await loadTutorials("dibuat");
  };

  const columns: Column<TutorialRow>[] = [
    { key: "merek", label: "Merek" },
    { key: "konsol", label: "Konsol" },
    { key: "judul", label: "Judul tutorial" },
    {
      key: "komentar",
      label: "Komentar",
      render: (value) => formatCount(Number(value ?? 0)),
    },
    {
      key: "pembaca",
      label: "Pembaca",
      render: (value) => formatCount(Number(value ?? 0)),
    },
  ];

  const tutorialFilters = [
    {
      key: "konsol" as const,
      label: "konsol",
      options: consoleOptions.map((consoleItem) => ({
        value: consoleItem.nama,
        label: `${consoleItem.merek} — ${consoleItem.nama}`,
      })),
    },
    {
      key: "tingkat_kesulitan" as const,
      label: "tingkat kesulitan",
      options: [
        { value: "mudah", label: "Mudah" },
        { value: "sedang", label: "Sedang" },
        { value: "sulit", label: "Sulit" },
      ],
    },
  ];

  return (
    <ProfileLayout>
      <section className="space-y-5">
        <div>
          <h1 className="text-[21px] font-semibold tracking-tight">Tutorial</h1>
          <p className="mt-0.75 text-[13px] text-[#606060]">
            Riwayat baca dan tutorial yang kamu tulis.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("dibaca")}
            className={`inline-flex items-center justify-center rounded-full border px-5 py-2 text-sm font-medium ${
              activeTab === "dibaca"
                ? "border-[#006FCD] bg-[#EAF3FF] text-[#006FCD] shadow-[inset_0_0_0_1px_rgba(0,111,205,0.12)]"
                : "border-black bg-white text-[#1f2937]"
            }`}
          >
            Riwayat dibaca
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dibuat")}
            className={`inline-flex items-center justify-center rounded-full border px-5 py-2 text-sm font-medium ${
              activeTab === "dibuat"
                ? "border-[#006FCD] bg-[#EAF3FF] text-[#006FCD] shadow-[inset_0_0_0_1px_rgba(0,111,205,0.12)]"
                : "border-black bg-white text-[#1f2937]"
            }`}
          >
            Riwayat dibuat
          </button>
        </div>

        {activeTab === "dibuat" && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setWizardStep(1);
                setShowAddTutorial(true);
              }}
              className={buttonPrimary}
            >
              + Tambah tutorial
            </button>
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-black bg-white p-4 text-sm text-[#606060]">
            Memuat data tutorial...
          </div>
        ) : (
          <DataTable
            data={rows}
            columns={columns}
            searchPlaceholder={
              activeTab === "dibaca"
                ? "Cari judul tutorial..."
                : "Cari tutorial yang dibuat..."
            }
            searchKeys={["judul", "merek", "konsol"]}
            filters={tutorialFilters}
            pageSize={5}
            actions={{
              view: (row) => setSelectedTutorial(row),
              edit: (row) => openEditTutorial(row),
              delete: (row) => setDeleteTarget(row),
            }}
          />
        )}
      </section>

      <Modal
        open={Boolean(selectedTutorial)}
        title="Detail tutorial"
        wide
        onClose={() => setSelectedTutorial(null)}
        footer={
          <button
            type="button"
            className={buttonPrimary}
            onClick={() => {
              if (selectedTutorial) openEditTutorial(selectedTutorial);
              setSelectedTutorial(null);
            }}
          >
            Edit tutorial
          </button>
        }
      >
        {selectedTutorial && (
          <div className="space-y-4 text-sm text-[#1f2937]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Judul
              </div>
              <div className="mt-1 text-lg font-semibold">
                {selectedTutorial.judul}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Merek
                </div>
                <div className="mt-1">{selectedTutorial.merek}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Konsol
                </div>
                <div className="mt-1">{selectedTutorial.konsol}</div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Komentar
                </div>
                <div className="mt-1">
                  {formatCount(selectedTutorial.komentar)}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Pembaca
                </div>
                <div className="mt-1">
                  {formatCount(selectedTutorial.pembaca)}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showAddTutorial}
        title={wizardStep === 1 ? "Tambah tutorial baru" : "Langkah tutorial"}
        wide
        onClose={resetTutorialWizard}
        footer={
          wizardStep === 1 ? (
            <>
              <button
                type="button"
                className={buttonGhost}
                onClick={resetTutorialWizard}
              >
                Batal
              </button>
              <button
                type="button"
                className={buttonPrimary}
                onClick={handleProceedToSteps}
              >
                Lanjutkan
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={buttonGhost}
                onClick={() => setWizardStep(1)}
              >
                Kembali
              </button>
              <button
                type="button"
                className={buttonPrimary}
                onClick={handleCreateTutorial}
              >
                Simpan tutorial
              </button>
            </>
          )
        }
      >
        {wizardStep === 1 ? (
          <div className="space-y-4">
            <FormField label="Konsol">
              <select
                value={newTutorial.konsol_id}
                onChange={(event) =>
                  setNewTutorial((current) => ({
                    ...current,
                    konsol_id: event.target.value,
                  }))
                }
                className={`${inputClass} appearance-none`}
              >
                <option value="">Pilih konsol</option>
                {consoleOptions.map((consoleItem) => (
                  <option key={consoleItem.id} value={consoleItem.id}>
                    {consoleItem.merek} — {consoleItem.nama}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Judul tutorial">
              <input
                value={newTutorial.judul}
                onChange={(event) =>
                  setNewTutorial((current) => ({
                    ...current,
                    judul: event.target.value,
                  }))
                }
                placeholder="Masukkan judul tutorial"
                className={inputClass}
              />
            </FormField>

            <FormField label="Thumbnail tutorial">
              <ImageDropzone
                file={thumbnailFile}
                label="Tambahkan thumbnail tutorial"
                onFile={setThumbnailFile}
              />
            </FormField>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Tingkat kesulitan">
                <select
                  value={newTutorial.tingkat_kesulitan}
                  onChange={(event) =>
                    setNewTutorial((current) => ({
                      ...current,
                      tingkat_kesulitan: event.target
                        .value as NewTutorialForm["tingkat_kesulitan"],
                    }))
                  }
                  className={`${inputClass} appearance-none`}
                >
                  <option value="mudah">Mudah</option>
                  <option value="sedang">Sedang</option>
                  <option value="sulit">Sulit</option>
                </select>
              </FormField>

              <FormField label="Estimasi waktu">
                <select
                  value={newTutorial.estimasi_waktu}
                  onChange={(event) =>
                    setNewTutorial((current) => ({
                      ...current,
                      estimasi_waktu: event.target
                        .value as NewTutorialForm["estimasi_waktu"],
                    }))
                  }
                  className={`${inputClass} appearance-none`}
                >
                  <option value="15_menit">15 menit</option>
                  <option value="30_menit">30 menit</option>
                  <option value="1_jam">1 jam</option>
                  <option value="2_jam">2 jam</option>
                  <option value="lebih_2_jam">Lebih dari 2 jam</option>
                </select>
              </FormField>
            </div>

            <FormField label="Item / alat yang dibutuhkan">
              <input
                value={newTutorial.item}
                onChange={(event) =>
                  setNewTutorial((current) => ({
                    ...current,
                    item: event.target.value,
                  }))
                }
                placeholder="Pisahkan dengan koma, contoh: obeng, solder, multitester"
                className={inputClass}
              />
            </FormField>

            <FormField label="Konten peringatan">
              <textarea
                value={newTutorial.konten_peringatan}
                onChange={(event) =>
                  setNewTutorial((current) => ({
                    ...current,
                    konten_peringatan: event.target.value,
                  }))
                }
                placeholder="Tuliskan peringatan atau catatan keamanan jika ada"
                className={`${inputClass} min-h-24 resize-y`}
              />
            </FormField>
          </div>
        ) : (
          <div className="space-y-4">
            {tutorialSteps.map((step, index) => (
              <div
                key={step.id}
                className="rounded-[18px] border border-[#242424] bg-[#edf1fe] p-4"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#dfeaf6] text-lg font-semibold text-[#006FCD]">
                      {index + 1}
                    </div>
                    <div className="text-lg font-semibold tracking-tight text-[#242424]">
                      Langkah {index + 1}
                    </div>
                  </div>

                  {tutorialSteps.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Hapus langkah ${index + 1}`}
                      onClick={() => removeTutorialStep(step.id)}
                      className="grid h-10 w-10 place-items-center rounded-lg border border-[#242424] bg-white text-[#4b5563] transition hover:bg-[#f3f6ff]"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" />
                      </svg>
                    </button>
                  )}
                </div>

                <FormField label="Penjelasan langkah">
                  <textarea
                    value={step.deskripsi}
                    onChange={(event) =>
                      updateTutorialStep(
                        step.id,
                        "deskripsi",
                        event.target.value,
                      )
                    }
                    placeholder="Jelaskan apa yang anda lakukan di langkah ini."
                    className={`${inputClass} min-h-40 resize-y`}
                  />
                </FormField>

                <ImageDropzone
                  file={step.gambarFile}
                  label="Tambahkan foto langkah ini"
                  onFile={(file) =>
                    updateTutorialStep(step.id, "gambarFile", file)
                  }
                />
              </div>
            ))}

            <div className="pt-2">
              <button
                type="button"
                onClick={addTutorialStep}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] border border-[#242424] bg-[#f3f6ff] px-4 py-3 text-[15px] font-medium text-[#242424] transition hover:bg-[#eaf3ff]"
              >
                <span className="text-xl leading-none">＋</span>
                <span>Tambah langkah</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(editingTutorial)}
        title="Edit tutorial"
        onClose={() => setEditingTutorial(null)}
        footer={
          <>
            <button
              type="button"
              className={buttonGhost}
              onClick={() => setEditingTutorial(null)}
            >
              Batal
            </button>
            <button
              type="button"
              className={buttonPrimary}
              onClick={saveTutorialTitle}
            >
              Simpan
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Judul tutorial">
            <input
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              className={inputClass}
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Hapus tutorial"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <button
              type="button"
              className={buttonGhost}
              onClick={() => setDeleteTarget(null)}
            >
              Batal
            </button>
            <button
              type="button"
              className={buttonPrimary}
              onClick={confirmDeleteTutorial}
            >
              Hapus
            </button>
          </>
        }
      >
        {deleteTarget && (
          <p className="text-sm text-slate-700">
            Apakah Anda yakin ingin menghapus tutorial{" "}
            <strong>{deleteTarget.judul}</strong>?
          </p>
        )}
      </Modal>
    </ProfileLayout>
  );
}
