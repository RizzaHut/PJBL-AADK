"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Outfit, Tiny5 } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ForumPostCommentInput from "@/components/forum/forum_post/ForumPostCommentInput";
import SidebarTabNav from "@/components/shared/nav/SidebarTabNav";
import CommentBubble from "@/components/shared/feedback/CommentBubble";
import TutorialHeader from "@/components/tutorial/TutorialHeader";
import TutorialStepAccordion from "@/components/tutorial/TutorialStepAccordion";
import WarningPanel from "@/components/tutorial/WarningPanel";
import { getTutorialDetail } from "@/lib/tutorial-data";

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

export default function TutorialDetailPage() {
  const params = useParams<{ consoleId: string; tutorialId: string }>();
  const t = useTranslations("tutorial");
  const tutorial = getTutorialDetail(params.consoleId, params.tutorialId);
  const [comments, setComments] = useState(() => tutorial?.comments ?? []);
  const NAV_TABS = [
    { id: "tools", label: t("tabs.tools") },
    { id: "warning", label: t("tabs.warning") },
    { id: "steps", label: t("tabs.steps") },
    { id: "comments", label: t("tabs.comments") },
  ];

  function SectionHeading({ children }: { children: string }) {
    return (
      <h2 className="border-b-2 border-black pb-2 font-['Tiny5',monospace] text-2xl uppercase tracking-[0.08em] sm:text-3xl">
        {children}
      </h2>
    );
  }

  if (!tutorial) {
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
            href={`/consoles/${params.consoleId}`}
            className="mt-6 inline-flex border-2 border-black bg-[#f4c542] px-5 py-3 font-bold shadow-[3px_3px_0_#000] hover:bg-[#ffd85d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            {t("backToConsole")}
          </Link>
        </section>
      </main>
    );
  }

  const handleCommentSubmit = (content: string) => {
    setComments((currentComments) => [
      ...currentComments,
      {
        id: `local-${currentComments.length + 1}`,
        authorName: t("commentUser"),
        createdAt: t("commentJustNow"),
        content,
      },
    ]);
  };

  return (
    <main
      className={`${tiny5.variable} ${outfit.variable} min-h-screen bg-[#eef1ff] font-['Outfit',sans-serif] text-black`}
    >
      <section className="px-2 pb-10 pt-2 sm:px-4 sm:pb-12 sm:pt-3">
        <Navbar floating />
        <div className="mx-auto mt-20 max-w-2xl sm:mt-24">
          <TutorialHeader {...tutorial} />
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-2 py-8 sm:px-4 sm:py-10 lg:grid-cols-[170px_minmax(0,1fr)] lg:gap-8">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <SidebarTabNav tabs={NAV_TABS} />
        </aside>

        <div className="min-w-0 space-y-16 sm:space-y-20">
          <section id="tools" className="scroll-mt-8">
            <SectionHeading>{t("sectionTools")}</SectionHeading>
            <div className="mt-6 grid gap-6 text-sm leading-relaxed sm:grid-cols-2">
              <div>
                <h3 className="font-bold">{t("toolsLabel")}</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {tutorial.tools.map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold">{t("materialsLabel")}</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {tutorial.materials.map((material) => (
                    <li key={material}>{material}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section id="warning" className="scroll-mt-8">
            <SectionHeading>{t("sectionWarning")}</SectionHeading>
            <div className="mt-7">
              <WarningPanel warnings={tutorial.warnings} tips={tutorial.tips} />
            </div>
          </section>

          <section id="steps" className="scroll-mt-8">
            <SectionHeading>{t("sectionSteps")}</SectionHeading>
            <div className="mt-4">
              {tutorial.steps.map((step, index) => (
                <TutorialStepAccordion
                  key={step.number}
                  step={step}
                  defaultOpen={index === 0}
                />
              ))}
            </div>
          </section>

          <section id="comments" className="scroll-mt-8">
            <SectionHeading>{t("sectionComments")}</SectionHeading>
            <div className="mt-6 space-y-5">
              <ForumPostCommentInput onSubmit={handleCommentSubmit} />
              <div className="space-y-5 border-t border-black/10 pt-5">
                {comments.map((comment) => (
                  <CommentBubble key={comment.id} {...comment} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
