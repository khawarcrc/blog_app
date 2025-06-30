import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import Link from "next/link";
import Header from "@/components/common/header";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-gradient-to-br
         from-sky-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-black
          text-gray-800 dark:text-gray-100`}
      >
        <Header />
        <main className="min-h-screen">{children}</main>

        <footer className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} MyBlog. All rights reserved.
        </footer>

        <Toaster />
      </body>
    </html>
  );
}
