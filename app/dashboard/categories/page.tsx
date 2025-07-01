'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;

    setError('');
    setSuccess('');

    const res = await fetch('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Failed to create category');
      return;
    }

    setSuccess('Category added!');
    setCategories([...categories, data.category]);
    setName('');
  }

  async function handleDelete(id) {
    const res = await fetch('/api/categories', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Failed to delete');
      return;
    }

    setSuccess('Category deleted');
    setCategories(categories.filter(cat => cat._id !== id));
  }

  async function handleUpdate(id) {
    if (!editName.trim()) return;

    const res = await fetch('/api/categories', {
      method: 'PUT',
      body: JSON.stringify({ id, name: editName }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Failed to update');
      return;
    }

    setSuccess('Category updated');
    setCategories(categories.map(cat => (cat._id === id ? data.category : cat)));
    setEditId(null);
    setEditName('');
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Manage Categories</h2>

      {/* Create Category Form */}
      <form onSubmit={handleCreate} className="mb-6 flex items-center gap-2">
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="New Category Name"
          required
        />
        <Button type="submit">Add</Button>
      </form>

      {/* Feedback */}
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">{success}</p>}

      {/* Categories List */}
      {loading ? (
        <p>Loading categories...</p>
      ) : (
        <ul className="space-y-3">
          {categories.map(cat => (
            <li
              key={cat._id}
              className="flex items-center justify-between border-b pb-2"
            >
              {editId === cat._id ? (
                <div className="flex gap-2 items-center w-full">
                  <Input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleUpdate(cat._id)}
                  >
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditId(null);
                      setEditName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <span className="capitalize">{cat.name}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600"
                      onClick={() => {
                        setEditId(cat._id);
                        setEditName(cat.name);
                      }}
                    >
                      Edit
                    </Button>

                    {/* Delete Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => setCategoryToDelete(cat)}
                        >
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you sure?</DialogTitle>
                          <p className="text-sm text-muted-foreground">
                            Deleting <strong>{categoryToDelete?.name}</strong>{' '}
                            will remove all posts linked to this category. This
                            action is irreversible.
                          </p>
                        </DialogHeader>
                        <DialogFooter className="gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setCategoryToDelete(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              handleDelete(categoryToDelete._id);
                              setCategoryToDelete(null);
                            }}
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
