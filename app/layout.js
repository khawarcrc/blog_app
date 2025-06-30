import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "My Blog App",
  description: "A full-stack blog platform with modern UI and auth",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-black text-gray-800 dark:text-gray-100`}
      >
        <header className="sticky top-0 z-50 w-full backdrop-blur bg-white/60 dark:bg-black/50 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-semibold tracking-tight">🌐 MyBlog</h1>
            <nav className="space-x-4 text-sm font-medium">
              <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
              <Link href="/about" className="hover:text-indigo-600 transition-colors">About</Link>
              <Link href="/login" className="hover:text-indigo-600 transition-colors">Login</Link>
              <Link href="/register" className="hover:text-indigo-600 transition-colors">Register</Link>
            </nav>
          </div>
        </header>

        <main className="min-h-screen px-4 py-8">{children}</main>

        <footer className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} MyBlog. All rights reserved.
        </footer>

        <Toaster />
      </body>
    </html>
  );
}
