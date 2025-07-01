"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function ManagePosts() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []));
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    const res = await fetch("/api/posts", {
      method: "POST",
      body: JSON.stringify({ title, content, category }),
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      setPosts([...posts, data.post]);
      toast.success("Post added!");
      setTitle("");
      setContent("");
      setCategory("");
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to add post");
    }
  }

  return (
    <div className="space-y-10 max-w-4xl mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            📝 Create New Post
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
                required
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your content here..."
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                list="category-options"
                placeholder="Type or select a category"
                required
              />
              <datalist id="category-options">
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name} />
                ))}
              </datalist>
            </div>

            <Button type="submit" className="w-full">
              ➕ Add Post
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">📚 All Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-muted-foreground">No posts found.</p>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="border rounded p-4">
                <h3 className="font-medium text-lg">{post.title}</h3>
                <p className="text-sm text-muted-foreground">{post.content}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
