"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUserStore } from '@/store/useUserStore';

export default function LoginPage() {
  const { setUser } = useUserStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (res.ok) {
       setUser(data.user); 
      toast.success("Login successful");
      if (data.user.role === "admin" || data.user.role === "superadmin") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } else {
      toast.error(data.error || "Login failed");
    }
  }

  return (
    <main
      className="flex min-h-[90vh] items-center justify-center
      dark:from-gray-900 dark:via-gray-800 dark:to-black px-4"
    >
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="">
          <CardTitle className="text-2xl text-center">
            Login to Your Account
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="username" className="">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourname"
                required
                type="text"
                className=""
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="">
                Password
              </Label>
              <Input
                className=""
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              variant="default"
              size="default"
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
