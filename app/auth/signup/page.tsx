import SignUpForm from '@/components/auth/SignUpForm';

export const metadata = { title: 'Join the Group — Catholic Moms' };

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Join our group</h1>
          <p className="text-stone-600">
            Create an account to share book recommendations with the group.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-8">
          <SignUpForm />
        </div>
      </div>
    </main>
  );
}
