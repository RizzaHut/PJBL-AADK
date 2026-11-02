"use client";

import { CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";

export default function Toast({
  message,
  onClose,
}: {
  message: string | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!message) return;

    const timeout = window.setTimeout(onClose, 4000);
    return () => window.clearTimeout(timeout);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-10002 flex max-w-[min( calc(100vw-2rem),380px)] items-center gap-3 rounded-xl border border-[#B8DDBA] bg-[#F2FBF2] px-4 py-3 text-sm text-[#256029] shadow-[0_10px_30px_rgba(36,64,36,0.16)]"
    >
      <CheckCircle2 size={18} className="shrink-0" />
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup notifikasi"
        className="grid h-6 w-6 shrink-0 place-items-center rounded-md hover:bg-[#DDF1DD]"
      >
        <X size={15} />
      </button>
    </div>
  );
}
