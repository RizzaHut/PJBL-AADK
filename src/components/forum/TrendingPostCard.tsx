import { useId } from "react";
import { useTranslations } from "next-intl";
import type { ForumPostCardProps } from "@/components/forum/ForumPostCard";

const CRT_PATH =
  "M6.06858 11.7975C6.31202 10.1581 7.18752 8.78462 8.75527 8.24703C15.8373 5.81859 43.5525 1.18847e-06 146.549 0C261.16 0 279.448 7.20479 282.182 8.92601C282.517 9.13713 282.713 9.46801 282.846 9.8412C284.087 13.3201 290.426 34.2804 290.426 99.4253C290.426 159.007 285.124 180.002 283.269 185.523C282.896 186.633 282.306 187.72 281.238 188.2C276.203 190.462 253.047 195.665 146.549 195.665C32.2051 195.665 11.1071 189.667 7.28422 187.751C6.67414 187.445 6.39788 186.835 6.29063 186.161C5.29305 179.892 0.0893432 145.029 0.00108038 99.4253C-0.082125 56.4346 4.66434 21.2539 6.06858 11.7975Z";

interface TrendingPostCardProps {
  post: ForumPostCardProps;
  onClick?: () => void;
}

export default function TrendingPostCard({
  post,
  onClick,
}: TrendingPostCardProps) {
  const t = useTranslations("forum");
  const frameColor =
    post.crtColor === "green"
      ? "#8fbd79"
      : post.crtColor === "blue"
        ? "#0876c9"
        : "#f4512b";
  const clipPathId = useId();
  const overlayGradientId = `${clipPathId}-overlay`;

  return (
    <article
      className="group relative aspect-291/196 min-w-0 cursor-pointer transition-transform duration-200 hover:-translate-y-1"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
      aria-label={t("openPost", { title: post.title })}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="-5 -5 301 206"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipPathId}>
            <path d={CRT_PATH} />
          </clipPath>
          <linearGradient id={overlayGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="35%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <image
          href={post.thumbnail}
          x="0"
          y="0"
          width="291"
          height="196"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipPathId})`}
          opacity="0.9"
        />
        <path d={CRT_PATH} fill={`url(#${overlayGradientId})`} />
        <path d={CRT_PATH} fill="none" stroke={frameColor} strokeWidth="9" />
      </svg>
      <div className="pointer-events-none absolute inset-[7%_6%_8%] text-white">
        <div className="absolute inset-x-[7%] bottom-[8%]">
          <h3 className="line-clamp-2 text-[clamp(0.72rem,1.2vw,1.05rem)] font-medium leading-tight">
            {post.title}
          </h3>
          <p className="mt-2 truncate text-[clamp(0.5rem,0.75vw,0.7rem)] text-white/80">
            {post.authorName} · {post.createdAt}
          </p>
        </div>
      </div>
    </article>
  );
}
