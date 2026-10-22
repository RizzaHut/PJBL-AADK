"use client";

import { useTranslations } from "next-intl";

export interface ForumFilters {
  topic: string;
  sort: string;
}

interface ForumFilterSidebarProps {
  filters: ForumFilters;
  onChange: (key: keyof ForumFilters, value: string) => void;
  onReset: () => void;
}

export default function ForumFilterSidebar({
  filters,
  onChange,
  onReset,
}: ForumFilterSidebarProps) {
  const t = useTranslations("forum");

  const TOPIC_OPTIONS = [
    {
      value: "all",
      label: t("filter.topicOptions.all"),
      color: "bg-[#e8e8e8] text-[#334155]",
    },
    {
      value: "Hardware & Technical",
      label: t("filter.topicOptions.hardwareTechnical"),
      color: "bg-[#bd2028] text-white",
    },
    {
      value: "Software & System",
      label: t("filter.topicOptions.softwareSystem"),
      color: "bg-[#1551a3] text-white",
    },
    {
      value: "Server & Network",
      label: t("filter.topicOptions.serverNetwork"),
      color: "bg-[#0796d2] text-white",
    },
    {
      value: "Accessories & Controller",
      label: t("filter.topicOptions.accessoriesController"),
      color: "bg-[#f27c00] text-white",
    },
    {
      value: "Storage & Memory",
      label: t("filter.topicOptions.storageMemory"),
      color: "bg-[#008b7d] text-white",
    },
    {
      value: "Maintenance & Care",
      label: t("filter.topicOptions.maintenanceCare"),
      color: "bg-[#2c8637] text-white",
    },
    {
      value: "Service & Spare Part",
      label: t("filter.topicOptions.serviceSparePart"),
      color: "bg-[#64483e] text-white",
    },
    { value: "General", label: t("filter.topicOptions.general"), color: "bg-[#8120a8] text-white" },
  ];

  const SORT_OPTIONS = [
    { value: "latest", label: t("filter.latest") },
    { value: "popular", label: t("filter.popular") },
    { value: "comments", label: t("filter.comments") },
    { value: "readers", label: t("filter.readers") },
  ];

  return (
    <aside
      className="h-fit w-full shrink-0 rounded-lg border border-black bg-white p-4 sm:p-5 lg:w-64"
      aria-label={t("filter.searchBy")}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{t("filter.searchBy")}</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-bold underline"
        >
          {t("filter.reset")}
        </button>
      </div>
      <FilterGroup
        label={t("filter.topic")}
        options={TOPIC_OPTIONS}
        value={filters.topic}
        onChange={(value) => onChange("topic", value)}
      />
      <FilterGroup
        label={t("filter.sort")}
        options={SORT_OPTIONS}
        value={filters.sort}
        onChange={(value) => onChange("sort", value)}
      />
    </aside>
  );
}

interface FilterGroupProps {
  label: string;
  options: { value: string; label: string; color?: string }[];
  value: string;
  onChange: (value: string) => void;
}

function FilterGroup({ label, options, value, onChange }: FilterGroupProps) {
  return (
    <fieldset className="mt-4 border-t border-black/50 pt-3 first:mt-4">
      <legend className="relative z-10 mb-1 flex items-center gap-2 bg-white px-1 text-sm font-semibold">
        <img
          src="/assets/Icons/Chevron.svg"
          alt=""
          className="h-3 w-3 rotate-180"
        />
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ring-offset-2 transition ${option.color ?? "bg-[#e8e8e8] text-[#334155]"} ${option.value === value ? "ring-2 ring-black" : "hover:brightness-95"}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
