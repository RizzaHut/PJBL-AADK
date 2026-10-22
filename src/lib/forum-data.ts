import type { ForumPostCardProps } from "@/components/forum/ForumPostCard";

export interface ForumComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  content: string;
}

export interface ForumPostDetail extends ForumPostCardProps {
  content: string[];
  contentImage?: string;
  commentsData: ForumComment[];
}

const BASE_POSTS: ForumPostCardProps[] = [
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

const DETAIL_CONTENT: Record<string, string[]> = {
  "psn-error": [
    "Cuma mau ngingetin temen-temen di sini biar gak tergiur harga game murah di e-commerce. Bulan lalu temen gue nekat beli game PS5 pake sistem sharing account yang murah itu.",
    "Eh kemarin konsolnya langsung kena permanently banned sama Sony gara-gara akunnya indikasi fraud. Mending murni beli di PS Store resmi atau beli kaset fisiknya aja deh biar aman!",
  ],
  "microsd-switch": [
    "Kalau MicroSD di Switch terus minta diformat, jangan langsung panik atau format berulang kali. Cek dulu kapasitas dan tipe kartu yang dipakai.",
    "Beberapa kartu yang tidak kompatibel bisa terbaca sebentar lalu kembali meminta format. Backup data sebelum mencoba langkah berikutnya.",
  ],
};

const DETAIL_COMMENTS: Record<string, ForumComment[]> = {
  "psn-error": [
    {
      id: "comment-1",
      authorName: "Cyber_Knight88",
      createdAt: "2 Menit yang lalu",
      content:
        "Info bagus nih buat pengingat wkwk. Banyak gamer baru yang belum paham bedanya akun primary/secondary sama lisensi resmi, mikirnya yang penting dapat game murah.",
    },
    {
      id: "comment-2",
      authorName: "beban_tim_304",
      createdAt: "1 Jam yang lalu",
      content:
        "Info bagus nih buat pengingat wkwk. Banyak gamer baru yang belum paham bedanya akun primary/secondary sama lisensi resmi, mikirnya yang penting dapat game murah.",
    },
  ],
};

const DEFAULT_COMMENTS: ForumComment[] = [
  {
    id: "comment-default-1",
    authorName: "Cyber_Knight88",
    createdAt: "2 Menit yang lalu",
    content:
      "Terima kasih sudah berbagi. Info seperti ini membantu banget buat yang baru mulai memahami masalah konsol.",
  },
  {
    id: "comment-default-2",
    authorName: "beban_tim_304",
    createdAt: "1 Jam yang lalu",
    content:
      "Setuju, sebaiknya cek pengalaman pengguna lain dulu sebelum membeli atau mencoba solusi yang belum jelas.",
  },
];

export const FORUM_POSTS: ForumPostCardProps[] = BASE_POSTS;

export function getForumPostDetail(postId: string): ForumPostDetail | null {
  const post = BASE_POSTS.find((item) => item.id === postId);
  if (!post) return null;

  return {
    ...post,
    content: DETAIL_CONTENT[post.id] ?? [post.excerpt],
    contentImage: post.thumbnail,
    commentsData: DETAIL_COMMENTS[post.id] ?? DEFAULT_COMMENTS,
  };
}

export function getTrendingPosts(): ForumPostCardProps[] {
  return BASE_POSTS.slice(0, 4);
}
