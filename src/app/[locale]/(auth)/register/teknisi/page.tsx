"use client";

import { FormEvent, useState } from "react";
import { Outfit } from "next/font/google";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import Button from "@/components/Button";
import { DashedInput } from "@/components/DashedElements";
import RegisterWindow from "@/components/auth/RegisterWindow";
import { createClient } from "@/lib/supabase/client";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export default function TechnicianRegisterPage() {
  const router = useRouter();
  const [proofUrl, setProofUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedUrl = proofUrl.trim();

    if (!normalizedUrl) {
      setError("URL bukti / portofolio wajib diisi.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
      }

      const { error: insertError } = await supabase
        .from("pengajuan_teknisi")
        .insert({
          pengguna_id: user.id,
          url_bukti: normalizedUrl,
          status: "pending",
        });

      if (insertError) {
        throw insertError;
      }

      setIsSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Pengajuan teknisi gagal dikirim. Silakan coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
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

      <RegisterWindow currentStep={1} showStageLabel={false}>
        {isSuccess ? (
          <div className="flex min-h-[30rem] items-center justify-center text-center">
            <div className="mx-auto w-full max-w-3xl">
              <div className="mb-2 text-center">
                <h1 className="m-0 text-2xl font-[Outfit] font-bold">
                  Pengajuan terkirim
                </h1>
                <p className="mt-4 text-[1.1rem] leading-relaxed text-black/80">
                  Permintaan kamu sebagai teknisi sudah masuk dan menunggu
                  review moderator.
                </p>
              </div>

              <div className="mt-6 flex flex-col items-center justify-center gap-5">
                <div
                  aria-label="Pengajuan berhasil dikirim"
                  className="grid h-28 w-28 place-items-center bg-transparent"
                >
                  <Image
                    src="/assets/Icons/Checkmark icon.svg"
                    alt=""
                    width={64}
                    height={64}
                    className="h-16 w-16 object-contain"
                    aria-hidden="true"
                  />
                </div>

                <div className="flex max-w-[26rem] flex-col items-center gap-4 text-center">
                  <p className="m-0 text-[1.1rem] leading-relaxed text-black">
                    Tim moderator akan meninjau bukti yang kamu kirim.
                  </p>

                  <Button
                    type="button"
                    variant="orange"
                    size="sm"
                    className="!rounded-none !shadow-none border-2 border-black px-4 py-2 font-[Outfit] text-[0.875rem] font-bold tracking-wide"
                    onClick={() => router.push("/")}
                  >
                    Kembali ke beranda
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form
            className="flex flex-col justify-center"
            onSubmit={handleSubmit}
          >
            <div className="mb-7 text-center">
              <h1 className="font-[var(--font-outfit)] text-[clamp(1.45rem,2.6vw,1.8rem)] leading-[1.15] font-bold">
                Daftar sebagai teknisi
              </h1>
              <p className="mt-[0.45rem] text-[0.8rem] text-[#34383f]">
                Kirim bukti keahlian kamu agar moderator dapat menilai kelayakan
                menjadi teknisi komunitas.
              </p>
            </div>

            {error && (
              <p
                className="-mt-6 mb-4 text-center text-[0.85rem] text-[#cc3300]"
                role="alert"
              >
                {error}
              </p>
            )}

            <div className="mx-auto grid w-full max-w-lg gap-5 [&_input]:min-h-12">
              <DashedInput
                type="text"
                label="URL bukti / portofolio"
                placeholder="https://drive.google.com/..."
                value={proofUrl}
                onChange={(event) => setProofUrl(event.target.value)}
                hint="Contoh: link portfolio, drive, atau foto bukti kerja yang relevan."
                required
              />
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
              <Button
                type="button"
                variant="black"
                size="sm"
                className="!rounded-none !shadow-none border-2 border-black px-3 py-1.5 font-[Outfit] text-sm font-bold tracking-wide"
                onClick={() => router.push("/login")}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="orange"
                size="md"
                className="!rounded-none !shadow-none border-2 border-black px-3 py-1.5 font-[Outfit] text-sm font-bold tracking-wide"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Mengirim..." : "Kirim pengajuan"}
              </Button>
            </div>
          </form>
        )}
      </RegisterWindow>
    </main>
  );
}
