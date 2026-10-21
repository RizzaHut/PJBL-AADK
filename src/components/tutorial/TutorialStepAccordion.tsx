"use client";

import Image from "next/image";
import { useState } from "react";
import type { TutorialStepDetail } from "@/lib/tutorial-data";

interface TutorialStepAccordionProps {
  step: TutorialStepDetail;
  defaultOpen?: boolean;
}

export default function TutorialStepAccordion({
  step,
  defaultOpen = false,
}: TutorialStepAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = `tutorial-step-${step.number}`;

  return (
    <article className="border-b-2 border-dashed border-black py-4 last:border-b-0 sm:py-5">
      <h3>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={() => setIsOpen((open) => !open)}
          className="flex w-full items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
        >
          <span className="grid h-6 w-6 shrink-0 place-items-center border border-black bg-[#9acb7d] text-sm font-bold leading-none sm:h-7 sm:w-7">
            {step.number}
          </span>
          <span className="min-w-0 flex-1 wrap-break-word text-sm font-bold uppercase sm:text-base">
            {step.title}
          </span>
          <Image
            src="/assets/Icons/Chevron.svg"
            alt=""
            width={20}
            height={20}
            aria-hidden="true"
            className={`h-5 w-5 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </h3>

      {isOpen && (
        <div
          id={contentId}
          className="mt-4 grid gap-5 pl-9 text-sm leading-relaxed text-black/80 sm:grid-cols-[minmax(0,1fr)_minmax(180px,0.8fr)] sm:pl-10"
        >
          <div className="space-y-3">
            {step.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {step.bullets && step.bullets.length > 0 && (
              <ul className="list-disc space-y-1 pl-5">
                {step.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
          </div>

          {step.imageUrls && step.imageUrls.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-1">
              {step.imageUrls.slice(0, 2).map((imageUrl) => (
                <div
                  key={imageUrl}
                  className="relative aspect-4/3 overflow-hidden border-2 border-dashed border-black bg-white"
                >
                  <Image
                    src={imageUrl}
                    alt={`Ilustrasi langkah ${step.number}: ${step.title}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 320px"
                    className="object-contain p-3"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
