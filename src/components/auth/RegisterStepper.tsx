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
    <div
      className="register-stepper"
      aria-label={`Tahap ${currentStep} dari 3`}
    >
      <div className="register-stepper__track" aria-hidden="true">
        {[1, 2, 3].map((step, index) => (
          <div className="register-stepper__segment" key={step}>
            <span
              className={`register-stepper__number register-stepper__number--${step < currentStep ? "complete" : step === currentStep ? "active" : "pending"}`}
            >
              {step}
            </span>
            {index < 2 && <span className="register-stepper__connector" />}
          </div>
        ))}
      </div>
      <p className="register-stepper__status">{statusText}</p>
    </div>
  );
}
