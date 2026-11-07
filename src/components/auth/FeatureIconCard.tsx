import type { ReactNode } from "react";

interface FeatureIconCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function FeatureIconCard({
  icon,
  title,
  description,
}: FeatureIconCardProps) {
  return (
    <article className="flex min-h-0 flex-col items-center p-0 text-center">
      <div
        className="grid size-[7.1rem] place-items-center border-2 border-dashed border-[#7f8792] bg-white p-5"
        aria-hidden="true"
      >
        {icon}
      </div>
      <h3 className="mt-3 font-['Outfit',sans-serif] text-[0.7rem] font-medium">
        {title}
      </h3>
      <p className="mt-1 max-w-[7.1rem] text-[0.65rem] leading-[1.25] text-[#34383f]">
        {description}
      </p>
    </article>
  );
}
