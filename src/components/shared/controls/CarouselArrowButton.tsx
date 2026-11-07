"use client";

import React from "react";

export interface CarouselArrowButtonProps {
  direction: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export default function CarouselArrowButton({
  direction,
  onClick,
  disabled = false,
  className = "",
  ariaLabel,
}: CarouselArrowButtonProps) {
  const isLeft = direction === "left";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? (isLeft ? "Previous" : "Next")}
      className={`inline-flex items-center justify-center p-2 cursor-pointer transition-transform hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${className}`}
    >
      <svg
        width="52"
        height="52"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
      >
        {isLeft ? (
          <polygon
            points="18,4 6,12 18,20"
            fill="#ffcd1e"
            stroke="#d4a300"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        ) : (
          <polygon
            points="6,4 18,12 6,20"
            fill="#ffcd1e"
            stroke="#d4a300"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}
