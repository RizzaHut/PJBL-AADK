import { useTranslations } from "next-intl";
import type { ForumPostDetail } from "@/lib/forum-data";

const TAG_COLORS = [
  "bg-[#ed0011] text-white",
  "bg-[#107c10] text-white",
  "bg-[#0876c9] text-white",
  "bg-[#f4c542] text-black",
];

interface ForumPostHeaderProps {
  post: ForumPostDetail;
  onBack: () => void;
}

export default function ForumPostHeader({
  post,
  onBack,
}: ForumPostHeaderProps) {
  const t = useTranslations("forumDetail");

  return (
    <div className="mx-auto max-w-7xl pt-24 sm:pt-28 lg:pl-75">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-semibold underline underline-offset-4 hover:no-underline"
      >
        ← {t("backToForum")}
      </button>
      <div className="mt-7 max-w-4xl">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center border-2 border-black bg-[#8fbd79] text-lg font-bold">
            {post.authorName.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="font-bold">{post.authorName}</p>
            <p className="text-xs text-black/60">
              {post.createdAt} · {post.brand}
            </p>
          </div>
        </div>
        <h1 className="mt-5 max-w-4xl font-['Outfit',sans-serif] text-2xl font-bold leading-tight sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-5 flex flex-wrap gap-2">
          {post.tags.map((tag, index) => (
            <span
              key={tag}
              className={`rounded-full px-3 py-1 text-xs font-bold ${TAG_COLORS[index % TAG_COLORS.length]}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
