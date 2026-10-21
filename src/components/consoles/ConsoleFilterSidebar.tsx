"use client";

import { useTranslations } from "next-intl";
import type { ConsoleCardProps } from "@/components/shared/cards/ConsoleCard";

interface ConsoleFilterSidebarProps {
  brands: ConsoleCardProps["brand"][];
  types: ConsoleCardProps["type"][];
  yearRange: [number, number];
  onBrandToggle: (brand: ConsoleCardProps["brand"]) => void;
  onTypeToggle: (type: ConsoleCardProps["type"]) => void;
  onYearRangeChange: (range: [number, number]) => void;
  onReset: () => void;
}

const brands: {
  value: ConsoleCardProps["brand"];
  label: string;
  color: string;
}[] = [
  { value: "Nintendo", label: "Nintendo", color: "bg-[#ed0011] text-white" },
  {
    value: "Playstation",
    label: "PlayStation",
    color: "bg-[#0876c9] text-white",
  },
  { value: "Xbox", label: "Xbox", color: "bg-[#107c10] text-white" },
];

const types: { value: ConsoleCardProps["type"]; label: string }[] = [
  { value: "home_console", label: "Home Console" },
  { value: "hybrid_console", label: "Hybrid Console" },
  { value: "handheld_console", label: "Handheld Console" },
];

export default function ConsoleFilterSidebar({
  brands: selectedBrands,
  types: selectedTypes,
  yearRange,
  onBrandToggle,
  onTypeToggle,
  onYearRangeChange,
  onReset,
}: ConsoleFilterSidebarProps) {
  const t = useTranslations("consoles");

  return (
    <aside
      className="h-fit w-full shrink-0 rounded-lg border border-black bg-white p-4 sm:p-5 lg:w-61.25"
      aria-label={t("sidebar.filterBy")}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="whitespace-nowrap text-xl font-semibold">
          {t("sidebar.filterBy")}
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-bold underline"
        >
          {t("sidebar.reset")}
        </button>
      </div>
      <fieldset className="mt-4 border-t border-black/50 pt-3">
        <legend className="relative z-10 mb-1 flex items-center gap-2 bg-white px-1 text-sm font-semibold">
          <img
            src="/assets/Icons/Chevron.svg"
            alt=""
            className="h-3 w-3 rotate-180"
          />
          {t("sidebar.brand")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <button
              key={brand.value}
              type="button"
              aria-pressed={selectedBrands.includes(brand.value)}
              onClick={() => onBrandToggle(brand.value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ring-offset-2 transition ${brand.color} ${selectedBrands.includes(brand.value) ? "ring-2 ring-black" : "opacity-85 hover:opacity-100"}`}
            >
              {brand.label}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-4 border-t border-black/50 pt-3">
        <legend className="relative z-10 mb-1 flex items-center gap-2 bg-white px-1 text-sm font-semibold">
          <img
            src="/assets/Icons/Chevron.svg"
            alt=""
            className="h-3 w-3 rotate-180"
          />
          {t("sidebar.consoleType")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <button
              key={type.value}
              type="button"
              aria-pressed={selectedTypes.includes(type.value)}
              onClick={() => onTypeToggle(type.value)}
              className={`rounded-full bg-[#e8e8e8] px-3 py-1 text-xs font-semibold text-[#334155] ring-offset-2 ${selectedTypes.includes(type.value) ? "ring-2 ring-black" : "hover:bg-[#d9d9d9]"}`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-4 border-t border-black/50 pt-3">
        <legend className="relative z-10 mb-1 flex items-center gap-2 bg-white px-1 text-sm font-semibold">
          <img
            src="/assets/Icons/Chevron.svg"
            alt=""
            className="h-3 w-3 rotate-180"
          />
          {t("sidebar.releaseYear")}
        </legend>
        <div className="space-y-3 text-xs font-semibold">
          <div>
            <span className="block">{t("sidebar.fromYear")}</span>
            <span className="mt-1 block">{yearRange[0]}</span>
          </div>
          <input
            aria-label={t("sidebar.minYear")}
            type="range"
            min="1992"
            max="2026"
            value={yearRange[0]}
            onChange={(event) =>
              onYearRangeChange([
                Math.min(Number(event.target.value), yearRange[1]),
                yearRange[1],
              ])
            }
            className="w-full accent-black"
          />
          <div>
            <span className="block">{t("sidebar.toYear")}</span>
            <span className="mt-1 block">{yearRange[1]}</span>
          </div>
          <input
            aria-label={t("sidebar.maxYear")}
            type="range"
            min="1992"
            max="2026"
            value={yearRange[1]}
            onChange={(event) =>
              onYearRangeChange([
                yearRange[0],
                Math.max(Number(event.target.value), yearRange[0]),
              ])
            }
            className="w-full accent-black"
          />
        </div>
      </fieldset>
    </aside>
  );
}
