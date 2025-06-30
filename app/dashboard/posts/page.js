// app/dashboard/posts/page.js
'use client';

import { useEffect, useState } from 'react';

export default function ManagePosts() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/posts').then(res => res.json()).then(data => setPosts(data.posts || []));
    fetch('/api/categories').then(res => res.json()).then(data => setCategories(data.categories || []));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content, category }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      setPosts([...posts, data.post]);
      setTitle('');
      setContent('');
      setCategory('');
    }
  }

  return (
    <div>
      <h2>Manage Posts</h2>
      <form onSubmit={handleCreate}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content" required />
        <select value={category} onChange={e => setCategory(e.target.value)} required>
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        <button type="submit">Add Post</button>
      </form>
      <ul>
        {posts.map(post => (
          <li key={post._id}>
            <b>{post.title}</b> - {post.content}
          </li>
        ))}
      </ul>
    </div>
  );
}