"use client";

import { useEffect, useState } from "react";
import {
  buttonGhost,
  buttonPrimary,
  FormField,
  inputClass,
} from "@/components/dashboard/admin/FormField";
import { ProfileLayout } from "@/components/dashboard/profile/ProfileShell";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePreferencesPage() {
  const [profile, setProfile] = useState({
    username: "",
    tanggal_lahir: "",
    jenis_kelamin: "laki_laki",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("pengguna")
        .select("username, tanggal_lahir, jenis_kelamin")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setProfile({
          username: data.username ?? "",
          tanggal_lahir: data.tanggal_lahir ?? "",
          jenis_kelamin: data.jenis_kelamin ?? "laki_laki",
        });
      }
    };

    void loadProfile();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("pengguna")
        .update({
          username: profile.username,
          tanggal_lahir: profile.tanggal_lahir || null,
          jenis_kelamin: profile.jenis_kelamin,
        })
        .eq("id", user.id);
    }

    setSaving(false);
  };

  return (
    <ProfileLayout>
      <section className="space-y-6">
        <div>
          <h1 className="text-[21px] font-semibold tracking-tight">
            Preferensi
          </h1>
          <p className="mt-0.75 text-[13px] text-[#606060]">
            Ubah profil anggota yang terhubung ke akun login Anda.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-black bg-white p-4 sm:p-5"
        >
          <div className="space-y-4">
            <FormField label="Username">
              <input
                value={profile.username}
                onChange={(event) =>
                  setProfile((current) => ({
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
                value={profile.tanggal_lahir}
                onChange={(event) =>
                  setProfile((current) => ({
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
                      setProfile((current) => ({
                        ...current,
                        jenis_kelamin: option.value,
                      }))
                    }
                    className={`rounded-[9px] border px-4 py-2 text-sm font-medium transition-colors ${
                      profile.jenis_kelamin === option.value
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

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" className={buttonGhost}>
              Batal
            </button>
            <button type="submit" className={buttonPrimary} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan perubahan"}
            </button>
          </div>
        </form>
      </section>
    </ProfileLayout>
  );
}
