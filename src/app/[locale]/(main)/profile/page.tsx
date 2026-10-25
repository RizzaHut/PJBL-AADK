"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock3, PencilLine, UserRound } from "lucide-react";
import Modal from "@/components/dashboard/admin/Modal";
import {
  buttonGhost,
  buttonPrimary,
  FormField,
  inputClass,
} from "@/components/dashboard/admin/FormField";
import StatCard from "@/components/dashboard/admin/StatCard";
import { ProfileLayout } from "@/components/dashboard/profile/ProfileShell";
import { createClient } from "@/lib/supabase/client";

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export default function ProfileSummaryPage() {
  const [profile, setProfile] = useState({
    username: "",
    tanggal_lahir: null as string | null,
    dibuat_pada: null as string | null,
    terakhir_aktif_pada: null as string | null,
    role: "Anggota",
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formState, setFormState] = useState({
    username: "",
    tanggal_lahir: "",
    jenis_kelamin: "laki_laki",
  });

  useEffect(() => {
    const loadProfileData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profileRes } = await supabase
        .from("pengguna")
        .select(
          "username, peran, tanggal_lahir, dibuat_pada, terakhir_aktif_pada",
        )
        .eq("id", user.id)
        .maybeSingle();

      const username =
        profileRes?.username ?? user.email?.split("@")[0] ?? "anggota";
      const role = profileRes?.peran === "teknisi" ? "Teknisi" : "Anggota";

      setProfile({
        username,
        tanggal_lahir: profileRes?.tanggal_lahir ?? null,
        dibuat_pada: profileRes?.dibuat_pada ?? null,
        terakhir_aktif_pada: profileRes?.terakhir_aktif_pada ?? null,
        role,
      });

      setFormState({
        username,
        tanggal_lahir: profileRes?.tanggal_lahir ?? "",
        jenis_kelamin: "laki_laki",
      });
    };

    void loadProfileData();
  }, []);

  return (
    <ProfileLayout>
      <section className="space-y-5">
        <div className="pt-2">
          <h2 className="text-[22px] font-semibold tracking-tight text-[#1f2937]">
            Rangkuman
          </h2>
          <p className="mt-1 text-[13px] text-[#606060]">
            Ringkasan aktivitasmu di AADK.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Tutorial dibaca", value: "0", type: "orange" },
            { label: "Post forum dibuat", value: "0", type: "green" },
            { label: "Balasan dibuat", value: "0", type: "blue" },
            { label: "Merek favorit", value: "Nintendo", type: "blue" },
          ].map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              type={stat.type as "orange" | "green" | "blue"}
            />
          ))}
        </div>
      </section>

      <Modal
        open={isEditOpen}
        title="Edit profil"
        onClose={() => setIsEditOpen(false)}
        footer={
          <>
            <button
              type="button"
              className={buttonGhost}
              onClick={() => setIsEditOpen(false)}
            >
              Batal
            </button>
            <button
              type="button"
              className={buttonPrimary}
              onClick={() => setIsEditOpen(false)}
            >
              Simpan
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Username">
            <input
              value={formState.username}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  username: event.target.value,
                }))
              }
              className={inputClass}
            />
          </FormField>

          <FormField label="Tanggal lahir">
            <input
              type="date"
              value={formState.tanggal_lahir}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  tanggal_lahir: event.target.value,
                }))
              }
              className={inputClass}
            />
          </FormField>

          <FormField label="Jenis kelamin">
            <div className="flex flex-wrap gap-3">
              {[
                { value: "laki_laki", label: "Laki-laki" },
                { value: "perempuan", label: "Perempuan" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormState((current) => ({
                      ...current,
                      jenis_kelamin: option.value,
                    }))
                  }
                  className={`rounded-[9px] border px-4 py-2 text-sm font-medium transition-colors ${
                    formState.jenis_kelamin === option.value
                      ? "border-[#006FCD] bg-[#EAF3FF] text-[#006FCD]"
                      : "border-black bg-white text-[#242424]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </FormField>
        </div>
      </Modal>
    </ProfileLayout>
  );
}
