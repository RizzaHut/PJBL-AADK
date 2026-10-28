import type { ReactNode } from "react";
import type { RegisterStep } from "./RegisterStepper";

interface RegisterWindowProps {
  currentStep: RegisterStep;
  children: ReactNode;
  showStageLabel?: boolean;
}

export default function RegisterWindow({
  currentStep,
  children,
  showStageLabel = true,
}: RegisterWindowProps) {
  return (
    <section
      className="mx-auto mt-10 w-full max-w-[760px] border border-black bg-[#edf3ff] max-[600px]:mt-8"
      aria-labelledby="register-window-title"
    >
      <div className="flex min-h-10 items-center gap-3 border-b border-black bg-[#b8cef6] px-5 py-2 font-[var(--font-system)] text-[0.95rem] text-[#27334b]">
        <span className="h-5 w-5 shrink-0 bg-[#0877c9]" aria-hidden="true" />
        {showStageLabel && (
          <span id="register-window-title">Tahap {currentStep}</span>
        )}
        <div className="ml-3 grid flex-1 gap-1" aria-hidden="true">
          <span className="h-0.5 bg-[#1b1e24]" />
          <span className="h-0.5 bg-[#1b1e24]" />
          <span className="h-0.5 bg-[#1b1e24]" />
        </div>
      </div>
      <div className="min-h-[25rem] px-[clamp(1.25rem,8vw,5rem)] pt-9 pb-8 max-[600px]:px-4">
        {children}
      </div>
    </section>
  );
}
