'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteBook } from '@/lib/actions/books';

interface Props {
  bookId: number;
}

export default function DeleteBookButton({ bookId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteBook(bookId);
      if (result.success) {
        router.push('/books');
        router.refresh();
      } else {
        setError(result.error ?? 'Something went wrong.');
      }
    });
  }

  return (
    <div className="mt-10 pt-6 border-t border-stone-200">
      <h2 className="text-sm font-semibold text-stone-700 mb-3">Danger zone</h2>

      {error && (
        <p className="text-sm text-rose-700 mb-3">{error}</p>
      )}

      {!confirmed ? (
        <button
          type="button"
          onClick={() => setConfirmed(true)}
          className="text-sm text-stone-500 hover:text-rose-700 hover:underline"
        >
          Delete this book
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <span className="text-sm text-stone-700">Are you sure? This cannot be undone.</span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="text-sm font-semibold text-white bg-rose-700 px-4 py-1.5 rounded hover:bg-rose-800 disabled:opacity-60 transition-colors"
          >
            {isPending ? 'Deleting…' : 'Yes, delete'}
          </button>
          <button
            type="button"
            onClick={() => setConfirmed(false)}
            className="text-sm text-stone-500 hover:underline"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
