"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { BarChart3, Gamepad2, Users, Shield, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Modal from "@/components/dashboard/admin/Modal";

export type SidebarMenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const defaultMenus: SidebarMenuItem[] = [
  { label: "Rangkuman", href: "/admin", icon: BarChart3 },
  { label: "Kelola Konsol", href: "/admin/konsol", icon: Gamepad2 },
  { label: "Kelola User", href: "/admin/user", icon: Users },
  { label: "Kelola Staf", href: "/admin/staf", icon: Shield },
];

export default function Sidebar({
  menuItems = defaultMenus,
}: {
  menuItems?: SidebarMenuItem[];
}) {
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({
    username: "Admin",
    email: "admin@aadk.id",
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    setShowLogoutConfirm(false);

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
        setUserInfo({ username: "Admin", email: "admin@aadk.id" });
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
          "Admin",
        email: profile?.email ?? authUser.email ?? "admin@aadk.id",
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
          <div className="truncate text-[11px] text-[#606060]">
            {userInfo.email}
          </div>
        </div>
      </div>

      <div className="px-2.5 pb-1.5 pt-3 text-xs font-medium uppercase tracking-[0.12em] text-[#606060]">
        Menu
      </div>

      <nav className="flex flex-col gap-0.5">
        {menuItems.map((menu) => {
          const Icon = menu.icon;
          const fullHref = `/${locale}${menu.href}`;
          const active =
            pathname === fullHref || pathname.startsWith(`${fullHref}/`);

          return (
            <Link
              key={menu.href}
              href={fullHref}
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
          onClick={() => setShowLogoutConfirm(true)}
          className="flex w-full items-center gap-2.5 rounded-[9px] px-[11px] py-[9px] text-sm font-medium text-[#DF1C1C] transition-colors hover:bg-[#FFE6E6]"
        >
          <LogOut size={16} strokeWidth={1.5} />
          <span>Keluar</span>
        </button>
      </div>

      <Modal
        open={showLogoutConfirm}
        title="Konfirmasi logout"
        onClose={() => setShowLogoutConfirm(false)}
        footer={
          <>
            <button
              type="button"
              className="rounded-[9px] border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Batal
            </button>
            <button
              type="button"
              className="rounded-[9px] bg-[#EF542B] px-3 py-2 text-sm font-medium text-white transition-colors hover:brightness-95"
              onClick={handleLogout}
            >
              Ya, keluar
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-700">
          Apakah Anda yakin ingin keluar dari akun ini?
        </p>
      </Modal>
    </aside>
  );
}
