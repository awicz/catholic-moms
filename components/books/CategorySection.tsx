import BookCard from '@/components/books/BookCard';
import type { BooksByCategory } from '@/types';

interface Props {
  entry: BooksByCategory;
}

export default function CategorySection({ entry }: Props) {
  return (
    <section id={entry.category.slug} className="scroll-mt-20">
      <h2 className="text-2xl font-serif font-bold text-stone-800 mb-4 pb-2 border-b border-stone-200">
        {entry.category.name}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {entry.books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}
