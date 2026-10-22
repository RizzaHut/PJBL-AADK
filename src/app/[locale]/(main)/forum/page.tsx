"use client";

import { useDeferredValue, useState } from "react";
import { useTranslations } from "next-intl";
import { Outfit, Tiny5 } from "next/font/google";
import { useRouter } from "@/i18n/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PixelBorder from "@/components/shared/borders/PixelBorder";
import Pagination from "@/components/shared/controls/Pagination";
import ForumPostCard, {
  type ForumPostCardProps,
} from "@/components/forum/ForumPostCard";
import TrendingPostCard from "@/components/forum/TrendingPostCard";
import ForumFilterSidebar, {
  type ForumFilters,
} from "@/components/forum/ForumFilterSidebar";

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

const POSTS: ForumPostCardProps[] = [
  {
    id: "microsd-switch",
    title: "MicroSD Gak Kedetek di Switch, Disuruh Format Terus",
    excerpt:
      "MicroSD baru tidak terbaca? Coba cek format dan kompatibilitas kartu sebelum melakukan format ulang.",
    tags: ["Storage & Memory"],
    brand: "Nintendo",
    console: "Switch",
    topic: "Storage & Memory",
    authorName: "Cyber_Knight88",
    likes: 32,
    comments: 15,
    readers: 184,
    createdAt: "3 jam yang lalu",
    thumbnail: "/assets/Forum Post Images/forum-post-image-microsd switch.jpg",
    accentColor: "red",
    crtColor: "orange",
  },
  {
    id: "wii-controller",
    title: "Controller Wii Sama Wii U Beda???",
    excerpt:
      "Mau beli controller tambahan untuk Wii. Apakah controller Wii U bisa langsung dipakai?",
    tags: ["Accessories & Controller"],
    brand: "Nintendo",
    console: "Wii & Wii U",
    topic: "Accessories & Controller",
    authorName: "PixelHunter-21",
    likes: 10,
    comments: 4,
    readers: 96,
    createdAt: "7 jam yang lalu",
    thumbnail:
      "/assets/Forum Post Images/forum-post-image-rare controller ps 2.jpg",
    accentColor: "green",
    crtColor: "green",
  },
  {
    id: "gamecube-display",
    title: "Bikin Tampilan GameCube Bening di TV LED/Smart TV Pakai Apa?",
    excerpt:
      "Minta rekomendasi converter yang minim lag untuk GameCube agar tampilan tetap tajam di TV modern.",
    tags: ["Hardware & Technical"],
    brand: "Nintendo",
    console: "Gamecube",
    topic: "Hardware & Technical",
    authorName: "SobaltAFK_",
    likes: 17,
    comments: 8,
    readers: 132,
    createdAt: "Kemarin",
    thumbnail:
      "/assets/Forum Post Images/forum-post-image-gamecube in smart tv.jpg",
    accentColor: "blue",
    crtColor: "blue",
  },
  {
    id: "ps3-cfw",
    title: "Mending Racikan PS3 CFW Apa PS3 HEN Sih Buat Main Santai?",
    excerpt:
      "Aku baru punya PS3 dan masih bingung memilih CFW atau HEN untuk kebutuhan bermain harian.",
    tags: ["Software & System"],
    brand: "Playstation",
    console: "Playstation 3",
    topic: "Software & System",
    authorName: "mos_santuy123",
    likes: 25,
    comments: 13,
    readers: 208,
    createdAt: "Kemarin",
    thumbnail: "/assets/Forum Post Images/forum-post-image-ps3 fat.webp",
    accentColor: "green",
    crtColor: "green",
  },
  {
    id: "third-party-controller",
    title:
      "Mending Beli Controller Third-Party Apa Tetep Pakai yang Ori Konsol?",
    excerpt:
      "Penasaran dengan pengalaman kalian memakai controller pihak ketiga untuk sesi bermain panjang.",
    tags: ["Accessories & Controller"],
    brand: "Playstation",
    console: "Playstation 3",
    topic: "Accessories & Controller",
    authorName: "SantaDulu.id",
    likes: 32,
    comments: 13,
    readers: 88,
    createdAt: "2 hari yang lalu",
    thumbnail:
      "/assets/Forum Post Images/forum-post-image-rare controller ps 2.jpg",
    accentColor: "red",
    crtColor: "orange",
  },
  {
    id: "xbox-loss",
    title: "Stik Xbox Series Sering Loss Connection Pas Lagi Main",
    excerpt:
      "Permisi mau nanya, apakah Xbox Series punya masalah koneksi controller yang sering terputus?",
    tags: ["Hardware & Technical"],
    brand: "Xbox",
    console: "Xbox Series",
    topic: "Hardware & Technical",
    authorName: "beban_tim_304",
    likes: 12,
    comments: 6,
    readers: 71,
    createdAt: "3 hari yang lalu",
    thumbnail: "/assets/Forum Post Images/forum-post-image-ps3 fat.webp",
    accentColor: "blue",
    crtColor: "green",
  },
  {
    id: "wii-loading",
    title:
      "Pakai Adapter Swiss + MicroSD di GameCube Ngaruh ke Loading Game Gak?",
    excerpt:
      "Sudah beberapa kali mencoba setup ini, tetapi masih ingin memastikan dampaknya terhadap waktu loading.",
    tags: ["Storage & Memory"],
    brand: "Nintendo",
    console: "Gamecube",
    topic: "Storage & Memory",
    authorName: "KopilHitam21",
    likes: 5,
    comments: 21,
    readers: 64,
    createdAt: "4 hari yang lalu",
    thumbnail: "/assets/Forum Post Images/forum-post-image-microsd switch.jpg",
    accentColor: "green",
    crtColor: "orange",
  },
  {
    id: "psn-error",
    title:
      "Hati-Hati Beli Akun PSN Primary/Secondary Murah, Kena Banned Konsol!",
    excerpt:
      "Berbagi pengalaman supaya teman-teman tidak tertipu akun murah yang tidak jelas asalnya.",
    tags: ["General"],
    brand: "Playstation",
    console: "Playstation 3",
    topic: "General",
    authorName: "RizaaHefi",
    likes: 4,
    comments: 58,
    readers: 246,
    createdAt: "5 hari yang lalu",
    thumbnail: "/assets/Forum Post Images/forum-post-image-ps3 fat.webp",
    accentColor: "red",
    crtColor: "green",
  },
];

