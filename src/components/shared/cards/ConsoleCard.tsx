"use client";

import React from "react";
import Image from "next/image";

export interface ConsoleCardProps {
  name: string;
  brand: "Nintendo" | "Playstation" | "Xbox";
  year: number;
  imageUrl: string;
  type: "home_console" | "hybrid_console" | "handheld_console";
  onClick?: () => void;
  active?: boolean;
  className?: string;
}

const BRAND_COLORS: Record<string, string> = {
  Playstation: "#1f53a2",
  Xbox: "#107c10",
  Nintendo: "#c1121c",
};

// Exact Figma path from console_card_svg.svg, viewBox 313x350
export const MEMORY_CARD_PATH =
  "M312.531 217.417C312.531 218.378 312.231 219.309 311.777 220.156C310.402 222.721 309.592 225.862 309.592 229.255C309.592 232.648 310.402 235.788 311.777 238.353C312.231 239.2 312.531 240.131 312.531 241.092V245.829C312.531 246.79 312.231 247.721 311.777 248.568C310.402 251.133 309.592 254.274 309.592 257.667C309.592 261.06 310.402 264.2 311.777 266.765C312.231 267.612 312.531 268.543 312.531 269.504V275.555C312.531 276.706 312.101 277.803 311.475 278.768C309.692 281.517 308.613 285.1 308.613 289.019C308.613 292.937 309.692 296.519 311.475 299.267C312.101 300.232 312.531 301.33 312.531 302.48V306.906C312.531 308.056 312.101 309.154 311.475 310.119C309.692 312.867 308.613 316.45 308.613 320.369C308.613 324.288 309.692 327.87 311.475 330.618C312.101 331.583 312.531 332.681 312.531 333.831V344.862C312.531 347.568 310.338 349.761 307.633 349.761H4.89861C2.19319 349.761 0 347.568 0 344.862V326.862C0 325.708 0.432909 324.607 1.0627 323.64C2.85395 320.889 3.93848 317.298 3.93848 313.369C3.93847 309.44 2.85417 305.849 1.06283 303.098C0.432989 302.13 0 301.029 0 299.875V299.511C0 298.356 0.432871 297.255 1.06264 296.288C2.85378 293.538 3.93839 289.947 3.93848 286.019C3.93848 282.089 2.85407 278.498 1.06276 275.747C0.432953 274.78 0 273.679 0 272.524V271.13C0 269.98 0.430111 268.882 1.05633 267.917C2.83966 265.169 3.91895 261.586 3.91895 257.667C3.91894 253.748 2.83987 250.164 1.05646 247.416C0.430188 246.451 0 245.353 0 244.202V242.718C0 241.568 0.430091 240.47 1.05629 239.505C2.8396 236.757 3.91895 233.174 3.91895 229.255C3.91892 225.336 2.83985 221.752 1.05646 219.004C0.43019 218.039 0 216.941 0 215.79V4.8986C0 2.19318 2.19318 0 4.89861 0H307.633C310.338 0 312.531 2.19318 312.531 4.89861V217.417Z";

export default function ConsoleCard({
  name,
  brand,
  year,
  imageUrl,
  onClick,
  active = false,
  className = "",
}: ConsoleCardProps) {
  const brandBg = BRAND_COLORS[brand] || "#0c4f94";

  return (
    <article
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group relative inline-block @container select-none transition-all duration-300 ${
        active
          ? "shadow-[0_12px_28px_rgba(0,0,0,0.28)] z-20 cursor-default"
          : "opacity-80 hover:opacity-100 hover:scale-105 shadow-[0_6px_16px_rgba(0,0,0,0.18)] cursor-pointer"
      } ${className}`}
      style={{
        width: active ? "min(313px, 85vw)" : "min(165px, 36vw)",
        aspectRatio: "313 / 350",
      }}
    >
      {/* Inline SVG keeps the original memory-card silhouette and side notches. */}
      <svg
        className="absolute inset-0 h-full w-full transition-transform duration-150 group-hover:scale-[1.015]"
        viewBox="0 0 313 350"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d={MEMORY_CARD_PATH}
          fill={brandBg}
          stroke="#000000"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <polygon points="156.5,15 168,37 145,37" fill="#e7e7e7" />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center px-[8%] pt-[13%] text-white">
        <h3
          className="w-full truncate text-center font-medium [font-family:var(--font-outfit,'Outfit',sans-serif)]"
          style={{ fontSize: "9cqi" }}
        >
          {name}
        </h3>
        <p
          className="absolute top-[23%] font-bold [font-family:var(--font-outfit,'Outfit',sans-serif)]"
          style={{ fontSize: "5.5cqi" }}
        >
          {year}
        </p>

        <div
          className="absolute overflow-hidden rounded-2xl bg-[#fbfcf6]"
          style={{
            left: "6.71%",
            right: "6.71%",
            top: "32%",
            height: "52.86%",
          }}
        >
          <div
            className="relative h-full w-full"
            style={{ position: "relative" }}
          >
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 260px"
              className="object-contain p-2"
              priority={active}
            />
          </div>
        </div>

        <div className="absolute bottom-[5%] flex items-center">
          <p
            className="font-bold uppercase tracking-[0.15em] [font-family:var(--font-outfit,'Outfit',sans-serif)]"
            style={{ fontSize: "5cqi" }}
          >
            {brand}
          </p>
        </div>
      </div>
    </article>
  );
}
