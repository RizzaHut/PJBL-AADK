"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { MoreHorizontal } from "lucide-react";
import { Link } from "@/i18n/navigation";

export interface ForumPostCardProps {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  brand: string;
  console: string;
  topic: string;
  authorName: string;
  authorAvatar?: string;
  likes: number;
  comments: number;
  readers: number;
  createdAt: string;
  thumbnail: string;
  accentColor?: "red" | "blue" | "green";
  crtColor?: "orange" | "green" | "blue";
  onClick?: () => void;
}

const TOPIC_COLORS: Record<string, string> = {
  "Hardware & Technical": "bg-[#bd2028] text-white",
  "Software & System": "bg-[#1551a3] text-white",
  "Server & Network": "bg-[#0796d2] text-white",
  "Accessories & Controller": "bg-[#f27c00] text-white",
  "Storage & Memory": "bg-[#008b7d] text-white",
  "Maintenance & Care": "bg-[#2c8637] text-white",
  "Service & Spare Part": "bg-[#64483e] text-white",
  General: "bg-[#8120a8] text-white",
};

const CARD_SHADOWS = {
  red: "shadow-[3px_3px_0_#ef542b] hover:shadow-[5px_5px_0_#ef542b]",
  blue: "shadow-[3px_3px_0_#2f66c5] hover:shadow-[5px_5px_0_#2f66c5]",
  green: "shadow-[3px_3px_0_#8fbd79] hover:shadow-[5px_5px_0_#8fbd79]",
} as const;

