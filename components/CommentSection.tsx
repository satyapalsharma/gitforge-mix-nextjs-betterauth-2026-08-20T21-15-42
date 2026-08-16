"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import type { Comment } from "@/src/types/comment";

export interface CommentSectionProps {
  taskId: string;
}

export default function CommentSection({ taskId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reply state: which comment is being replied to (null = top-level)
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/tasks/${encodeURIComponent(taskId)}/comments`
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as Comment[];
      setComments(data);
    } catch (err) {
      console.error("Failed to load comments:", err);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = newContent.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(
        `/api/tasks/${encodeURIComponent(taskId)}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: trimmed }),
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${response.status}`);
      }

      setNewContent("");
      await fetchComments();
    } catch (err) {
      console.error("Failed to post comment:", err);
      setSubmitError(
        err instanceof Error ? err.message : "Failed to post comment"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReplySubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = replyContent.trim();
    if (!trimmed || !replyToId) return;

    setReplySubmitting(true);
    setReplyError(null);

    try {
      const response = await fetch(
        `/api/tasks/${encodeURIComponent(taskId)}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: trimmed, parentId: replyToId }),
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${response.status}`);
      }

      setReplyContent("");
      setReplyToId(null);
      await fetchComments();
    } catch (err) {
      console.error("Failed to post reply:", err);
      setReplyError(
        err instanceof Error ? err.message : "Failed to post reply"
      );
    } finally {
      setReplySubmitting(false);
    }
  }

  function startReply(commentId: string) {
    setReplyToId(commentId);
    setReplyContent("");
    setReplyError(null);
  }

  function cancelReply() {
    setReplyToId(null);
    setReplyContent("");
    setReplyError(null);
  }

  // Build a tree: top-level comments (parentId === null) with their children
  const topLevelComments = comments.filter((c) => c.parentId === null);

  function getReplies(parentId: string): Comment[] {
    return comments.filter((c) => c.parentId === parentId);
  }

  function formatDate(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleString();
  }

  function renderComment(comment: Comment, depth: number = 0) {
    const replies = getReplies(comment.id);
    const isReplying = replyToId === comment.id;

    return (
      <li key={comment.id} className={depth > 0 ? "ml-8 border-l-2 pl-4" : ""}>
        <div className="border-b p-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">
              {comment.userName ?? "Unknown user"}
            </span>
            <span>{formatDate(comment.createdAt)}</span>
          </div>
          <p className="mt-1 whitespace-pre-wrap">{comment.content}</p>
          <button
            type="button"
            onClick={() => startReply(comment.id)}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Reply
          </button>
        </div>

        {/* Reply form inline */}
        {isReplying && (
          <form onSubmit={handleReplySubmit} className="mt-2 ml-4">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={2}
              placeholder="Write a reply..."
              className="w-full border rounded p-2"
              autoFocus
            />
            {replyError && (
              <p className="mt-1 text-sm text-red-600">{replyError}</p>
            )}
            <div className="mt-2 flex gap-2">
              <button
                type="submit"
                disabled={replySubmitting}
                className="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50"
              >
                {replySubmitting ? "Posting..." : "Post Reply"}
              </button>
              <button
                type="button"
                onClick={cancelReply}
                className="rounded border px-3 py-1 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Nested replies */}
        {replies.length > 0 && (
          <ul className="mt-1">
            {replies.map((reply) => renderComment(reply, depth + 1))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h2 className="mb-4 text-xl font-bold">Comments</h2>

      {/* New comment form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows={3}
          placeholder="Write a comment..."
          className="w-full border rounded p-2"
        />
        {submitError && (
          <p className="mt-1 text-sm text-red-600">{submitError}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? "Posting..." : "Post"}
        </button>
      </form>

      {/* Comments list */}
      {loading && <p>Loading comments...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <ul>
          {topLevelComments.length === 0 ? (
            <li className="p-2 text-gray-500">No comments yet.</li>
          ) : (
            topLevelComments.map((comment) => renderComment(comment, 0))
          )}
        </ul>
      )}
    </div>
  );
}
