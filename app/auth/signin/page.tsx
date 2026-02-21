import { Suspense } from 'react';
import SignInForm from '@/components/auth/SignInForm';

export const metadata = { title: 'Sign In — Catholic Moms' };

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Welcome back</h1>
          <p className="text-stone-600">
            Sign in to share a book with the group.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-8">
          <Suspense>
            <SignInForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
