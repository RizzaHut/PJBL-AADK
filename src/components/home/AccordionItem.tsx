"use client";

import React, { useState } from "react";
import Image from "next/image";

export interface AccordionItemProps {
  leftElement?: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  showDecoLines?: boolean;
  className?: string;
}

export default function AccordionItem({
  leftElement,
  title,
  children,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  showDecoLines = true,
  className = "",
}: AccordionItemProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : internalOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    }
    if (!isControlled) {
      setInternalOpen(!internalOpen);
    }
  };

  return (
    <div
      className={`w-full mb-6 border-[1.5px] border-black rounded-sm overflow-hidden shadow-[0_3px_0_rgba(0,0,0,0.12)] transition-all ${className}`}
      style={{ backgroundColor: "#cff2d2" }}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        className="w-full min-h-17 sm:min-h-19 px-6 sm:px-8 md:px-10 flex items-center gap-4 text-left cursor-pointer select-none overflow-hidden hover:bg-[#c3eec7] transition-colors"
      >
        {leftElement ? (
          <div className="shrink-0">{leftElement}</div>
        ) : (
          <span
            className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-[#2f8537] border border-black/30 rounded-xs"
            aria-hidden="true"
          />
        )}

        <span className="min-w-0 shrink truncate whitespace-nowrap font-['Outfit',sans-serif] text-lg sm:text-xl md:text-2xl font-normal leading-tight text-black tracking-wide">
          {title}
        </span>

        {showDecoLines && (
          <div
            className="flex min-w-8 flex-1 flex-col justify-between h-5"
            aria-hidden="true"
          >
            <span className="w-full h-[1.5px] bg-black/80 block" />
            <span className="w-full h-[1.5px] bg-black/80 block" />
            <span className="w-full h-[1.5px] bg-black/80 block" />
            <span className="w-full h-[1.5px] bg-black/80 block" />
          </div>
        )}

        <span
          className={`shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : "rotate-0"
          }`}
          aria-hidden="true"
        >
          <Image
            src="/assets/Icons/Chevron.svg"
            alt=""
            width={37}
            height={37}
          />
        </span>
      </button>

      {open && (
        <div className="p-6 sm:p-8 bg-[#f2ffed] border-t-[1.5px] border-black text-black leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}
