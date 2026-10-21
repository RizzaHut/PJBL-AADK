"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import Navbar, { NavUser } from "@/components/layout/Navbar";
import PixelBorder from "@/components/shared/borders/PixelBorder";

export interface HeroSlide {
  heading?: string;
  subtext?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface HeroCarouselProps {
  slides?: HeroSlide[];
  user?: NavUser | null;
  className?: string;
}

export default function HeroCarousel({
  slides,
  user,
  className = "",
}: HeroCarouselProps) {
  const t = useTranslations("home");
  const DEFAULT_SLIDES: HeroSlide[] = [
    {
      heading: t("hero.slides.0.heading"),
      subtext: t("hero.copyright"),
    },
    {
      heading: t("hero.slides.1.heading"),
      subtext: t("hero.copyright"),
    },
    {
      heading: t("hero.slides.2.heading"),
      subtext: t("hero.copyright"),
    },
  ];
  const resolvedSlides = slides ?? DEFAULT_SLIDES;
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <section
      className={`relative w-full bg-[#82c3f8] pt-4 sm:pt-6 pb-12 sm:pb-16 flex flex-col justify-between overflow-hidden min-h-115 sm:min-h-130 ${className}`}
      aria-label={t("hero.ariaLabel")}
    >
      {/* Floating Navbar in Top Right */}
      <Navbar user={user} floating={true} />

      {/* Main Hero Content (Logo + Tagline) */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-4 w-full mt-12 sm:mt-16">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 text-center md:text-left">
          {/* AADK Pixel Logo with 3D Shadow */}
          <div className="relative select-none shrink-0">
            <span
              className="font-['Tiny5',monospace] text-8xl sm:text-9xl md:text-[145px] font-normal leading-none tracking-tight block text-black translate-x-1.25 translate-y-1.25 sm:translate-x-1.5 sm:translate-y-1.5"
              aria-hidden="true"
            >
              AADK
            </span>
            <span className="font-['Tiny5',monospace] text-8xl sm:text-9xl md:text-[145px] font-normal leading-none tracking-tight block text-[#0876c9] absolute inset-0">
              AADK
            </span>
          </div>

          <div className="max-w-80 sm:max-w-85 pt-2">
            <p className="font-['Outfit',sans-serif] text-base sm:text-lg md:text-[19px] font-medium text-black leading-snug mb-3">
              {resolvedSlides[activeSlide]?.heading ||
                t("hero.slides.0.heading")}
            </p>
            <span className="font-['Outfit',sans-serif] text-sm sm:text-base font-semibold text-black/90">
              {resolvedSlides[activeSlide]?.subtext || t("hero.copyright")}
            </span>
          </div>
        </div>

        <div
          className="flex items-center gap-2.5 mt-10 sm:mt-12"
          role="tablist"
        >
          {resolvedSlides.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={activeSlide === index}
              aria-label={t("hero.slideAria", { index: index + 1 })}
              onClick={() => setActiveSlide(index)}
              className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                activeSlide === index
                  ? "bg-[#087bc8] scale-110 ring-2 ring-[#087bc8]/40"
                  : "bg-[#6d9bc2] hover:bg-[#5287b4]"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 w-full z-10">
        <PixelBorder direction="horizontal" color="#ffffff" />
      </div>
    </section>
  );
}
