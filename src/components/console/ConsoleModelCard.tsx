import Image from "next/image";
import ConsoleSpecCard from "@/components/console/ConsoleSpecCard";
import type { ConsoleModelDetail } from "@/lib/console-data";

interface ConsoleModelCardProps {
  model: ConsoleModelDetail;
}

const SPEC_ICONS = {
  colorOptions: "/assets/Icons/console-model/color.svg",
  connectivity: "/assets/Icons/console-model/electrical.svg",
  performance: "/assets/Icons/console-model/processor.svg",
  storageMedia: "/assets/Icons/console-model/memory.svg",
} as const;

export default function ConsoleModelCard({ model }: ConsoleModelCardProps) {
  return (
    <article className="min-w-0 flex-1 rounded-xl bg-[#2f83df] px-5 pb-5 pt-3 text-white shadow-[4px_4px_0_#000] sm:px-8 sm:pb-8 sm:pt-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-['Outfit',sans-serif] text-xl font-bold uppercase tracking-[0.12em] sm:text-4xl">
            {model.name}
          </h3>
          <p className="mt-1 text-xs sm:text-sm">Model ID: {model.modelId}</p>
          <p className="text-xs sm:text-sm">
            Production Date: {model.releaseYear}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(180px,0.85fr)_1.5fr] lg:gap-5">
        <div className="relative aspect-[0.86] overflow-hidden rounded-lg border-2 border-dashed border-black bg-white">
          <Image
            src={model.imageUrl}
            alt={`${model.name} console`}
            fill
            sizes="(max-width: 1024px) 80vw, 360px"
            className="object-contain p-7 sm:p-10"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:gap-4">
          <ConsoleSpecCard
            title="Color Options"
            values={model.colorOptions}
            iconUrl={SPEC_ICONS.colorOptions}
          />
          <ConsoleSpecCard
            title="Connectivity"
            values={model.connectivity}
            iconUrl={SPEC_ICONS.connectivity}
          />
          <ConsoleSpecCard
            title="Performance"
            values={model.performance}
            iconUrl={SPEC_ICONS.performance}
          />
          <ConsoleSpecCard
            title="Storage & Media"
            values={model.storageMedia}
            iconUrl={SPEC_ICONS.storageMedia}
          />
        </div>
      </div>
    </article>
  );
}
