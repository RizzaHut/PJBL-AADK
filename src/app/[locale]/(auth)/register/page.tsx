"use client";

import { FormEvent, useState, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { Outfit } from "next/font/google";
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
    <img src={`${iconPath}${name}`} alt="" className="register-asset-icon" />
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

      if (!result.success || !result.user) {
        throw new Error(result.error ?? t("profileErrorFailed"));
      }

      if (avatarFile) {
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
      }

      setCurrentStep(3);
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

  async function handleSkipTechnician() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  function handleGoToTechnicianRegistration() {
    router.push("/register/teknisi");
  }

  return (
    <main className={`${outfit.className} register-page`}>
      <div className="register-page__brand" aria-label="AADK">
        <img src="/assets/Icons/AADK icon.svg" alt="AADK" />
      </div>
      <RegisterWindow currentStep={currentStep}>
        {currentStep === 1 && (
          <form className="register-stage" onSubmit={handleAccountSubmit}>
            <div className="register-stage__intro">
              <h1>{t("step1Title")}</h1>
            </div>
            {error && (
              <p className="register-error" role="alert">
                {error}
              </p>
            )}
            <div className="register-form-stack">
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
            <fieldset className="register-gender">
              <legend>{t("genderLabel")}</legend>
              <div className="register-gender__options">
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
            <div className="register-actions register-actions--end">
              <Button
                type="submit"
                variant="orange"
                size="md"
                className="register-next-button"
                aria-label={t("nextStep")}
              >
                <img src="/assets/Icons/next.svg" alt="" aria-hidden="true" />
              </Button>
            </div>
          </form>
        )}

        {currentStep === 2 && (
          <form
            className="register-stage register-stage--profile"
            onSubmit={handleProfileSubmit}
          >
            <div className="register-stage__intro">
              <h1>{t("step2Title")}</h1>
            </div>
            {error && (
              <p className="register-error" role="alert">
                {error}
              </p>
            )}
            <DashedUploadBox
              label={t("photoProfile")}
              onUpload={handleUpload}
              previewUrls={avatarPreview as [] | [string]}
              className="register-profile-upload"
            />
            <DashedInput
              type="text"
              className="register-username-input"
              placeholder={t("username")}
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <div className="register-actions register-actions--end">
              <Button
                type="submit"
                variant="orange"
                size="md"
                className="register-next-button"
                disabled={isSubmitting}
                aria-label={t("nextStep")}
              >
                <img src="/assets/Icons/next.svg" alt="" aria-hidden="true" />
              </Button>
            </div>
          </form>
        )}

        {currentStep === 3 && (
          <div className="register-stage register-stage--technician">
            <div className="register-stage__intro">
              <h1>{t("step3Title")}</h1>
              <p>{t("step3Subtitle")}</p>
            </div>
            <TechnicianBenefits />
            <div className="register-actions register-actions--split">
              <Button
                type="button"
                variant="black"
                size="sm"
                className="register-technician-button"
                onClick={handleSkipTechnician}
              >
                {t("skip")}
              </Button>
              <Button
                type="button"
                variant="orange"
                size="md"
                className="register-technician-button"
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
