import type { ReactNode } from "react";

interface SelectableIconCardProps {
  icon: ReactNode;
  label: string;
  selected: boolean;
  onSelect: () => void;
}

export default function SelectableIconCard({
  icon,
  label,
  selected,
  onSelect,
}: SelectableIconCardProps) {
  return (
    <button
      type="button"
      className={`relative flex h-20 items-center justify-center gap-[0.7rem] overflow-hidden border-2 border-dashed border-[#7f8792] bg-white text-[0.9rem] text-[#0b0b0b] transition-colors hover:border-[#0877c9] hover:bg-[#dce8fc] ${
        selected ? "border-[#0877c9] bg-[#dce8fc]" : ""
      }`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span
        className="grid h-8 w-6 -translate-y-2 place-items-center"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="-translate-y-[0.1rem]">{label}</span>
    </button>
  );
}
