import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-b from-rose-50 to-[#fdf6ec] border-b border-rose-100 py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-rose-700 text-sm font-semibold uppercase tracking-widest mb-4">
            Our little corner of grace
          </p>
          <h1 className="text-5xl sm:text-6xl font-serif font-bold text-stone-800 leading-tight mb-6">
            Catholic Moms
          </h1>
          <p className="text-xl text-stone-600 mb-10 leading-relaxed">
            A place to share the books, resources, and wisdom that have blessed us on our journey of faith and motherhood.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/books"
              className="rounded-md bg-rose-700 px-6 py-3 font-semibold text-white hover:bg-rose-800 transition-colors"
            >
              Browse Books
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-md border border-rose-300 bg-white px-6 py-3 font-semibold text-rose-800 hover:bg-rose-50 transition-colors"
            >
              Join the Group
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="text-3xl font-serif font-bold text-stone-800 text-center mb-12">
          Share what has helped you
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-xl font-bold font-serif">
              1
            </div>
            <h3 className="font-serif font-semibold text-stone-800">Join the group</h3>
            <p className="text-stone-600 text-sm">
              Create a free account to become part of our community of Catholic moms.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-xl font-bold font-serif">
              2
            </div>
            <h3 className="font-serif font-semibold text-stone-800">Add a book</h3>
            <p className="text-stone-600 text-sm">
              Share a book that has blessed you, tag it by topic, and add a short note about why you loved it.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-xl font-bold font-serif">
              3
            </div>
            <h3 className="font-serif font-semibold text-stone-800">Discover &amp; grow</h3>
            <p className="text-stone-600 text-sm">
              Browse recommendations from other moms, filtered by the topics you care about most.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-rose-50 border-t border-rose-100 py-16 px-4 text-center">
        <h2 className="text-2xl font-serif font-bold text-stone-800 mb-4">
          Ready to explore?
        </h2>
        <Link
          href="/books"
          className="inline-block rounded-md bg-rose-700 px-6 py-3 font-semibold text-white hover:bg-rose-800 transition-colors"
        >
          Browse the Book List
        </Link>
      </section>
    </main>
  );
}
