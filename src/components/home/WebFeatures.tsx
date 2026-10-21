"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

export interface PromoItem {
  type: "guide" | "forum" | "technician";
  title: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
  buttonColor: string;
  iconSrc: string;
  bgSideColor: string;
  iconSide: "left" | "right";
}

export interface WebFeaturesProps {
  blocks?: PromoItem[];
  className?: string;
}

export default function WebFeatures({
  blocks,
  className = "",
}: WebFeaturesProps) {
  const t = useTranslations("home");

  const DEFAULT_BLOCKS: PromoItem[] = [
    {
      type: "guide",
      title: t("features.guide.title"),
      description: t("features.guide.description"),
      buttonLabel: t("features.guide.button"),
      buttonHref: "/consoles",
      buttonColor: "#ef542b",
      bgSideColor: "#ef542b",
      iconSrc: "/assets/Icons/Book icon.svg",
      iconSide: "left",
    },
    {
      type: "forum",
      title: t("features.forum.title"),
      description: t("features.forum.description"),
      buttonLabel: t("features.forum.button"),
      buttonHref: "/forum",
      buttonColor: "#91bc79",
      bgSideColor: "#91bc79",
      iconSrc: "/assets/Icons/Chat icon.svg",
      iconSide: "right",
    },
    {
      type: "technician",
      title: t("features.technician.title"),
      description: t("features.technician.description"),
      buttonLabel: t("features.technician.button"),
      buttonHref: "/register/teknisi",
      buttonColor: "#5979da",
      bgSideColor: "#5979da",
      iconSrc: "/assets/Icons/Safety hat icon.svg",
      iconSide: "left",
    },
  ];

  const resolvedBlocks = blocks ?? DEFAULT_BLOCKS;

  return (
    <section
      className={`w-full flex flex-col ${className}`}
      aria-label={t("ariaFaq")}
    >
      {resolvedBlocks.map((block) => {
        const isIconLeft = block.iconSide === "left";
        const isForum = block.type === "forum";

        const iconPanel = (
          <div
            className={`w-full md:w-1/2 min-h-75 sm:min-h-90 md:min-h-105 flex items-center justify-center p-8 sm:p-12 ${isForum ? "md:order-2" : ""}`}
            style={{ backgroundColor: block.bgSideColor }}
          >
            <div
              className="relative w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)]"
              style={{ position: "relative" }}
            >
              <Image
                src={block.iconSrc}
                alt=""
                fill
                className="object-contain"
                aria-hidden="true"
              />
            </div>
          </div>
        );

        const textPanel = (
          <div
            className={`w-full md:w-1/2 min-h-75 sm:min-h-90 md:min-h-105 bg-white flex items-center p-8 pb-12 sm:p-12 sm:pb-16 md:p-16 md:pb-20 lg:p-20 lg:pb-24 ${isForum ? "text-right md:order-1" : "text-left"}`}
          >
            <div
              className={`w-full max-w-md ${isForum ? "text-right" : "text-left"}`}
            >
              <h2 className="font-['Outfit',sans-serif] text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4 sm:mb-5">
                {block.title}
              </h2>
              <p className="font-['Outfit',sans-serif] text-base sm:text-lg text-black/80 font-normal leading-relaxed mb-6 sm:mb-8">
                {block.description}
              </p>
              <Link
                href={block.buttonHref}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 rounded-sm border border-black font-['Outfit',sans-serif] font-bold text-sm sm:text-base tracking-wide transition-all shadow-[0_2px_0_#000] hover:shadow-[0_4px_0_#000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
                style={{
                  backgroundColor: block.buttonColor,
                  color: "#000000",
                }}
              >
                {block.buttonLabel}
              </Link>
            </div>
          </div>
        );

        return (
          <div
            key={block.type}
            className="w-full flex flex-col md:flex-row items-stretch"
          >
            {isIconLeft ? (
              <>
                {iconPanel}
                {textPanel}
              </>
            ) : (
              <div className="flex flex-col-reverse md:flex-row w-full">
                {textPanel}
                {iconPanel}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
