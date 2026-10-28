"use client";

import { FormEvent, useState, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { Outfit } from "next/font/google";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import Button from "@/components/Button";
import { DashedInput, DashedUploadBox } from "@/components/DashedElements";
import RegisterWindow from "@/components/auth/RegisterWindow";
import RegisterStepper from "@/components/auth/RegisterStepper";
import SelectableIconCard from "@/components/auth/SelectableIconCard";
import TechnicianBenefits from "@/components/auth/TechnicianBenefits";
import type { RegisterStep } from "@/components/auth/RegisterStepper";
import { signUp } from "@/lib/mutations/auth";
import { createClient } from "@/lib/supabase/client";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const iconPath = "/assets/Icons/";
const maxAvatarSize = 5 * 1024 * 1024;
const allowedAvatarTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function AssetIcon({ name }: { name: string }) {
  return (
    <Image
      src={`${iconPath}${name}`}
      alt=""
      width={24}
      height={32}
      className="h-full w-full object-contain"
    />
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations("auth.register");
  const [currentStep, setCurrentStep] = useState<RegisterStep>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState<"laki_laki" | "perempuan" | "">("");
  const [username, setUsername] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusText =
    currentStep === 1
      ? t("statusNext2")
      : currentStep === 2
        ? t("statusNext1")
        : t("statusSuccess");

  function handleAccountSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!gender) {
      setError(t("accountErrorGender"));
      return;
    }
    setError("");
    setCurrentStep(2);
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!username.trim()) {
      setError(t("profileErrorUsername"));
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      if (!gender) {
        throw new Error(t("profileErrorIncomplete"));
      }

      const result = await signUp({
        email: email.trim(),
        password,
        username: username.trim(),
        jenisKelamin: gender,
        tanggalLahir: birthday || undefined,
      });

      if (!result.success) {
        const messages = {
          invalid_input: t("profileErrorInvalidInput"),
          username_taken: t("profileErrorUsernameTaken"),
          email_taken: t("profileErrorEmailTaken"),
          email_confirmation_required: t("profileErrorEmailConfirmation"),
          registration_failed: t("profileErrorFailed"),
        };
        throw new Error(messages[result.reason]);
      }

      let warning = result.warning ? t("profileErrorDateNotSaved") : "";
      setCurrentStep(3);

      if (avatarFile) {
        try {
          const supabase = createClient();
          const extension =
            avatarFile.type.split("/")[1] === "jpeg"
              ? "jpg"
              : avatarFile.type.split("/")[1];
          const path = `${result.user.id}/${crypto.randomUUID()}.${extension}`;
          const { error: uploadError } = await supabase.storage
            .from("photo_profiles")
            .upload(path, avatarFile, {
              contentType: avatarFile.type,
              upsert: false,
            });

          if (uploadError) {
            throw uploadError;
          }

          const { data: publicUrl } = supabase.storage
            .from("photo_profiles")
            .getPublicUrl(path);
          const { error: profileError } = await supabase
            .from("pengguna")
            .update({ pfp_url: publicUrl.publicUrl })
            .eq("id", result.user.id);

          if (profileError) {
            throw profileError;
          }
        } catch {
          warning = t("profileErrorAvatarUpload");
        }
      }

      setError(warning);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : t("profileErrorFailed"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleUpload(files: File[]) {
    const [file] = files;
    if (!file) return;

    if (!allowedAvatarTypes.has(file.type)) {
      setError(t("profileErrorAvatarType"));
      return;
    }

    if (file.size > maxAvatarSize) {
      setError(t("profileErrorAvatarSize"));
      return;
    }

    setError("");
    const nextPreview = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview((current) => {
      current.forEach((url) => URL.revokeObjectURL(url));
      return [nextPreview];
    });
  }

  function handleSkipTechnician() {
    router.replace("/");
  }

  function handleGoToTechnicianRegistration() {
    router.push("/register/teknisi");
  }

  return (
    <main
      className={`${outfit.className} min-h-screen bg-white px-6 pt-8 pb-16 max-[600px]:px-4`}
    >
      <div className="w-fit select-none" aria-label="AADK">
        <Image
          src="/assets/Icons/AADK icon.svg"
          alt="AADK"
          width={70}
          height={70}
          priority
          className="block h-auto w-[4.4rem]"
        />
      </div>
      <RegisterWindow currentStep={currentStep}>
        {currentStep === 1 && (
          <form onSubmit={handleAccountSubmit}>
            <div className="mb-10 text-center">
              <h1 className="font-[var(--font-outfit)] text-[clamp(1.55rem,3vw,2.1rem)] leading-[1.15] font-bold">
                {t("step1Title")}
              </h1>
            </div>
            {error && (
              <p
                className="-mt-6 mb-4 text-center text-[0.85rem] text-[#cc3300]"
                role="alert"
              >
                {error}
              </p>
            )}
            <div className="grid gap-5 [&_input]:min-h-[2.8rem] [&_input]:rounded-none [&_input]:border-[#7f8792] [&_input]:px-[1.1rem] [&_input]:py-[0.65rem] [&_input]:text-[0.9rem] [&_input::placeholder]:uppercase [&_input::placeholder]:tracking-[0.2em]">
              <DashedInput
                type="email"
                placeholder={t("email")}
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <DashedInput
                type="password"
                placeholder={t("password")}
                autoComplete="new-password"
                minLength={6}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <DashedInput
                type="date"
                aria-label={t("dateOfBirth")}
                value={birthday}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setBirthday(event.target.value)
                }
              />
            </div>
            <fieldset className="mt-6 mb-0 border-0 p-0">
              <legend className="mb-[0.65rem] text-[0.85rem] font-semibold">
                {t("genderLabel")}
              </legend>
              <div className="grid grid-cols-2 gap-4">
                <SelectableIconCard
                  icon={<AssetIcon name="male gender.svg" />}
                  label={t("male")}
                  selected={gender === "laki_laki"}
                  onSelect={() => setGender("laki_laki")}
                />
                <SelectableIconCard
                  icon={<AssetIcon name="female gender.svg" />}
                  label={t("female")}
                  selected={gender === "perempuan"}
                  onSelect={() => setGender("perempuan")}
                />
              </div>
            </fieldset>
            <div className="mt-7 flex items-center justify-end">
              <Button
                type="submit"
                variant="orange"
                size="md"
                className="!h-7 !min-h-7 !min-w-[2.35rem] !rounded-[2px] !p-0 font-['Tiny5',monospace] text-[1.35rem] leading-none"
                aria-label={t("nextStep")}
              >
                <Image
                  src="/assets/Icons/next.svg"
                  alt=""
                  width={22}
                  height={22}
                  aria-hidden="true"
                  className="block h-[1.375rem] w-[1.375rem] max-w-none shrink-0 object-contain"
                />
              </Button>
            </div>
          </form>
        )}

        {currentStep === 2 && (
          <form
            className="text-[#0b0b0b]"
            onSubmit={handleProfileSubmit}
          >
            <div className="mb-11 text-center">
              <h1 className="font-[var(--font-outfit)] text-[clamp(1.55rem,3vw,2.1rem)] leading-[1.15] font-bold">
                {t("step2Title")}
              </h1>
            </div>
            {error && (
              <p
                className="-mt-6 mb-4 text-center text-[0.85rem] text-[#cc3300]"
                role="alert"
              >
                {error}
              </p>
            )}
            <DashedUploadBox
              label={t("photoProfile")}
              onUpload={handleUpload}
              previewUrls={avatarPreview as [] | [string]}
              className="mb-7 items-center [&_[role=button]]:h-32 [&_[role=button]]:w-32 [&_[role=button]]:rounded-none [&_[role=button]>div>svg]:text-[#111] [&_[role=button]>div>span]:text-[#888]"
            />
            <DashedInput
              type="text"
              className="mx-auto w-full max-w-[29.25rem] [&_input]:min-h-[2.8rem] [&_input]:rounded-none [&_input]:border-[#7f8792] [&_input]:px-[1.1rem] [&_input]:py-[0.65rem] [&_input]:text-[0.9rem] [&_input::placeholder]:uppercase [&_input::placeholder]:tracking-[0.2em]"
              placeholder={t("username")}
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <div className="mt-9 flex items-center justify-end">
              <Button
                type="submit"
                variant="orange"
                size="md"
                className="!h-7 !min-h-7 !min-w-[2.35rem] !rounded-[2px] !p-0 font-['Tiny5',monospace] text-[1.35rem] leading-none"
                disabled={isSubmitting}
                aria-label={t("nextStep")}
              >
                <Image
                  src="/assets/Icons/next.svg"
                  alt=""
                  width={22}
                  height={22}
                  aria-hidden="true"
                  className="block h-[1.375rem] w-[1.375rem] max-w-none shrink-0 object-contain"
                />
              </Button>
            </div>
          </form>
        )}

        {currentStep === 3 && (
          <div>
            {error && (
              <p
                className="mb-4 text-center text-[0.85rem] text-[#cc3300]"
                role="alert"
              >
                {error}
              </p>
            )}
            <div className="mb-7 text-center">
              <h1 className="font-[var(--font-outfit)] text-[clamp(1.45rem,2.6vw,1.8rem)] leading-[1.15] font-bold">
                {t("step3Title")}
              </h1>
              <p className="mt-[0.45rem] text-[0.8rem] text-[#34383f]">
                {t("step3Subtitle")}
              </p>
            </div>
            <TechnicianBenefits />
            <div className="mt-8 flex items-center justify-between gap-4 max-[600px]:flex-col-reverse max-[600px]:items-stretch">
              <Button
                type="button"
                variant="black"
                size="sm"
                className="max-[600px]:w-full"
                onClick={handleSkipTechnician}
              >
                {t("skip")}
              </Button>
              <Button
                type="button"
                variant="orange"
                size="md"
                className="max-w-[18rem] whitespace-normal text-center max-[600px]:max-w-none"
                onClick={handleGoToTechnicianRegistration}
              >
                {t("becomeTechnician")}
              </Button>
            </div>
          </div>
        )}
      </RegisterWindow>
      <RegisterStepper currentStep={currentStep} statusText={statusText} />
    </main>
  );
}
