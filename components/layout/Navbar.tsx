'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-xl font-bold text-rose-800 hover:text-rose-900">
          Catholic Moms
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/books"
            className="text-sm font-medium text-stone-600 hover:text-stone-900"
          >
            Books
          </Link>

          {session ? (
            <>
              <Link
                href="/books/add"
                className="text-sm font-semibold bg-rose-700 text-white px-3 py-1.5 rounded-md hover:bg-rose-800 transition-colors"
              >
                Add a Book
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-stone-500 hover:text-stone-800"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-stone-600 hover:text-stone-900"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm font-semibold bg-rose-700 text-white px-3 py-1.5 rounded-md hover:bg-rose-800 transition-colors"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
