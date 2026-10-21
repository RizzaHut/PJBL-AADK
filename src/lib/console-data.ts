export type ConsoleBrand = "Nintendo" | "Playstation" | "Xbox";
export type ConsoleType =
  | "home_console"
  | "hybrid_console"
  | "handheld_console";
export type Difficulty = "mudah" | "sedang" | "sulit";
export type EstimatedTime =
  | "15_menit"
  | "30_menit"
  | "1_jam"
  | "2_jam"
  | "lebih_2_jam";

export interface ConsoleModelDetail {
  id: string;
  name: string;
  modelId: string;
  releaseYear: number;
  imageUrl: string;
  colorOptions: string[];
  connectivity: string[];
  performance: string[];
  storageMedia: string[];
}

export interface ConsoleTutorialDetail {
  id: string;
  title: string;
  authorName: string;
  difficulty: Difficulty;
  estimatedTime: EstimatedTime;
}

export interface ConsoleDetail {
  id: string;
  name: string;
  brand: ConsoleBrand;
  type: ConsoleType;
  releaseYear: number;
  nickname: string;
  heroImage: string;
  description: string[];
  descriptionImage?: string;
  models: ConsoleModelDetail[];
  tutorials: ConsoleTutorialDetail[];
}

const PS2_MODELS: ConsoleModelDetail[] = [
  {
    id: "ps2-fat",
    name: "PlayStation 2 FAT",
    modelId: "SCPH-10000 / 30000 / 50000",
    releaseYear: 2000,
    imageUrl: "/assets/Console Image/PS-2.png",
    colorOptions: [
      "Matte Black",
      "Ocean Blue",
      "Midnight Blue",
      "Aqua / Metallic Blue",
    ],
    connectivity: [
      "A/V Multi Out",
      "Digital Optical Out",
      "2x Controller Ports",
      "2x Memory Card Slots",
    ],
    performance: [
      "Emotion Engine 294 MHz",
      "32-bit RISC",
      "32 MB RDRAM",
      "4 MB eDRAM",
    ],
    storageMedia: [
      "8 MB Memory Card",
      "Expansion 3.5-inch IDE HDD",
      "CD-ROM & DVD-ROM",
    ],
  },
  {
    id: "ps2-slim",
    name: "PlayStation 2 SLIM",
    modelId: "SCPH-70000 / 75000 / 90000",
    releaseYear: 2004,
    imageUrl: "/assets/Console Image/PS-2.png",
    colorOptions: ["Charcoal Black", "Ceramic White", "Satin Silver"],
    connectivity: [
      "A/V Multi Out",
      "Digital Optical Out",
      "2x Controller Ports",
      "2x Memory Card Slots",
    ],
    performance: [
      "Emotion Engine 294 MHz",
      "32 MB RDRAM",
      "Improved cooling",
      "Compact chassis",
    ],
    storageMedia: [
      "8 MB Memory Card",
      "USB storage support",
      "CD-ROM & DVD-ROM",
    ],
  },
];

const PS2_TUTORIALS: ConsoleTutorialDetail[] = [
  {
    id: "replace-loader",
    title: "Mengganti Loader",
    authorName: "admin",
    difficulty: "mudah",
    estimatedTime: "15_menit",
  },
  {
    id: "replace-hdd",
    title: "Mengganti HDD/SSD",
    authorName: "admin",
    difficulty: "mudah",
    estimatedTime: "15_menit",
  },
  {
    id: "clean-fan",
    title: "Membersihkan Kipas",
    authorName: "admin",
    difficulty: "sedang",
    estimatedTime: "30_menit",
  },
  {
    id: "replace-thermal-paste",
    title: "Mengganti Thermal Paste",
    authorName: "admin",
    difficulty: "sulit",
    estimatedTime: "30_menit",
  },
];

const CONSOLE_DETAILS: ConsoleDetail[] = [
  {
    id: "ps2",
    name: "PlayStation 2",
    brand: "Playstation",
    type: "home_console",
    releaseYear: 2000,
    nickname: "Unmatched Sales",
    heroImage: "/assets/Console Detail Images/PS 2/ps2-hero.png",
    description: [
      "PlayStation 2 (atau disingkat PS2 ) adalah konsol permainan video rumah yang dikembangkan dan dipasarkan oleh Sony Computer Entertainment. Konsol ini pertama kali dirilis di Jepang pada 4 Maret 2000, di Amerika Utara pada 26 Oktober 2000, di Eropa pada 24 November 2000, dan di Australia pada 30 November 2000. Konsol ini adalah penerus dari PlayStation, serta angsuran kedua dari merek konsol PlayStation. Sebagai konsol generasi keenam, PlayStation 2 bersaing dengan GameCube milik Nintendo, Dreamcast milik Sega, dan Xbox milik Microsoft. Konsol ini adalah konsol permainan terlaris sepanjang masa, telah terjual lebih dari 155 juta unit di seluruh dunia","Diumumkan pada tahun 1999, Sony mulai mengembangkan konsol tersebut setelah sukses besar dari pendahulunya. PlayStation 2 menawarkan kompatibilitas mundur untuk pengontrol DualShock 1 seperti pendahulunya, PlayStation 1, serta permainan videonya","PlayStation 2 menerima pujian kritis yang meluas saat dirilis. Sebanyak lebih dari 4.000 judul permainan dirilis di seluruh dunia, dengan lebih dari 1,5 miliar eksemplar terjual.[19] Pada tahun 2004, Sony merilis versi konsol PlayStation 2 yang lebih kecil dan lebih ringan, yaitu dikenal sebagai PS2 Slim. Bahkan setelah rilis penerusnya, PlayStation 3, konsol tersebut tetap populer hingga generasi ketujuh. PlayStation 2 terus diproduksi hingga awal 2013 ketika Sony akhirnya mengumumkan bahwa konsol tersebut telah dihentikan setelah lebih dari dua belas tahun produksi, salah satu masa hidup terlama dari konsol permainan video mana pun. Permainan baru untuk konsol tersebut terus dirilis hingga sedikit demi sedikit setelah masa pakainya berakhir dan dukungan dari Sony.",
    ],
    descriptionImage:
      "/assets/Console Detail Images/PS 2/ps2-desc-launch-day.png",
    models: PS2_MODELS,
    tutorials: PS2_TUTORIALS,
  },
  {
    id: "ps3",
    name: "PlayStation 3",
    brand: "Playstation",
    type: "home_console",
    releaseYear: 2006,
    nickname: "The Cell Machine",
    heroImage: "/assets/Console Image/PS-3.png",
    description: [
      "PlayStation 3 membawa pengalaman bermain game HD, Blu-ray, dan konektivitas online ke ruang keluarga. Arsitektur Cell Broadband Engine membuatnya unik sekaligus menantang bagi pengembang.",
      "Halaman detail ini memakai data fallback lokal sampai konten console tersedia sepenuhnya di database.",
    ],
    models: [
      {
        id: "ps3-fat",
        name: "PlayStation 3 FAT",
        modelId: "CECHA / CECHB",
        releaseYear: 2006,
        imageUrl: "/assets/Console Image/PS-3.png",
        colorOptions: ["Piano Black", "Ceramic White"],
        connectivity: ["HDMI", "Bluetooth", "USB 2.0"],
        performance: ["Cell Broadband Engine", "256 MB XDR RAM"],
        storageMedia: ["2.5-inch SATA HDD", "Blu-ray Disc"],
      },
    ],
    tutorials: [],
  },
];

export function getConsoleDetail(consoleId: string): ConsoleDetail | undefined {
  return CONSOLE_DETAILS.find((console) => console.id === consoleId);
}
