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
      className="register-window"
      aria-labelledby="register-window-title"
    >
      <div className="register-window__titlebar">
        <span className="register-window__title-icon" aria-hidden="true" />
        {showStageLabel && (
          <span id="register-window-title">Tahap {currentStep}</span>
        )}
        <div className="register-window__lines" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="register-window__body">{children}</div>
    </section>
  );
}
