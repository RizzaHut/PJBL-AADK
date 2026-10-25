"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  BarChart3,
  BookOpenText,
  FileText,
  MessageSquareText,
  Settings,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ProfileLayoutProps = {
  children: ReactNode;
};

const menuItems = [
  { label: "Rangkuman", href: "/profile", icon: BarChart3 },
  { label: "Tutorial", href: "/profile/tutorial", icon: BookOpenText },
  { label: "Komentar", href: "/profile/komentar", icon: MessageSquareText },
  { label: "Post Forum", href: "/profile/forum", icon: FileText },
  { label: "Preferensi", href: "/profile/preferensi", icon: Settings },
] as const;

export function ProfileLayout({ children }: ProfileLayoutProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({
    username: "Pengguna",
    email: "",
  });

  const handleLogout = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error.message);
      return;
    }

    router.push(`/${locale}/login`);
  };

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function loadProfile() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (!authUser) {
        setUserInfo({ username: "Pengguna", email: "" });
        return;
      }

      const { data: profile } = await supabase
        .from("pengguna")
        .select("username, email")
        .eq("id", authUser.id)
        .maybeSingle();

      if (!isMounted) return;

      setUserInfo({
        username:
          profile?.username ??
          authUser.user_metadata?.username ??
          authUser.email?.split("@")[0] ??
          "Pengguna",
        email: profile?.email ?? authUser.email ?? "",
      });
    }

    void loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadProfile();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div
      className="flex min-h-screen bg-[#f8f9ff] text-[#242424]"
      style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)" }}
    >
      <aside className="sticky top-0 flex h-screen w-[246px] shrink-0 flex-col border-r border-[#dfe5f0] bg-[#EDF1FE] px-[14px] py-5 shadow-[inset_-1px_0_0_rgba(15,23,42,0.04)]">
        <div className="flex flex-col items-center gap-2 px-2 pb-4 text-center">
          <img
            src="/assets/Icons/AADK icon.svg"
            alt="AADK logo"
            className="h-12 w-12 object-contain"
          />

          <div className="min-w-0">
            <div className="truncate text-sm font-semibold leading-[1.15] text-[#242424]">
              {userInfo.username}
            </div>
            {userInfo.email ? (
              <div className="truncate text-[11px] text-[#606060]">
                {userInfo.email}
              </div>
            ) : null}
          </div>
        </div>

        <div className="px-2.5 pb-1.5 pt-3 text-xs font-medium uppercase tracking-[0.12em] text-[#606060]">
          Menu
        </div>

        <nav className="flex flex-col gap-0.5">
          {menuItems.map((menu) => {
            const Icon = menu.icon;
            const href = menu.href;
            const localizedHref = `/${locale}${href}`;
            const active =
              pathname === localizedHref ||
              pathname.startsWith(`${localizedHref}/`);

            return (
              <Link
                key={menu.href}
                href={localizedHref}
                className={`relative flex w-full items-center gap-2.5 rounded-[9px] px-[11px] py-[9px] text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/80 font-semibold text-[#006FCD] shadow-[inset_0_0_0_1px_rgba(0,111,205,0.12)]"
                    : "text-[#606060] hover:bg-white/60 hover:text-[#242424]"
                }`}
              >
                {active && (
                  <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-[3px] bg-[#006FCD]" />
                )}
                <Icon size={16} strokeWidth={1.5} />
                <span>{menu.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-[18px] border-t border-[#dfe5f0] pt-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-[9px] px-[11px] py-[9px] text-sm font-medium text-[#DF1C1C] transition-colors hover:bg-[#FFE6E6]"
          >
            <LogOut size={16} strokeWidth={1.5} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-[30px] pb-[72px] pt-[26px]">
        <div className="mx-auto w-full max-w-[1240px]">{children}</div>
      </main>
    </div>
  );
}

export { ProfileLayout as ProfileShell };
export default ProfileLayout;
