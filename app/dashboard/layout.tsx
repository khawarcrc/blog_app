// app/dashboard/layout.tsx
import { getUserFromRequest } from "@/middleware/auth"; // Adjust this import if needed
import Link from "next/link";
import { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getUserFromRequest(); // Get user info via middleware/helper

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 text-gray-800 dark:text-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold">📊 Admin Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome, {user?.username || "User"}
          </p>
        </div>

        <nav className="flex flex-col space-y-2 text-sm">
          <Link
            href="/dashboard"
            className="hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded px-3 py-2 transition"
          >
            🏠 Dashboard Home
          </Link>
          <Link
            href="/dashboard/posts"
            className="hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded px-3 py-2 transition"
          >
            📝 Manage Posts
          </Link>
          <Link
            href="/dashboard/categories"
            className="hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded px-3 py-2 transition"
          >
            📁 Manage Categories
          </Link>

          {(user?.role === "admin" || user?.role === "superadmin") && (
            <>
              <hr className="border-gray-300 dark:border-neutral-700" />
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase">
                Admin Panel
              </h3>
              <Link
                href="/dashboard/admin/users"
                className="hover:bg-red-100 dark:hover:bg-red-900 rounded px-3 py-2 transition"
              >
                👥 Manage Users
              </Link>
              <Link
                href="/dashboard/admin/settings"
                className="hover:bg-red-100 dark:hover:bg-red-900 rounded px-3 py-2 transition"
              >
                ⚙️ Settings
              </Link>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto bg-gray-50 dark:bg-neutral-900">
        {children}
      </main>
    </div>
  );
}
