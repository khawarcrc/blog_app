"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [status, setStatus] = useState("draft");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []));
  }, []);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("");
    setSubcategory("");
    setStatus("draft");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const trimmedCategory = category.trim();
    const trimmedSubcategory = subcategory.trim();

    if (!trimmedTitle || !trimmedContent || !trimmedCategory) {
      toast.error("Title, content, and category are required.");
      return;
    }

    const existingCategory = categories.find(
      (cat) => cat.name.toLowerCase() === trimmedCategory.toLowerCase()
    );

    let payload = {
      title: trimmedTitle,
      content: trimmedContent,
      status,
    };

    if (existingCategory) {
      const existingSub = existingCategory.subcategories?.find(
        (sub) => sub.name.toLowerCase() === trimmedSubcategory.toLowerCase()
      );

      payload = {
        ...payload,
        categoryId: existingCategory._id,
        ...(existingSub
          ? { subcategoryId: existingSub._id }
          : trimmedSubcategory
          ? { newSubcategoryName: trimmedSubcategory }
          : {}),
      };
    } else {
      payload = {
        ...payload,
        newCategoryName: trimmedCategory,
        ...(trimmedSubcategory ? { newSubcategoryName: trimmedSubcategory } : {}),
      };
    }

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Post added!");
      resetForm();
    } else {
      toast.error(data.error || "Failed to add post");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">📝 Create New Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Enter post title"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubcategory("");
                }}
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
              <Label htmlFor="subcategory">Subcategory</Label>
              <Input
                id="subcategory"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                list="subcategory-options"
                placeholder="Type or select subcategory"
              />
              {category && (
                <datalist id="subcategory-options">
                  {(categories.find((c) => c.name.toLowerCase() === category.toLowerCase())?.subcategories || []).map(
                    (sub) => (
                      <option key={sub._id} value={sub.name} />
                    )
                  )}
                </datalist>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content here..."
                rows={6}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              ➕ Add Post
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
