import Image from "next/image";

interface ConsoleSpecCardProps {
  title: string;
  values: string[];
  iconUrl: string;
}

export default function ConsoleSpecCard({
  title,
  values,
  iconUrl,
}: ConsoleSpecCardProps) {
  return (
    <article className="min-h-0 rounded-lg border-2 border-dashed border-black bg-white px-2.5 py-2.5 shadow-[2px_2px_0_rgba(0,0,0,0.18)] sm:px-4 sm:py-4">
      <div className="flex h-full items-center gap-2 sm:gap-4">
        <Image
          src={iconUrl}
          alt=""
          width={64}
          height={64}
          className="h-9 w-9 shrink-0 object-contain sm:h-14 sm:w-14"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1 wrap-break-word text-black">
          <h3 className="wrap-break-word font-['Outfit',sans-serif] text-sm font-bold leading-tight text-black sm:text-lg">
            {title}
          </h3>
          <ul className="mt-1 space-y-0.5 wrap-break-word text-[10px] leading-snug text-black/75 sm:text-sm">
            {values.map((value) => (
              <li key={value}>- {value}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
