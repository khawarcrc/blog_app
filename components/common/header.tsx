'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  //  Check login status using cookie-based token
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include', // ensures cookie is sent
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user); // assume your API returns { user }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      }
    };

    checkLogin();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur bg-white/60 dark:bg-black/50 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight hover:text-indigo-600 transition-colors">
          🌐 MyBlog
        </Link>

        <nav className="space-x-4 text-sm font-medium flex items-center">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <Link href="/about" className="hover:text-indigo-600 transition-colors">About</Link>

          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-indigo-600 transition-colors">
                Login
              </Link>
              <Link href="/register" className="hover:text-indigo-600 transition-colors">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
