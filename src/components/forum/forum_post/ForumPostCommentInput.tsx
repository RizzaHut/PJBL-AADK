"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";

interface ForumPostCommentInputProps {
  onSubmit: (content: string) => void;
  disabled?: boolean;
}

export default function ForumPostCommentInput({
  onSubmit,
  disabled = false,
}: ForumPostCommentInputProps) {
  const t = useTranslations("forumDetail");
  const [content, setContent] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent || disabled) return;
    onSubmit(trimmedContent);
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center border border-black bg-[#ef542b] text-xs font-bold">
        R
      </span>
      <label className="sr-only" htmlFor="forum-post-comment-content">
        {t("commentLabel")}
      </label>
      <input
        id="forum-post-comment-content"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={t("commentPlaceholder")}
        disabled={disabled}
        className="h-12 min-w-0 flex-1 rounded-xl border-2 border-black bg-white px-5 text-sm outline-none placeholder:text-black/50 disabled:cursor-not-allowed"
      />
      <button
        type="submit"
        disabled={disabled || !content.trim()}
        aria-label={t("submitAriaLabel")}
        className="grid h-10 w-10 shrink-0 place-items-center transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <img src="/assets/Icons/send.svg" alt="" className="h-6 w-6" />
      </button>
    </form>
  );
}
