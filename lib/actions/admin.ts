'use server';

import { auth } from '@/lib/auth';
import sql from '@/lib/db';
import { z } from 'zod';

/** Verifies the caller is an admin. Throws if not. */
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error('Unauthorized');
  }
  return session;
}

// ─── Category actions ────────────────────────────────────────────────────────

export async function addCategory(formData: FormData) {
  await requireAdmin();

  const name = (formData.get('name') as string)?.trim();
  const slugInput = (formData.get('slug') as string)?.trim();
  // Auto-generate slug from name if not provided
  const slug = slugInput || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const schema = z.object({
    name: z.string().min(1, 'Category name is required').max(100),
    slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must use lowercase letters, numbers, and hyphens only'),
  });

  const parsed = schema.safeParse({ name, slug });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await sql`
      INSERT INTO categories (name, slug)
      VALUES (${parsed.data.name}, ${parsed.data.slug})
    `;
    return { success: true };
  } catch {
    return { success: false, error: 'A category with that name or slug already exists.' };
  }
}

export async function updateCategory(id: number, formData: FormData) {
  await requireAdmin();

  const name = (formData.get('name') as string)?.trim();
  const slug = (formData.get('slug') as string)?.trim();

  if (!name || !slug) {
    return { success: false, error: 'Name and slug are required.' };
  }

  try {
    await sql`
      UPDATE categories SET name = ${name}, slug = ${slug} WHERE id = ${id}
    `;
    return { success: true };
  } catch {
    return { success: false, error: 'That name or slug is already in use.' };
  }
}

export async function deleteCategory(id: number) {
  await requireAdmin();

  const usage = await sql`
    SELECT COUNT(*) AS count FROM book_categories WHERE category_id = ${id}
  `;
  const count = Number(usage[0].count);
  if (count > 0) {
    return {
      success: false,
      error: `Cannot delete: ${count} book${count !== 1 ? 's' : ''} use this category. Re-tag those books first.`,
    };
  }

  await sql`DELETE FROM categories WHERE id = ${id}`;
  return { success: true };
}

// ─── User actions ─────────────────────────────────────────────────────────────

export async function getUsers() {
  await requireAdmin();
  const rows = await sql`
    SELECT id, name, email, is_admin, created_at
    FROM users
    ORDER BY created_at ASC
  `;
  return rows.map((r) => ({
    id: r.id as number,
    name: r.name as string,
    email: r.email as string,
    isAdmin: r.is_admin as boolean,
    createdAt: String(r.created_at),
  }));
}

export async function setUserAdmin(userId: number, isAdmin: boolean) {
  const session = await requireAdmin();

  // Prevent admins from removing their own admin status
  if (String(userId) === session.user.id && !isAdmin) {
    return { success: false, error: 'You cannot remove your own admin status.' };
  }

  await sql`UPDATE users SET is_admin = ${isAdmin} WHERE id = ${userId}`;
  return { success: true };
}
