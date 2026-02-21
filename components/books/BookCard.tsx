import Link from 'next/link';
import type { Book } from '@/types';

interface Props {
  book: Book;
  currentUserId: number | null;
  isAdmin: boolean;
}

export default function BookCard({ book, currentUserId, isAdmin }: Props) {
  const canEdit =
    (currentUserId !== null && book.addedById === currentUserId) || isAdmin;

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-5 flex flex-col gap-3 hover:border-rose-300 hover:shadow-sm transition-all">
      {/* Cover + title/author */}
      <div className="flex gap-3">
        {book.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.coverImageUrl}
            alt={`Cover of ${book.title}`}
            className="w-12 object-cover rounded shrink-0 border border-stone-100"
            style={{ height: '4.5rem' }}
          />
        )}
        <div>
          <h3 className="font-serif font-semibold text-stone-900 text-lg leading-snug">
            {book.title}
          </h3>
          <p className="text-stone-500 text-sm mt-0.5">by {book.author}</p>
        </div>
      </div>

      {book.whyHelpful && (
        <p className="text-stone-700 text-sm italic border-l-2 border-rose-300 pl-3">
          &ldquo;{book.whyHelpful}&rdquo;
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-stone-100">
        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-400">Added by {book.addedByName}</span>
          {canEdit && (
            <Link
              href={`/books/${book.id}/edit`}
              className="text-xs font-medium text-rose-600 hover:underline"
            >
              Edit
            </Link>
          )}
        </div>

        {book.purchaseUrl && (
          <a
            href={book.purchaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-rose-700 hover:text-rose-900 hover:underline"
          >
            Where to buy →
          </a>
        )}
      </div>
    </div>
  );
}