export default function ForumPostCard({
  id,
  title,
  excerpt,
  topic,
  authorName,
  authorAvatar,
  likes,
  comments,
  createdAt,
  thumbnail,
  accentColor = "red",
  onClick,
}: ForumPostCardProps) {
  const t = useTranslations("forum");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportMessage, setReportMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isMenuOpen]);

  const openReportModal = () => {
    setIsMenuOpen(false);
    setReportMessage(null);
    setReportReason("");
    setIsReportOpen(true);
  };

  const closeReportModal = () => {
    setIsReportOpen(false);
    setReportReason("");
    setReportMessage(null);
  };

  const handleReportSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedReason = reportReason.trim();
    if (!trimmedReason) {
      setReportMessage({
        type: "error",
        text: t("postCard.reportReasonRequired"),
      });
      return;
    }

    setIsSubmitting(true);
    setReportMessage(null);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target_id: id,
          target_type: "postingan_forum",
          alasan: trimmedReason,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ?? payload.message ?? t("postCard.error"),
        );
      }

      setReportMessage({
        type: "success",
        text: payload.message ?? t("postCard.success"),
      });
      setReportReason("");
      setTimeout(() => {
        setIsReportOpen(false);
        setReportMessage(null);
      }, 1200);
    } catch (error) {
      setReportMessage({
        type: "error",
        text: error instanceof Error ? error.message : t("postCard.error"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className={`group relative flex h-fit self-start flex-col rounded-md border border-black bg-white p-3 transition-transform duration-200 hover:-translate-y-1 ${CARD_SHADOWS[accentColor]}`}
      >
        <Link href={`/forum/${id}`} onClick={onClick} className="block">
          <div className="flex items-center gap-2">
            {authorAvatar ? (
              <Image
                src={authorAvatar}
                alt=""
                width={24}
                height={24}
                className="h-7 w-7 border border-black object-cover"
              />
            ) : (
              <span className="grid h-7 w-7 place-items-center border border-black bg-[#107c10] text-[10px] font-bold text-white">
                {authorName.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 text-[11px] leading-tight">
              <p className="truncate font-bold">{authorName}</p>
              <p className="text-[9px] text-black/55">{createdAt}</p>
            </div>
          </div>
          <h3 className="mt-3 line-clamp-2 text-[15px] font-semibold leading-tight">
            {title}
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${TOPIC_COLORS[topic] ?? "bg-[#e8e8e8] text-[#334155]"}`}
            >
              {topic}
            </span>
          </div>
          <div className="relative mt-3 aspect-video overflow-hidden border border-black bg-[#e8e8e8]">
            <Image
              src={thumbnail}
              alt=""
              fill
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 42vw, 260px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <p className="mt-3 line-clamp-2 text-[11px] leading-snug text-black/75">
            {excerpt} <span className="font-semibold">{t("postCard.readMore")}</span>
          </p>
        </Link>

        <div className="mt-4 flex items-center justify-between border-t border-black/60 pt-3">
          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-label={t("postCard.report")}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsMenuOpen((current) => !current);
              }}
              className="grid h-7 w-7 place-items-center rounded-md border border-black bg-white text-black transition-colors hover:bg-[#f5f5f5]"
            >
              <MoreHorizontal size={16} />
            </button>

            {isMenuOpen && (
              <div className="absolute left-0 top-9 z-20 min-w-[170px] rounded-md border border-black bg-white shadow-[3px_3px_0_#000]">
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    openReportModal();
                  }}
                  className="w-full px-3 py-2 text-left text-[11px] font-semibold text-black transition-colors hover:bg-[#f5f5f5]"
                >
                  {t("postCard.report")}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-[10px] font-semibold text-black/75">
            <span className="inline-flex items-center gap-1">
              <img src="/assets/Icons/like.svg" alt="" className="h-4 w-4" />
              {likes}
            </span>
            <span className="inline-flex items-center gap-1">
              <img src="/assets/Icons/comment.svg" alt="" className="h-4 w-4" />
              {comments}
            </span>
          </div>
        </div>
      </div>

      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px]"
            onClick={closeReportModal}
          />

          <div className="relative z-10 w-full max-w-lg rounded-md border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/60">
                  {t("postCard.moderation")}
                </p>
                <h3 className="mt-1 text-xl font-bold">{t("postCard.reportTitle")}</h3>
              </div>
              <button
                type="button"
                onClick={closeReportModal}
                className="grid h-8 w-8 place-items-center rounded-md border border-black bg-[#f0f0f0] text-sm font-bold"
                aria-label={t("postCard.closeReport")}
              >
                ×
              </button>
            </div>

            <p className="mt-3 text-[12px] text-black/65">
              {t("postCard.titleLabel")} <span className="font-semibold">{title}</span>
            </p>

            <form onSubmit={handleReportSubmit} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-black/70">
                  {t("postCard.targetType")}
                </label>
                <input
                  readOnly
                  value="postingan_forum"
                  className="w-full rounded-md border border-black bg-[#f6f6f6] px-3 py-2 text-sm text-black outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-black/70">
                  {t("postCard.targetId")}
                </label>
                <input
                  readOnly
                  value={id}
                  className="w-full rounded-md border border-black bg-[#f6f6f6] px-3 py-2 text-sm text-black outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-black/70">
                  {t("postCard.reportReason")}
                </label>
                <textarea
                  value={reportReason}
                  onChange={(event) => setReportReason(event.target.value)}
                  rows={5}
                  placeholder={t("postCard.reportReasonPlaceholder")}
                  className="w-full resize-none rounded-md border border-black bg-white px-3 py-2 text-sm text-black outline-none placeholder:text-black/40"
                  required
                />
              </div>

              {reportMessage && (
                <p
                  className={`text-[12px] font-medium ${
                    reportMessage.type === "success"
                      ? "text-[#0b7a35]"
                      : "text-[#b42318]"
                  }`}
                >
                  {reportMessage.text}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeReportModal}
                  className="border border-black bg-white px-4 py-2 text-sm font-bold text-black"
                >
                  {t("postCard.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="border border-black bg-[#f4c542] px-4 py-2 text-sm font-bold text-black shadow-[2px_2px_0_#000] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? t("postCard.submitting") : t("postCard.submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
