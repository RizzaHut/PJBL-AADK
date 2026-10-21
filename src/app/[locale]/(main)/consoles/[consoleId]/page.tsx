"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Outfit, Tiny5 } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GlitchFrame from "@/components/shared/borders/GlitchFrame";
import SidebarTabNav from "@/components/shared/nav/SidebarTabNav";
import ConsoleNameWindow from "@/components/console/ConsoleNameWindow";
import ConsoleModelCarousel from "@/components/console/ConsoleModelCarousel";
import TutorialCard from "@/components/shared/cards/TutorialCard";
import { getConsoleDetail } from "@/lib/console-data";

const tiny5 = Tiny5({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-tiny5",
});
const outfit = Outfit({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-outfit",
});

export default function ConsoleDetailPage() {
  const params = useParams<{ consoleId: string }>();
  const t = useTranslations("consoleDetail");
  const consoleDetail = getConsoleDetail(params.consoleId);
  const NAV_TABS = [
    { id: "description", label: t("tabs.description") },
    { id: "models", label: t("tabs.models") },
    { id: "tutorials", label: t("tabs.tutorials") },
  ];

  function SectionHeading({ children }: { children: string }) {
    return (
      <h2 className="border-b-2 border-black pb-2 font-['Tiny5',monospace] text-2xl uppercase tracking-[0.08em] sm:text-3xl">
        {children}
      </h2>
    );
  }

  if (!consoleDetail) {
    return (
      <main
        className={`${outfit.variable} min-h-screen bg-[#eef1ff] px-4 py-8 font-['Outfit',sans-serif] text-black`}
      >
        <Navbar floating={false} />
        <section className="mx-auto max-w-3xl py-24 text-center">
          <p className="font-['Tiny5',monospace] text-7xl text-[#0876c9] drop-shadow-[4px_4px_0_#000]">
            404
          </p>
          <h1 className="mt-5 text-3xl font-bold">{t("notFoundTitle")}</h1>
          <p className="mt-2 text-black/70">{t("notFoundDescription")}</p>
          <Link
            href="/consoles"
            className="mt-6 inline-flex border-2 border-black bg-[#f4c542] px-5 py-3 font-bold shadow-[3px_3px_0_#000]"
          >
            {t("backToList")}
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main
      className={`${tiny5.variable} ${outfit.variable} min-h-screen bg-[#eef1ff] font-['Outfit',sans-serif] text-black`}
    >
      <section className="relative overflow-visible bg-[#eef1ff] px-2 pb-10 pt-2 sm:px-4 sm:pb-12 sm:pt-3">
        <Navbar floating />
        <div className="mx-auto mt-4 max-w-7xl sm:mt-6">
          <div className="relative">
            <GlitchFrame
              src={consoleDetail.heroImage}
              alt={`${consoleDetail.name} console`}
              priority
              className="mx-auto max-w-6xl"
            />
            <ConsoleNameWindow
              consoleName={consoleDetail.name}
              brand={consoleDetail.brand}
              className="absolute bottom-3 left-4 z-10 sm:bottom-5 sm:left-12"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-2 py-8 sm:px-4 sm:py-10 lg:grid-cols-[170px_minmax(0,1fr)] lg:gap-8">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <SidebarTabNav tabs={NAV_TABS} />
        </aside>

        <div className="min-w-0 space-y-16 sm:space-y-20">
          <section id="description" className="scroll-mt-8">
            <SectionHeading>{t("sectionDescription")}</SectionHeading>
            <div className="mt-6 w-full space-y-4 text-justify text-sm leading-relaxed text-black/80">
              {consoleDetail.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section id="models" className="scroll-mt-8">
            <SectionHeading>{t("sectionModels")}</SectionHeading>
            <div className="mt-7">
              <ConsoleModelCarousel models={consoleDetail.models} />
            </div>
          </section>

          <section id="tutorials" className="scroll-mt-8">
            <SectionHeading>{t("sectionTutorials")}</SectionHeading>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {consoleDetail.tutorials.length > 0 ? (
                consoleDetail.tutorials.map((tutorial) => (
                  <TutorialCard
                    key={tutorial.id}
                    consoleId={consoleDetail.id}
                    tutorialId={tutorial.id}
                    {...tutorial}
                  />
                ))
              ) : (
                <p className="border-2 border-dashed border-black/50 bg-white px-5 py-8 text-sm text-black/70 sm:col-span-2">
                  {t("emptyTutorials")}
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
