// app/dashboard/layout.tsx
import { getUserFromRequest } from "@/middleware/auth";
import Link from "next/link";
import { ReactNode } from "react";
import {
  LayoutDashboard,
  FileText,
  Folder,
  Users,
  Settings,
} from "lucide-react"; // ✅ Lucide icons

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getUserFromRequest();

  return (
    <div className="min-h-screen flex bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 h-screen sticky top-0 overflow-y-auto bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 py-6 px-4">
        <div className="mb-6 px-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Admin Dashboard
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome, <span className="font-medium">{user?.username || "User"}</span>
          </p>
        </div>

        <nav className="flex flex-col space-y-1 text-sm font-medium">
          <SidebarLink href="/dashboard" label="Dashboard Home" icon={<LayoutDashboard size={18} />} />
          <SidebarLink href="/dashboard/posts" label="Manage Posts" icon={<FileText size={18} />} />
          <SidebarLink href="/dashboard/categories" label="Manage Categories" icon={<Folder size={18} />} />

          {(user?.role === "admin" || user?.role === "superadmin") && (
            <>
              <div className="mt-4 mb-1 px-2 text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wide">
                Admin Panel
              </div>
              <SidebarLink href="/dashboard/admin/users" label="Manage Users" icon={<Users size={18} />} />
              <SidebarLink href="/dashboard/admin/settings" label="Settings" icon={<Settings size={18} />} />
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 dark:bg-neutral-900 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function SidebarLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}
