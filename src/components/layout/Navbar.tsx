"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

export interface NavUser {
  username: string;
  avatarUrl?: string;
}

export interface NavbarProps {
  user?: NavUser | null;
  className?: string;
  floating?: boolean;
}

const NAV_ITEMS = [
  { label: "home", href: "/" },
  { label: "consoles", href: "/consoles" },
  { label: "forum", href: "/forum" },
  { label: "about", href: "/about" },
] as const;

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Navbar({
  user,
  className = "",
  floating = true,
}: NavbarProps) {
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const [currentUser, setCurrentUser] = useState<NavUser | null>(user ?? null);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const displayedUser = user ?? currentUser;

  const normalizedAvatarUrl =
    displayedUser?.avatarUrl && displayedUser.avatarUrl.trim()
      ? displayedUser.avatarUrl.trim()
      : undefined;
  const avatarFailed =
    normalizedAvatarUrl !== undefined &&
    normalizedAvatarUrl === failedAvatarUrl;

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function loadUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (!authUser) {
        setCurrentUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from("pengguna")
        .select("username, pfp_url")
        .eq("id", authUser.id)
        .maybeSingle();

      if (!isMounted) return;

      setCurrentUser({
        username:
          profile?.username ??
          authUser.user_metadata?.username ??
          authUser.email?.split("@")[0] ??
          "User",
        avatarUrl: profile?.pfp_url ?? undefined,
      });
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadUser();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header
      className={`z-50 select-none ${
        floating
          ? "relative sm:absolute top-4 sm:top-6 right-4 sm:right-8"
          : "relative w-full"
      } ${className}`}
      role="banner"
    >
      <div className="relative inline-block">
        {/* Retro Box Shadow */}
        <div
          className="absolute inset-0 translate-x-0.75 translate-y-0.75 bg-black rounded-sm"
          aria-hidden="true"
        />

        {/* Navbar Inner Box */}
        <nav
          className="relative flex items-center h-9.5 sm:h-10 px-2 sm:px-3 bg-white border-[1.5px] border-black rounded-sm"
          aria-label={t("main")}
        >
          <ul
            className="flex items-center m-0 p-0 list-none h-full"
            role="list"
          >
            {NAV_ITEMS.map(({ label, href }, index) => {
              const active = isActive(href, pathname);
              return (
                <React.Fragment key={href}>
                  {index > 0 && (
                    <span
                      className="w-px h-3.5 bg-[#cfcfcf] mx-1 sm:mx-2"
                      aria-hidden="true"
                    />
                  )}
                  <li className="h-full flex items-center">
                    <Link
                      href={href}
                      className={`px-2 sm:px-3 py-1 font-['Outfit',sans-serif] text-xs sm:text-[13px] font-medium transition-colors ${
                        active
                          ? "text-black font-bold"
                          : "text-black/80 hover:text-black hover:underline"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      {t(label)}
                    </Link>
                  </li>
                </React.Fragment>
              );
            })}
          </ul>

          <LanguageSwitcher className="ml-2 h-6 border border-black rounded-[3px] bg-white px-1 text-[11px] font-semibold" />

          {/* Vertical Divider before Avatar */}
          <span
            className="w-px h-3.5 bg-[#cfcfcf] mx-1 sm:mx-2"
            aria-hidden="true"
          />

          {/* User Avatar */}
          <div className="flex items-center pl-1">
            <Link
              href={displayedUser ? "/profil" : "/login"}
              aria-label={
                displayedUser
                  ? t("profile", { username: displayedUser.username })
                  : t("login")
              }
              className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-[3px] border border-black overflow-hidden bg-[#e8e8e8] hover:opacity-85 transition-opacity"
            >
              {normalizedAvatarUrl && !avatarFailed ? (
                <img
                  src={normalizedAvatarUrl}
                  alt={displayedUser?.username ?? ""}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setFailedAvatarUrl(normalizedAvatarUrl ?? null)}
                />
              ) : (
                <span className="font-['Outfit',sans-serif] text-xs font-semibold text-black/70">
                  {displayedUser
                    ? displayedUser.username.charAt(0).toUpperCase()
                    : "?"}
                </span>
              )}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
