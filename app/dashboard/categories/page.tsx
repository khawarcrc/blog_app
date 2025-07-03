"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryDialog, setSubcategoryDialog] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [viewSubDialog, setViewSubDialog] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    setSuccess("");
    const res = await fetch("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Failed to create category");
    setSuccess("Category added!");
    setCategories([...categories, data.category]);
    setName("");
  }

  async function handleUpdate(id) {
    if (!editName.trim()) return;
    const res = await fetch("/api/categories", {
      method: "PUT",
      body: JSON.stringify({ id, name: editName }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Failed to update");
    setSuccess("Category updated");
    setCategories(categories.map((cat) => (cat._id === id ? data.category : cat)));
    setEditId(null);
    setEditName("");
  }

  async function handleDelete(id) {
    const res = await fetch("/api/categories", {
      method: "DELETE",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Failed to delete");
    setSuccess("Category deleted");
    setCategories(categories.filter((cat) => cat._id !== id));
  }

  async function handleAddSubcategory(categoryId) {
    if (!subcategoryName.trim()) return;
    const res = await fetch("/api/categories/subcategory", {
      method: "POST",
      body: JSON.stringify({ categoryId, subcategoryName }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Failed to add subcategory");
    setSuccess("Subcategory added");
    setSubcategoryName("");
    setSubcategoryDialog(null);
    fetchCategories();
  }

  async function handleEditSubcategory() {
    const { categoryId, subcategoryId, name } = editingSubcategory;
    if (!name.trim()) return;
    const res = await fetch("/api/categories/subcategory", {
      method: "PUT",
      body: JSON.stringify({ categoryId, subcategoryId, newName: name }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Failed to update subcategory");
    setSuccess("Subcategory updated");
    setEditingSubcategory(null);
    fetchCategories();
  }

  async function handleDeleteSubcategory(categoryId, subcategoryId) {
    const res = await fetch("/api/categories/subcategory", {
      method: "DELETE",
      body: JSON.stringify({ categoryId, subcategoryId }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Failed to delete subcategory");
    setSuccess("Subcategory deleted");
    fetchCategories();
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Manage Categories</h2>

      <form onSubmit={handleCreate} className="flex items-center gap-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New Category Name"
          className="max-w-sm"
        />
        <Button type="submit">Add Category</Button>
      </form>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">{success}</p>}

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id} className="border-t hover:bg-muted/20">
                <td className="p-3 align-top">
                  {editId === cat._id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        size="sm"
                      />
                      <Button size="sm" onClick={() => handleUpdate(cat._id)}>Save</Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditId(null);
                        setEditName("");
                      }}>Cancel</Button>
                    </div>
                  ) : (
                    <span className="capitalize font-medium text-base">{cat.name}</span>
                  )}
                </td>
                <td className="p-3 text-right space-y-2">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewSubDialog(cat._id)}
                    >View Subcategories</Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-600"
                      onClick={() => {
                        setEditId(cat._id);
                        setEditName(cat.name);
                      }}
                    >Edit</Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => setCategoryToDelete(cat)}
                        >Delete</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete {categoryToDelete?.name}?</DialogTitle>
                          <p className="text-sm text-muted-foreground">This will remove all related subcategories.</p>
                        </DialogHeader>
                        <DialogFooter className="gap-2">
                          <Button variant="outline" onClick={() => setCategoryToDelete(null)}>Cancel</Button>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              handleDelete(categoryToDelete._id);
                              setCategoryToDelete(null);
                            }}
                          >Confirm Delete</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={subcategoryDialog === cat._id} onOpenChange={(open) => !open && setSubcategoryDialog(null)}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            setSubcategoryDialog(cat._id);
                            setSubcategoryName("");
                          }}
                        >+ Add Subcategory</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Subcategory to "{cat.name}"</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          handleAddSubcategory(cat._id);
                        }} className="space-y-4">
                          <Input
                            value={subcategoryName}
                            onChange={(e) => setSubcategoryName(e.target.value)}
                            placeholder="Enter subcategory name"
                            autoFocus
                          />
                          <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setSubcategoryDialog(null)}>Cancel</Button>
                            <Button type="submit">Add</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Dialog open={viewSubDialog === cat._id} onOpenChange={(open) => !open && setViewSubDialog(null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Subcategories of "{cat.name}"</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2">
                        {(cat.subcategories || []).map((sub) => (
                          <div key={sub._id} className="flex justify-between items-center">
                            {editingSubcategory?.subcategoryId === sub._id ? (
                              <>
                                <Input
                                  value={editingSubcategory.name}
                                  onChange={(e) =>
                                    setEditingSubcategory({ ...editingSubcategory, name: e.target.value })
                                  }
                                  size="sm"
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={handleEditSubcategory}>Save</Button>
                                  <Button variant="ghost" size="sm" onClick={() => setEditingSubcategory(null)}>Cancel</Button>
                                </div>
                              </>
                            ) : (
                              <>
                                <span className="capitalize">{sub.name}</span>
                                <div className="flex gap-2">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="text-blue-600"
                                    onClick={() =>
                                      setEditingSubcategory({
                                        categoryId: cat._id,
                                        subcategoryId: sub._id,
                                        name: sub.name,
                                      })
                                    }
                                  >✎</Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="text-red-600"
                                    onClick={() => handleDeleteSubcategory(cat._id, sub._id)}
                                  >🗑</Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setViewSubDialog(null)}>Close</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
