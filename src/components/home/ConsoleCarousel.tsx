"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import ConsoleCard, {
  ConsoleCardProps,
} from "@/components/shared/cards/ConsoleCard";
import CarouselArrowButton from "@/components/shared/controls/CarouselArrowButton";

export interface ConsoleCarouselProps {
  consoles?: ConsoleCardProps[];
  onCardClick?: (consoleId: string) => void;
  className?: string;
}

const DEFAULT_CONSOLES: ConsoleCardProps[] = [
  {
    name: "Nintendo Wii",
    brand: "Nintendo",
    year: 2006,
    type: "home_console",
    imageUrl: "/assets/Console Image/Nintendo-Wii.png",
  },
  {
    name: "Xbox 360",
    brand: "Xbox",
    year: 2005,
    type: "home_console",
    imageUrl: "/assets/Console Image/Xbox-360.jpg",
  },
  {
    name: "PlayStation 2",
    brand: "Playstation",
    year: 2000,
    type: "home_console",
    imageUrl: "/assets/Console Image/PS-2.png",
  },
  {
    name: "Xbox",
    brand: "Xbox",
    year: 2001,
    type: "home_console",
    imageUrl: "/assets/Console Image/Xbox.png",
  },
  {
    name: "PlayStation 3",
    brand: "Playstation",
    year: 2006,
    type: "home_console",
    imageUrl: "/assets/Console Image/PS-3.png",
  },
  {
    name: "Nintendo GameCube",
    brand: "Nintendo",
    year: 2001,
    type: "home_console",
    imageUrl: "/assets/Console Image/Nintendo-GameCube.png",
  },
  {
    name: "Nintendo Switch",
    brand: "Nintendo",
    year: 2017,
    type: "hybrid_console",
    imageUrl: "/assets/Console Image/Nintendo-Switch.webp",
  },
];

export default function ConsoleCarousel({
  consoles = DEFAULT_CONSOLES,
  onCardClick,
  className = "",
}: ConsoleCarouselProps) {
  const t = useTranslations("home");
  const [activeIndex, setActiveIndex] = useState(2);

  const prev = () => {
    setActiveIndex(
      (current) => (current - 1 + consoles.length) % consoles.length,
    );
  };

  const next = () => {
    setActiveIndex((current) => (current + 1) % consoles.length);
  };

  const getItem = (offset: number) => {
    return consoles[(activeIndex + offset + consoles.length) % consoles.length];
  };

  const farLeft = getItem(-2);
  const nearLeft = getItem(-1);
  const active = getItem(0);
  const nearRight = getItem(1);
  const farRight = getItem(2);

  return (
    <section
      className={`relative w-full py-16 sm:py-24 bg-white overflow-hidden ${className}`}
      aria-label={t("consoleSection.ariaLabel")}
    >
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2
          className="font-['Outfit',sans-serif] text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide text-black mb-24 sm:mb-28"
          style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
        >
          {t("consoleSection.title")}
        </h2>

        <div className="relative flex items-center justify-center lg:grid lg:grid-cols-[minmax(0,1fr)_auto_auto_auto_minmax(0,1fr)] lg:items-center">
          <div className="hidden lg:flex items-center justify-self-center gap-4 p-4 bg-[#f4f4f4] rounded-xl border border-dashed border-black/60 shadow-sm opacity-90">
            <ConsoleCard
              {...farLeft}
              active={false}
              onClick={() =>
                setActiveIndex(
                  (current) =>
                    (current - 2 + consoles.length) % consoles.length,
                )
              }
            />
            <ConsoleCard
              {...nearLeft}
              active={false}
              onClick={() =>
                setActiveIndex(
                  (current) =>
                    (current - 1 + consoles.length) % consoles.length,
                )
              }
            />
          </div>

          <div className="absolute left-4 sm:left-[calc(50%-240px)] z-30 top-1/2 -translate-y-1/2 lg:static lg:translate-y-0">
            <CarouselArrowButton
              direction="left"
              onClick={prev}
              ariaLabel={t("controls.previous")}
            />
          </div>

          <div className="relative z-20 flex justify-center transform transition-transform duration-300 lg:justify-self-center">
            <ConsoleCard
              {...active}
              active={true}
              onClick={() => onCardClick?.(active.name)}
            />
          </div>

          <div className="absolute right-4 sm:right-[calc(50%-240px)] z-30 top-1/2 -translate-y-1/2 lg:static lg:translate-y-0">
            <CarouselArrowButton
              direction="right"
              onClick={next}
              ariaLabel={t("controls.next")}
            />
          </div>

          {/* Right Side Group (clipped & dashed box style like figma) */}
          <div className="hidden lg:flex items-center justify-self-center gap-4 p-4 bg-[#f4f4f4] rounded-xl border border-dashed border-black/60 shadow-sm opacity-90">
            <ConsoleCard
              {...nearRight}
              active={false}
              onClick={() =>
                setActiveIndex((current) => (current + 1) % consoles.length)
              }
            />
            <ConsoleCard
              {...farRight}
              active={false}
              onClick={() =>
                setActiveIndex((current) => (current + 2) % consoles.length)
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
