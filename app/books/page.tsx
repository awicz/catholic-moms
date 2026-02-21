import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getBooks } from '@/lib/actions/books';
import CategorySection from '@/components/books/CategorySection';

export const metadata = { title: 'Books — Catholic Moms' };
export const dynamic = 'force-dynamic';

export default async function BooksPage() {
  const [session, booksByCategory] = await Promise.all([auth(), getBooks()]);
  const currentUserId = session?.user?.id ? Number(session.user.id) : null;
  const isAdmin = session?.user?.isAdmin === true;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-serif font-bold text-stone-800 mb-2">Book Resources</h1>
          <p className="text-stone-600 max-w-lg">
            Books recommended by our group, organized by topic. Each one comes with a personal note from the mom who added it.
          </p>
        </div>
        <Link
          href="/books/add"
          className="shrink-0 rounded-md bg-rose-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-800 transition-colors text-center"
        >
          + Add a Book
        </Link>
      </div>

      {/* Jump links if there are multiple categories */}
      {booksByCategory.length > 1 && (
        <nav className="flex flex-wrap gap-2 mb-10">
          {booksByCategory.map(({ category }) => (
            <a
              key={category.id}
              href={`#${category.slug}`}
              className="text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-full px-3 py-1 hover:bg-rose-100 transition-colors"
            >
              {category.name}
            </a>
          ))}
        </nav>
      )}

      {/* Book listing */}
      {booksByCategory.length === 0 ? (
        <div className="text-center py-24 text-stone-500">
          <p className="text-xl mb-4">No books yet.</p>
          <Link href="/books/add" className="text-rose-700 font-medium hover:underline">
            Be the first to add one!
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {booksByCategory.map((entry) => (
            <CategorySection key={entry.category.id} entry={entry} currentUserId={currentUserId} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </main>
  );
}
