interface ConsoleNameWindowProps {
  consoleName: string;
  brand?: string;
  className?: string;
}

export default function ConsoleNameWindow({
  consoleName,
  brand = "PlayStation",
  className = "",
}: ConsoleNameWindowProps) {
  return (
    <div
      className={`w-full max-w-90 overflow-hidden border-[1.5px] border-black bg-[#e8eefb] shadow-[4px_4px_0_#000] ${className}`}
    >
      <div className="flex min-h-10 items-center gap-2 border-b-[1.5px] border-black bg-[#c9dcfb] px-3 py-1.5 text-left sm:min-h-11 sm:px-4">
        <span
          className="h-4 w-4 shrink-0 bg-[#0876c9] sm:h-5 sm:w-5"
          aria-hidden="true"
        />
        <span className="shrink-0 font-['Outfit',sans-serif] text-xs sm:text-sm">
          {brand}
        </span>
        <div
          className="flex min-w-8 flex-1 flex-col justify-between gap-1.5"
          aria-hidden="true"
        >
          <span className="block h-[1.5px] w-full bg-black/80" />
          <span className="block h-[1.5px] w-full bg-black/80" />
          <span className="block h-[1.5px] w-full bg-black/80" />
          <span className="block h-[1.5px] w-full bg-black/80" />
        </div>
      </div>
      <div className="min-h-20 px-5 py-5 sm:min-h-24 sm:px-7 sm:py-6">
        <p className="font-['Outfit',sans-serif] text-2xl font-bold leading-tight sm:text-3xl">
          {consoleName}
        </p>
      </div>
    </div>
  );
}
