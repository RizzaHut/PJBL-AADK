"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import PixelBorder from "@/components/shared/borders/PixelBorder";
import { Link } from "@/i18n/navigation";

export interface FooterProps {
  className?: string;
}

const NAV_LINKS = [
  { key: "consoles", href: "/consoles" },
  { key: "tutorials", href: "/consoles" },
  { key: "forum", href: "/forum" },
] as const;

const ACCOUNT_LINKS = [
  { key: "login", href: "/login" },
  { key: "settings", href: "/profil/akun" },
  { key: "activity", href: "/profil/riwayat-baca" },
] as const;

export default function Footer({ className = "" }: FooterProps) {
  const t = useTranslations("footer");

  return (
    <footer
      className={`relative w-full bg-[#82c3f8] pt-12 sm:pt-16 pb-16 text-black select-none ${className}`}
      aria-label={t("label")}
    >
      {/* Top PixelBorder: White on light blue, facing downward */}
      <div className="absolute top-0 left-0 right-0 w-full rotate-180 z-10">
        <PixelBorder direction="horizontal" color="#ffffff" />
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          {/* Column 1: Brand Logo & Copyright */}
          <div className="flex flex-col">
            <div className="relative select-none mb-3">
              <span
                className="font-['Tiny5',monospace] text-6xl sm:text-7xl font-normal leading-none block text-black translate-x-0.75 translate-y-0.75"
                aria-hidden="true"
              >
                AADK
              </span>
              <span className="font-['Tiny5',monospace] text-6xl sm:text-7xl font-normal leading-none block text-[#0876c9] absolute inset-0">
                AADK
              </span>
            </div>
            <p className="font-['Outfit',sans-serif] text-xs sm:text-sm font-medium text-black/90 leading-snug max-w-55 mb-4">
              {t("tagline")}
            </p>
            <span className="font-['Outfit',sans-serif] text-xs font-semibold text-black/80">
              © AADK 2026
            </span>
          </div>

          {/* Column 2: Navigasi Utama */}
          <div>
            <h3 className="font-['Outfit',sans-serif] text-lg sm:text-xl font-bold tracking-wider text-black mb-3 sm:mb-4">
              {t("main")}
            </h3>
            <ul className="flex flex-col gap-2 p-0 m-0 list-none font-['Outfit',sans-serif] text-xs sm:text-sm font-medium">
              {NAV_LINKS.map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="text-black/80 hover:text-black hover:underline transition-colors"
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Layanan & Akun */}
          <div>
            <h3 className="font-['Outfit',sans-serif] text-lg sm:text-xl font-bold tracking-wider text-black mb-3 sm:mb-4">
              {t("services")}
            </h3>
            <ul className="flex flex-col gap-2 p-0 m-0 list-none font-['Outfit',sans-serif] text-xs sm:text-sm font-medium">
              {ACCOUNT_LINKS.map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="text-black/80 hover:text-black hover:underline transition-colors"
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Temukan Kami */}
          <div>
            <h3 className="font-['Outfit',sans-serif] text-lg sm:text-xl font-bold tracking-wider text-black mb-3 sm:mb-4">
              {t("findUs")}
            </h3>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram AADK"
                className="w-8 h-8 rounded-sm overflow-hidden flex items-center justify-center transition-transform hover:scale-110"
              >
                <Image
                  src="/assets/Icons/Instagram icon.svg"
                  alt="Instagram"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain"
                />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook AADK"
                className="w-8 h-8 rounded-sm overflow-hidden flex items-center justify-center transition-transform hover:scale-110"
              >
                <Image
                  src="/assets/Icons/Facebook icon.svg"
                  alt="Facebook"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
