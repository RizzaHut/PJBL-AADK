import type { Difficulty, EstimatedTime } from "@/lib/console-data";

export interface TutorialStepDetail {
  number: number;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  imageUrls?: string[];
}

export interface TutorialCommentDetail {
  id: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  content: string;
}

export interface TutorialDetail {
  id: string;
  consoleId: string;
  consoleName: string;
  title: string;
  authorName: string;
  date: string;
  difficulty: Difficulty;
  estimatedTime: EstimatedTime;
  tools: string[];
  materials: string[];
  warnings: string[];
  tips: string[];
  steps: TutorialStepDetail[];
  comments: TutorialCommentDetail[];
}

const TUTORIAL_DETAILS: TutorialDetail[] = [
  {
    id: "replace-hdd",
    consoleId: "ps2",
    consoleName: "PlayStation 2",
    title: "Mengganti HDD / SSD",
    authorName: "admin",
    date: "2026-09-03",
    difficulty: "mudah",
    estimatedTime: "15_menit",
    tools: ["Obeng Phillips", "Obeng minus kecil", "Pinset"],
    materials: ["HDD atau SSD 2,5 inci", "Network adapter PS2", "HDD bracket"],
    warnings: [
      "Matikan konsol dan cabut semua kabel sebelum membuka casing.",
      "Jangan menyentuh konektor dengan tangan basah atau berminyak.",
      "Pastikan ukuran drive sesuai dengan adapter yang digunakan.",
    ],
    tips: [
      "Simpan sekrup dalam wadah kecil agar tidak tertukar.",
      "Buat cadangan data sebelum memindahkan drive lama.",
    ],
    steps: [
      {
        number: 1,
        title: "Matikan dan siapkan PlayStation 2",
        paragraphs: [
          "Matikan konsol, cabut kabel daya dan kabel video, lalu letakkan konsol di permukaan yang rata dan bersih.",
        ],
        bullets: [
          "Lepaskan memory card dan controller.",
          "Tunggu beberapa menit sebelum membuka cover expansion bay.",
        ],
      },
      {
        number: 2,
        title: "Lepaskan network adapter",
        paragraphs: [
          "Buka dua sekrup pengunci pada network adapter menggunakan obeng Phillips. Tarik adapter perlahan agar konektor di bagian belakang tidak rusak.",
        ],
        imageUrls: [
          "/assets/Console Detail Images/PS 2/ps2-desc-launch-day.png",
        ],
      },
      {
        number: 3,
        title: "Pasang drive baru pada bracket",
        paragraphs: [
          "Pasang HDD atau SSD ke bracket dengan posisi konektor menghadap ke arah adapter. Kencangkan sekrup secukupnya dan hindari tekanan berlebih.",
        ],
      },
      {
        number: 4,
        title: "Hubungkan drive ke adapter",
        paragraphs: [
          "Hubungkan drive ke konektor network adapter sampai seluruh pin masuk dengan lurus. Periksa kembali posisi drive sebelum memasukkannya ke konsol.",
        ],
      },
      {
        number: 5,
        title: "Masukkan adapter ke expansion bay",
        paragraphs: [
          "Geser adapter secara perlahan ke dalam expansion bay. Jangan memaksa jika terasa tertahan karena konektor belum sejajar.",
        ],
      },
      {
        number: 6,
        title: "Kencangkan kembali sekrup",
        paragraphs: [
          "Kencangkan dua sekrup pengunci adapter, lalu pastikan tidak ada celah besar di antara adapter dan bodi konsol.",
        ],
      },
      {
        number: 7,
        title: "Nyalakan dan periksa drive",
        paragraphs: [
          "Pasang kembali kabel konsol dan nyalakan PlayStation 2. Pastikan drive terdeteksi sebelum melanjutkan proses format atau instalasi sistem.",
        ],
      },
    ],
    comments: [
      {
        id: "comment-1",
        authorName: "Cyber_Knight88",
        createdAt: "2 hari yang lalu",
        content:
          "Tutorialnya membantu. Pastikan drive terpasang lurus supaya konektornya tidak bengkok.",
      },
      {
        id: "comment-2",
        authorName: "beban_tim_304",
        createdAt: "1 hari yang lalu",
        content:
          "Berhasil mengganti HDD di PS2 saya. Langkahnya mudah diikuti.",
      },
    ],
  },
];

export function getTutorialDetail(
  consoleId: string,
  tutorialId: string,
): TutorialDetail | undefined {
  return TUTORIAL_DETAILS.find(
    (tutorial) =>
      tutorial.consoleId === consoleId && tutorial.id === tutorialId,
  );
}
