"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type TujuanMasuk = "/" | "/admin" | "/moderator" | "/profil/jadi-teknisi";
type TujuanSetelahMasuk = "/profil/jadi-teknisi" | undefined;

type HasilMasuk =
  | { ok: true; tujuan: TujuanMasuk }
  | {
      ok: false;
      alasan: "kredensial" | "konfigurasi" | "izin_database" | "layanan";
    };

export async function masuk(
  username: string,
  password: string,
  tujuanSetelahMasuk?: TujuanSetelahMasuk,
): Promise<HasilMasuk> {
  if (typeof username !== "string" || typeof password !== "string") {
    return { ok: false, alasan: "kredensial" };
  }

  const identitas = username.trim();
  if (!identitas || !password || identitas.length > 254 || password.length > 1024) {
    return { ok: false, alasan: "kredensial" };
  }

  try {
    const admin = createAdminClient();
    let email = identitas;

    if (!identitas.includes("@")) {
      const [pengguna, staf] = await Promise.all([
        admin
          .from("pengguna")
          .select("email")
          .eq("username", identitas)
          .maybeSingle(),
        admin
          .from("staf")
          .select("email")
          .eq("username", identitas)
          .maybeSingle(),
      ]);

      if (pengguna.error) throw pengguna.error;
      if (staf.error) throw staf.error;

      const emailAkun = pengguna.data?.email ?? staf.data?.email;
      if (!emailAkun) return { ok: false, alasan: "kredensial" };
      email = emailAkun;
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.status === 400 || error.status === 401) {
        return { ok: false, alasan: "kredensial" };
      }
      throw error;
    }
    if (!data.user) return { ok: false, alasan: "kredensial" };

    const { data: staf, error: errorStaf } = await admin
      .from("staf")
      .select("peran")
      .eq("id", data.user.id)
      .maybeSingle();

    if (errorStaf) throw errorStaf;

    if (!staf && tujuanSetelahMasuk === "/profil/jadi-teknisi") {
      const { data: pengguna, error: errorPengguna } = await admin
        .from("pengguna")
        .select("peran")
        .eq("id", data.user.id)
        .maybeSingle();

      if (errorPengguna) throw errorPengguna;
      if (pengguna?.peran === "anggota") {
        return { ok: true, tujuan: tujuanSetelahMasuk };
      }
    }

    return {
      ok: true,
      tujuan:
        staf?.peran === "super_admin"
          ? "/admin"
          : staf?.peran === "moderator"
            ? "/moderator"
            : "/",
    };
  } catch (error) {
    console.error("Login Supabase gagal:", error);

    const message = error instanceof Error ? error.message : "";
    return {
      ok: false,
      alasan:
        message.startsWith("Supabase belum dikonfigurasi") ||
        message.startsWith("SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi") ||
        message.startsWith("NEXT_PUBLIC_SUPABASE_URL bukan URL")
          ? "konfigurasi"
          : /permission denied for table (pengguna|staf)/i.test(message)
            ? "izin_database"
          : "layanan",
    };
  }
}

export async function keluar(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) {
    throw new Error("Sesi tidak dapat diakhiri. Silakan coba lagi.");
  }

  const locale = await getLocale();
  redirect({ href: "/login", locale });
}
