"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  const [status, setStatus] = useState("draft");

  const [categories, setCategories] = useState([]);

  const [editingPostId, setEditingPostId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");
  const [editingCategory, setEditingCategory] = useState("");
  const [editingStatus, setEditingStatus] = useState("draft");

  const router = useRouter();

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
    setStatus("draft");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const trimmedCategory = category.trim();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent || !trimmedCategory) {
      toast.error("All fields are required.");
      return;
    }

    const existingCategory = categories.find(
      (cat) => cat.name.toLowerCase() === trimmedCategory.toLowerCase()
    );

    const payload = {
      title: trimmedTitle,
      content: trimmedContent,
      status,
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
    setEditingStatus(post.status || "draft");
  };

  const handleUpdate = async (postId) => {
    const trimmedCategory = editingCategory.trim();
    const trimmedTitle = editingTitle.trim();
    const trimmedContent = editingContent.trim();

    const existingCategory = categories.find(
      (cat) => cat.name.toLowerCase() === trimmedCategory.toLowerCase()
    );

    if (!trimmedTitle || !trimmedContent || !existingCategory) {
      toast.error("All fields must be filled with valid data.");
      return;
    }

    const res = await fetch("/api/posts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        postId,
        title: trimmedTitle,
        content: trimmedContent,
        categoryId: existingCategory._id,
        status: editingStatus,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setPosts((prev) => prev.map((p) => (p._id === postId ? data.post : p)));
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
    <div className="space-y-10 max-w-5xl mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">📝 Create New Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} required />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                list="category-options"
                placeholder="Type or select category"
                required
              />
              <datalist id="category-options">
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name} />
                ))}
              </datalist>
            </div>
            <div>
              <Label>Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
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
        <CardContent>
          {posts.length === 0 ? (
            <p className="text-muted-foreground">No posts found.</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr className="text-left border-b">
                    <th className="p-3 font-medium">Title</th>
                    <th className="p-3 font-medium">Category</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post._id} className="border-b hover:bg-muted/50">
                      {editingPostId === post._id ? (
                        <>
                          <td className="p-3">
                            <Input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              placeholder="Edit title"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              value={editingCategory}
                              onChange={(e) => setEditingCategory(e.target.value)}
                              list="category-options"
                              placeholder="Edit category"
                            />
                          </td>
                          <td className="p-3">
                            <select
                              value={editingStatus}
                              onChange={(e) => setEditingStatus(e.target.value)}
                              className="border rounded px-2 py-1 w-full"
                            >
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                            </select>
                          </td>
                          <td className="p-3 space-x-2">
                            <Button size="sm" onClick={() => handleUpdate(post._id)}>
                              💾 Save
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setEditingPostId(null)}
                            >
                              ❌ Cancel
                            </Button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-3">
                            <Link
                              href={`/dashboard/posts/${post.slug}`}
                              className="text-blue-600 hover:underline"
                            >
                              {post.title}
                            </Link>
                          </td>
                          <td className="p-3">{post.category?.name || "Uncategorized"}</td>
                          <td className="p-3">
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                post.status === "published"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {post.status}
                            </span>
                          </td>
                          <td className="p-3 space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(post)}>
                              ✏️ Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(post._id)}
                            >
                              🗑️ Delete
                            </Button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
