import { useTranslations } from "next-intl";

interface ForumPostActionsProps {
  likes: number;
  comments: number;
  isLiked: boolean;
  onLike: () => void;
}

export default function ForumPostActions({
  likes,
  comments,
  isLiked,
  onLike,
}: ForumPostActionsProps) {
  const t = useTranslations("forum");

  return (
    <div className="mt-8 flex flex-wrap items-center gap-5 border-y border-black/60 py-4 text-sm font-semibold">
      <button
        type="button"
        onClick={onLike}
        aria-pressed={isLiked}
        className={`inline-flex items-center gap-2 ${isLiked ? "text-[#ed0011]" : ""}`}
      >
        <img src="/assets/Icons/like.svg" alt="" className="h-5 w-5" />
        {likes + (isLiked ? 1 : 0)} {t("postActions.like")}
      </button>
      <span className="inline-flex items-center gap-2">
        <img src="/assets/Icons/comment.svg" alt="" className="h-5 w-5" />
        {comments} {t("postActions.comments")}
      </span>
    </div>
  );
}
