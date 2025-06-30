// app/dashboard/categories/page.js
'use client';

import { useEffect, useState } from 'react';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => {
    fetch('/api/categories').then(res => res.json()).then(data => setCategories(data.categories || []));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      setCategories([...categories, data.category]);
      setName('');
    }
  }

  return (
    <div>
      <h2>Manage Categories</h2>
      <form onSubmit={handleCreate}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Category Name" required />
        <button type="submit">Add Category</button>
      </form>
      <ul>
        {categories.map(cat => (
          <li key={cat._id}>{cat.name}</li>
        ))}
      </ul>
    </div>
  );
}