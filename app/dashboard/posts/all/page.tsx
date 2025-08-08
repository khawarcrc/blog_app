"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingCategory, setEditingCategory] = useState("");
  const [editingSubcategory, setEditingSubcategory] = useState("");
  const [editingStatus, setEditingStatus] = useState("draft");
  const [editingContent, setEditingContent] = useState("");

  const [showMode, setShowMode] = useState<"all" | "liked" | "disliked">("all");

  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsSlug, setAnalyticsSlug] = useState("");
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  const fetchPosts = async () => {
    let endpoint = "/api/posts";
    if (showMode === "liked") endpoint = "/api/posts/slug/like";
    if (showMode === "disliked") endpoint = "/api/posts/slug/dislike";

    try {
      const res = await fetch(endpoint, { credentials: "include" });
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      toast.error("Failed to fetch posts.");
    }
  };

  useEffect(() => {
    fetchPosts();
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []));
  }, [showMode]);

  const handleEdit = (post) => {
    setEditingPostId(post._id);
    setEditingTitle(post.title);
    setEditingCategory(post.category?.name || "");
    setEditingSubcategory(post.subcategoryName || "");
    setEditingStatus(post.status || "draft");
    setEditingContent(post.content);
  };

  const handleUpdate = async (postId) => {
    const trimmedTitle = editingTitle.trim();
    const trimmedCategory = editingCategory.trim();
    const trimmedSubcategory = editingSubcategory.trim();
    const trimmedContent = editingContent.trim();

    const existingCategory = categories.find(
      (cat) => cat.name.toLowerCase() === trimmedCategory.toLowerCase()
    );

    if (!trimmedTitle || !trimmedContent || !existingCategory) {
      toast.error("All fields must be filled with valid data.");
      return;
    }

    let subcategoryId = "";
    if (trimmedSubcategory) {
      const match = existingCategory.subcategories?.find(
        (sub) => sub.name.toLowerCase() === trimmedSubcategory.toLowerCase()
      );
      if (!match) {
        toast.error("Subcategory not found in selected category.");
        return;
      }
      subcategoryId = match._id;
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
        subcategoryId,
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

  const getTitle = () => {
    if (showMode === "liked") return "❤️ Liked Posts";
    if (showMode === "disliked") return "👎 Disliked Posts";
    return "📚 All Posts";
  };

  const handleAnalytics = async (slug: string) => {
    try {
      const res = await fetch(`/api/posts/${slug}/analytics`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok) {
        setAnalyticsSlug(slug);
        setAnalyticsData(data);
        setAnalyticsOpen(true);
      } else {
        toast.error(data.error || "Failed to fetch analytics");
      }
    } catch (err) {
      toast.error("Something went wrong while fetching analytics");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-10">
      {/* Filter Buttons */}
      <div className="flex justify-end gap-2">
        <Button
          variant={showMode === "all" ? "default" : "outline"}
          onClick={() => setShowMode("all")}
        >
          📚 All
        </Button>
        <Button
          variant={showMode === "liked" ? "default" : "outline"}
          onClick={() => setShowMode("liked")}
        >
          ❤️ Liked
        </Button>
        <Button
          variant={showMode === "disliked" ? "default" : "outline"}
          onClick={() => setShowMode("disliked")}
        >
          👎 Disliked
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{getTitle()}</CardTitle>
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
                    <th className="p-3 font-medium">Category / Subcategory</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Analytics</th>
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
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              value={editingCategory}
                              onChange={(e) => {
                                setEditingCategory(e.target.value);
                                setEditingSubcategory("");
                              }}
                              list="category-options"
                            />
                            <datalist id="category-options">
                              {categories.map((cat) => (
                                <option key={cat._id} value={cat.name} />
                              ))}
                            </datalist>

                            {editingCategory &&
                              categories.find(
                                (cat) =>
                                  cat.name.toLowerCase() ===
                                  editingCategory.toLowerCase()
                              )?.subcategories?.length > 0 && (
                                <select
                                  value={editingSubcategory}
                                  onChange={(e) =>
                                    setEditingSubcategory(e.target.value)
                                  }
                                  className="mt-2 w-full border rounded px-2 py-1"
                                >
                                  <option value="">
                                    -- Select Subcategory --
                                  </option>
                                  {categories
                                    .find(
                                      (cat) =>
                                        cat.name.toLowerCase() ===
                                        editingCategory.toLowerCase()
                                    )
                                    ?.subcategories.map((sub) => (
                                      <option key={sub._id} value={sub.name}>
                                        {sub.name}
                                      </option>
                                    ))}
                                </select>
                              )}
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
                          <td className="p-3 text-muted-foreground">
                            Editing...
                          </td>
                          <td className="p-3 space-x-2">
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
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-3">
                            <Link
                              href={`/posts/${post.slug}`}
                              className="text-blue-600 hover:underline"
                            >
                              {post.title}
                            </Link>
                          </td>
                          <td className="p-3">
                            {post.category?.name || "Uncategorized"}
                            {post.subcategoryName && (
                              <span className="text-muted-foreground">
                                {" "}
                                / {post.subcategoryName}
                              </span>
                            )}
                          </td>
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
                          <td className="p-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAnalytics(post.slug)}
                            >
                              📊 View
                            </Button>
                          </td>
                          <td className="p-3 space-x-2">
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

      {/* Analytics Modal */}
      <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <DialogContent className="!max-w-[1600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              📊 Analytics for:{" "}
              <span className="text-primary font-semibold">
                {analyticsSlug}
              </span>
            </DialogTitle>
          </DialogHeader>

          {analyticsData ? (
            <div className="space-y-6">
              <div className="text-base font-medium text-muted-foreground">
                👁️ Total Views:{" "}
                <span className="text-foreground font-semibold">
                  {analyticsData.views}
                </span>
              </div>

              {/* Table-like container */}
              <div className="w-full border rounded-lg overflow-x-auto">
                {/* Header row */}
                <div className="grid grid-cols-6 gap-4 bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                  <div>User</div>
                  <div>IP</div>
                  <div>Device</div>
                  <div>Location</div>
                  <div>Referer</div>
                  <div>Viewed At</div>
                </div>

                {/* Body rows */}
                {analyticsData.viewDetails.map((view, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-6 gap-4 items-center px-4 py-3 border-b hover:bg-accent transition-colors text-sm"
                  >
                    <div className="truncate">
                      {view.userId || (
                        <span className="italic text-muted-foreground">
                          Anonymous
                        </span>
                      )}
                    </div>
                    <div className="truncate">{view.ip}</div>
                    <div className="truncate">
                      {view.device || "N/A"}{" "}
                      <span className="block text-xs text-muted-foreground">
                        {view.browser}
                      </span>
                    </div>
                    <div className="truncate">
                      🌍 {view.country || "?"}, 🗺️ {view.region || "?"}, 🏙️{" "}
                      {view.city || "?"}
                    </div>
                    <div className="truncate">
                      {view.referer || (
                        <span className="text-muted-foreground">Direct</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(view.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Loading analytics...
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
