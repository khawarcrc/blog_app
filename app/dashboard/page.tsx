"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface User {
  username: string;
  role: "user" | "admin" | "superadmin";
}

export default function DashboardHome() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/dashboard", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          router.replace("/"); // Redirect if not authorized
        } else {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        router.replace("/");
        setLoading(false);
      });
  }, [router]);

  if (loading) return <p className="p-8 text-center">Loading...</p>;
  if (!user) return null; // Already redirected

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Welcome, {user.username}!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>
            Your role: <strong className="capitalize">{user.role}</strong>
          </p>
          <p className="mt-2">This is your personal dashboard area.</p>
        </CardContent>
      </Card>

      {/* Post Creation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            📝 Add a New Post
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Replace with actual <AddPostForm /> if available */}
          <p className="text-sm text-muted-foreground">
            Post form goes here...
          </p>
        </CardContent>
      </Card>

      {/* Admin Section */}
      {(user.role === "admin" || user.role === "superadmin") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-red-500">
              🔒 Admin Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="destructive" className="w-full">
              Delete Any Post
            </Button>
            <Button className="w-full">Manage Users</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
