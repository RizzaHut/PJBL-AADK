import { Link } from "@/i18n/navigation";
import Image from "next/image";
import type { Difficulty, EstimatedTime } from "@/lib/console-data";

interface TutorialCardProps {
  consoleId: string;
  tutorialId: string;
  title: string;
  authorName: string;
  difficulty: Difficulty;
  estimatedTime: EstimatedTime;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  mudah: "Mudah",
  sedang: "Sedang",
  sulit: "Sulit",
};

const TIME_LABELS: Record<EstimatedTime, string> = {
  "15_menit": "< 15 menit",
  "30_menit": "15-30 menit",
  "1_jam": "1 jam",
  "2_jam": "2 jam",
  lebih_2_jam: "> 2 jam",
};

export default function TutorialCard({
  consoleId,
  tutorialId,
  title,
  authorName,
  difficulty,
  estimatedTime,
}: TutorialCardProps) {
  const difficultyClass =
    difficulty === "mudah"
      ? "bg-[#b8edc2]"
      : difficulty === "sedang"
        ? "bg-[#f7df8b]"
        : "bg-[#f5a8a8]";

  return (
    <Link
      href={`/consoles/${consoleId}/${tutorialId}`}
      className="group relative block border border-black bg-[#d9d9d9] p-2 transition-transform hover:-translate-y-0.5"
    >
      <span
        className="absolute left-2 top-2 h-2 w-2 rounded-full bg-[#858585]"
        aria-hidden="true"
      />
      <span
        className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#858585]"
        aria-hidden="true"
      />
      <span
        className="absolute bottom-2 left-2 h-2 w-2 rounded-full bg-[#858585]"
        aria-hidden="true"
      />
      <span
        className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-[#858585]"
        aria-hidden="true"
      />
      <div className="flex min-h-24 items-center gap-3 px-3 py-2 sm:gap-4">
        <Image
          src="/assets/Icons/tutorial-card/hardware.svg"
          alt=""
          width={72}
          height={66}
          className="h-16 w-auto shrink-0 object-contain sm:h-18 sm:w-auto"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1 border border-black bg-white px-3 py-3">
          <p className="flex items-center gap-1 text-[10px] text-black/65">
            <Image
              src="/assets/Icons/tutorial-card/person.svg"
              alt=""
              width={12}
              height={12}
              className="h-3 w-auto object-contain"
              aria-hidden="true"
            />
            {authorName}
          </p>
          <h3 className="mt-1 truncate font-['Outfit',sans-serif] text-base font-medium group-hover:underline">
            {title}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-medium">
            <span
              className={`rounded-full border border-black/10 px-2 py-0.5 ${difficultyClass}`}
            >
              {DIFFICULTY_LABELS[difficulty]}
            </span>
            <span className="rounded-full bg-[#e8e8e8] px-2 py-0.5">
              {TIME_LABELS[estimatedTime]}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
