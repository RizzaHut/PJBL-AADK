"use client";

import { hasLocale, useLocale, useTranslations } from "next-intl";
import { useId, type ChangeEvent } from "react";
import { locales } from "@/i18n/config";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const id = useId();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("navigation");

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.currentTarget.value;
    if (!hasLocale(locales, nextLocale) || nextLocale === locale) return;

    router.replace(
      `${pathname}${window.location.search}${window.location.hash}`,
      { locale: nextLocale },
    );
  }

  return (
    <>
      <label className="sr-only" htmlFor={id}>
        {t("language")}
      </label>
      <select
        id={id}
        value={locale}
        onChange={handleChange}
        className={className}
        aria-label={t("language")}
      >
        {locales.map((availableLocale) => (
          <option key={availableLocale} value={availableLocale}>
            {t(availableLocale === "id" ? "indonesian" : "english")}
          </option>
        ))}
      </select>
    </>
  );
}
