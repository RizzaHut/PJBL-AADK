"use client";

import { useTranslations } from "next-intl";

interface WarningPanelProps {
  warnings: string[];
  tips: string[];
}

export default function WarningPanel({ warnings, tips }: WarningPanelProps) {
  const t = useTranslations("tutorial");

  return (
    <div className="mb-6 w-full overflow-hidden rounded-sm border-[1.5px] border-black bg-[#ffb0b0] shadow-[0_3px_0_rgba(0,0,0,0.12)]">
      <div className="flex min-h-17 items-center gap-4 overflow-hidden px-6 sm:min-h-19 sm:px-8 md:px-10">
        <span
          className="h-7 w-7 shrink-0 rounded-xs border border-black/30 bg-[#ef4b55] sm:h-8 sm:w-8"
          aria-hidden="true"
        />
        <span className="shrink-0 font-['Outfit',sans-serif] text-lg font-normal leading-tight tracking-wide text-black sm:text-xl md:text-2xl">
          {t("sectionWarning")}
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
      <div className="border-t-[1.5px] border-black bg-[#ffe7e7] px-6 py-7 text-black leading-relaxed sm:px-8 sm:py-8">
        <p className="text-base font-semibold sm:text-lg">
          {t("warningIntro")}
        </p>
        <ul className="mt-5 list-disc space-y-1 pl-5 text-sm sm:text-base">
          {warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
        {tips.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-semibold sm:text-base">
              {t("tipsLabel")}
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm sm:text-base">
              {tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