const DEFAULT_FILTERS: ForumFilters = {
  topic: "all",
  sort: "latest",
};
const PAGE_SIZE = 6;

export default function ForumPage() {
  const router = useRouter();
  const t = useTranslations("forum");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<ForumFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);

  const filteredPosts = POSTS.filter((post) => {
    const searchable =
      `${post.title} ${post.excerpt} ${post.topic}`.toLowerCase();
    return (
      searchable.includes(deferredQuery.toLowerCase()) &&
      (filters.topic === "all" || post.topic === filters.topic)
    );
  }).sort((first, second) => {
    if (filters.sort === "popular") return second.likes - first.likes;
    if (filters.sort === "comments") return second.comments - first.comments;
    if (filters.sort === "readers") return second.readers - first.readers;
    return POSTS.indexOf(first) - POSTS.indexOf(second);
  });

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visiblePosts = filteredPosts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const trendingPosts = POSTS.slice(0, 4);

  const updateQuery = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const updateFilter = (key: keyof ForumFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setQuery("");
    setPage(1);
  };

  return (
    <main
      className={`${tiny5.variable} ${outfit.variable} min-h-screen bg-white font-['Outfit',sans-serif] text-black`}
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

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="border border-black bg-white p-4 sm:p-6">
          <h2 className="text-3xl font-semibold">{t("trending")}</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trendingPosts.map((post) => (
              <TrendingPostCard
                key={post.id}
                post={post}
                onClick={() => router.push(`/forum/${post.id}`)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-7 px-4 pb-16 sm:px-6 lg:flex-row">
        <ForumFilterSidebar
          filters={filters}
          onChange={updateFilter}
          onReset={resetFilters}
        />
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">{t("postHeading")}</h2>
            <span className="text-xs font-semibold text-black/55">
              {t("count", { count: filteredPosts.length })}
            </span>
          </div>
          {visiblePosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-5 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
              {visiblePosts.map((post) => (
                <ForumPostCard key={post.id} {...post} />
              ))}
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
