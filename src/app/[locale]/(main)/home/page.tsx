"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Tiny5, Outfit } from "next/font/google";
import HeroCarousel from "@/components/home/HeroCarousel";
import ConsoleCarousel from "@/components/home/ConsoleCarousel";
import WebFeatures from "@/components/home/WebFeatures";
import AccordionItem from "@/components/home/AccordionItem";
import Footer from "@/components/layout/Footer";

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

export default function HomePage() {
  const t = useTranslations("home");
  const faqItems = [
    {
      question: t("faqItems.whatIsAadkQuestion"),
      title: t("faqItems.whatIsAadkTitle"),
      answer: t("faqItems.whatIsAadkAnswer"),
    },
    {
      question: t("faqItems.missingModelQuestion"),
      title: t("faqItems.missingModelTitle"),
      answer: t("faqItems.missingModelAnswer"),
    },
    {
      question: t("faqItems.uploadTutorialQuestion"),
      title: t("faqItems.uploadTutorialTitle"),
      answer: t("faqItems.uploadTutorialAnswer"),
    },
    {
      question: t("faqItems.technicianBenefitQuestion"),
      title: t("faqItems.technicianBenefitTitle"),
      answer: t("faqItems.technicianBenefitAnswer"),
    },
  ];

  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <main
      className={`min-h-screen w-full bg-white text-black ${tiny5.variable} ${outfit.variable} font-['Outfit',sans-serif]`}
    >
      <HeroCarousel />
      <ConsoleCarousel />
      <WebFeatures />

      <section
        className="w-full bg-white px-4 py-16 sm:px-6 sm:py-24"
        aria-label={t("ariaFaq")}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="font-['Outfit',sans-serif] text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide text-center text-black mb-12 sm:mb-16">
            {t("faq")}
          </h2>

          <div className="flex flex-col w-full max-w-3xl mx-auto">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={item.question}
                title={item.question}
                isOpen={openIndex === index}
                onToggle={() =>
                  setOpenIndex((current) => (current === index ? -1 : index))
                }
              >
                <h3 className="font-['Outfit',sans-serif] font-bold text-base sm:text-lg text-black mb-2 sm:mb-3">
                  {item.title}
                </h3>
                <p className="font-['Outfit',sans-serif] text-sm sm:text-base text-black/85 leading-relaxed">
                  {item.answer}
                </p>
              </AccordionItem>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
