'use client';

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { PostWithAuthor, PostWithCategory } from "@/types/post";

type FullPost = PostWithAuthor & PostWithCategory & {
  _id: string;
  content: string;
  views: number;
  likes: number;
  liked: boolean;
  createdAt: string;
  subcategory?: { name: string };
};

export default function PostDetailClient({ slug }: { slug: string }) {
  const [post, setPost] = useState<FullPost | null>(null);
  const [loading, setLoading] = useState(true);

  const decodedSlug = decodeURIComponent(slug);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts?slug=${decodedSlug}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          setPost(data.post);
        } else {
          console.error(data.error || "Failed to load post");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [decodedSlug]);

  const handleLike = async () => {
    if (!post) return;

    try {
      const res = await fetch(`/api/posts/${post.slug}/like`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setPost((prev) =>
          prev
            ? {
                ...prev,
                likes: data.likes,
                liked: data.liked,
              }
            : null
        );
      }
    } catch (error) {
      console.error("Like failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-gray-600 text-center">
        Loading post...
      </div>
    );
  }

  if (!post) return notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <article>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
          {post.title}
        </h1>

        <div className="text-sm text-gray-500 mb-6">
          By {post.author?.username || "Unknown"} ·{" "}
          <span className="italic">
            {post.category?.name || "Uncategorized"}
            {post.subcategory?.name ? ` → ${post.subcategory.name}` : ""}
          </span>{" "}
          · {new Date(post.createdAt).toLocaleDateString()}
        </div>

        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-10 border-t pt-6 text-sm text-gray-500 space-y-1">
          <p>👁 Views: {post.views || 0}</p>
          <p>
            ❤️ Likes: {post.likes || 0}{" "}
            <button
              onClick={handleLike}
              className={`ml-2 px-3 py-1 text-xs rounded ${
                post.liked ? "bg-red-600" : "bg-blue-600"
              } text-white`}
            >
              {post.liked ? "Unlike" : "Like"}
            </button>
          </p>
          <p>💬 Comments: Coming soon</p>
        </div>
      </article>
    </main>
  );
}
