"use client";

import { useEffect, useState, MouseEvent } from "react";
import Link from "next/link";
import { Heart, ThumbsDown, MessageSquare, Eye } from "lucide-react";
import { Comment, Post } from "@/types/index";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/posts?page=${pageNumber}&status=published`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      const newPosts: Post[] = data.posts || [];

      if (pageNumber === 1) setPosts(newPosts);
      else setPosts((prev) => [...prev, ...newPosts]);

      

      setHasMore(pageNumber < (data.pagination?.totalPages || 1));
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setLoading(false);
    }
  };

  

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const fetchComments = async (slug: string) => {
    try {
      const res = await fetch(`/api/posts/${slug}/comments`, {
        credentials: "include",
      });
      const data = await res.json();
      setComments((prev) => ({ ...prev, [slug]: data.comments || [] }));
    } catch (err) {
      console.error("Failed to load comments", err);
    }
  };

  const handleLike = async (e: MouseEvent, slug: string) => {
    e.preventDefault();
    const res = await fetch(`/api/posts/${slug}/like`, {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json();
    setPosts((prev) =>
      prev.map((p) =>
        p.slug === slug
          ? {
              ...p,
              likes: data.likes,
              liked: data.liked,
              dislikes: data.disliked
                ? Math.max((p.dislikes || 0) - 1, 0)
                : p.dislikes,
              disliked: data.disliked ? false : p.disliked,
            }
          : p
      )
    );
  };

  const handleDislike = async (e: MouseEvent, slug: string) => {
    e.preventDefault();
    const res = await fetch(`/api/posts/${slug}/dislike`, {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json();
    setPosts((prev) =>
      prev.map((p) =>
        p.slug === slug
          ? {
              ...p,
              dislikes: data.dislikes,
              disliked: data.disliked,
              likes: data.disliked ? Math.max((p.likes || 0) - 1, 0) : p.likes,
              liked: data.disliked ? false : p.liked,
            }
          : p
      )
    );
  };

  const handleCommentSubmit = async (slug: string) => {
    try {
      await fetch(`/api/posts/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: newComment[slug] }),
      });
      setNewComment((prev) => ({ ...prev, [slug]: "" }));
      fetchComments(slug);
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  const handleCommentDelete = async (slug: string, commentId: string) => {
    try {
      await fetch(`/api/posts/${slug}/comments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ commentId }),
      });
      fetchComments(slug);
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  const handleCommentEdit = async (slug: string, commentId: string) => {
    try {
      await fetch(`/api/posts/${slug}/comments`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ commentId, text: editingContent }),
      });
      setEditingCommentId(null);
      setEditingContent("");
      fetchComments(slug);
    } catch (err) {
      console.error("Failed to edit comment", err);
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-16 px-4 md:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to My Blog</h1>
          <p className="text-xl text-gray-300">
            Ideas, guides, and stories from creators to creators.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        {loading && posts.length === 0 ? (
          <p className="text-center">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-center">No posts yet. Come back later!</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {posts.map((post) => (
              <div
                key={post._id?.toString()}
                className="border rounded-lg p-6 mb-8"
              >
                <Link href={`/posts/${post.slug}`} className="block">
                  <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
                  <p className="text-sm text-gray-500 mb-2">
                    By {post.author?.username || "Unknown"} ·{" "}
                    {post.category?.name}
                    {typeof post.subcategory === "object" &&
                      "name" in post.subcategory && (
                        <> → {(post.subcategory as { name: string }).name}</>
                      )}
                  </p>
                  <p className="text-gray-600 mb-4">
                    {sanitizePreview(post.content)}
                  </p>
                </Link>

                <div className="flex gap-4 mb-4">
                  <button
                    onClick={(e) => handleLike(e, post.slug)}
                    className={`px-3 py-1 flex justify-center items-center gap-2 rounded text-white ${
                      post.likes ? "bg-red-600" : "bg-blue-600"
                    }`}
                  >
                    <Heart size={16} /> {post.likes || 0}
                  </button>
                  <button
                    onClick={(e) => handleDislike(e, post.slug)}
                    className={`px-3 py-1 flex justify-center items-center gap-2 rounded text-white ${
                      post.dislikes ? "bg-gray-700" : "bg-gray-500"
                    }`}
                  >
                    <ThumbsDown size={16} /> {post.dislikes || 0}
                  </button>
                  <button
                    onClick={() => fetchComments(post.slug)}
                    className="px-3 py-1 flex justify-center items-center gap-2 bg-green-600 text-white rounded"
                  >
                    <MessageSquare size={16} /> View Comments
                  </button>

                  <div className="flex items-center gap-1 text-gray-600 ml-auto">
                    <Eye size={16} />
                    <span className="text-sm">{post.views || 0}</span>
                  </div>
                </div>

                {comments[post.slug] && (
                  <div className="space-y-2">
                    {comments[post.slug].map((c) => (
                      <div
                        key={c._id?.toString()}
                        className="border p-2 rounded"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {c.userId.username}
                          </span>
                          <small className="text-gray-500">
                            {new Date(c.createdAt || "").toLocaleString()}
                          </small>
                        </div>
                        {editingCommentId === c._id?.toString() ? (
                          <div>
                            <textarea
                              value={editingContent}
                              onChange={(e) =>
                                setEditingContent(e.target.value)
                              }
                              className="w-full border p-1 mt-1"
                            />
                            <button
                              onClick={() => {
                                if (c._id)
                                  handleCommentEdit(
                                    post.slug,
                                    c._id.toString()
                                  );
                              }}
                              className="mt-1 bg-blue-500 text-white px-2 py-1 rounded"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <p>{c.text}</p>
                        )}
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => {
                              setEditingCommentId(c._id);
                              setEditingContent(c.text);
                            }}
                            className="text-sm text-blue-500"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleCommentDelete(post.slug, c._id)
                            }
                            className="text-sm text-red-500"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <textarea
                    value={newComment[post.slug] || ""}
                    onChange={(e) =>
                      setNewComment((prev) => ({
                        ...prev,
                        [post.slug]: e.target.value,
                      }))
                    }
                    placeholder="Write a comment..."
                    className="w-full border p-2 rounded"
                  />
                  <button
                    onClick={() => handleCommentSubmit(post.slug)}
                    className="mt-2 bg-black text-white px-4 py-1 rounded"
                  >
                    Comment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && !loading && (
          <div className="text-center mt-10">
            <button
              onClick={loadMore}
              className="px-6 py-2 text-white bg-gray-800 rounded hover:bg-black"
            >
              Load More
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function sanitizePreview(html: string): string {
  const textOnly = html.replace(/<[^>]+>/g, "");
  return textOnly.length > 180 ? textOnly.slice(0, 180) + "..." : textOnly;
}
