// components/common/Header.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur bg-white/60 dark:bg-black/50 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">🌐 MyBlog</h1>
        <nav className="space-x-4 text-sm font-medium">
          <Link href="/" className="hover:text-indigo-600 transition-colors">
            Home
          </Link>
          <Link
            href="/about"
            className="hover:text-indigo-600 transition-colors"
          >
            About
          </Link>
          <Link
            href="/login"
            className="hover:text-indigo-600 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="hover:text-indigo-600 transition-colors"
          >
            Register
          </Link>
          <button
            onClick={handleLogout}
            className="hover:text-red-600 transition-colors"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
