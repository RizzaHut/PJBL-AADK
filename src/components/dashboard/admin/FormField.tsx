import { ReactNode } from "react";

export const inputClass =
  "w-full rounded-xl border border-[#d9e2ef] bg-white px-3.5 py-3 text-[15px] text-slate-800 placeholder:text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] outline-none transition-all duration-150 focus:border-[#006FCD] focus:ring-4 focus:ring-[#006FCD]/10";

export const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#EF542B] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_0_rgba(190,81,38,0.9)] transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0";

export const buttonGhost =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#d9e2ef] bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50";

export function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <label className="mb-2 block text-[13px] font-semibold tracking-[0.01em] text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}
