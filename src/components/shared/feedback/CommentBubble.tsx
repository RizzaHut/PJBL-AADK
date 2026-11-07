import Image from "next/image";

interface CommentBubbleProps {
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  content: string;
}

export default function CommentBubble({
  authorName,
  authorAvatar,
  createdAt,
  content,
}: CommentBubbleProps) {
  return (
    <article className="flex gap-3">
      {authorAvatar ? (
        <Image
          src={authorAvatar}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 border border-black object-cover"
        />
      ) : (
        <span className="grid h-8 w-8 shrink-0 place-items-center border border-black bg-[#8fbd79] text-xs font-bold">
          {authorName.charAt(0).toUpperCase()}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="text-xs font-bold">{authorName}</p>
          <p className="text-[10px] text-black/55">{createdAt}</p>
        </div>
        <div className="relative border-2 border-black bg-white px-4 py-3 text-sm leading-relaxed shadow-[2px_3px_0_#ef542b]">
          {content}
        </div>
      </div>
    </article>
  );
}
