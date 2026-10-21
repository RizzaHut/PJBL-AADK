"use client";

import { useState } from "react";
import CarouselArrowButton from "@/components/shared/controls/CarouselArrowButton";
import ConsoleModelCard from "@/components/console/ConsoleModelCard";
import type { ConsoleModelDetail } from "@/lib/console-data";

interface ConsoleModelCarouselProps {
  models: ConsoleModelDetail[];
}

export default function ConsoleModelCarousel({
  models,
}: ConsoleModelCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (models.length === 0) {
    return (
      <div className="border-2 border-dashed border-black/50 bg-white px-6 py-12 text-center">
        Belum ada data model console.
      </div>
    );
  }

  const model = models[activeIndex];
  const previous = () =>
    setActiveIndex((current) => (current - 1 + models.length) % models.length);
  const next = () => setActiveIndex((current) => (current + 1) % models.length);

  return (
    <div className="relative flex items-center gap-1 sm:gap-5">
      <CarouselArrowButton
        direction="left"
        onClick={previous}
        className="shrink-0 sm:scale-125"
      />
      <div className="relative min-w-0 flex-1">
        <ConsoleModelCard model={model} />
        <div
          className="absolute bottom-3 right-4 flex gap-2 sm:bottom-5 sm:right-6"
          aria-label="Pilih model console"
        ></div>
      </div>
      <CarouselArrowButton
        direction="right"
        onClick={next}
        className="shrink-0 sm:scale-125"
      />
    </div>
  );
}
