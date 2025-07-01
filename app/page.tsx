'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('/api/posts', {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []));
  }, []);

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
        {posts.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No posts yet. Come back later!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2  gap-8">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white shadow-sm border rounded-lg p-6 hover:shadow-md transition-all"
              >
                <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
                  {post.title}
                </h3>
                <p
                  className="text-gray-600 text-sm md:text-base mb-4 break-words overflow-hidden"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {post.content}
                </p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>By {post.author?.username || 'Unknown'}</span>
                  <span className="italic">{post.category?.name || 'Uncategorized'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
