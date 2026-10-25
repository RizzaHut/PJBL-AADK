import { useTranslations } from "next-intl";
import { Tiny5 } from "next/font/google";

const tiny5 = Tiny5({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export function LoginHeroPanel() {
  const t = useTranslations("auth.login");

  return (
    <section className="flex flex-none flex-col justify-center gap-9 bg-[#8FD1FA] px-[8vw] py-14 md:basis-[44%] md:px-[6vw] md:py-0">
      <div className="flex flex-col gap-6">
        <h1
          className={`${tiny5.className} w-fit text-[48px] leading-none tracking-[6px] text-[#2F86D6] md:text-[72px]`}
          style={{
            textShadow:
              "1px 1px 0 #14161A, 2px 2px 0 #14161A, 3px 3px 0 #14161A, 4px 4px 0 #14161A, 5px 5px 0 #14161A, 6px 6px 0 #14161A",
          }}
        >
          AADK
        </h1>
        <p className="max-w-[320px] text-[19px] font-medium leading-[1.45] text-[#14161A]">
          {t("heroTagline")}
        </p>
      </div>
      <p className="text-[15px] font-medium text-[#14161A]">{t("copyright")}</p>
    </section>
  );
}
