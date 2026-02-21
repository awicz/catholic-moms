'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setUserAdmin } from '@/lib/actions/admin';

interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

interface Props {
  users: User[];
  currentUserId: string;
}

export default function AdminUserList({ users, currentUserId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggleAdmin(userId: number, currentIsAdmin: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await setUserAdmin(userId, !currentIsAdmin);
      if (!result.success) {
        setError(result.error ?? 'Failed to update user.');
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div>
      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800 mb-4">
          {error}
        </div>
      )}

      <div className="border border-stone-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50">
            <tr className="text-left text-xs text-stone-500 border-b border-stone-200">
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Email</th>
              <th className="px-4 py-2.5 font-medium">Joined</th>
              <th className="px-4 py-2.5 font-medium">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 bg-white">
            {users.map((user) => {
              const isSelf = String(user.id) === currentUserId;
              return (
                <tr key={user.id}>
                  <td className="px-4 py-3 text-stone-800 font-medium">
                    {user.name}
                    {isSelf && <span className="ml-1.5 text-xs text-stone-400">(you)</span>}
                  </td>
                  <td className="px-4 py-3 text-stone-500">{user.email}</td>
                  <td className="px-4 py-3 text-stone-400 text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                      disabled={isPending || (isSelf && user.isAdmin)}
                      title={isSelf && user.isAdmin ? 'Cannot remove your own admin status' : undefined}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        user.isAdmin
                          ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {user.isAdmin ? 'Admin' : 'Member'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-stone-400 mt-2">Click a role badge to toggle admin status.</p>
    </div>
  );
}
