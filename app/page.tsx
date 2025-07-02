"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?page=${pageNumber}&status=published`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (pageNumber === 1) {
        setPosts(data.posts || []);
      } else {
        setPosts((prev) => [...prev, ...(data.posts || [])]);
      }

      const totalPages = data?.pagination?.totalPages || 1;
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
          <p className="text-center text-gray-500 text-lg">No posts yet. Come back later!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {posts.map((post) => (
              <Link
                href={`/posts/${post.slug}`}
                key={post._id}
                className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 hover:shadow-md transition-all group"
              >
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
                  <span>By {post.author?.username || "Unknown"}</span>
                  <span className="italic">{post.category?.name || "Uncategorized"}</span>
                </div>
              </Link>
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
