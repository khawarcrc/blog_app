"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ManagePosts() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const [editingPostId, setEditingPostId] = useState(null); // for update mode
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");
  const [editingCategory, setEditingCategory] = useState("");

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []));

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []));
  }, []);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    const trimmedCategory = category.trim();
    const existingCategory = categories.find(
      (cat) => cat.name.toLowerCase() === trimmedCategory.toLowerCase()
    );

    const payload = {
      title,
      content,
      ...(existingCategory
        ? { categoryId: existingCategory._id }
        : { newCategoryName: trimmedCategory }),
    };

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      setPosts((prev) => [...prev, data.post]);
      toast.success("Post added!");
      resetForm();
    } else {
      toast.error(data.error || "Failed to add post");
    }
  };

  const handleEdit = (post) => {
    setEditingPostId(post._id);
    setEditingTitle(post.title);
    setEditingContent(post.content);
    setEditingCategory(post.category?.name || "");
  };

  const handleUpdate = async (postId) => {
    const trimmedCategory = editingCategory.trim();
    const existingCategory = categories.find(
      (cat) => cat.name.toLowerCase() === trimmedCategory.toLowerCase()
    );

    if (!existingCategory) {
      toast.error("You can only update with existing category for now");
      return;
    }

    const res = await fetch("/api/posts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        postId,
        title: editingTitle,
        content: editingContent,
        categoryId: existingCategory._id,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? data.post : p))
      );
      setEditingPostId(null);
      toast.success("Post updated!");
    } else {
      toast.error(data.error || "Failed to update post");
    }
  };

  const handleDelete = async (postId) => {
    const res = await fetch("/api/posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ postId }),
    });

    const data = await res.json();

    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      toast.success("Post deleted!");
    } else {
      toast.error(data.error || "Failed to delete post");
    }
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto px-4 py-6">
      {/* Create Post */}
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

      {/* List of Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">📚 All Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-muted-foreground">No posts found.</p>
          ) : (
            posts.map((post) => (
              <div
                key={post._id}
                className="border rounded p-4 space-y-2 relative"
              >
                {editingPostId === post._id ? (
                  <>
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      placeholder="Edit title"
                    />
                    <Textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      placeholder="Edit content"
                    />
                    <Input
                      value={editingCategory}
                      onChange={(e) =>
                        setEditingCategory(e.target.value)
                      }
                      list="category-options"
                      placeholder="Edit category"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(post._id)}
                      >
                        💾 Save
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingPostId(null)}
                      >
                        ❌ Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-medium text-lg">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {post.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Category: {post.category?.name || "Uncategorized"}
                    </p>
                    <div className="flex gap-3 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(post)}
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(post._id)}
                      >
                        🗑️ Delete
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
