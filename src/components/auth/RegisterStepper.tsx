export type RegisterStep = 1 | 2 | 3;

interface RegisterStepperProps {
  currentStep: RegisterStep;
  statusText: string;
}

export default function RegisterStepper({
  currentStep,
  statusText,
}: RegisterStepperProps) {
  return (
    <nav
      className="mx-auto mt-6 w-full max-w-[760px] px-5 pt-4 pb-6 text-center"
      aria-label="Tahap pendaftaran"
    >
      <ol className="mx-auto flex max-w-[17rem] items-center justify-center">
        {[1, 2, 3].map((step, index) => (
          <li
            className="flex flex-1 items-center last:flex-none"
            aria-current={step === currentStep ? "step" : undefined}
            key={step}
          >
            <span
              className={`grid size-[1.45rem] place-items-center rounded-[2px] border border-[#111] bg-white font-['Tiny5',monospace] text-[0.95rem] leading-none ${
                step < currentStep
                  ? "bg-[#91bc79]"
                  : step === currentStep
                    ? "bg-[#91bc79] shadow-[0_0_0_2px_#edf3ff,0_0_0_3px_#111]"
                    : ""
              }`}
            >
              {step}
            </span>
            {index < 2 && (
              <span className="mx-3 flex-1 border-t-2 border-dotted border-[#111]" />
            )}
          </li>
        ))}
      </ol>
      <p
        className="mt-3 font-['Outfit',sans-serif] text-[0.95rem]"
        aria-live="polite"
        aria-atomic="true"
      >
        {statusText}
      </p>
    </nav>
  );
}
