"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import AccordionItem from "@/components/home/AccordionItem";

export default function HomeFaq() {
  const t = useTranslations("home");
  const [openIndex, setOpenIndex] = useState(0);

  const items = [
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

  return (
    <section
      className="w-full bg-white px-4 py-16 sm:px-6 sm:py-24"
      aria-label={t("ariaFaq")}
    >
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-12 text-center font-['Outfit',sans-serif] text-3xl font-bold tracking-wide text-black sm:mb-16 sm:text-4xl md:text-5xl">
          {t("faq")}
        </h2>

        <div className="mx-auto flex w-full max-w-3xl flex-col">
          {items.map((item, index) => (
            <AccordionItem
              key={item.question}
              title={item.question}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex((current) => (current === index ? -1 : index))
              }
            >
              <h3 className="mb-2 font-['Outfit',sans-serif] text-base font-bold text-black sm:mb-3 sm:text-lg">
                {item.title}
              </h3>
              <p className="font-['Outfit',sans-serif] text-sm leading-relaxed text-black/85 sm:text-base">
                {item.answer}
              </p>
            </AccordionItem>
          ))}
        </div>
      </div>
    </section>
  );
}
