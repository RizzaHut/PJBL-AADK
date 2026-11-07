"use client";

import { useSyncExternalStore } from "react";

export interface SidebarTab {
  id: string;
  label: string;
}

interface SidebarTabNavProps {
  tabs: SidebarTab[];
  className?: string;
}

function subscribeToHashChange(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getCurrentHash() {
  return window.location.hash.slice(1);
}

export default function SidebarTabNav({
  tabs,
  className = "",
}: SidebarTabNavProps) {
  const hash = useSyncExternalStore(subscribeToHashChange, getCurrentHash, () => "");
  const activeId = tabs.some((tab) => tab.id === hash) ? hash : tabs[0]?.id ?? "";

  return (
    <nav
      aria-label="Navigasi halaman console"
      className={`relative border border-black bg-[#d9d9d9] px-5 py-4 shadow-[2px_2px_0_#000]/20 ${className}`}
    >
      <p
        className="absolute left-2 top-2 h-2 w-2 rounded-full bg-[#858585]"
        aria-hidden="true"
      />
      <p
        className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#858585]"
        aria-hidden="true"
      />
      <p
        className="absolute bottom-2 left-2 h-2 w-2 rounded-full bg-[#858585] "
        aria-hidden="true"
      />
      <p
        className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-[#858585]"
        aria-hidden="true"
      />
      <ul className="space-y-1">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <a
              href={`#${tab.id}`}
              aria-current={activeId === tab.id ? "location" : undefined}
              className={`block border border-transparent px-3 py-2 text-sm transition-colors hover:border-black/40 hover:bg-white focus-visible:bg-white ${
                activeId === tab.id ? "bg-white border-black/40" : ""
              }`}
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
