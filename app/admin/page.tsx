import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCategories } from '@/lib/actions/books';
import { getUsers } from '@/lib/actions/admin';
import AdminCategoryList from '@/components/admin/AdminCategoryList';
import AdminUserList from '@/components/admin/AdminUserList';

export const metadata = { title: 'Admin — Catholic Moms' };
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await auth();
  if (!session || !session.user.isAdmin) redirect('/');

  const [categories, users] = await Promise.all([getCategories(), getUsers()]);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-serif font-bold text-stone-800 mb-1">Admin Dashboard</h1>
        <p className="text-stone-500 text-sm">Signed in as {session.user.name}</p>
      </div>

      {/* Categories */}
      <section className="mb-14">
        <h2 className="text-xl font-serif font-semibold text-stone-800 mb-1">Categories</h2>
        <p className="text-stone-500 text-sm mb-5">
          Add, rename, or delete book categories. Categories with books cannot be deleted until those books are re-tagged.
        </p>
        <AdminCategoryList categories={categories} />
      </section>

      {/* Users */}
      <section>
        <h2 className="text-xl font-serif font-semibold text-stone-800 mb-1">Members</h2>
        <p className="text-stone-500 text-sm mb-5">
          Toggle admin access for group members. Admins can manage categories and edit any book.
        </p>
        <AdminUserList users={users} currentUserId={session.user.id} />
      </section>
    </main>
  );
}
