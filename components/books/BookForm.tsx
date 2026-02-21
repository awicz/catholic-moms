'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addBook } from '@/lib/actions/books';
import type { Category } from '@/types';

interface Props {
  categories: Category[];
}

export default function BookForm({ categories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [whyHelpful, setWhyHelpful] = useState('');
  const charsLeft = 100 - whyHelpful.length;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await addBook(formData);
      if (!result.success) {
        setError(result.error ?? 'Something went wrong.');
      } else {
        router.push('/books');
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-stone-700 mb-1">
          Book title <span className="text-rose-600">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
          placeholder="e.g. The Story of a Soul"
        />
      </div>

      {/* Author */}
      <div>
        <label htmlFor="author" className="block text-sm font-medium text-stone-700 mb-1">
          Author <span className="text-rose-600">*</span>
        </label>
        <input
          id="author"
          name="author"
          type="text"
          required
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
          placeholder="e.g. St. Thérèse of Lisieux"
        />
      </div>

      {/* Purchase URL */}
      <div>
        <label htmlFor="purchaseUrl" className="block text-sm font-medium text-stone-700 mb-1">
          Where to buy{' '}
          <span className="text-stone-400 font-normal">(optional)</span>
        </label>
        <input
          id="purchaseUrl"
          name="purchaseUrl"
          type="url"
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
          placeholder="https://www.amazon.com/..."
        />
      </div>

      {/* Why helpful */}
      <div>
        <label htmlFor="whyHelpful" className="block text-sm font-medium text-stone-700 mb-1">
          Why I found it helpful{' '}
          <span className="text-stone-400 font-normal">(optional, max 100 characters)</span>
        </label>
        <textarea
          id="whyHelpful"
          name="whyHelpful"
          rows={3}
          maxLength={100}
          value={whyHelpful}
          onChange={(e) => setWhyHelpful(e.target.value)}
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
          placeholder="A sentence about how this book blessed you…"
        />
        <p className={`text-xs mt-1 text-right ${charsLeft < 10 ? 'text-rose-600' : 'text-stone-400'}`}>
          {charsLeft} characters remaining
        </p>
      </div>

      {/* Categories */}
      <fieldset>
        <legend className="block text-sm font-medium text-stone-700 mb-2">
          Categories <span className="text-rose-600">*</span>
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2 rounded-md border border-stone-200 px-3 py-2 cursor-pointer hover:bg-stone-50 has-[:checked]:border-rose-400 has-[:checked]:bg-rose-50"
            >
              <input
                type="checkbox"
                name="categoryIds"
                value={cat.id}
                className="accent-rose-700"
              />
              <span className="text-sm text-stone-700">{cat.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? 'Adding book…' : 'Add book'}
      </button>
    </form>
  );
}
