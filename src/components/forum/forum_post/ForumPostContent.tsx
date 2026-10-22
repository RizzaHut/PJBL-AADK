import Image from "next/image";
import type { ForumPostDetail } from "@/lib/forum-data";

interface ForumPostContentProps {
  post: ForumPostDetail;
}

export default function ForumPostContent({ post }: ForumPostContentProps) {
  return (
    <section>
      {post.contentImage && (
        <div className="mb-7 w-full max-w-170 overflow-hidden border-2 border-black bg-black">
          <Image
            src={post.contentImage}
            alt="Ilustrasi post forum"
            width={1200}
            height={675}
            sizes="(max-width: 640px) 100vw, 680px"
            className="h-auto w-full object-contain"
          />
        </div>
      )}
      <div className="space-y-5 text-base leading-relaxed sm:text-lg">
        {post.content.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
