"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Outfit } from "next/font/google";
import { createClient } from "@/lib/supabase/client";
import { masuk } from "@/lib/actions/auth";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const getStaffDashboardPath = (role?: string | null): "/" | "/admin" | "/moderator" => {
  if (role === "super_admin") return "/admin";
  if (role === "moderator") return "/moderator";
  return "/";
};

export function LoginFormPanel() {
  const router = useRouter();
  const t = useTranslations("auth.login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function redirectExistingSession() {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (!active) return;
        if (authError) throw authError;
        if (!user) return;

        const { data: staff, error: staffError } = await supabase
          .from("staf")
          .select("id, peran")
          .eq("id", user.id)
          .maybeSingle();

        if (staffError) throw staffError;
        router.replace(getStaffDashboardPath(staff?.peran ?? null));
      } catch (err) {
        if (!active) return;
        const message = err instanceof Error ? err.message : "";
        setError(
          message.startsWith("Supabase belum dikonfigurasi") ||
            message.startsWith("NEXT_PUBLIC_SUPABASE_URL bukan URL")
            ? message
            : t("serviceUnavailable"),
        );
      }
    }

    void redirectExistingSession();

    return () => {
      active = false;
    };
  }, [router, t]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await masuk(username, password);
      if (result.ok) {
        router.replace(result.tujuan);
        return;
      }

      setError(
        result.alasan === "kredensial"
          ? t("invalidCredentials")
          : result.alasan === "konfigurasi"
            ? t("configurationUnavailable")
            : result.alasan === "izin_database"
              ? t("databasePermissionUnavailable")
            : t("serviceUnavailable"),
      );
    } catch {
      setError(t("serviceUnavailable"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="flex flex-1 flex-col items-start justify-center px-[8vw] py-14 md:py-0">
      <div className="w-full max-w-140">
        <h2
          className={`${outfit.className} mb-10 text-4xl font-bold leading-tight text-black md:text-[44px] md:leading-tight`}
          style={{ fontFamily: '"Outfit", sans-serif' }}
        >
          {t("welcome")}
        </h2>

        {error && (
          <div
            className="mb-5 border-2 border-dashed border-[#C13A1B] bg-[#FDE8E4] px-4 py-3 text-sm text-[#8F2A11]"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6.5 mt-4">
            <input
              type="text"
              name="username"
              placeholder={t("username")}
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-2 border-dashed border-[#1B1E24] bg-[#E9EEFA] px-6 py-5 text-[15px] font-medium tracking-[3px] text-[#14161A] outline-none placeholder:uppercase placeholder:tracking-[3px] placeholder:text-[#6B7280] focus:bg-[#DEE7FB]"
            />
          </div>

          <div className="mb-6.5">
            <input
              type="password"
              name="password"
              placeholder={t("password")}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-dashed border-[#1B1E24] bg-[#E9EEFA] px-6 py-5 text-[15px] font-medium tracking-[3px] text-[#14161A] outline-none placeholder:uppercase placeholder:tracking-[3px] placeholder:text-[#6B7280] focus:bg-[#DEE7FB]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1.5 w-full bg-[#E15A2C]! py-4 text-[19px] font-bold uppercase tracking-[2px] text-white hover:brightness-[1.06] active:brightness-95 disabled:opacity-60"
            style={{ backgroundColor: "#E15A2C" }}
          >
            {isSubmitting ? t("loggingIn") : t("loginButton")}
          </button>
        </form>

        <p className="mt-5.5 text-center text-[15px] text-[#14161A]">
          {t("signupPrompt")}{" "}
          <Link href="/register" className="font-bold text-[#2F6FE0] underline">
            {t("signupLink")}
          </Link>
        </p>
      </div>
    </section>
  );
}
