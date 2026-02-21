import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCategories, addBook } from '@/lib/actions/books';
import BookForm from '@/components/books/BookForm';
import Link from 'next/link';

export const metadata = { title: 'Add a Book — Catholic Moms' };
export const dynamic = 'force-dynamic';

export default async function AddBookPage() {
  const session = await auth();
  if (!session) redirect('/auth/signin');

  const categories = await getCategories();

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-6">
        <Link href="/books" className="text-sm text-rose-700 hover:underline">
          ← Back to books
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-stone-800 mb-2">Share a book</h1>
      <p className="text-stone-600 mb-8">
        Adding as <span className="font-medium">{session.user?.name}</span>
      </p>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-8">
        <BookForm categories={categories} action={addBook} submitLabel="Add book" />
      </div>
    </main>
  );
}
