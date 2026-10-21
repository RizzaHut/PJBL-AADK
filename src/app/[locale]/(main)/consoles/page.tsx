"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Outfit, Tiny5 } from "next/font/google";
import { useRouter } from "@/i18n/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PixelBorder from "@/components/shared/borders/PixelBorder";
import type { ConsoleCardProps } from "@/components/shared/cards/ConsoleCard";
import SharedConsoleCard from "@/components/shared/cards/ConsoleCard";
import ConsoleFilterSidebar from "@/components/consoles/ConsoleFilterSidebar";
import Pagination from "@/components/shared/controls/Pagination";

const tiny5 = Tiny5({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-tiny5",
});
const outfit = Outfit({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-outfit",
});

const CONSOLES = [
  [
    "ps3",
    "PlayStation 3",
    "Playstation",
    "home_console",
    2006,
    "/assets/Console Image/PS-3.png",
  ],
  [
    "wii",
    "Wii",
    "Nintendo",
    "home_console",
    2006,
    "/assets/Console Image/Nintendo-Wii.png",
  ],
  [
    "xbox",
    "Xbox",
    "Xbox",
    "home_console",
    2001,
    "/assets/Console Image/Xbox.png",
  ],
  [
    "ps2",
    "PlayStation 2",
    "Playstation",
    "home_console",
    2000,
    "/assets/Console Image/PS-2.png",
  ],
  [
    "switch",
    "Switch",
    "Nintendo",
    "hybrid_console",
    2017,
    "/assets/Console Image/Nintendo-Switch.webp",
  ],
  [
    "xbox360",
    "Xbox 360",
    "Xbox",
    "home_console",
    2005,
    "/assets/Console Image/Xbox-360.jpg",
  ],
  [
    "ps4",
    "PlayStation 4",
    "Playstation",
    "home_console",
    2013,
    "/assets/Console Image/PS-4.jpg",
  ],
  [
    "wii-u",
    "Wii U",
    "Nintendo",
    "home_console",
    2012,
    "/assets/Console Image/Nintendo-Wii.png",
  ],
  [
    "xbox-one",
    "Xbox One",
    "Xbox",
    "home_console",
    2013,
    "/assets/Console Image/Xbox-One.jpg",
  ],
  [
    "gamecube",
    "GameCube",
    "Nintendo",
    "home_console",
    2001,
    "/assets/Console Image/Nintendo-GameCube.png",
  ],
  [
    "xbox-series",
    "Xbox Series",
    "Xbox",
    "home_console",
    2020,
    "/assets/Console Image/Xbox-Series.webp",
  ],
] as const;

const PAGE_SIZE = 8;

export default function ConsolesPage() {
  const router = useRouter();
  const t = useTranslations("consoles");
  const [query, setQuery] = useState("");
  const [brands, setBrands] = useState<ConsoleCardProps["brand"][]>([]);
  const [types, setTypes] = useState<ConsoleCardProps["type"][]>([]);
  const [yearRange, setYearRange] = useState<[number, number]>([1992, 2026]);
  const [page, setPage] = useState(1);

  const filteredConsoles = CONSOLES.filter(([, name, brand, type, year]) => {
    const matchesQuery = name.toLowerCase().includes(query.toLowerCase());
    const matchesBrand = brands.length === 0 || brands.includes(brand);
    const matchesType = types.length === 0 || types.includes(type);
    return (
      matchesQuery &&
      matchesBrand &&
      matchesType &&
      year >= yearRange[0] &&
      year <= yearRange[1]
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredConsoles.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const visibleConsoles = filteredConsoles.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const updateQuery = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const updateBrands = (value: ConsoleCardProps["brand"]) => {
    setBrands((current) =>
      current.includes(value)
        ? current.filter((brand) => brand !== value)
        : [...current, value],
    );
    setPage(1);
  };

  const updateTypes = (value: ConsoleCardProps["type"]) => {
    setTypes((current) =>
      current.includes(value)
        ? current.filter((type) => type !== value)
        : [...current, value],
    );
    setPage(1);
  };

  const resetFilters = () => {
    setBrands([]);
    setTypes([]);
    setYearRange([1992, 2026]);
    setQuery("");
    setPage(1);
  };

  return (
    <main
      className={`${tiny5.variable} ${outfit.variable} min-h-screen bg-white text-black font-['Outfit',sans-serif]`}
    >
      <section className="relative min-h-115 overflow-hidden bg-[#82c3f8] px-4 pb-12 pt-4 sm:min-h-130 sm:px-6 sm:pb-16 sm:pt-6">
        <Navbar floating />
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center pt-28 text-center sm:pt-32">
          <h1 className="font-['Tiny5',monospace] text-7xl leading-none tracking-[0.08em] text-[#0876c9] drop-shadow-[5px_5px_0_#000] sm:text-9xl">
            {t("title")}
          </h1>
          <label className="mt-12 flex w-full max-w-140 items-center gap-3 rounded-md border-2 border-black bg-white px-4 py-3 text-left shadow-[2px_2px_0_#000]">
            <span aria-hidden="true" className="text-lg">
              ⌕
            </span>
            <span className="sr-only">{t("srSearch")}</span>
            <input
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder={t("placeholder")}
              className="w-full bg-transparent text-sm outline-none placeholder:text-black/55"
            />
          </label>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <PixelBorder direction="horizontal" color="#ffffff" />
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 sm:py-16 lg:flex-row lg:gap-10">
        <ConsoleFilterSidebar
          brands={brands}
          types={types}
          yearRange={yearRange}
          onBrandToggle={updateBrands}
          onTypeToggle={updateTypes}
          onYearRangeChange={(range) => {
            setYearRange(range);
            setPage(1);
          }}
          onReset={resetFilters}
        />
        <div className="min-w-0 flex-1">
          {visibleConsoles.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
              {visibleConsoles.map(
                ([id, name, brand, type, year, imageUrl]) => (
                  <SharedConsoleCard
                    key={id}
                    name={name}
                    brand={brand}
                    type={type}
                    year={year}
                    imageUrl={imageUrl}
                    active={false}
                    className="mx-auto w-[min(220px,42vw)]!"
                    onClick={() => router.push(`/consoles/${id}`)}
                  />
                ),
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-black/50 bg-white px-6 py-16 text-center">
              <h3 className="text-xl font-bold">{t("notFoundTitle")}</h3>
              <p className="mt-2 text-sm text-black/65">
                {t("notFoundDescription")}
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 border-2 border-black bg-[#f4c542] px-4 py-2 text-sm font-bold shadow-[2px_2px_0_#000]"
              >
                {t("resetFilters")}
              </button>
            </div>
          )}
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </section>
      <Footer />
    </main>
  );
}
