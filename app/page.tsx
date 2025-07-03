"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PostWithAuthor, PostWithCategory } from "@/types/post";

type PostType = PostWithAuthor &
  PostWithCategory & {
    liked: boolean;
    _id: string;
    subcategory?: { name: string }; // ✅ subcategory field
  };

export default function HomePage() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchPosts = async (pageNumber = 1): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/posts?page=${pageNumber}&status=published`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (pageNumber === 1) {
        setPosts(data.posts || []);
      } else {
        setPosts((prev) => [...prev, ...(data.posts || [])]);
      }

      const totalPages: number = data?.pagination?.totalPages || 1;
      setHasMore(pageNumber < totalPages);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const handleLike = async (
    e: React.MouseEvent<HTMLButtonElement>,
    slug: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await fetch(`/api/posts/${slug}/like`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      setPosts((prev) =>
        prev.map((p) => {
          if (p.slug === slug) {
            return {
              ...p,
              likes: data.likes,
              liked: data.liked,
            } as PostType;
          }
          return p;
        })
      );
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-16 px-4 md:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            Welcome to My Blog
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Discover powerful ideas, guides, and thought-provoking stories — from creators to creators.
          </p>
        </div>
      </section>

      {/* Posts Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {loading && posts.length === 0 ? (
          <p className="text-center text-gray-400 text-lg">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            No posts yet. Come back later!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 hover:shadow-md transition-all group"
              >
                <Link href={`/posts/${post.slug}`}>
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2 group-hover:underline">
                    {post.title}
                  </h3>
                  <p
                    className="text-gray-600 text-sm md:text-base mb-4 line-clamp-3"
                    dangerouslySetInnerHTML={{
                      __html: sanitizePreview(post.content),
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      By{" "}
                      {typeof post.author === "object" &&
                      "username" in post.author
                        ? post.author.username
                        : "Unknown"}
                    </span>
                    <span className="italic">
                      {typeof post.category === "object" && "name" in post.category
                        ? post.category.name
                        : "Uncategorized"}
                      {post.subcategory?.name ? ` → ${post.subcategory.name}` : ""}
                    </span>
                  </div>
                </Link>

                {/* ❤️ Like button */}
                <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                  <span>{post.likes || 0} ❤️</span>
                  <button
                    onClick={(e) => handleLike(e, post.slug)}
                    className={`mt-2 px-3 py-1 text-sm rounded ${
                      post.liked ? "bg-red-600" : "bg-blue-600"
                    } text-white`}
                  >
                    {post.liked ? "Unlike" : "Like"} ({post.likes || 0})
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="mt-10 text-center">
            <button
              onClick={loadMore}
              className="px-6 py-2 text-white bg-gray-800 rounded hover:bg-black transition-all"
            >
              Load More
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

// ✨ Sanitize content preview (strip HTML tags, limit length)
function sanitizePreview(html: string): string {
  const textOnly = html.replace(/<[^>]+>/g, ""); // remove tags
  return textOnly.length > 180 ? textOnly.slice(0, 180) + "..." : textOnly;
}
