'use client';

import { useState, useTransition, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { extractAsinOrIsbn, lookupByIsbn } from '@/lib/googleBooks';
import type { Category, Book } from '@/types';

interface InitialValues {
  title?: string | null;
  author?: string | null;
  purchaseUrl?: string | null;
  whyHelpful?: string | null;
  coverImageUrl?: string | null;
  categories?: Category[];
}

interface Props {
  categories: Category[];
  initialValues?: InitialValues;
  action: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  submitLabel?: string;
}

export default function BookForm({
  categories,
  initialValues,
  action,
  submitLabel = 'Add book',
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Controlled fields (needed for auto-fill)
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [author, setAuthor] = useState(initialValues?.author ?? '');
  const [whyHelpful, setWhyHelpful] = useState(initialValues?.whyHelpful ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState(initialValues?.coverImageUrl ?? '');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const charsLeft = 100 - whyHelpful.length;

  // Pre-selected category IDs for edit mode
  const preselectedIds = new Set(initialValues?.categories?.map((c) => c.id) ?? []);

  // Fires in real-time as user types/pastes, debounced 600ms so we don't
  // spam the Google Books API on every keystroke.
  const handlePurchaseUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value.trim();

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!url) return;

      debounceRef.current = setTimeout(async () => {
        const id = extractAsinOrIsbn(url);
        if (!id) return; // Not an Amazon URL — skip silently

        setIsLookingUp(true);
        const result = await lookupByIsbn(id);
        setIsLookingUp(false);

        if (result) {
          // Only populate fields that are currently empty
          if (!title && result.title) setTitle(result.title);
          if (!author && result.author) setAuthor(result.author);
          if (!coverImageUrl && result.coverImageUrl) setCoverImageUrl(result.coverImageUrl);
        }
      }, 600);
    },
    [title, author, coverImageUrl],
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      // Upload cover file to Vercel Blob if user picked one
      let finalCoverUrl = coverImageUrl;
      if (coverFile) {
        try {
          const blob = await upload(coverFile.name, coverFile, {
            access: 'public',
            handleUploadUrl: '/api/upload',
          });
          finalCoverUrl = blob.url;
        } catch {
          setError('Image upload failed. Please try again.');
          return;
        }
      }

      // Sync controlled inputs into formData
      formData.set('title', title);
      formData.set('author', author);
      formData.set('whyHelpful', whyHelpful);
      formData.set('coverImageUrl', finalCoverUrl ?? '');

      const result = await action(formData);
      if (!result.success) {
        setError(result.error ?? 'Something went wrong.');
      } else {
        router.push('/books');
        router.refresh();
      }
    });
  }

  const inputClass =
    'w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-400';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      {/* 1. Purchase URL — first field, triggers auto-fill */}
      <div>
        <label htmlFor="purchaseUrl" className="block text-sm font-medium text-stone-700 mb-1">
          Where to buy{' '}
          <span className="text-stone-400 font-normal">(optional — paste an Amazon link to auto-fill)</span>
        </label>
        <input
          id="purchaseUrl"
          name="purchaseUrl"
          type="url"
          defaultValue={initialValues?.purchaseUrl ?? ''}
          onChange={handlePurchaseUrlChange}
          className={inputClass}
          placeholder="https://www.amazon.com/..."
        />
        {isLookingUp && (
          <p className="text-xs text-stone-400 mt-1 animate-pulse">Looking up book details…</p>
        )}
      </div>

      {/* 2. Cover image */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Book cover{' '}
          <span className="text-stone-400 font-normal">(optional)</span>
        </label>

        {coverImageUrl ? (
          <div className="flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImageUrl}
              alt="Book cover preview"
              className="w-16 object-cover rounded border border-stone-200"
              style={{ height: '5.5rem' }}
            />
            <div className="flex flex-col gap-2 pt-1">
              <p className="text-xs text-stone-500">Cover image loaded</p>
              <button
                type="button"
                onClick={() => { setCoverImageUrl(''); setCoverFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="text-xs text-rose-600 hover:underline text-left"
              >
                Remove and upload a different image
              </button>
            </div>
          </div>
        ) : (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-stone-600 file:mr-3 file:rounded file:border-0 file:bg-rose-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-rose-700 hover:file:bg-rose-100 cursor-pointer"
          />
        )}

        {/* Hidden field so formData always carries the URL */}
        <input type="hidden" name="coverImageUrl" value={coverImageUrl} />
      </div>

      {/* 3. Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-stone-700 mb-1">
          Book title <span className="text-rose-600">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="e.g. The Story of a Soul"
        />
      </div>

      {/* 4. Author */}
      <div>
        <label htmlFor="author" className="block text-sm font-medium text-stone-700 mb-1">
          Author <span className="text-rose-600">*</span>
        </label>
        <input
          id="author"
          name="author"
          type="text"
          required
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className={inputClass}
          placeholder="e.g. St. Thérèse of Lisieux"
        />
      </div>

      {/* 5. Why helpful */}
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
          className={`${inputClass} resize-none`}
          placeholder="A sentence about how this book blessed you…"
        />
        <p className={`text-xs mt-1 text-right ${charsLeft < 10 ? 'text-rose-600' : 'text-stone-400'}`}>
          {charsLeft} characters remaining
        </p>
      </div>

      {/* 6. Categories */}
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
                defaultChecked={preselectedIds.has(cat.id)}
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
        {isPending ? `${submitLabel === 'Add book' ? 'Adding' : 'Saving'}…` : submitLabel}
      </button>
    </form>
  );
}
