// app/page.js
"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []));
  }, []);

  return (
    <main>
      <h1>Welcome to My Blog</h1>
      <ul>
        {posts.map((post) => (
          <li key={post._id}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <small>
              By {post.author?.username || "Unknown"} in{" "}
              {post.category?.name || "Uncategorized"}
            </small>
          </li>
        ))}
      </ul>
      // Example logout button
      <button
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          window.location.href = "/login";
        }}
      >
        Logout
      </button>
    </main>
  );
}
