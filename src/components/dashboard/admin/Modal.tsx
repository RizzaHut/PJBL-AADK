"use client";
import { ReactNode, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

function subscribeToNothing() {
  return () => {};
}

function isMountedOnClient() {
  return true;
}

function isMountedOnServer() {
  return false;
}

export default function Modal({
  open,
  title,
  children,
  footer,
  onClose,
  wide = false,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    isMountedOnClient,
    isMountedOnServer,
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !mounted || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div
        className="relative z-[10001] flex max-h-[88vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.2)]"
        style={{
          width: `min(100%, ${wide ? 620 : 480}px)`,
          maxWidth: wide ? 620 : 480,
        }}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
          <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-slate-800">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>

        <div
          className="overflow-y-auto p-5"
          style={{ maxHeight: "calc(88vh - 124px)" }}
        >
          {children}
        </div>

        {footer && (
          <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
