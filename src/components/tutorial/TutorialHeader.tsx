"use client";

import { useTranslations } from "next-intl";

interface TutorialHeaderProps {
  title: string;
  authorName: string;
  date: string;
  consoleName: string;
}

export default function TutorialHeader({
  title,
  authorName,
  date,
  consoleName,
}: TutorialHeaderProps) {
  const t = useTranslations("tutorial");

  return (
    <section className="mb-6 w-full overflow-hidden rounded-sm border-[1.5px] border-black bg-[#cfe0ff] shadow-[0_3px_0_rgba(0,0,0,0.12)]">
      <div className="flex min-h-17 items-center gap-4 overflow-hidden border-b-[1.5px] border-black bg-[#b9d1fa] px-6 sm:min-h-19 sm:px-8 md:px-10">
        <span
          className="h-7 w-7 shrink-0 rounded-xs border border-black/30 bg-[#0876c9] sm:h-8 sm:w-8"
          aria-hidden="true"
        />
        <span className="shrink-0 font-['Outfit',sans-serif] text-lg font-normal leading-tight tracking-wide text-black sm:text-xl md:text-2xl">
          {consoleName}
        </span>
        <div
          className="flex h-5 min-w-8 flex-1 flex-col justify-between"
          aria-hidden="true"
        >
          <span className="block h-[1.5px] w-full bg-black/80" />
          <span className="block h-[1.5px] w-full bg-black/80" />
          <span className="block h-[1.5px] w-full bg-black/80" />
          <span className="block h-[1.5px] w-full bg-black/80" />
        </div>
      </div>
      <div className="flex min-h-75 flex-col justify-between gap-12 border-t-0 bg-[#edf3ff] px-6 py-10 sm:px-12 sm:py-12">
        <h1 className="mx-auto max-w-md text-center font-['Outfit',sans-serif] text-4xl font-bold leading-tight sm:text-5xl">
          {title}
        </h1>
        <div className="grid gap-5 text-sm sm:grid-cols-2">
          <div>
            <p className="font-bold">{t("author")}</p>
            <p>{authorName}</p>
          </div>
          <div className="sm:text-right">
            <p className="font-bold">{t("date")}</p>
            <time dateTime={date}>
              {date
                .split("-")
                .reverse()
                .map((part) => Number(part))
                .join(" - ")}
            </time>
          </div>
        </div>
      </div>
    </section>
  );
}
