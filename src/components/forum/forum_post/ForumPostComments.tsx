import CommentBubble from "@/components/shared/feedback/CommentBubble";
import ForumPostCommentInput from "@/components/forum/forum_post/ForumPostCommentInput";
import type { ForumComment } from "@/lib/forum-data";

interface ForumPostCommentsProps {
  comments: ForumComment[];
  onSubmit: (content: string) => void;
}

export default function ForumPostComments({
  comments,
  onSubmit,
}: ForumPostCommentsProps) {
  return (
    <section className="mt-8">
      <ForumPostCommentInput onSubmit={onSubmit} />
      <div className="mt-4 border-b border-black/60 pb-4" />
      <div className="mt-8 space-y-7">
        {comments.map((comment) => (
          <CommentBubble key={comment.id} {...comment} />
        ))}
      </div>
    </section>
  );
}
