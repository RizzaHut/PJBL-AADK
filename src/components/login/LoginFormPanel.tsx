"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Outfit } from "next/font/google";
import { createClient } from "@/lib/supabase/client";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const getStaffDashboardPath = (role?: string | null) => {
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
    const supabase = createClient();

    async function redirectExistingSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active || !session) return;

      const { data: staff } = await supabase
        .from("staf")
        .select("id, peran")
        .eq("id", session.user.id)
        .maybeSingle();

      if (active) {
        router.replace(getStaffDashboardPath(staff?.peran ?? null));
      }
    }

    void redirectExistingSession();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const normalizedUsername = username.trim();
      const normalizedPassword = password;

      let email = normalizedUsername;

      if (!normalizedUsername.includes("@")) {
        const { data: profile, error: profileError } = await supabase
          .from("pengguna")
          .select("email")
          .eq("username", normalizedUsername)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        if (!profile?.email) {
          throw new Error("USER_NOT_FOUND");
        }

        email = profile.email;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: normalizedPassword,
      });

      if (signInError) {
        throw signInError;
      }

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        throw new Error("AUTHENTICATION_FAILED");
      }

      await supabase
        .from("pengguna")
        .update({ terakhir_aktif_pada: new Date().toISOString() })
        .eq("id", authUser.id);

      const { data: staff } = await supabase
        .from("staf")
        .select("id, peran")
        .eq("id", authUser.id)
        .maybeSingle();

      router.replace(getStaffDashboardPath(staff?.peran ?? null));
    } catch (err) {
      const message =
        err instanceof Error && err.message === "USER_NOT_FOUND"
          ? t("invalidCredentials")
          : t("invalidCredentials");

      setError(message);
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
          <div className="mb-5 border-2 border-dashed border-[#C13A1B] bg-[#FDE8E4] px-4 py-3 text-sm text-[#8F2A11]">
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
