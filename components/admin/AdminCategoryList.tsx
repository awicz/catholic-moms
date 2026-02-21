'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addCategory, updateCategory, deleteCategory } from '@/lib/actions/admin';
import type { Category } from '@/types';

interface Props {
  categories: Category[];
}

export default function AdminCategoryList({ categories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    'rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-400';

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;
    startTransition(async () => {
      const result = await addCategory(formData);
      if (!result.success) {
        setError(result.error ?? 'Failed to add category.');
      } else {
        form.reset();
        router.refresh();
      }
    });
  }

  function handleUpdate(id: number, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateCategory(id, formData);
      if (!result.success) {
        setError(result.error ?? 'Failed to update category.');
      } else {
        setEditingId(null);
        router.refresh();
      }
    });
  }

  function handleDelete(id: number, name: string) {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (!result.success) {
        setError(result.error ?? 'Failed to delete category.');
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      <ul className="divide-y divide-stone-100 border border-stone-200 rounded-lg overflow-hidden">
        {categories.map((cat) => (
          <li key={cat.id} className="px-4 py-3 bg-white">
            {editingId === cat.id ? (
              <form onSubmit={(e) => handleUpdate(cat.id, e)} className="flex flex-wrap items-center gap-2">
                <input name="name" defaultValue={cat.name} required placeholder="Category name" className={`${inputClass} flex-1 min-w-32`} />
                <input name="slug" defaultValue={cat.slug} required placeholder="slug" className={`${inputClass} flex-1 min-w-32`} />
                <button type="submit" disabled={isPending} className="text-xs font-semibold text-white bg-rose-700 px-3 py-1.5 rounded hover:bg-rose-800 disabled:opacity-60">
                  Save
                </button>
                <button type="button" onClick={() => setEditingId(null)} className="text-xs text-stone-500 hover:underline">
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="font-medium text-stone-800 text-sm">{cat.name}</span>
                  <span className="text-xs text-stone-400 ml-2">/{cat.slug}</span>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button onClick={() => { setEditingId(cat.id); setError(null); }} className="text-xs text-rose-600 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(cat.id, cat.name)} disabled={isPending} className="text-xs text-stone-400 hover:text-rose-700 hover:underline disabled:opacity-50">
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Add new category */}
      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 pt-2">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Name</label>
          <input name="name" required placeholder="e.g. Advent & Lent" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">
            Slug <span className="text-stone-400">(auto-generated if left blank)</span>
          </label>
          <input name="slug" placeholder="advent-and-lent" className={inputClass} />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="text-sm font-semibold text-white bg-rose-700 px-4 py-1.5 rounded hover:bg-rose-800 disabled:opacity-60 transition-colors"
        >
          Add category
        </button>
      </form>
    </div>
  );
}
