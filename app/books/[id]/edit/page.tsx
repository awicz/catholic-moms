import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getBookById, getCategories, updateBook } from '@/lib/actions/books';
import BookForm from '@/components/books/BookForm';
import DeleteBookButton from '@/components/books/DeleteBookButton';
import Link from 'next/link';

export const metadata = { title: 'Edit Book — Catholic Moms' };
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBookPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect('/auth/signin');

  const { id } = await params;
  const bookId = Number(id);
  if (isNaN(bookId)) notFound();

  const [book, categories] = await Promise.all([
    getBookById(bookId),
    getCategories(),
  ]);

  if (!book) notFound();

  const isOwner = book.addedById === Number(session.user.id);
  const isAdmin = session.user.isAdmin === true;
  if (!isOwner && !isAdmin) redirect('/books');

  // Bind the action to this specific bookId
  async function boundUpdateBook(formData: FormData) {
    'use server';
    return updateBook(bookId, formData);
  }

  // Map categoryIds back to Category objects for initialValues
  const selectedCategories = categories.filter((c) => book.categoryIds.includes(c.id));

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-6">
        <Link href="/books" className="text-sm text-rose-700 hover:underline">
          ← Back to books
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-stone-800 mb-8">Edit book</h1>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-8">
        <BookForm
          categories={categories}
          initialValues={{
            title: book.title,
            author: book.author,
            purchaseUrl: book.purchaseUrl,
            whyHelpful: book.whyHelpful,
            coverImageUrl: book.coverImageUrl,
            categories: selectedCategories,
          }}
          action={boundUpdateBook}
          submitLabel="Save changes"
        />
      </div>

      <DeleteBookButton bookId={bookId} />
    </main>
  );
}
