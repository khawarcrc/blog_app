// app/dashboard/page.js
'use client';

import { useEffect, useState } from 'react';

export default function DashboardHome() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUser(data.user));
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1>Welcome, {user.role}</h1>
      <p>This is the admin dashboard.</p>
    </div>
  );
}