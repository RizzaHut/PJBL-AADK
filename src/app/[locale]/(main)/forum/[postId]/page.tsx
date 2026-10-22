"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Outfit, Tiny5 } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PixelBorder from "@/components/shared/borders/PixelBorder";
import TrendingPostCard from "@/components/forum/TrendingPostCard";
import ForumPostActions from "@/components/forum/forum_post/ForumPostActions";
import ForumPostComments from "@/components/forum/forum_post/ForumPostComments";
import ForumPostContent from "@/components/forum/forum_post/ForumPostContent";
import ForumPostHeader from "@/components/forum/forum_post/ForumPostHeader";
import {
  getForumPostDetail,
  getTrendingPosts,
  type ForumComment,
} from "@/lib/forum-data";

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

const EMPTY_COMMENTS: ForumComment[] = [];

export default function ForumPostDetailPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const t = useTranslations("forumDetail");
  const post = getForumPostDetail(params.postId);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<ForumComment[]>(
    post?.commentsData ?? EMPTY_COMMENTS,
  );

  if (!post) {
    return (
      <main
        className={`${outfit.variable} min-h-screen bg-[#eef1ff] font-['Outfit',sans-serif]`}
      >
        <section className="relative bg-[#82c3f8] px-4 pb-28 pt-5 sm:px-8">
          <Navbar floating />
          <div className="mx-auto max-w-3xl pt-24 text-center">
            <p className="font-['Tiny5',monospace] text-6xl text-[#0876c9] drop-shadow-[3px_3px_0_#000]">
              404
            </p>
            <h1 className="mt-4 text-3xl font-bold">{t("notFoundTitle")}</h1>
            <p className="mt-2 text-black/70">{t("notFoundDescription")}</p>
            <Link
              href="/forum"
              className="mt-6 inline-flex border-2 border-black bg-[#f4c542] px-5 py-3 font-bold shadow-[3px_3px_0_#000]"
            >
              {t("backToForum")}
            </Link>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <PixelBorder direction="horizontal" color="#ffffff" />
          </div>
        </section>
        <Footer />
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
      className={`${tiny5.variable} ${outfit.variable} min-h-screen bg-white font-['Outfit',sans-serif] text-black`}
    >
      <div className="relative pb-32 lg:pb-48">
        <aside className="relative z-20 mx-4 border border-black bg-white p-4 sm:mx-8 lg:absolute lg:left-[max(2rem,calc((100vw-1280px)/2))] lg:top-28 lg:mx-0 lg:w-65">
          <h2 className="text-2xl font-bold">{t("trending")}</h2>
          <div className="mt-5 space-y-6">
            {getTrendingPosts().map((trendingPost) => (
              <TrendingPostCard
                key={trendingPost.id}
                post={trendingPost}
                onClick={() => router.push(`/forum/${trendingPost.id}`)}
              />
            ))}
          </div>
        </aside>

        <section className="relative bg-[#82c3f8] px-4 pb-24 pt-5 sm:px-8 sm:pb-28">
          <Navbar floating />
          <ForumPostHeader post={post} onBack={() => router.push("/forum")} />
          <div className="absolute bottom-0 left-0 right-0">
            <PixelBorder direction="horizontal" color="#ffffff" />
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14 lg:pl-75">
          <article className="min-w-0">
            <ForumPostContent post={post} />
            <ForumPostActions
              likes={post.likes}
              comments={comments.length || post.comments}
              isLiked={isLiked}
              onLike={() => setIsLiked((liked) => !liked)}
            />
            <ForumPostComments
              comments={comments}
              onSubmit={handleCommentSubmit}
            />
          </article>
        </div>
      </div>
      <Footer />
    </main>
  );
}
