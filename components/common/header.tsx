'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';

export default function Header() {
  const router = useRouter();
  const { user, setUser, fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser(); // checks login status on mount
  }, [fetchUser]);

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
