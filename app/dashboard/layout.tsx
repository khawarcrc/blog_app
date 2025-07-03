"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import {
  LayoutDashboard,
  FileText,
  Folder,
  Users,
  Settings,
  Menu,
  X,
} from "lucide-react";

type Props = {
  children: ReactNode;
};

type User = {
  username?: string;
  role?: string;
};

export default function DashboardLayout({ children }: Props): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        setUser(data.user || null);
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };

    fetchUser();
  }, []);

  // Auto-close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      {/* Mobile Header */}
      <div className="flex items-center justify-between px-4 py-3 md:hidden border-b dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h2 className="text-lg font-semibold">Admin Dashboard</h2>
        <button
          className="text-gray-600 dark:text-gray-300"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar (Mobile Drawer) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-transform duration-300 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div
          className="absolute inset-0 bg-black bg-opacity-40"
          onClick={() => setSidebarOpen(false)}
        />
        <aside className="relative z-50 w-64 h-full bg-white dark:bg-neutral-900 border-r dark:border-neutral-800 p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Admin Dashboard</h2>
            <button
              className="text-gray-600 dark:text-gray-300"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          <SidebarLinks user={user} />
        </aside>
      </div>

      {/* Sidebar (Desktop / Tablet) */}
      <aside className="hidden md:flex md:flex-col w-64 flex-shrink-0 h-screen sticky top-0 overflow-y-auto bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 py-6 px-4">
        <div className="mb-6 px-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Admin Dashboard
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome,{" "}
            <span className="font-medium">{user?.username || "User"}</span>
          </p>
        </div>
        <SidebarLinks user={user} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 dark:bg-neutral-900 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function SidebarLinks({ user }: { user: User | null }) {
  return (
    <nav className="flex flex-col space-y-1 text-sm font-medium">
      <SidebarLink
        href="/dashboard"
        label="Dashboard Home"
        icon={<LayoutDashboard size={18} />}
      />
      <SidebarLink
        href="/dashboard/posts"
        label="Add Posts"
        icon={<FileText size={18} />}
      />
      <SidebarLink
        href="/dashboard/posts/all"
        label="All Posts"
        icon={<FileText size={18} />}
      />
      <SidebarLink
        href="/dashboard/categories"
        label="Manage Categories"
        icon={<Folder size={18} />}
      />

      {(user?.role === "admin" || user?.role === "superadmin") && (
        <>
          <div className="mt-4 mb-1 px-2 text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wide">
            Admin Panel
          </div>
          <SidebarLink
            href="/dashboard/admin/users"
            label="Manage Users"
            icon={<Users size={18} />}
          />
          <SidebarLink
            href="/dashboard/admin/settings"
            label="Settings"
            icon={<Settings size={18} />}
          />
        </>
      )}
    </nav>
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
